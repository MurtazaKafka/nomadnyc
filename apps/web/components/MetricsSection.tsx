'use client';

import { useEffect, useState } from 'react';

export default function MetricsSection() {
  const [animatedValues, setAnimatedValues] = useState({
    users: 0,
    timeSaved: 0,
    accuracy: 0,
    emails: 0
  });

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

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white mb-4">
          Market Opportunity
        </h3>
        <p className="text-xl text-gray-300">
          Transforming productivity for millions of executives
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
          <h4 className="text-xl font-semibold text-white mb-6">Target Market</h4>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-400">US Executives</span>
                <span className="text-3xl font-bold text-white">
                  {animatedValues.users.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-2000"
                  style={{ width: `${(animatedValues.users / 4000000) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-400">Hours Saved/Year</span>
                <span className="text-3xl font-bold text-green-400">
                  {animatedValues.timeSaved}+
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-2000"
                  style={{ width: `${(animatedValues.timeSaved / 200) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-400">AI Accuracy</span>
                <span className="text-3xl font-bold text-blue-400">
                  {animatedValues.accuracy}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-2000"
                  style={{ width: `${animatedValues.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
          <h4 className="text-xl font-semibold text-white mb-6">Revenue Potential</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Individual Plan</div>
                <div className="text-2xl font-bold text-white">$15/month</div>
              </div>
              <div className="text-purple-400">
                B2C
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Business Plan</div>
                <div className="text-2xl font-bold text-white">$25/user/month</div>
              </div>
              <div className="text-blue-400">
                B2B
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-black/20 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Enterprise</div>
                <div className="text-2xl font-bold text-white">Custom</div>
              </div>
              <div className="text-green-400">
                B2E
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <div className="text-sm text-gray-400 mb-1">Projected ARR (1% market)</div>
              <div className="text-3xl font-bold text-white">$120M+</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-black/20 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Daily Emails Processed</div>
            <div className="text-2xl font-bold text-white">
              {animatedValues.emails.toLocaleString()}+
            </div>
          </div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-12 bg-gradient-to-t from-purple-500 to-pink-500 rounded animate-pulse" 
                style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 48 + 12}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}