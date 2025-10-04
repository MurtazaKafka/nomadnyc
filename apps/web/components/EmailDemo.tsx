'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildAgentUrl } from '../lib/agentApi';

type EmailUrgency = 'urgent' | 'today' | 'later';

interface AgentPriorityMeta {
  source: string;
  modelVersion?: string;
  latencyMs?: number;
  rawScore: number;
}

interface AgentEmail {
  id: string;
  from: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  urgency: EmailUrgency;
  confidence: number;
  receivedAt: string;
  labels?: string[];
  priorityMeta?: AgentPriorityMeta;
}

interface AgentSuggestion {
  action: 'archive' | 'respond' | 'schedule' | 'delegate';
  rationale: string;
  metadata?: Record<string, unknown>;
}

interface AgentContextResource {
  title: string;
  summary: string;
  url?: string;
}

interface AgentEmailOutput {
  email: AgentEmail;
  summary: string;
  suggestions: AgentSuggestion[];
  contextualInsights: AgentContextResource[];
}

export default function EmailDemo() {
  const [emails, setEmails] = useState<AgentEmailOutput[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [generatedReply, setGeneratedReply] = useState<{subject: string; body: string} | null>(null);

  const getAgentUrl = useCallback((path: string) => buildAgentUrl(path), []);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(getAgentUrl('/emails'));
      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.status}`);
      }
      const data = (await response.json()) as AgentEmailOutput[];
      setEmails(data);
      setSelectedEmailId((prev) => {
        if (prev && data.some((item) => item.email.id === prev)) {
          return prev;
        }
        return data[0]?.email.id ?? null;
      });
      setError(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Unable to load emails', err);
      setEmails([]);
      setSelectedEmailId(null);
      setError('Unable to reach the agent service. Ensure it is running locally or set NEXT_PUBLIC_AGENT_SERVICE_URL.');
    } finally {
      setLoading(false);
    }
  }, [getAgentUrl]);

  useEffect(() => {
    void fetchEmails();
  }, [fetchEmails]);

  const selectedEmail = useMemo(
    () => emails.find((item) => item.email.id === selectedEmailId) ?? null,
    [emails, selectedEmailId]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(getAgentUrl('/emails/refresh'), {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`);
      }
      await fetchEmails();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Unable to refresh emails', err);
      setError('Failed to refresh sample emails. Confirm the agent service is reachable.');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchEmails, getAgentUrl]);

  const handleGenerateReply = useCallback(async (emailId: string, action: string) => {
    setIsGeneratingReply(true);
    try {
      const response = await fetch(getAgentUrl(`/emails/${emailId}/reply`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, tone: 'professional' }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate reply: ${response.status}`);
      }
      
      const reply = await response.json();
      setGeneratedReply({ subject: reply.subject, body: reply.body });
      setShowReplyModal(true);
    } catch (err) {
      console.error('Failed to generate reply:', err);
      setError('Failed to generate email reply.');
    } finally {
      setIsGeneratingReply(false);
    }
  }, [getAgentUrl]);

  const getPrioritySymbol = (priority: EmailUrgency) => {
    switch (priority) {
      case 'urgent':
        return '■';
      case 'today':
        return '◧';
      case 'later':
        return '□';
      default:
        return '○';
    }
  };

  const formatRelativeTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'unknown';
    }
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatCategory = (output: AgentEmailOutput) => {
    const primaryAction = output.suggestions[0]?.action ?? 'general';
    return primaryAction.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderSummary = (summary: string) => {
    return summary
      .split(/\n+/)
      .filter(Boolean)
      .map((line, index) => (
        <p key={index} className="text-white/90 text-sm font-mono">
          {line}
        </p>
      ));
  };

  return (
    <div className="border border-white/20 bg-black p-8 mb-12">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Email Prioritization</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-2 border border-white text-white uppercase tracking-wider hover:bg-white hover:text-black transition-all disabled:opacity-50"
          >
            {isRefreshing ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Refreshing
              </span>
            ) : 'Refresh samples'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="text-sm text-white/40 uppercase tracking-wider mb-4">
            Inbox — {emails.length} Messages
          </div>

          {loading ? (
            <div className="flex items-center justify-center border border-white/10 py-10 text-white/60 text-sm uppercase tracking-wider">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></span>
              Loading live data…
            </div>
          ) : emails.length === 0 ? (
            <div className="border border-white/10 p-6 text-center text-white/50 text-sm uppercase tracking-wider">
              No emails available. Trigger an ingestion or refresh samples.
            </div>
          ) : (
            emails.map((output) => {
              const { email } = output;
              const previewSource = output.summary || email.bodyText;
              const preview = previewSource.replace(/\s+/g, ' ').slice(0, 110) + (previewSource.length > 110 ? '…' : '');
              const confidence = Math.round(email.confidence * 100);
              const isSelected = selectedEmailId === email.id;

              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`border border-white/10 p-4 cursor-pointer hover:border-white/30 transition-all ${
                    isSelected ? 'border-white bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl text-white">{getPrioritySymbol(email.urgency)}</span>
                        <span className="font-mono text-white text-sm">{email.from}</span>
                        <span className="text-white/30 text-xs">{confidence}%</span>
                      </div>
                      <div className="text-white text-sm font-medium mb-1">{email.subject}</div>
                      <div className="text-white/40 text-xs font-mono line-clamp-1">{preview}</div>
                    </div>
                    <div className="text-xs text-white/30 whitespace-nowrap ml-4 font-mono">
                      {formatRelativeTime(email.receivedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 border border-white/20 text-white/60 uppercase">
                      {formatCategory(output)}
                    </span>
                    {email.priorityMeta && (
                      <span className="text-xs px-2 py-1 border border-white/10 text-white/30 uppercase">
                        {email.priorityMeta.source}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border border-white/20 p-6">
          {selectedEmail ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-3">Summary</h4>
                <div className="space-y-2">
                  {renderSummary(selectedEmail.summary)}
                </div>
              </div>

              <div>
                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Suggested Actions</h4>
                <div className="space-y-2">
                  {selectedEmail.suggestions.map((suggestion) => (
                    <button
                      key={suggestion.action}
                      onClick={() => {
                        if (suggestion.action === 'respond' && selectedEmail.email.id) {
                          handleGenerateReply(selectedEmail.email.id, 'acknowledge');
                        }
                      }}
                      disabled={isGeneratingReply}
                      className="w-full px-4 py-2 border border-white/20 text-white hover:bg-white hover:text-black transition-all text-sm uppercase tracking-wider text-left disabled:opacity-50"
                    >
                      <div className="font-semibold">
                        {suggestion.action.replace(/\b\w/g, (char) => char.toUpperCase())}
                        {suggestion.action === 'respond' && isGeneratingReply && (
                          <span className="ml-2">(Generating...)</span>
                        )}
                      </div>
                      <div className="text-white/70 normal-case text-xs mt-1">
                        {suggestion.rationale}
                      </div>
                    </button>
                  ))}
                  {selectedEmail.suggestions.length === 0 && (
                    <div className="text-white/40 text-xs uppercase tracking-wider border border-white/10 px-4 py-3">
                      No actions suggested.
                    </div>
                  )}
                </div>
              </div>

              {showReplyModal && generatedReply && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowReplyModal(false)}>
                  <div className="bg-black border border-white/20 p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-4">Generated Reply</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Subject</div>
                        <div className="text-white font-mono">{generatedReply.subject}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Body</div>
                        <div className="text-white font-mono whitespace-pre-wrap">{generatedReply.body}</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(generatedReply.body);
                            setShowReplyModal(false);
                          }}
                          className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all text-sm uppercase tracking-wider"
                        >
                          Copy & Close
                        </button>
                        <button 
                          onClick={() => setShowReplyModal(false)}
                          className="px-4 py-2 border border-white/20 text-white/60 hover:text-white transition-all text-sm uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Contextual Insights</h4>
                <div className="space-y-3">
                  {selectedEmail.contextualInsights.length > 0 ? (
                    selectedEmail.contextualInsights.map((insight) => (
                      <div key={insight.title} className="border-l-2 border-white/20 pl-4">
                        <div className="text-white font-semibold text-sm">{insight.title}</div>
                        <div className="text-white/60 text-xs mt-1">{insight.summary}</div>
                        {insight.url && (
                          <a
                            href={insight.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/40 text-xs underline mt-1 inline-block"
                          >
                            View resource
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-white/40 text-xs uppercase tracking-wider border border-white/10 px-4 py-3">
                      No additional context available.
                    </div>
                  )}
                </div>
              </div>

              {selectedEmail.email.priorityMeta && (
                <div className="border border-white/10 p-4">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Model Metadata</div>
                  <div className="text-white/60 text-xs font-mono">
                    Source: {selectedEmail.email.priorityMeta.source} · Raw Score:{' '}
                    {(selectedEmail.email.priorityMeta.rawScore * 100).toFixed(1)}%
                    {selectedEmail.email.priorityMeta.modelVersion && (
                      <span> · Model {selectedEmail.email.priorityMeta.modelVersion}</span>
                    )}
                    {selectedEmail.email.priorityMeta.latencyMs !== undefined && (
                      <span> · Latency {selectedEmail.email.priorityMeta.latencyMs}ms</span>
                    )}
                  </div>
                </div>
              )}
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