import { config as loadEnv } from "dotenv";

loadEnv();

export const config = {
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  phenomlApiKey: process.env.PHENOML_API_KEY ?? "",
  phenomlModel: process.env.PHENOML_MODEL ?? "nomad-email-priority",
  phenomlTimeoutMs: process.env.PHENOML_TIMEOUT_MS ? Number(process.env.PHENOML_TIMEOUT_MS) : 1500,
  airiaApiKey: process.env.AIRIA_API_KEY ?? "",
};

export const isProduction = process.env.NODE_ENV === "production";
