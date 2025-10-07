'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/legal/terms" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#ff0000]/10 flex items-center justify-center rounded-lg">
              <FileText className="w-6 h-6 text-[#ff0000]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Terms of Service
              </h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="prose prose-lg max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-6">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to YT Dubber (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of our 
                AI-powered multilingual dubbing platform and services (collectively, the &quot;Service&quot;) operated by YT Dubber.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part 
                of these terms, then you may not access the Service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By creating an account, uploading content, or using any part of our Service, you acknowledge that you 
                have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                YT Dubber provides AI-powered multilingual dubbing services that allow users to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Upload voice and background audio tracks</li>
                <li>Select target languages for dubbing</li>
                <li>Receive AI-generated multilingual audio content</li>
                <li>Download processed audio files in various formats</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                To use our Service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            {/* Content and Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">5.1 Your Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of all content you upload to our Service. By uploading content, you grant us a 
                limited, non-exclusive license to process, store, and deliver your content as necessary to provide our Service.
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">5.2 AI-Generated Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-generated dubbing content created using our Service is provided to you for your use. You are responsible 
                for ensuring your use of such content complies with applicable laws and third-party rights.
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">5.3 Our Intellectual Property</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Service, including its design, functionality, and underlying technology, is owned by YT Dubber and 
                protected by intellectual property laws.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to use our Service to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Upload content that violates any laws or regulations</li>
                <li>Upload content that infringes on third-party intellectual property rights</li>
                <li>Upload content that is defamatory, offensive, or harmful</li>
                <li>Attempt to reverse engineer or compromise our systems</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the Service or servers</li>
              </ul>
            </section>

            {/* Payment and Billing */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Payment and Billing</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service may include paid features. By using paid features, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Pay all applicable fees as described in our pricing</li>
                <li>Provide accurate billing information</li>
                <li>Authorize us to charge your payment method</li>
                <li>Understand that fees are non-refundable unless otherwise stated</li>
              </ul>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy and Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, 
                and protect your information. By using our Service, you consent to the collection and use of information 
                as described in our Privacy Policy.
              </p>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to provide reliable service but cannot guarantee uninterrupted access. We may temporarily 
                suspend or modify the Service for maintenance, updates, or other reasons. We are not liable for any 
                downtime or service interruptions.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, YT Dubber shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, data, or 
                use, arising from your use of the Service.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for any reason, including if you breach these Terms. Upon termination, your right to use the Service 
                will cease immediately.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                via email or through the Service. Your continued use of the Service after such modifications constitutes 
                acceptance of the updated Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States, 
                without regard to conflict of law principles.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> legal@ytdubber.com<br />
                  <strong>Website:</strong> https://ytdubber.com
                </p>
              </div>
            </section>

          </div>
        </motion.div>
      </main>
    </div>
  );
}