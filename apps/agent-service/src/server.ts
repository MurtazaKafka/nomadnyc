import cors from "cors";
import express, { type Request, type Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import type { EmailAgentOutput, EmailContent } from "./types";
import { EmailAgent } from "./services/emailAgent";
import { loadSampleEmails } from "./utils/emailLoader";
import { VoiceService } from "./services/voiceService";
import { EmailResponseGenerator } from "./services/emailResponseGenerator";
import { EmailSyncService } from "./services/emailSyncService";
import type { SyncResult } from "./services/emailSyncService";
import { config } from "./config";

interface CreateEmailRequest
  extends Partial<Pick<EmailContent, "id" | "from" | "subject" | "bodyText" | "bodyHtml" | "receivedAt" | "threadId" | "labels">> {}

const app = express();
const agent = new EmailAgent();
const voiceService = new VoiceService();
const responseGenerator = new EmailResponseGenerator();
const emailSyncService = new EmailSyncService();
const emailStore = new Map<string, EmailAgentOutput>();
const PORT = Number(process.env.PORT ?? process.env.AGENT_PORT ?? 8081);
const corsOrigins = process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim());

type HydrateSource = "imap" | "sample" | "cache";

interface HydrateResult extends SyncResult {
  source: HydrateSource;
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(
  cors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : undefined,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", emails: emailStore.size });
});

app.get("/api/emails", async (_req: Request, res: Response) => {
  try {
    const hydrateResult = await hydrateEmailStore();
    if (hydrateResult.source) {
      res.setHeader("x-nomad-email-source", hydrateResult.source);
    }

    res.json(Array.from(emailStore.values()));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch emails", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

app.post("/api/emails", async (req: Request, res: Response) => {
  const payload = req.body as CreateEmailRequest | undefined;

  if (!payload || !payload.subject || !payload.bodyText || !payload.from) {
    return res.status(400).json({
      error: "Missing required fields: subject, bodyText, and from are required.",
    });
  }

  const email: EmailContent = {
    id: payload.id ?? randomUUID(),
    from: payload.from,
    subject: payload.subject,
    bodyText: payload.bodyText,
    bodyHtml: payload.bodyHtml,
    receivedAt: payload.receivedAt ?? new Date().toISOString(),
    threadId: payload.threadId,
    labels: payload.labels,
  };

  try {
    const output = await agent.run(email);
    emailStore.set(output.email.id, output);
    res.status(201).json(output);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to process email", error);
    res.status(500).json({ error: "Failed to process email" });
  }
});

app.delete("/api/emails/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  if (!emailStore.has(id)) {
    return res.status(404).json({ error: "Email not found" });
  }
  emailStore.delete(id);
  res.status(204).send();
});

app.post("/api/emails/refresh", async (_req: Request, res: Response) => {
  try {
    const hydrateResult = await hydrateEmailStore({ force: true });
    res.status(200).json({
      status: "refreshed",
      emails: emailStore.size,
      source: hydrateResult.source,
      stats: hydrateResult,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to refresh sample emails", error);
    res.status(500).json({ error: "Failed to refresh sample emails" });
  }
});

app.post("/api/voice/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const command = await voiceService.transcribeAudio(req.file.buffer);
    const response = await voiceService.processVoiceCommand(command);
    let responseText = response.text;

    if (response.action === "fetch_urgent") {
      await hydrateEmailStore();
      const urgentEmails = Array.from(emailStore.values())
        .filter((e) => e.email.urgency === "urgent")
        .sort((a, b) => new Date(b.email.receivedAt).getTime() - new Date(a.email.receivedAt).getTime());

      if (urgentEmails.length > 0) {
        const topEmail = urgentEmails[0];
        responseText = voiceService.formatEmailForSpeech(topEmail);
        response.metadata = {
          ...response.metadata,
          emailId: topEmail.email.id,
          subject: topEmail.email.subject,
          from: topEmail.email.from,
          urgency: topEmail.email.urgency,
        };
      } else {
        responseText = "You have no urgent emails.";
      }
    }

    let audioBase64: string | undefined;
    try {
      const audioBuffer = await voiceService.generateSpeech(responseText);
      audioBase64 = audioBuffer.toString("base64");
    } catch (error) {
      console.error("Failed to synthesize voice response:", error);
    }

    res.json({
      command,
      response: {
        ...response,
        text: responseText,
        audioBase64,
        audioContentType: "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Voice transcription failed:", error);
    res.status(500).json({ error: "Failed to process voice command" });
  }
});

app.post("/api/voice/speak", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const audioBuffer = await voiceService.generateSpeech(text);
    res.set("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error) {
    console.error("Speech generation failed:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

app.post("/api/emails/:id/reply", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emailOutput = emailStore.get(id);
    
    if (!emailOutput) {
      return res.status(404).json({ error: "Email not found" });
    }

    const options = req.body;
    const reply = await responseGenerator.generateReply(emailOutput.email, options);
    const delivery = await emailSyncService.sendReply(emailOutput.email, reply);

    res.json({
      ...reply,
      delivery,
    });
  } catch (error) {
    console.error("Failed to generate reply:", error);
    res.status(500).json({ error: "Failed to generate email reply" });
  }
});

app.post("/api/emails/:id/quick-responses", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emailOutput = emailStore.get(id);
    
    if (!emailOutput) {
      return res.status(404).json({ error: "Email not found" });
    }

    const quickResponses = await responseGenerator.generateQuickResponses(emailOutput.email);
    res.json({ responses: quickResponses });
  } catch (error) {
    console.error("Failed to generate quick responses:", error);
    res.status(500).json({ error: "Failed to generate quick responses" });
  }
});

app.post("/api/emails/ingest", async (req: Request, res: Response) => {
  try {
    const emails = req.body.emails;
    
    if (!Array.isArray(emails)) {
      return res.status(400).json({ error: "Expected an array of emails" });
    }

    const processedEmails = await Promise.all(
      emails.map(async (emailData) => {
        const email: EmailContent = {
          id: emailData.id || randomUUID(),
          from: emailData.from,
          subject: emailData.subject,
          bodyText: emailData.bodyText,
          bodyHtml: emailData.bodyHtml,
          receivedAt: emailData.receivedAt || new Date().toISOString(),
          threadId: emailData.threadId,
          labels: emailData.labels,
        };
        
        const output = await agent.run(email);
        emailStore.set(output.email.id, output);
        return output;
      })
    );

    res.json({
      message: `Successfully ingested ${processedEmails.length} emails`,
      emails: processedEmails,
    });
  } catch (error) {
    console.error("Failed to ingest emails:", error);
    res.status(500).json({ error: "Failed to ingest emails" });
  }
});

async function hydrateEmailStore(options: { force?: boolean; markAsSeen?: boolean } = {}): Promise<HydrateResult> {
  const { force = false, markAsSeen = false } = options;
  const errors: string[] = [];

  if (!force && emailStore.size > 0) {
    return {
      source: "cache",
      fetched: 0,
      processed: 0,
      skipped: 0,
      mailbox: emailSyncService.isImapConfigured() ? config.email.imapMailbox : undefined,
      errors,
    };
  }

  if (emailSyncService.isImapConfigured()) {
    if (force) {
      emailStore.clear();
    }

    try {
      const syncResult = await emailSyncService.syncMailbox(agent, emailStore, {
        limit: config.email.syncBatchSize,
        resetCache: force,
        markAsSeen,
      });

      if (syncResult.errors.length > 0) {
        errors.push(...syncResult.errors);
      }

      if (syncResult.processed > 0 || emailStore.size > 0) {
        return {
          source: "imap",
          ...syncResult,
          errors,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  if (force) {
    emailStore.clear();
  }

  if (emailStore.size === 0) {
    try {
      const emails = await loadSampleEmails();
      const outputs = await Promise.all(emails.map((email) => agent.run(email)));
      emailStore.clear();
      outputs.forEach((output) => {
        emailStore.set(output.email.id, output);
      });

      return {
        source: "sample",
        fetched: emails.length,
        processed: outputs.length,
        skipped: 0,
        mailbox: config.email.imapMailbox,
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  return {
    source: emailStore.size > 0 ? "cache" : "sample",
    fetched: 0,
    processed: 0,
    skipped: 0,
    mailbox: emailSyncService.isImapConfigured() ? config.email.imapMailbox : undefined,
    errors,
  };
}

async function main() {
  await hydrateEmailStore();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Agent service listening on http://localhost:${PORT}`);
  });
}

void main();
