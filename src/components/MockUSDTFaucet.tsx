import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { getUSDTAddress, USDT_ABI, parseUSDTAmount, formatUSDTBalance } from '@/lib/contracts';
import { useChainId, useAccount } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Coins } from 'lucide-react';

/**
 * MockUSDT Faucet Component
 * Allows contract owner to mint MockUSDT tokens
 * Only works if the connected wallet is the owner of the MockUSDT contract
 */
export const MockUSDTFaucet: React.FC = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const usdtAddress = getUSDTAddress(chainId);
  
  const [mintAmount, setMintAmount] = useState<string>('1000');
  const [recipientAddress, setRecipientAddress] = useState<string>(address || '');

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: usdtAddress,
    abi: [
      {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'owner',
    query: {
      enabled: !!usdtAddress,
    },
  });

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  const {
    writeContractAsync,
    data: hash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if contract has mint function (MockUSDT)
  const { data: hasMintFunction } = useReadContract({
    address: usdtAddress,
    abi: [
      {
        inputs: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'mintWithDecimals',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'mintWithDecimals',
    args: undefined,
    query: {
      enabled: false, // Just check if function exists, don't call it
    },
  });

  const handleMint = async () => {
    if (!usdtAddress) {
      toast({
        title: 'USDT not configured',
        description: 'USDT contract address not set for this network',
        variant: 'destructive',
      });
      return;
    }

    if (!recipientAddress || !recipientAddress.startsWith('0x')) {
      toast({
        title: 'Invalid address',
        description: 'Please enter a valid wallet address',
        variant: 'destructive',
      });
      return;
    }

    if (!mintAmount || Number(mintAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Use mintWithDecimals if available (MockUSDT), otherwise use mint
      const amountWei = parseUSDTAmount(mintAmount);

      await writeContractAsync({
        address: usdtAddress,
        abi: [
          {
            inputs: [
              { internalType: 'address', name: 'to', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'mintWithDecimals',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'mintWithDecimals',
        args: [recipientAddress as `0x${string}`, amountWei],
      });
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      const errorMessage = error?.message || error?.shortMessage || 'Unknown error occurred';
      
      if (errorMessage.includes('onlyOwner') || errorMessage.includes('Ownable')) {
        toast({
          title: 'Not authorized',
          description: 'Only the contract owner can mint tokens. Make sure you\'re using the deployer account.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error minting tokens',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  // Show success notification
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: 'Tokens minted successfully',
        description: `Transaction: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
      });
      // Reset form
      setMintAmount('1000');
    }
  }, [isConfirmed, hash]);

  if (!usdtAddress) {
    return null; // Don't show if USDT not configured
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          MockUSDT Faucet
        </CardTitle>
        <CardDescription>
          Mint MockUSDT tokens for testing (Owner only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isOwner && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Only the contract owner can mint tokens. 
              Make sure you're connected with the deployer account.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            type="text"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDT)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="1000"
            value={mintAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                setMintAmount(value);
              }
            }}
            min="0"
            step="1"
          />
        </div>

        <Button
          onClick={handleMint}
          disabled={isWriting || isConfirming || !isOwner || !recipientAddress || !mintAmount}
          className="w-full"
        >
          {isWriting || isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Mint {mintAmount || '0'} USDT
            </>
          )}
        </Button>

        {hash && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Transaction:</strong> {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
            {isConfirming && (
              <p className="text-xs text-green-600 mt-1">Waiting for confirmation...</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MockUSDTFaucet;


