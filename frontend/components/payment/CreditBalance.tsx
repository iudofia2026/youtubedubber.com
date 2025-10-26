'use client';

import React from 'react';
import { Coins, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreditBalanceProps {
  balance: number;
  onAddCredits?: () => void;
  className?: string;
}

const CreditBalance: React.FC<CreditBalanceProps> = ({
  balance,
  onAddCredits,
  className = ''
}) => {
  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  const getCreditStatus = (credits: number) => {
    if (credits >= 1000) return { color: 'text-green-600', icon: TrendingUp, label: 'High' };
    if (credits >= 100) return { color: 'text-yellow-600', icon: Zap, label: 'Medium' };
    return { color: 'text-red-600', icon: Coins, label: 'Low' };
  };

  const status = getCreditStatus(balance);
  const StatusIcon = status.icon;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Coins className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Credit Balance</h3>
            <p className="text-sm text-gray-500">Available credits for dubbing</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-4 w-4 ${status.color}`} />
          <span className={`text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {formatCredits(balance)}
        </div>
        <div className="text-sm text-gray-500">
          credits remaining
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated videos:</span>
          <span className="font-medium">
            {Math.floor(balance / 10)} videos
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cost per video:</span>
          <span className="font-medium">10 credits</span>
        </div>
      </div>

      {onAddCredits && (
        <Button
          onClick={onAddCredits}
          className="w-full mt-4"
          variant="outline"
        >
          <Coins className="h-4 w-4 mr-2" />
          Add Credits
        </Button>
      )}
    </div>
  );
};

export default CreditBalance;