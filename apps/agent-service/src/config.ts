import { config as loadEnv } from "dotenv";

loadEnv();

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  phenomlApiKey: process.env.PHENOML_API_KEY ?? "",
  phenomlModel: process.env.PHENOML_MODEL ?? "nomad-email-priority",
  phenomlTimeoutMs: process.env.PHENOML_TIMEOUT_MS ? Number(process.env.PHENOML_TIMEOUT_MS) : 1500,
  airiaApiKey: process.env.AIRIA_API_KEY ?? "",
  email: {
    imapHost: process.env.IMAP_HOST ?? "",
    imapPort: process.env.IMAP_PORT ? Number(process.env.IMAP_PORT) : 993,
    imapSecure: process.env.IMAP_SECURE ? process.env.IMAP_SECURE !== "false" : true,
    imapUser: process.env.IMAP_USER ?? "",
    imapPassword: process.env.IMAP_PASSWORD ?? "",
    imapMailbox: process.env.IMAP_MAILBOX ?? "INBOX",
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    smtpSecure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== "false" : false,
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPassword: process.env.SMTP_PASSWORD ?? "",
    fromAddress: process.env.EMAIL_FROM_ADDRESS ?? process.env.SMTP_USER ?? "",
    syncBatchSize: process.env.EMAIL_SYNC_BATCH_SIZE ? Number(process.env.EMAIL_SYNC_BATCH_SIZE) : 10,
  },
};

export const isProduction = process.env.NODE_ENV === "production";
