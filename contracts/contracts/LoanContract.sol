// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20.sol";
import "./LoanEscrow.sol";
import "./PropertyToken.sol";
import "./LiquidityPool.sol";

/**
 * @title LoanContract
 * @dev Main contract for managing mortgage loans with pool-based funding
 * Loans are funded from a liquidity pool, and returns are distributed back to the pool
 */
contract LoanContract is Ownable, ReentrancyGuard {
    // Reference to USDT token contract
    IERC20 public usdtToken;
    
    // Reference to LoanEscrow contract
    LoanEscrow public loanEscrow;
    
    // Reference to PropertyToken contract
    PropertyToken public propertyToken;
    
    // Reference to LiquidityPool contract
    LiquidityPool public liquidityPool;

    // Loan status enum
    enum LoanStatus {
        PENDING,    // Loan request created, waiting for funding
        OPEN,       // Loan is open for investments
        FUNDED,     // Loan fully funded, funds transferred to borrower
        ACTIVE,     // Loan is active, borrower making payments
        COMPLETED,  // Loan fully repaid
        DEFAULTED   // Loan defaulted, collateral liquidated
    }

    // Loan data structure
    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 propertyTokenId;
        uint256 loanAmount;        // Total loan amount in USDT (6 decimals)
        uint256 fundedAmount;      // Amount funded so far in USDT
        uint256 interestRate;      // Annual interest rate in basis points (e.g., 500 = 5%)
        uint256 duration;          // Loan duration in months
        uint256 monthlyPayment;    // Monthly payment amount in USDT
        uint256 totalOwed;         // Total amount owed (principal + interest)
        uint256 amountPaid;        // Total amount paid so far
        uint256 createdAt;         // Timestamp when loan was created
        uint256 fundedAt;          // Timestamp when loan was fully funded
        uint256 nextPaymentDue;    // Timestamp for next payment due date
        LoanStatus status;
        bool isActive;
    }

    // Loan funding tracking (pool-based, no individual investments)
    struct LoanFunding {
        uint256 loanId;
        uint256 fundedAmount;      // Amount funded from pool
        uint256 fundedAt;           // Timestamp when funded
        bool isFunded;              // Whether loan is funded
    }

    // Payment data structure
    struct Payment {
        uint256 paymentId;
        uint256 loanId;
        uint256 amount;
        uint256 timestamp;
        address payer;
    }

    // Loan counter
    uint256 private _loanIdCounter;
    
    // Payment counter
    uint256 private _paymentIdCounter;

    // Mappings
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => LoanFunding) public loanFundings;
    mapping(uint256 => Payment) public payments;
    
    // Mapping from loan ID to array of payment IDs
    mapping(uint256 => uint256[]) public loanPayments;
    
    // Mapping from borrower address to array of loan IDs
    mapping(address => uint256[]) public borrowerLoans;

    // Events
    event LoanRequestCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 indexed propertyTokenId,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 duration
    );

    event LoanFunded(
        uint256 indexed loanId,
        uint256 amount,
        address indexed borrower,
        uint256 timestamp
    );

    event PaymentMade(
        uint256 indexed paymentId,
        uint256 indexed loanId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    event ReturnsDistributedToPool(
        uint256 indexed loanId,
        uint256 totalAmount,
        uint256 timestamp
    );

    event LoanCompleted(
        uint256 indexed loanId,
        uint256 timestamp
    );

    event LoanDefaulted(
        uint256 indexed loanId,
        uint256 timestamp
    );

    event LoanStatusUpdated(
        uint256 indexed loanId,
        LoanStatus oldStatus,
        LoanStatus newStatus
    );

    constructor(
        address initialOwner,
        address _usdtToken,
        address _loanEscrow,
        address _propertyToken,
        address _liquidityPool
    ) Ownable(initialOwner) {
        require(_usdtToken != address(0), "LoanContract: invalid USDT address");
        require(_loanEscrow != address(0), "LoanContract: invalid escrow address");
        require(_propertyToken != address(0), "LoanContract: invalid property token address");
        require(_liquidityPool != address(0), "LoanContract: invalid liquidity pool address");
        
        usdtToken = IERC20(_usdtToken);
        loanEscrow = LoanEscrow(_loanEscrow);
        propertyToken = PropertyToken(_propertyToken);
        liquidityPool = LiquidityPool(_liquidityPool);
        
        _loanIdCounter = 1;
        _paymentIdCounter = 1;
    }

    /**
     * @dev Create a loan request
     * @param propertyTokenId The property token ID to use as collateral
     * @param loanAmount Loan amount in USDT (6 decimals)
     * @param interestRate Annual interest rate in basis points (e.g., 500 = 5%)
     * @param duration Loan duration in months
     */
    function createLoanRequest(
        uint256 propertyTokenId,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(propertyToken.ownerOf(propertyTokenId) == msg.sender, "LoanContract: must own property");
        require(propertyToken.isPropertyActive(propertyTokenId), "LoanContract: property must be active");
        require(loanAmount > 0, "LoanContract: loan amount must be greater than 0");
        require(interestRate > 0 && interestRate <= 10000, "LoanContract: invalid interest rate"); // Max 100%
        require(duration > 0 && duration <= 360, "LoanContract: invalid duration"); // Max 30 years

        // Get property data to validate loan amount
        PropertyToken.PropertyData memory property = propertyToken.getPropertyData(propertyTokenId);
        require(loanAmount <= property.tokenizedValue, "LoanContract: loan amount exceeds tokenized value");

        // Lock property token in escrow
        loanEscrow.lockPropertyToken(_loanIdCounter, propertyTokenId, msg.sender);

        // Calculate monthly payment and total owed
        uint256 monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, duration);
        uint256 totalOwed = monthlyPayment * duration;

        // Create loan
        loans[_loanIdCounter] = Loan({
            loanId: _loanIdCounter,
            borrower: msg.sender,
            propertyTokenId: propertyTokenId,
            loanAmount: loanAmount,
            fundedAmount: 0,
            interestRate: interestRate,
            duration: duration,
            monthlyPayment: monthlyPayment,
            totalOwed: totalOwed,
            amountPaid: 0,
            createdAt: block.timestamp,
            fundedAt: 0,
            nextPaymentDue: 0,
            status: LoanStatus.OPEN,
            isActive: true
        });

        // Add to borrower's loans
        borrowerLoans[msg.sender].push(_loanIdCounter);

        emit LoanRequestCreated(
            _loanIdCounter,
            msg.sender,
            propertyTokenId,
            loanAmount,
            interestRate,
            duration
        );

        uint256 loanId = _loanIdCounter;
        _loanIdCounter++;
        
        return loanId;
    }

    /**
     * @dev Fund a loan from the liquidity pool
     * @param loanId The loan ID to fund
     */
    function fundLoanFromPool(uint256 loanId) external nonReentrant {
        require(loans[loanId].isActive, "LoanContract: loan not active");
        require(loans[loanId].status == LoanStatus.OPEN, "LoanContract: loan not open for funding");
        require(!loanFundings[loanId].isFunded, "LoanContract: loan already funded");
        
        uint256 loanAmount = loans[loanId].loanAmount;
        
        // Fund loan from liquidity pool
        require(
            liquidityPool.fundLoan(loanId, loanAmount, loans[loanId].borrower),
            "LoanContract: pool funding failed"
        );

        // Update loan
        loans[loanId].fundedAmount = loanAmount;
        loans[loanId].status = LoanStatus.FUNDED;
        loans[loanId].fundedAt = block.timestamp;
        loans[loanId].nextPaymentDue = block.timestamp + 30 days; // First payment due in 30 days

        // Update funding tracking
        loanFundings[loanId] = LoanFunding({
            loanId: loanId,
            fundedAmount: loanAmount,
            fundedAt: block.timestamp,
            isFunded: true
        });

        emit LoanFunded(loanId, loanAmount, loans[loanId].borrower, block.timestamp);
        emit LoanStatusUpdated(loanId, LoanStatus.OPEN, LoanStatus.FUNDED);
    }


    /**
     * @dev Make a payment towards the loan
     * @param loanId The loan ID
     * @param amount Payment amount in USDT (6 decimals)
     */
    function makePayment(
        uint256 loanId,
        uint256 amount
    ) external nonReentrant returns (uint256) {
        require(loans[loanId].isActive, "LoanContract: loan not active");
        require(loans[loanId].status == LoanStatus.FUNDED || loans[loanId].status == LoanStatus.ACTIVE, "LoanContract: loan not in payment phase");
        require(loans[loanId].borrower == msg.sender, "LoanContract: only borrower can make payments");
        require(amount > 0, "LoanContract: payment amount must be greater than 0");
        require(usdtToken.balanceOf(msg.sender) >= amount, "LoanContract: insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= amount, "LoanContract: insufficient USDT allowance");

        // Transfer USDT from borrower to contract
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "LoanContract: USDT transfer failed");

        // Update loan payment tracking
        loans[loanId].amountPaid += amount;
        
        // Update status to ACTIVE if it was FUNDED
        if (loans[loanId].status == LoanStatus.FUNDED) {
            loans[loanId].status = LoanStatus.ACTIVE;
            emit LoanStatusUpdated(loanId, LoanStatus.FUNDED, LoanStatus.ACTIVE);
        }

        // Update next payment due date
        loans[loanId].nextPaymentDue = block.timestamp + 30 days;

        // Create payment record
        payments[_paymentIdCounter] = Payment({
            paymentId: _paymentIdCounter,
            loanId: loanId,
            amount: amount,
            timestamp: block.timestamp,
            payer: msg.sender
        });

        loanPayments[loanId].push(_paymentIdCounter);

        emit PaymentMade(_paymentIdCounter, loanId, msg.sender, amount, block.timestamp);

        uint256 paymentId = _paymentIdCounter;
        _paymentIdCounter++;

        // Distribute returns to liquidity pool
        _distributeReturnsToPool(loanId, amount);

        // Check if loan is completed
        if (loans[loanId].amountPaid >= loans[loanId].totalOwed) {
            _completeLoan(loanId);
        }

        return paymentId;
    }

    /**
     * @dev Distribute returns to liquidity pool
     * @param loanId The loan ID
     * @param paymentAmount The payment amount to distribute
     */
    function _distributeReturnsToPool(uint256 loanId, uint256 paymentAmount) internal {
        // Transfer USDT to pool (pool will handle the receiveReturns internally)
        require(usdtToken.transfer(address(liquidityPool), paymentAmount), "LoanContract: transfer to pool failed");
        
        // Notify pool of returns received
        liquidityPool.receiveReturns(loanId, paymentAmount);

        emit ReturnsDistributedToPool(loanId, paymentAmount, block.timestamp);
    }

    /**
     * @dev Complete loan and release collateral
     * @param loanId The loan ID
     */
    function _completeLoan(uint256 loanId) internal {
        require(loans[loanId].amountPaid >= loans[loanId].totalOwed, "LoanContract: loan not fully paid");
        
        LoanStatus oldStatus = loans[loanId].status;
        loans[loanId].status = LoanStatus.COMPLETED;
        loans[loanId].isActive = false;

        // Release property token from escrow
        loanEscrow.releasePropertyToken(loanId);

        emit LoanCompleted(loanId, block.timestamp);
        emit LoanStatusUpdated(loanId, oldStatus, LoanStatus.COMPLETED);
    }

    /**
     * @dev Handle loan default and liquidate collateral
     * @param loanId The loan ID
     */
    function liquidateCollateral(uint256 loanId) external onlyOwner {
        require(loans[loanId].isActive, "LoanContract: loan not active");
        require(
            loans[loanId].status == LoanStatus.FUNDED || loans[loanId].status == LoanStatus.ACTIVE,
            "LoanContract: loan not in defaultable state"
        );
        
        // Check if payment is overdue (more than 90 days past due)
        require(
            block.timestamp > loans[loanId].nextPaymentDue + 90 days,
            "LoanContract: loan not yet in default"
        );

        loans[loanId].status = LoanStatus.DEFAULTED;
        loans[loanId].isActive = false;

        // Liquidate property token (transfer to contract owner for distribution)
        // In a real implementation, this could be distributed to investors or sold
        loanEscrow.liquidatePropertyToken(loanId, owner());

        emit LoanDefaulted(loanId, block.timestamp);
        emit LoanStatusUpdated(loanId, loans[loanId].status, LoanStatus.DEFAULTED);
    }

    /**
     * @dev Calculate monthly payment amount
     * @param principal Loan principal amount
     * @param interestRate Annual interest rate in basis points
     * @param duration Loan duration in months
     * @return Monthly payment amount
     */
    function calculateMonthlyPayment(
        uint256 principal,
        uint256 interestRate,
        uint256 duration
    ) public pure returns (uint256) {
        // Simple interest calculation: (P * r * n) / (12 * 10000) + P / n
        // Where P = principal, r = interest rate in basis points, n = duration in months
        uint256 monthlyInterest = (principal * interestRate) / (12 * 10000);
        uint256 principalPayment = principal / duration;
        return monthlyInterest + principalPayment;
    }

    /**
     * @dev Get loan details
     * @param loanId The loan ID
     * @return Loan struct
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    /**
     * @dev Get loan funding progress
     * @param loanId The loan ID
     * @return fundedAmount Amount funded so far
     * @return loanAmount Total loan amount
     * @return fundingPercentage Funding percentage (0-10000 basis points)
     * @return isFunded Whether loan is fully funded
     */
    function getLoanFundingProgress(uint256 loanId) external view returns (
        uint256 fundedAmount,
        uint256 loanAmount,
        uint256 fundingPercentage,
        bool isFunded
    ) {
        Loan memory loan = loans[loanId];
        LoanFunding memory funding = loanFundings[loanId];
        fundedAmount = loan.fundedAmount;
        loanAmount = loan.loanAmount;
        fundingPercentage = loan.loanAmount > 0 ? (loan.fundedAmount * 10000) / loan.loanAmount : 0;
        isFunded = funding.isFunded;
    }

    /**
     * @dev Get all payments for a loan
     * @param loanId The loan ID
     * @return Array of payment IDs
     */
    function getLoanPayments(uint256 loanId) external view returns (uint256[] memory) {
        return loanPayments[loanId];
    }

    /**
     * @dev Get all loans for a borrower
     * @param borrower The borrower address
     * @return Array of loan IDs
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }


    /**
     * @dev Update loan status (admin function)
     * @param loanId The loan ID
     * @param newStatus The new status
     */
    function updateLoanStatus(uint256 loanId, LoanStatus newStatus) external onlyOwner {
        LoanStatus oldStatus = loans[loanId].status;
        loans[loanId].status = newStatus;
        emit LoanStatusUpdated(loanId, oldStatus, newStatus);
    }

    /**
     * @dev Set liquidity pool address
     * @param _liquidityPool New liquidity pool address
     */
    function setLiquidityPool(address _liquidityPool) external onlyOwner {
        require(_liquidityPool != address(0), "LoanContract: invalid liquidity pool address");
        liquidityPool = LiquidityPool(_liquidityPool);
    }

    /**
     * @dev Update USDT token address
     * @param _usdtToken New USDT token address
     */
    function setUSDTToken(address _usdtToken) external onlyOwner {
        require(_usdtToken != address(0), "LoanContract: invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @dev Update escrow contract address
     * @param _loanEscrow New escrow contract address
     */
    function setLoanEscrow(address _loanEscrow) external onlyOwner {
        require(_loanEscrow != address(0), "LoanContract: invalid escrow address");
        loanEscrow = LoanEscrow(_loanEscrow);
    }

    /**
     * @dev Emergency withdraw (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(usdtToken.transfer(owner(), amount), "LoanContract: withdrawal failed");
    }
}

