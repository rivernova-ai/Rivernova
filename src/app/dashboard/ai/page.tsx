'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Send, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Profile {
  academic_background: any;
  career_goals: any;
  budget: any;
  location_preferences: any;
}

export default function AIChat() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your education advisor. I'm here to help you with school selection, applications, scholarships, and career planning. What would you like to know?\n\nNote: AI can make mistakes. It's important you double-check any information I provide.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) { router.push('/'); return; }
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    };
    if (!authLoading) loadProfile();
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], userProfile: profile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F5EDE5' }}>
      <Loader2 style={{ width: '32px', height: '32px', color: '#8C2D35', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: '#F5EDE5', minHeight: '100vh', padding: '2rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: '24px', height: '24px', color: '#8C2D35' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: '#1C0A0C', margin: 0, letterSpacing: '-0.02em' }}>Advisor</h1>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{ background: 'rgba(140,45,53,0.03)', border: '1px solid rgba(140,45,53,0.12)', borderRadius: '24px', overflow: 'hidden' }}>
        {/* Messages */}
        <div style={{ height: '560px', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((message, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '16px', flexDirection: message.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: message.role === 'user' ? '#8C2D35' : 'rgba(140,45,53,0.08)',
                border: message.role === 'user' ? 'none' : '1px solid rgba(140,45,53,0.15)',
              }}>
                {message.role === 'user'
                  ? <User style={{ width: '20px', height: '20px', color: '#F5EDE5' }} />
                  : <Bot style={{ width: '20px', height: '20px', color: '#8C2D35' }} />}
              </div>
              <div style={{
                maxWidth: '70%', borderRadius: '16px', padding: '14px 16px',
                background: message.role === 'user' ? 'rgba(140,45,53,0.07)' : 'rgba(250,245,240,0.9)',
                border: `1px solid ${message.role === 'user' ? 'rgba(140,45,53,0.18)' : 'rgba(140,45,53,0.08)'}`,
              }}>
                <p style={{ fontSize: '13px', color: 'rgba(28,10,12,0.85)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.15)' }}>
                <Bot style={{ width: '20px', height: '20px', color: '#8C2D35' }} />
              </div>
              <div style={{ background: 'rgba(250,245,240,0.9)', border: '1px solid rgba(140,45,53,0.08)', borderRadius: '16px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 style={{ width: '16px', height: '16px', color: '#8C2D35', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px', color: 'rgba(28,10,12,0.45)' }}>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ borderTop: '1px solid rgba(140,45,53,0.10)', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about schools, applications, or your education journey..."
              rows={2}
              disabled={loading}
              style={{ flex: 1, background: 'rgba(245,237,229,0.7)', border: '1px solid rgba(140,45,53,0.14)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: '#1C0A0C', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{ padding: '0 24px', borderRadius: '12px', background: !input.trim() || loading ? 'rgba(140,45,53,0.3)' : '#8C2D35', color: '#F5EDE5', border: 'none', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', fontFamily: 'inherit' }}
            >
              {loading
                ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                : <Send style={{ width: '20px', height: '20px' }} />}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(28,10,12,0.35)', margin: '8px 0 0', textAlign: 'center' }}>
            AI can make mistakes. It's important you double-check. Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
        {[
          'What schools match my profile?',
          'How can I improve my application?',
          'Tell me about scholarship opportunities',
          'What are my career prospects?',
        ].map((question, idx) => (
          <button
            key={idx}
            onClick={() => setInput(question)}
            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '12px', background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)', color: 'rgba(28,10,12,0.55)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(140,45,53,0.08)'; el.style.borderColor = 'rgba(140,45,53,0.20)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(140,45,53,0.04)'; el.style.borderColor = 'rgba(140,45,53,0.10)'; }}
          >
            {question}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea::placeholder { color: rgba(28,10,12,0.3); }
        * { scrollbar-width: thin; scrollbar-color: rgba(140,45,53,0.2) transparent; }
      `}</style>
    </div>
  );
}
