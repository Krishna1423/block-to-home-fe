import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoanPayments, PaymentData } from '@/hooks/useLoanPayments';
import { Loader2, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface LoanPaymentHistoryProps {
  loanId: string;
  className?: string;
}

export const LoanPaymentHistory: React.FC<LoanPaymentHistoryProps> = ({
  loanId,
  className,
}) => {
  const { payments, isLoading, refetch } = useLoanPayments(loanId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Loading payment records...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>No payments made yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            This loan has no payment history yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => (
            <PaymentItem key={payment.paymentId} payment={payment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface PaymentItemProps {
  payment: PaymentData;
}

const PaymentItem: React.FC<PaymentItemProps> = ({ payment }) => {
  const paymentDate = new Date(payment.timestamp * 1000);
  const isRecent = Date.now() - paymentDate.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 bg-primary/10 rounded-full">
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium">${payment.amount}</p>
            {isRecent && (
              <Badge variant="secondary" className="text-xs">
                Recent
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            <span>{format(paymentDate, 'MMM dd, yyyy HH:mm')}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground font-mono">
          {payment.payer.slice(0, 6)}...{payment.payer.slice(-4)}
        </p>
      </div>
    </div>
  );
};

// Import Button component
import { Button } from '@/components/ui/button';


