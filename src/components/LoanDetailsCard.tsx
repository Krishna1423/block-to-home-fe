import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoanPaymentModal } from './LoanPaymentModal';
import { LoanPaymentHistory } from './LoanPaymentHistory';
import { useLiquidateCollateral } from '@/hooks/useLiquidateCollateral';
import { formatLoanAmount, getLoanStatusString } from '@/lib/loanContract';
import {
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  History,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount } from 'wagmi';

interface LoanDetailsCardProps {
  loanId: string;
  loanAmount: bigint;
  fundedAmount: bigint;
  monthlyPayment: bigint;
  totalOwed: bigint;
  amountPaid: bigint;
  interestRate: bigint; // in basis points
  duration: bigint; // in months
  status: number; // LoanStatus enum
  createdAt: bigint;
  fundedAt: bigint;
  nextPaymentDue: bigint;
  borrower: string;
  propertyValue?: number;
  propertyAddress?: string;
  collateralType?: string;
  onPaymentSuccess?: () => void;
}

export const LoanDetailsCard: React.FC<LoanDetailsCardProps> = ({
  loanId,
  loanAmount,
  fundedAmount,
  monthlyPayment,
  totalOwed,
  amountPaid,
  interestRate,
  duration,
  status,
  createdAt,
  fundedAt,
  nextPaymentDue,
  borrower,
  propertyValue,
  propertyAddress,
  collateralType,
  onPaymentSuccess,
}) => {
  const { address } = useAccount();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { liquidateLoan, isPending: isLiquidating } = useLiquidateCollateral();
  const statusString = getLoanStatusString(status);

  // Check if user is the borrower
  const isBorrower = address?.toLowerCase() === borrower.toLowerCase();

  // Calculate payment progress
  const paymentProgress = totalOwed > 0 ? Number((amountPaid * BigInt(10000)) / totalOwed) / 100 : 0;
  const remainingBalance = totalOwed - amountPaid;

  // Check if loan is overdue (more than 90 days past due date)
  const isOverdue = nextPaymentDue > 0 && Date.now() > Number(nextPaymentDue) * 1000;
  const daysOverdue = isOverdue
    ? Math.floor((Date.now() - Number(nextPaymentDue) * 1000) / (1000 * 60 * 60 * 24))
    : 0;
  const isInDefault = isOverdue && daysOverdue > 90;

  // Check if loan can be paid (FUNDED or ACTIVE status)
  const canMakePayment = status === 2 || status === 3; // FUNDED or ACTIVE

  // Format dates
  const createdDate = new Date(Number(createdAt) * 1000);
  const fundedDate = fundedAt > 0 ? new Date(Number(fundedAt) * 1000) : null;
  const nextPaymentDate = nextPaymentDue > 0 ? new Date(Number(nextPaymentDue) * 1000) : null;

  // Interest rate as percentage
  const interestRatePercent = Number(interestRate) / 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Loan #{loanId}</CardTitle>
            <CardDescription>
              Created on {format(createdDate, 'MMM dd, yyyy')}
            </CardDescription>
          </div>
          <Badge
            variant={
              statusString === 'COMPLETED'
                ? 'default'
                : statusString === 'DEFAULTED'
                ? 'destructive'
                : statusString === 'ACTIVE'
                ? 'secondary'
                : 'outline'
            }
          >
            {statusString}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            {isInDefault && <TabsTrigger value="default">Default</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Loan Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-lg font-semibold">${formatLoanAmount(loanAmount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-lg font-semibold">${formatLoanAmount(monthlyPayment)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-lg font-semibold">{interestRatePercent.toFixed(2)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{Number(duration)} months</p>
              </div>
            </div>

            {/* Payment Progress */}
            {canMakePayment && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Progress</span>
                  <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
                </div>
                <Progress value={paymentProgress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid: ${formatLoanAmount(amountPaid)}</span>
                  <span className="text-muted-foreground">
                    Remaining: ${formatLoanAmount(remainingBalance)}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Due Date */}
            {nextPaymentDate && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isOverdue ? 'Payment Overdue' : 'Next Payment Due'}
                  </p>
                  <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {format(nextPaymentDate, 'MMM dd, yyyy')}
                    {isOverdue && ` (${daysOverdue} days overdue)`}
                  </p>
                </div>
              </div>
            )}

            {/* Property Info */}
            {propertyAddress && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Collateral Property</p>
                </div>
                <p className="text-sm text-muted-foreground">{propertyAddress}</p>
                {propertyValue && (
                  <p className="text-sm text-muted-foreground">
                    Value: ${propertyValue.toLocaleString()}
                  </p>
                )}
                {collateralType && (
                  <Badge variant="outline" className="mt-2">
                    {collateralType}-backed
                  </Badge>
                )}
              </div>
            )}

            {/* Default Warning */}
            {isInDefault && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Loan in Default:</strong> This loan is more than 90 days overdue. The
                  collateral may be liquidated.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            {isBorrower && (
              <div className="flex gap-2">
                {canMakePayment && (
                  <Button onClick={() => setShowPaymentModal(true)} className="flex-1">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Make Payment
                  </Button>
                )}
                {statusString === 'COMPLETED' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Loan Completed</span>
                  </div>
                )}
                {statusString === 'DEFAULTED' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Loan Defaulted</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {isBorrower && canMakePayment && (
              <div className="mb-4">
                <Button onClick={() => setShowPaymentModal(true)} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Make Payment
                </Button>
              </div>
            )}
            <LoanPaymentHistory loanId={loanId} />
          </TabsContent>

          {isInDefault && (
            <TabsContent value="default" className="mt-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This loan is in default. The collateral property will be liquidated and
                  distributed to investors.
                </AlertDescription>
              </Alert>
              {/* Note: Liquidation is typically an admin function */}
            </TabsContent>
          )}
        </Tabs>

        {/* Payment Modal */}
        {showPaymentModal && (
          <LoanPaymentModal
            loanId={loanId}
            monthlyPayment={monthlyPayment}
            totalOwed={totalOwed}
            amountPaid={amountPaid}
            nextPaymentDue={nextPaymentDue}
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onPaymentSuccess={() => {
              onPaymentSuccess?.();
              setShowPaymentModal(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};


