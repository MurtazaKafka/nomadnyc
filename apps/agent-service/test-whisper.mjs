#!/usr/bin/env node

import fs from 'fs';
import FormData from 'form-data';

const AGENT_SERVICE_URL = 'http://localhost:8081';

// Test phrases that simulate voice commands
const testCommands = [
  "What are my urgent emails?",
  "Reply to Jane about the contract",
  "Summarize today's emails",
  "Schedule a meeting with Tyler",
];

async function testWhisperWithAudioFile() {
  console.log('🎤 Testing Whisper transcription with voice commands...\n');
  console.log('=' .repeat(50));
  
  for (const command of testCommands) {
    try {
      // Generate audio from text
      console.log(`\n📢 Testing: "${command}"`);
      
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
      
      console.log(`   Generated audio: ${Math.round(audioBuffer.byteLength / 1024)}KB`);
      
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
        const error = await response.text();
        throw new Error(`Transcription failed: ${response.status} - ${error}`);
      }
      
      const result = await response.json();
      
      console.log('   ✅ Transcription successful!');
      console.log(`   📝 Transcribed: "${result.command.text}"`);
      console.log(`   🎯 Confidence: ${(result.command.confidence * 100).toFixed(0)}%`);
      console.log(`   🤖 AI Response: ${result.response.text}`);
      console.log(`   ⚡ Action: ${result.response.action}`);
      
      // Clean up temp file
      fs.unlinkSync(audioFile);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Voice command testing complete!\n');
}

// Test with a pre-recorded file if available
async function testWithRecordedFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`\nFile not found: ${filePath}`);
    return;
  }
  
  console.log(`\n\n🎧 Testing with recorded file: ${filePath}`);
  console.log('=' .repeat(50));
  
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
    console.log('📝 Transcribed text:', result.command.text);
    console.log('🤖 AI Response:', result.response.text);
    console.log('⚡ Action:', result.response.action);
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