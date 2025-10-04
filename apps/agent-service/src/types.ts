export type EmailUrgency = "urgent" | "today" | "later";

export interface EmailMetadata {
  id: string;
  from: string;
  subject: string;
  receivedAt: string; // ISO string
  threadId?: string;
  labels?: string[];
}

export interface EmailContent extends EmailMetadata {
  bodyText: string;
  bodyHtml?: string;
  language?: string;
}

export interface PrioritizedEmail extends EmailContent {
  urgency: EmailUrgency;
  confidence: number;
}

export interface ContextResource {
  title: string;
  summary: string;
  url?: string;
}

export interface EmailActionSuggestion {
  action: "archive" | "respond" | "schedule" | "delegate";
  rationale: string;
  metadata?: Record<string, unknown>;
}

export interface EmailAgentOutput {
  email: PrioritizedEmail;
  summary: string;
  suggestions: EmailActionSuggestion[];
  contextualInsights: ContextResource[];
}
