import { useState, useRef, useCallback } from 'react';

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  deepgramApiKey?: string;
}

/**
 * Voice input hook using Deepgram's WebSocket API for real-time speech-to-text.
 * Falls back to Web Speech API if Deepgram key is not provided.
 */
export function useVoiceInput({ onResult, onError, deepgramApiKey }: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startDeepgram = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&punctuate=true`,
        ['token', deepgramApiKey!]
      );
      socketRef.current = socket;

      socket.onopen = () => {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        mediaRecorder.start(250); // send chunks every 250ms
        setIsListening(true);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const transcript = data?.channel?.alternatives?.[0]?.transcript;
        if (transcript && data.is_final) {
          onResult(transcript);
          stopListening();
        }
      };

      socket.onerror = () => {
        onError?.('Deepgram connection failed');
        stopListening();
      };

      socket.onclose = () => {
        setIsListening(false);
      };

    } catch (err: any) {
      onError?.(err.message || 'Microphone access denied');
      stopListening();
    }
  }, [deepgramApiKey, onResult, onError, stopListening]);

  const startWebSpeech = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        onError?.(event.error || 'Speech recognition failed');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  }, [onResult, onError]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else if (deepgramApiKey) {
      startDeepgram();
    } else {
      startWebSpeech();
    }
  }, [isListening, deepgramApiKey, startDeepgram, startWebSpeech, stopListening]);

  return { isListening, toggleListening, stopListening };
}
