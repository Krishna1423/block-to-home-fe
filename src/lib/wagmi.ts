import { createConfig, http } from 'wagmi';
import { mainnet, polygon, sepolia, polygonAmoy } from 'wagmi/chains';
import { defineChain } from 'viem';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

// Polkadot Hub TestNet configuration
const polkadotHubTestnet = defineChain({
  id: 420420422, // Polkadot Hub TestNet Chain ID
  name: 'Polkadot Hub TestNet',
  nativeCurrency: {
    name: 'PAS',
    symbol: 'PAS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://polkadot-hub-testnet.subscan.io',
    },
  },
  testnet: true,
});

// Supported chains - you can add more chains here
export const supportedChains = [mainnet, polygon, sepolia, polygonAmoy, polkadotHubTestnet] as const;

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    metaMask(), // MetaMask connector
    coinbaseWallet({ appName: 'BlockToHome' }), // Coinbase Wallet connector
    // WalletConnect connector can be added later if needed (requires project ID from https://cloud.walletconnect.com)
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [polkadotHubTestnet.id]: http(),
  },
});

// Default chain ID (you can change this to your preferred chain)
export const defaultChainId = polygon.id; // Using Polygon as default

// Chain configuration helper
export const getChainById = (chainId: number) => {
  return supportedChains.find(chain => chain.id === chainId);
};

