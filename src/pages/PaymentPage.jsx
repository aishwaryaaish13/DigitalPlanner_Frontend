import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card.jsx';
import { PaymentButton } from '../components/payment/PaymentButton.jsx';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaymentPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 49900, // in paise (₹499)
      features: [
        'Access to all basic features',
        'Email support',
        '5 GB storage',
        'Basic analytics'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 99900, // in paise (₹999)
      features: [
        'All Basic features',
        'Priority support',
        '50 GB storage',
        'Advanced analytics',
        'Custom integrations'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 199900, // in paise (₹1999)
      features: [
        'All Pro features',
        '24/7 dedicated support',
        'Unlimited storage',
        'Custom solutions',
        'API access',
        'Team collaboration'
      ]
    }
  ];

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    // Navigate to success page or update user subscription
    navigate('/dashboard');
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Select the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₹{plan.price / 100}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <PaymentButton
                amount={plan.price}
                name={plan.name}
                description={`Subscribe to ${plan.name}`}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                className="w-full"
              >
                Subscribe Now
              </PaymentButton>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
