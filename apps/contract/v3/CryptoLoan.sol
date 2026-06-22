// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CryptoLoanSettlement v3
 *
 * Simplified wallet roles:
 *  - admin          : disburses loans, receives origination fees (implicitly) and principal repayments
 *  - interestWallet : receives periodic interest / EMI collection payments
 *
 * Multi-token: every call accepts a token address, no single immutable token.
 * The owner whitelist controls which tokens are accepted.
 * addToken accepts multiple token addresses in a single call.
 */

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status != _ENTERED, "Reentrant");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract CryptoLoanSettlement is ReentrancyGuard {

    // =========================================================================
    // STATE
    // =========================================================================

    address public owner;
    address public pendingOwner;
    address public admin;           // cron EOA: disburses loans, keeps fees, receives repayments

    address public interestWallet;  // receives periodic interest collections

    bool public paused;

    mapping(address => bool) public isAcceptedToken;
    address[] private tokenList;

    // =========================================================================
    // EVENTS
    // =========================================================================

    event LoanIssued(
        bytes32 indexed loanId,
        address indexed user,
        address indexed token,
        uint256 principal,
        uint256 fee,
        uint256 netAmount,
        uint256 timestamp
    );

    event PaymentCollected(
        bytes32 indexed loanId,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    // Emitted when a user's balance/allowance is 0 — no funds could be collected
    event PaymentSkipped(
        bytes32 indexed loanId,
        address indexed user,
        address indexed token,
        uint256 timestamp
    );

    event PrincipalRepaid(
        bytes32 indexed loanId,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event LoanClosed(
        bytes32 indexed loanId,
        address indexed user,
        uint8 reason,   // 0=repaid, 1=defaulted, 2=admin_closed
        uint256 timestamp
    );

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    event InterestWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event OwnershipTransferInitiated(address indexed currentOwner, address indexed pendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event PauseStateChanged(bool paused);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);
    event Withdrawn(address indexed token, address indexed to, uint256 amount, address indexed caller);

    // =========================================================================
    // MODIFIERS
    // =========================================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin || msg.sender == owner, "Not admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier onlyAcceptedToken(address token) {
        require(isAcceptedToken[token], "Token not accepted");
        _;
    }

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * @param _admin          Admin/cron EOA — disburses loans and receives repayments.
     * @param _interestWallet Wallet that receives periodic interest payments.
     * @param _tokens         Initial list of accepted ERC-20 token addresses (can be empty).
     */
    constructor(
        address _admin,
        address _interestWallet,
        address[] memory _tokens
    ) {
        require(_admin != address(0),          "Zero admin");
        require(_interestWallet != address(0), "Zero interest wallet");

        owner          = msg.sender;
        admin          = _admin;
        interestWallet = _interestWallet;

        // Register initial accepted tokens
        for (uint256 i = 0; i < _tokens.length; i++) {
            address t = _tokens[i];
            require(t != address(0), "Zero token in list");
            if (!isAcceptedToken[t]) {
                isAcceptedToken[t] = true;
                tokenList.push(t);
                emit TokenAdded(t);
            }
        }
    }

    // =========================================================================
    // LOAN DISBURSEMENT  (admin)
    // =========================================================================

    /**
     * @notice Issue a loan to a user.
     * @param loanId    Off-chain DB loan identifier (bytes32).
     * @param user      Recipient wallet.
     * @param token     ERC-20 token address (must be accepted).
     * @param principal Full principal amount (before fee deduction).
     * @param fee       Origination fee — stays with admin (deducted from principal).
     *
     * Flow:
     *   admin → user   (principal - fee)
     *   fee remains in admin wallet implicitly (no separate transfer needed)
     *
     * Pre-condition: admin must have approved this contract for >= (principal - fee).
     */
    function issueLoan(
        bytes32 loanId,
        address user,
        address token,
        uint256 principal,
        uint256 fee
    )
        external
        onlyAdmin
        whenNotPaused
        nonReentrant
        onlyAcceptedToken(token)
    {
        require(user != address(0), "Zero user");
        require(principal > 0,      "Zero principal");
        require(fee <= principal,   "Fee > principal");

        uint256 netAmount = principal - fee;

        require(
            IERC20(token).allowance(admin, address(this)) >= netAmount,
            "Admin allowance low"
        );
        require(
            IERC20(token).balanceOf(admin) >= netAmount,
            "Admin balance low"
        );

        require(
            IERC20(token).transferFrom(admin, user, netAmount),
            "Loan transfer failed"
        );

        emit LoanIssued(loanId, user, token, principal, fee, netAmount, block.timestamp);
    }

    // =========================================================================
    // INTEREST COLLECTION  (admin / cron)
    // =========================================================================

    /**
     * @notice Collect an interest payment from a user's wallet.
     *         Supports partial collection — if the user's balance or allowance
     *         is less than the requested amount, the function collects whatever
     *         is available rather than reverting. Emits PaymentSkipped if nothing
     *         can be collected.
     *
     * @param loanId  Off-chain DB loan identifier.
     * @param user    Borrower's wallet address.
     * @param token   ERC-20 token address.
     * @param amount  Requested interest amount to collect.
     *
     * Flow:
     *   user → interestWallet   (up to `amount`, capped by balance and allowance)
     */
    function collectPayment(
        bytes32 loanId,
        address user,
        address token,
        uint256 amount
    )
        external
        onlyAdmin
        whenNotPaused
        nonReentrant
        onlyAcceptedToken(token)
    {
        require(user != address(0), "Zero user");
        require(amount > 0,         "Zero amount");

        uint256 userBal   = IERC20(token).balanceOf(user);
        uint256 userAllow = IERC20(token).allowance(user, address(this));

        // Determine the actual collectable amount (min of requested, balance, allowance)
        uint256 actualAmount = amount;
        if (userBal   < actualAmount) { actualAmount = userBal; }
        if (userAllow < actualAmount) { actualAmount = userAllow; }

        if (actualAmount == 0) {
            // Nothing to collect — emit a skipped event so the backend can
            // record the missed payment without treating it as a success.
            emit PaymentSkipped(loanId, user, token, block.timestamp);
            return;
        }

        require(
            IERC20(token).transferFrom(user, interestWallet, actualAmount),
            "Collection failed"
        );

        emit PaymentCollected(loanId, user, token, actualAmount, block.timestamp);
    }

    // =========================================================================
    // PRINCIPAL REPAYMENT  (user)
    // =========================================================================

    /**
     * @notice User repays principal (full or partial) back to admin wallet.
     * @param loanId  Off-chain DB loan identifier.
     * @param token   ERC-20 token address.
     * @param amount  Amount to repay.
     *
     * Flow:
     *   user → admin   (principal repayment)
     */
    function repayPrincipal(
        bytes32 loanId,
        address token,
        uint256 amount
    )
        external
        whenNotPaused
        nonReentrant
        onlyAcceptedToken(token)
    {
        require(amount > 0, "Zero amount");

        require(
            IERC20(token).allowance(msg.sender, address(this)) >= amount,
            "Allowance low"
        );
        require(
            IERC20(token).balanceOf(msg.sender) >= amount,
            "Balance low"
        );

        require(
            IERC20(token).transferFrom(msg.sender, admin, amount),
            "Repayment failed"
        );

        emit PrincipalRepaid(loanId, msg.sender, token, amount, block.timestamp);
    }

    // =========================================================================
    // LOAN STATUS  (admin)
    // =========================================================================

    /**
     * @notice Emit a LoanClosed event (no fund movement — purely a status signal).
     * @param reason  0 = repaid, 1 = defaulted, 2 = admin_closed
     */
    function closeLoan(bytes32 loanId, address user, uint8 reason)
        external
        onlyAdmin
    {
        emit LoanClosed(loanId, user, reason, block.timestamp);
    }

    // =========================================================================
    // TOKEN MANAGEMENT  (owner)
    // =========================================================================

    /**
     * @notice Add one or more accepted ERC-20 tokens in a single transaction.
     * @param tokens Array of token addresses to whitelist.
     */
    function addTokens(address[] calldata tokens) external onlyOwner {
        require(tokens.length > 0, "Empty token list");
        for (uint256 i = 0; i < tokens.length; i++) {
            address t = tokens[i];
            require(t != address(0), "Zero token");
            if (!isAcceptedToken[t]) {
                isAcceptedToken[t] = true;
                tokenList.push(t);
                emit TokenAdded(t);
            }
            // silently skip duplicates instead of reverting
        }
    }

    function removeToken(address token) external onlyOwner {
        require(isAcceptedToken[token], "Not accepted");
        isAcceptedToken[token] = false;
        uint256 length = tokenList.length;
        for (uint256 i = 0; i < length; i++) {
            if (tokenList[i] == token) {
                tokenList[i] = tokenList[length - 1];
                tokenList.pop();
                break;
            }
        }
        emit TokenRemoved(token);
    }

    // =========================================================================
    // WALLET MANAGEMENT  (owner)
    // =========================================================================

    function updateInterestWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Zero wallet");
        emit InterestWalletUpdated(interestWallet, newWallet);
        interestWallet = newWallet;
    }

    function setAdmin(address newAdmin) external onlyOwner {
        require(newAdmin != address(0), "Zero admin");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    // =========================================================================
    // OWNERSHIP  (2-step)
    // =========================================================================

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero owner");
        pendingOwner = newOwner;
        emit OwnershipTransferInitiated(owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        emit OwnershipTransferred(owner, pendingOwner);
        owner        = pendingOwner;
        pendingOwner = address(0);
    }

    // =========================================================================
    // PAUSE  (owner)
    // =========================================================================

    function pause()   external onlyOwner { paused = true;  emit PauseStateChanged(true);  }
    function unpause() external onlyOwner { paused = false; emit PauseStateChanged(false); }

    // =========================================================================
    // EMERGENCY WITHDRAW  (owner, only when paused)
    // =========================================================================

    function emergencyWithdraw(address token) external onlyOwner {
        require(paused, "Not paused");
        uint256 bal = IERC20(token).balanceOf(address(this));
        require(bal > 0, "No balance");
        require(IERC20(token).transfer(owner, bal), "Transfer failed");
        emit EmergencyWithdraw(token, owner, bal);
    }

    // =========================================================================
    // WITHDRAWAL  (admin)
    // =========================================================================

    /**
     * @notice Allows the admin (or owner) to withdraw a specific amount of tokens from the contract at any time.
     * @param token  ERC-20 token address to withdraw.
     * @param amount Amount to withdraw.
     * @param to     Destination wallet address.
     */
    function withdraw(address token, uint256 amount, address to) external onlyAdmin {
        require(to != address(0), "Zero address");
        require(amount > 0, "Zero amount");
        
        uint256 bal = IERC20(token).balanceOf(address(this));
        require(bal >= amount, "Insufficient balance");
        
        require(IERC20(token).transfer(to, amount), "Transfer failed");
        emit Withdrawn(token, to, amount, msg.sender);
    }

    // =========================================================================
    // VIEWS
    // =========================================================================

    function getAcceptedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    function getConfig() external view returns (
        address owner_,
        address admin_,
        address interestWallet_,
        bool    paused_
    ) {
        return (owner, admin, interestWallet, paused);
    }
}
