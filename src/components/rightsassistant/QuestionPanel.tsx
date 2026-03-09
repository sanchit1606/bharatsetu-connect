import React from "react";
import { ArrowRight, Loader2, Mic, MicOff } from "lucide-react";
import SuggestedQuestions from "./SuggestedQuestions";

type Props = {
  questionText: string;
  isRecording: boolean;
  isQuestionTranscribing?: boolean;
  onQuestionChange: (value: string) => void;
  onAsk: () => void;
  onToggleRecording: () => void;
  onSuggestedQuestion: (question: string) => void;
};

export default function QuestionPanel({
  questionText,
  isRecording,
  isQuestionTranscribing = false,
  onQuestionChange,
  onAsk,
  onToggleRecording,
  onSuggestedQuestion,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Ask about your rights
      </h2>

      <div className="relative">
        <textarea
          value={questionText}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="e.g. Can my landlord evict me without notice? What are my rights if I don't get PF?"
          rows={5}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 pr-24 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        />
        <button
          type="button"
          onClick={onToggleRecording}
          disabled={isQuestionTranscribing}
          className="absolute right-3 bottom-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 text-[11px] font-medium hover:bg-muted disabled:opacity-50"
          title={isQuestionTranscribing ? "Transcribing…" : isRecording ? "Stop" : "Voice input (ElevenLabs when configured)"}
        >
          {isQuestionTranscribing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-3.5 w-3.5" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
          {isQuestionTranscribing ? "…" : isRecording ? "Stop" : "Voice"}
        </button>
      </div>

      <SuggestedQuestions onSelect={onSuggestedQuestion} />

      <button
        type="button"
        onClick={onAsk}
        disabled={!questionText.trim()}
        className="btn-press inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold hero-gradient-bg text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowRight className="h-4 w-4" />
        Get answer
      </button>
    </div>
  );
}
