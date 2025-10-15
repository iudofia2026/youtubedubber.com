'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, HelpCircle, BookOpen, MessageCircle, Video, FileText, Zap, Globe, Mic, Download, AlertCircle, CheckCircle, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen, count: 0 },
    { id: 'getting-started', name: 'Getting Started', icon: Zap, count: 8 },
    { id: 'audio-upload', name: 'Audio Upload', icon: Mic, count: 6 },
    { id: 'languages', name: 'Languages', icon: Globe, count: 5 },
    { id: 'processing', name: 'Processing', icon: Clock, count: 7 },
    { id: 'download', name: 'Download', icon: Download, count: 4 },
    { id: 'billing', name: 'Billing', icon: FileText, count: 3 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertCircle, count: 9 },
  ];

  const faqData = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with YT Dubber?',
      answer: 'Getting started is easy! First, create an account and verify your email. Then, upload your voice and background audio tracks, select your target languages, and let our AI create professional-quality dubs. You can start with our free 2-job trial to test the service.',
      tags: ['getting-started', 'account', 'trial']
    },
    {
      id: 2,
      category: 'audio-upload',
      question: 'What audio and video formats are supported?',
      answer: 'We support all major audio formats including MP3, WAV, M4A, FLAC, and AAC, plus MP4 video files. For best results, we recommend using WAV or high-quality MP3 files. Video files will have their audio automatically extracted. The maximum file size is 100MB per track, and we support stereo and mono audio.',
      tags: ['audio', 'video', 'formats', 'upload']
    },
    {
      id: 3,
      category: 'audio-upload',
      question: 'Can I upload MP4 video files directly?',
      answer: 'Yes! You can upload MP4 video files directly and our system will automatically extract the audio for processing. This is perfect if you haven\'t separated your audio tracks yet. We\'ll extract the audio and process it just like any other audio file.',
      tags: ['video', 'mp4', 'upload', 'extraction']
    },
    {
      id: 4,
      category: 'audio-upload',
      question: 'How should I prepare my audio tracks?',
      answer: 'For optimal results, split your video audio into separate voice and background tracks. The voice track should contain only speech (no music or sound effects), while the background track should contain music and sound effects. This separation allows our AI to create more natural-sounding dubs.',
      tags: ['audio', 'preparation', 'tracks']
    },
    {
      id: 5,
      category: 'languages',
      question: 'Which languages are supported?',
      answer: 'We currently support 12+ languages including English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese (Mandarin), Arabic, Hindi, and Russian. We\'re constantly adding new languages based on user demand.',
      tags: ['languages', 'supported', 'multilingual']
    },
    {
      id: 6,
      category: 'processing',
      question: 'How long does processing take?',
      answer: 'Processing time depends on the length of your audio and the number of languages selected. Typically, a 5-minute audio file takes 2-5 minutes to process for a single language. Multiple languages are processed in parallel, so the total time doesn\'t increase significantly.',
      tags: ['processing', 'time', 'duration']
    },
    {
      id: 7,
      category: 'processing',
      question: 'Can I track the progress of my dubbing job?',
      answer: 'Yes! You can track your job progress in real-time from the Jobs page. You\'ll see the current status (Pending, Processing, Complete, or Error) and detailed progress for each language. We also send email notifications when your job is complete.',
      tags: ['processing', 'tracking', 'progress']
    },
    {
      id: 8,
      category: 'download',
      question: 'What files will I receive?',
      answer: 'You\'ll receive separate voice tracks for each language, full mixed audio (voice + background), and optional subtitle files. All files are provided in high-quality MP3 format, and you can also download the original WAV files for professional use.',
      tags: ['download', 'files', 'formats']
    },
    {
      id: 9,
      category: 'billing',
      question: 'How does the credit system work?',
      answer: 'Our credit system is simple and transparent. Each dubbing job costs 1 credit regardless of length or number of languages. Credits never expire, so you can buy them in advance and use them whenever you need. We offer Starter (2 free), Creator (50 credits for $29), and Professional (250 credits for $99) packs.',
      tags: ['billing', 'credits', 'pricing']
    },
    {
      id: 10,
      category: 'troubleshooting',
      question: 'My audio quality is poor. What can I do?',
      answer: 'Poor audio quality usually comes from the source material. Ensure your original audio is clear, has minimal background noise, and the speaker\'s voice is prominent. Avoid audio with heavy reverb or echo. If you\'re still having issues, try using our audio enhancement features or contact support for personalized help.',
      tags: ['troubleshooting', 'quality', 'audio']
    },
    {
      id: 11,
      category: 'troubleshooting',
      question: 'The dubbing doesn\'t sound natural. How can I improve it?',
      answer: 'Natural-sounding dubs depend on several factors: clear source audio, proper language selection, and good pronunciation. Make sure your voice track is clean and the speaker speaks clearly. You can also try different voice settings or contact our support team for optimization tips specific to your content.',
      tags: ['troubleshooting', 'quality', 'natural']
    }
  ];

  const filteredFaqs = useMemo(() => {
    let filtered = faqData;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const quickActions = [
    {
      title: 'Start Your First Dub',
      description: 'Upload your audio and create multilingual content',
      icon: Video,
      href: '/new',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'View Your Jobs',
      description: 'Track progress and download completed dubs',
      icon: Clock,
      href: '/jobs',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Contact Support',
      description: 'Get personalized help from our team',
      icon: MessageCircle,
      href: '/contact',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Check System Status',
      description: 'View current service status and uptime',
      icon: CheckCircle,
      href: '/status',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Seamless gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
      
      <div className="relative z-10">
        <Navigation currentPath="/help" />
        
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
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                    Help Center
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    Everything you need to know about YT Dubber
                  </p>
                </div>
              </motion.div>
              
              {/* Search Bar */}
              <motion.div
                className="relative max-w-2xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for help articles, guides, and FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000]/20 focus:border-[#ff0000] transition-all duration-200"
                  />
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Quick Actions */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.a
                      key={action.title}
                      href={action.href}
                      className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-[#ff0000]/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#ff0000] transition-colors duration-200">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-[#ff0000] text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                        <span>Get started</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Categories */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Browse by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {categories.map((category, index) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#ff0000] text-white border-[#ff0000] shadow-lg'
                          : 'bg-card text-foreground border-border hover:border-[#ff0000]/50 hover:shadow-md'
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 1.0 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-[#ff0000]'}`} />
                      <div className="text-sm font-medium text-center">{category.name}</div>
                      {category.count > 0 && (
                        <div className={`text-xs mt-1 text-center ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {category.count} articles
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + index * 0.05 }}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                    >
                      <h3 className="text-lg font-semibold text-foreground pr-4">
                        {faq.question}
                      </h3>
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-[#ff0000] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {faq.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-[#ff0000]/10 text-[#ff0000] text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {filteredFaqs.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or browse by category
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-[#ff0000] hover:text-[#cc0000] font-medium"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Contact CTA */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#ff0000]/5 to-[#ff0000]/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Still need help?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our support team is here to help you get the most out of YT Dubber
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center space-x-2 bg-[#ff0000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contact Support</span>
                </a>
                <a
                  href="mailto:support@ytdubber.com"
                  className="inline-flex items-center space-x-2 border-2 border-[#ff0000] text-[#ff0000] px-6 py-3 rounded-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                >
                  <span>Email Us</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}