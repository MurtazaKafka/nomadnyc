'use client';

import { useState, useEffect } from 'react';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  priority: 'urgent' | 'today' | 'later';
  confidence: number;
  timestamp: string;
  category: string;
}

const mockEmails: Email[] = [
  {
    id: '1',
    from: 'jane@vip-client.com',
    subject: 'URGENT: Contract redline needed by EOD',
    preview: 'Hi team, the investor counsel sent over the latest contract draft...',
    priority: 'urgent',
    confidence: 100,
    timestamp: '10 min ago',
    category: 'Legal'
  },
  {
    id: '2',
    from: 'tyler@portfolio.com',
    subject: 'Coffee next week?',
    preview: "Hey! I'll be near your office on Wednesday morning. Could we find 20 minutes...",
    priority: 'today',
    confidence: 40,
    timestamp: '2 hours ago',
    category: 'Meeting'
  },
  {
    id: '3',
    from: 'newsletter@industryinsights.com',
    subject: 'Weekly AI market digest',
    preview: "Here's what happened in the AI market this week...",
    priority: 'later',
    confidence: 20,
    timestamp: '5 hours ago',
    category: 'Newsletter'
  },
  {
    id: '4',
    from: 'sarah@board.com',
    subject: 'Q3 Board Deck - Need Review',
    preview: 'Please review the attached Q3 board deck before tomorrow...',
    priority: 'urgent',
    confidence: 95,
    timestamp: '30 min ago',
    category: 'Board'
  },
  {
    id: '5',
    from: 'dev@team.com',
    subject: 'Deploy notification: v2.4.1 successful',
    preview: 'Production deployment completed successfully with zero downtime...',
    priority: 'later',
    confidence: 15,
    timestamp: '6 hours ago',
    category: 'Tech'
  }
];

export default function EmailDemo() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Simulate email loading animation
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockEmails.length) {
        setEmails(prev => [...prev, mockEmails[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'today': return 'bg-yellow-500';
      case 'later': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Simulate reordering by priority
      const sorted = [...emails].sort((a, b) => {
        const priorityOrder = { urgent: 0, today: 1, later: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      setEmails(sorted);
    }, 2000);
  };

  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Live Email Prioritization</h3>
        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-all"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : 'Process with Nomad'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-sm text-gray-400 mb-2">Inbox ({emails.length} unread)</div>
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-all ${
                selectedEmail?.id === email.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{email.from}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full text-white ${getPriorityColor(email.priority)}`}>
                      {email.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{email.confidence}% confidence</span>
                  </div>
                  <div className="text-white/90 text-sm font-medium mb-1">{email.subject}</div>
                  <div className="text-gray-400 text-xs line-clamp-1">{email.preview}</div>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {email.timestamp}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                  {email.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          {selectedEmail ? (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">AI Analysis</h4>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Summary</div>
                  <div className="text-white">
                    {selectedEmail.priority === 'urgent' 
                      ? '⚡ Requires immediate attention - contract review deadline today'
                      : selectedEmail.priority === 'today'
                      ? '📅 Schedule meeting request for this week'
                      : '📚 Informational content - can be reviewed later'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">Suggested Actions</div>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all text-sm">
                      🎯 Draft Response with AI
                    </button>
                    <button className="w-full px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm">
                      📅 Add to Calendar
                    </button>
                    <button className="w-full px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-sm">
                      ✅ Mark as Completed
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Context</div>
                  <div className="text-white text-sm bg-black/20 rounded p-3">
                    {selectedEmail.priority === 'urgent' 
                      ? '📎 Related: Legal team flagged clause 4.2 for review yesterday'
                      : '🔗 Previous interaction: Met at tech conference last month'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an email to see AI analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}