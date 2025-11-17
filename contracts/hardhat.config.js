require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { vars } = require("hardhat/config");

// Conditionally load Polkadot plugin (required for PolkaVM networks)
// On Windows, dockerode may fail to install, but plugin can still work for remote deployments
try {
  require("@parity/hardhat-polkadot");
} catch (error) {
  console.warn("Warning: @parity/hardhat-polkadot plugin not fully loaded. This may affect local node functionality.");
  console.warn("Remote deployments to Polkadot Hub TestNet should still work.");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based code generator to handle stack too deep errors
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      // Uncomment to use PolkaVM for local development
      //polkavm: true,
    },
    // Polkadot Hub TestNet (PolkaVM)
    polkadotHubTestnet: {
      polkavm: true,
      url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      accounts: vars.has("PRIVATE_KEY") ? [vars.get("PRIVATE_KEY")] : [],
      chainId: 420420422, // Polkadot Hub Testnet Chain ID
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    polygonAmoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  // Note: Etherscan verification may not work for Polkadot Hub
  // Use block explorers specific to Polkadot Hub for verification
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

