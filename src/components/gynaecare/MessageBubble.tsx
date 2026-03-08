import React, { useState } from "react";
import { User, Bot } from "lucide-react";
import { formatTimestamp } from "@/utils/gynaecareFormatters";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  disclaimer?: boolean;
  isError?: boolean;
};

type Props = {
  message: ChatMessage;
  language: GynaeLanguage;
};

export default function MessageBubble({ message, language }: Props) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`flex max-w-[85%] flex-col ${isUser ? "items-end" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {message.content}
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {formatTimestamp(message.timestamp, language)}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowSources(!showSources)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {language === "en" ? "Sources" : "स्रोत"} ({message.sources.length})
            </button>
            {showSources && (
              <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                {message.sources.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {!isUser && message.disclaimer && (
          <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-500">
            ⚠️{" "}
            {language === "en"
              ? "Educational information only. Consult a doctor for diagnosis or treatment."
              : "केवल शैक्षिक जानकारी। निदान या उपचार के लिए डॉक्टर से परामर्श करें।"}
          </p>
        )}
        {message.isError && (
          <span className="mt-1 text-[10px] text-destructive">
            {language === "en" ? "Error" : "त्रुटि"}
          </span>
        )}
      </div>
    </div>
  );
}
