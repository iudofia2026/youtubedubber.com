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
    if (credits >= 1000) return { color: 'text-green-600 dark:text-green-400', icon: TrendingUp, label: 'High' };
    if (credits >= 100) return { color: 'text-yellow-600 dark:text-yellow-400', icon: Zap, label: 'Medium' };
    return { color: 'text-red-600 dark:text-red-400', icon: Coins, label: 'Low' };
  };

  const status = getCreditStatus(balance);
  const StatusIcon = status.icon;

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Coins className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Credit Balance</h3>
            <p className="text-sm text-muted-foreground">Available credits for dubbing</p>
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
        <div className="text-3xl font-bold text-foreground mb-2">
          {formatCredits(balance)}
        </div>
        <div className="text-sm text-muted-foreground">
          credits remaining
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated videos:</span>
          <span className="font-medium">
            {Math.floor(balance / 10)} videos
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cost per video:</span>
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