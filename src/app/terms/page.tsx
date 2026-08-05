'use client';

import { Navbar } from '@/components/layout/Navbar';
import { FileText, AlertCircle, CheckCircle2, XCircle, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen" style={{ background: '#F5EDE5' }}>
      <Navbar />

      <div className="pt-32 pb-20 px-6 max-w-[900px] mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white" style={{ color: '#1C0A0C' }}>Terms of Service</h1>
          </div>
          <p className="text-base font-light mt-4" style={{ color: 'rgba(28,10,12,0.45)' }}>
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10">

          {/* Introduction */}
          <section className="rounded-2xl p-8" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1C0A0C' }}>Agreement to Terms</h2>
            <p className="mb-4 font-light leading-relaxed" style={{ color: '#1C0A0C' }}>
              Welcome to Rivernova. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website, platform, and services (collectively, the &quot;Services&quot;). By accessing or using Rivernova, you agree to be bound by these Terms.
            </p>
            <p className="text-sm font-light" style={{ color: 'rgba(28,10,12,0.5)' }}>
              If you do not agree to these Terms, you may not access or use our Services. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          {/* 1. Eligibility */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>1. Eligibility</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <p className="font-light mb-3" style={{ color: '#1C0A0C' }}>To use Rivernova, you must:</p>
                <ul className="space-y-2">
                  {[
                    'Be at least 16 years of age',
                    'Have the legal capacity to enter into a binding contract',
                    'Not be prohibited from using our Services under applicable law',
                    'Provide accurate and complete information during registration',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 font-bold" style={{ color: '#8C2D35' }}>•</span>
                      <span className="font-light" style={{ color: '#1C0A0C' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-light mt-4" style={{ color: 'rgba(28,10,12,0.5)' }}>
                  If you are under 18, you represent that you have your parent or guardian&apos;s permission to use the Services.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Account Registration */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>2. Account Registration and Security</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6 space-y-5" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                {[
                  { title: '2.1 Account Creation', desc: 'You must create an account to access certain features. You agree to provide accurate, current, and complete information and to update it as necessary.' },
                  { title: '2.2 Account Security', desc: 'You are responsible for maintaining the confidentiality of your password, all activities that occur under your account, and notifying us immediately of any unauthorized access.' },
                  { title: '2.3 Account Termination', desc: 'We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or illegal activity.' },
                ].map(item => (
                  <div key={item.title}>
                    <h3 className="font-bold mb-1" style={{ color: '#1C0A0C' }}>{item.title}</h3>
                    <p className="font-light text-sm" style={{ color: 'rgba(28,10,12,0.7)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Services */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>3. Description of Services</h2>
            </div>
            <div className="space-y-4 ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <p className="font-light mb-3" style={{ color: '#1C0A0C' }}>Rivernova provides:</p>
                <ul className="space-y-2">
                  {[
                    ['AI-Powered School Matching', 'Personalized recommendations based on your profile'],
                    ['Education Consulting', 'Guidance on school selection and applications'],
                    ['AI Advisor', 'Conversational assistance for education planning'],
                    ['Transparency Tools', 'Commission-free verification and unbiased recommendations'],
                  ].map(([title, desc]) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="mt-1 font-bold" style={{ color: '#8C2D35' }}>✓</span>
                      <span className="font-light" style={{ color: '#1C0A0C' }}>
                        <strong style={{ color: '#1C0A0C' }}>{title}:</strong> {desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-6" style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.18)' }}>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#1C0A0C' }}>
                  <AlertCircle className="w-5 h-5" />
                  Important Disclaimer
                </h3>
                <p className="text-sm font-light" style={{ color: '#1C0A0C' }}>
                  Rivernova provides educational guidance and recommendations, but we do not guarantee admission to any institution. Final admission decisions are made solely by the educational institutions. Our AI-powered recommendations are based on available data and should be used as one factor in your decision-making process.
                </p>
              </div>
            </div>
          </section>

          {/* 4. User Conduct */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>4. User Responsibilities and Conduct</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <h3 className="font-bold mb-3" style={{ color: '#1C0A0C' }}>You agree NOT to:</h3>
                <ul className="space-y-2">
                  {[
                    'Provide false or misleading information',
                    'Use the Services for any illegal purpose',
                    'Attempt to gain unauthorized access to our systems',
                    'Scrape, copy, or reverse engineer our platform',
                    'Abuse or spam our AI services',
                    'Share your account credentials with others',
                    'Harass, threaten, or harm other users',
                    'Upload viruses, malware, or malicious code',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 font-bold" style={{ color: '#DC2626' }}>✗</span>
                      <span className="font-light" style={{ color: '#1C0A0C' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Payment */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>5. Payment and Subscription Terms</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6 space-y-5" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                {[
                  { title: '5.1 Pricing', desc: 'Certain features require a paid subscription. Prices are displayed on our website and may change with notice.' },
                  { title: '5.2 Payment Processing', desc: 'Payments are processed securely through Stripe. We do not store your full payment card information.' },
                  { title: '5.3 Subscriptions', desc: 'Subscriptions automatically renew unless cancelled. You may cancel at any time through your account settings.' },
                  { title: '5.4 Refunds', desc: 'Refunds are provided on a case-by-case basis. Contact support@rivernova.com within 14 days of purchase to request a refund.' },
                  { title: '5.5 Free Trial', desc: 'If we offer a free trial, you will be charged when the trial ends unless you cancel before the trial period expires.' },
                ].map(item => (
                  <div key={item.title}>
                    <h3 className="font-bold mb-1" style={{ color: '#1C0A0C' }}>{item.title}</h3>
                    <p className="font-light text-sm" style={{ color: 'rgba(28,10,12,0.7)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. Intellectual Property */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>6. Intellectual Property Rights</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6 space-y-5" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                {[
                  { title: '6.1 Our Content', desc: 'All content, features, and functionality of Rivernova (including text, graphics, logos, software, and AI models) are owned by Rivernova and protected by copyright, trademark, and other intellectual property laws.' },
                  { title: '6.2 Your Content', desc: 'You retain ownership of any content you submit. By using our Services, you grant us a license to use, store, and process your content to provide the Services.' },
                  { title: '6.3 Feedback', desc: 'If you provide feedback or suggestions, we may use them without obligation to you.' },
                ].map(item => (
                  <div key={item.title}>
                    <h3 className="font-bold mb-1" style={{ color: '#1C0A0C' }}>{item.title}</h3>
                    <p className="font-light text-sm" style={{ color: 'rgba(28,10,12,0.7)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. AI Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>7. AI Services Disclaimer</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.18)' }}>
                <p className="font-light mb-3" style={{ color: '#1C0A0C' }}>
                  Our AI-powered recommendations and advisor are provided for informational purposes only. While we strive for accuracy:
                </p>
                <ul className="space-y-2">
                  {[
                    'AI can make mistakes and provide inaccurate information',
                    'You should verify all information independently',
                    'AI recommendations are not guarantees of admission or success',
                    'We are not liable for decisions made based on AI recommendations',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 font-bold" style={{ color: '#EA580C' }}>⚠</span>
                      <span className="font-light" style={{ color: '#1C0A0C' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>8. Limitation of Liability</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <p className="font-light mb-3" style={{ color: '#1C0A0C' }}>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, RIVERNOVA SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="space-y-2 font-light" style={{ color: 'rgba(28,10,12,0.7)' }}>
                  {[
                    'Indirect, incidental, special, or consequential damages',
                    'Loss of profits, data, or business opportunities',
                    'Damages resulting from admission decisions by educational institutions',
                    'Errors or inaccuracies in AI-generated content',
                    'Service interruptions or technical issues',
                    'Third-party actions or content',
                  ].map(item => <li key={item}>• {item}</li>)}
                </ul>
                <p className="font-light mt-4" style={{ color: 'rgba(28,10,12,0.7)' }}>
                  Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
                </p>
              </div>
            </div>
          </section>

          {/* 9. Indemnification */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>9. Indemnification</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <p className="font-light" style={{ color: '#1C0A0C' }}>
                  You agree to indemnify and hold harmless Rivernova, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:
                </p>
                <ul className="mt-3 space-y-1 font-light" style={{ color: 'rgba(28,10,12,0.7)' }}>
                  {['Your use of the Services', 'Your violation of these Terms', 'Your violation of any third-party rights', 'Any content you submit or share'].map(item => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 10. Termination */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>10. Termination</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6 space-y-5" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                {[
                  { title: '10.1 By You', desc: 'You may terminate your account at any time through your account settings or by contacting us.' },
                  { title: '10.2 By Us', desc: 'We may suspend or terminate your access immediately if you violate these Terms, without notice or liability.' },
                  { title: '10.3 Effect of Termination', desc: 'Upon termination, your right to use the Services ceases immediately. We may delete your data in accordance with our Privacy Policy.' },
                ].map(item => (
                  <div key={item.title}>
                    <h3 className="font-bold mb-1" style={{ color: '#1C0A0C' }}>{item.title}</h3>
                    <p className="font-light text-sm" style={{ color: 'rgba(28,10,12,0.7)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 11. Governing Law */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>11. Governing Law and Disputes</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6 space-y-5" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                {[
                  { title: '11.1 Governing Law', desc: 'These Terms are governed by the laws of California, USA, without regard to conflict of law principles.' },
                  { title: '11.2 Dispute Resolution', desc: 'Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law.' },
                  { title: '11.3 Class Action Waiver', desc: 'You agree to resolve disputes on an individual basis and waive the right to participate in class actions.' },
                ].map(item => (
                  <div key={item.title}>
                    <h3 className="font-bold mb-1" style={{ color: '#1C0A0C' }}>{item.title}</h3>
                    <p className="font-light text-sm" style={{ color: 'rgba(28,10,12,0.7)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 12. Changes to Terms */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>12. Changes to These Terms</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <p className="font-light" style={{ color: '#1C0A0C' }}>
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through a notice on our platform. Your continued use after changes constitutes acceptance of the modified Terms.
                </p>
              </div>
            </div>
          </section>

          {/* 13. Contact */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>13. Contact Information</h2>
            </div>
            <div className="ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.06)', border: '1px solid rgba(140,45,53,0.15)' }}>
                <p className="font-light mb-4" style={{ color: '#1C0A0C' }}>
                  For questions about these Terms, please contact us:
                </p>
                <div className="space-y-2 font-light" style={{ color: '#1C0A0C' }}>
                  <p>
                    <strong style={{ color: '#1C0A0C' }}>Email:</strong>{' '}
                    <a href="mailto:legal@rivernova.com" className="underline" style={{ color: '#8C2D35' }}>legal@rivernova.com</a>
                  </p>
                  <p>
                    <strong style={{ color: '#1C0A0C' }}>Support:</strong>{' '}
                    <a href="mailto:support@rivernova.com" className="underline" style={{ color: '#8C2D35' }}>support@rivernova.com</a>
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid rgba(140,45,53,0.12)', background: '#F5EDE5' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: '#1C0A0C' }}>Rivernova</span>
            <span className="text-sm" style={{ color: 'rgba(28,10,12,0.35)' }}>© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-light" style={{ color: 'rgba(28,10,12,0.5)' }}>
            <a href="/privacy" className="transition-colors"
              onMouseEnter={e => (e.currentTarget.style.color = '#8C2D35')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.5)')}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#8C2D35' }}>Terms of Service</a>
            <a href="mailto:legal@rivernova.com" className="transition-colors"
              onMouseEnter={e => (e.currentTarget.style.color = '#8C2D35')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.5)')}>Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}