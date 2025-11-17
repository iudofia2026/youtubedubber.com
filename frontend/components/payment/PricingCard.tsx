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
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-4 xs:p-6 sm:p-8 ${isPopular ? 'border-blue-500 shadow-lg' : 'border-gray-200 dark:border-gray-700'} ${className}`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 xs:-top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-blue-500 text-white px-3 xs:px-4 py-1 rounded-full text-xs xs:text-sm font-medium flex items-center space-x-1">
            <Star className="h-3 w-3 xs:h-4 xs:w-4" />
            <span className="hidden xs:inline">Most Popular</span>
            <span className="xs:hidden">Popular</span>
          </div>
        </div>
      )}

      {/* Recommended Badge */}
      {isRecommended && !isPopular && (
        <div className="absolute -top-3 xs:-top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-green-500 text-white px-3 xs:px-4 py-1 rounded-full text-xs xs:text-sm font-medium flex items-center space-x-1">
            <Zap className="h-3 w-3 xs:h-4 xs:w-4" />
            <span className="hidden xs:inline">Recommended</span>
            <span className="xs:hidden">Best</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6 xs:mb-8">
        <h3 className="text-xl xs:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 xs:mb-6 text-sm xs:text-base">{description}</p>

        <div className="mb-4">
          <div className="text-3xl xs:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(price)}
          </div>
          <div className="text-base xs:text-lg text-gray-600 dark:text-gray-400 mt-1">
            {formatCredits(credits)} credits
          </div>
          <div className="text-xs xs:text-sm text-gray-500 dark:text-gray-500 mt-1">
            ${getValuePerCredit(price, credits)} per credit
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3 xs:space-y-4 mb-6 xs:mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <Check className="h-4 w-4 xs:h-5 xs:w-5 text-green-500" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm xs:text-base leading-relaxed">{feature}</span>
          </div>
        ))}
      </div>

      {/* Purchase Button */}
      <Button
        onClick={() => onPurchase(credits, price)}
        disabled={isLoading}
        size="lg"
        className={`w-full text-base xs:text-lg font-semibold min-h-[48px] ${
          isPopular
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm xs:text-base">Processing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 xs:h-5 xs:w-5" />
            <span className="text-sm xs:text-base">Purchase {formatCredits(credits)} Credits</span>
          </div>
        )}
      </Button>

      {/* Additional Info */}
      <div className="mt-4 xs:mt-6 text-center text-xs xs:text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <p>Secure payment powered by Stripe</p>
        <p>Credits never expire • Instant activation</p>
      </div>
    </div>
  );
};

export default PricingCard;