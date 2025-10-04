import { randomUUID } from "node:crypto";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer, { type Transporter } from "nodemailer";
import type { ParsedMail } from "mailparser";
import { config } from "../config";
import type { EmailAgentOutput, EmailContent } from "../types";
import type { EmailAgent } from "./emailAgent";

interface SyncOptions {
  limit?: number;
  resetCache?: boolean;
  markAsSeen?: boolean;
}

export interface SyncResult {
  fetched: number;
  processed: number;
  skipped: number;
  mailbox: string;
  errors: string[];
}

export interface SendReplyResult {
  delivered: boolean;
  messageId?: string;
  error?: string;
}

interface ReplyContext {
  rawMessageId: string;
  to: string[];
  cc: string[];
  replyTo: string[];
  subject: string;
  mailbox?: string;
  references: string[];
}

interface EmailWithContext {
  email: EmailContent;
  context: ReplyContext;
}

export class EmailSyncService {
  private replyContext = new Map<string, ReplyContext>();
  private transporter: Transporter | null = null;
  private transporterVerified = false;

  isImapConfigured(): boolean {
    const { imapHost, imapUser, imapPassword } = config.email;
    return Boolean(imapHost && imapUser && imapPassword);
  }

  isSmtpConfigured(): boolean {
    const { smtpHost, smtpUser, smtpPassword } = config.email;
    return Boolean(smtpHost && smtpUser && smtpPassword);
  }

  async syncMailbox(
    agent: EmailAgent,
    store: Map<string, EmailAgentOutput>,
    options: SyncOptions = {},
  ): Promise<SyncResult> {
    if (!this.isImapConfigured()) {
      return {
        fetched: 0,
        processed: 0,
        skipped: 0,
        mailbox: config.email.imapMailbox,
        errors: ["IMAP connection is not configured"],
      };
    }

    const limit = options.limit ?? config.email.syncBatchSize;

    if (options.resetCache) {
      this.replyContext.clear();
    }

    const results: EmailWithContext[] = [];
    const errors: string[] = [];
    let fetched = 0;

    const client = new ImapFlow({
      host: config.email.imapHost,
      port: config.email.imapPort,
      secure: config.email.imapSecure,
      auth: {
        user: config.email.imapUser,
        pass: config.email.imapPassword,
      },
      logger: false,
      emitLogs: false,
    });

    try {
      await client.connect();
      const mailbox = await client.mailboxOpen(config.email.imapMailbox, {
        readOnly: !options.markAsSeen,
      });

      if (mailbox.exists === 0) {
        await client.logout();
        return {
          fetched: 0,
          processed: 0,
          skipped: 0,
          mailbox: mailbox.path,
          errors,
        };
      }

      const unseenUids = (await client.search({ seen: false }, { uid: true })) || [];
      let uidsToFetch: number[] = unseenUids.slice(-limit);

      if (uidsToFetch.length === 0) {
        const start = Math.max(1, mailbox.exists - limit + 1);
        const range = `${start}:*`;
        for await (const message of client.fetch(range, this.buildFetchQuery())) {
          const parsed = await this.parseMessage(message.source);
          const emailWithContext = this.buildEmail(parsed, message.uid, mailbox.path, message.labels);
          results.push(emailWithContext);
          fetched++;

          if (results.length >= limit) {
            break;
          }
        }
      } else {
        for await (const message of client.fetch(uidsToFetch, this.buildFetchQuery(), { uid: true })) {
          const parsed = await this.parseMessage(message.source);
          const emailWithContext = this.buildEmail(parsed, message.uid, mailbox.path, message.labels);
          results.push(emailWithContext);
          fetched++;

          if (options.markAsSeen) {
            await client.messageFlagsAdd(message.uid, ["\\Seen"], { uid: true }).catch(() => undefined);
          }

          if (results.length >= limit) {
            break;
          }
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    } finally {
      await client.logout().catch(() => undefined);
    }

    let processed = 0;
    let skipped = 0;

    for (const entry of results) {
      const { email, context } = entry;

      this.replyContext.set(email.id, context);

      if (!options.resetCache && store.has(email.id)) {
        skipped++;
        continue;
      }

      try {
        const output = await agent.run(email);
        store.set(output.email.id, output);
        processed++;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    return {
      fetched,
      processed,
      skipped,
      mailbox: config.email.imapMailbox,
      errors,
    };
  }

  async sendReply(email: EmailContent, reply: { subject: string; body: string; bodyHtml?: string }): Promise<SendReplyResult> {
    if (!this.isSmtpConfigured()) {
      return { delivered: false, error: "SMTP connection is not configured" };
    }

    const transporter = await this.ensureTransporter();
    if (!transporter) {
      return { delivered: false, error: "Failed to initialize mail transporter" };
    }

    const context = this.replyContext.get(email.id);
    const fallbackRecipient = email.replyTo ?? email.from;
    const to = context?.replyTo?.length ? context.replyTo : [context?.to?.[0] ?? fallbackRecipient];
    const cc = context?.cc ?? [];
    const references = context?.references ?? [];
    const inReplyTo = context?.rawMessageId ?? email.messageId;

    try {
      const info = await transporter.sendMail({
        from: config.email.fromAddress || config.email.smtpUser,
        to,
        cc: cc.length > 0 ? cc : undefined,
        subject: reply.subject,
        text: reply.body,
        html: reply.bodyHtml,
        inReplyTo,
        references: references.length > 0 ? references : undefined,
      });

      return {
        delivered: true,
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        delivered: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private buildFetchQuery() {
    return {
      uid: true,
      flags: true,
      internalDate: true,
      envelope: true,
      source: true,
      labels: true,
    } as const;
  }

  private async parseMessage(source?: Buffer | null): Promise<ParsedMail> {
    const buffer = source ?? Buffer.from("");
    return simpleParser(buffer);
  }

  private buildEmail(
    parsed: ParsedMail,
    uid: number,
    mailbox: string,
    labels?: Set<string>,
  ): EmailWithContext {
    const rawMessageId = parsed.messageId ?? `<nomad-${uid}-${Date.now()}@mail>`;
    const normalizedId = this.normalizeMessageId(rawMessageId);

    const subject = parsed.subject?.trim() || "(no subject)";
    const fromText =
      parsed.from?.text ||
      parsed.from?.value?.map((addr): string => addr.address ?? addr.name ?? "").filter(Boolean).join(", ") ||
      "unknown";
    const replyTo = parsed.replyTo?.value?.map((item): string => item.address || item.name || fromText) ?? [];
    const to = parsed.to?.value?.map((item): string => item.address || item.name || "") ?? [];
    const cc = parsed.cc?.value?.map((item): string => item.address || item.name || "") ?? [];
    const references = parsed.references ?? [];

    const bodyText = this.extractBodyText(parsed);

    const email: EmailContent = {
      id: normalizedId,
      messageId: rawMessageId,
      from: fromText,
      subject,
      receivedAt: (parsed.date ?? new Date()).toISOString(),
      bodyText,
      bodyHtml: parsed.html ?? undefined,
      threadId: parsed.inReplyTo ?? normalizedId,
      labels: labels ? Array.from(labels) : undefined,
      replyTo: replyTo[0],
      mailbox,
    };

    const context: ReplyContext = {
      rawMessageId,
      to,
      cc,
      replyTo,
      subject,
      mailbox,
      references,
    };

    return { email, context };
  }

  private normalizeMessageId(value: string): string {
    return value.replace(/[<>]/g, "").trim() || randomUUID();
  }

  private extractBodyText(parsed: ParsedMail): string {
    if (parsed.text) {
      return parsed.text.trim();
    }

    if (parsed.html) {
      return parsed.html
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    if (parsed.textAsHtml) {
      return parsed.textAsHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    return "(empty message)";
  }

  private async ensureTransporter(): Promise<Transporter | null> {
    if (!this.isSmtpConfigured()) {
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtpHost,
        port: config.email.smtpPort,
        secure: config.email.smtpSecure,
        auth: {
          user: config.email.smtpUser,
          pass: config.email.smtpPassword,
        },
      });
    }

    if (!this.transporterVerified) {
      try {
        await this.transporter.verify();
        this.transporterVerified = true;
      } catch (error) {
        this.transporter = null;
        this.transporterVerified = false;
        throw error;
      }
    }

    return this.transporter;
  }
}
