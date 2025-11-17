'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Star, Zap, Crown, DollarSign, Clock, Users, BarChart3, Shield, Headphones, Globe, Mic, CreditCard } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';
import { PricingCard } from '@/components/payment';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0); // Deprecated on pricing: credits now managed in billing

  const pricingPlans = [
    {
      name: 'Starter Pack',
      description: 'Perfect for trying out the service',
      price: 0, // Free
      credits: 20, // 2 free jobs worth of credits
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      popular: false,
      recommended: false,
      features: [
        '20 free credits (2 jobs)',
        'Up to 5 minutes per job',
        '2 languages included',
        'Basic voice quality',
        'Email support',
        '48-hour file retention'
      ],
      cta: 'Get Started Free',
      ctaLink: '/auth/signup'
    },
    {
      name: 'Creator Pack',
      description: 'Great value for regular creators',
      price: 2900, // $29.00 in cents
      credits: 50,
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      recommended: false,
      features: [
        '50 dubbing credits',
        'Up to 30 minutes per job',
        'All 12+ languages',
        'Premium voice quality',
        'Dual track support',
        'Priority processing',
        'Email & chat support',
        '7-day file retention',
        'Batch processing',
        'Custom voice settings'
      ],
      cta: 'Buy Creator Pack',
      ctaLink: null // Will use payment form
    },
    {
      name: 'Professional Pack',
      description: 'Best value for heavy users',
      price: 9900, // $99.00 in cents
      credits: 250,
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      popular: false,
      recommended: true,
      features: [
        '250 dubbing credits',
        'Up to 2 hours per job',
        'All 12+ languages',
        'Studio-grade voice quality',
        'Advanced audio processing',
        'Real-time processing',
        'Priority support',
        '30-day file retention',
        'API access',
        'Team collaboration',
        'Analytics dashboard',
        'Custom integrations'
      ],
      cta: 'Buy Professional Pack',
      ctaLink: null // Will use payment form
    }
  ];

  const handlePurchase = async (credits: number, price: number) => {
    // Redirect users to billing where the real payment form is integrated
    window.location.href = `/billing?credits=${credits}&price=${price}`;
  };

  const addOns = [
    {
      name: 'Extra Languages',
      description: 'Add more languages to your plan',
      price: '$5 per language per month',
      icon: Globe,
      features: ['Additional language support', 'Regional accent options', 'Cultural adaptation']
    },
    {
      name: 'Extended Retention',
      description: 'Keep your files longer',
      price: '$10 per month',
      icon: Clock,
      features: ['90-day file retention', 'Download history', 'Archive access']
    },
    {
      name: 'Priority Support',
      description: 'Get faster help when you need it',
      price: '$15 per month',
      icon: Shield,
      features: ['24/7 phone support', 'Dedicated account manager', 'SLA guarantees']
    }
  ];

  const faqs = [
    {
      question: 'How does the credit pack system work?',
      answer: 'You buy credit packs that never expire. Each dubbing job consumes credits based on the duration and number of languages. No monthly fees - just pay once and use your credits whenever you need them.'
    },
    {
      question: 'Do credits expire?',
      answer: 'No! Your credits never expire. Buy a pack today and use it months or even years later. Perfect for creators who work on projects sporadically.'
    },
    {
      question: 'What happens to my files after the retention period?',
      answer: 'Files are automatically deleted after the retention period for security and privacy. You can download them before deletion or extend retention with an add-on.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all credit pack purchases. If you\'re not satisfied, we\'ll refund your payment in full.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! The Starter Pack includes 2 free dubbing jobs, so you can try our service without any commitment.'
    },
    {
      question: 'Do you offer enterprise pricing?',
      answer: 'Yes, we offer custom enterprise plans for large organizations. Contact our sales team for a personalized quote.'
    }
  ];

  const savings = {
    monthly: 0,
    yearly: 0
  };

  return (
    <div className="min-h-screen relative">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-[#ff0000]/1.5 via-transparent via-transparent to-[#ff0000]/1 pointer-events-none z-0 animate-float-slow"></div>
      <div className="fixed inset-0 bg-gradient-to-tl from-transparent via-[#ff0000]/0.3 to-transparent pointer-events-none z-0 animate-drift-slow"></div>
      
      <div className="relative z-10">
        <Navigation currentPath="/pricing" />
        
        <main>
          {/* Hero Section */}
          <motion.section
            className="py-20 sm:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center relative z-10">
              <motion.div
                className="inline-flex items-center text-[#ff0000] mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <YTdubberIcon size={80} className="mx-2 sm:mx-3 sm:w-24 sm:h-24 w-20 h-20" />
              </motion.div>
              
              <motion.h1
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Simple, Transparent
                <span className="block text-[#ff0000]">Credit Pack Pricing</span>
              </motion.h1>
              
              <motion.p
                className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Buy credit packs that never expire. No subscriptions, no monthly fees. 
                Start free and scale as you grow.
              </motion.p>
              
            </div>
          </motion.section>

          {/* Credit balance UI removed from pricing. See /billing for management. */}

          {/* Pricing Plans */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {pricingPlans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    {plan.ctaLink ? (
                      // Free plan with link
                      <div className="relative bg-card border rounded-lg p-8 border-border hover:shadow-lg transition-all duration-300">
                        <div className="text-center mb-8">
                          <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4 rounded-lg`}>
                            <plan.icon className="w-8 h-8 text-white" />
                          </div>
                          
                          <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                          <p className="text-muted-foreground mb-6">{plan.description}</p>
                          
                          <div className="mb-6">
                            <div className="text-4xl font-bold text-foreground">Free</div>
                            <div className="text-lg text-muted-foreground mt-1">{plan.credits} credits</div>
                          </div>
                        </div>
                        
                        <ul className="space-y-4 mb-8">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-3">
                              <Check className="w-5 h-5 text-[#ff0000] flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <Link href={plan.ctaLink}>
                          <motion.button
                            className="w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 bg-muted text-foreground hover:bg-muted/80"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {plan.cta}
                          </motion.button>
                        </Link>
                      </div>
                    ) : (
                      // Paid plans with payment integration
                      <PricingCard
                        title={plan.name}
                        price={plan.price}
                        credits={plan.credits}
                        description={plan.description}
                        features={plan.features}
                        isPopular={plan.popular}
                        isRecommended={plan.recommended}
                        onPurchase={handlePurchase}
                        isLoading={isLoading}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Add-ons Section */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative bg-muted/30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                  Add-Ons to
                  <span className="text-[#ff0000]"> Enhance Your Plan</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                  Customize your experience with additional features and services.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {addOns.map((addon, index) => {
                  const Icon = addon.icon;
                  return (
                    <motion.div
                      key={addon.name}
                      className="bg-background border border-border p-8 hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="w-14 h-14 bg-[#ff0000]/10 flex items-center justify-center mb-6 border border-[#ff0000]/20">
                        <Icon className="w-7 h-7 text-[#ff0000]" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
                        {addon.name}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 font-light leading-relaxed">
                        {addon.description}
                      </p>
                      
                      <div className="text-2xl font-bold text-[#ff0000] mb-6">
                        {addon.price}
                      </div>
                      
                      <ul className="space-y-2">
                        {addon.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-[#ff0000] flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                  Frequently Asked
                  <span className="text-[#ff0000]"> Questions</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                  Everything you need to know about our pricing and plans.
                </p>
              </motion.div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="bg-card border border-border p-6 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="bg-gradient-to-r from-[#ff0000]/10 to-[#ff0000]/5 border border-[#ff0000]/20 p-12 rounded-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 tracking-tight">
                  Ready to Get Started?
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                  Join thousands of creators who trust YT Dubber for their multilingual content needs. 
                  Start with our free pack and buy credits that never expire.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/auth/signup">
                    <motion.button
                      className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  
                  <Link href="/contact">
                    <motion.button
                      className="inline-flex items-center space-x-3 border-2 border-[#ff0000] text-[#ff0000] px-8 py-4 text-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Users className="w-5 h-5" />
                      <span>Contact Sales</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}