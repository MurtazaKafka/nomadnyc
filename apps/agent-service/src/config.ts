import { config as loadEnv } from "dotenv";

loadEnv();

export const config = {
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  phenomlApiToken: process.env.PHENOML_API_TOKEN ?? "",
  airiaApiKey: process.env.AIRIA_API_KEY ?? "",
};

export const isProduction = process.env.NODE_ENV === "production";
