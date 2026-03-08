const PERIOD_STORAGE_KEY = "gynaecare_period_data";

export type PeriodEntry = {
  id: number;
  startDate: string;
  duration: number;
  addedAt: string;
};

export const storageManager = {
  savePeriodData: (periods: PeriodEntry[]): { success: boolean; error?: string } => {
    try {
      localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(periods));
      return { success: true };
    } catch (e) {
      const err = e instanceof Error ? e.message : "Unknown error";
      return { success: false, error: err };
    }
  },

  loadPeriodData: (): PeriodEntry[] => {
    try {
      const data = localStorage.getItem(PERIOD_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearPeriodData: (): { success: boolean } => {
    try {
      localStorage.removeItem(PERIOD_STORAGE_KEY);
      return { success: true };
    } catch {
      return { success: false };
    }
  },
};
