# BlockToHome Smart Contracts

This directory contains the Solidity smart contracts for the BlockToHome property tokenization platform.

## Contracts

### PropertyToken.sol
ERC-721 token contract for representing real estate properties on the blockchain.

**Features:**
- Mint unique property tokens
- Store property metadata (valuation, tokenized portion, collateral type)
- Track property ownership
- Transfer properties between addresses
- Activate/deactivate properties

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Hardhat

### Installation

```bash
cd contracts
npm install
```

### Environment Variables

Create a `.env` file in the `contracts` directory:

```env
# Private key of the deployer account (with funds for gas)
PRIVATE_KEY=your_private_key_here

# RPC URLs (optional, defaults provided)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_RPC_URL=https://polygon-rpc.com
ETHEREUM_RPC_URL=https://eth.llamarpc.com

# API Keys for contract verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## Compilation

```bash
npm run compile
```

## Testing

```bash
npm run test
```

## Deployment

### Deploy to Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Deploy to Polygon Amoy Testnet
```bash
npm run deploy:polygon-amoy
```

### Deploy to Polygon Mainnet
```bash
npm run deploy:polygon
```

### Deploy to Local Hardhat Network
```bash
npm run deploy:local
```

## Contract Addresses

After deployment, save the contract addresses to your frontend `.env` file:

```env
# Sepolia Testnet
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_11155111=0x...

# Polygon Amoy Testnet
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_80002=0x...

# Polygon Mainnet
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_137=0x...

# Ethereum Mainnet
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_1=0x...
```

## Usage

### Minting a Property Token

```solidity
propertyToken.mintPropertyToken(
    ownerAddress,
    valuation, // in USDT (6 decimals)
    tokenizedPortion, // percentage (1-100)
    tokenizedValue, // in USDT (6 decimals)
    "USDT", // or "Gold"
    ipfsHash // IPFS hash of metadata
);
```

### Querying Property Data

```solidity
PropertyData memory property = propertyToken.getPropertyData(tokenId);
```

### Getting Owner Properties

```solidity
uint256[] memory tokens = propertyToken.getOwnerProperties(ownerAddress);
```

## Security

- Contract uses OpenZeppelin's battle-tested ERC-721 implementation
- Only contract owner can mint tokens
- Property transfers require active status
- All inputs are validated

## License

MIT

