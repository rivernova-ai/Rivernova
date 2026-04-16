'use client';

import { Navbar } from '@/components/layout/Navbar';
import { FileText, AlertCircle, CheckCircle2, XCircle, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-white/60 text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-white/80 leading-relaxed">
          
          {/* Introduction */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p className="mb-4">
              Welcome to Rivernova. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website, platform, and services (collectively, the &quot;Services&quot;). By accessing or using Rivernova, you agree to be bound by these Terms.
            </p>
            <p className="text-white/60 text-sm">
              If you do not agree to these Terms, you may not access or use our Services. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">1. Eligibility</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-white/70 mb-3">To use Rivernova, you must:</p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Be at least 16 years of age</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Have the legal capacity to enter into a binding contract</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Not be prohibited from using our Services under applicable law</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Provide accurate and complete information during registration</span>
                  </li>
                </ul>
                <p className="text-white/60 text-sm mt-4">
                  If you are under 18, you represent that you have your parent or guardian&apos;s permission to use the Services.
                </p>
              </div>
            </div>
          </section>

          {/* Account Registration */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">2. Account Registration and Security</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">2.1 Account Creation</h3>
                  <p className="text-white/70">You must create an account to access certain features. You agree to provide accurate, current, and complete information and to update it as necessary.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">2.2 Account Security</h3>
                  <p className="text-white/70 mb-2">You are responsible for:</p>
                  <ul className="space-y-1 text-white/70 text-sm">
                    <li>• Maintaining the confidentiality of your password</li>
                    <li>• All activities that occur under your account</li>
                    <li>• Notifying us immediately of any unauthorized access</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">2.3 Account Termination</h3>
                  <p className="text-white/70">We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or illegal activity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Services Description */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">3. Description of Services</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-white/70 mb-3">Rivernova provides:</p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">AI-Powered School Matching:</strong> Personalized recommendations based on your profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Education Consulting:</strong> Guidance on school selection and applications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">AI Advisor:</strong> Conversational assistance for education planning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✓</span>
                    <span><strong className="text-white">Transparency Tools:</strong> Commission-free verification and unbiased recommendations</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Important Disclaimer
                </h3>
                <p className="text-white/70 text-sm">
                  Rivernova provides educational guidance and recommendations, but we do not guarantee admission to any institution. Final admission decisions are made solely by the educational institutions. Our AI-powered recommendations are based on available data and should be used as one factor in your decision-making process.
                </p>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">4. User Responsibilities and Conduct</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-3">You agree NOT to:</h3>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Provide false or misleading information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Use the Services for any illegal purpose</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Attempt to gain unauthorized access to our systems</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Scrape, copy, or reverse engineer our platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Abuse or spam our AI services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Share your account credentials with others</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Harass, threaten, or harm other users</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 mt-1">✗</span>
                    <span>Upload viruses, malware, or malicious code</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">5. Payment and Subscription Terms</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">5.1 Pricing</h3>
                  <p className="text-white/70">Certain features require a paid subscription. Prices are displayed on our website and may change with notice.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">5.2 Payment Processing</h3>
                  <p className="text-white/70">Payments are processed securely through Stripe. We do not store your full payment card information.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">5.3 Subscriptions</h3>
                  <p className="text-white/70 mb-2">Subscriptions automatically renew unless cancelled. You may cancel at any time through your account settings.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">5.4 Refunds</h3>
                  <p className="text-white/70">Refunds are provided on a case-by-case basis. Contact support@rivernova.com within 14 days of purchase to request a refund.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">5.5 Free Trial</h3>
                  <p className="text-white/70">If we offer a free trial, you will be charged when the trial ends unless you cancel before the trial period expires.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">6. Intellectual Property Rights</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">6.1 Our Content</h3>
                  <p className="text-white/70">All content, features, and functionality of Rivernova (including text, graphics, logos, software, and AI models) are owned by Rivernova and protected by copyright, trademark, and other intellectual property laws.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">6.2 Your Content</h3>
                  <p className="text-white/70">You retain ownership of any content you submit. By using our Services, you grant us a license to use, store, and process your content to provide the Services.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">6.3 Feedback</h3>
                  <p className="text-white/70">If you provide feedback or suggestions, we may use them without obligation to you.</p>
                </div>
              </div>
            </div>
          </section>

          {/* AI Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">7. AI Services Disclaimer</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <p className="text-white/70 mb-3">
                  Our AI-powered recommendations and advisor are provided for informational purposes only. While we strive for accuracy:
                </p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 mt-1">⚠</span>
                    <span>AI can make mistakes and provide inaccurate information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 mt-1">⚠</span>
                    <span>You should verify all information independently</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 mt-1">⚠</span>
                    <span>AI recommendations are not guarantees of admission or success</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 mt-1">⚠</span>
                    <span>We are not liable for decisions made based on AI recommendations</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">8. Limitation of Liability</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-white/70 mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, RIVERNOVA SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="space-y-2 text-white/70">
                  <li>• Indirect, incidental, special, or consequential damages</li>
                  <li>• Loss of profits, data, or business opportunities</li>
                  <li>• Damages resulting from admission decisions by educational institutions</li>
                  <li>• Errors or inaccuracies in AI-generated content</li>
                  <li>• Service interruptions or technical issues</li>
                  <li>• Third-party actions or content</li>
                </ul>
                <p className="text-white/70 mt-4">
                  Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
                </p>
              </div>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">9. Indemnification</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-white/70">
                  You agree to indemnify and hold harmless Rivernova, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:
                </p>
                <ul className="space-y-2 text-white/70 mt-3">
                  <li>• Your use of the Services</li>
                  <li>• Your violation of these Terms</li>
                  <li>• Your violation of any third-party rights</li>
                  <li>• Any content you submit or share</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">10. Termination</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">10.1 By You</h3>
                  <p className="text-white/70">You may terminate your account at any time through your account settings or by contacting us.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">10.2 By Us</h3>
                  <p className="text-white/70">We may suspend or terminate your access immediately if you violate these Terms, without notice or liability.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">10.3 Effect of Termination</h3>
                  <p className="text-white/70">Upon termination, your right to use the Services ceases immediately. We may delete your data in accordance with our Privacy Policy.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">11. Governing Law and Disputes</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">11.1 Governing Law</h3>
                  <p className="text-white/70">These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">11.2 Dispute Resolution</h3>
                  <p className="text-white/70">Any disputes shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization], except where prohibited by law.</p>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-2">11.3 Class Action Waiver</h3>
                  <p className="text-white/70">You agree to resolve disputes on an individual basis and waive the right to participate in class actions.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">12. Changes to These Terms</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-white/70">
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through a notice on our platform. Your continued use after changes constitutes acceptance of the modified Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">13. Contact Information</h2>
            </div>
            
            <div className="space-y-3 ml-9">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
                <p className="text-white/70 mb-4">
                  For questions about these Terms, please contact us:
                </p>
                <div className="space-y-2 text-white/70">
                  <p><strong className="text-white">Email:</strong> <a href="mailto:legal@rivernova.com" className="text-indigo-400 hover:underline">legal@rivernova.com</a></p>
                  <p><strong className="text-white">Support:</strong> <a href="mailto:support@rivernova.com" className="text-indigo-400 hover:underline">support@rivernova.com</a></p>
                </div>
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
            <a href="mailto:legal@rivernova.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
