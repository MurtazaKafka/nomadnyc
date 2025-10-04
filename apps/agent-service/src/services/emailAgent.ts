import type { EmailAgentOutput, EmailContent } from "../types";
import { PriorityClassifier } from "./priorityClassifier";
import { ContextFetcher } from "./contextFetcher";
import { Summarizer } from "./summarizer";

export class EmailAgent {
  private readonly classifier = new PriorityClassifier();
  private readonly context = new ContextFetcher();
  private readonly summarizer = new Summarizer();

  async run(email: EmailContent): Promise<EmailAgentOutput> {
    const prioritized = this.classifier.classify(email);
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

  private getFallbackSummary(email: EmailContent): string {
    const preview = email.bodyText.replace(/\s+/g, " ").slice(0, 240);
    return `• Subject: ${email.subject}\n• From: ${email.from}\n• Preview: ${preview}${preview.length === 240 ? "…" : ""}`;
  }
}
