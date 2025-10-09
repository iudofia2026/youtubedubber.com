'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Star, Zap, Crown, DollarSign, Clock, Users, BarChart3, Shield, Headphones, Globe, Mic } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect for individual creators getting started',
      price: { monthly: 0, yearly: 0 },
      originalPrice: null,
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      popular: false,
      features: [
        '2 free dubbing jobs per month',
        'Up to 5 minutes per job',
        '2 languages included',
        'Basic voice quality',
        'Email support',
        '48-hour file retention'
      ],
      limitations: [
        'Limited to 2 jobs per month',
        'No background track support',
        'Basic processing speed'
      ],
      cta: 'Get Started Free',
      ctaLink: '/auth/signup'
    },
    {
      name: 'Creator',
      description: 'Ideal for active content creators and YouTubers',
      price: { monthly: 29, yearly: 290 },
      originalPrice: { monthly: 29, yearly: 348 },
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        '50 dubbing jobs per month',
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
      limitations: [],
      cta: 'Start Creator Plan',
      ctaLink: '/auth/signup?plan=creator'
    },
    {
      name: 'Professional',
      description: 'For businesses and professional content teams',
      price: { monthly: 99, yearly: 990 },
      originalPrice: { monthly: 99, yearly: 1188 },
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      popular: false,
      features: [
        'Unlimited dubbing jobs',
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
      limitations: [],
      cta: 'Start Professional',
      ctaLink: '/auth/signup?plan=professional'
    }
  ];

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
      question: 'How does the pay-per-use model work?',
      answer: 'You only pay for what you use. Each dubbing job consumes credits based on the duration and number of languages. No monthly fees unless you choose a plan.'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.'
    },
    {
      question: 'What happens to my files after the retention period?',
      answer: 'Files are automatically deleted after the retention period for security and privacy. You can download them before deletion or extend retention with an add-on.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, we\'ll refund your payment in full.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! The Starter plan includes 2 free dubbing jobs per month, so you can try our service without any commitment.'
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

  pricingPlans.forEach(plan => {
    if (plan.originalPrice) {
      savings.monthly += plan.originalPrice.monthly - plan.price.monthly;
      savings.yearly += plan.originalPrice.yearly - plan.price.yearly;
    }
  });

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
                <span className="block text-[#ff0000]">Pricing</span>
              </motion.h1>
              
              <motion.p
                className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Choose the plan that fits your needs. No hidden fees, no surprises. 
                Start free and scale as you grow.
              </motion.p>
              
              {/* Billing Toggle */}
              <motion.div
                className="flex items-center justify-center space-x-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:ring-offset-2"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Yearly
                </span>
                {billingCycle === 'yearly' && (
                  <span className="bg-[#ff0000] text-white text-xs px-2 py-1 rounded-full font-medium">
                    Save 17%
                  </span>
                )}
              </motion.div>
            </div>
          </motion.section>

          {/* Pricing Plans */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan, index) => {
                  const Icon = plan.icon;
                  const isPopular = plan.popular;
                  
                  return (
                    <motion.div
                      key={plan.name}
                      className={`relative bg-card border rounded-lg p-8 ${
                        isPopular 
                          ? 'border-[#ff0000] shadow-lg scale-105' 
                          : 'border-border hover:shadow-lg'
                      } transition-all duration-300`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-[#ff0000] text-white text-sm font-medium px-4 py-2 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-8">
                        <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4 rounded-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                        <p className="text-muted-foreground mb-6">{plan.description}</p>
                        
                        <div className="mb-6">
                          {plan.price.monthly === 0 ? (
                            <div className="text-4xl font-bold text-foreground">Free</div>
                          ) : (
                            <div className="flex items-baseline justify-center">
                              <span className="text-4xl font-bold text-foreground">
                                ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                /{billingCycle === 'monthly' ? 'month' : 'year'}
                              </span>
                            </div>
                          )}
                          
                          {plan.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through mt-1">
                              ${billingCycle === 'monthly' ? plan.originalPrice.monthly : plan.originalPrice.yearly}
                              /{billingCycle === 'monthly' ? 'month' : 'year'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-[#ff0000] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{feature}</span>
                          </li>
                        ))}
                        
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start space-x-3">
                            <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Link href={plan.ctaLink}>
                        <motion.button
                          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                            isPopular
                              ? 'bg-[#ff0000] text-white hover:bg-[#cc0000]'
                              : 'bg-muted text-foreground hover:bg-muted/80'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {plan.cta}
                        </motion.button>
                      </Link>
                    </motion.div>
                  );
                })}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  Start with our free plan today.
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