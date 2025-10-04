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
  const animationRef = useRef<number>();

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
      }
      setWaveformData(Array(50).fill(0));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening]);

  const simulateVoiceCommand = () => {
    setIsListening(true);
    setTranscript('');
    setResponse('');
    
    // Simulate voice recognition
    setTimeout(() => {
      setTranscript("What's my most urgent email?");
    }, 1000);

    setTimeout(() => {
      setIsListening(false);
      setResponse("You have an urgent contract review from Jane at VIP Client. The legal team needs your feedback on clause 4.2 by end of day. Would you like me to draft a response?");
    }, 2500);
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-purple-500/20">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-4">Voice Control Demo</h3>
        <p className="text-gray-300">Experience hands-free email management</p>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={simulateVoiceCommand}
          disabled={isListening}
          className={`relative w-32 h-32 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50'
          }`}
        >
          <svg className="w-16 h-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {isListening && (
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
          )}
        </button>
      </div>

      {/* Waveform Visualization */}
      <div className="flex justify-center items-center h-20 mb-6">
        <div className="flex items-center gap-1">
          {waveformData.map((height, index) => (
            <div
              key={index}
              className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-100"
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
          ))}
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">You said:</div>
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white text-lg">{transcript}</p>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Nomad responds:</div>
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
            <p className="text-white text-lg">{response}</p>
          </div>
        </div>
      )}

      {/* Example Commands */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-purple-400 mb-2">📧</div>
          <div className="text-white font-semibold text-sm mb-1">Email Management</div>
          <div className="text-gray-400 text-xs">
            "Read my urgent emails"<br />
            "Reply to Sarah about the board deck"
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-blue-400 mb-2">📅</div>
          <div className="text-white font-semibold text-sm mb-1">Scheduling</div>
          <div className="text-gray-400 text-xs">
            "Schedule coffee with Tyler"<br />
            "What meetings do I have today?"
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-green-400 mb-2">✨</div>
          <div className="text-white font-semibold text-sm mb-1">AI Actions</div>
          <div className="text-gray-400 text-xs">
            "Draft a polite decline"<br />
            "Summarize long threads"
          </div>
        </div>
      </div>
    </div>
  );
}