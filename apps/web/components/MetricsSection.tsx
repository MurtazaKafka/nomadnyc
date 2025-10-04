'use client';

import { useEffect, useState } from 'react';

export default function MetricsSection() {
  const [animatedValues, setAnimatedValues] = useState({
    users: 0,
    timeSaved: 0,
    accuracy: 0,
    emails: 0
  });
  const [sparklineHeights, setSparklineHeights] = useState<number[]>(() => Array(20).fill(20));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = {
      users: 4000000,
      timeSaved: 200,
      accuracy: 99,
      emails: 15000000
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedValues({
        users: Math.floor(targets.users * progress),
        timeSaved: Math.floor(targets.timeSaved * progress),
        accuracy: Math.floor(targets.accuracy * progress),
        emails: Math.floor(targets.emails * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const generateHeights = () => Array.from({ length: 20 }, () => Math.random() * 40 + 10);
    setSparklineHeights(generateHeights());

    const timer = setInterval(() => {
      setSparklineHeights(generateHeights());
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
          Market Metrics
        </h3>
        <p className="text-white/40 uppercase text-sm tracking-wider">
          Quantifiable Impact
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border border-white/20 p-8">
          <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-8">Target Market</h4>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-white/40 uppercase text-xs tracking-wider">US Executives</span>
                <span className="text-3xl font-bold text-white font-mono">
                  {animatedValues.users.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1 bg-white/10">
                <div 
                  className="h-1 bg-white transition-all duration-2000"
                  style={{ width: `${(animatedValues.users / 4000000) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-white/40 uppercase text-xs tracking-wider">Hours Saved/Year</span>
                <span className="text-3xl font-bold text-white font-mono">
                  {animatedValues.timeSaved}+
                </span>
              </div>
              <div className="w-full h-1 bg-white/10">
                <div 
                  className="h-1 bg-white transition-all duration-2000"
                  style={{ width: `${(animatedValues.timeSaved / 200) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-white/40 uppercase text-xs tracking-wider">AI Accuracy</span>
                <span className="text-3xl font-bold text-white font-mono">
                  {animatedValues.accuracy}%
                </span>
              </div>
              <div className="w-full h-1 bg-white/10">
                <div 
                  className="h-1 bg-white transition-all duration-2000"
                  style={{ width: `${animatedValues.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-white/20 p-8">
          <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-8">Revenue Model</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-white/10">
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">Individual</div>
                <div className="text-2xl font-bold text-white font-mono">$15</div>
              </div>
              <div className="text-white/40 font-mono text-sm">
                /month
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border border-white/10">
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">Business</div>
                <div className="text-2xl font-bold text-white font-mono">$25</div>
              </div>
              <div className="text-white/40 font-mono text-sm">
                /user/mo
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border border-white/10">
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">Enterprise</div>
                <div className="text-2xl font-bold text-white font-mono">Custom</div>
              </div>
              <div className="text-white/40 font-mono text-sm">
                Contact
              </div>
            </div>

            <div className="mt-8 p-4 border-2 border-white">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Projected ARR (1%)</div>
              <div className="text-3xl font-bold text-white font-mono">$120M+</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Daily Processing</div>
            <div className="text-2xl font-bold text-white font-mono">
              {animatedValues.emails.toLocaleString()}+ emails
            </div>
          </div>
          <div className="flex gap-1">
            {sparklineHeights.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-white/20 animate-pulse"
                style={{
                  height: `${height}px`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}