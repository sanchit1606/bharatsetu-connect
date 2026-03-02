import React, { useState, useRef, useEffect } from "react";
import {
    Camera, Image as ImageIcon, X, Mic, MicOff, Search, Loader2,
    AlertTriangle, CheckCircle, Info, Volume2, Square, RotateCcw, Download, Share2, Scan
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { createWorker } from "tesseract.js";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import ScrollReveal from "@/components/ScrollReveal";

// --- MOCK API DATA ---
const MOCK_API_RESPONSE = {
    product_name: "Maggi 2-Minute Noodles",
    manufacturer: "Nestlé India",
    serving_size: "100g",
    safety_badge: "NOT_RECOMMENDED", // or SAFE_TO_CONSUME, CONSUME_WITH_CAUTION
    nutrition: {
        protein: 8.5,
        carbohydrates: 60.2,
        sugar: 2.1,
        total_fat: 14.3,
        saturated_fat: 6.1,
        dietary_fiber: 2.8,
        sodium: 890,
        other: 12.0
    },
    daily_limits: {
        protein: 50,
        carbohydrates: 300,
        sugar: 50,
        total_fat: 65,
        saturated_fat: 20,
        dietary_fiber: 25,
        sodium: 2300
    },
    ai_response: "इस उत्पाद में सोडियम की मात्रा बहुत अधिक है — 890mg प्रति 100g, जो दैनिक सीमा का लगभग 39% है। आपकी उम्र 43 वर्ष है और आपको मधुमेह है, इसलिए इस उत्पाद का नियमित सेवन उचित नहीं है। इसमें refined carbohydrates और saturated fat भी अधिक हैं।",
    key_concerns: [
        { type: "warning", title: "High Sodium", detail: "890mg per 100g. Significantly high for hypertension-prone individuals." },
        { type: "warning", title: "Refined Carbs", detail: "60g carbs per 100g, mostly refined. Not suitable for diabetic diet." },
        { type: "ok", title: "Protein Level", detail: "8.5g per 100g. Reasonable protein content." }
    ],
    false_claims: [
        {
            claim: "2-Minute Noodles — Quick & Nutritious",
            flag: "MISLEADING",
            explanation: "The word 'Nutritious' in the brand tagline is unsubstantiated. The product is high in sodium and refined carbohydrates, which do not support a nutritious claim under FSSAI guidelines."
        },
        {
            claim: "Contains Iron & Calcium",
            flag: "ACCURATE",
            explanation: "The product does contain fortified iron and calcium within FSSAI-specified minimum thresholds for such claims."
        }
    ]
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#94a3b8'];

export default function LabelAuditor() {
    const { t } = useTranslation();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [ocrData, setOcrData] = useState<{ text: string, words: any[], lines: any[], confidence: number } | null>(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number } | null>(null);

    const [query, setQuery] = useState("");
    const [language, setLanguage] = useState("en");

    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);

    const [result, setResult] = useState<typeof MOCK_API_RESPONSE | null>(null);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const synth = window.speechSynthesis;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const loadingMessages = [
        t("label_auditor_page.loading_1"),
        t("label_auditor_page.loading_2"),
        t("label_auditor_page.loading_3"),
        t("label_auditor_page.loading_4")
    ];

    useEffect(() => {
        // Setup Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = true;

            rec.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                setQuery(transcript);
            };

            rec.onend = () => {
                setIsRecording(false);
            };

            setRecognition(rec);
        }
    }, []);

    useEffect(() => {
        let interval: any;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert(t("label_auditor_page.error_too_large"));
            return;
        }

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setOcrData(null);
        setImageDimensions(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
    };

    const toggleRecording = () => {
        if (!recognition) return;
        if (isRecording) {
            recognition.stop();
        } else {
            // Trying to match language. Default to en-US, but if Hindi is selected we might want hi-IN
            recognition.lang = language === "en" ? "en-IN" : language === "hi" ? "hi-IN" : "en-IN";
            setQuery("");
            recognition.start();
            setIsRecording(true);
        }
    };

    const speakAnalysis = () => {
        if (!result) return;
        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(result.ai_response);
        utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
        utterance.onend = () => setIsSpeaking(false);
        synth.speak(utterance);
        setIsSpeaking(true);
    };

    const handleOCR = async () => {
        if (!imageFile || !previewUrl) return;
        setIsOcrLoading(true);
        try {
            const img = new window.Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Image failed to load"));
                img.src = previewUrl;
            });
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });

            const worker = await createWorker(language === "en" ? "eng" : language === "hi" ? "hin" : "eng");
            const { data } = await worker.recognize(imageFile, {}, { blocks: true });
            // Tesseract v7: lines/words live under data.blocks → paragraphs → lines → words
            const blocks = data.blocks ?? [];
            const lines = blocks.flatMap((b: any) => b.paragraphs ?? []).flatMap((p: any) => p.lines ?? []);
            const words = lines.flatMap((l: any) => l.words ?? []).filter((w: any) => (w.confidence ?? 0) > 50);
            setOcrData({
                text: data.text,
                words,
                lines,
                confidence: data.confidence ?? 0
            });
            await worker.terminate();
        } catch (error) {
            console.error("OCR Error:", error);
            alert(t("label_auditor_page.error_api"));
        } finally {
            setIsOcrLoading(false);
        }
    };

    const triggerAnalysis = () => {
        setIsLoading(true);
        setLoadingStep(0);

        // MOCK API DELAY
        setTimeout(() => {
            setResult(MOCK_API_RESPONSE);
            setIsLoading(false);
            // Scroll to output
            setTimeout(() => {
                document.getElementById("analysis-output")?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }, 8000);
    };

    const resetAll = () => {
        removeImage();
        setQuery("");
        setResult(null);
        if (isSpeaking) synth.cancel();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isFormValid = imageFile && query.trim().length > 0;

    // Render helpers
    const getBadgeColor = (badge: string) => {
        switch (badge) {
            case "SAFE_TO_CONSUME": return "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900";
            case "CONSUME_WITH_CAUTION": return "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900";
            case "NOT_RECOMMENDED": return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getBadgeText = (badge: string) => badge.replace(/_/g, " ");

    const pieData = result ? [
        { name: "Protein", value: result.nutrition.protein },
        { name: "Carbs", value: result.nutrition.carbohydrates },
        { name: "Total Fat", value: result.nutrition.total_fat },
        { name: "Fiber", value: result.nutrition.dietary_fiber },
        { name: "Sodium (g)", value: result.nutrition.sodium / 1000 },
        { name: "Other", value: result.nutrition.other }
    ].filter(d => d.value > 0) : [];

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container-main max-w-5xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl hover:bg-neutral-100 font-extrabold font-display mb-3">Label Auditor</h1>
                    <p className="text-muted-foreground">Analyze food & cosmetics labels for your personalized health safety.</p>
                </div>

                {/* ZONE 1: Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                    {/* Left Column: Image Upload */}
                    <div className="space-y-3">
                        <div>
                            <h2 className="text-lg font-semibold">{t("label_auditor_page.upload_title")}</h2>
                            <p className="text-sm text-muted-foreground">{t("label_auditor_page.upload_subtext")}</p>
                        </div>

                        <div className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-colors ${previewUrl ? 'border-primary/50 bg-primary/5' : 'border-border/60 hover:border-primary/50 bg-card'} relative h-64 overflow-hidden`}>
                            {previewUrl ? (
                                <>
                                    <div className="relative w-full h-full">
                                        <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                                    </div>
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-3 left-3 flex flex-col items-start bg-black/60 text-white rounded-lg px-3 py-1.5 backdrop-blur-sm text-xs z-10 w-[calc(100%-24px)] truncate">
                                        <span className="truncate w-full text-left">{imageFile?.name}</span>
                                        <span className="text-white/70">{(imageFile!.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 w-full">
                                    <div className="grid grid-cols-1 gap-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            ref={cameraInputRef}
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            onClick={() => cameraInputRef.current?.click()}
                                            className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors btn-press shadow-sm"
                                        >
                                            <Camera className="w-5 h-5" />
                                            {t("label_auditor_page.btn_camera")}
                                        </button>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-12 bg-secondary text-secondary-foreground rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors btn-press"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                            {t("label_auditor_page.btn_gallery")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-center text-muted-foreground truncate">{t("label_auditor_page.supported_formats")}</p>

                        {previewUrl && (
                            <button
                                onClick={handleOCR}
                                disabled={isOcrLoading}
                                className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all btn-press mt-2 shadow-sm"
                            >
                                {isOcrLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing OCR...</>
                                ) : (
                                    <><Scan className="w-4 h-4" /> Analyze Text (OCR)</>
                                )}
                            </button>
                        )}

                        {ocrData && imageDimensions && (
                            <div className="mt-4 space-y-4 animate-fade-in">
                                {/* Overall Confidence */}
                                <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl">
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Scan className="w-4 h-4 text-primary" /> OCR Results
                                    </h4>
                                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                                        ocrData.confidence >= 80 ? 'bg-green-500/10 text-green-600 border border-green-200 dark:border-green-900' :
                                        ocrData.confidence >= 50 ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-200 dark:border-yellow-900' :
                                        'bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900'
                                    }`}>
                                        Overall Confidence: {Math.round(ocrData.confidence)}%
                                    </div>
                                </div>

                                {/* Image with Red Bounding Boxes — same aspect-ratio wrapper so overlay aligns */}
                                <div
                                    className="relative rounded-xl overflow-hidden border border-border bg-black/5"
                                    style={{ aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}` }}
                                >
                                    <img
                                        src={previewUrl!}
                                        alt="OCR Analysis"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                    <svg
                                        className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                        viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        {ocrData.lines.map((line: any, i: number) => {
                                            const b = line.bbox ?? {};
                                            const w = (b.x1 ?? b.x0 ?? 0) - (b.x0 ?? 0);
                                            const h = (b.y1 ?? b.y0 ?? 0) - (b.y0 ?? 0);
                                            if (w <= 0 || h <= 0) return null;
                                            return (
                                                <rect
                                                    key={`line-${i}`}
                                                    x={b.x0}
                                                    y={b.y0}
                                                    width={w}
                                                    height={h}
                                                    fill="rgba(239, 68, 68, 0.12)"
                                                    stroke="#dc2626"
                                                    strokeWidth={Math.max(imageDimensions.width * 0.003, 2)}
                                                    strokeDasharray="6 4"
                                                />
                                            );
                                        })}
                                        {ocrData.words.map((word: any, i: number) => {
                                            const b = word.bbox ?? {};
                                            const w = (b.x1 ?? b.x0 ?? 0) - (b.x0 ?? 0);
                                            const h = (b.y1 ?? b.y0 ?? 0) - (b.y0 ?? 0);
                                            if (w <= 0 || h <= 0) return null;
                                            return (
                                                <rect
                                                    key={`word-${i}`}
                                                    x={b.x0}
                                                    y={b.y0}
                                                    width={w}
                                                    height={h}
                                                    fill="rgba(239, 68, 68, 0.15)"
                                                    stroke="#b91c1c"
                                                    strokeWidth={Math.max(imageDimensions.width * 0.002, 1.5)}
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>

                                {/* Full Recognized Text */}
                                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Recognized Text</h4>
                                    <div className="text-sm text-foreground/80 leading-relaxed font-mono bg-background/50 p-3 rounded-lg border border-border/50 max-h-40 overflow-y-auto whitespace-pre-wrap">
                                        {ocrData.text}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Query */}
                    <div className="space-y-3 flex flex-col">
                        <div>
                            <h2 className="text-lg font-semibold">{t("label_auditor_page.query_title")}</h2>
                            <p className="text-sm text-muted-foreground">{t("label_auditor_page.query_subtext")}</p>
                        </div>

                        <div className="flex-1 relative flex flex-col">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value.substring(0, 500))}
                                className="w-full flex-1 min-h-[140px] resize-none border border-border bg-card rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 transition-shadow"
                                placeholder={t("label_auditor_page.query_placeholder")}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                                {query.length} / 500
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                            {recognition && (
                                <button
                                    onClick={toggleRecording}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border ${isRecording
                                        ? "bg-red-500/10 border-red-200 text-red-600 animate-pulse"
                                        : "bg-background border-border hover:bg-muted text-foreground"
                                        }`}
                                >
                                    {isRecording ? <><Square className="w-4 h-4 fill-current" /> {t("label_auditor_page.voice_recording")}</> : <><Mic className="w-4 h-4" /> {t("label_auditor_page.voice_btn")}</>}
                                </button>
                            )}

                            <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
                                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">{t("label_auditor_page.respond_in")}</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-transparent text-sm w-full focus:outline-none cursor-pointer text-foreground"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिंदी (Hindi)</option>
                                    <option value="mr">मराठी (Marathi)</option>
                                    <option value="ta">தமிழ் (Tamil)</option>
                                    <option value="te">తెలుగు (Telugu)</option>
                                </select>
                            </div>
                        </div>
                        {recognition && <p className="text-xs text-center text-muted-foreground">{t("label_auditor_page.voice_note")}</p>}
                    </div>

                </div>

                {/* ZONE 2: Action Zone */}
                <div className="flex flex-col items-center justify-center mb-16 border-t border-border pt-10">
                    {!isFormValid && !isLoading && (
                        <div className="text-sm text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                            {!imageFile && !query ? "Please upload an image and enter a query." : !imageFile ? "Please upload or capture a product label image." : "Please enter your health query or speak it using the microphone."}
                        </div>
                    )}

                    <button
                        onClick={triggerAnalysis}
                        disabled={!isFormValid || isLoading}
                        className={`w-full sm:w-80 h-14 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-300 ${!isFormValid
                            ? "bg-muted text-muted-foreground cursor-not-allowed border border-border/50"
                            : isLoading
                                ? "hero-gradient-bg text-white cursor-wait opacity-90"
                                : "bg-foreground hover:bg-foreground/90 text-background hover:scale-[1.02] hover:shadow-md btn-press"
                            }`}
                    >
                        {isLoading ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /> {t("common.loading")}</>
                        ) : (
                            <><Search className="w-6 h-6" /> {t("label_auditor_page.analyse_btn")}</>
                        )}
                    </button>

                    {isLoading && (
                        <div className="mt-6 text-center animate-fade-in">
                            <p className="text-sm font-medium text-primary mb-2 transition-opacity duration-300">
                                {loadingMessages[loadingStep]}
                            </p>
                            <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
                                <div className="h-full bg-primary animate-progress origin-left" />
                            </div>
                        </div>
                    )}
                </div>

                {/* ZONE 3: Output Zone */}
                {result && (
                    <div id="analysis-output">
                        <ScrollReveal className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                            {/* Sub-Section A: Product Summary */}
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 card-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{result.manufacturer || "Unknown Manufacturer"}</p>
                                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{result.product_name}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Serving Size: {result.serving_size}</p>
                                </div>
                                <div className={`px-5 py-3 rounded-full border flex items-center justify-center text-center font-bold tracking-wide whitespace-nowrap shadow-sm ${getBadgeColor(result.safety_badge)}`}>
                                    {t(`label_auditor_page.badge_${result.safety_badge.toLowerCase().replace(/_/g, " ")}.badge_`)} {/* Fallback logic omitted due to complex text, just use getBadgeText */}
                                    {getBadgeText(result.safety_badge)}
                                </div>
                            </div>

                            {/* Sub-Section B: Nutritional Charts */}
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                                <h3 className="text-xl font-bold mb-6 font-display">{t("label_auditor_page.nutrition_title")}</h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Pie Chart */}
                                    <div className="flex flex-col items-center">
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip
                                                        formatter={(value: number, name: string) => [`${value.toFixed(1)}${name.includes('Sodium') ? '' : 'g'}`, name]}
                                                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mt-4">
                                            {pieData.map((entry, idx) => (
                                                <div key={entry.name} className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                                                    <span className="text-muted-foreground">{entry.name} ({entry.value.toFixed(1)}{entry.name.includes('Sodium') ? 'g' : 'g'})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bar Charts */}
                                    <div className="flex flex-col justify-center space-y-5">
                                        {(Object.entries(result.nutrition) as [keyof typeof result.nutrition, number][]).filter(([k]) => k !== 'other').map(([key, value]) => {
                                            const limit = result.daily_limits[key as keyof typeof result.daily_limits];
                                            if (!limit) return null;

                                            // Normalize sodium which is in mg, limit also in mg. Others in g.
                                            const isMg = key === 'sodium';

                                            const percent = Math.min((value / limit) * 100, 100);
                                            let colorClass = "bg-green-500";
                                            if (percent > 100 || value > limit) colorClass = "bg-red-500";
                                            else if (percent > 75) colorClass = "bg-yellow-500";

                                            return (
                                                <div key={key} className="space-y-1.5 group">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium capitalize text-foreground/80">{key.replace('_', ' ')}</span>
                                                        <span className="text-muted-foreground tabular-nums">
                                                            {value}{isMg ? 'mg' : 'g'} <span className="text-muted-foreground/50">/ {limit}{isMg ? 'mg' : 'g'}</span>
                                                        </span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <p className="text-xs text-muted-foreground italic mt-4 pt-4 border-t border-border">
                                            Values sourced from product label. Daily limits based on FSSAI & WHO guidelines for an average adult.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-Section C: AI Health Analysis */}
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold font-display">{t("label_auditor_page.analysis_title")}</h3>
                                        <p className="text-sm text-muted-foreground">{t("label_auditor_page.analysis_subtext")}</p>
                                    </div>
                                    {('speechSynthesis' in window) && (
                                        <button
                                            onClick={speakAnalysis}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${isSpeaking ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background hover:bg-muted border-border'
                                                }`}
                                        >
                                            {isSpeaking ? <><Square className="w-4 h-4" /> {t("label_auditor_page.stop_listen_btn")}</> : <><Volume2 className="w-4 h-4" /> {t("label_auditor_page.listen_btn")}</>}
                                        </button>
                                    )}
                                </div>

                                <div className="bg-background rounded-2xl p-6 border border-border/50 text-foreground/90 text-lg sm:text-xl leading-relaxed font-sans shadow-inner mb-8">
                                    {result.ai_response}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {result.key_concerns.map((concern, idx) => (
                                        <div key={idx} className={`p-4 rounded-2xl border flex flex-col gap-2 ${concern.type === 'warning' ? 'bg-amber-500/5 border-amber-200/50 dark:border-amber-900/50' : 'bg-green-500/5 border-green-200/50 dark:border-green-900/50'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                {concern.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                                                <span className="font-bold text-sm tracking-wide">{concern.title}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{concern.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sub-Section D: False Claims Detector */}
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold font-display flex items-center gap-2">{t("label_auditor_page.claims_title")} <Search className="w-5 h-5 text-primary" /></h3>
                                    <p className="text-sm text-muted-foreground">{t("label_auditor_page.claims_subtext")}</p>
                                </div>

                                <div className="space-y-4">
                                    {result.false_claims.length > 0 ? result.false_claims.map((claimObj, idx) => (
                                        <div key={idx} className="bg-background border border-border rounded-xl p-5 flex flex-col gap-3">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <h4 className="font-semibold text-foreground">&quot;{claimObj.claim}&quot;</h4>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${claimObj.flag === 'MISLEADING' ? 'bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900' :
                                                    claimObj.flag === 'UNVERIFIED' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-200 dark:border-yellow-900' :
                                                        'bg-green-500/10 text-green-600 border border-green-200 dark:border-green-900'
                                                    }`}>
                                                    {claimObj.flag}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-3">
                                                {claimObj.explanation}
                                            </p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-muted-foreground italic">{t("label_auditor_page.no_claims")}</p>
                                    )}
                                </div>
                            </div>

                            {/* Sub-Section E: Disclaimer & Actions */}
                            <div className="space-y-6 pt-4">
                                <div className="flex gap-3 bg-muted/40 border border-border rounded-2xl p-4 text-sm text-muted-foreground">
                                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>
                                        {t("label_auditor_page.disclaimer").split(":")[0]}: {t("label_auditor_page.disclaimer").split(":")[1]}
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        onClick={resetAll}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-medium text-sm transition-colors btn-press"
                                    >
                                        <RotateCcw className="w-4 h-4" /> {t("label_auditor_page.btn_reset")}
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-medium text-sm transition-colors btn-press"
                                        onClick={() => alert('Download PDF functionality requires backend integration.')}
                                    >
                                        <Download className="w-4 h-4" /> {t("label_auditor_page.btn_download")}
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-medium text-sm transition-colors btn-press"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`BharatSetu Analysis for ${result.product_name}:\n${result.ai_response}`);
                                            alert('Copied to clipboard!');
                                        }}
                                    >
                                        <Share2 className="w-4 h-4" /> {t("label_auditor_page.btn_share")}
                                    </button>
                                </div>
                            </div>

                        </ScrollReveal>
                    </div>
                )}

            </div>
        </div>
    );
}
