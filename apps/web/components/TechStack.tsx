'use client';

export default function TechStack() {
  const sponsors = [
    {
      name: 'Datadog MCP',
      description: 'Real-time monitoring and analytics for email processing metrics',
      usage: 'Tracking response times, error rates, and user engagement',
      highlight: true
    },
    {
      name: 'phenoml',
      description: 'Advanced ML model for email prioritization',
      usage: 'Training custom models on user email patterns',
      highlight: true
    },
    {
      name: 'Airia',
      description: 'Agent orchestration and autonomous actions',
      usage: 'Executing complex email workflows without manual intervention',
      highlight: true
    },
    {
      name: 'OpenAI Whisper',
      description: 'State-of-the-art speech recognition',
      usage: 'Converting voice commands to text with high accuracy'
    },
    {
      name: 'Claude 4',
      description: 'Advanced language understanding',
      usage: 'Email summarization and response generation'
    },
    {
      name: 'Supabase',
      description: 'Real-time database and authentication',
      usage: 'Storing user preferences and email metadata'
    }
  ];

  const techStack = [
    'TypeScript', 'React Native', 'LangChain', 'Pinecone',
    'PostgreSQL', 'Redis', 'PyTorch', 'CUDA', 'Next.js'
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-white mb-4">
          Powered by Leading AI Technologies
        </h3>
        <p className="text-xl text-gray-300">
          Built with hackathon sponsor tools for maximum innovation
        </p>
      </div>

      {/* Sponsor Tools */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {sponsors.map((sponsor, index) => (
          <div
            key={index}
            className={`rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 ${
              sponsor.highlight 
                ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500' 
                : 'bg-white/5 border border-white/10'
            }`}
          >
            {sponsor.highlight && (
              <div className="inline-block px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded mb-3">
                SPONSOR TOOL
              </div>
            )}
            <h4 className="text-xl font-semibold text-white mb-2">
              {sponsor.name}
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              {sponsor.description}
            </p>
            <div className="text-xs text-purple-400">
              <span className="font-semibold">Use case:</span> {sponsor.usage}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Tech Stack */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8">
        <h4 className="text-lg font-semibold text-white mb-4">Full Tech Stack</h4>
        <div className="flex flex-wrap gap-3">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-white/10 text-gray-300 rounded-full text-sm hover:bg-white/20 transition-all"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Integration Diagram */}
      <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/20">
        <h4 className="text-xl font-semibold text-white mb-6 text-center">
          Autonomous Agent Architecture
        </h4>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🎙️</span>
            </div>
            <div className="text-white font-semibold">Voice Input</div>
            <div className="text-xs text-gray-400">Whisper API</div>
          </div>
          
          <div className="text-2xl text-gray-400">→</div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="text-white font-semibold">AI Processing</div>
            <div className="text-xs text-gray-400">phenoml + Claude</div>
          </div>
          
          <div className="text-2xl text-gray-400">→</div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-white font-semibold">Agent Actions</div>
            <div className="text-xs text-gray-400">Airia Framework</div>
          </div>
          
          <div className="text-2xl text-gray-400">→</div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-white font-semibold">Monitoring</div>
            <div className="text-xs text-gray-400">Datadog MCP</div>
          </div>
        </div>
      </div>
    </div>
  );
}