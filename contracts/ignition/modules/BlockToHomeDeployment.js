// Ignition module for deploying all BlockToHome contracts
// This deploys all contracts in the correct order with proper dependencies
// Usage: npx hardhat ignition deploy ./ignition/modules/BlockToHomeDeployment.js --network <network>
//
// Optional: Set USDT_ADDRESS environment variable to use existing USDT contract
// If not set, MockUSDT will be deployed automatically

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BlockToHomeDeployment", (m) => {
  // Get the deployer account as the initial owner
  const deployer = m.getAccount(0);

  // Get USDT address from module parameter
  // You can pass it as: --parameters '{"BlockToHomeDeployment":{"usdtAddress":"0x..."}}'
  // If not provided, MockUSDT will be deployed automatically
  const usdtAddressParam = m.getParameter("usdtAddress", null);
  
  // Step 1: Deploy MockUSDT or use provided USDT address
  let mockUSDT = null;
  let finalUSDTAddress;

  if (usdtAddressParam && usdtAddressParam !== "0x0000000000000000000000000000000000000000") {
    // Use provided USDT address (must be a valid address string)
    finalUSDTAddress = usdtAddressParam;
  } else {
    // For Polkadot Hub TestNet, use the official MockUSDT if available
    // Otherwise, deploy MockUSDT for testing (default for local networks)
    // Note: Polkadot Hub TestNet has an official MockUSDT - use that instead of deploying
    const polkadotHubOfficialUSDT = "0x0000000000000000000000000000000000000000"; // TODO: Replace with official address
    if (polkadotHubOfficialUSDT !== "0x0000000000000000000000000000000000000000") {
      finalUSDTAddress = polkadotHubOfficialUSDT;
      console.log("Using official Polkadot Hub TestNet MockUSDT:", finalUSDTAddress);
    } else {
      // Deploy MockUSDT for testing (default for local networks)
      mockUSDT = m.contract("MockUSDT", [deployer]);
      finalUSDTAddress = mockUSDT;
    }
  }

  // Step 2: Deploy PropertyToken
  const propertyToken = m.contract("PropertyToken", [deployer]);

  // Step 3: Deploy LoanEscrow (depends on PropertyToken)
  const loanEscrow = m.contract("LoanEscrow", [deployer, propertyToken]);

  // Step 4: Deploy LiquidityPool (depends on USDT)
  const liquidityPool = m.contract("LiquidityPool", [deployer, finalUSDTAddress]);

  // Step 5: Deploy LoanContract (depends on all above)
  const loanContract = m.contract("LoanContract", [
    deployer,
    finalUSDTAddress,
    loanEscrow,
    propertyToken,
    liquidityPool,
  ]);

  // Step 6: Configure contracts
  // Set LoanContract address in LoanEscrow
  m.call(loanEscrow, "setLoanContract", [loanContract]);

  // Set LoanContract address in LiquidityPool
  m.call(liquidityPool, "setLoanContract", [loanContract]);

  return {
    mockUSDT,
    propertyToken,
    loanEscrow,
    liquidityPool,
    loanContract,
    usdtAddress: finalUSDTAddress,
  };
});

