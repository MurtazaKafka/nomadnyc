'use client';

import { useState, useRef } from 'react';

interface VoiceDemoProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function VoiceDemo({ isPlaying, setIsPlaying }: VoiceDemoProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Start recording from mic
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      audioChunks.current = [];

      const formData = new FormData();
      formData.append('file', audioBlob, 'voicemail.webm');

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.text);
      setResponse('✅ Transcription complete');
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsListening(true);
    setTranscript('');
    setResponse('');
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsListening(false);
  };

  return (
    <div className="border border-white/20 bg-black p-8 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
          Voice Control
        </h3>
        <p className="text-white/40 uppercase text-sm tracking-wider">
          Record and transcribe
        </p>
      </div>

      <div className="flex justify-center mb-8">
        {isListening ? (
          <button
            onClick={stopRecording}
            className="w-32 h-32 border-2 border-red-500 bg-red-700 text-white"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="w-32 h-32 border-2 border-white/40 hover:border-white text-white"
          >
            Record
          </button>
        )}
      </div>

      {transcript && (
        <div className="text-white text-lg font-mono border-t border-white/20 pt-4">
          <strong>Transcript:</strong> {transcript}
        </div>
      )}

      {response && (
        <div className="text-white/60 text-sm mt-2">{response}</div>
      )}
    </div>
  );
}
