# Blockchain Integration Guide

This document provides a complete guide for setting up and using the blockchain integration for property tokenization.

## Overview

The BlockToHome platform uses ERC-721 (NFT) tokens to represent real estate properties on the blockchain. Each property is tokenized as a unique NFT with metadata stored on IPFS.

## Architecture

### Smart Contracts

- **PropertyToken.sol**: ERC-721 contract for property tokens
  - Mint unique property tokens
  - Store property metadata (valuation, tokenized portion, collateral type)
  - Track property ownership
  - Transfer properties between addresses

### Frontend Integration

- **Property Token Hooks**: React hooks for interacting with the smart contract
- **IPFS Integration**: Upload property images, deeds, and metadata to IPFS
- **Transaction Management**: Handle blockchain transactions with wagmi

## Setup Instructions

### 1. Install Contract Dependencies

```bash
cd contracts
npm install
```

**Note**: For Polkadot Hub deployment, ensure you have Node.js 22.18+ and npm 10.9.0+.

### 2. Configure Environment Variables

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

### 3. Deploy Smart Contract

#### Deploy to Sepolia Testnet
```bash
npm run deploy:sepolia
```

#### Deploy to Polygon Amoy Testnet
```bash
npm run deploy:polygon-amoy
```

#### Deploy to Polygon Mainnet
```bash
npm run deploy:polygon
```

#### Deploy to Polkadot Hub TestNet (PolkaVM)
```bash
npm run deploy:polkadot-hub-testnet
```

**Note**: Polkadot Hub uses PolkaVM and requires PAS tokens for gas. See [POLKADOT_HUB_DEPLOYMENT.md](./POLKADOT_HUB_DEPLOYMENT.md) for detailed instructions.

After deployment, save the contract address to your frontend `.env` file.

### 4. Configure Frontend

Create or update `.env` in the root directory:

```env
# PropertyToken Contract Addresses
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_11155111=0x... # Sepolia
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_80002=0x... # Polygon Amoy
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_137=0x... # Polygon
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_1=0x... # Ethereum Mainnet
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_1001=0x... # Polkadot Hub TestNet (check actual chain ID)

# IPFS/Pinata Configuration
VITE_PINATA_JWT=your_pinata_jwt_token
# OR
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

### 5. Set Up IPFS (Pinata)

1. Go to [Pinata](https://www.pinata.cloud/)
2. Create a free account
3. Get your API key or JWT token
4. Add it to your `.env` file

**Note**: You can use other IPFS services like Web3.Storage or NFT.Storage. Update `src/lib/ipfs.ts` accordingly.

## Usage

### Tokenizing a Property

1. **Connect Wallet**: Users must connect their wallet first
2. **Fill Property Details**: Enter property address, valuation, etc.
3. **Upload Documents**: Upload property image and deed
4. **Select Backing Asset**: Choose USDT or Gold as collateral
5. **Tokenize**: Click "Confirm & Tokenize"

The tokenization process includes:
1. Upload property image to IPFS
2. Upload property deed to IPFS
3. Create property metadata JSON
4. Upload metadata to IPFS
5. Mint ERC-721 token on blockchain
6. Wait for transaction confirmation

### Viewing Properties

Use the `useOwnerProperties` hook to get all properties owned by an address:

```typescript
import { useOwnerProperties } from '@/hooks/usePropertyToken';

const { tokenIds, isLoading } = useOwnerProperties(address);
```

### Reading Property Data

Use the `usePropertyData` hook to get property information:

```typescript
import { usePropertyData } from '@/hooks/usePropertyToken';

const { propertyData, isLoading } = usePropertyData(tokenId);
```

## Smart Contract Functions

### Mint Property Token

```solidity
function mintPropertyToken(
    address to,
    uint256 valuation,
    uint256 tokenizedPortion,
    uint256 tokenizedValue,
    string memory collateralType,
    string memory tokenURI
) public onlyOwner returns (uint256)
```

### Get Property Data

```solidity
function getPropertyData(uint256 tokenId) 
    public view returns (PropertyData memory)
```

### Get Owner Properties

```solidity
function getOwnerProperties(address owner) 
    public view returns (uint256[] memory)
```

## IPFS Metadata Format

Property metadata follows the ERC-721 metadata standard:

```json
{
  "name": "Property at 123 Main St, City, Country",
  "description": "Tokenized property description...",
  "image": "ipfs://Qm...",
  "attributes": [
    {
      "trait_type": "Address",
      "value": "123 Main St"
    },
    {
      "trait_type": "Valuation (USD)",
      "value": 500000
    },
    {
      "trait_type": "Tokenized Portion (%)",
      "value": 100
    },
    {
      "trait_type": "Collateral Type",
      "value": "USDT"
    }
  ]
}
```

## Security Considerations

1. **Access Control**: Only contract owner can mint tokens (for production, consider a multi-sig or DAO)
2. **Input Validation**: All inputs are validated in the smart contract
3. **IPFS Pinning**: Use a reliable IPFS pinning service to ensure metadata availability
4. **Gas Optimization**: Contract uses OpenZeppelin's optimized ERC-721 implementation
5. **Reentrancy Protection**: OpenZeppelin contracts include reentrancy protection

## Testing

### Test on Local Network

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npm run deploy:local
```

### Test on Testnets

1. Get testnet tokens (Sepolia ETH, Polygon Amoy MATIC)
2. Deploy contract to testnet
3. Test tokenization flow
4. Verify transactions on block explorer

## Troubleshooting

### Contract Not Deployed

**Error**: `PropertyToken contract not deployed on chain X`

**Solution**: Deploy the contract to the chain and update the contract address in `.env`

### IPFS Upload Fails

**Error**: `IPFS upload failed`

**Solution**: 
- Check Pinata API credentials
- Verify API key has upload permissions
- Check file size limits (Pinata free tier: 1GB)

### Transaction Fails

**Error**: `Transaction failed`

**Solution**:
- Check wallet has sufficient gas
- Verify contract address is correct
- Check contract owner has minting permissions
- Verify all required parameters are provided

### Metadata Not Loading

**Error**: Metadata URI returns 404

**Solution**:
- Verify IPFS hash is correct
- Check file is pinned on IPFS
- Try different IPFS gateways
- Verify metadata JSON is valid

## Next Steps

1. **Loan Contracts**: Implement loan smart contracts
2. **Investment Pool**: Create investment pool contracts
3. **Governance**: Add DAO governance for contract upgrades
4. **KYC Integration**: Add KYC verification before tokenization
5. **Multi-sig**: Implement multi-sig for contract owner

## Resources

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [IPFS Documentation](https://docs.ipfs.io/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [wagmi Documentation](https://wagmi.sh/)
- [Hardhat Documentation](https://hardhat.org/docs)

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

