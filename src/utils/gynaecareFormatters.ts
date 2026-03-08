export type GynaeLanguage = "en" | "hi";

export function formatTimestamp(timestamp: string, language: GynaeLanguage): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return language === "en" ? "Just now" : "अभी-अभी";
  if (diffMins < 60) return language === "en" ? `${diffMins}m ago` : `${diffMins} मिनट पहले`;
  if (diffHours < 24) return language === "en" ? `${diffHours}h ago` : `${diffHours} घंटे पहले`;
  if (diffDays < 7) return language === "en" ? `${diffDays}d ago` : `${diffDays} दिन पहले`;
  return formatDate(timestamp, language);
}

export function formatDate(dateString: string, language: GynaeLanguage): string {
  const date = new Date(dateString);
  const locale = language === "hi" ? "hi-IN" : "en-IN";
  return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
