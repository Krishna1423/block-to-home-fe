// Helper functions to get blockchain explorer URLs for different chains

export function getExplorerUrl(chainId: number, txHash: string): string {
  const hash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return `https://etherscan.io/tx/${hash}`;
    case 137: // Polygon
      return `https://polygonscan.com/tx/${hash}`;
    case 11155111: // Sepolia
      return `https://sepolia.etherscan.io/tx/${hash}`;
    case 80002: // Polygon Amoy
      return `https://amoy.polygonscan.com/tx/${hash}`;
    case 420420422: // Polkadot Hub TestNet
      return `https://polkadot-hub-testnet.subscan.io/extrinsic/${hash}`;
    default:
      // Fallback to Etherscan
      return `https://etherscan.io/tx/${hash}`;
  }
}

export function getExplorerAddressUrl(chainId: number, address: string): string {
  const addr = address.startsWith('0x') ? address : `0x${address}`;
  
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return `https://etherscan.io/address/${addr}`;
    case 137: // Polygon
      return `https://polygonscan.com/address/${addr}`;
    case 11155111: // Sepolia
      return `https://sepolia.etherscan.io/address/${addr}`;
    case 80002: // Polygon Amoy
      return `https://amoy.polygonscan.com/address/${addr}`;
    case 420420422: // Polkadot Hub TestNet
      return `https://polkadot-hub-testnet.subscan.io/account/${addr}`;
    default:
      // Fallback to Etherscan
      return `https://etherscan.io/address/${addr}`;
  }
}

/**
 * Get NFT instance URL for a specific token ID
 * @param chainId Chain ID
 * @param contractAddress Contract address
 * @param tokenId Token ID
 * @returns URL to view the NFT instance on block explorer
 */
export function getNFTInstanceUrl(chainId: number, contractAddress: string, tokenId: string | number): string {
  const addr = contractAddress.startsWith('0x') ? contractAddress : `0x${contractAddress}`;
  
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return `https://etherscan.io/nft/${addr}/${tokenId}`;
    case 137: // Polygon
      return `https://polygonscan.com/nft/${addr}/${tokenId}`;
    case 11155111: // Sepolia
      return `https://sepolia.etherscan.io/nft/${addr}/${tokenId}`;
    case 80002: // Polygon Amoy
      return `https://amoy.polygonscan.com/nft/${addr}/${tokenId}`;
    case 420420422: // Polkadot Hub TestNet (Blockscout)
      return `https://blockscout-passet-hub.parity-testnet.parity.io/token/${addr}/instance/${tokenId}`;
    default:
      // Fallback to Etherscan format
      return `https://etherscan.io/nft/${addr}/${tokenId}`;
  }
}

