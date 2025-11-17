import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMakePayment } from '@/hooks/useMakePayment';
import { useUSDTBalance } from '@/hooks/useUSDTBalance';
import { Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatLoanAmount } from '@/lib/loanContract';

interface LoanPaymentModalProps {
  loanId: string;
  monthlyPayment: bigint; // Monthly payment amount in USDT (6 decimals)
  totalOwed: bigint; // Total amount owed
  amountPaid: bigint; // Amount already paid
  nextPaymentDue: bigint; // Unix timestamp
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const LoanPaymentModal: React.FC<LoanPaymentModalProps> = ({
  loanId,
  monthlyPayment,
  totalOwed,
  amountPaid,
  nextPaymentDue,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const { payLoan, isPending, isSuccess } = useMakePayment();
  const { formattedBalance: usdtBalance } = useUSDTBalance();

  // Calculate remaining balance
  const remainingBalance = totalOwed - amountPaid;
  const remainingBalanceFormatted = formatLoanAmount(remainingBalance);
  const monthlyPaymentFormatted = formatLoanAmount(monthlyPayment);

  // Calculate days until next payment
  const daysUntilDue = nextPaymentDue > 0 
    ? Math.max(0, Math.floor((Number(nextPaymentDue) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Check if overdue
  const isOverdue = nextPaymentDue > 0 && Date.now() > Number(nextPaymentDue) * 1000;

  // Handle payment
  const handlePayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      return;
    }

    try {
      await payLoan(loanId, paymentAmount);
      // onPaymentSuccess will be called when payment is confirmed
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  // Reset form when modal closes or payment succeeds
  React.useEffect(() => {
    if (!isOpen) {
      setPaymentAmount('');
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isSuccess) {
      setPaymentAmount('');
      setTimeout(() => {
        onPaymentSuccess?.();
        onClose();
      }, 2000);
    }
  }, [isSuccess, onPaymentSuccess, onClose]);

  // Set default payment amount to monthly payment
  React.useEffect(() => {
    if (isOpen && !paymentAmount) {
      setPaymentAmount(monthlyPaymentFormatted);
    }
  }, [isOpen, monthlyPaymentFormatted]);

  const paymentAmountNum = Number(paymentAmount) || 0;
  const hasInsufficientBalance = paymentAmountNum > Number(usdtBalance?.replace(/,/g, '') || 0);
  const exceedsRemaining = paymentAmountNum > Number(remainingBalanceFormatted);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make Loan Payment</DialogTitle>
          <DialogDescription>
            Make a payment towards loan #{loanId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Loan Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Payment:</span>
              <span className="font-medium">${monthlyPaymentFormatted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Owed:</span>
              <span className="font-medium">${formatLoanAmount(totalOwed)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-medium text-green-600">${formatLoanAmount(amountPaid)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">Remaining Balance:</span>
              <span className="font-semibold">${remainingBalanceFormatted}</span>
            </div>
            {nextPaymentDue > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Payment Due:</span>
                <span className={isOverdue ? 'font-medium text-red-600' : 'font-medium'}>
                  {isOverdue 
                    ? `Overdue by ${Math.abs(daysUntilDue)} days`
                    : `Due in ${daysUntilDue} days`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Payment Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Payment Amount (USDT)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0"
                max={remainingBalanceFormatted}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={monthlyPaymentFormatted}
                className="pl-9"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Your USDT Balance: ${usdtBalance || '0'}</span>
              <button
                type="button"
                onClick={() => setPaymentAmount(monthlyPaymentFormatted)}
                className="text-primary hover:underline"
              >
                Use monthly payment
              </button>
            </div>
          </div>

          {/* Warnings */}
          {hasInsufficientBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient USDT balance. You need ${paymentAmount} but only have ${usdtBalance}.
              </AlertDescription>
            </Alert>
          )}

          {exceedsRemaining && !hasInsufficientBalance && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Payment amount exceeds remaining balance. Maximum payment: ${remainingBalanceFormatted}
              </AlertDescription>
            </Alert>
          )}

          {isOverdue && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This payment is overdue. Please make a payment as soon as possible to avoid default.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={
              isPending ||
              !paymentAmount ||
              paymentAmountNum <= 0 ||
              hasInsufficientBalance ||
              exceedsRemaining
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Make Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


