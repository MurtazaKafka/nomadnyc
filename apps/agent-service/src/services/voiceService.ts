import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { config } from "../config";
import type { EmailAgentOutput } from "../types";

const TRANSCRIPTION_MODEL = "whisper-1";
const TTS_MODEL = "tts-1";
const TTS_VOICE = "nova";

export interface VoiceCommand {
  text: string;
  timestamp: string;
  confidence?: number;
}

export interface VoiceResponse {
  text: string;
  audioUrl?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export class VoiceService {
  private readonly openai: OpenAI | null;

  constructor() {
    this.openai = config.openaiApiKey
      ? new OpenAI({ apiKey: config.openaiApiKey })
      : null;
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<VoiceCommand> {
    const client = this.openai;

    if (!client) {
      return {
        text: "(transcription unavailable — OpenAI key missing)",
        timestamp: new Date().toISOString(),
        confidence: 0,
      };
    }

    try {
      const file = await toFile(audioBuffer, `voice-input-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const audioApi = (client as unknown as { audio?: any }).audio;

      if (!audioApi?.transcriptions?.create) {
        throw new Error("OpenAI audio transcription API unavailable");
      }

      const transcription = await audioApi.transcriptions.create({
        file,
        model: TRANSCRIPTION_MODEL,
        language: "en",
        response_format: "verbose_json",
      });

      const text = (transcription.text ?? "").trim();

      return {
        text: text.length > 0 ? text : "(no speech detected)",
        timestamp: new Date().toISOString(),
        confidence: transcription.segments?.[0]?.avg_logprob
          ? Number(Math.max(0, Math.min(1, Math.exp(transcription.segments[0].avg_logprob))))
          : 0.9,
      };
    } catch (error) {
      console.error("Failed to transcribe audio:", error);
      throw new Error("Audio transcription failed");
    }
  }

  async generateSpeech(text: string): Promise<Buffer> {
    const client = this.openai;

    if (!client) {
      return Buffer.from(`Speech synthesis disabled. Original text: ${text}`);
    }

    try {
      const audioApi = (client as unknown as { audio?: any }).audio;

      if (!audioApi?.speech?.create) {
        throw new Error("OpenAI speech API unavailable");
      }

      const mp3 = await audioApi.speech.create({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error("Failed to generate speech:", error);
      throw new Error("Speech generation failed");
    }
  }

  async processVoiceCommand(command: VoiceCommand): Promise<VoiceResponse> {
    const lowerText = command.text.toLowerCase();
    
    if (lowerText.includes("urgent") || lowerText.includes("priority")) {
      return {
        text: "I'll fetch your urgent emails right away.",
        action: "fetch_urgent",
        metadata: { filter: "urgent" }
      };
    } else if (lowerText.includes("summarize") || lowerText.includes("summary")) {
      return {
        text: "I'll provide a summary of your recent emails.",
        action: "summarize_emails",
        metadata: { count: 5 }
      };
    } else if (lowerText.includes("reply") || lowerText.includes("respond")) {
      const match = lowerText.match(/(?:reply|respond) to (\w+)/);
      const recipient = match ? match[1] : null;
      return {
        text: recipient ? `I'll help you draft a reply to ${recipient}.` : "I'll help you draft a reply.",
        action: "draft_reply",
        metadata: { recipient }
      };
    } else if (lowerText.includes("schedule") || lowerText.includes("meeting")) {
      return {
        text: "I'll help you schedule that meeting.",
        action: "schedule_meeting",
        metadata: {}
      };
    } else {
      return {
        text: "I can help you with your emails. You can ask me to read urgent emails, summarize threads, or draft replies.",
        action: "help",
        metadata: {}
      };
    }
  }

  formatEmailForSpeech(emailOutput: EmailAgentOutput): string {
    const { email, summary, suggestions } = emailOutput;
    
    let speechText = `Email from ${email.from}. Subject: ${email.subject}. `;
    
    if (email.urgency === "urgent") {
      speechText += "This is marked as urgent. ";
    }
    
    speechText += `Summary: ${summary.replace(/[•\n]/g, ". ")}. `;
    
    if (suggestions.length > 0) {
      speechText += `I suggest you ${suggestions[0].action} because ${suggestions[0].rationale}`;
    }
    
    return speechText;
  }
}