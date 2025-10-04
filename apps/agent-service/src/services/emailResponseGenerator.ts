import OpenAI from "openai";
import { randomUUID } from "node:crypto";
import type { EmailContent, PrioritizedEmail } from "../types";
import { config } from "../config";

export interface EmailReplyOptions {
  tone?: "formal" | "casual" | "friendly" | "professional";
  action?: "accept" | "decline" | "acknowledge" | "inquire" | "custom";
  includeContext?: boolean;
  customInstructions?: string;
}

export interface GeneratedReply {
  subject: string;
  body: string;
  bodyHtml?: string;
  metadata: {
    originalEmailId: string;
    generatedAt: string;
    tone: string;
    action: string;
  };
}

export interface DraftEmail {
  id: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  metadata: {
    createdAt: string;
    tone: string;
    intendedRecipient?: string;
    topic?: string;
    source: "voice-compose";
  };
}

export class EmailResponseGenerator {
  private readonly openai: OpenAI | null;

  constructor() {
    const apiKey = config.openaiApiKey || process.env.OPENAI_API_KEY;
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async generateReply(
    email: EmailContent | PrioritizedEmail,
    options: EmailReplyOptions = {}
  ): Promise<GeneratedReply> {
    const tone = options.tone || "professional";
    const action = options.action || "acknowledge";

    if (!this.openai) {
      return this.buildFallbackReply(email, tone, action);
    }

    const systemPrompt = this.buildSystemPrompt(tone, action);
    const userPrompt = this.buildUserPrompt(email, options);

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      const subject = this.generateSubject(email.subject, action);
      const body = this.formatResponseBody(responseText);
      const bodyHtml = this.convertToHtml(body);

      return {
        subject,
        body,
        bodyHtml,
        metadata: {
          originalEmailId: email.id,
          generatedAt: new Date().toISOString(),
          tone,
          action,
        },
      };
    } catch (error) {
      console.error("Failed to generate email reply:", error);
      throw new Error("Email reply generation failed");
    }
  }

  async generateBulkReplies(
    emails: (EmailContent | PrioritizedEmail)[],
    commonOptions: EmailReplyOptions = {}
  ): Promise<GeneratedReply[]> {
    const replies = await Promise.all(
      emails.map(email => this.generateReply(email, commonOptions))
    );
    return replies;
  }

  async generateDraftEmail(input: {
    recipientHint?: string;
    topicHint?: string;
    tone?: "formal" | "casual" | "friendly" | "professional";
    commandText: string;
  }): Promise<DraftEmail> {
    const tone = input.tone ?? "professional";
    const createdAt = new Date().toISOString();
    const fallback = this.buildDraftFallback({ ...input, tone, createdAt });

    if (!this.openai) {
      return fallback;
    }

    const recipientLine = input.recipientHint
      ? `The email should be addressed to ${input.recipientHint}.`
      : "";
    const topicLine = input.topicHint
      ? `The email is about: ${input.topicHint}.`
      : "";

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You are an efficient executive assistant drafting outbound emails. " +
              "Write concise, actionable notes with a clear ask and next steps. Provide only the email body text.",
          },
          {
            role: "user",
            content: [
              recipientLine,
              topicLine,
              `Voice command transcript: ${input.commandText}.`,
              "Craft the email in a professional yet approachable tone.",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
      });

      const body = completion.choices[0]?.message?.content?.trim();
      if (!body) {
        return fallback;
      }

      const subject = this.titleCase(
        input.topicHint ?? this.deriveSubjectFromBody(body) ?? "Draft email",
      );

      return {
        id: randomUUID(),
        subject,
        body,
        bodyHtml: this.convertToHtml(body),
        metadata: {
          createdAt,
          tone,
          intendedRecipient: input.recipientHint,
          topic: input.topicHint,
          source: "voice-compose",
        },
      };
    } catch (error) {
      console.error("Failed to generate outbound email draft:", error);
      return fallback;
    }
  }

  private buildFallbackReply(
    email: EmailContent | PrioritizedEmail,
    tone: string,
    action: string,
  ): GeneratedReply {
    const subject = this.generateSubject(email.subject, action);
    const recipient = this.extractDisplayName(email.from);
    const greeting = `Hi ${recipient},`;
    const bodyLines = [
      greeting,
      "",
      `Thanks for your message about “${email.subject}”. I'll review this and follow up shortly.`,
      "",
      "Best,",
      "Nomad Assistant",
    ];

    const body = bodyLines.join("\n");

    return {
      subject,
      body,
      bodyHtml: this.convertToHtml(body),
      metadata: {
        originalEmailId: email.id,
        generatedAt: new Date().toISOString(),
        tone,
        action,
      },
    };
  }

  private buildSystemPrompt(tone: string, action: string): string {
    const toneInstructions = {
      formal: "Use formal business language, proper titles, and maintain professional distance.",
      casual: "Use relaxed, conversational language while remaining respectful.",
      friendly: "Use warm, approachable language with a personal touch.",
      professional: "Use clear, concise business language that is professional yet personable.",
    };

    const actionInstructions = {
      accept: "Accept the proposal or invitation with enthusiasm and confirm next steps.",
      decline: "Politely decline while expressing appreciation and leaving the door open for future opportunities.",
      acknowledge: "Acknowledge receipt and indicate you will review and respond appropriately.",
      inquire: "Ask clarifying questions to better understand the request or proposal.",
      custom: "Respond according to the custom instructions provided.",
    };

    return `You are an AI email assistant helping to draft professional email responses.
Tone: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional}
Action: ${actionInstructions[action as keyof typeof actionInstructions] || actionInstructions.acknowledge}

Keep responses concise, clear, and appropriate for business communication.
Do not include email headers, signatures, or formatting instructions in your response.
Provide only the body text of the email.`;
  }

  private buildUserPrompt(
    email: EmailContent | PrioritizedEmail,
    options: EmailReplyOptions
  ): string {
    let prompt = `Please draft a reply to this email:\n\n`;
    prompt += `From: ${email.from}\n`;
    prompt += `Subject: ${email.subject}\n`;
    prompt += `Content: ${email.bodyText}\n\n`;

    if (options.customInstructions) {
      prompt += `Additional instructions: ${options.customInstructions}\n`;
    }

    if (options.includeContext && "urgency" in email) {
      prompt += `Note: This email is marked as ${email.urgency} priority.\n`;
    }

    return prompt;
  }

  private extractDisplayName(from: string): string {
    const nameMatch = from.match(/"?([^"<]+)"?\s*<.*>/);
    if (nameMatch?.[1]) {
      return nameMatch[1].trim();
    }

    const localPart = from.split("@")[0] ?? "there";
    return localPart
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) || "there";
  }

  private generateSubject(originalSubject: string, action: string): string {
    const prefixes = {
      accept: "Re: ",
      decline: "Re: ",
      acknowledge: "Re: ",
      inquire: "Re: ",
      custom: "Re: ",
    };

    const prefix = prefixes[action as keyof typeof prefixes] || "Re: ";
    
    if (originalSubject.toLowerCase().startsWith("re:")) {
      return originalSubject;
    }
    
    return `${prefix}${originalSubject}`;
  }

  private formatResponseBody(text: string): string {
    return text
      .trim()
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s+/gm, "");
  }

  private convertToHtml(text: string): string {
    return text
      .split("\n\n")
      .map(paragraph => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }

  private buildDraftFallback(input: {
    recipientHint?: string;
    topicHint?: string;
    tone: string;
    commandText: string;
    createdAt: string;
  }): DraftEmail {
    const recipient = input.recipientHint ?? "there";
    const subject = this.titleCase(input.topicHint ?? "Draft email");
    const body = [
      `Hi ${this.extractDisplayName(recipient)},`,
      "",
      input.topicHint
        ? `I wanted to reach out regarding ${input.topicHint}.`
        : "I wanted to follow up based on our recent conversation.",
      "",
      "Let me know your thoughts or if there's anything else you need.",
      "",
      "Best,",
      "Nomad Assistant",
    ].join("\n");

    return {
      id: randomUUID(),
      subject,
      body,
      bodyHtml: this.convertToHtml(body),
      metadata: {
        createdAt: input.createdAt,
        tone: input.tone,
        intendedRecipient: input.recipientHint,
        topic: input.topicHint,
        source: "voice-compose",
      },
    };
  }

  private titleCase(text: string): string {
    return text
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private deriveSubjectFromBody(body: string): string | null {
    const firstLine = body.split("\n").find((line) => line.trim().length > 0);
    if (!firstLine) {
      return null;
    }

    const trimmed = firstLine.replace(/^[^a-zA-Z0-9]+/, "").trim();
    return trimmed.length > 3 ? trimmed.slice(0, 60) : null;
  }

  async generateQuickResponses(email: EmailContent | PrioritizedEmail): Promise<string[]> {
    const quickResponses = [
      "I'll review this and get back to you shortly.",
      "Thank you for your email. I'll look into this right away.",
      "I appreciate you bringing this to my attention. Let me investigate and respond properly.",
      "Thanks for reaching out. I'll need to check on this and will follow up soon.",
      "I've received your message and will respond with the information you need.",
    ];

    if (!this.openai) {
      return quickResponses.slice(0, 3);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Generate 3 short, professional quick response options for the given email. Each response should be one sentence and under 20 words.",
          },
          {
            role: "user",
            content: `Email subject: ${email.subject}\nEmail preview: ${email.bodyText.slice(0, 200)}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      const responses = completion.choices[0]?.message?.content || "";
      return responses
        .split("\n")
        .filter((response) => response.trim().length > 0)
        .map((response) => response.replace(/^\d+\.\s*/, "").trim())
        .slice(0, 3);
    } catch (error) {
      console.error("Failed to generate quick responses:", error);
      return quickResponses.slice(0, 3);
    }
  }
}