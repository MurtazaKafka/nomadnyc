#!/usr/bin/env node

const fs = require('fs');
const FormData = require('form-data');

const AGENT_SERVICE_URL = 'http://localhost:8081';

// Test phrases that simulate voice commands
const testCommands = [
  "What are my urgent emails?",
  "Reply to Jane about the contract",
  "Summarize today's emails",
  "Schedule a meeting with Tyler",
];

async function testWhisperWithAudioFile() {
  console.log('Testing Whisper transcription...\n');
  
  // First, generate an audio file using TTS
  console.log('1. Generating test audio file...');
  
  for (const command of testCommands) {
    try {
      // Generate audio from text
      const ttsResponse = await fetch(`${AGENT_SERVICE_URL}/api/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: command }),
      });
      
      if (!ttsResponse.ok) {
        throw new Error(`TTS failed: ${ttsResponse.status}`);
      }
      
      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioFile = `/tmp/test_command_${Date.now()}.mp3`;
      fs.writeFileSync(audioFile, Buffer.from(audioBuffer));
      
      console.log(`\n2. Testing command: "${command}"`);
      console.log(`   Audio file: ${audioFile} (${Math.round(audioBuffer.byteLength / 1024)}KB)`);
      
      // Now transcribe the audio
      const form = new FormData();
      form.append('audio', fs.createReadStream(audioFile), {
        filename: 'audio.mp3',
        contentType: 'audio/mpeg',
      });
      
      const response = await fetch(`${AGENT_SERVICE_URL}/api/voice/transcribe`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('   ✅ Transcription successful!');
      console.log(`   Original: "${command}"`);
      console.log(`   Transcribed: "${result.command.text}"`);
      console.log(`   Confidence: ${result.command.confidence || 'N/A'}`);
      console.log(`   AI Response: ${result.response.text}`);
      console.log(`   Action: ${result.response.action}`);
      
      // Clean up temp file
      fs.unlinkSync(audioFile);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
}

// Test with a pre-recorded file if available
async function testWithRecordedFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`\nFile not found: ${filePath}`);
    return;
  }
  
  console.log(`\n\nTesting with recorded file: ${filePath}`);
  
  try {
    const form = new FormData();
    form.append('audio', fs.createReadStream(filePath));
    
    const response = await fetch(`${AGENT_SERVICE_URL}/api/voice/transcribe`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Transcription failed: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    console.log('✅ Transcription successful!');
    console.log('Transcribed text:', result.command.text);
    console.log('AI Response:', result.response.text);
    console.log('Action:', result.response.action);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
async function main() {
  await testWhisperWithAudioFile();
  
  // Optionally test with a real audio file if you have one
  const recordedFile = process.argv[2];
  if (recordedFile) {
    await testWithRecordedFile(recordedFile);
  }
}

main().catch(console.error);