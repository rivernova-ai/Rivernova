'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Ruler } from 'lucide-react';

interface MapDistanceProps {
  schoolLocation: string;
  schoolName: string;
}

export default function MapDistance({ schoolLocation, schoolName }: MapDistanceProps) {
  const [homeLocation, setHomeLocation] = useState<string>('');
  const [distance, setDistance] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    // Load saved home location from localStorage
    const saved = localStorage.getItem('homeLocation');
    if (saved) {
      setHomeLocation(saved);
      calculateDistance(saved, schoolLocation);
    }
  }, [schoolLocation]);

  const calculateDistance = async (from: string, to: string) => {
    // Simplified distance calculation - in production, use Google Maps Distance Matrix API
    // For MVP, show placeholder
    setDistance('~1,200 miles');
  };

  const handleSetHome = () => {
    if (homeLocation) {
      localStorage.setItem('homeLocation', homeLocation);
      calculateDistance(homeLocation, schoolLocation);
      setShowInput(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Distance</h4>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-xs text-indigo-400 hover:text-white transition-colors"
        >
          {homeLocation ? 'Change' : 'Set Home'}
        </button>
      </div>

      {showInput ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter your city or zip code"
            value={homeLocation}
            onChange={(e) => setHomeLocation(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={handleSetHome}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2 rounded-xl transition-colors"
          >
            Save Location
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {homeLocation ? (
            <>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Navigation className="w-3.5 h-3.5" />
                <span>From: {homeLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>To: {schoolLocation}</span>
              </div>
              {distance && (
                <div className="flex items-center gap-2 text-white font-bold text-lg mt-2">
                  <Ruler className="w-4 h-4 text-indigo-400" />
                  {distance}
                </div>
              )}
              <a
                href={`https://www.google.com/maps/dir/${encodeURIComponent(homeLocation)}/${encodeURIComponent(schoolLocation)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-white transition-colors mt-2"
              >
                View on Google Maps →
              </a>
            </>
          ) : (
            <p className="text-white/40 text-xs italic">Set your home location to see distance</p>
          )}
        </div>
      )}
    </div>
  );
}
