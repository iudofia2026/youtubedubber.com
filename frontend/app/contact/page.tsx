'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, User, FileText, Zap, Headphones, ExternalLink } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const categories = [
    { id: 'general', name: 'General Inquiry', icon: MessageCircle },
    { id: 'technical', name: 'Technical Support', icon: Zap },
    { id: 'billing', name: 'Billing & Credits', icon: FileText },
    { id: 'feature', name: 'Feature Request', icon: Headphones },
    { id: 'bug', name: 'Bug Report', icon: AlertCircle },
    { id: 'partnership', name: 'Partnership', icon: User }
  ];

  const priorities = [
    { id: 'low', name: 'Low', description: 'General questions or feedback' },
    { id: 'medium', name: 'Medium', description: 'Standard support request' },
    { id: 'high', name: 'High', description: 'Urgent issue affecting your work' },
    { id: 'critical', name: 'Critical', description: 'Service is completely down' }
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: Mail,
      contact: 'support@ytdubber.com',
      responseTime: '24 hours',
      color: 'from-blue-500 to-cyan-500',
      isPrimary: true
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        priority: 'medium'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Seamless gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
      
      <div className="relative z-10">
        <Navigation currentPath="/contact" />
        
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
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                    Contact Us
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    We're here to help you succeed with YT Dubber
                  </p>
                </div>
              </motion.div>
              
              <motion.p
                className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Have a question, need technical support, or want to share feedback? 
                Our team is ready to assist you with any aspect of our platform.
              </motion.p>
            </div>
          </motion.section>

          {/* Contact Methods */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Get in Touch
              </h2>
              <div className="max-w-2xl mx-auto">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <motion.div
                      key={method.title}
                      className={`bg-card border-2 ${method.isPrimary ? 'border-[#ff0000] shadow-lg' : 'border-border'} rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className={`w-20 h-20 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {method.title}
                      </h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        {method.description}
                      </p>
                      <div className="space-y-3">
                        <a
                          href={`mailto:${method.contact}`}
                          className="inline-block text-2xl font-bold text-[#ff0000] hover:text-[#cc0000] transition-colors duration-200"
                        >
                          {method.contact}
                        </a>
                        <p className="text-sm text-muted-foreground">
                          Response time: {method.responseTime}
                        </p>
                        <div className="mt-6">
                          <a
                            href={`mailto:${method.contact}?subject=YT Dubber Support Request`}
                            className="inline-flex items-center space-x-2 bg-[#ff0000] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                          >
                            <Mail className="w-5 h-5" />
                            <span>Send Email</span>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Contact Form */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Send us a Message
                  </h2>
                  
                  {submitStatus === 'success' && (
                    <motion.div
                      className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 dark:text-green-200">
                        Thank you! Your message has been sent successfully. We'll get back to you soon.
                      </p>
                    </motion.div>
                  )}

                  {submitStatus === 'error' && (
                    <motion.div
                      className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-800 dark:text-red-200">
                        Sorry, there was an error sending your message. Please try again or contact us directly.
                      </p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000]/20 focus:border-[#ff0000] transition-all duration-200"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000]/20 focus:border-[#ff0000] transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000]/20 focus:border-[#ff0000] transition-all duration-200"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                          Category *
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000]/20 focus:border-[#ff0000] transition-all duration-200"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                          Priority
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000]/20 focus:border-[#ff0000] transition-all duration-200"
                        >
                          {priorities.map((priority) => (
                            <option key={priority.id} value={priority.id}>
                              {priority.name} - {priority.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000]/20 focus:border-[#ff0000] transition-all duration-200 resize-none"
                        placeholder="Please provide as much detail as possible about your inquiry..."
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#ff0000] text-white px-6 py-4 rounded-lg font-medium hover:bg-[#cc0000] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>

                {/* Contact Info */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Contact Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Email Support
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          For all inquiries and support requests
                        </p>
                        <a
                          href="mailto:support@ytdubber.com"
                          className="text-[#ff0000] hover:text-[#cc0000] font-medium text-lg"
                        >
                          support@ytdubber.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Response Time
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          We typically respond within
                        </p>
                        <p className="text-foreground font-medium">
                          24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          What We Help With
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          Technical support, billing questions, feature requests
                        </p>
                        <p className="text-foreground text-sm">
                          General inquiries and feedback
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Quick Tips
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          For faster support, include:
                        </p>
                        <ul className="text-foreground text-sm space-y-1">
                          <li>• Your account email</li>
                          <li>• Job ID (if applicable)</li>
                          <li>• Detailed description</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="mt-8 p-6 bg-card border border-border rounded-xl">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Quick Links
                    </h3>
                    <div className="space-y-3">
                      <a
                        href="/help"
                        className="flex items-center space-x-3 text-muted-foreground hover:text-[#ff0000] transition-colors duration-200"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Help Center</span>
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                      <a
                        href="/status"
                        className="flex items-center space-x-3 text-muted-foreground hover:text-[#ff0000] transition-colors duration-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>System Status</span>
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                      <a
                        href="/pricing"
                        className="flex items-center space-x-3 text-muted-foreground hover:text-[#ff0000] transition-colors duration-200"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Pricing Plans</span>
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}