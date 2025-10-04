import type { EmailContent, EmailUrgency, PrioritizedEmail } from "../types";

interface ClassificationResult {
  urgency: EmailUrgency;
  confidence: number;
}

const DEFAULT_THRESHOLDS: Record<EmailUrgency, number> = {
  urgent: 0.7,
  today: 0.4,
  later: 0,
};

export class PriorityClassifier {
  constructor(private readonly thresholds = DEFAULT_THRESHOLDS) {}

  classify(email: EmailContent): PrioritizedEmail {
    const score = this.score(email);
    const urgency = this.toUrgency(score);
    return {
      ...email,
      urgency,
      confidence: score,
    };
  }

  private score(email: EmailContent): number {
    const keywordBoost = this.keywordScore(email.bodyText + " " + email.subject);
    const senderBoost = this.senderHeuristic(email.from);
    const recencyBoost = this.recencyHeuristic(email.receivedAt);

    const baseScore = 0.2;
    return Math.min(1, baseScore + keywordBoost + senderBoost + recencyBoost);
  }

  private keywordScore(text: string): number {
    const KEYWORDS = [
      /urgent/i,
      /asap/i,
      /deadline/i,
      /investor/i,
      /wire/i,
      /contract/i,
    ];

    const matches = KEYWORDS.reduce((acc, regex) => (regex.test(text) ? acc + 1 : acc), 0);
    return Math.min(0.6, matches * 0.15);
  }

  private senderHeuristic(from: string): number {
    const trustedDomains = ["@vip-client.com", "@board.com", "@investor.com"];
    if (trustedDomains.some((domain) => from.endsWith(domain))) {
      return 0.25;
    }
    return 0;
  }

  private recencyHeuristic(receivedAt: string): number {
    const receivedTime = Date.parse(receivedAt);
    const ageMs = Date.now() - receivedTime;
    const sixHours = 6 * 60 * 60 * 1000;
    if (ageMs <= sixHours) {
      return 0.2;
    }
    if (ageMs <= 24 * 60 * 60 * 1000) {
      return 0.1;
    }
    return 0;
  }

  private toUrgency(score: number): EmailUrgency {
    if (score >= this.thresholds.urgent) return "urgent";
    if (score >= this.thresholds.today) return "today";
    return "later";
  }
}
