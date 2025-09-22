'use client';
import React, { useEffect } from 'react';

const nearbyItems = [
  { label: 'Petrol Pump', icon: '⛽', query: 'petrol pump near me' },
  { label: 'Hospital', icon: '🏥', query: 'hospital near me' },
  { label: 'ATM', icon: '🏧', query: 'ATM near me' },
  { label: 'Medical Store', icon: '💊', query: 'medical store near me' }
];

const LocationSection = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes bounce-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="mt-10 px-4 md:hidden">
      <h2 className="text-xl font-semibold mb-5 text-white text-center tracking-wide">
        Nearby Essentials
      </h2>

      <div className="grid grid-cols-2 gap-5">
        {nearbyItems.map((item, idx) => (
          <a
            key={idx}
            href={`https://www.google.com/search?q=${encodeURIComponent(item.query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-md border border-slate-600/30
              transition-all duration-300 hover:scale-105 hover:shadow-lg 
              bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900`}
          >
            <span
              className="text-3xl mb-2 text-white"
              style={{ animation: 'bounce-slow 2.5s infinite' }}
            >
              {item.icon}
            </span>
            <span className="text-base text-white font-semibold tracking-wide">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LocationSection;
