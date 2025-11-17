// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20.sol";

/**
 * @title LiquidityPool
 * @dev Pool-based investment contract where investors deposit USDT into a pool
 * The pool then funds loans, and returns are distributed back to pool participants
 */
contract LiquidityPool is Ownable, ReentrancyGuard {
    // Reference to USDT token contract
    IERC20 public usdtToken;
    
    // Reference to LoanContract (authorized to withdraw funds for loans)
    address public loanContract;

    // Pool participant data structure
    struct PoolParticipant {
        address investor;
        uint256 depositAmount;      // Total USDT deposited
        uint256 shareTokens;        // Share tokens representing pool ownership
        uint256 totalDeposited;     // Cumulative deposits
        uint256 totalWithdrawn;    // Cumulative withdrawals
        uint256 lastDepositAt;      // Timestamp of last deposit
        bool isActive;             // Whether participant is active
    }

    // Pool state
    uint256 public totalPoolBalance;    // Total USDT in pool
    uint256 public totalShareTokens;   // Total share tokens issued
    uint256 public totalLoansFunded;    // Total amount funded to loans
    uint256 public totalReturnsReceived; // Total returns received from loans

    // Minimum deposit amount (in USDT, 6 decimals)
    uint256 public minDepositAmount = 100 * 10**6; // 100 USDT minimum

    // Mapping from investor address to participant data
    mapping(address => PoolParticipant) public participants;
    
    // Array of all participant addresses
    address[] public participantAddresses;
    
    // Mapping to track if address is in participants array
    mapping(address => bool) public isParticipant;

    // Events
    event DepositMade(
        address indexed investor,
        uint256 amount,
        uint256 shareTokens,
        uint256 totalPoolBalance
    );

    event WithdrawalMade(
        address indexed investor,
        uint256 amount,
        uint256 shareTokens,
        uint256 totalPoolBalance
    );

    event LoanFunded(
        uint256 indexed loanId,
        uint256 amount,
        uint256 remainingBalance
    );

    event ReturnsReceived(
        uint256 indexed loanId,
        uint256 amount,
        uint256 totalReturns
    );

    event PoolContractUpdated(address indexed newLoanContract);

    constructor(
        address initialOwner,
        address _usdtToken
    ) Ownable(initialOwner) {
        require(_usdtToken != address(0), "LiquidityPool: invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @dev Deposit USDT into the liquidity pool
     * @param amount Amount to deposit in USDT (6 decimals)
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount >= minDepositAmount, "LiquidityPool: deposit below minimum");
        require(usdtToken.balanceOf(msg.sender) >= amount, "LiquidityPool: insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= amount, "LiquidityPool: insufficient USDT allowance");

        // Transfer USDT from investor to pool
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "LiquidityPool: USDT transfer failed");

        // Calculate share tokens to issue
        uint256 shareTokens;
        if (totalShareTokens == 0) {
            // First deposit: 1:1 ratio
            shareTokens = amount;
        } else {
            // Calculate shares based on current pool value
            // shareTokens = (amount * totalShareTokens) / totalPoolBalance
            shareTokens = (amount * totalShareTokens) / totalPoolBalance;
        }

        // Update participant data
        if (!isParticipant[msg.sender]) {
            isParticipant[msg.sender] = true;
            participantAddresses.push(msg.sender);
        }

        PoolParticipant storage participant = participants[msg.sender];
        participant.investor = msg.sender;
        participant.depositAmount += amount;
        participant.shareTokens += shareTokens;
        participant.totalDeposited += amount;
        participant.lastDepositAt = block.timestamp;
        participant.isActive = true;

        // Update pool state
        totalPoolBalance += amount;
        totalShareTokens += shareTokens;

        emit DepositMade(msg.sender, amount, shareTokens, totalPoolBalance);
    }

    /**
     * @dev Withdraw USDT from the liquidity pool
     * @param amount Amount to withdraw in USDT (6 decimals)
     */
    function withdraw(uint256 amount) external nonReentrant {
        PoolParticipant storage participant = participants[msg.sender];
        require(participant.isActive, "LiquidityPool: not a participant");
        require(amount > 0, "LiquidityPool: amount must be greater than 0");
        
        // Calculate available balance (considering funds locked in loans)
        uint256 availableBalance = totalPoolBalance - totalLoansFunded;
        require(amount <= availableBalance, "LiquidityPool: insufficient pool liquidity");
        
        // Calculate share tokens to burn
        uint256 shareTokensToBurn = (amount * participant.shareTokens) / participant.depositAmount;
        require(shareTokensToBurn <= participant.shareTokens, "LiquidityPool: insufficient shares");

        // Calculate withdrawal amount based on share percentage
        uint256 sharePercentage = (participant.shareTokens * 10000) / totalShareTokens;
        uint256 maxWithdrawable = (availableBalance * sharePercentage) / 10000;
        require(amount <= maxWithdrawable, "LiquidityPool: withdrawal exceeds share");

        // Update participant data
        participant.depositAmount -= amount;
        participant.shareTokens -= shareTokensToBurn;
        participant.totalWithdrawn += amount;

        // Update pool state
        totalPoolBalance -= amount;
        totalShareTokens -= shareTokensToBurn;

        // Transfer USDT to investor
        require(usdtToken.transfer(msg.sender, amount), "LiquidityPool: USDT transfer failed");

        emit WithdrawalMade(msg.sender, amount, shareTokensToBurn, totalPoolBalance);
    }

    /**
     * @dev Fund a loan from the pool (only callable by LoanContract)
     * @param loanId The loan ID
     * @param amount Amount to fund in USDT (6 decimals)
     * @param borrower The borrower address
     */
    function fundLoan(
        uint256 loanId,
        uint256 amount,
        address borrower
    ) external nonReentrant returns (bool) {
        require(msg.sender == loanContract || msg.sender == owner(), "LiquidityPool: unauthorized");
        require(amount > 0, "LiquidityPool: amount must be greater than 0");
        require(borrower != address(0), "LiquidityPool: invalid borrower address");
        
        uint256 availableBalance = totalPoolBalance - totalLoansFunded;
        require(amount <= availableBalance, "LiquidityPool: insufficient pool liquidity");

        // Update pool state
        totalLoansFunded += amount;

        // Transfer USDT to borrower
        require(usdtToken.transfer(borrower, amount), "LiquidityPool: USDT transfer failed");

        emit LoanFunded(loanId, amount, availableBalance - amount);
        return true;
    }

    /**
     * @dev Receive returns from a loan (only callable by LoanContract)
     * @param loanId The loan ID
     * @param amount Return amount in USDT (6 decimals)
     * Note: USDT should already be transferred to this contract by LoanContract before calling this
     */
    function receiveReturns(
        uint256 loanId,
        uint256 amount
    ) external nonReentrant {
        require(msg.sender == loanContract || msg.sender == owner(), "LiquidityPool: unauthorized");
        require(amount > 0, "LiquidityPool: amount must be greater than 0");
        
        // Get current USDT balance (should include the amount just transferred by LoanContract)
        uint256 currentBalance = usdtToken.balanceOf(address(this));
        
        // Calculate expected minimum balance after receiving returns
        // Available balance = totalPoolBalance - totalLoansFunded
        // After receiving amount: expectedBalance = (totalPoolBalance - totalLoansFunded) + amount
        uint256 availableBalance = totalPoolBalance - totalLoansFunded;
        uint256 expectedMinBalance = availableBalance + amount;
        
        // Verify USDT was received (balance should be at least expected minimum)
        require(currentBalance >= expectedMinBalance, "LiquidityPool: insufficient balance received");

        // Update pool state
        totalPoolBalance += amount;
        totalReturnsReceived += amount;
        
        // Note: In production, you might want to track principal vs interest separately
        // and reduce totalLoansFunded by principal portion as loans are repaid

        emit ReturnsReceived(loanId, amount, totalReturnsReceived);
    }

    /**
     * @dev Get participant's share percentage
     * @param investor The investor address
     * @return sharePercentage Share percentage in basis points (10000 = 100%)
     */
    function getParticipantShare(address investor) external view returns (uint256 sharePercentage) {
        PoolParticipant memory participant = participants[investor];
        if (totalShareTokens == 0) {
            return 0;
        }
        sharePercentage = (participant.shareTokens * 10000) / totalShareTokens;
    }

    /**
     * @dev Get participant's available balance (considering locked funds)
     * @param investor The investor address
     * @return availableBalance Available balance in USDT
     */
    function getAvailableBalance(address investor) external view returns (uint256 availableBalance) {
        PoolParticipant memory participant = participants[investor];
        if (!participant.isActive || totalShareTokens == 0) {
            return 0;
        }
        
        uint256 poolAvailableBalance = totalPoolBalance - totalLoansFunded;
        uint256 sharePercentage = (participant.shareTokens * 10000) / totalShareTokens;
        availableBalance = (poolAvailableBalance * sharePercentage) / 10000;
    }

    /**
     * @dev Get total number of participants
     * @return count Number of participants
     */
    function getParticipantCount() external view returns (uint256 count) {
        return participantAddresses.length;
    }

    /**
     * @dev Get participant data
     * @param investor The investor address
     * @return participant PoolParticipant struct
     */
    function getParticipant(address investor) external view returns (PoolParticipant memory) {
        return participants[investor];
    }

    /**
     * @dev Set loan contract address (only owner)
     * @param _loanContract New loan contract address
     */
    function setLoanContract(address _loanContract) external onlyOwner {
        require(_loanContract != address(0), "LiquidityPool: invalid loan contract address");
        loanContract = _loanContract;
        emit PoolContractUpdated(_loanContract);
    }

    /**
     * @dev Set minimum deposit amount (only owner)
     * @param _minDepositAmount New minimum deposit amount
     */
    function setMinDepositAmount(uint256 _minDepositAmount) external onlyOwner {
        minDepositAmount = _minDepositAmount;
    }

    /**
     * @dev Update USDT token address (only owner)
     * @param _usdtToken New USDT token address
     */
    function setUSDTToken(address _usdtToken) external onlyOwner {
        require(_usdtToken != address(0), "LiquidityPool: invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @dev Emergency withdraw (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(usdtToken.transfer(owner(), amount), "LiquidityPool: withdrawal failed");
    }
}

