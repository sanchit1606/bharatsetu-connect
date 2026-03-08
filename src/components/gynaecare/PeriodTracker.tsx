import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/gynaecareFormatters";
import { storageManager, type PeriodEntry } from "@/utils/storageManager";
import type { GynaeLanguage } from "@/utils/gynaecareFormatters";

type Props = { language: GynaeLanguage };

export default function PeriodTracker({ language }: Props) {
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState(5);

  useEffect(() => {
    setPeriods(storageManager.loadPeriodData());
  }, []);

  useEffect(() => {
    if (periods.length > 0) storageManager.savePeriodData(periods);
  }, [periods]);

  const addPeriod = () => {
    if (!startDate) return;
    const newEntry: PeriodEntry = {
      id: Date.now(),
      startDate,
      duration,
      addedAt: new Date().toISOString(),
    };
    setPeriods((prev) => [...prev, newEntry].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
    setStartDate("");
    setDuration(5);
    setAdding(false);
  };

  const deletePeriod = (id: number) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAll = () => {
    if (window.confirm(language === "en" ? "Delete all period data? This cannot be undone." : "सभी पीरियड डेटा हटाएं? इसे पूर्ववत नहीं किया जा सकता।")) {
      storageManager.clearPeriodData();
      setPeriods([]);
    }
  };

  const sorted = [...periods].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  let avgCycle: number | null = null;
  if (sorted.length >= 2) {
    const lengths: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      lengths.push(
        Math.round(
          (new Date(sorted[i].startDate).getTime() - new Date(sorted[i - 1].startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
    }
    avgCycle = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  }
  let nextPeriod: Date | null = null;
  if (sorted.length > 0 && avgCycle) {
    const d = new Date(sorted[0].startDate);
    d.setDate(d.getDate() + avgCycle);
    nextPeriod = d;
  }

  const isEn = language === "en";

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        🔒 {isEn ? "Your data is stored ONLY on this device. It never leaves your device." : "आपका डेटा केवल इस डिवाइस पर संग्रहीत है।"}
      </p>

      {periods.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">{isEn ? "Avg Cycle" : "औसत चक्र"}</p>
            <p className="font-semibold">{avgCycle ? `${avgCycle} ${isEn ? "days" : "दिन"}` : "–"}</p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">{isEn ? "Next Period" : "अगला पीरियड"}</p>
            <p className="font-semibold">{nextPeriod ? formatDate(nextPeriod.toISOString(), language) : "–"}</p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] text-muted-foreground">{isEn ? "Tracked" : "ट्रैक किए"}</p>
            <p className="font-semibold">{periods.length}</p>
          </div>
        </div>
      )}

      {!adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          + {isEn ? "Add Period" : "पीरियड जोड़ें"}
        </button>
      )}

      {adding && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold">{isEn ? "Add Period" : "पीरियड जोड़ें"}</h3>
          <div>
            <label className="text-xs text-muted-foreground">{isEn ? "Start Date:" : "शुरुआत की तारीख:"}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              {isEn ? "Duration (days):" : "अवधि (दिन):"} {duration}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addPeriod}
              className="flex-1 rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground"
            >
              {isEn ? "Save" : "सहेजें"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-xl border border-border py-2 text-sm font-medium"
            >
              {isEn ? "Cancel" : "रद्द करें"}
            </button>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">{isEn ? "History" : "इतिहास"}</h3>
          <ul className="mt-2 space-y-2">
            {sorted.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>{formatDate(p.startDate, language)} — {p.duration} {isEn ? "days" : "दिन"}</span>
                <button
                  type="button"
                  onClick={() => deletePeriod(p.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  {isEn ? "Delete" : "हटाएं"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {periods.length > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="w-full rounded-xl border border-destructive/50 py-2 text-sm font-medium text-destructive"
        >
          {isEn ? "Clear All Data" : "सभी डेटा साफ करें"}
        </button>
      )}

      {periods.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          {isEn ? "Start tracking to predict your next cycle and understand your body better." : "अपने अगले चक्र की भविष्यवाणी करने के लिए ट्रैक करना शुरू करें।"}
        </p>
      )}
    </div>
  );
}
