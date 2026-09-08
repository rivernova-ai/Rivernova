'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInWithOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await signInWithOtp(email);
      alert('Magic link sent! Check your email to sign in.');
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize Google login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl shadow-2xl border-0 overflow-hidden" style={{ background: '#F5EDE5' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #8C2D35, rgba(140,45,53,0.4))' }} />

        <DialogHeader className="pt-6 pb-2 text-center flex flex-col items-center">
          <div className="mb-4 w-12 h-12 flex items-center justify-center" style={{ color: '#8C2D35', filter: 'drop-shadow(0 0 10px rgba(140,45,53,0.25))' }}>
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" className="w-12 h-12">
              <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
              <text x="50" y="55" fontSize="46" fontWeight="bold" fontFamily="sans-serif" fill="currentColor" stroke="none" textAnchor="middle" dominantBaseline="middle">R</text>
            </svg>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight" style={{ color: '#1C0A0C' }}>
            Welcome to Rivernova
          </DialogTitle>
          <DialogDescription style={{ color: 'rgba(28,10,12,0.5)' }}>
            Sign in to continue
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-xl font-medium transition-all"
            style={{ background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.18)', color: '#1C0A0C' }}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: 'rgba(140,45,53,0.15)' }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2" style={{ background: '#F5EDE5', color: 'rgba(28,10,12,0.35)' }}>Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: 'rgba(28,10,12,0.65)', fontSize: '13px' }}>Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="h-12 rounded-xl text-sm font-light placeholder:text-[rgba(28,10,12,0.3)] focus-visible:ring-[rgba(140,45,53,0.4)]"
                style={{ background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.15)', color: '#1C0A0C' }}
              />
            </div>

            <Button
               type="submit"
               disabled={loading}
               className="w-full h-12 mt-2 rounded-xl font-semibold border-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               style={{ background: '#8C2D35', color: '#F5EDE5', boxShadow: '0 0 20px rgba(140,45,53,0.2)' }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default AuthModal;
