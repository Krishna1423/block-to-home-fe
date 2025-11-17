const hre = require("hardhat");

async function main() {
  console.log("Deploying BlockToHome contracts...");
  console.log("Network:", hre.network.name);

  // Get the deployer account
  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    const isPolkaVM = hre.network.config.polkavm === true;
    const accountSource = isPolkaVM ? "PRIVATE_KEY (using vars)" : "PRIVATE_KEY (using process.env)";
    throw new Error(
      `No accounts configured for deployment.\n` +
      `Please set your ${accountSource} environment variable.\n` +
      `For PolkaVM networks, use: npx hardhat vars set PRIVATE_KEY\n` +
      `For other networks, set PRIVATE_KEY in your .env file or environment variables.`
    );
  }
  
  const deployer = signers[0];
  console.log("Deploying contracts with account:", deployer.address);
  
  try {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "tokens");
  } catch (error) {
    console.log("Could not fetch balance (this is normal for some networks)");
  }

  // Get USDT address from environment variable
  // USDT should be deployed separately using deployUSDT.js script
  const chainId = hre.network.config.chainId;
  let usdtAddress = process.env.USDT_ADDRESS;
  
  // Default USDT addresses for known networks
  if (!usdtAddress) {
    const defaultUSDTAddresses = {
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
      137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon
      420420422: "0xe6004b1b76E6C385436154552b66Ed415a3dB272", // Polkadot Hub TestNet MockUSDT (can be overridden with USDT_ADDRESS)
    };
    usdtAddress = defaultUSDTAddresses[chainId] || null;
  }

  // Require USDT address to be set
  if (!usdtAddress || usdtAddress === "0x0000000000000000000000000000000000000000") {
    console.log("\n⚠ Error: USDT address not set!");
    console.log("Network:", hre.network.name, "Chain ID:", chainId);
    console.log("\nPlease deploy MockUSDT first using:");
    console.log(`  npx hardhat run scripts/deployUSDT.js --network ${hre.network.name}`);
    console.log("\nThen set USDT_ADDRESS in your .env file:");
    console.log("  USDT_ADDRESS=0x...");
    console.log("\nOr use an existing USDT address:");
    console.log("  USDT_ADDRESS=0x...");
    console.log("\nSkipping deployment...");
    return;
  }

  console.log("\n=== Using USDT Contract ===");
  console.log("USDT address:", usdtAddress);
  if (process.env.USDT_ADDRESS) {
    console.log("(Using USDT_ADDRESS from .env file)");
  } else {
    console.log("(Using default address for this network)");
  }
  console.log("Note: To deploy a new MockUSDT, use: npx hardhat run scripts/deployUSDT.js --network", hre.network.name);
  console.log("Note: To override, set USDT_ADDRESS in your .env file");

  console.log("\n=== Step 1: Deploying PropertyToken ===");
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(deployer.address);
  await propertyToken.waitForDeployment();
  const propertyTokenAddress = await propertyToken.getAddress();
  console.log("✓ PropertyToken deployed to:", propertyTokenAddress);

  console.log("\n=== Step 2: Deploying LoanEscrow ===");
  const LoanEscrow = await hre.ethers.getContractFactory("LoanEscrow");
  const loanEscrow = await LoanEscrow.deploy(deployer.address, propertyTokenAddress);
  await loanEscrow.waitForDeployment();
  const loanEscrowAddress = await loanEscrow.getAddress();
  console.log("✓ LoanEscrow deployed to:", loanEscrowAddress);

  console.log("\n=== Step 3: Deploying LiquidityPool ===");
  console.log("Using USDT address:", usdtAddress);
  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy(deployer.address, usdtAddress);
  await liquidityPool.waitForDeployment();
  const liquidityPoolAddress = await liquidityPool.getAddress();
  console.log("✓ LiquidityPool deployed to:", liquidityPoolAddress);

  console.log("\n=== Step 4: Deploying LoanContract ===");
  const LoanContract = await hre.ethers.getContractFactory("LoanContract");
  const loanContract = await LoanContract.deploy(
    deployer.address,
    usdtAddress,
    loanEscrowAddress,
    propertyTokenAddress,
    liquidityPoolAddress
  );
  await loanContract.waitForDeployment();
  const loanContractAddress = await loanContract.getAddress();
  console.log("✓ LoanContract deployed to:", loanContractAddress);

  // Configure contracts
  console.log("\n=== Step 5: Configuring Contracts ===");
  
  // Set loan contract address in LoanEscrow to authorize it
  const setLoanContractTx = await loanEscrow.setLoanContract(loanContractAddress);
  await setLoanContractTx.wait();
  console.log("✓ LoanEscrow configured with LoanContract address");
  
  // Set loan contract address in LiquidityPool to authorize it
  const setPoolLoanContractTx = await liquidityPool.setLoanContract(loanContractAddress);
  await setPoolLoanContractTx.wait();
  console.log("✓ LiquidityPool configured with LoanContract address");

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  const propertyTokenTx = propertyToken.deploymentTransaction();
  const loanEscrowTx = loanEscrow.deploymentTransaction();
  const liquidityPoolTx = liquidityPool.deploymentTransaction();
  const loanContractTx = loanContract.deploymentTransaction();
  
  if (propertyTokenTx) await propertyTokenTx.wait(3);
  if (loanEscrowTx) await loanEscrowTx.wait(3);
  if (liquidityPoolTx) await liquidityPoolTx.wait(3);
  if (loanContractTx) await loanContractTx.wait(3);

  // Verify contracts on Etherscan (if not local network and not PolkaVM)
  const isPolkaVM = hre.network.config.polkavm === true;
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost" && !isPolkaVM) {
    console.log("\n=== Verifying contracts on Etherscan ===");
    
    try {
      await hre.run("verify:verify", {
        address: propertyTokenAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✓ PropertyToken verified");
    } catch (error) {
      console.log("✗ PropertyToken verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: loanEscrowAddress,
        constructorArguments: [deployer.address, propertyTokenAddress],
      });
      console.log("✓ LoanEscrow verified");
    } catch (error) {
      console.log("✗ LoanEscrow verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: liquidityPoolAddress,
        constructorArguments: [deployer.address, usdtAddress],
      });
      console.log("✓ LiquidityPool verified");
    } catch (error) {
      console.log("✗ LiquidityPool verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: loanContractAddress,
        constructorArguments: [deployer.address, usdtAddress, loanEscrowAddress, propertyTokenAddress, liquidityPoolAddress],
      });
      console.log("✓ LoanContract verified");
    } catch (error) {
      console.log("✗ LoanContract verification failed:", error.message);
    }
  } else if (isPolkaVM) {
    console.log("\nNote: Contract verification for PolkaVM networks may require different tools.");
    console.log("Check Subscan or Polkadot.js Apps for contract details.");
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", chainId);
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("USDT:", usdtAddress);
  console.log("PropertyToken:", propertyTokenAddress);
  console.log("LoanEscrow:", loanEscrowAddress);
  console.log("LiquidityPool:", liquidityPoolAddress);
  console.log("LoanContract:", loanContractAddress);
  console.log("\nSave these addresses to your frontend .env file:");
  console.log(`VITE_USDT_CONTRACT_ADDRESS_${chainId}=${usdtAddress}`);
  console.log(`VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_${chainId}=${propertyTokenAddress}`);
  console.log(`VITE_LOAN_ESCROW_CONTRACT_ADDRESS_${chainId}=${loanEscrowAddress}`);
  console.log(`VITE_LIQUIDITY_POOL_CONTRACT_ADDRESS_${chainId}=${liquidityPoolAddress}`);
  console.log(`VITE_LOAN_CONTRACT_ADDRESS_${chainId}=${loanContractAddress}`);
  console.log("\nNote: If you need to deploy a new MockUSDT, use:");
  console.log(`  npx hardhat run scripts/deployUSDT.js --network ${hre.network.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

