import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailAgent } from "../src/services/emailAgent";
import { Summarizer } from "../src/services/summarizer";
import type { EmailContent } from "../src/types";

const SAMPLE_EMAIL: EmailContent = {
  id: "test-1",
  from: "founder@vip-client.com",
  subject: "Reminder: schedule investor sync",
  receivedAt: new Date().toISOString(),
  bodyText: "Can we schedule a catch-up next week to discuss the pilot rollout?",
};

describe("EmailAgent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a prioritized email with summary and suggestions", async () => {
    const agent = new EmailAgent();
    const output = await agent.run(SAMPLE_EMAIL);

  expect(output.email.urgency).toBeDefined();
  expect(output.summary.trim().length).toBeGreaterThan(0);
  expect(output.suggestions.length).toBeGreaterThan(0);
  });

  it("degrades gracefully when LLM returns empty response", async () => {
    const agent = new EmailAgent();
    vi.spyOn(Summarizer.prototype, "summarize").mockResolvedValueOnce("");
    const output = await agent.run(SAMPLE_EMAIL);
    expect(output.summary).toContain("Subject:");
  });
});
