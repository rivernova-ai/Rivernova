'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Settings } from 'lucide-react';
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
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setPreferences(allAccepted);
    setShowBanner(false);
    if (allAccepted.analytics) initializeAnalytics();
  };

  const acceptNecessary = () => {
    const necessaryOnly = { necessary: true, analytics: false, marketing: false };
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
    if (preferences.analytics) initializeAnalytics();
  };

  const initializeAnalytics = () => {
    console.log('Analytics initialized');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-[1200px] mx-auto">
        <div className="rounded-2xl shadow-2xl backdrop-blur-xl" style={{ background: 'rgba(245,237,229,0.97)', border: '1px solid rgba(140,45,53,0.12)' }}>
          {!showSettings ? (
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.15)' }}>
                  <Shield className="w-5 h-5" style={{ color: '#8C2D35' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1C0A0C' }}>We Value Your Privacy</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(28,10,12,0.55)' }}>
                    We use cookies to enhance your experience, analyze site traffic, and personalize content.
                    By clicking &quot;Accept All&quot;, you consent to our use of cookies. You can manage your preferences or learn more in our{' '}
                    <a href="/privacy" className="hover:underline" style={{ color: '#8C2D35' }}>Privacy Policy</a>.
                  </p>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="transition-colors"
                  style={{ color: 'rgba(28,10,12,0.3)' }}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={acceptAll}
                  className="flex-1 rounded-xl h-11 font-semibold border-0"
                  style={{ background: '#8C2D35', color: '#F5EDE5', boxShadow: '0 0 20px rgba(140,45,53,0.2)' }}
                >
                  Accept All Cookies
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                  className="flex-1 rounded-xl h-11 font-medium transition-all"
                  style={{ background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.18)', color: '#1C0A0C' }}
                >
                  Necessary Only
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="rounded-xl h-11 px-6 font-medium transition-all"
                  style={{ background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.18)', color: 'rgba(28,10,12,0.6)' }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(140,45,53,0.08)', border: '1px solid rgba(140,45,53,0.15)' }}>
                    <Settings className="w-5 h-5" style={{ color: '#8C2D35' }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: '#1C0A0C' }}>Cookie Preferences</h3>
                </div>
                <button onClick={() => setShowSettings(false)} style={{ color: 'rgba(28,10,12,0.3)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="rounded-xl p-4" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5" style={{ color: '#059669' }} />
                      <h4 className="font-bold" style={{ color: '#1C0A0C' }}>Necessary Cookies</h4>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#059669' }}>
                      Always Active
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(28,10,12,0.5)' }}>
                    Essential for the website to function. These cookies enable core functionality such as security, authentication, and accessibility.
                  </p>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5" style={{ color: '#8C2D35' }} />
                      <h4 className="font-bold" style={{ color: '#1C0A0C' }}>Analytics Cookies</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" style={{ background: preferences.analytics ? '#8C2D35' : 'rgba(28,10,12,0.15)' }} />
                    </label>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(28,10,12,0.5)' }}>
                    Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'rgba(140,45,53,0.04)', border: '1px solid rgba(140,45,53,0.10)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5" style={{ color: 'rgba(140,45,53,0.5)' }} />
                      <h4 className="font-bold" style={{ color: '#1C0A0C' }}>Marketing Cookies</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" style={{ background: preferences.marketing ? '#8C2D35' : 'rgba(28,10,12,0.15)' }} />
                    </label>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(28,10,12,0.5)' }}>
                    Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={savePreferences}
                  className="flex-1 rounded-xl h-11 font-semibold border-0"
                  style={{ background: '#8C2D35', color: '#F5EDE5', boxShadow: '0 0 20px rgba(140,45,53,0.2)' }}
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="rounded-xl h-11 px-6 font-medium"
                  style={{ background: 'rgba(140,45,53,0.05)', border: '1px solid rgba(140,45,53,0.18)', color: 'rgba(28,10,12,0.6)' }}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-center mt-4" style={{ color: 'rgba(28,10,12,0.35)' }}>
                You can change your preferences at any time in your account settings or by visiting our{' '}
                <a href="/privacy" className="hover:underline" style={{ color: '#8C2D35' }}>Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default CookieConsent;
