'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, MessageCircle, ShieldAlert, Users, Compass, Zap, ArrowUpRight, AlertCircle, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

interface SchoolAdvisorProps {
  schoolName: string;
  location: string;
  program: string;
}

interface Metrics {
  safety: number;
  social: number;
  local: number;
  roi: number;
}

export function SchoolAdvisor({ schoolName, location, program }: SchoolAdvisorProps) {
  const [messages, setMessages] = useState<Array<{id: string; role: string; content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({ safety: 0, social: 0, local: 0, roi: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const parseMetrics = (content: string) => {
    const match = content.match(/\[METRICS:\s*({.*?})\]/);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        setMetrics(data);
        return content.replace(match[0], '').trim();
      } catch (e) {
        console.error('Failed to parse metrics:', e);
      }
    }
    return content;
  };

  // Initial research on mount
  useEffect(() => {
    const performInitialResearch = async () => {
      setMessages([{
        id: `system-${Date.now()}`,
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
        const cleanedContent = parseMetrics(data.message);
        
        setMessages(prev => [...prev, {
          id: `research-${Date.now()}`,
          role: 'assistant',
          content: cleanedContent
        }]);
      } catch (error) {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
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
      const cleanedContent = parseMetrics(data.message);
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: cleanedContent 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = [
    { subject: 'Safety', A: metrics.safety, fullMark: 100 },
    { subject: 'Social', A: metrics.social, fullMark: 100 },
    { subject: 'Local', A: metrics.local, fullMark: 100 },
    { subject: 'ROI', A: metrics.roi, fullMark: 100 },
  ];

  return (
    <div className="w-full bg-[#050505] border border-white/[0.08] rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[750px] shadow-2xl">
      {/* Sidebar: Strategic Intel Summary */}
      <div className="w-full md:w-96 bg-white/[0.01] border-r border-white/[0.05] p-10 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-12">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Intelligence</h3>
            <p className="text-[10px] text-indigo-400 uppercase tracking-[0.3em] font-black">Strategic Focus Active</p>
          </div>

          {/* Futuristic Visual Representation */}
          <div className="relative aspect-square w-full py-4">
             {/* Background Glow */}
             <div className="absolute inset-0 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
             
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                 <PolarGrid stroke="#ffffff10" strokeDasharray="3 3" />
                 <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
                 />
                 <Radar
                   name="School metrics"
                   dataKey="A"
                   stroke="#818cf8"
                   fill="#818cf8"
                   fillOpacity={0.4}
                   animationDuration={1500}
                 />
               </RadarChart>
             </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ShieldAlert, label: 'Safety', value: metrics.safety, color: 'indigo' },
              { icon: Users, label: 'Social', value: metrics.social, color: 'purple' },
              { icon: Compass, label: 'Local', value: metrics.local, color: 'emerald' },
              { icon: Zap, label: 'ROI', value: metrics.roi, color: 'amber' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3"
              >
                 <div className="flex items-center gap-2">
                    <stat.icon className={`w-3.5 h-3.5 text-${stat.color}-400`} />
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{stat.label}</span>
                 </div>
                 <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-white">{stat.value}%</span>
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${stat.value}%` }}
                         className={`h-full bg-${stat.color}-400`}
                       />
                    </div>
                 </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-6 bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem]">
          <p className="text-[10px] text-white/20 leading-relaxed font-bold uppercase tracking-tight">
             Deep Research Mode: Using Perplexity Sonar Pro & Claude 3.5 Sonnet for real-time verification.
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#080808]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}
              >
                <div className={`max-w-[85%] rounded-[2rem] px-8 py-6 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white text-black font-medium shadow-2xl' 
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/90 backdrop-blur-3xl shadow-lg'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none 
                      [&_strong]:text-white [&_strong]:font-black 
                      [&_p]:mb-4 [&_p:last-child]:mb-0 
                      [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2
                      [&_h1]:text-white [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-tighter [&_h1]:mb-6
                      [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mb-4
                      [&_h3]:text-white [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-3">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 px-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-white/20' : 'bg-indigo-500 animate-pulse'}`} />
                  <p className="text-[8px] text-white/10 uppercase tracking-[0.3em] font-black">
                    {msg.role === 'user' ? 'Operational Focus' : 'Advisor Intel'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {(isLoading || isResearching) && (
            <div className="flex justify-start items-center gap-4">
               <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 animate-pulse" />
                  <Loader2 className="relative w-5 h-5 animate-spin text-indigo-400" />
               </div>
               <span className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">
                  {isResearching ? 'Deep Scouring Databases...' : 'Processing Synthesis...'}
               </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-10 border-t border-white/[0.04] bg-white/[0.01]">
          <form onSubmit={handleSubmit} className="relative group max-w-3xl mx-auto">
            <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-[1.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2 bg-[#0c0c0c] border border-white/[0.1] rounded-[1.5rem] p-3 transition-all group-focus-within:border-white/30 shadow-2xl">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Strategic inquiries for ${schoolName}...`}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-white/10 rounded-xl resize-none min-h-[44px] max-h-[160px] text-sm py-3 px-4 scrollbar-hide"
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
                className="h-12 w-12 rounded-xl bg-white text-black hover:bg-white/90 shadow-2xl transition-all active:scale-95 disabled:opacity-10 flex-shrink-0"
              >
                <ArrowUpRight className="w-6 h-6" />
              </Button>
            </div>
          </form>
          <div className="mt-6 flex items-center justify-center gap-3">
            <ShieldAlert className="w-3.5 h-3.5 text-white/10" />
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-tight">
              AI uses Sonar Pro real-time consensus. Strategic briefings are advisory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
