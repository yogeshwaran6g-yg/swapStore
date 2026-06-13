// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address to, uint256 amount)
        external
        returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
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

    IERC20 public immutable token;

    address public owner;
    address public adminWallet;
    address public loanWallet;
    address public feeWallet;

    bool public paused;

    // =====================================================
    // EVENTS
    // =====================================================

    event LoanIssued(
        bytes32 indexed loanId,
        address indexed user,
        uint256 principal,
        uint256 fee,
        uint256 netAmount,
        uint256 timestamp
    );

    event PaymentCollected(
        bytes32 indexed loanId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event PrincipalRepaid(
        bytes32 indexed loanId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event LoanClosed(
        bytes32 indexed loanId,
        address indexed user,
        uint8 reason,
        uint256 timestamp
    );

    event AdminWalletUpdated(
        address indexed oldWallet,
        address indexed newWallet
    );

    event LoanWalletUpdated(
        address indexed oldWallet,
        address indexed newWallet
    );

    event FeeWalletUpdated(
        address indexed oldWallet,
        address indexed newWallet
    );

    event OwnershipTransferred(
        address indexed oldOwner,
        address indexed newOwner
    );

    event PauseStateChanged(bool paused);

    event EmergencyWithdraw(
        address indexed to,
        uint256 amount
    );

    // =====================================================
    // MODIFIERS
    // =====================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(
            msg.sender == adminWallet ||
            msg.sender == owner,
            "Not admin"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    constructor(
        address _token,
        address _adminWallet,
        address _loanWallet,
        address _feeWallet
    ) {
        require(_token != address(0), "Zero token");
        require(_adminWallet != address(0), "Zero admin");
        require(_loanWallet != address(0), "Zero loan wallet");
        require(_feeWallet != address(0), "Zero fee wallet");

        token = IERC20(_token);

        owner = msg.sender;
        adminWallet = _adminWallet;
        loanWallet = _loanWallet;
        feeWallet = _feeWallet;
    }

    // =====================================================
    // LOAN DISBURSEMENT
    // =====================================================

    function issueLoan(
        bytes32 loanId,
        address user,
        uint256 principal,
        uint256 fee
    )
        external
        onlyAdmin
        whenNotPaused
        nonReentrant
    {
        require(user != address(0), "Zero user");
        require(principal > 0, "Zero principal");
        require(fee <= principal, "Invalid fee");

        uint256 netAmount = principal - fee;

        require(
            token.allowance(
                loanWallet,
                address(this)
            ) >= principal,
            "Loan allowance low"
        );

        require(
            token.balanceOf(
                loanWallet
            ) >= principal,
            "Loan balance low"
        );

        if (fee > 0) {
            require(
                token.transferFrom(
                    loanWallet,
                    feeWallet,
                    fee
                ),
                "Fee transfer failed"
            );
        }

        require(
            token.transferFrom(
                loanWallet,
                user,
                netAmount
            ),
            "Loan transfer failed"
        );

        emit LoanIssued(
            loanId,
            user,
            principal,
            fee,
            netAmount,
            block.timestamp
        );
    }

    // =====================================================
    // INTEREST / EMI COLLECTION
    // =====================================================

    function collectPayment(
        bytes32 loanId,
        address user,
        uint256 amount
    )
        external
        onlyAdmin
        whenNotPaused
        nonReentrant
    {
        require(user != address(0), "Zero user");
        require(amount > 0, "Zero amount");

        require(
            token.allowance(
                user,
                address(this)
            ) >= amount,
            "User allowance low"
        );

        require(
            token.balanceOf(user) >= amount,
            "User balance low"
        );

        require(
            token.transferFrom(
                user,
                feeWallet,
                amount
            ),
            "Payment failed"
        );

        emit PaymentCollected(
            loanId,
            user,
            amount,
            block.timestamp
        );
    }

    // =====================================================
    // PRINCIPAL REPAYMENT
    // =====================================================

    function repayPrincipal(
        bytes32 loanId,
        uint256 amount
    )
        external
        whenNotPaused
        nonReentrant
    {
        require(amount > 0, "Zero amount");

        require(
            token.allowance(
                msg.sender,
                address(this)
            ) >= amount,
            "Allowance low"
        );

        require(
            token.balanceOf(
                msg.sender
            ) >= amount,
            "Balance low"
        );

        require(
            token.transferFrom(
                msg.sender,
                loanWallet,
                amount
            ),
            "Repayment failed"
        );

        emit PrincipalRepaid(
            loanId,
            msg.sender,
            amount,
            block.timestamp
        );
    }

    // =====================================================
    // LOAN STATUS EVENT
    // =====================================================

    function closeLoan(
        bytes32 loanId,
        address user,
        uint8 reason
    )
        external
        onlyAdmin
    {
        emit LoanClosed(
            loanId,
            user,
            reason,
            block.timestamp
        );
    }

    // =====================================================
    // ADMIN
    // =====================================================

    function transferOwnership(
        address newOwner
    )
        external
        onlyOwner
    {
        require(
            newOwner != address(0),
            "Zero owner"
        );

        emit OwnershipTransferred(
            owner,
            newOwner
        );

        owner = newOwner;
    }

    function updateAdminWallet(
        address newWallet
    )
        external
        onlyOwner
    {
        require(
            newWallet != address(0),
            "Zero wallet"
        );

        emit AdminWalletUpdated(
            adminWallet,
            newWallet
        );

        adminWallet = newWallet;
    }

    function updateLoanWallet(
        address newWallet
    )
        external
        onlyOwner
    {
        require(
            newWallet != address(0),
            "Zero wallet"
        );

        emit LoanWalletUpdated(
            loanWallet,
            newWallet
        );

        loanWallet = newWallet;
    }

    function updateFeeWallet(
        address newWallet
    )
        external
        onlyOwner
    {
        require(
            newWallet != address(0),
            "Zero wallet"
        );

        emit FeeWalletUpdated(
            feeWallet,
            newWallet
        );

        feeWallet = newWallet;
    }

    function pause()
        external
        onlyOwner
    {
        paused = true;
        emit PauseStateChanged(true);
    }

    function unpause()
        external
        onlyOwner
    {
        paused = false;
        emit PauseStateChanged(false);
    }

    function emergencyWithdraw()
        external
        onlyOwner
    {
        require(paused, "Not paused");

        uint256 bal =
            token.balanceOf(address(this));

        require(
            bal > 0,
            "No balance"
        );

        require(
            token.transfer(owner, bal),
            "Transfer failed"
        );

        emit EmergencyWithdraw(
            owner,
            bal
        );
    }
}