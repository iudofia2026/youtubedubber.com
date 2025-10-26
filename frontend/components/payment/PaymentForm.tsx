'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntent: unknown) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

const PaymentFormElement: React.FC<PaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  isLoading = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        // In a real app, you'd get this from your backend
        'pi_1234567890', // This should come from your backend
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Customer Name', // Get from form
            },
          },
        }
      );

      if (error) {
        setError(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="card-element">Card Details</Label>
          <div className="mt-2 p-4 border border-gray-300 rounded-md bg-white">
            <CardElement
              id="card-element"
              options={cardElementOptions}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
        <div className="text-lg font-semibold">
          Total: ${(amount / 100).toFixed(2)}
        </div>
        <Button
          type="submit"
          disabled={!stripe || isProcessing || isLoading}
          className="flex items-center space-x-2"
        >
          <CreditCard className="h-4 w-4" />
          <span>
            {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
          </span>
        </Button>
      </div>
    </form>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormElement {...props} />
    </Elements>
  );
};

export default PaymentForm;