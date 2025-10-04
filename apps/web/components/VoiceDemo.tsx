'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceDemoProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function VoiceDemo({ isPlaying, setIsPlaying }: VoiceDemoProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0));
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setWaveformData(prev => 
          prev.map(() => Math.random() * 100)
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setWaveformData(Array(50).fill(0));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isListening]);

  const simulateVoiceCommand = () => {
    setIsListening(true);
    setTranscript('');
    setResponse('');
    
    setTimeout(() => {
      setTranscript("What's my most urgent email?");
    }, 1000);

    setTimeout(() => {
      setIsListening(false);
      setResponse("You have an urgent contract review from Jane at VIP Client. The legal team needs your feedback on clause 4.2 by end of day. Would you like me to draft a response?");
    }, 2500);
  };

  return (
    <div className="border border-white/20 bg-black p-8 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Voice Control</h3>
        <p className="text-white/40 uppercase text-sm tracking-wider">Hands-free email management</p>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={simulateVoiceCommand}
          disabled={isListening}
          className={`relative w-32 h-32 border-2 transition-all duration-300 ${
            isListening 
              ? 'border-white bg-white/10' 
              : 'border-white/40 hover:border-white'
          }`}
        >
          <svg className="w-16 h-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {isListening && (
            <>
              <div className="absolute inset-0 border border-white animate-ping"></div>
              <div className="absolute -inset-4 border border-white/20 animate-ping animation-delay-200"></div>
            </>
          )}
        </button>
      </div>

      {/* Waveform Visualization */}
      <div className="flex justify-center items-center h-16 mb-8 border-t border-b border-white/10 py-4">
        <div className="flex items-center gap-0.5">
          {waveformData.map((height, index) => (
            <div
              key={index}
              className="w-0.5 bg-white/60 transition-all duration-100"
              style={{ height: `${height}%`, minHeight: '2px' }}
            />
          ))}
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mb-6">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">User Input</div>
          <div className="border-l-2 border-white/20 pl-4">
            <p className="text-white text-lg font-mono">&gt; {transcript}</p>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="mb-8">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">AI Response</div>
          <div className="border-l-2 border-white/20 pl-4">
            <p className="text-white text-lg font-mono">&lt; {response}</p>
          </div>
        </div>
      )}

      {/* Example Commands */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-white/10 p-4">
          <div className="text-white text-2xl mb-2 font-mono">[1]</div>
          <div className="text-white font-bold text-sm mb-1 uppercase">Email</div>
          <div className="text-white/40 text-xs font-mono">
            "Read urgent emails"<br />
            "Reply to Sarah"
          </div>
        </div>
        <div className="border border-white/10 p-4">
          <div className="text-white text-2xl mb-2 font-mono">[2]</div>
          <div className="text-white font-bold text-sm mb-1 uppercase">Schedule</div>
          <div className="text-white/40 text-xs font-mono">
            "Book with Tyler"<br />
            "Today's meetings"
          </div>
        </div>
        <div className="border border-white/10 p-4">
          <div className="text-white text-2xl mb-2 font-mono">[3]</div>
          <div className="text-white font-bold text-sm mb-1 uppercase">Actions</div>
          <div className="text-white/40 text-xs font-mono">
            "Draft decline"<br />
            "Summarize threads"
          </div>
        </div>
      </div>
    </div>
  );
}