'use client';

export default function FeaturesSection() {
  const features = [
    {
      icon: '🎯',
      title: 'Smart Prioritization',
      description: 'AI-powered email ranking based on your patterns and preferences',
      tech: 'Powered by phenoml'
    },
    {
      icon: '🎙️',
      title: 'Voice-First Interface',
      description: 'Sub-1500ms latency voice commands using advanced Whisper integration',
      tech: 'OpenAI Whisper + Custom Models'
    },
    {
      icon: '✍️',
      title: 'Tone Cloning',
      description: 'Responses that sound like you, preserving your unique writing style',
      tech: 'Fine-tuned LLM'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track email patterns and productivity metrics',
      tech: 'Datadog MCP Integration'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'SOC2 compliant with end-to-end encryption',
      tech: 'Zero-knowledge architecture'
    },
    {
      icon: '🤖',
      title: 'Autonomous Actions',
      description: 'Schedule meetings, draft replies, and delegate tasks automatically',
      tech: 'Airia Agent Framework'
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white mb-4">
          Cutting-Edge Features
        </h3>
        <p className="text-xl text-gray-300">
          Built with the latest AI technologies for maximum impact
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h4 className="text-xl font-semibold text-white mb-2">
              {feature.title}
            </h4>
            <p className="text-gray-400 mb-3">
              {feature.description}
            </p>
            <div className="text-xs text-purple-400 font-mono">
              {feature.tech}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}