import React, { useEffect, useRef, useState } from "react";
import {
  Megaphone,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Image as ImageIcon,
  ArrowRight,
  Copy,
  Send,
  Smartphone,
  Upload,
  FileVideo,
  X,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

type CivicClassification = {
  category: string;
  urgency: "Low" | "Medium" | "High";
  tags: string[];
};

type AuthoritySuggestion = {
  level: string;
  department: string;
  exampleName: string;
  channels: string[];
};

type SubmissionOption = {
  id: string;
  label: string;
  description: string;
};

const classifyIssue = (rawText: string): CivicClassification => {
  const text = rawText.toLowerCase();

  if (!text.trim()) {
    return {
      category: "General civic grievance",
      urgency: "Low",
      tags: [],
    };
  }

  const tags: string[] = [];
  let category = "General civic grievance";
  let urgency: CivicClassification["urgency"] = "Medium";

  const markUrgentIf = (words: string[]) => {
    if (words.some((w) => text.includes(w))) {
      urgency = "High";
      tags.push("Urgent");
    }
  };

  if (/(pothole|road|street light|streetlight|footpath|sidewalk|traffic|signal|zebra crossing)/i.test(text)) {
    category = "Road, traffic, and street infrastructure";
    tags.push("Roads", "Safety");
    markUrgentIf(["accident", "injury", "dangerous", "kids", "school"]);
  } else if (/(garbage|trash|waste|dump|dustbin|litter|sanitation|dirty|cleanliness)/i.test(text)) {
    category = "Garbage collection and sanitation";
    tags.push("Sanitation", "Garbage");
    markUrgentIf(["smell", "mosquito", "dengue", "malaria", "rats"]);
  } else if (/(sewage|drain|drainage|nala|overflow|stagnant water|waterlogging|flood)/i.test(text)) {
    category = "Sewage, drainage, and water-logging";
    tags.push("Drainage", "Health");
    markUrgentIf(["monsoon", "flood", "overflow", "inside house"]);
  } else if (/(water supply|no water|leakage|pipe burst|pipeline|tap dry)/i.test(text)) {
    category = "Drinking water supply and leakages";
    tags.push("Water", "Basic services");
    markUrgentIf(["days", "week", "elderly", "children"]);
  } else if (/(power cut|electricity|street light|transformer|voltage)/i.test(text)) {
    category = "Electricity and power supply";
    tags.push("Electricity");
    markUrgentIf(["night", "hospital", "school"]);
  } else if (/(encroachment|illegal|hawker|parking|noise|loudspeaker|pollution)/i.test(text)) {
    category = "Encroachment, noise, and public nuisance";
    tags.push("Law & order");
  }

  if (/immediately|urgent|asap|accident|injury|flood|dangerous/i.test(text)) {
    urgency = "High";
    if (!tags.includes("Urgent")) tags.push("Urgent");
  }

  if (tags.length === 0) tags.push("Citizen grievance");

  return { category, urgency, tags: Array.from(new Set(tags)) };
};

const suggestAuthority = (classification: CivicClassification): AuthoritySuggestion => {
  const base: AuthoritySuggestion = {
    level: "Municipal Corporation / Nagar Palika",
    department: "General Public Grievance Cell",
    exampleName: "Municipal Commissioner",
    channels: ["Online grievance portal", "Ward office in-person", "Toll-free helpline"],
  };

  if (classification.category.includes("Garbage")) {
    return {
      level: "Municipal Corporation / Nagar Palika",
      department: "Solid Waste Management Department",
      exampleName: "Executive Engineer, SWM",
      channels: ["Swachhata / civic app", "Ward sanitary inspector", "Municipal helpline"],
    };
  }

  if (classification.category.includes("Sewage") || classification.category.includes("drainage")) {
    return {
      level: "Municipal Corporation / Jal Board",
      department: "Drainage & Sewerage Department",
      exampleName: "Assistant Engineer, Drainage",
      channels: ["Jal Board helpline", "Ward engineer office", "Online complaint form"],
    };
  }

  if (classification.category.includes("Road") || classification.category.includes("traffic")) {
    return {
      level: "Municipal Corporation / PWD",
      department: "Roads & Traffic Department",
      exampleName: "Executive Engineer, Roads",
      channels: ["Online road complaint portal", "Ward engineer", "Traffic police WhatsApp"],
    };
  }

  if (classification.category.includes("Drinking water")) {
    return {
      level: "Municipal Corporation / Jal Nigam",
      department: "Water Supply Department",
      exampleName: "Assistant Engineer, Water Supply",
      channels: ["Jal Nigam helpline", "Water complaint number", "Ward office"],
    };
  }

  if (classification.category.includes("Electricity")) {
    return {
      level: "State DISCOM",
      department: "Customer Service / Fault Repair",
      exampleName: "Sub-division Officer (SDO)",
      channels: ["DISCOM complaint number", "Mobile app", "Local office"],
    };
  }

  if (classification.category.includes("Encroachment") || classification.category.includes("nuisance")) {
    return {
      level: "Municipal Corporation / Local Police",
      department: "Enforcement / Law & Order",
      exampleName: "Enforcement Officer / Station House Officer",
      channels: ["Municipal control room", "Police helpline 100/112", "Online complaint"],
    };
  }

  return base;
};

const buildComplaintDraft = (opts: {
  issue: string;
  location: string;
  classification: CivicClassification;
  authority: AuthoritySuggestion;
}): string => {
  const { issue, location, classification, authority } = opts;
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const safeLocation = location.trim() || "[Your area / landmark]";
  const bodyIssue = issue.trim() || "[Brief description of the civic issue]";

  return [
    "To,",
    `The ${authority.exampleName},`,
    authority.department + ",",
    authority.level + ",",
    safeLocation,
    "",
    `Subject: Complaint regarding ${classification.category.toLowerCase()} in ${safeLocation}`,
    "",
    "Respected Sir/Madam,",
    "",
    `I would like to bring to your kind notice a matter related to ${classification.category.toLowerCase()} in ${safeLocation}.`,
    "",
    bodyIssue,
    "",
    "This issue is causing inconvenience to residents in the area and needs attention on priority. I humbly request you to kindly inspect the location and take necessary action at the earliest.",
    "",
    "I am available to provide any further information if required.",
    "",
    "Thank you.",
    "",
    "Yours faithfully,",
    "A concerned citizen",
    "",
    `Date: ${today}`,
  ].join("\n");
};

const CivicSense: React.FC = () => {
  const [issueText, setIssueText] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classification, setClassification] = useState<CivicClassification | null>(null);
  const [authority, setAuthority] = useState<AuthoritySuggestion | null>(null);
  const [complaintDraft, setComplaintDraft] = useState("");
  const [submissionOptions, setSubmissionOptions] = useState<SubmissionOption[]>([]);
  const [copyLabel, setCopyLabel] = useState("Copy complaint text");

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setIssueText(transcript);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) return;

    if (isRecording) {
      rec.stop();
      setIsRecording(false);
    } else {
      setIssueText("");
      rec.start();
      setIsRecording(true);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const maxMb = isVideo ? 50 : 10;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`Please upload a file smaller than ${maxMb}MB.`);
      return;
    }
    setPhoto(file);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const cls = classifyIssue(issueText);
      const auth = suggestAuthority(cls);
      const draft = buildComplaintDraft({
        issue: issueText,
        location,
        classification: cls,
        authority: auth,
      });

      const options: SubmissionOption[] = [
        {
          id: "whatsapp",
          label: "WhatsApp message",
          description: "Paste this text into your state/city's official WhatsApp grievance number.",
        },
        {
          id: "email",
          label: "Email complaint",
          description: "Copy the subject and body into an email to the relevant authority.",
        },
        {
          id: "portal",
          label: "Online portal",
          description:
            "Use this text in the description box of your state's online civic complaint portal or app.",
        },
      ];

      setClassification(cls);
      setAuthority(auth);
      setComplaintDraft(draft);
      setSubmissionOptions(options);
      setIsAnalyzing(false);
    }, 800);
  };

  const handleCopy = async () => {
    if (!complaintDraft) return;
    try {
      await navigator.clipboard.writeText(complaintDraft);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy complaint text"), 1500);
    } catch {
      setCopyLabel("Copy failed. Try again.");
    }
  };

  const hasResult = classification && authority && complaintDraft;

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="container-content grid gap-8 lg:grid-cols-[3fr,2fr] items-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <Megaphone className="w-4 h-4" />
              Feature 02 — CivicSense
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
              Your complaint, routed to the{" "}
              <span className="hero-gradient-text">right desk</span>.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              Describe any civic problem — in your own words. CivicSense understands the issue,
              identifies the right authority for your city, drafts a professional complaint, and
              shows you how to send it via WhatsApp, email, or online portals.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
                <Smartphone className="w-3.5 h-3.5 text-accent" />
                Works on low-end phones
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Zero account, no login
              </span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated">
              <h3 className="font-display font-semibold text-foreground mb-4 text-sm">
                Flow: from problem to resolution
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full hero-gradient-bg text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    1
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">You describe the issue</span>{" "}
                    using text or voice, optionally adding a photo and your area / landmark.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full hero-gradient-bg text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    2
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">CivicSense understands it</span>{" "}
                    – classifying category &amp; urgency and mapping it to the correct authority.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full hero-gradient-bg text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    3
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">You get a ready complaint</span>{" "}
                    with multiple submission channels and escalation paths.
                  </p>
                </li>
              </ol>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Interface */}
      <section className="section-padding pt-0">
        <div className="container-content grid gap-8 lg:grid-cols-[3fr,2fr] items-start">
          {/* Left: Input */}
          <ScrollReveal>
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display font-semibold text-foreground text-lg">
                  Describe your civic issue
                </h2>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/5 text-primary font-medium">
                  Step 1 of 3
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground">
                  Issue description (text or voice)
                </label>
                <div className="relative">
                  <textarea
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    placeholder="Example: There is an open sewage drain overflowing near Shastri Nagar market for the last 5 days. It smells very bad and mosquitoes have increased."
                    rows={6}
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 scrollbar-thin"
                  />
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-border bg-background/80 hover:bg-muted transition-colors"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-destructive" />
                        Stop recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-primary" />
                        Speak instead
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Tip: Focus on{" "}
                  <span className="font-medium text-foreground">
                    what, where, since when, and who is affected
                  </span>
                  .
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Area / landmark
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Example: Shastri Nagar Ward 12, near Government School"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    Photo or video proof <span className="text-destructive font-semibold">(required)</span>
                  </label>
                  <label className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/50 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="absolute w-0 h-0 opacity-0 pointer-events-none"
                      onChange={handlePhotoChange}
                    />
                    {photo ? (
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 border border-border w-full max-w-sm">
                          {photo.type.startsWith("video/") ? (
                            <FileVideo className="w-5 h-5 text-primary shrink-0" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-primary shrink-0" />
                          )}
                          <span className="truncate text-sm font-medium text-foreground">{photo.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPhoto(null);
                            }}
                            className="ml-auto p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            aria-label="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs text-muted-foreground">Tap to change file</span>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-full bg-primary/10 p-3">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            Drop photo or video here, or <span className="text-primary underline">browse</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Image up to 10MB · Video up to 50MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Proof is required. Processed on-device,{" "}
                    <span className="font-semibold text-foreground">not stored</span>.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  {!photo ? (
                    <span className="text-amber-600 dark:text-amber-500 font-medium">Attach photo or video proof to continue.</span>
                  ) : (
                    <>
                      CivicSense does{" "}
                      <span className="font-semibold text-foreground">not submit anything automatically</span>
                      . You stay in control of where to send the complaint.
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !photo}
                  className="inline-flex h-10 px-5 items-center rounded-xl font-semibold text-sm hero-gradient-bg text-primary-foreground btn-press gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing your issue…
                    </>
                  ) : (
                    <>
                      Generate complaint draft
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Output */}
          <ScrollReveal delay={100}>
            <div className="space-y-4">
              <div className="bg-card rounded-2xl p-5 card-elevated space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    AI understanding of your issue
                  </h3>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary/5 text-primary font-medium">
                    Step 2 of 3
                  </span>
                </div>

                {hasResult ? (
                  <>
                    <div className="space-y-3 text-xs">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium">
                          <Megaphone className="w-3.5 h-3.5 text-primary" />
                          {classification!.category}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                            classification!.urgency === "High"
                              ? "bg-destructive/10 text-destructive"
                              : classification!.urgency === "Medium"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {classification!.urgency} urgency
                        </span>
                        {classification!.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[11px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Based on your description, this looks like a{" "}
                        <span className="font-semibold text-foreground">
                          {classification!.category.toLowerCase()}
                        </span>{" "}
                        issue. We recommend treating it as{" "}
                        <span className="font-semibold text-foreground">
                          {classification!.urgency.toLowerCase()} priority
                        </span>{" "}
                        for authorities.
                      </p>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2 text-xs">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        CivicSense{" "}
                        <span className="font-semibold text-foreground">does not replace</span> RTI,
                        legal notices, or emergency services (100/112).
                      </p>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        If life or safety is in immediate danger,{" "}
                        <span className="font-semibold text-foreground">
                          call emergency numbers first
                        </span>
                        .
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Once you describe your issue and click{" "}
                    <span className="font-semibold text-foreground">Generate complaint draft</span>,
                    CivicSense will show how it understands the category and urgency here.
                  </p>
                )}
              </div>

              <div className="bg-card rounded-2xl p-5 card-elevated space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Suggested government authority
                  </h3>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary/5 text-primary font-medium">
                    Step 3 of 3
                  </span>
                </div>

                {authority ? (
                  <>
                    <div className="space-y-2 text-xs">
                      <p className="font-medium text-foreground">{authority.level}</p>
                      <p className="text-muted-foreground">{authority.department}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Example contact: <span className="font-semibold">{authority.exampleName}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {authority.channels.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          <Send className="w-3.5 h-3.5 text-primary" />
                          {c}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    After analysis, CivicSense will suggest which{" "}
                    <span className="font-semibold text-foreground">
                      level of government and department
                    </span>{" "}
                    is typically responsible for your issue.
                  </p>
                )}
              </div>

              <div className="bg-card rounded-2xl p-5 card-elevated space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Complaint draft (ready to send)
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!complaintDraft}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-border bg-background hover:bg-muted disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copyLabel}
                  </button>
                </div>

                {complaintDraft ? (
                  <>
                    <pre className="text-[11px] leading-relaxed text-muted-foreground bg-background rounded-xl border border-border px-3 py-3 max-h-64 overflow-auto whitespace-pre-wrap scrollbar-thin">
                      {complaintDraft}
                    </pre>
                    <div className="grid gap-2 md:grid-cols-3 pt-2">
                      {submissionOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="rounded-xl border border-border bg-background p-3 text-[11px] text-muted-foreground"
                        >
                          <p className="font-semibold text-foreground mb-1">{opt.label}</p>
                          <p>{opt.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Your complaint text will appear here, ready to{" "}
                    <span className="font-semibold text-foreground">copy into WhatsApp, email,</span>{" "}
                    or your state&apos;s civic portal. You can edit it freely before sending.
                  </p>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default CivicSense;

