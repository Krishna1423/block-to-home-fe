# BlockToHome

A modern web application for managing loan-related operations.

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Polkadot Asset Hub
- Pinata for IPFS

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