import { describe, expect, it, vi } from "vitest";
import type { EmailContent } from "../src/types";
import { PriorityClassifier } from "../src/services/priorityClassifier";
import type { PhenomlClient } from "../src/services/phenomlClient";

const SAMPLE_EMAIL: EmailContent = {
  id: "phenoml-test",
  from: "ceo@vip-client.com",
  subject: "Quick sync on pilot",
  receivedAt: new Date().toISOString(),
  bodyText: "Could we grab 10 minutes to review the latest rollout?",
};

describe("PriorityClassifier", () => {
  it("uses phenoml response when client succeeds", async () => {
    const mockClient: Partial<PhenomlClient> = {
      classify: vi.fn().mockResolvedValue({
        prediction: {
          score: 0.9,
          label: "urgent",
          latencyMs: 420,
          modelVersion: "2025-09-18-01",
        },
        meta: {
          source: "phenoml",
          rawScore: 0.9,
          latencyMs: 420,
          modelVersion: "2025-09-18-01",
        },
      }),
    };

    const classifier = new PriorityClassifier({ phenomlClient: mockClient as PhenomlClient });
    const result = await classifier.classify(SAMPLE_EMAIL);

    expect(result.urgency).toBe("urgent");
    expect(result.priorityMeta?.source).toBe("phenoml");
    expect(result.priorityMeta?.modelVersion).toBe("2025-09-18-01");
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(mockClient.classify).toHaveBeenCalledTimes(1);
  });

  it("falls back to heuristic when phenoml throws", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockClient: Partial<PhenomlClient> = {
      classify: vi.fn().mockRejectedValue(new Error("timeout")),
    };

    const classifier = new PriorityClassifier({ phenomlClient: mockClient as PhenomlClient });
    const result = await classifier.classify(SAMPLE_EMAIL);

    expect(result.priorityMeta?.source).toBe("heuristic");
    expect(result.confidence).toBeGreaterThan(0);
    warnSpy.mockRestore();
  });
});
