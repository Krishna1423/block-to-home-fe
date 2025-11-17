/**
 * Script to mint MockUSDT tokens for testing
 * 
 * Usage:
 *   npx hardhat run scripts/mintMockUSDT.js --network <network> <mockUSDTAddress> <recipientAddress> [amount]
 * 
 * Or set in .env:
 *   MOCK_USDT_ADDRESS=0x...
 *   RECIPIENT_ADDRESS=0x...
 *   MINT_AMOUNT=1000
 * 
 * How to get MockUSDT address after Ignition deployment:
 *   1. After deploying with Ignition, check the deployment output
 *   2. Look for "mockUSDT" or "usdtAddress" in the results
 *   3. Or check the deployment artifacts in ignition/deployments/<network>/<deployment-id>/
 *   4. Or use: npx hardhat ignition list --network <network> to see deployments
 */

const hre = require("hardhat");

async function main() {
  const mockUSDTAddress = process.env.MOCK_USDT_ADDRESS || process.env.USDT_ADDRESS || process.argv[2];
  const recipientAddress = process.env.RECIPIENT_ADDRESS || process.argv[3];
  const amount = process.env.MINT_AMOUNT || process.argv[4] || "1000"; // Default 1000 USDT

  if (!mockUSDTAddress || !recipientAddress) {
    console.error("\n❌ Error: Missing required parameters\n");
    console.log("Usage:");
    console.log("  npx hardhat run scripts/mintMockUSDT.js --network <network> <mockUSDTAddress> <recipientAddress> [amount]");
    console.log("\nOr set in .env:");
    console.log("  MOCK_USDT_ADDRESS=0x...");
    console.log("  RECIPIENT_ADDRESS=0x...");
    console.log("  MINT_AMOUNT=1000");
    console.log("\n💡 How to get MockUSDT address after Ignition deployment:");
    console.log("  1. Check the deployment output for 'mockUSDT' or 'usdtAddress'");
    console.log("  2. Or check: ignition/deployments/<network>/<deployment-id>/");
    console.log("  3. Or run: npx hardhat ignition list --network <network>");
    process.exit(1);
  }

  console.log("Minting MockUSDT tokens...");
  console.log("MockUSDT Address:", mockUSDTAddress);
  console.log("Recipient:", recipientAddress);
  console.log("Amount:", amount, "USDT");

  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  console.log("Deployer:", deployer.address);

  // Get MockUSDT contract
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = MockUSDT.attach(mockUSDTAddress);

  // Convert amount to token units (with 6 decimals)
  const amountWithDecimals = hre.ethers.parseUnits(amount, 6);

  // Mint tokens
  console.log("\nMinting tokens...");
  const tx = await mockUSDT.mint(recipientAddress, amountWithDecimals);
  await tx.wait();

  // Check balance
  const balance = await mockUSDT.balanceOf(recipientAddress);
  const formattedBalance = hre.ethers.formatUnits(balance, 6);

  console.log("\n✓ Tokens minted successfully!");
  console.log(`Recipient balance: ${formattedBalance} USDT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

