import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EmailAgent } from "./services/emailAgent";
import type { EmailContent } from "./types";

async function loadSampleEmails(): Promise<EmailContent[]> {
  const filePath = resolve(process.cwd(), "data/sample-emails.json");
  const json = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(json) as EmailContent[];
  return parsed.map((email) => ({
    ...email,
    receivedAt: email.receivedAt ?? new Date().toISOString(),
  }));
}

async function main() {
  const agent = new EmailAgent();
  const emails = await loadSampleEmails();

  console.log(`Processing ${emails.length} emails...`);
  for (const email of emails) {
    const output = await agent.run(email);
    console.log("\n=== Email ===");
    console.log(`${email.subject} (${email.from})`);
    console.log(`Urgency: ${output.email.urgency} (confidence ${(output.email.confidence * 100).toFixed(0)}%)`);
    if (output.email.priorityMeta) {
      const meta = output.email.priorityMeta;
      const latency = meta.latencyMs ? `${meta.latencyMs}ms` : "n/a";
      const model = meta.modelVersion ?? "heuristic";
      console.log(`Priority source: ${meta.source} • rawScore ${(meta.rawScore * 100).toFixed(0)}% • latency ${latency} • model ${model}`);
    }
    console.log("Summary:\n" + output.summary);
    console.log("Suggestions:");
    output.suggestions.forEach((suggestion) => {
      console.log(`- ${suggestion.action}: ${suggestion.rationale}`);
    });
    if (output.contextualInsights.length) {
      console.log("Contextual insights:");
      output.contextualInsights.forEach((insight) => {
        console.log(`• ${insight.title}: ${insight.summary}`);
      });
    }
  }
}

main().catch((err) => {
  console.error("Failed to process emails", err);
  process.exitCode = 1;
});
