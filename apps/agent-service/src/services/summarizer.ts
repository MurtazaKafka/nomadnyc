import OpenAI from "openai";
import { config } from "../config";
import type { EmailContent, EmailActionSuggestion } from "../types";

const MODEL = "gpt-4o-mini";

export class Summarizer {
  private readonly client: OpenAI | null;

  constructor() {
    this.client = config.openAiApiKey ? new OpenAI({ apiKey: config.openAiApiKey }) : null;
  }

  async summarize(email: EmailContent): Promise<string> {
    if (!this.client) {
      return this.fallbackSummary(email);
    }

    const prompt = `You are Nomad, an executive assistant. Summarize the email above in three bullet points, highlighting urgency, key ask, and next step.
Email Subject: ${email.subject}
Email Body:
${email.bodyText}`;

    const response = await this.client.responses.create({
      model: MODEL,
      input: prompt,
      temperature: 0.4,
      max_output_tokens: 200,
    });

    const text = response.output_text?.trim();
    return text && text.length > 0 ? text : this.fallbackSummary(email);
  }

  async suggestActions(email: EmailContent): Promise<EmailActionSuggestion[]> {
    const suggestions: EmailActionSuggestion[] = [];

    if (email.bodyText.match(/schedule|meeting|call/i)) {
      suggestions.push({
        action: "schedule",
        rationale: "Sender is requesting to set up a meeting.",
      });
    }

    if (email.bodyText.match(/can you|please advise|feedback/i)) {
      suggestions.push({
        action: "respond",
        rationale: "Sender is asking for a direct response.",
      });
    }

    if (email.bodyText.match(/newsletter|update/i)) {
      suggestions.push({
        action: "archive",
        rationale: "Likely informational update with no action required.",
      });
    }

    return suggestions.length > 0
      ? suggestions
      : [
          {
            action: "respond",
            rationale: "Default to drafting a reply when no obvious action detected.",
          },
        ];
  }

  private fallbackSummary(email: EmailContent): string {
    const preview = email.bodyText.replace(/\s+/g, " ").slice(0, 240);
    return `• Subject: ${email.subject}\n• From: ${email.from}\n• Preview: ${preview}${preview.length === 240 ? "…" : ""}`;
  }
}
