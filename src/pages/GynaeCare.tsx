import React, { useEffect, useState } from "react";
import { Flower2, MessageCircle, LayoutGrid, BookOpen } from "lucide-react";
import { generateSessionId } from "@/utils/gynaecareFormatters";
import type { AgeGroup } from "@/utils/ageFilter";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";
import type { ChatMessage } from "@/components/gynaecare/MessageBubble";
import WelcomeScreen from "@/components/gynaecare/WelcomeScreen";
import DisclaimerBanner from "@/components/gynaecare/DisclaimerBanner";
import ChatInterface from "@/components/gynaecare/ChatInterface";
import QuickModules from "@/components/gynaecare/QuickModules";
import ResourceLibrary from "@/components/gynaecare/ResourceLibrary";
import ScrollReveal from "@/components/ScrollReveal";

type ActiveView = "chat" | "modules" | "resources";

export default function GynaeCare() {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [language, setLanguage] = useState<GynaeLanguage>("en");
  const [activeView, setActiveView] = useState<ActiveView>("chat");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (hasAcceptedTerms && !sessionId) {
      setSessionId(generateSessionId());
    }
  }, [hasAcceptedTerms, sessionId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.clear();
      localStorage.removeItem("gynaecare_conversation");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleNewSession = () => {
    setConversationHistory([]);
    sessionStorage.clear();
    setSessionId(generateSessionId());
  };

  if (!hasAcceptedTerms) {
    return (
      <div className="min-h-screen pt-16">
        <ScrollReveal>
          <WelcomeScreen
            onAccept={() => setHasAcceptedTerms(true)}
            onAgeSelect={setAgeGroup}
            language={language}
            onLanguageChange={setLanguage}
          />
        </ScrollReveal>
      </div>
    );
  }

  const isEn = language === "en";

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="section-padding pb-4">
        <div className="container-content">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Flower2 className="h-4 w-4" />
              Feature 05 — GynaeCare
            </span>
            <h1 className="mt-4 text-3xl font-display font-bold text-foreground sm:text-4xl">
              Women&apos;s health. <span className="hero-gradient-text">Answered.</span> Without judgment.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {isEn
                ? "Anonymous, stigma-free chatbot for menstrual health, PCOS, pregnancy basics, and wellness. Sourced from WHO, UNICEF, NHS. No account. No data stored."
                : "मासिक धर्म स्वास्थ्य, PCOS, गर्भावस्था और कल्याण के लिए गुमनाम चैटबॉट। WHO, UNICEF, NHS से। कोई अकाउंट नहीं। कोई डेटा संग्रहीत नहीं।"}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="container-content mb-4">
        <DisclaimerBanner language={language} />
      </div>

      {/* Tabs */}
      <div className="container-content">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setActiveView("chat")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeView === "chat" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              {isEn ? "Chat" : "चैट"}
            </button>
            <button
              type="button"
              onClick={() => setActiveView("modules")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeView === "modules" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              {isEn ? "Interactive Tools" : "इंटरएक्टिव टूल"}
            </button>
            <button
              type="button"
              onClick={() => setActiveView("resources")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeView === "resources" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {isEn ? "Resources" : "संसाधन"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              {language === "en" ? "हिंदी" : "English"}
            </button>
            <button
              type="button"
              onClick={handleNewSession}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              {isEn ? "New Session" : "नया सत्र"}
            </button>
          </div>
        </div>

        <div className="min-h-[420px] rounded-2xl border border-border bg-card overflow-hidden">
          {activeView === "chat" && (
            <ChatInterface
              ageGroup={ageGroup}
              language={language}
              sessionId={sessionId}
              conversationHistory={conversationHistory}
              onUpdateHistory={setConversationHistory}
            />
          )}
          {activeView === "modules" && (
            <div className="p-6">
              <QuickModules ageGroup={ageGroup} language={language} />
            </div>
          )}
          {activeView === "resources" && (
            <div className="p-6">
              <ResourceLibrary ageGroup={ageGroup} language={language} />
            </div>
          )}
        </div>

        <footer className="mt-6 rounded-xl border border-border bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
          {isEn
            ? "Emergency? Call 108 (Medical) | 181 (Women's Helpline) | 1860-2662-345 (Mental Health)"
            : "आपातकाल? 108 (चिकित्सा) | 181 (महिला हेल्पलाइन) | 1860-2662-345 (मानसिक स्वास्थ्य)"}
        </footer>
      </div>
    </div>
  );
}
