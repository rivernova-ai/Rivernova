'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Shield, Lock, Eye, Database, Mail, UserX } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen" style={{ background: '#F5EDE5' }}>
      <Navbar />

      <div className="pt-32 pb-20 px-6 max-w-[900px] mx-auto">

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(140,45,53,0.1)' }}>
              <Shield className="w-6 h-6" style={{ color: '#8C2D35' }} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] mb-1" style={{ color: 'rgba(28,10,12,0.35)' }}>Legal</p>
              <h1 className="text-4xl font-bold" style={{ color: '#1C0A0C' }}>Privacy Policy</h1>
            </div>
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
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1C0A0C' }}>Our Commitment to Your Privacy</h2>
            <p className="mb-4 font-light leading-relaxed" style={{ color: '#1C0A0C' }}>
              At Rivernova, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our education consulting platform. We are committed to transparency and protecting your personal data in compliance with GDPR, CCPA, and other applicable privacy laws.
            </p>
            <p className="text-sm font-light" style={{ color: 'rgba(28,10,12,0.5)' }}>
              By using Rivernova, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>1. Information We Collect</h2>
            </div>

            <div className="space-y-4 ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#1C0A0C' }}>1.1 Personal Information You Provide</h3>
                <p className="mb-3 font-light" style={{ color: '#1C0A0C' }}>When you create an account or use our services, we collect:</p>
                <ul className="list-disc list-inside space-y-2 font-light" style={{ color: 'rgba(28,10,12,0.7)' }}>
                  <li><strong style={{ color: '#1C0A0C' }}>Account Information:</strong> Full name, email address, password (encrypted)</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Academic Information:</strong> GPA, test scores, major, current school, graduation date</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Career Goals:</strong> Intended career field, dream job, professional aspirations</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Financial Information:</strong> Budget preferences for education (no payment card data stored by us)</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Location Preferences:</strong> Preferred countries and regions for study</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Communications:</strong> Messages you send through our AI advisor or support system</li>
                </ul>
              </div>

              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#1C0A0C' }}>1.2 Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2 font-light" style={{ color: 'rgba(28,10,12,0.7)' }}>
                  <li><strong style={{ color: '#1C0A0C' }}>Usage Data:</strong> Pages visited, features used, time spent, search queries</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Device Information:</strong> Browser type, operating system, device identifiers</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Log Data:</strong> IP address, access times, referring URLs</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                </ul>
              </div>

              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#1C0A0C' }}>1.3 Information from Third Parties</h3>
                <ul className="list-disc list-inside space-y-2 font-light" style={{ color: 'rgba(28,10,12,0.7)' }}>
                  <li><strong style={{ color: '#1C0A0C' }}>Authentication Providers:</strong> If you sign in with Google or other OAuth providers</li>
                  <li><strong style={{ color: '#1C0A0C' }}>Payment Processors:</strong> Transaction data from Stripe (we never see your full card number)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>2. How We Use Your Information</h2>
            </div>

            <div className="space-y-4 ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <ul className="space-y-3">
                  {[
                    ['Provide Services', 'Match you with schools, generate AI recommendations, facilitate applications'],
                    ['Personalization', 'Customize your experience based on your profile and preferences'],
                    ['Communication', 'Send you service updates, match notifications, and educational content'],
                    ['Analytics', 'Understand how users interact with our platform to improve services'],
                    ['Security', 'Detect and prevent fraud, abuse, and security incidents'],
                    ['Legal Compliance', 'Comply with legal obligations and enforce our terms'],
                    ['Research', 'Aggregate anonymized data to improve education outcomes (with your consent)'],
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

              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#1C0A0C' }}>
                  <Shield className="w-5 h-5" style={{ color: '#8C2D35' }} />
                  What We DON&apos;T Do
                </h3>
                <ul className="space-y-2">
                  {[
                    'We never sell your personal data to third parties',
                    'We never share your data with schools without your explicit consent',
                    'We never accept commissions that would bias our recommendations',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 font-bold" style={{ color: '#1C0A0C' }}>✗</span>
                      <span className="font-light" style={{ color: '#1C0A0C' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 3. How We Share Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>3. How We Share Your Information</h2>
            </div>

            <div className="space-y-4 ml-9">
              <p className="font-light mb-2" style={{ color: 'rgba(28,10,12,0.6)' }}>We may share your information only in the following circumstances:</p>

              <div className="rounded-xl p-6 space-y-5" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                {[
                  {
                    title: 'Service Providers',
                    desc: 'We use trusted third-party services to operate our platform:',
                    list: ['Supabase (database hosting and authentication)', 'Anthropic (AI-powered recommendations via Claude)', 'Perplexity (school research and data)', 'Stripe (payment processing)', 'Resend (transactional emails)'],
                  },
                  { title: 'With Your Consent', desc: 'We will share your information with schools or other parties only when you explicitly authorize us to do so.' },
                  { title: 'Legal Requirements', desc: 'We may disclose your information if required by law, court order, or government request.' },
                  { title: 'Business Transfers', desc: 'If Rivernova is acquired or merged, your information may be transferred to the new entity.' },
                ].map(item => (
                  <div key={item.title}>
                    <h3 className="font-bold mb-1" style={{ color: '#1C0A0C' }}>{item.title}</h3>
                    <p className="font-light text-sm" style={{ color: 'rgba(28,10,12,0.65)' }}>{item.desc}</p>
                    {item.list && (
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm font-light" style={{ color: 'rgba(28,10,12,0.55)' }}>
                        {item.list.map(l => <li key={l}>{l}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Your Privacy Rights */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <UserX className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>4. Your Privacy Rights</h2>
            </div>

            <div className="space-y-4 ml-9">
              <p className="font-light mb-2" style={{ color: 'rgba(28,10,12,0.6)' }}>Depending on your location, you have the following rights:</p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Access', desc: 'Request a copy of all personal data we hold about you' },
                  { title: 'Correction', desc: 'Update or correct inaccurate information' },
                  { title: 'Deletion', desc: 'Request deletion of your personal data (right to be forgotten)' },
                  { title: 'Portability', desc: 'Export your data in a machine-readable format' },
                  { title: 'Opt-Out', desc: 'Unsubscribe from marketing communications' },
                  { title: 'Restrict Processing', desc: 'Limit how we use your data' },
                ].map(r => (
                  <div key={r.title} className="rounded-xl p-5" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                    <h3 className="font-bold mb-1" style={{ color: '#1C0A0C' }}>{r.title}</h3>
                    <p className="text-sm font-light" style={{ color: 'rgba(28,10,12,0.6)' }}>{r.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-6 mt-2" style={{ background: 'rgba(140,45,53,0.06)', border: '1px solid rgba(140,45,53,0.15)' }}>
                <h3 className="font-bold mb-2" style={{ color: '#8C2D35' }}>How to Exercise Your Rights</h3>
                <p className="font-light mb-3" style={{ color: '#1C0A0C' }}>To exercise any of these rights, contact us at:</p>
                <ul className="space-y-1 font-light" style={{ color: '#1C0A0C' }}>
                  <li>Email: <a href="mailto:privacy@rivernova.com" className="underline" style={{ color: '#8C2D35' }}>privacy@rivernova.com</a></li>
                  <li>Or visit your Privacy Settings page in your dashboard</li>
                </ul>
                <p className="text-sm font-light mt-3" style={{ color: 'rgba(28,10,12,0.45)' }}>We will respond to your request within 30 days.</p>
              </div>
            </div>
          </section>

          {/* 5. Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>5. Data Security</h2>
            </div>

            <div className="space-y-4 ml-9">
              <p className="font-light mb-2" style={{ color: 'rgba(28,10,12,0.6)' }}>We implement industry-standard security measures to protect your data:</p>

              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.1)' }}>
                <ul className="space-y-3">
                  {[
                    ['Encryption', 'All data is encrypted in transit (TLS/SSL) and at rest (AES-256)'],
                    ['Access Controls', 'Strict role-based access to your data'],
                    ['Regular Audits', 'Security assessments and penetration testing'],
                    ['Secure Infrastructure', 'Hosted on SOC 2 compliant servers'],
                    ['Monitoring', '24/7 security monitoring and incident response'],
                  ].map(([title, desc]) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="mt-1 font-bold" style={{ color: '#059669' }}>✓</span>
                      <span className="font-light" style={{ color: '#1C0A0C' }}>
                        <strong style={{ color: '#1C0A0C' }}>{title}:</strong> {desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-6" style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.18)' }}>
                <p className="font-light" style={{ color: '#1C0A0C' }}>
                  <strong style={{ color: '#EA580C' }}>Important:</strong> No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. Please use a strong password and enable two-factor authentication.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Contact Us */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6" style={{ color: '#8C2D35' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1C0A0C' }}>6. Contact Us</h2>
            </div>

            <div className="ml-9">
              <div className="rounded-xl p-6" style={{ background: 'rgba(140,45,53,0.06)', border: '1px solid rgba(140,45,53,0.15)' }}>
                <p className="font-light mb-4" style={{ color: '#1C0A0C' }}>
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 font-light" style={{ color: '#1C0A0C' }}>
                  <p><strong style={{ color: '#1C0A0C' }}>Email:</strong>{' '}
                    <a href="mailto:privacy@rivernova.com" className="underline" style={{ color: '#8C2D35' }}>privacy@rivernova.com</a>
                  </p>
                  <p><strong style={{ color: '#1C0A0C' }}>Data Protection Officer:</strong>{' '}
                    <a href="mailto:dpo@rivernova.com" className="underline" style={{ color: '#8C2D35' }}>dpo@rivernova.com</a>
                  </p>
                </div>
                <p className="text-sm font-light mt-4" style={{ color: 'rgba(28,10,12,0.45)' }}>
                  For EU residents: You have the right to lodge a complaint with your local data protection authority.
                </p>
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
            <a href="/privacy" style={{ color: '#8C2D35' }}>Privacy Policy</a>
            <a href="/terms" className="transition-colors"
              onMouseEnter={e => (e.currentTarget.style.color = '#8C2D35')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.5)')}>Terms of Service</a>
            <a href="mailto:privacy@rivernova.com" className="transition-colors"
              onMouseEnter={e => (e.currentTarget.style.color = '#8C2D35')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(28,10,12,0.5)')}>Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
