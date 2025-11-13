const hre = require("hardhat");

async function main() {
  console.log("Deploying PropertyToken contract...");
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

  // Deploy PropertyToken contract
  const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");
  
  // Deploy with deployer as initial owner
  const propertyToken = await PropertyToken.deploy(deployer.address);

  await propertyToken.waitForDeployment();
  const address = await propertyToken.getAddress();

  console.log("PropertyToken deployed to:", address);
  console.log("Contract owner:", deployer.address);

  // Wait for a few block confirmations before verifying
  console.log("Waiting for block confirmations...");
  const deploymentTx = propertyToken.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait(5);
  }

  // Verify contract on Etherscan (if not local network and not PolkaVM)
  const isPolkaVM = hre.network.config.polkavm === true;
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost" && !isPolkaVM) {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [deployer.address],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
      console.log("Note: Verification may not be available for this network.");
    }
  } else if (isPolkaVM) {
    console.log("Note: Contract verification for PolkaVM networks may require different tools.");
    console.log("Check Subscan or Polkadot.js Apps for contract details.");
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", address);
  console.log("Contract Owner:", deployer.address);
  console.log("\nSave this address to your frontend .env file:");
  console.log(`VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS=${address}`);
  console.log("\nFor different chains, use:");
  console.log(`VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_${hre.network.config.chainId}=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

