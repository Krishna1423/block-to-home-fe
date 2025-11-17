const hre = require("hardhat");

/**
 * Deploy MockUSDT contract only
 * This script is separate so you don't need to redeploy USDT every time
 * 
 * Usage:
 *   npx hardhat run scripts/deployUSDT.js --network <network>
 * 
 * After deployment, save the address to your .env file:
 *   USDT_ADDRESS=0x...
 */

async function main() {
  console.log("Deploying MockUSDT contract...");
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
  console.log("Deploying with account:", deployer.address);
  
  try {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "tokens");
  } catch (error) {
    console.log("Could not fetch balance (this is normal for some networks)");
  }

  // Check if USDT_ADDRESS is already set
  const existingUSDT = process.env.USDT_ADDRESS;
  if (existingUSDT && existingUSDT !== "0x0000000000000000000000000000000000000000") {
    console.log("\n⚠ Warning: USDT_ADDRESS is already set in environment:", existingUSDT);
    console.log("If you want to deploy a new MockUSDT, unset USDT_ADDRESS first.");
    console.log("Skipping deployment...");
    return;
  }

  // Deploy MockUSDT
  console.log("\n=== Deploying MockUSDT ===");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy(deployer.address);
  await mockUSDT.waitForDeployment();
  const usdtAddress = await mockUSDT.getAddress();
  
  console.log("✓ MockUSDT deployed to:", usdtAddress);
  console.log("⚠ Note: This is a MOCK token for testing only!");

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  const deploymentTx = mockUSDT.deploymentTransaction();
  if (deploymentTx) await deploymentTx.wait(3);

  // Verify contract on Etherscan (if not local network and not PolkaVM)
  const isPolkaVM = hre.network.config.polkavm === true;
  const chainId = hre.network.config.chainId;
  
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost" && !isPolkaVM) {
    console.log("\n=== Verifying contract on Etherscan ===");
    try {
      await hre.run("verify:verify", {
        address: usdtAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✓ MockUSDT verified");
    } catch (error) {
      console.log("✗ MockUSDT verification failed:", error.message);
    }
  } else if (isPolkaVM) {
    console.log("\nNote: Contract verification for PolkaVM networks may require different tools.");
    console.log("Check Subscan or Polkadot.js Apps for contract details.");
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", chainId);
  console.log("Deployer:", deployer.address);
  console.log("\nMockUSDT Address:", usdtAddress);
  console.log("\n=== Next Steps ===");
  console.log("1. Add this address to your .env file:");
  console.log(`   USDT_ADDRESS=${usdtAddress}`);
  console.log("\n2. Or add it to your frontend .env file:");
  console.log(`   VITE_USDT_CONTRACT_ADDRESS_${chainId}=${usdtAddress}`);
  console.log("\n3. Now you can deploy other contracts without redeploying USDT:");
  console.log(`   npx hardhat run scripts/deploy.js --network ${hre.network.name}`);
  console.log("\n=== Testing Instructions ===");
  console.log("To mint MockUSDT tokens for testing, use:");
  console.log(`  await mockUSDT.mintWithDecimals("0xYourAddress", 1000); // Mints 1000 USDT`);
  console.log("Or use the mint function with full amount:");
  console.log(`  await mockUSDT.mint("0xYourAddress", "1000000000"); // Mints 1000 USDT (1000 * 10^6)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

