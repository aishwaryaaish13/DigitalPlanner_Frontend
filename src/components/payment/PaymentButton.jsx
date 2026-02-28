import React from 'react';
import { Button } from '../common/Button.jsx';
import { CreditCard, Loader2 } from 'lucide-react';
import { useRazorpay } from '../../hooks/useRazorpay.js';

export const PaymentButton = ({ 
  amount, 
  currency = 'INR',
  name = 'Premium Plan',
  description = 'Upgrade to premium',
  onSuccess,
  onFailure,
  children,
  className = ''
}) => {
  const { isLoaded, isProcessing, initiatePayment } = useRazorpay();

  const handlePayment = () => {
    initiatePayment({
      amount,
      currency,
      name,
      description,
      onSuccess,
      onFailure
    });
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={!isLoaded || isProcessing}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          {children || `Pay ₹${amount / 100}`}
        </>
      )}
    </Button>
  );
};
