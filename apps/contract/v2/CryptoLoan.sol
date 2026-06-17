// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CryptoLoanSettlement v2
 *
 * Wallet roles:
 *  - loanWallet     : holds funds for disbursement; also receives principal repayments
 *  - interestWallet : receives periodic interest / EMI collection payments
 *  - feeWallet      : receives the one-time disbursement fee when a loan is issued
 *
 * Multi-token: every call accepts a token address, no single immutable token.
 * The admin whitelist controls which tokens are accepted.
 */

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
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
    address public admin;           // collector/cron EOA

    address public loanWallet;      // disburses + receives repayments
    address public interestWallet;  // receives interest collections
    address public feeWallet;       // receives one-time disbursement fee

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
    event LoanWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event InterestWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event FeeWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event OwnershipTransferInitiated(address indexed currentOwner, address indexed pendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event PauseStateChanged(bool paused);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);

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

    constructor(
        address _admin,
        address _loanWallet,
        address _interestWallet,
        address _feeWallet
    ) {
        require(_admin != address(0),         "Zero admin");
        require(_loanWallet != address(0),    "Zero loan wallet");
        require(_interestWallet != address(0),"Zero interest wallet");
        require(_feeWallet != address(0),     "Zero fee wallet");

        owner          = msg.sender;
        admin          = _admin;
        loanWallet     = _loanWallet;
        interestWallet = _interestWallet;
        feeWallet      = _feeWallet;
    }

    // =========================================================================
    // LOAN DISBURSEMENT  (admin)
    // =========================================================================

    /**
     * @notice Issue a loan to a user.
     * @param loanId   Off-chain DB loan identifier (bytes32).
     * @param user     Recipient wallet.
     * @param token    ERC-20 token address (must be accepted).
     * @param principal Full principal amount (before fee deduction).
     * @param fee      One-time origination fee sent to feeWallet.
     *
     * Flow:
     *   loanWallet → feeWallet       (fee)
     *   loanWallet → user            (principal - fee)
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
            IERC20(token).allowance(loanWallet, address(this)) >= principal,
            "Loan allowance low"
        );
        require(
            IERC20(token).balanceOf(loanWallet) >= principal,
            "Loan balance low"
        );

        if (fee > 0) {
            require(
                IERC20(token).transferFrom(loanWallet, feeWallet, fee),
                "Fee transfer failed"
            );
        }

        require(
            IERC20(token).transferFrom(loanWallet, user, netAmount),
            "Loan transfer failed"
        );

        emit LoanIssued(loanId, user, token, principal, fee, netAmount, block.timestamp);
    }

    // =========================================================================
    // INTEREST COLLECTION  (admin / cron)
    // =========================================================================

    /**
     * @notice Collect an interest payment from a user's wallet.
     * @param loanId  Off-chain DB loan identifier.
     * @param user    Borrower's wallet address.
     * @param token   ERC-20 token address.
     * @param amount  Interest amount to collect.
     *
     * Flow:
     *   user → interestWallet   (interest)
     *
     * Pre-condition: user must have approved this contract for >= amount.
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

        require(
            IERC20(token).allowance(user, address(this)) >= amount,
            "User allowance low"
        );
        require(
            IERC20(token).balanceOf(user) >= amount,
            "User balance low"
        );

        require(
            IERC20(token).transferFrom(user, interestWallet, amount),
            "Collection failed"
        );

        emit PaymentCollected(loanId, user, token, amount, block.timestamp);
    }

    // =========================================================================
    // PRINCIPAL REPAYMENT  (user)
    // =========================================================================

    /**
     * @notice User repays principal (full or partial) back to loanWallet.
     * @param loanId  Off-chain DB loan identifier.
     * @param token   ERC-20 token address.
     * @param amount  Amount to repay.
     *
     * Flow:
     *   user → loanWallet   (principal repayment)
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
            IERC20(token).transferFrom(msg.sender, loanWallet, amount),
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

    function addToken(address token) external onlyOwner {
        require(token != address(0), "Zero token");
        require(!isAcceptedToken[token], "Already accepted");
        isAcceptedToken[token] = true;
        tokenList.push(token);
        emit TokenAdded(token);
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

    function updateLoanWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Zero wallet");
        emit LoanWalletUpdated(loanWallet, newWallet);
        loanWallet = newWallet;
    }

    function updateInterestWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Zero wallet");
        emit InterestWalletUpdated(interestWallet, newWallet);
        interestWallet = newWallet;
    }

    function updateFeeWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Zero wallet");
        emit FeeWalletUpdated(feeWallet, newWallet);
        feeWallet = newWallet;
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
    // VIEWS
    // =========================================================================

    function getAcceptedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    function getConfig() external view returns (
        address owner_,
        address admin_,
        address loanWallet_,
        address interestWallet_,
        address feeWallet_,
        bool    paused_
    ) {
        return (owner, admin, loanWallet, interestWallet, feeWallet, paused);
    }
}
