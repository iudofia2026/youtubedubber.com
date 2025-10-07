'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { ArrowLeft, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/legal/privacy" />
      
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
              <Shield className="w-6 h-6 text-[#ff0000]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Privacy Policy
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
                At YT Dubber (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
                our AI-powered multilingual dubbing platform and services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By using our Service, you consent to the data practices described in this Privacy Policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">2.1 Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect personal information that you voluntarily provide to us, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Name and email address when you create an account</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">2.2 Audio Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                We process the audio files you upload to our Service, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Voice tracks for dubbing</li>
                <li>Background audio tracks</li>
                <li>Generated dubbed content</li>
                <li>Audio metadata (duration, format, etc.)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">2.3 Usage Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect certain information about your use of our Service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Pages visited and features used</li>
                <li>Time and date of access</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Provide and maintain our dubbing services</li>
                <li>Process your audio files and generate dubbed content</li>
                <li>Manage your account and process payments</li>
                <li>Communicate with you about your account and our services</li>
                <li>Improve our Service and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* AI Processing and Data Handling */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. AI Processing and Data Handling</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">4.1 Audio Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your audio files are processed using AI technology to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Extract speech content and convert to text</li>
                <li>Translate text to target languages</li>
                <li>Generate AI voice dubbing in target languages</li>
                <li>Mix generated voice with background audio</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">4.2 Data Retention</h3>
              <p className="text-muted-foreground leading-relaxed">
                We retain your audio files and generated content for a limited period to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Allow you to download your processed content</li>
                <li>Provide customer support and troubleshooting</li>
                <li>Improve our AI models (with your consent)</li>
                <li>Comply with legal requirements</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Default retention period:</strong> 48 hours after job completion, unless you request longer storage.
              </p>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">5.1 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share information with trusted third-party service providers who assist us in:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>AI processing and cloud computing</li>
                <li>Payment processing</li>
                <li>Email communications</li>
                <li>Data storage and security</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">5.2 Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose information if required by law or to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights and property</li>
                <li>Ensure user safety and prevent fraud</li>
                <li>Enforce our Terms of Service</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and updates</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Export your data in a structured format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@ytdubber.com.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our Service</li>
                <li>Provide personalized content and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookie settings through your browser preferences, but disabling cookies may affect 
                the functionality of our Service.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure 
                appropriate safeguards are in place to protect your information in accordance with this Privacy Policy 
                and applicable data protection laws.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If we become aware that we have collected personal information 
                from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>Posting the updated Privacy Policy on our website</li>
                <li>Sending you an email notification</li>
                <li>Displaying a notice in our Service</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Your continued use of our Service after any changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> privacy@ytdubber.com<br />
                  <strong>Website:</strong> https://ytdubber.com<br />
                  <strong>Address:</strong> [Your Business Address]
                </p>
              </div>
            </section>

            {/* Data Protection Officer */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Data Protection Officer</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related concerns or to exercise your data protection rights, you may contact our 
                Data Protection Officer at dpo@ytdubber.com.
              </p>
            </section>

          </div>
        </motion.div>
      </main>
    </div>
  );
}