'use client';

import Link from 'next/link';
import { FileText, Search, MessageCircle, ArrowRight } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Link href="/dashboard/essay" className="group">
        <div style={{
          background: 'rgba(234,88,12,0.04)',
          border: '1px solid rgba(234,88,12,0.15)',
          borderRadius: '24px', padding: '32px',
          transition: 'all 0.25s ease', cursor: 'pointer', height: '100%',
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(234,88,12,0.07)'; el.style.borderColor = 'rgba(234,88,12,0.25)'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(234,88,12,0.04)'; el.style.borderColor = 'rgba(234,88,12,0.15)'; }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(234,88,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'transform 0.2s ease' }}
            className="group-hover:scale-110">
            <FileText style={{ width: '28px', height: '28px', color: '#EA580C' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1C0A0C', marginBottom: '12px' }}>Essay Strategy</h3>
          <p style={{ color: 'rgba(28,10,12,0.55)', lineHeight: 1.6, marginBottom: '16px', fontSize: '14px' }}>
            Get your $5,000 essay positioning strategy — free
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EA580C', fontWeight: 500, fontSize: '14px', transition: 'gap 0.2s ease' }}
            className="group-hover:gap-3">
            Start Now
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </div>
        </div>
      </Link>

      <Link href="/dashboard/matches" className="group">
        <div style={{
          background: 'rgba(140,45,53,0.04)',
          border: '1px solid rgba(140,45,53,0.12)',
          borderRadius: '24px', padding: '32px',
          transition: 'all 0.25s ease', cursor: 'pointer', height: '100%',
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(140,45,53,0.07)'; el.style.borderColor = 'rgba(140,45,53,0.22)'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(140,45,53,0.04)'; el.style.borderColor = 'rgba(140,45,53,0.12)'; }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(140,45,53,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'transform 0.2s ease' }}
            className="group-hover:scale-110">
            <Search style={{ width: '28px', height: '28px', color: '#8C2D35' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1C0A0C', marginBottom: '12px' }}>Find Matches</h3>
          <p style={{ color: 'rgba(28,10,12,0.55)', lineHeight: 1.6, marginBottom: '16px', fontSize: '14px' }}>
            Get AI-powered school recommendations based on your profile
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8C2D35', fontWeight: 500, fontSize: '14px', transition: 'gap 0.2s ease' }}
            className="group-hover:gap-3">
            Start Matching
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </div>
        </div>
      </Link>

      <button className="group text-left" style={{ display: 'block', width: '100%' }}>
        <div style={{
          background: 'rgba(140,45,53,0.04)',
          border: '1px solid rgba(140,45,53,0.12)',
          borderRadius: '24px', padding: '32px',
          transition: 'all 0.25s ease', cursor: 'pointer', height: '100%',
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(140,45,53,0.07)'; el.style.borderColor = 'rgba(140,45,53,0.22)'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(140,45,53,0.04)'; el.style.borderColor = 'rgba(140,45,53,0.12)'; }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(140,45,53,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'transform 0.2s ease' }}
            className="group-hover:scale-110">
            <MessageCircle style={{ width: '28px', height: '28px', color: '#8C2D35' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1C0A0C', marginBottom: '12px' }}>AI Counselor</h3>
          <p style={{ color: 'rgba(28,10,12,0.55)', lineHeight: 1.6, marginBottom: '16px', fontSize: '14px' }}>
            Chat with your 24/7 AI counselor for personalized guidance
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8C2D35', fontWeight: 500, fontSize: '14px', transition: 'gap 0.2s ease' }}
            className="group-hover:gap-3">
            Start Chat
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </div>
        </div>
      </button>
    </div>
  );
}
