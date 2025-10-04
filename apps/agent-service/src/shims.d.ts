interface NodeProcess {
  env: Record<string, string | undefined>;
  envByDefault?: Record<string, string | undefined>;
  cwd(): string;
  exitCode?: number;
}

declare const process: NodeProcess;

declare module "dotenv" {
  export function config(options?: { path?: string; debug?: boolean }): void;
}

declare module "openai" {
  interface OpenAIOptions {
    apiKey: string;
  }

  interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
  }

  export default class OpenAI {
    constructor(options: OpenAIOptions);
    chat: {
      completions: {
        create(input: {
          model: string;
          messages: ChatMessage[];
          temperature?: number;
          max_tokens?: number;
        }): Promise<{ choices: Array<{ message?: { content?: string } | null }> }>;
      };
    };
    responses: {
      create(input: {
        model: string;
        input: string;
        temperature?: number;
        max_output_tokens?: number;
      }): Promise<{ output_text?: string }>;
    };
  }
}

declare module "node:fs/promises" {
  export function readFile(path: string, encoding: "utf-8"): Promise<string>;
}

declare module "node:path" {
  export function resolve(...paths: string[]): string;
}

declare module "vitest" {
  export const describe: (name: string, fn: () => void | Promise<void>) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: (value: unknown) => {
    toBeDefined(): void;
    toMatch(regex: RegExp | string): void;
    toBeGreaterThan(num: number): void;
    toContain(text: string): void;
  };
  export const vi: any;
  export const beforeEach: (fn: () => void) => void;
}
