'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, MessageCircle, ShieldAlert, Users, Compass, Zap, ArrowUpRight, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SchoolAdvisorProps {
  schoolName: string;
  location: string;
  program: string;
}

export function SchoolAdvisor({ schoolName, location, program }: SchoolAdvisorProps) {
  const [messages, setMessages] = useState<Array<{id: string; role: string; content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial research on mount
  useEffect(() => {
    const performInitialResearch = async () => {
      setMessages([{
        id: 'system-1',
        role: 'assistant',
        content: `Initializing deep-intelligence protocol for **${schoolName}**... \n\nI'm currently scanning real-time databases for campus safety metrics, student life sentiment, and local infrastructure data.`
      }]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `Provide a comprehensive, brutally honest briefing for a prospective student at ${schoolName} in ${location}. 
              Include:
              1. CAMPUS LIFE: What is the actual vibe? (Social scene, clubs, pressure).
              2. SAFETY INTEL: Real-time crime sentiment in ${location}. Is it safe to walk at night? Specific areas to avoid.
              3. LOCAL INFRASTRUCTURE: Transportation, food scene, and cost of living for a student.
              
              Format this as a strategic briefing with bold headers.`
            }],
            context: { schoolName, location, program, type: 'deep-research' }
          }),
        });

        const data = await response.json();
        setMessages(prev => [...prev, {
          id: 'research-result',
          role: 'assistant',
          content: data.message
        }]);
      } catch (error) {
        setMessages(prev => [...prev, {
          id: 'error',
          role: 'assistant',
          content: "Deep research protocol interrupted. I still have extensive core knowledge about this institution—how can I help?"
        }]);
      } finally {
        setIsResearching(false);
      }
    };

    performInitialResearch();
  }, [schoolName, location]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: { schoolName, location, program }
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#050505] border border-white/[0.08] rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[700px] shadow-2xl">
      {/* Sidebar: Strategic Intel Summary */}
      <div className="w-full md:w-80 bg-white/[0.01] border-r border-white/[0.05] p-10 flex flex-col justify-between">
        <div className="space-y-12">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Counselor</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Deep Intel Active</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4 group cursor-default">
              <div className="mt-1 w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/60">Safety Index</p>
                <p className="text-[10px] text-white/30 uppercase font-black">Live Data</p>
              </div>
            </div>
            <div className="flex items-start gap-4 group cursor-default">
              <div className="mt-1 w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/60">Social Pulse</p>
                <p className="text-[10px] text-white/30 uppercase font-black">Sentiment</p>
              </div>
            </div>
            <div className="flex items-start gap-4 group cursor-default">
              <div className="mt-1 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/60">Local Scene</p>
                <p className="text-[10px] text-white/30 uppercase font-black">Exploration</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
          <p className="text-[9px] text-white/20 leading-relaxed font-medium">
             Consensus engine uses real-time web-scouring to synthesize campus culture and safety.
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#080808]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-5 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-white text-black font-medium shadow-xl' 
                  : 'bg-white/[0.03] border border-white/[0.06] text-white/90 backdrop-blur-md'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none 
                    [&_strong]:text-white [&_strong]:font-black 
                    [&_p]:mb-4 [&_p:last-child]:mb-0 
                    [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2
                    [&_h1]:text-white [&_h1]:text-xl [&_h1]:font-black [&_h1]:mb-4
                    [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-3
                    [&_h3]:text-white [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              <p className="text-[8px] text-white/10 uppercase tracking-widest font-black px-2">
                {msg.role === 'user' ? 'Prospective Student' : 'Advisor Intelligence'}
              </p>
            </div>
          ))}
          
          {(isLoading || isResearching) && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-[1.5rem] px-6 py-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                  {isResearching ? 'Scouring Real-time Databases...' : 'Processing Query...'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-10 border-t border-white/[0.04] space-y-6">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-end gap-2 bg-[#0c0c0c] border border-white/[0.08] rounded-2xl p-2 transition-all group-focus-within:border-white/20">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${schoolName}'s culture, safety, or life...`}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-white/10 rounded-xl resize-none min-h-[44px] max-h-[160px] text-sm py-3 px-3 scrollbar-hide"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={isLoading || isResearching || !input.trim()} 
                className="h-11 w-11 rounded-xl bg-white text-black hover:bg-white/90 shadow-lg transition-all active:scale-95 disabled:opacity-20 flex-shrink-0"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </div>
          </form>
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-3 h-3 text-white/10" />
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-tight">
              Counselor uses real-time web search. Some location data may be estimated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
