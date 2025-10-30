'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Eye, Plus, Settings, History, TrendingUp } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { CreditBalance, BillingHistory, PaymentForm } from '@/components/payment';
import { getCredits, setCredits } from '@/lib/credits';
import { fetchTransactions, createPaymentIntent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  amount: number;
  credits: number;
  status: 'completed' | 'pending' | 'failed';
}

export default function BillingPage() {
  const [userCredits, setUserCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ credits: number; price: number } | null>(null);

  // Initialize credits and load real transactions from backend
  useEffect(() => {
    setUserCredits(getCredits());
    (async () => {
      try {
        const txns = await fetchTransactions();
        const mapped: Transaction[] = txns.map((t: any) => ({
          id: t.id,
          date: t.created_at,
          type: (t.amount > 0 ? 'purchase' : 'usage') as Transaction['type'],
          description: t.description || 'Transaction',
          amount: t.amount,
          credits: 0,
          status: (t.status === 'succeeded' ? 'completed' : t.status) as Transaction['status'],
        }));
        setTransactions(mapped);
      } catch {
        setTransactions([]);
      }
    })();
  }, []);

  const handlePurchase = async (credits: number, price: number) => {
    setIsLoading(true);
    try {
      await createPaymentIntent(price); // client secret is retrieved in PaymentForm
      setSelectedPlan({ credits, price });
      setShowPaymentForm(true);
      return;
    } catch (error) {
      console.error('Payment init failed:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent: unknown) => {
    console.log('Payment successful:', paymentIntent);
    if (selectedPlan) {
      setUserCredits(prev => {
        const next = prev + selectedPlan.credits;
        setCredits(next);
        return next;
      });
      setShowPaymentForm(false);
      setSelectedPlan(null);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const handleDownloadInvoice = (transactionId: string) => {
    console.log('Downloading invoice for:', transactionId);
    // In a real app, this would download the actual invoice
    alert(`Downloading invoice for transaction ${transactionId}`);
  };

  const handleViewDetails = (transactionId: string) => {
    console.log('Viewing details for:', transactionId);
    // In a real app, this would show transaction details
    alert(`Viewing details for transaction ${transactionId}`);
  };

  const creditPacks = [
    { name: 'Creator Pack', credits: 50, price: 2900, popular: true },
    { name: 'Professional Pack', credits: 250, price: 9900, popular: false },
    { name: 'Enterprise Pack', credits: 1000, price: 29900, popular: false }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
      
      <div className="relative z-10">
        <Navigation currentPath="/billing" />
        
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Billing & Credits
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your credits, view transaction history, and purchase more credits.
              </p>
            </motion.div>

            {/* Credit Balance */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <CreditBalance 
                balance={userCredits} 
                onAddCredits={() => setShowPaymentForm(true)}
              />
            </motion.div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="history" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>Transaction History</span>
                </TabsTrigger>
                <TabsTrigger value="purchase" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Buy Credits</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Payment Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Transaction History Tab */}
              <TabsContent value="history">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <BillingHistory
                    transactions={transactions}
                    onDownloadInvoice={handleDownloadInvoice}
                    onViewDetails={handleViewDetails}
                  />
                </motion.div>
              </TabsContent>

              {/* Buy Credits Tab */}
              <TabsContent value="purchase">
                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Credit Packs */}
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-6">Choose a Credit Pack</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {creditPacks.map((pack, index) => (
                        <motion.div
                          key={pack.name}
                          className={`relative bg-card rounded-lg border-2 p-6 ${
                            pack.popular ? 'border-blue-500 shadow-lg' : 'border-border'
                          }`}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                        >
                          {pack.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                              <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                Most Popular
                              </div>
                            </div>
                          )}
                          
                          <div className="text-center mb-6">
                            <h4 className="text-xl font-bold text-foreground mb-2">{pack.name}</h4>
                            <div className="text-3xl font-bold text-foreground mb-2">
                              ${(pack.price / 100).toFixed(2)}
                            </div>
                            <div className="text-lg text-muted-foreground">
                              {pack.credits.toLocaleString()} credits
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              ${(pack.price / pack.credits / 100).toFixed(3)} per credit
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => {
                              setSelectedPlan(pack);
                              setShowPaymentForm(true);
                            }}
                            className={`w-full ${
                              pack.popular 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-gray-900 hover:bg-gray-800 text-white'
                            }`}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Buy {pack.credits} Credits
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div className="bg-muted rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Custom Amount</h4>
                    <p className="text-muted-foreground mb-4">
                      Need a different amount? Contact us for custom credit packages.
                    </p>
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Payment Settings Tab */}
              <TabsContent value="settings">
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>
                    <p className="text-muted-foreground mb-4">
                      Manage your saved payment methods and billing information.
                    </p>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Payment Methods
                    </Button>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Billing Information</h3>
                    <p className="text-muted-foreground mb-4">
                      Update your billing address and tax information.
                    </p>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Billing Info
                    </Button>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Invoices & Receipts</h3>
                    <p className="text-muted-foreground mb-4">
                      Download past invoices and receipts for your records.
                    </p>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download All Invoices
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-card rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border border-border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Complete Purchase
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedPlan(null);
                }}
              >
                ?
              </Button>
            </div>

            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{selectedPlan.credits} Credits</span>
                <span className="text-lg font-bold">
                  ${(selectedPlan.price / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <PaymentForm
              amount={selectedPlan.price}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}