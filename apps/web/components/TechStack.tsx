'use client';

export default function TechStack() {
  const sponsors = [
    {
      name: 'Datadog MCP',
      description: 'Real-time monitoring and analytics',
      usage: 'Tracking response times and engagement',
      highlight: true
    },
    {
      name: 'phenoml',
      description: 'ML-powered email prioritization',
      usage: 'Training models on email patterns',
      highlight: true
    },
    {
      name: 'Airia',
      description: 'Autonomous agent orchestration',
      usage: 'Executing complex workflows',
      highlight: true
    },
    {
      name: 'OpenAI Whisper',
      description: 'Speech recognition',
      usage: 'Voice to text conversion'
    },
    {
      name: 'Claude 4',
      description: 'Language understanding',
      usage: 'Email summarization'
    },
    {
      name: 'Supabase',
      description: 'Real-time database',
      usage: 'User preferences storage'
    }
  ];

  const techStack = [
    'TypeScript', 'React Native', 'LangChain', 'Pinecone',
    'PostgreSQL', 'Redis', 'PyTorch', 'CUDA', 'Next.js'
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
          Technology Stack
        </h3>
        <p className="text-white/40 uppercase text-sm tracking-wider">
          Powered by Leading AI Tools
        </p>
      </div>

      {/* Sponsor Tools */}
      <div className="grid md:grid-cols-3 gap-px bg-white/10 mb-12">
        {sponsors.map((sponsor, index) => (
          <div
            key={index}
            className={`bg-black p-6 ${
              sponsor.highlight ? 'border-2 border-white' : ''
            }`}
          >
            {sponsor.highlight && (
              <div className="text-xs text-white font-bold uppercase tracking-wider mb-3">
                [Sponsor Tool]
              </div>
            )}
            <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">
              {sponsor.name}
            </h4>
            <p className="text-white/60 text-sm mb-3">
              {sponsor.description}
            </p>
            <div className="text-xs text-white/40 font-mono">
              → {sponsor.usage}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Tech Stack */}
      <div className="border border-white/20 p-8 mb-12">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Core Technologies</h4>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="px-4 py-2 border border-white/20 text-white/80 text-sm hover:bg-white hover:text-black transition-all uppercase"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Integration Diagram */}
      <div className="border border-white/20 p-8">
        <h4 className="text-xl font-bold text-white mb-8 text-center uppercase tracking-wider">
          Agent Architecture
        </h4>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-white flex items-center justify-center mb-3">
              <span className="text-3xl font-mono text-white">[1]</span>
            </div>
            <div className="text-white font-bold uppercase text-sm">Voice</div>
            <div className="text-xs text-white/40 font-mono">Whisper</div>
          </div>
          
          <div className="text-2xl text-white/40 rotate-0 md:rotate-0">→</div>
          
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-white flex items-center justify-center mb-3">
              <span className="text-3xl font-mono text-white">[2]</span>
            </div>
            <div className="text-white font-bold uppercase text-sm">Process</div>
            <div className="text-xs text-white/40 font-mono">phenoml</div>
          </div>
          
          <div className="text-2xl text-white/40">→</div>
          
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-white flex items-center justify-center mb-3">
              <span className="text-3xl font-mono text-white">[3]</span>
            </div>
            <div className="text-white font-bold uppercase text-sm">Execute</div>
            <div className="text-xs text-white/40 font-mono">Airia</div>
          </div>
          
          <div className="text-2xl text-white/40">→</div>
          
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-white flex items-center justify-center mb-3">
              <span className="text-3xl font-mono text-white">[4]</span>
            </div>
            <div className="text-white font-bold uppercase text-sm">Monitor</div>
            <div className="text-xs text-white/40 font-mono">Datadog</div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="text-center">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Latency</div>
            <div className="text-2xl font-bold text-white font-mono">&lt; 1500ms</div>
          </div>
        </div>
      </div>
    </div>
  );
}