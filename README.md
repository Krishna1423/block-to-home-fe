# BlockToHome

BlockToHome is a blockchain-powered real estate tokenization and collaborative lending platform designed to make property ownership more accessible, transparent, and community-driven. Built on Polkadot Paseo testnet(future it will be moved to mainnet), the platform enables interest-free, pool based lending and fractional real estate investment backed by stable digital assets.

BlockToHome transforms real estate into tokenized, fractional digital assets, allowing individuals to invest in property with low entry barriers. Community members can pool funds, support borrowers, and participate in property-backed lending without relying on traditional banks or interest-based financing models. Ownership, fund allocation, and yield distribution are securely managed through smart contracts.

### Features:
- Tokenized real estate ownership
- Interest-free peer-to-peer lending
- Community-driven investment pools
- Stable-asset-backed funding (USDT & Gold Token) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; # *For testing we are using mock/dummy USDT token that we deployed*
- Automated and transparent smart contract operations
- Secure, interoperable, and scalable Polkadot-based architecture

# Demo Video
[![Video Title](https://img.youtube.com/vi/DGX0W8BYIXo/0.jpg)](https://www.youtube.com/watch?v=DGX0W8BYIXo)


## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Paseo Asset Hub
- Pinata for IPFS
- Hardhat

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Getting Started

Follow these steps to set up and run the project locally:

```sh
# Step 1: Clone the repository
git clone https://github.com/BlockToHome/block-to-home.git

# Step 2: Navigate to the project directory
cd block-to-home

# Step 3: Environment Variables

# Before running the application, create a `.env` file in the project root directory and add the following variables:

VITE_USDT_CONTRACT_ADDRESS_420420422=0xe6004b1b76E6C385436154552b66Ed415a3dB272
VITE_PROPERTY_TOKEN_CONTRACT_ADDRESS_420420422=0x5267555B5db130099Fa4Ce4162A1153f3FbeA2EF    
VITE_LOAN_ESCROW_CONTRACT_ADDRESS_420420422=0xF5B57164698a33ef298F44883c9de54931998E5F       
VITE_LIQUIDITY_POOL_CONTRACT_ADDRESS_420420422=0x95d7A4b99590Ab961F1BA7029735dDC7C337B8aB    
VITE_LOAN_CONTRACT_ADDRESS_420420422=0x605E563030387E1aEDA5D6ee4EbB04CC814E9d2a

VITE_PINATA_API_KEY=<pinata_api_key>
VITE_PINATA_JWT=<pinata_jwt_token>

# Step 4: Install dependencies
npm install

# Step 5: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080` by default.

## Available Scripts

- `npm run dev` - Starts the development server with hot-reloading
- `npm run build` - Builds the application for production
- `npm run preview` - Previews the production build locally
- `npm run lint` - Runs the linter to check code quality
- `npm run test` - Runs the test suite

## Project Structure

```
block-to-home-fe/
├── src/                # Source files
├── public/            # Static assets
├── components/        # React components
├── styles/           # CSS and styling files
├── contracts/        # Solidity contracts
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.