import React, { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";

type Props = {
  language: GynaeLanguage;
  isRecording: boolean;
  onTranscriptComplete: (transcript: string) => void;
  onRecordingChange: (recording: boolean) => void;
};

export default function VoiceInput({
  language,
  isRecording,
  onTranscriptComplete,
  onRecordingChange,
}: Props) {
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<{ start(): void; stop(): void } | null>(null);

  useEffect(() => {
    const Win = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    if (!SR) return;

    type ResultItem = { 0: { transcript: string }; isFinal: boolean };
    const recognition = new SR() as {
      start(): void;
      stop(): void;
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((e: { resultIndex: number; results: ResultItem[] }) => void) | null;
      onerror: (() => void) | null;
    };
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

    recognition.onresult = (event: { resultIndex: number; results: ResultItem[] }) => {
      let interimText = "";
      let finalText = "";
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        const part = results[i][0].transcript;
        if (results[i].isFinal) finalText += part + " ";
        else interimText += part;
      }
      setInterim(interimText);
      if (finalText) setTranscript((t) => t + finalText);
    };

    recognition.onerror = () => {
      onRecordingChange(false);
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, [language, onRecordingChange]);

  const handleStart = () => {
    setTranscript("");
    setInterim("");
    try {
      recognitionRef.current?.start();
      onRecordingChange(true);
    } catch {}
  };

  const handleStop = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    onRecordingChange(false);
    if (transcript.trim()) onTranscriptComplete(transcript.trim());
  };

  const isEn = language === "en";

  if (!isRecording) {
    return (
      <button
        type="button"
        onClick={handleStart}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 py-3 text-sm font-medium hover:bg-muted"
      >
        <Mic className="h-5 w-5 text-primary" />
        {isEn ? "Tap to Speak" : "बोलने के लिए टैप करें"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-3">
        <span className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="h-2 w-1 animate-pulse rounded-full bg-primary"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </span>
        <span className="text-sm text-muted-foreground">
          {isEn ? "Listening..." : "सुन रहे हैं..."}
        </span>
      </div>
      {(transcript || interim) && (
        <div className="rounded-lg border border-border bg-muted/30 p-2 text-xs">
          <p>{transcript}</p>
          {interim && <p className="text-muted-foreground">{interim}</p>}
        </div>
      )}
      <button
        type="button"
        onClick={handleStop}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/90 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive"
      >
        <Square className="h-4 w-4" />
        {isEn ? "Stop & Send" : "रोकें और भेजें"}
      </button>
    </div>
  );
}
