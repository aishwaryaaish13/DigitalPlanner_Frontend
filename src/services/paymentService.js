import api from './api.js';

export const paymentService = {
  // Create a Razorpay order
  createOrder: async (amount, currency = 'INR') => {
    const response = await api.post('/payments/create-order', {
      amount,
      currency
    });
    return response.data;
  },

  // Verify payment signature
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  }
};
