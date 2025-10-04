import axios, { AxiosInstance } from "axios";
import type { EmailContent, EmailUrgency, PriorityMeta } from "../types";

export interface PhenomlPrediction {
  score: number;
  label: EmailUrgency;
  latencyMs?: number;
  modelVersion?: string;
}

export class PhenomlError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PhenomlError";
  }
}

export interface PhenomlClientOptions {
  apiKey: string;
  model: string;
  timeoutMs?: number;
  baseUrl?: string;
}

export class PhenomlClient {
  private readonly http: AxiosInstance;
  private readonly model: string;

  constructor(options: PhenomlClientOptions) {
    if (!options.apiKey) {
      throw new PhenomlError("Missing phenoml API key");
    }

    this.model = options.model;
    this.http = axios.create({
      baseURL: options.baseUrl ?? "https://api.phenoml.com/v1",
      timeout: options.timeoutMs ?? 1500,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async classify(email: EmailContent): Promise<{ prediction: PhenomlPrediction; meta: PriorityMeta }> {
    try {
      const response = await this.http.post("/classify", {
        model: this.model,
        inputs: [
          {
            id: email.id,
            subject: email.subject,
            body: email.bodyText,
            from: email.from,
            labels: email.labels,
          },
        ],
      });

      const prediction = this.parseResponse(response.data, email.id);
      return {
        prediction,
        meta: {
          source: "phenoml",
          modelVersion: prediction.modelVersion,
          latencyMs: prediction.latencyMs,
          rawScore: prediction.score,
        },
      };
    } catch (error) {
      throw new PhenomlError("Failed to fetch phenoml prediction", error);
    }
  }

  private parseResponse(data: unknown, emailId: string): PhenomlPrediction {
    if (!data || typeof data !== "object") {
      throw new PhenomlError("Invalid phenoml response payload");
    }

    const info = (data as { predictions?: Array<Record<string, unknown>> }).predictions?.[0];
    if (!info) {
      throw new PhenomlError("Missing predictions in phenoml response");
    }

    if (info.id && info.id !== emailId) {
      throw new PhenomlError(`Mismatched prediction id: expected ${emailId}, received ${info.id}`);
    }

    const score = typeof info.score === "number" ? info.score : Number(info.score);
    const label = typeof info.label === "string" ? (info.label as EmailUrgency) : undefined;

    if (Number.isNaN(score) || !label) {
      throw new PhenomlError("Incomplete prediction data from phenoml");
    }

    return {
      score,
      label,
      latencyMs: typeof info.latency_ms === "number" ? info.latency_ms : (info.latencyMs as number | undefined),
      modelVersion: typeof info.model_version === "string" ? (info.model_version as string) : (info.modelVersion as string | undefined),
    };
  }
}
