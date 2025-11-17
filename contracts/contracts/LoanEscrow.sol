// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyToken.sol";

/**
 * @title LoanEscrow
 * @dev Escrow contract for locking property tokens as collateral during loans
 * This contract holds property NFTs in escrow until loans are completed or defaulted
 */
contract LoanEscrow is Ownable {
    // Reference to PropertyToken contract
    PropertyToken public propertyToken;
    
    // Reference to LoanContract (authorized to lock tokens)
    address public loanContract;

    // Mapping from loan ID to escrow data
    mapping(uint256 => EscrowData) public escrows;

    // Escrow data structure
    struct EscrowData {
        uint256 loanId;
        uint256 propertyTokenId;
        address borrower;
        address lender; // Will be set when loan is funded (or distributed to investors)
        bool isLocked;
        uint256 lockedAt;
        uint256 releasedAt;
    }

    // Events
    event PropertyTokenLocked(
        uint256 indexed loanId,
        uint256 indexed propertyTokenId,
        address indexed borrower
    );

    event PropertyTokenReleased(
        uint256 indexed loanId,
        uint256 indexed propertyTokenId,
        address indexed recipient
    );

    event PropertyTokenLiquidated(
        uint256 indexed loanId,
        uint256 indexed propertyTokenId,
        address indexed recipient
    );

    constructor(address initialOwner, address _propertyToken) Ownable(initialOwner) {
        require(_propertyToken != address(0), "LoanEscrow: invalid property token address");
        propertyToken = PropertyToken(_propertyToken);
    }

    /**
     * @dev Lock a property token as collateral for a loan
     * @param loanId The loan ID
     * @param propertyTokenId The property token ID to lock
     * @param borrower The borrower's address
     */
    function lockPropertyToken(
        uint256 loanId,
        uint256 propertyTokenId,
        address borrower
    ) external {
        require(msg.sender == loanContract || msg.sender == owner(), "LoanEscrow: unauthorized");
        require(borrower != address(0), "LoanEscrow: invalid borrower address");
        require(propertyToken.ownerOf(propertyTokenId) == borrower, "LoanEscrow: borrower must own the property");
        require(!escrows[loanId].isLocked, "LoanEscrow: property already locked for this loan");
        require(propertyToken.isPropertyActive(propertyTokenId), "LoanEscrow: property must be active");

        // Transfer property token from borrower to escrow
        propertyToken.transferFrom(borrower, address(this), propertyTokenId);

        // Store escrow data
        escrows[loanId] = EscrowData({
            loanId: loanId,
            propertyTokenId: propertyTokenId,
            borrower: borrower,
            lender: address(0), // Will be set when loan is funded
            isLocked: true,
            lockedAt: block.timestamp,
            releasedAt: 0
        });

        emit PropertyTokenLocked(loanId, propertyTokenId, borrower);
    }

    /**
     * @dev Release property token back to borrower (loan completed successfully)
     * @param loanId The loan ID
     */
    function releasePropertyToken(uint256 loanId) external onlyOwner {
        EscrowData storage escrow = escrows[loanId];
        require(escrow.isLocked, "LoanEscrow: property not locked");
        require(escrow.releasedAt == 0, "LoanEscrow: property already released");

        uint256 propertyTokenId = escrow.propertyTokenId;
        address borrower = escrow.borrower;

        // Transfer property token back to borrower
        propertyToken.transferFrom(address(this), borrower, propertyTokenId);

        // Update escrow data
        escrow.isLocked = false;
        escrow.releasedAt = block.timestamp;

        emit PropertyTokenReleased(loanId, propertyTokenId, borrower);
    }

    /**
     * @dev Liquidate property token (loan defaulted)
     * @param loanId The loan ID
     * @param recipient The address to receive the liquidated property (usually lenders/investors)
     */
    function liquidatePropertyToken(uint256 loanId, address recipient) external onlyOwner {
        EscrowData storage escrow = escrows[loanId];
        require(escrow.isLocked, "LoanEscrow: property not locked");
        require(escrow.releasedAt == 0, "LoanEscrow: property already released");
        require(recipient != address(0), "LoanEscrow: invalid recipient address");

        uint256 propertyTokenId = escrow.propertyTokenId;

        // Transfer property token to recipient (lenders/investors)
        propertyToken.transferFrom(address(this), recipient, propertyTokenId);

        // Update escrow data
        escrow.isLocked = false;
        escrow.lender = recipient;
        escrow.releasedAt = block.timestamp;

        emit PropertyTokenLiquidated(loanId, propertyTokenId, recipient);
    }

    /**
     * @dev Set lender address (called when loan is funded)
     * @param loanId The loan ID
     * @param lender The lender/investor address (or contract address for distributed ownership)
     */
    function setLender(uint256 loanId, address lender) external onlyOwner {
        require(lender != address(0), "LoanEscrow: invalid lender address");
        escrows[loanId].lender = lender;
    }

    /**
     * @dev Get escrow data for a loan
     * @param loanId The loan ID
     * @return EscrowData struct
     */
    function getEscrowData(uint256 loanId) external view returns (EscrowData memory) {
        return escrows[loanId];
    }

    /**
     * @dev Check if property is locked for a loan
     * @param loanId The loan ID
     * @return True if property is locked
     */
    function isPropertyLocked(uint256 loanId) external view returns (bool) {
        return escrows[loanId].isLocked;
    }

    /**
     * @dev Set loan contract address (only owner)
     * @param _loanContract New loan contract address
     */
    function setLoanContract(address _loanContract) external onlyOwner {
        require(_loanContract != address(0), "LoanEscrow: invalid loan contract address");
        loanContract = _loanContract;
    }

    /**
     * @dev Update property token contract address (only owner)
     * @param _propertyToken New property token contract address
     */
    function setPropertyToken(address _propertyToken) external onlyOwner {
        require(_propertyToken != address(0), "LoanEscrow: invalid property token address");
        propertyToken = PropertyToken(_propertyToken);
    }
}

