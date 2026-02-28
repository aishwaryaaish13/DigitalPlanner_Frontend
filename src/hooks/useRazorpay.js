import { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService.js';
import toast from 'react-hot-toast';

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      toast.error('Failed to load payment gateway');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiatePayment = async ({
    amount,
    currency = 'INR',
    name,
    description,
    onSuccess,
    onFailure
  }) => {
    if (!isLoaded) {
      toast.error('Payment gateway is loading. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order on backend
      const orderData = await paymentService.createOrder(amount, currency);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: name || 'Your App Name',
        description: description || 'Payment',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResult = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verificationResult.success) {
              toast.success('Payment successful!');
              onSuccess?.(verificationResult);
            } else {
              toast.error('Payment verification failed');
              onFailure?.(new Error('Payment verification failed'));
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            onFailure?.(error);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setIsProcessing(false);
            onFailure?.(new Error('Payment cancelled by user'));
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
      setIsProcessing(false);
      onFailure?.(error);
    }
  };

  return {
    isLoaded,
    isProcessing,
    initiatePayment
  };
};
