import type { EmailContent, EmailUrgency, PrioritizedEmail, PriorityMeta } from "../types";
import type { PhenomlClient } from "./phenomlClient";

const DEFAULT_THRESHOLDS: Record<EmailUrgency, number> = {
  urgent: 0.7,
  today: 0.4,
  later: 0,
};

export interface PriorityClassifierOptions {
  thresholds?: Record<EmailUrgency, number>;
  phenomlClient?: PhenomlClient;
}

export class PriorityClassifier {
  private readonly thresholds: Record<EmailUrgency, number>;
  private readonly phenomlClient?: PhenomlClient;

  constructor(options: PriorityClassifierOptions = {}) {
    this.thresholds = options.thresholds ?? DEFAULT_THRESHOLDS;
    this.phenomlClient = options.phenomlClient;
  }

  async classify(email: EmailContent): Promise<PrioritizedEmail> {
    const heuristicScore = this.score(email);

    if (this.phenomlClient) {
      try {
        const { prediction, meta } = await this.phenomlClient.classify(email);
        const combinedScore = clamp(prediction.score * 0.8 + heuristicScore * 0.2);
        const urgency = prediction.label ?? this.toUrgency(combinedScore);
        return {
          ...email,
          urgency,
          confidence: combinedScore,
          priorityMeta: {
            ...meta,
            source: "phenoml",
            rawScore: prediction.score,
          },
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("Falling back to heuristic priority due to phenoml error", error);
      }
    }

    return this.fromHeuristic(email, heuristicScore);
  }

  private fromHeuristic(email: EmailContent, score: number): PrioritizedEmail {
    const urgency = this.toUrgency(score);
    const meta: PriorityMeta = {
      source: "heuristic",
      rawScore: score,
    };
    return {
      ...email,
      urgency,
      confidence: score,
      priorityMeta: meta,
    };
  }

  private score(email: EmailContent): number {
    const keywordBoost = this.keywordScore(email.bodyText + " " + email.subject);
    const senderBoost = this.senderHeuristic(email.from);
    const recencyBoost = this.recencyHeuristic(email.receivedAt);

    const baseScore = 0.2;
    return clamp(baseScore + keywordBoost + senderBoost + recencyBoost);
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

function clamp(value: number, min = 0, max = 1): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
