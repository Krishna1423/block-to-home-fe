/**
 * Script to get contract addresses from Ignition deployments
 * Usage: npx hardhat run scripts/getDeploymentAddresses.js --network <network>
 * 
 * This script reads the latest Ignition deployment and shows all contract addresses
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  // Handle undefined chainId
  const chainIdDisplay = chainId || "{chainId}";
  
  console.log(`\n📋 Getting deployment addresses for ${network}`);
  if (chainId) {
    console.log(`   Chain ID: ${chainId}`);
  } else {
    console.log(`   Chain ID: Not detected (will use {chainId} placeholder)`);
  }
  
  // Show common chain IDs
  console.log(`\n💡 Common Chain IDs:`);
  console.log(`   - Polkadot Hub Testnet: 420420422`);
  console.log(`   - Sepolia: 11155111`);
  console.log(`   - Polygon Amoy: 80002`);
  console.log(`   - Hardhat (local): 31337\n`);

  // Path to Ignition deployments
  const deploymentsPath = path.join(__dirname, "..", "ignition", "deployments", "chain-" + chainId);
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ No deployments found for this network.");
    console.log(`   Expected path: ${deploymentsPath}`);
    console.log("\n💡 Deploy contracts first using:");
    console.log(`   npx hardhat ignition deploy ./ignition/modules/BlockToHomeDeployment.js --network ${network}`);
    process.exit(1);
  }

  // Find the latest deployment
  const deployments = fs.readdirSync(deploymentsPath).filter(dir => {
    return fs.statSync(path.join(deploymentsPath, dir)).isDirectory();
  });

  if (deployments.length === 0) {
    console.log("❌ No deployment directories found.");
    process.exit(1);
  }

  // Get the most recent deployment (alphabetically sorted, latest should be last)
  const latestDeployment = deployments.sort().pop();
  const deploymentPath = path.join(deploymentsPath, latestDeployment);
  
  console.log(`📦 Latest deployment: ${latestDeployment}\n`);

  // Read deployment artifacts
  const artifactsPath = path.join(deploymentPath, "artifacts");
  
  if (!fs.existsSync(artifactsPath)) {
    console.log("❌ No artifacts found in deployment directory.");
    process.exit(1);
  }

  // Read all JSON files in artifacts
  const artifactFiles = fs.readdirSync(artifactsPath).filter(file => file.endsWith(".json"));
  
  const addresses = {};
  
  for (const file of artifactFiles) {
    const artifactPath = path.join(artifactsPath, file);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    
    if (artifact.address) {
      const contractName = file.replace(".json", "");
      addresses[contractName] = artifact.address;
    }
  }

  if (Object.keys(addresses).length === 0) {
    console.log("❌ No contract addresses found in artifacts.");
    process.exit(1);
  }

  // Display addresses
  console.log("✅ Contract Addresses:\n");
  
  if (addresses.mockUSDT) {
    console.log(`MockUSDT:        ${addresses.mockUSDT}`);
  }
  if (addresses.usdtAddress) {
    console.log(`USDT Address:    ${addresses.usdtAddress}`);
  }
  if (addresses.propertyToken) {
    console.log(`PropertyToken:   ${addresses.propertyToken}`);
  }
  if (addresses.loanEscrow) {
    console.log(`LoanEscrow:      ${addresses.loanEscrow}`);
  }
  if (addresses.liquidityPool) {
    console.log(`LiquidityPool:   ${addresses.liquidityPool}`);
  }
  if (addresses.loanContract) {
    console.log(`LoanContract:    ${addresses.loanContract}`);
  }

  // Show .env format
  console.log("\n📝 Add these to your frontend .env file:\n");
  console.log(`# Replace {chainId} with the actual chain ID (e.g., 420420422 for Polkadot Hub Testnet)`);
  console.log(`VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_{chainId}=${addresses.propertyToken || "N/A"}`);
  console.log(`VITE_LOAN_ESCROW_CONTRACT_ADDRESS_{chainId}=${addresses.loanEscrow || "N/A"}`);
  if (addresses.mockUSDT || addresses.usdtAddress) {
    const usdtAddr = addresses.mockUSDT || addresses.usdtAddress;
    console.log(`VITE_USDT_CONTRACT_ADDRESS_{chainId}=${usdtAddr}`);
    console.log(`MOCK_USDT_ADDRESS=${usdtAddr}`);
  }
  console.log(`VITE_LIQUIDITY_POOL_CONTRACT_ADDRESS_{chainId}=${addresses.liquidityPool || "N/A"}`);
  console.log(`VITE_LOAN_CONTRACT_ADDRESS_{chainId}=${addresses.loanContract || "N/A"}`);

  // If chainId is known, show example with actual chainId
  if (chainId) {
    console.log(`\n📋 Example for Chain ID ${chainId}:\n`);
    console.log(`VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_${chainId}=${addresses.propertyToken || "N/A"}`);
    console.log(`VITE_LOAN_ESCROW_CONTRACT_ADDRESS_${chainId}=${addresses.loanEscrow || "N/A"}`);
    if (addresses.mockUSDT || addresses.usdtAddress) {
      const usdtAddr = addresses.mockUSDT || addresses.usdtAddress;
      console.log(`VITE_USDT_CONTRACT_ADDRESS_${chainId}=${usdtAddr}`);
    }
    console.log(`VITE_LIQUIDITY_POOL_CONTRACT_ADDRESS_${chainId}=${addresses.liquidityPool || "N/A"}`);
    console.log(`VITE_LOAN_CONTRACT_ADDRESS_${chainId}=${addresses.loanContract || "N/A"}`);
  }

  console.log("\n✅ Done!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

