import React, { useEffect, useRef, useState } from "react";
import { Send, Type, Mic } from "lucide-react";
import { askGynaeCareQuestion } from "@/lib/gynaecareApi";
import { detectEmergencyKeywords } from "@/utils/emergencyDetection";
import type { AgeGroup } from "@/utils/ageFilter";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";
import MessageBubble, { type ChatMessage } from "./MessageBubble";
import SuggestedQuestions from "./SuggestedQuestions";
import VoiceInput from "./VoiceInput";
import EmergencyAlert from "./EmergencyAlert";

type Props = {
  ageGroup: AgeGroup | null;
  language: GynaeLanguage;
  sessionId: string | null;
  conversationHistory: ChatMessage[];
  onUpdateHistory: (history: ChatMessage[]) => void;
};

type InputMode = "text" | "voice";

export default function ChatInterface({
  ageGroup,
  language,
  sessionId,
  conversationHistory,
  onUpdateHistory,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(conversationHistory);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(conversationHistory);
  }, [conversationHistory]);

  useEffect(() => {
    onUpdateHistory(messages);
  }, [messages, onUpdateHistory]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    const emergency = detectEmergencyKeywords(text, language);
    if (emergency.isEmergency) {
      setEmergencyType(emergency.type);
      setShowEmergency(true);
    }

    try {
      const res = await askGynaeCareQuestion({
        question: text,
        language,
        age_group: ageGroup,
        session_id: sessionId,
      });

      if (res.success && res.data) {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: res.data.answer,
          timestamp: new Date().toISOString(),
          sources: res.data.sources,
          disclaimer: res.data.requires_disclaimer,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              language === "en"
                ? "I'm sorry, I encountered an error. Please try rephrasing your question."
                : "मुझे खेद है, एक त्रुटि हुई। कृपया अपने प्रश्न को दोबारा लिखें।",
            timestamp: new Date().toISOString(),
            isError: true,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: language === "en" ? "Something went wrong. Please try again." : "कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedClick = (question: string) => {
    handleSend(question);
  };

  const handleVoiceComplete = (transcript: string) => {
    setInputText(transcript);
    setInputMode("text");
    handleSend(transcript);
  };

  const isEn = language === "en";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          {isEn ? "Ask anything — completely anonymous and judgment-free" : "कुछ भी पूछें — पूरी तरह से गुमनाम"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          ⚠️ {isEn ? "This is education, not medical diagnosis. Consult a doctor for health concerns." : "यह शिक्षा है, चिकित्सा निदान नहीं।"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="font-semibold text-foreground">
              {isEn ? "Welcome to GynaeCare!" : "GynaeCare में आपका स्वागत है!"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEn
                ? "You can ask about menstrual health, PCOS, pregnancy basics, hygiene, myths, or any women's health topic. Verified information in simple language."
                : "आप मासिक धर्म स्वास्थ्य, PCOS, गर्भावस्था, स्वच्छता, मिथकों या किसी भी महिला स्वास्थ्य विषय के बारे में पूछ सकते हैं।"}
            </p>
            <SuggestedQuestions
              language={language}
              ageGroup={ageGroup}
              onQuestionClick={handleSuggestedClick}
            />
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} language={language} />
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
              <span className="flex gap-0.5">
                {[1, 2, 3].map((j) => (
                  <span
                    key={j}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"
                    style={{ animationDelay: `${j * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEn ? "GynaeCare is typing..." : "GynaeCare टाइप कर रहा है..."}
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-2 flex gap-1">
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
              inputMode === "text" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            {isEn ? "Type" : "लिखें"}
          </button>
          <button
            type="button"
            onClick={() => setInputMode("voice")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
              inputMode === "voice" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            {isEn ? "Speak" : "बोलें"}
          </button>
        </div>

        {inputMode === "text" ? (
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isEn ? "Type your question... (e.g., What is PCOS?)" : "अपना प्रश्न टाइप करें..."
              }
              rows={2}
              disabled={isTyping}
              className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <VoiceInput
            language={language}
            isRecording={isRecording}
            onTranscriptComplete={handleVoiceComplete}
            onRecordingChange={setIsRecording}
          />
        )}
        {inputMode === "text" && (
          <p className="mt-1 text-[10px] text-muted-foreground">{inputText.length}/500</p>
        )}
      </div>

      {showEmergency && (
        <EmergencyAlert
          language={language}
          emergencyType={emergencyType as Parameters<typeof EmergencyAlert>[0]["emergencyType"]}
          onClose={() => setShowEmergency(false)}
        />
      )}
    </div>
  );
}
