// IPFS Integration for storing property metadata, images, and documents
// Using Pinata as the IPFS pinning service (you can use other services too)

// Pinata API configuration
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';

// IPFS Gateway URLs (public gateways to access IPFS content)
export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

/**
 * Upload a file to IPFS using Pinata
 * @param file File to upload
 * @returns IPFS hash (CID)
 */
export async function uploadToIPFS(file: File): Promise<string> {
  if (!PINATA_JWT && !PINATA_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY in your .env file');
  }

  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Pinata metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
      },
    });
    formData.append('pinataMetadata', metadata);

    // Pinata options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: PINATA_JWT
          ? `Bearer ${PINATA_JWT}`
          : `Basic ${btoa(`${PINATA_API_KEY}:${PINATA_SECRET_KEY}`)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`IPFS upload failed: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.IpfsHash; // Return IPFS hash (CID)
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata JSON object to upload
 * @param name Name for the metadata file
 * @returns IPFS hash (CID)
 */
export async function uploadMetadataToIPFS(metadata: object, name: string = 'metadata.json'): Promise<string> {
  if (!PINATA_JWT && !PINATA_API_KEY) {
    throw new Error('Pinata API credentials not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY in your .env file');
  }

  try {
    // Create JSON blob
    const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const jsonFile = new File([jsonBlob], name, { type: 'application/json' });

    // Upload using the file upload function
    return await uploadToIPFS(jsonFile);
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
}

/**
 * Get IPFS content URL
 * @param ipfsHash IPFS hash (CID)
 * @returns URL to access the content
 */
export function getIPFSUrl(ipfsHash: string): string {
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace(/^ipfs:\/\//, '');
  
  // Use first available gateway
  return `${IPFS_GATEWAYS[0]}${hash}`;
}

/**
 * Upload property metadata to IPFS
 * @param propertyData Property data to upload
 * @returns IPFS hash (CID)
 */
export async function uploadPropertyMetadataToIPFS(propertyData: {
  name: string;
  description: string;
  image: string; // IPFS hash of image
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}): Promise<string> {
  // Create metadata following ERC-721 metadata standard
  const metadata = {
    name: propertyData.name,
    description: propertyData.description,
    image: propertyData.image.startsWith('ipfs://') 
      ? propertyData.image 
      : `ipfs://${propertyData.image}`,
    attributes: propertyData.attributes,
    external_url: propertyData.external_url || '',
  };

  return await uploadMetadataToIPFS(metadata, 'property-metadata.json');
}

/**
 * Fetch content from IPFS
 * @param ipfsHash IPFS hash (CID)
 * @returns Content as text
 */
export async function fetchFromIPFS(ipfsHash: string): Promise<string> {
  const url = getIPFSUrl(ipfsHash);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
}

/**
 * Fetch JSON metadata from IPFS
 * @param ipfsHash IPFS hash (CID)
 * @returns Parsed JSON object
 */
export async function fetchMetadataFromIPFS<T = any>(ipfsHash: string): Promise<T> {
  const content = await fetchFromIPFS(ipfsHash);
  return JSON.parse(content) as T;
}

/**
 * Alternative: Upload to IPFS using Web3.Storage (free tier available)
 * Uncomment and configure if you prefer Web3.Storage over Pinata
 */
/*
export async function uploadToWeb3Storage(file: File): Promise<string> {
  const WEB3_STORAGE_TOKEN = import.meta.env.VITE_WEB3_STORAGE_TOKEN || '';
  
  if (!WEB3_STORAGE_TOKEN) {
    throw new Error('Web3.Storage token not configured');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WEB3_STORAGE_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.cid;
  } catch (error) {
    console.error('Error uploading to Web3.Storage:', error);
    throw error;
  }
}
*/

