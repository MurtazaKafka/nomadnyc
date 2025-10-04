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

  const getPrioritySymbol = (priority: string) => {
    switch (priority) {
      case 'urgent': return '■';
      case 'today': return '◧';
      case 'later': return '□';
      default: return '○';
    }
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const sorted = [...emails].sort((a, b) => {
        const priorityOrder = { urgent: 0, today: 1, later: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      setEmails(sorted);
    }, 2000);
  };

  return (
    <div className="border border-white/20 bg-black p-8 mb-12">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Email Prioritization</h3>
        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="px-6 py-2 border border-white text-white uppercase tracking-wider hover:bg-white hover:text-black transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Processing
            </span>
          ) : 'Process with AI'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="text-sm text-white/40 uppercase tracking-wider mb-4">
            Inbox — {emails.length} Messages
          </div>
          {emails.map((email) => {
            const isSelected = selectedEmail ? selectedEmail.id === email.id : false;
            return (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`border border-white/10 p-4 cursor-pointer hover:border-white/30 transition-all ${
                  isSelected ? 'border-white bg-white/5' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl text-white">{getPrioritySymbol(email.priority)}</span>
                      <span className="font-mono text-white text-sm">{email.from}</span>
                      <span className="text-white/30 text-xs">{email.confidence}%</span>
                    </div>
                    <div className="text-white text-sm font-medium mb-1">{email.subject}</div>
                    <div className="text-white/40 text-xs font-mono line-clamp-1">{email.preview}</div>
                  </div>
                  <div className="text-xs text-white/30 whitespace-nowrap ml-4 font-mono">
                    {email.timestamp}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 border border-white/20 text-white/60 uppercase">
                    {email.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border border-white/20 p-6">
          {selectedEmail ? (
            <div>
              <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-6">AI Analysis</h4>
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Summary</div>
                  <div className="text-white font-mono text-sm">
                    {selectedEmail.priority === 'urgent' 
                      ? '→ Requires immediate attention - contract review deadline today'
                      : selectedEmail.priority === 'today'
                      ? '→ Schedule meeting request for this week'
                      : '→ Informational content - review when convenient'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Actions</div>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 border border-white/20 text-white hover:bg-white hover:text-black transition-all text-sm uppercase tracking-wider">
                      Draft Response
                    </button>
                    <button className="w-full px-4 py-2 border border-white/20 text-white hover:bg-white hover:text-black transition-all text-sm uppercase tracking-wider">
                      Add to Calendar
                    </button>
                    <button className="w-full px-4 py-2 border border-white/20 text-white hover:bg-white hover:text-black transition-all text-sm uppercase tracking-wider">
                      Mark Complete
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Context</div>
                  <div className="text-white/60 text-sm font-mono border-l-2 border-white/20 pl-4">
                    {selectedEmail.priority === 'urgent' 
                      ? 'Related: Legal team flagged clause 4.2 for review'
                      : 'Previous: Met at tech conference last month'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl text-white/10 mb-4">[ ]</div>
                <div className="text-white/40 uppercase tracking-wider text-sm">Select an email</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}