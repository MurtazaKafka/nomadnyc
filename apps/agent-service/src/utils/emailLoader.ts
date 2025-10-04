import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { EmailContent } from "../types";

export async function loadSampleEmails(): Promise<EmailContent[]> {
  const filePath = resolve(process.cwd(), "data/sample-emails.json");
  const json = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(json) as EmailContent[];

  return parsed.map((email) => ({
    ...email,
    receivedAt: email.receivedAt ?? new Date().toISOString(),
  }));
}
