'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Shield, Lock, Eye, Database, Mail, UserX, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-white/60 text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-white/80 leading-relaxed">
          
          {/* Introduction */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to Your Privacy</h2>
            <p className="mb-4">
              At Rivernova, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our education consulting platform. We are committed to transparency and protecting your personal data in compliance with GDPR, CCPA, and other applicable privacy laws.
            </p>
            <p className="text-white/60 text-sm">
              By using Rivernova, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            </div>
            
            <div className="space-y-4 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">1.1 Personal Information You Provide</h3>
                <p className="mb-3">When you create an account or use our services, we collect:</p>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li><strong className="text-white">Account Information:</strong> Full name, email address, password (encrypted)</li>
                  <li><strong className="text-white">Academic Information:</strong> GPA, test scores, major, current school, graduation date</li>
                  <li><strong className="text-white">Career Goals:</strong> Intended career field, dream job, professional aspirations</li>
                  <li><strong className="text-white">Financial Information:</strong> Budget preferences for education (no payment card data stored by us)</li>
                  <li><strong className="text-white">Location Preferences:</strong> Preferred countries and regions for study</li>
                  <li><strong className="text-white">Communications:</strong> Messages you send through our AI advisor or support system</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">1.2 Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, time spent, search queries</li>
                  <li><strong className="text-white">Device Information:</strong> Browser type, operating system, device identifiers</li>
                  <li><strong className="text-white">Log Data:</strong> IP address, access times, referring URLs</li>
                  <li><strong className="text-white">Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">1.3 Information from Third Parties</h3>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li><strong className="text-white">Authentication Providers:</strong> If you sign in with Google or other OAuth providers</li>
                  <li><strong className="text-white">Payment Processors:</strong> Transaction data from Stripe (we never see your full card number)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Provide Services:</strong> Match you with schools, generate AI recommendations, facilitate applications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Personalization:</strong> Customize your experience based on your profile and preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Communication:</strong> Send you service updates, match notifications, and educational content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Analytics:</strong> Understand how users interact with our platform to improve services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Security:</strong> Detect and prevent fraud, abuse, and security incidents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Legal Compliance:</strong> Comply with legal obligations and enforce our terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Research:</strong> Aggregate anonymized data to improve education outcomes (with your consent)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  What We DON&apos;T Do
                </h3>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>We never sell your personal data to third parties</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>We never share your data with schools without your explicit consent</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>We never accept commissions that would bias our recommendations</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">3. How We Share Your Information</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <p className="text-white/70 mb-4">We may share your information only in the following circumstances:</p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">Service Providers</h3>
                  <p className="text-white/70">We use trusted third-party services to operate our platform:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-white/60 text-sm">
                    <li>Supabase (database hosting and authentication)</li>
                    <li>Anthropic (AI-powered recommendations via Claude)</li>
                    <li>Perplexity (school research and data)</li>
                    <li>Stripe (payment processing)</li>
                    <li>Resend (transactional emails)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">With Your Consent</h3>
                  <p className="text-white/70">We will share your information with schools or other parties only when you explicitly authorize us to do so.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">Legal Requirements</h3>
                  <p className="text-white/70">We may disclose your information if required by law, court order, or government request.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">Business Transfers</h3>
                  <p className="text-white/70">If Rivernova is acquired or merged, your information may be transferred to the new entity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserX className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">4. Your Privacy Rights</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <p className="text-white/70 mb-4">Depending on your location, you have the following rights:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-2">Access</h3>
                  <p className="text-white/70 text-sm">Request a copy of all personal data we hold about you</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-2">Correction</h3>
                  <p className="text-white/70 text-sm">Update or correct inaccurate information</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-2">Deletion</h3>
                  <p className="text-white/70 text-sm">Request deletion of your personal data (right to be forgotten)</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-2">Portability</h3>
                  <p className="text-white/70 text-sm">Export your data in a machine-readable format</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-2">Opt-Out</h3>
                  <p className="text-white/70 text-sm">Unsubscribe from marketing communications</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-2">Restrict Processing</h3>
                  <p className="text-white/70 text-sm">Limit how we use your data</p>
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 mt-4">
                <h3 className="text-indigo-400 font-bold mb-2">How to Exercise Your Rights</h3>
                <p className="text-white/70 mb-3">To exercise any of these rights, contact us at:</p>
                <ul className="space-y-2 text-white/70">
                  <li>Email: <a href="mailto:privacy@rivernova.com" className="text-indigo-400 hover:underline">privacy@rivernova.com</a></li>
                  <li>Or visit your Privacy Settings page in your dashboard</li>
                </ul>
                <p className="text-white/60 text-sm mt-3">We will respond to your request within 30 days.</p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">5. Data Security</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <p className="text-white/70 mb-4">We implement industry-standard security measures to protect your data:</p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong className="text-white">Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong className="text-white">Access Controls:</strong> Strict role-based access to your data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong className="text-white">Regular Audits:</strong> Security assessments and penetration testing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong className="text-white">Secure Infrastructure:</strong> Hosted on SOC 2 compliant servers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong className="text-white">Monitoring:</strong> 24/7 security monitoring and incident response</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <p className="text-white/70">
                  <strong className="text-amber-400">Important:</strong> No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. Please use a strong password and enable two-factor authentication.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">6. Contact Us</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
                <p className="text-white/70 mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-white/70">
                  <p><strong className="text-white">Email:</strong> <a href="mailto:privacy@rivernova.com" className="text-indigo-400 hover:underline">privacy@rivernova.com</a></p>
                  <p><strong className="text-white">Data Protection Officer:</strong> <a href="mailto:dpo@rivernova.com" className="text-indigo-400 hover:underline">dpo@rivernova.com</a></p>
                </div>
                <p className="text-white/60 text-sm mt-4">
                  For EU residents: You have the right to lodge a complaint with your local data protection authority.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 bg-[#09090b]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Rivernova</span>
            <span className="text-white/40 text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:privacy@rivernova.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
