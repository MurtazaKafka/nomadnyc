'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { buildAgentUrl } from '../lib/agentApi';

interface VoiceDemoProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const MAX_RECORDING_DURATION_MS = 6000;

export default function VoiceDemo({ isPlaying, setIsPlaying }: VoiceDemoProps) {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [responseMetadata, setResponseMetadata] = useState<Record<string, unknown> | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0));

  const animationRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const stopTimeoutRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);

  const getAgentUrl = useCallback(buildAgentUrl, []);

  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setWaveformData((prev) => prev.map(() => Math.random() * 100));
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setWaveformData(Array(50).fill(0));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isListening]);

  useEffect(() => {
    const element = audioElementRef.current;

    if (!element) {
      return undefined;
    }

    if (!audioUrl) {
      element.pause();
      element.removeAttribute('src');
      element.load();
      setIsPlaying(false);
      return undefined;
    }

    element.src = audioUrl;
    element.currentTime = 0;

    const playPromise = element.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((playError) => {
          console.error('Failed to play synthesized audio', playError);
          setIsPlaying(false);
        });
    }

    return () => {
      element.pause();
    };
  }, [audioUrl, setIsPlaying]);

  const cleanupStream = useCallback(() => {
    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  const uploadRecording = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      setIsRecording(false);
      setIsListening(false);
      cleanupStream();
      return;
    }

    setIsProcessing(true);

    try {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'command.webm');

      const upstream = await fetch(getAgentUrl('/voice/transcribe'), {
        method: 'POST',
        body: formData,
      });

      if (!upstream.ok) {
        throw new Error(`Transcription failed with status ${upstream.status}`);
      }

  const payload = await upstream.json();
      setTranscript(payload.command?.text ?? '(no speech detected)');
      setResponse(payload.response?.text ?? '');
  setResponseMetadata(payload.response?.metadata ?? null);
      const audioBase64: string | undefined = payload.response?.audioBase64;
      const audioMime: string = payload.response?.audioContentType ?? 'audio/mpeg';

      if (audioBase64) {
        try {
          const binaryString = window.atob(audioBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i += 1) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: audioMime });
          if (audioObjectUrlRef.current) {
            URL.revokeObjectURL(audioObjectUrlRef.current);
          }
          const objectUrl = URL.createObjectURL(blob);
          audioObjectUrlRef.current = objectUrl;
          setAudioUrl(objectUrl);
        } catch (decodeError) {
          console.error('Failed to decode audio response', decodeError);
          setAudioUrl(null);
        }
      } else {
        setAudioUrl(null);
      }
      setError(null);
    } catch (err) {
      console.error('Unable to process voice command', err);
      setError('Unable to reach the voice agent. Ensure the agent service is running.');
      setAudioUrl(null);
      setResponseMetadata(null);
    } finally {
      audioChunksRef.current = [];
      cleanupStream();
      setIsProcessing(false);
      setIsRecording(false);
      setIsListening(false);
    }
  }, [cleanupStream, getAgentUrl]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) {
      return;
    }

    try {
      setError(null);
      setTranscript('');
      setResponse('');
  setResponseMetadata(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        void uploadRecording();
      };

      recorder.start();

      setIsListening(true);
      setIsRecording(true);

      stopTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, MAX_RECORDING_DURATION_MS);
    } catch (err) {
      console.error('Failed to access microphone', err);
      setError('Microphone permission denied or unavailable.');
      cleanupStream();
      setIsListening(false);
      setIsRecording(false);
    }
  }, [cleanupStream, isProcessing, isRecording, uploadRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
      cleanupStream();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }
    };
  }, [cleanupStream, stopRecording]);

  const handleInteraction = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString();
  };

  const emailHighlights = Array.isArray((responseMetadata as any)?.emails)
    ? ((responseMetadata as any).emails as Array<any>).map((item) => ({
        id: typeof item?.id === 'string' ? item.id : undefined,
        subject: typeof item?.subject === 'string' ? item.subject : undefined,
        from: typeof item?.from === 'string' ? item.from : undefined,
        receivedAt: typeof item?.receivedAt === 'string' ? item.receivedAt : undefined,
        urgency: typeof item?.urgency === 'string' ? item.urgency : undefined,
      }))
    : [];

  const draftRaw = (responseMetadata as any)?.draft;
  const draftDetails = draftRaw && typeof draftRaw === 'object'
    ? {
        subject: typeof draftRaw.subject === 'string' ? draftRaw.subject : undefined,
        body: typeof draftRaw.body === 'string' ? draftRaw.body : undefined,
      }
    : null;

  const draftPreview = typeof (responseMetadata as any)?.preview === 'string'
    ? (responseMetadata as any).preview as string
    : undefined;

  const draftId = typeof (responseMetadata as any)?.draftId === 'string'
    ? (responseMetadata as any).draftId as string
    : undefined;

  return (
    <div className="border border-white/20 bg-black p-8 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Voice Control</h3>
        <p className="text-white/40 uppercase text-sm tracking-wider">
          Hands-free email management powered by Whisper
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleInteraction}
          disabled={isProcessing}
          className={`relative w-32 h-32 border-2 transition-all duration-300 ${
            isListening ? 'border-white bg-white/10' : 'border-white/40 hover:border-white'
          } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <svg
            className="w-16 h-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          {isListening && (
            <>
              <div className="absolute inset-0 border border-white animate-ping"></div>
              <div className="absolute -inset-4 border border-white/20 animate-ping animation-delay-200"></div>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="mb-6 border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/70 uppercase tracking-wider text-center">
          Processing voice command…
        </div>
      )}

      <div className="flex justify-center items-center h-16 mb-8 border-t border-b border-white/10 py-4">
        <div className="flex items-center gap-0.5">
          {waveformData.map((height, index) => (
            <div
              key={index}
              className="w-0.5 bg-white/60 transition-all duration-100"
              style={{ height: `${height}%`, minHeight: '2px' }}
            />
          ))}
        </div>
      </div>

      {transcript && (
        <div className="mb-6">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">User Input</div>
          <div className="border-l-2 border-white/20 pl-4">
            <p className="text-white text-lg font-mono">&gt; {transcript}</p>
          </div>
        </div>
      )}

      {response && (
        <div className="mb-8">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">AI Response</div>
          <div className="border-l-2 border-white/20 pl-4">
            <p className="text-white text-lg font-mono">&lt; {response}</p>
          </div>
        </div>
      )}

      {emailHighlights.length > 0 && (
        <div className="mb-8">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Emails Read Aloud</div>
          <div className="space-y-3">
            {emailHighlights.map((item, index) => (
              <div key={item.id ?? `email-${index}`} className="border border-white/10 p-4">
                <div className="text-white font-semibold text-sm mb-1 uppercase tracking-wide">{item.subject ?? 'No subject'}</div>
                <div className="text-white/60 text-xs mb-1">
                  From {item.from ?? 'unknown sender'}
                  {item.urgency ? ` • ${item.urgency}` : ''}
                </div>
                {formatTimestamp(item.receivedAt) && (
                  <div className="text-white/30 text-xs">Received {formatTimestamp(item.receivedAt)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {draftDetails && (draftDetails.subject || draftDetails.body || draftPreview) && (
        <div className="mb-8 border border-white/15 p-4 bg-white/5">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Draft Ready</div>
          {draftDetails.subject && (
            <div className="text-white font-semibold text-sm mb-2">Subject: {draftDetails.subject}</div>
          )}
          {draftPreview && (
            <div className="text-white/60 text-xs mb-2">Preview: {draftPreview}</div>
          )}
          {draftDetails.body && (
            <pre className="text-white/70 text-xs whitespace-pre-wrap border border-white/10 bg-black/20 p-3">{draftDetails.body}</pre>
          )}
          {draftId && (
            <div className="text-white/30 text-xs mt-3">Draft ID: {draftId}</div>
          )}
        </div>
      )}

      {audioUrl && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-white/40 uppercase tracking-wider">Voice Playback</div>
            {isPlaying && <div className="text-white/60 text-xs uppercase tracking-wider">Playing…</div>}
          </div>
          <audio
            ref={audioElementRef}
            controls
            autoPlay
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={() => setIsPlaying(false)}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-white/10 p-4">
          <div className="text-white text-2xl mb-2 font-mono">[1]</div>
          <div className="text-white font-bold text-sm mb-1 uppercase">Email</div>
          <div className="text-white/40 text-xs font-mono">
            "Read my latest emails"
            <br />
            "Write email to Ryan"
          </div>
        </div>
        <div className="border border-white/10 p-4">
          <div className="text-white text-2xl mb-2 font-mono">[2]</div>
          <div className="text-white font-bold text-sm mb-1 uppercase">Schedule</div>
          <div className="text-white/40 text-xs font-mono">
            "Book with Tyler"
            <br />
            "Today's meetings"
          </div>
        </div>
        <div className="border border-white/10 p-4">
          <div className="text-white text-2xl mb-2 font-mono">[3]</div>
          <div className="text-white font-bold text-sm mb-1 uppercase">Actions</div>
          <div className="text-white/40 text-xs font-mono">
            "Draft decline"
            <br />
            "Summarize threads"
          </div>
        </div>
      </div>
    </div>
  );
}