'use client';

import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [text, setText] = useState('');
  const fullText = "Transform your commute into productive time";
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
      {/* Geometric Logo */}
      <div className="mb-12 relative">
        <div className="w-32 h-32 border-4 border-white rotate-45 absolute"></div>
        <div className="w-32 h-32 border-4 border-white absolute"></div>
        <div className="w-32 h-32 flex items-center justify-center relative">
          <svg className="w-16 h-16 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-7xl md:text-9xl font-bold text-white mb-6 text-center tracking-tighter">
        NOMAD
      </h1>
      
      <p className="text-xl md:text-2xl text-white/60 mb-4 font-light tracking-wide uppercase">
        Voice AI for Email
      </p>
      
      <div className="h-8 mb-12">
        <p className="text-lg text-white/80 font-mono">
          {text}<span className="animate-pulse">_</span>
        </p>
      </div>
      
      <div className="flex gap-4 mb-16">
        <button className="px-8 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-white/90 transition-all duration-200">
          Start Demo
        </button>
        <button className="px-8 py-3 border-2 border-white text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-200">
          Watch Video
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-12 text-center">
        <div className="border-l-2 border-white/20 pl-4">
          <div className="text-3xl font-bold text-white font-mono">200+</div>
          <div className="text-white/40 text-xs uppercase tracking-wider">Hours/Year</div>
        </div>
        <div className="border-l-2 border-white/20 pl-4">
          <div className="text-3xl font-bold text-white font-mono">1.5s</div>
          <div className="text-white/40 text-xs uppercase tracking-wider">Latency</div>
        </div>
        <div className="border-l-2 border-white/20 pl-4">
          <div className="text-3xl font-bold text-white font-mono">99%</div>
          <div className="text-white/40 text-xs uppercase tracking-wider">Accuracy</div>
        </div>
      </div>
      
      <div className="absolute bottom-10">
        <div className="w-px h-16 bg-white/20 mx-auto mb-2"></div>
        <div className="text-white/40 text-xs uppercase tracking-wider">Scroll</div>
      </div>
    </div>
  );
}