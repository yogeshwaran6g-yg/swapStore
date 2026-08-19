// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract INRSwapGateway {

    // =========================================================================
    // ERRORS
    // =========================================================================

    error NotOwner();
    error InvalidAddress();
    error TokenNotAccepted();
    error InvalidAmount();
    error DuplicateOrder();
    error ContractPaused();
    error TransferFailed();
    error AlreadyAccepted();
    error NotAccepted();
    error NotPendingOwner();

    // =========================================================================
    // STATE
    // =========================================================================

    address public owner;
    address public admin;
    address public pendingOwner;

    bool public paused;

    mapping(address => bool) public isAcceptedToken;
    mapping(bytes32 => bool) public processedOrders;

    address[] private tokenList;

    // =========================================================================
    // EVENTS
    // =========================================================================

    event SwapRequested(
        bytes32 indexed orderId,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event TokenAdded(address indexed token);

    event TokenRemoved(address indexed token);

    event AdminChanged(
        address indexed oldAdmin,
        address indexed newAdmin
    );

    event PauseStatusChanged(bool paused);

    event OwnershipTransferInitiated(
        address indexed currentOwner,
        address indexed pendingOwner
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // =========================================================================
    // MODIFIERS
    // =========================================================================

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor(address _admin) {
        if (_admin == address(0)) revert InvalidAddress();

        owner = msg.sender;
        admin = _admin;

        emit AdminChanged(address(0), _admin);
    }

    // =========================================================================
    // USER FLOW
    // =========================================================================

    /**
     * User:
     * approve(MAX) once
     *
     * Then:
     * swap(orderId, token, amount)
     *
     * Tokens move:
     * user -> admin wallet
     */
    function swap(
        bytes32 orderId,
        address token,
        uint256 amount
    )
        external
        whenNotPaused
    {
        if (!isAcceptedToken[token]) revert TokenNotAccepted();
        if (amount == 0) revert InvalidAmount();

        if (processedOrders[orderId]) {
            revert DuplicateOrder();
        }

        processedOrders[orderId] = true;

        bool success = IERC20(token).transferFrom(
            msg.sender,
            admin,
            amount
        );

        if (!success) revert TransferFailed();

        emit SwapRequested(
            orderId,
            msg.sender,
            token,
            amount,
            block.timestamp
        );
    }

    // =========================================================================
    // TOKEN MANAGEMENT
    // =========================================================================

    function addToken(address token)
        external
        onlyOwner
    {
        if (token == address(0)) revert InvalidAddress();
        if (isAcceptedToken[token]) revert AlreadyAccepted();

        isAcceptedToken[token] = true;
        tokenList.push(token);

        emit TokenAdded(token);
    }

    function removeToken(address token)
        external
        onlyOwner
    {
        if (!isAcceptedToken[token]) revert NotAccepted();

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
    // ADMIN MANAGEMENT
    // =========================================================================

    function setAdmin(address newAdmin)
        external
        onlyOwner
    {
        if (newAdmin == address(0)) revert InvalidAddress();

        emit AdminChanged(admin, newAdmin);

        admin = newAdmin;
    }

    // =========================================================================
    // PAUSE MANAGEMENT
    // =========================================================================

    function setPaused(bool value)
        external
        onlyOwner
    {
        paused = value;

        emit PauseStatusChanged(value);
    }

    // =========================================================================
    // OWNERSHIP MANAGEMENT
    // =========================================================================

    function transferOwnership(address newOwner)
        external
        onlyOwner
    {
        if (newOwner == address(0)) revert InvalidAddress();

        pendingOwner = newOwner;

        emit OwnershipTransferInitiated(
            owner,
            newOwner
        );
    }

    function acceptOwnership()
        external
    {
        if (msg.sender != pendingOwner) {
            revert NotPendingOwner();
        }

        emit OwnershipTransferred(
            owner,
            pendingOwner
        );

        owner = pendingOwner;
        pendingOwner = address(0);
    }

    // =========================================================================
    // VIEWS
    // =========================================================================

    function getAcceptedTokens()
        external
        view
        returns (address[] memory)
    {
        return tokenList;
    }

    function getConfig()
        external
        view
        returns (
            address owner_,
            address admin_,
            address pendingOwner_,
            bool paused_,
            uint256 tokenCount_
        )
    {
        return (
            owner,
            admin,
            pendingOwner,
            paused,
            tokenList.length
        );
    }
}