import React, { useEffect, useState } from "react";
import { Flower2, MessageCircle, LayoutGrid, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="section-padding pb-4">
        <div className="container-content">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Flower2 className="h-4 w-4" />
              {t("gynaecare_page.hero_badge", { defaultValue: "Feature 05 — GynaeCare" })}
            </span>
            <h1 className="mt-4 text-3xl font-display font-bold text-foreground sm:text-4xl">
              {t("gynaecare_page.hero_headline_part1", { defaultValue: "Women's Health." })} <span className="hero-gradient-text">{t("gynaecare_page.hero_gradient_text", { defaultValue: "Answered." })}</span> {t("gynaecare_page.hero_headline_part2", { defaultValue: "Without Judgment." })}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {t("gynaecare_page.hero_subtitle", { defaultValue: "A completely anonymous, stigma-free chatbot for women's health questions. Ask about menstrual cycles, PCOS, pregnancy, or general wellness. 100% confidential." })}
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
              {t("gynaecare_page.tab_chat_label", { defaultValue: "Chat" })}
            </button>
            <button
              type="button"
              onClick={() => setActiveView("modules")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeView === "modules" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              {t("gynaecare_page.tab_modules_label", { defaultValue: "Health Modules" })}
            </button>
            <button
              type="button"
              onClick={() => setActiveView("resources")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeView === "resources" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {t("gynaecare_page.tab_resources_label", { defaultValue: "Resources" })}
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
              {t("gynaecare_page.new_session_label", { defaultValue: "New Session" })}
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
          {t("gynaecare_page.footer_emergency_heading", { defaultValue: "Emergency Helplines" })}: {t("gynaecare_page.footer_emergency_108", { defaultValue: "Medical Emergency: 108" })} | {t("gynaecare_page.footer_emergency_181", { defaultValue: "Women's Helpline: 1800-233-3434" })} | {t("gynaecare_page.footer_emergency_mh", { defaultValue: "Mental Health: 1860-2662-345" })}
        </footer>
      </div>
    </div>
  );
}
