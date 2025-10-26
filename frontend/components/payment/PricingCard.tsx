'use client';

import React from 'react';
import { Check, Zap, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingCardProps {
  title: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  onPurchase: (credits: number, price: number) => void;
  isLoading?: boolean;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  credits,
  description,
  features,
  isPopular = false,
  isRecommended = false,
  onPurchase,
  isLoading = false,
  className = ''
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  const getValuePerCredit = (price: number, credits: number) => {
    return (price / credits / 100).toFixed(3);
  };

  return (
    <div className={`relative bg-white rounded-xl border-2 p-8 ${isPopular ? 'border-blue-500 shadow-lg' : 'border-gray-200'} ${className}`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      {/* Recommended Badge */}
      {isRecommended && !isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Zap className="h-4 w-4" />
            <span>Recommended</span>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="mb-4">
          <div className="text-4xl font-bold text-gray-900">
            {formatPrice(price)}
          </div>
          <div className="text-lg text-gray-600 mt-1">
            {formatCredits(credits)} credits
          </div>
          <div className="text-sm text-gray-500 mt-1">
            ${getValuePerCredit(price, credits)} per credit
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Purchase Button */}
      <Button
        onClick={() => onPurchase(credits, price)}
        disabled={isLoading}
        className={`w-full py-3 text-lg font-semibold ${
          isPopular 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Purchase {formatCredits(credits)} Credits</span>
          </div>
        )}
      </Button>

      {/* Additional Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Secure payment powered by Stripe</p>
        <p>Credits never expire • Instant activation</p>
      </div>
    </div>
  );
};

export default PricingCard;