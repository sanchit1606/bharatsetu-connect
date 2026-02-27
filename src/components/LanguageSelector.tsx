import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Check, ChevronDown } from "lucide-react";

const languages = [
    { code: "en", name: "English", display: "English" },
    { code: "hi", name: "Hindi", display: "हिं  Hindi" },
    { code: "mr", name: "Marathi", display: "म  Marathi" },
    { code: "bn", name: "Bengali", display: "বাং  Bengali" },
    { code: "te", name: "Telugu", display: "తె  Telugu" },
    { code: "ta", name: "Tamil", display: "த  Tamil" },
    { code: "gu", name: "Gujarati", display: "ગુ  Gujarati" },
    { code: "ur", name: "Urdu", display: "اُ  Urdu" },
    { code: "kn", name: "Kannada", display: "ಕ  Kannada" },
    { code: "ml", name: "Malayalam", display: "മ  Malayalam" },
];

export default function LanguageSelector() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem("bharatsetu_lang", code);
        setIsOpen(false);
    };

    const currentLangCode = i18n.language || "en";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative group"
                aria-label={t("settings.label")}
            >
                <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[240px] bg-card border border-border rounded-xl shadow-lg shadow-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border/50">
                        <h3 className="font-semibold text-sm">{t("settings.label", "Settings")}</h3>
                    </div>

                    <div className="p-2 space-y-1">
                        <div className="px-2 pt-2 pb-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("settings.language_label", "Select Language")}</span>
                        </div>

                        <div className="max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between group transition-colors ${currentLangCode === lang.code
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "hover:bg-muted text-foreground"
                                        }`}
                                >
                                    <span>{lang.display}</span>
                                    {currentLangCode === lang.code && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>

                    </div>

                    <div className="p-3 border-t border-border/50 bg-muted/20">
                        <p className="text-xs text-muted-foreground/60 italic text-center">More settings coming soon...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
