
import { OpenAI } from "openai";
import { NextResponse } from "next/server";



const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
  });
  return NextResponse.json({ text: transcription.text });
}

