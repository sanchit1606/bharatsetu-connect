import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  ExternalLink,
  Mail,
  MessageCircle,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { fetchSttTranscript, isSttConfigured } from "@/lib/sttApi";
import { getCivicSenseDraft, isCivicSenseBackendConfigured } from "@/lib/civicSenseApi";

const INDIA_STATES = [
  "Andhra Pradesh", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Puducherry", "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
];

const CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Tirupati", "Kadapa", "Other"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Other"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Other"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere", "Ballari", "Vijayapura", "Other"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Other"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Other"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Other"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Other"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Other"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Baharampur", "Habra", "Other"],
  "Delhi": ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "New Delhi", "Dwarka", "Rohini", "Saket", "Other"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Bharatpur", "Other"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Other"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Other"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Other"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Other"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Phusro", "Other"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Ambikapur", "Jagdalpur", "Other"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Pithoragarh", "Ramnagar", "Other"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Udhampur", "Kupwara", "Budgam", "Other"],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Zanskar", "Other"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Other"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Baddi", "Nahan", "Kullu", "Chamba", "Other"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati", "Tamenglong", "Other"],
  "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Williamnagar", "Nongpoh", "Resubelpara", "Mawkyrwat", "Other"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Mamit", "Lawngtlai", "Other"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Mon", "Other"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Ravangla", "Rangpo", "Jorethang", "Other"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Ambassa", "Belonia", "Khowai", "Teliamura", "Other"],
  "Puducherry": ["Puducherry", "Karaikal", "Yanam", "Mahe", "Other"],
  "Chandigarh": ["Chandigarh", "Manimajra", "Other"],
  "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Rangat", "Mayabunder", "Other"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa", "Other"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Amini", "Other"],
};

function getCitiesForState(state: string): string[] {
  return CITIES_BY_STATE[state] ?? ["Other"];
}

type PortalLink = { label: string; url: string };

const UNION_GRIEVANCE_PORTALS: PortalLink[] = [
  { label: "CPGRAMS (Centralized Public Grievance)", url: "https://pgportal.gov.in/" },
  { label: "PMO Public Grievance", url: "https://pmopg.gov.in/" },
];

const STATE_GRIEVANCE_PORTALS: Record<string, PortalLink> = {
  "Andhra Pradesh": { label: "Andhra Pradesh grievance portal", url: "https://pgportal.gov.in/state/andhra-pradesh" },
  "Bihar": { label: "Bihar grievance", url: "https://pgportal.gov.in/state/bihar" },
  "Delhi": { label: "Delhi e-District / grievance", url: "https://edistrict.delhigovt.nic.in/" },
  "Gujarat": { label: "Gujarat CM e-Dashboard", url: "https://cmogujarat.gov.in/" },
  "Karnataka": { label: "Sakala (Karnataka)", url: "https://sakala.karnataka.gov.in/" },
  "Kerala": { label: "Kerala Chief Minister's grievance", url: "https://cm.kerala.gov.in/" },
  "Maharashtra": { label: "Aaple Sarkar (Maharashtra)", url: "https://aaplesarkar.maharashtra.gov.in/" },
  "Rajasthan": { label: "Rajasthan Jan Sunwai", url: "https://jan.sunwai.rajasthan.gov.in/" },
  "Tamil Nadu": { label: "Tamil Nadu CM's Special Cell", url: "https://cms.tn.gov.in/" },
  "Uttar Pradesh": { label: "UP Jan Sunwai Portal", url: "https://jansunwai.up.nic.in/" },
  "West Bengal": { label: "West Bengal grievance", url: "https://wb.gov.in/" },
};

function getStatePortal(state: string): PortalLink | null {
  return STATE_GRIEVANCE_PORTALS[state] ?? null;
}

function getMunicipalSearchUrl(state: string, city: string): string {
  const q = encodeURIComponent(`${city} ${state} municipal corporation grievance portal`);
  return `https://www.google.com/search?q=${q}`;
}

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
  state?: string;
  city?: string;
  name?: string;
  contactNumber?: string;
  classification: CivicClassification;
  authority: AuthoritySuggestion;
}): string => {
  const { issue, location, state, city, name, contactNumber, classification, authority } = opts;
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const area = location.trim() || "[Your area / landmark]";
  const safeLocation =
    state || city
      ? [state, city, area].filter(Boolean).join(", ")
      : area;
  const bodyIssue = issue.trim() || "[Brief description of the civic issue]";
  const signName = (name?.trim() || "[Your Name]");
  const signContact = (contactNumber?.trim() || "[Your Contact Number]");

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
    "I've hereby attach the proof of the same.",
    "",
    "Thank you for your time and attention to this important issue.",
    "",
    "Sincerely,",
    signName,
    signContact,
    "",
    `Date: ${today}`,
  ].join("\n");
};

const CivicSense: React.FC = () => {
  const { t } = useTranslation();
  const [issueText, setIssueText] = useState("");
  const [userName, setUserName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classification, setClassification] = useState<CivicClassification | null>(null);
  const [authority, setAuthority] = useState<AuthoritySuggestion | null>(null);
  const [complaintDraft, setComplaintDraft] = useState("");
  const [copyLabelKey, setCopyLabelKey] = useState<"copy_btn" | "copied" | "copy_failed">("copy_btn");
  const [portalRelevanceNote, setPortalRelevanceNote] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [browserRecognitionAvailable, setBrowserRecognitionAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sttLanguage = "en";
  const hasVoiceInput = browserRecognitionAvailable || isSttConfigured();

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
      setBrowserRecognitionAvailable(true);
    }
  }, []);

  const toggleRecording = async () => {
    if (isSttConfigured()) {
      if (isRecording || isTranscribing) {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          mediaRecorderRef.current = null;
          setIsRecording(false);
          if (blob.size > 0) {
            setIsTranscribing(true);
            try {
              const text = await fetchSttTranscript({ audioBlob: blob, language: sttLanguage });
              if (text) setIssueText((prev) => (prev ? `${prev} ${text}` : text).trim());
            } finally {
              setIsTranscribing(false);
            }
          }
        };
        setIssueText("");
        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone error:", err);
        alert("Microphone access is needed for voice input.");
      }
      return;
    }

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    setPortalRelevanceNote("");

    if (isCivicSenseBackendConfigured()) {
      try {
        const result = await getCivicSenseDraft({
          issue: issueText,
          name: userName || undefined,
          contact_number: contactNumber || undefined,
          state: selectedState || undefined,
          city: selectedCity || undefined,
          region: location || undefined,
        });
        setComplaintDraft(result.complaint_draft ?? "");
        if (result.portal_relevance_note?.trim()) {
          setPortalRelevanceNote(result.portal_relevance_note.trim());
        }
        if (result.category) {
          setClassification({
            category: result.category,
            urgency: result.urgency ?? "Medium",
            tags: result.urgency ? [result.urgency] : [],
          });
        }
        if (result.suggested_authority) {
          setAuthority({
            level: result.suggested_authority.level,
            department: result.suggested_authority.department,
            exampleName: result.suggested_authority.example_name,
            channels: ["Online grievance portal", "Ward office in-person", "Toll-free helpline"],
          });
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Request failed. Please try again.");
        setComplaintDraft("");
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    setTimeout(() => {
      const cls = classifyIssue(issueText);
      const auth = suggestAuthority(cls);
      const draft = buildComplaintDraft({
        issue: issueText,
        location,
        state: selectedState || undefined,
        city: selectedCity || undefined,
        name: userName || undefined,
        contactNumber: contactNumber || undefined,
        classification: cls,
        authority: auth,
      });

      setClassification(cls);
      setAuthority(auth);
      setComplaintDraft(draft);
      setIsAnalyzing(false);
    }, 800);
  };

  const handleCopy = async () => {
    if (!complaintDraft) return;
    try {
      await navigator.clipboard.writeText(complaintDraft);
      setCopyLabelKey("copied");
      setTimeout(() => setCopyLabelKey("copy_btn"), 1500);
    } catch {
      setCopyLabelKey("copy_failed");
    }
  };

  const mailRecipient = (import.meta.env.VITE_CIVICSENSE_PROTOTYPE_EMAIL as string)?.trim() || "sanchitnipanikar@gmail.com";
  const whatsappNumber = (import.meta.env.VITE_CIVICSENSE_PROTOTYPE_WHATSAPP as string)?.trim() || "918459597997";

  const handleSendMail = () => {
    const subject = encodeURIComponent("Civic complaint – BharatSetu CivicSense");
    const body = encodeURIComponent(complaintDraft || "[Your complaint draft will appear here after you generate it.]");
    const to = encodeURIComponent(mailRecipient);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      complaintDraft || "[Your complaint draft will appear here. Generate a draft first, then send via WhatsApp and attach your proof.]"
    );
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${text}`, "_blank", "noopener,noreferrer");
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
              {t("civic_sense_page.badge")}
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-display font-extrabold text-foreground">
              {t("civic_sense_page.hero_title")}{" "}
              <span className="hero-gradient-text">{t("civic_sense_page.hero_title_highlight")}</span>.
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">
              {t("civic_sense_page.hero_subtext")}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated">
              <h3 className="font-display font-semibold text-foreground mb-4 text-lg">
                {t("civic_sense_page.flow_title")}
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full hero-gradient-bg text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    1
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">{t("civic_sense_page.flow_step1_lead")}</span>{" "}
                    {t("civic_sense_page.flow_step1_text")}
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full hero-gradient-bg text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    2
                  </div>
                  <p>
                    <span className="font-semibold text-foreground">{t("civic_sense_page.flow_step2_lead")}</span>{" "}
                    {t("civic_sense_page.flow_step2_text")}
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
                  {t("civic_sense_page.form_title")}
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/5 text-primary font-medium">
                  {t("civic_sense_page.step_1_of_2")}
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("civic_sense_page.label_issue")}
                </label>
                <div className="relative">
                  <textarea
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    placeholder={t("civic_sense_page.placeholder_issue")}
                    rows={6}
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 scrollbar-thin"
                  />
                  {hasVoiceInput && (
                    <button
                      type="button"
                      onClick={toggleRecording}
                      disabled={isTranscribing}
                      className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-background/80 hover:bg-muted transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                          {t("civic_sense_page.transcribing")}
                        </>
                      ) : isRecording ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 text-destructive" />
                          {t("civic_sense_page.stop_recording")}
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-primary" />
                          {t("civic_sense_page.speak_instead")}
                        </>
                      )}
                    </button>
                  )}
                </div>
                {hasVoiceInput && (
                  <p className="text-xs text-muted-foreground">
                    {isSttConfigured()
                      ? t("civic_sense_page.voice_hint_elevenlabs")
                      : t("civic_sense_page.voice_hint_browser")}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("civic_sense_page.label_name")}
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={t("civic_sense_page.placeholder_name")}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("civic_sense_page.label_contact")}
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder={t("civic_sense_page.placeholder_contact")}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("civic_sense_page.label_state")}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity("");
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <option value="">{t("civic_sense_page.select_state")}</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("civic_sense_page.label_city")}
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60"
                  >
                    <option value="">{t("civic_sense_page.select_city")}</option>
                    {getCitiesForState(selectedState).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {t("civic_sense_page.label_area")}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("civic_sense_page.placeholder_area")}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    {t("civic_sense_page.label_photo")} <span className="text-destructive font-semibold">{t("civic_sense_page.required")}</span>
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
                            aria-label={t("civic_sense_page.remove_file")}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs text-muted-foreground">{t("civic_sense_page.tap_to_change")}</span>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-full bg-primary/10 p-3">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {t("civic_sense_page.drop_photo")} <span className="text-primary underline">{t("civic_sense_page.browse")}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("civic_sense_page.image_video_size")}
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t("civic_sense_page.proof_required")}{" "}
                    <span className="font-semibold text-foreground">{t("civic_sense_page.not_stored")}</span>.
                  </p>
                </div>
              </div>

              {apiError && (
                <p className="text-sm text-destructive font-medium flex items-center gap-2 bg-destructive/10 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {apiError}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-muted-foreground max-w-xs">
                  {!photo ? (
                    <span className="text-amber-600 dark:text-amber-500 font-medium">{t("civic_sense_page.attach_to_continue")}</span>
                  ) : (
                    <>
                      {t("civic_sense_page.no_auto_submit")}{" "}
                      <span className="font-semibold text-foreground">{t("civic_sense_page.no_auto_submit_emphasis")}</span>
                      {t("civic_sense_page.no_auto_submit_rest")}
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !photo}
                  className="inline-flex h-10 px-5 items-center rounded-xl font-bold text-lg hero-gradient-bg text-primary-foreground btn-press gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("civic_sense_page.analyzing")}
                    </>
                  ) : (
                    <>
                      {t("civic_sense_page.generate_draft")}
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
              {/* Card 1: Grievance portals by location */}
              <div className="bg-card rounded-2xl p-5 card-elevated space-y-4">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  {t("civic_sense_page.portals_title")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("civic_sense_page.portals_intro")}
                </p>
                {portalRelevanceNote && (
                  <p className="text-xs text-primary font-medium bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                    {portalRelevanceNote}
                  </p>
                )}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">{t("civic_sense_page.union_govt")}</p>
                    <ul className="space-y-1.5">
                      {UNION_GRIEVANCE_PORTALS.map((p) => (
                        <li key={p.url}>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            {p.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {selectedState && (
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">{t("civic_sense_page.state_govt")} {selectedState}</p>
                      {getStatePortal(selectedState) ? (
                        <a
                          href={getStatePortal(selectedState)!.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          {getStatePortal(selectedState)!.label}
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(selectedState + " government grievance portal")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          {t("civic_sense_page.search_state_portal", { state: selectedState })}
                        </a>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      {selectedCity && selectedState ? `${t("civic_sense_page.municipal_local")} ${selectedCity}, ${selectedState}` : t("civic_sense_page.municipal_corporation")}
                    </p>
                    <a
                      href={getMunicipalSearchUrl(selectedState || "India", selectedCity || "your city")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      {selectedCity && selectedState
                        ? t("civic_sense_page.find_municipal", { city: selectedCity })
                        : t("civic_sense_page.search_municipal")}
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 2: Complaint draft + Mail / WhatsApp */}
              <div className="bg-card rounded-2xl p-5 card-elevated space-y-4">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  {t("civic_sense_page.complaint_draft_title")}
                </h3>
                {complaintDraft ? (
                  <>
                    <textarea
                      value={complaintDraft}
                      onChange={(e) => setComplaintDraft(e.target.value)}
                      rows={12}
                      className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm leading-relaxed text-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 scrollbar-thin"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-medium border border-border bg-background hover:bg-muted"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {t(`civic_sense_page.${copyLabelKey}`)}
                      </button>
                      <span className="text-xs text-muted-foreground">{t("civic_sense_page.send_via")}</span>
                      <button
                        type="button"
                        onClick={handleSendMail}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-medium bg-background border border-border hover:bg-muted"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {t("civic_sense_page.mail")}
                      </button>
                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-medium bg-background border border-border hover:bg-muted"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {t("civic_sense_page.whatsapp")}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {isCivicSenseBackendConfigured()
                      ? t("civic_sense_page.empty_hint_with_backend")
                      : t("civic_sense_page.empty_hint_no_backend")}
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

