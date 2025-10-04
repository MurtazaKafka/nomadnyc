'use client';

export default function FeaturesSection() {
  const features = [
    {
      icon: '01',
      title: 'Smart Prioritization',
      description: 'AI-powered email ranking based on your patterns',
      tech: 'phenoml'
    },
    {
      icon: '02',
      title: 'Voice Interface',
      description: 'Sub-1500ms latency voice commands',
      tech: 'Whisper API'
    },
    {
      icon: '03',
      title: 'Tone Cloning',
      description: 'Responses that preserve your writing style',
      tech: 'Fine-tuned LLM'
    },
    {
      icon: '04',
      title: 'Real-time Analytics',
      description: 'Track email patterns and productivity',
      tech: 'Datadog MCP'
    },
    {
      icon: '05',
      title: 'Enterprise Security',
      description: 'SOC2 compliant with end-to-end encryption',
      tech: 'Zero-knowledge'
    },
    {
      icon: '06',
      title: 'Autonomous Actions',
      description: 'Schedule, draft, and delegate automatically',
      tech: 'Airia Framework'
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
          Core Features
        </h3>
        <p className="text-white/40 uppercase text-sm tracking-wider">
          Enterprise-grade AI capabilities
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-black p-6 hover:bg-white/5 transition-all duration-300"
          >
            <div className="text-4xl font-bold text-white/20 mb-4 font-mono">{feature.icon}</div>
            <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">
              {feature.title}
            </h4>
            <p className="text-white/60 text-sm mb-3">
              {feature.description}
            </p>
            <div className="text-xs text-white/40 font-mono uppercase">
              [{feature.tech}]
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}