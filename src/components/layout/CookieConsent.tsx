'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const saved = JSON.parse(consent);
      setPreferences(saved);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setPreferences(allAccepted);
    setShowBanner(false);
    
    // Initialize analytics if accepted
    if (allAccepted.analytics) {
      initializeAnalytics();
    }
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setPreferences(necessaryOnly);
    setShowBanner(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
    
    // Initialize analytics if accepted
    if (preferences.analytics) {
      initializeAnalytics();
    }
  };

  const initializeAnalytics = () => {
    // Initialize Google Analytics or other analytics tools here
    console.log('Analytics initialized');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-[#0c0c10] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
          {!showSettings ? (
            // Main Banner
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">We Value Your Privacy</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                    By clicking &quot;Accept All&quot;, you consent to our use of cookies. You can manage your preferences or learn more in our{' '}
                    <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>.
                  </p>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={acceptAll}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 h-11"
                >
                  Accept All Cookies
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                  className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white h-11"
                >
                  Necessary Only
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white h-11 px-6"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </div>
            </div>
          ) : (
            // Settings Panel
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Cookie Preferences</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-white font-bold">Necessary Cookies</h4>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      Always Active
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">
                    Essential for the website to function. These cookies enable core functionality such as security, authentication, and accessibility.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Cookie className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-white font-bold">Analytics Cookies</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                  <p className="text-white/60 text-sm">
                    Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Cookie className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-bold">Marketing Cookies</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                  <p className="text-white/60 text-sm">
                    Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={savePreferences}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white border-0 h-11"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white h-11 px-6"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-white/40 text-xs text-center mt-4">
                You can change your preferences at any time in your account settings or by visiting our{' '}
                <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
