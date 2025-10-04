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
      <div className="animate-pulse mb-8">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 text-center">
        NOMAD
      </h1>
      
      <p className="text-2xl md:text-3xl text-purple-200 mb-4 font-light">
        Voice AI for Your Inbox
      </p>
      
      <p className="text-xl text-gray-300 mb-12 h-8 text-center">
        {text}<span className="animate-pulse">|</span>
      </p>
      
      <div className="flex gap-6 mb-12">
        <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
          Start Demo
        </button>
        <button className="px-8 py-4 border border-purple-400 text-purple-400 font-semibold rounded-full hover:bg-purple-400/10 transition-all duration-300">
          Watch Video
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-8 text-center mt-16">
        <div>
          <div className="text-4xl font-bold text-white">200+</div>
          <div className="text-gray-400">Hours Saved/Year</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-white">&lt;1.5s</div>
          <div className="text-gray-400">Response Time</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-white">99%</div>
          <div className="text-gray-400">Accuracy Rate</div>
        </div>
      </div>
      
      <div className="absolute bottom-10 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}