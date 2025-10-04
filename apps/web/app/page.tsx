'use client';

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import EmailDemo from '@/components/EmailDemo';
import FeaturesSection from '@/components/FeaturesSection';
import MetricsSection from '@/components/MetricsSection';
import VoiceDemo from '@/components/VoiceDemo';
import TechStack from '@/components/TechStack';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <HeroSection />
      
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Your Inbox, Reimagined
          </h2>
          <p className="text-xl text-gray-300">
            Watch how Nomad transforms email management in real-time
          </p>
        </div>
        
        <EmailDemo />
        
        <VoiceDemo isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        
        <FeaturesSection />
        
        <MetricsSection />
        
        <TechStack />
      </section>
      
      <footer className="relative z-10 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">Built with ❤️ for NYC AI Agent Hackathon</p>
            <p className="text-sm">Powered by Datadog MCP, phenoml, Airia, and more</p>
          </div>
        </div>
      </footer>
    </main>
  );
}