'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Shield, Settings, BarChart3, Target, Database, Eye, Lock, ExternalLink } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

export default function CookiePolicy() {
  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      icon: Lock,
      color: 'from-red-500 to-pink-500',
      examples: [
        'Authentication cookies to keep you logged in',
        'Security cookies to protect against fraud',
        'Load balancing cookies for website performance',
        'Session cookies to remember your preferences'
      ],
      required: true
    },
    {
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      examples: [
        'Google Analytics to track page views and user behavior',
        'Performance monitoring to improve website speed',
        'Error tracking to identify and fix issues',
        'Usage statistics to understand feature adoption'
      ],
      required: false
    },
    {
      name: 'Functional Cookies',
      description: 'These cookies enable enhanced functionality and personalization.',
      icon: Settings,
      color: 'from-green-500 to-emerald-500',
      examples: [
        'Theme preferences (light/dark mode)',
        'Language selection and regional settings',
        'User interface customizations',
        'Remembered form data and preferences'
      ],
      required: false
    },
    {
      name: 'Marketing Cookies',
      description: 'These cookies are used to deliver relevant advertisements and marketing content.',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      examples: [
        'Social media integration and sharing buttons',
        'Advertising platform cookies (Google Ads, Facebook)',
        'Retargeting cookies for personalized ads',
        'Conversion tracking for marketing campaigns'
      ],
      required: false
    }
  ];

  const cookieDetails = [
    {
      name: 'ytdubber_session',
      purpose: 'Essential',
      description: 'Maintains your login session and authentication state',
      duration: 'Session',
      data: 'User ID, session token, authentication status'
    },
    {
      name: 'ytdubber_theme',
      purpose: 'Functional',
      description: 'Remembers your theme preference (light/dark mode)',
      duration: '1 year',
      data: 'Theme selection (light/dark)'
    },
    {
      name: 'ytdubber_language',
      purpose: 'Functional',
      description: 'Stores your preferred language setting',
      duration: '1 year',
      data: 'Language code (en, es, fr, etc.)'
    },
    {
      name: '_ga',
      purpose: 'Analytics',
      description: 'Google Analytics cookie to distinguish users',
      duration: '2 years',
      data: 'Anonymous user identifier, page views, session data'
    },
    {
      name: '_gid',
      purpose: 'Analytics',
      description: 'Google Analytics cookie to distinguish users',
      duration: '24 hours',
      data: 'Anonymous user identifier, session data'
    },
    {
      name: 'ytdubber_consent',
      purpose: 'Essential',
      description: 'Remembers your cookie consent preferences',
      duration: '1 year',
      data: 'Consent status for each cookie category'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Seamless gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
      
      <div className="relative z-10">
        <Navigation currentPath="/legal/cookies" />
        
        <main>
          {/* Hero Section */}
          <motion.section
            className="py-12 sm:py-20 relative overflow-hidden px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="flex items-center justify-center mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-2xl flex items-center justify-center mr-4">
                  <Cookie className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                    Cookie Policy
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    How we use cookies and similar technologies
                  </p>
                </div>
              </motion.div>
              
              <motion.p
                className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                This Cookie Policy explains how YT Dubber uses cookies and similar technologies 
                when you visit our website. We use cookies to enhance your experience, analyze 
                usage patterns, and provide personalized content.
              </motion.p>
            </div>
          </motion.section>

          {/* What Are Cookies Section */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                What Are Cookies?
              </h2>
              <div className="bg-card border border-border rounded-xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Understanding Cookies
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Cookies are small text files that are stored on your device when you visit a website. 
                      They help websites remember information about your visit, such as your preferred language 
                      and other settings. This can make your next visit easier and the site more useful to you.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Cookies can be &quot;persistent&quot; (stored on your device until they expire or you delete them) 
                      or &quot;session&quot; cookies (stored only during your current browsing session).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cookie Types Section */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Types of Cookies We Use
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cookieTypes.map((type, index) => {
                  const Icon = type.icon;
                  return (
                    <motion.div
                      key={type.name}
                      className="bg-card border border-border rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {type.name}
                            </h3>
                            {type.required && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs font-medium rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {type.description}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">
                          Examples:
                        </h4>
                        <ul className="space-y-1">
                          {type.examples.map((example, exampleIndex) => (
                            <li key={exampleIndex} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <span className="text-[#ff0000] mt-1">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Cookie Details Table */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Specific Cookies We Use
              </h2>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Cookie Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Purpose
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Duration
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Data Stored
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cookieDetails.map((cookie, index) => (
                        <motion.tr
                          key={cookie.name}
                          className="hover:bg-muted/30 transition-colors duration-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 1.4 + index * 0.05 }}
                        >
                          <td className="px-6 py-4 text-sm font-mono text-foreground">
                            {cookie.name}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cookie.purpose === 'Essential' 
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-600'
                                : cookie.purpose === 'Analytics'
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                                : 'bg-green-100 dark:bg-green-900/20 text-green-600'
                            }`}>
                              {cookie.purpose}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {cookie.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {cookie.duration}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {cookie.data}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cookie Management Section */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Managing Your Cookie Preferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Browser Settings
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    You can control and delete cookies through your browser settings. 
                    Most browsers allow you to refuse cookies or delete them.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Chrome: Settings → Privacy and security → Cookies</li>
                    <li>• Firefox: Options → Privacy & Security → Cookies</li>
                    <li>• Safari: Preferences → Privacy → Manage Website Data</li>
                    <li>• Edge: Settings → Cookies and site permissions</li>
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Our Cookie Banner
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    When you first visit our website, you&apos;ll see a cookie consent banner 
                    where you can choose which types of cookies to accept.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can change your preferences at any time by clicking the 
                    &quot;Cookie Settings&quot; link in our footer.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Third-Party Cookies Section */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Third-Party Cookies
              </h2>
              <div className="bg-card border border-border rounded-xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      External Services
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We use third-party services that may set their own cookies. These include:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>Google Analytics</strong> - Website analytics and performance monitoring</li>
                      <li>• <strong>Google Fonts</strong> - Font delivery service</li>
                      <li>• <strong>Supabase</strong> - Authentication and database services</li>
                      <li>• <strong>Vercel</strong> - Website hosting and performance optimization</li>
                    </ul>
                    <p className="text-muted-foreground mt-4 text-sm">
                      These services have their own privacy policies and cookie practices. 
                      We recommend reviewing their policies for more information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#ff0000]/5 to-[#ff0000]/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Questions About Cookies?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                If you have any questions about our use of cookies, please contact us
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:privacy@ytdubber.com"
                  className="inline-flex items-center space-x-2 bg-[#ff0000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                >
                  <Shield className="w-5 h-5" />
                  <span>Contact Privacy Team</span>
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center space-x-2 border-2 border-[#ff0000] text-[#ff0000] px-6 py-3 rounded-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                >
                  <span>General Support</span>
                </a>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}