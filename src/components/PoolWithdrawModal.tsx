import React, { useState } from 'react';
import { usePoolWithdraw } from '@/hooks/usePoolWithdraw';
import { useUserInvestments } from '@/hooks/useUserInvestments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PoolWithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PoolWithdrawModal: React.FC<PoolWithdrawModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const { 
    totalDeposited, 
    totalReturns, 
    currentDeposit,
    sharePercentage,
    isLoading: isLoadingInvestments 
  } = useUserInvestments();
  const { 
    withdraw, 
    maxWithdrawable, 
    isPending, 
    isConfirming, 
    isLoading: isLoadingWithdraw,
    error 
  } = usePoolWithdraw();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [sliderValue, setSliderValue] = useState(0);

  // Calculate total value (deposit + returns)
  const totalValue = totalDeposited + totalReturns;
  const availableBalance = maxWithdrawable;

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderVal = parseInt(e.target.value);
    setSliderValue(sliderVal);
    const amount = (availableBalance * sliderVal) / 100;
    setWithdrawAmount(amount.toFixed(2));
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setWithdrawAmount(value);
    
    if (value && !isNaN(parseFloat(value))) {
      const amount = parseFloat(value);
      if (amount > availableBalance) {
        setSliderValue(100);
      } else {
        setSliderValue((amount / availableBalance) * 100);
      }
    } else {
      setSliderValue(0);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > availableBalance) {
      toast({
        title: 'Insufficient balance',
        description: `You can withdraw up to ${availableBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await withdraw(withdrawAmount);
      // Reset form on success (will be handled by useEffect in hook)
      setWithdrawAmount('');
      setSliderValue(0);
    } catch (err) {
      // Error handled by hook
    }
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setWithdrawAmount('');
      setSliderValue(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Withdraw from Pool</DialogTitle>
          <DialogDescription>
            Withdraw your share of principal and returns from the liquidity pool
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Investment Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Deposited</div>
              <div className="text-lg font-semibold">
                ${totalDeposited.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Returns Received</div>
              <div className="text-lg font-semibold text-green-600">
                ${totalReturns.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Pool Share</div>
              <div className="text-lg font-semibold">
                {sharePercentage.toFixed(4)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Available to Withdraw</div>
              <div className="text-lg font-semibold text-blue-600">
                ${availableBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Info Alert */}
          {totalDeposited > availableBalance && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Funds Locked in Active Loans</p>
                <p>
                  Some of your funds are currently locked in active loans. 
                  You can only withdraw from the available balance. As loans are repaid, 
                  more funds will become available for withdrawal.
                </p>
              </div>
            </div>
          )}

          {/* Withdrawal Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Withdrawal Amount (USDT)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="withdraw-amount"
                type="text"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={handleInputChange}
                className="pl-10"
                disabled={isLoadingWithdraw || isLoadingInvestments}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Available: ${availableBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
              <button
                type="button"
                onClick={() => {
                  setWithdrawAmount(availableBalance.toFixed(2));
                  setSliderValue(100);
                }}
                className="text-blue-600 hover:text-blue-700 underline"
                disabled={isLoadingWithdraw || isLoadingInvestments}
              >
                Use max
              </button>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Withdrawal percentage</span>
              <span className="font-medium">{sliderValue.toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isLoadingWithdraw || isLoadingInvestments}
            />
          </div>

          {/* Estimated Withdrawal Breakdown */}
          {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="text-sm font-medium text-blue-900 mb-2">
                Withdrawal Breakdown
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Principal:</span>
                <span className="font-medium">
                  ${((parseFloat(withdrawAmount) * totalDeposited) / totalValue || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Returns:</span>
                <span className="font-medium text-green-600">
                  ${((parseFloat(withdrawAmount) * totalReturns) / totalValue || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                <span className="font-medium text-blue-900">Total:</span>
                <span className="font-bold text-blue-900">
                  ${parseFloat(withdrawAmount).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoadingWithdraw}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={
              isLoadingWithdraw ||
              isLoadingInvestments ||
              !withdrawAmount ||
              parseFloat(withdrawAmount) <= 0 ||
              parseFloat(withdrawAmount) > availableBalance
            }
          >
            {isLoadingWithdraw ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isConfirming ? 'Confirming...' : 'Processing...'}
              </>
            ) : (
              'Withdraw'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

