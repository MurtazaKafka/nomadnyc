import type { EmailAgentOutput, EmailContent } from "../types";
import { config } from "../config";
import { PriorityClassifier } from "./priorityClassifier";
import { PhenomlClient, PhenomlError } from "./phenomlClient";
import { ContextFetcher } from "./contextFetcher";
import { Summarizer } from "./summarizer";

export interface EmailAgentOptions {
  priorityClassifier?: PriorityClassifier;
  phenomlClient?: PhenomlClient | null;
  contextFetcher?: ContextFetcher;
  summarizer?: Summarizer;
}

export class EmailAgent {
  private readonly classifier: PriorityClassifier;
  private readonly context: ContextFetcher;
  private readonly summarizer: Summarizer;

  constructor(options: EmailAgentOptions = {}) {
    const phenomlClient =
      options.phenomlClient === undefined
        ? EmailAgent.maybeCreatePhenomlClient()
        : options.phenomlClient ?? undefined;

    this.classifier = options.priorityClassifier ?? new PriorityClassifier({ phenomlClient });
    this.context = options.contextFetcher ?? new ContextFetcher();
    this.summarizer = options.summarizer ?? new Summarizer();
  }

  async run(email: EmailContent): Promise<EmailAgentOutput> {
    const prioritized = await this.classifier.classify(email);
    const [summary, suggestions, insights] = await Promise.all([
      this.summarizer.summarize(email),
      this.summarizer.suggestActions(email),
      this.context.fetch(email),
    ]);

    // Fallback if summary is empty
    const finalSummary = summary || this.getFallbackSummary(email);

    return {
      email: prioritized,
      summary: finalSummary,
      suggestions,
      contextualInsights: insights,
    };
  }

  private static maybeCreatePhenomlClient(): PhenomlClient | undefined {
    if (!config.phenomlApiKey) {
      return undefined;
    }

    try {
      return new PhenomlClient({
        apiKey: config.phenomlApiKey,
        model: config.phenomlModel,
        timeoutMs: config.phenomlTimeoutMs,
      });
    } catch (error) {
      if (error instanceof PhenomlError) {
        // eslint-disable-next-line no-console
        console.warn("Failed to initialize phenoml client", error.message);
      } else {
        // eslint-disable-next-line no-console
        console.warn("Failed to initialize phenoml client", error);
      }
      return undefined;
    }
  }

  private getFallbackSummary(email: EmailContent): string {
    const preview = email.bodyText.replace(/\s+/g, " ").slice(0, 240);
    return `• Subject: ${email.subject}\n• From: ${email.from}\n• Preview: ${preview}${preview.length === 240 ? "…" : ""}`;
  }
}
