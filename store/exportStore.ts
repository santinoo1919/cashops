import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_EXPORT_DATE_KEY = 'lastExportDate';

interface ExportState {
  lastExportDate: Date | null;
  isLoading: boolean;
  setLastExportDate: (date: Date) => Promise<void>;
  loadLastExportDate: () => Promise<void>;
  clearLastExportDate: () => Promise<void>;
}

export const useExportStore = create<ExportState>((set) => ({
  lastExportDate: null,
  isLoading: true,

  setLastExportDate: async (date: Date) => {
    try {
      const dateString = date.toISOString();
      await AsyncStorage.setItem(LAST_EXPORT_DATE_KEY, dateString);
      set({ lastExportDate: date });
    } catch (error) {
      console.error('Error saving last export date:', error);
    }
  },

  loadLastExportDate: async () => {
    try {
      set({ isLoading: true });
      const saved = await AsyncStorage.getItem(LAST_EXPORT_DATE_KEY);
      
      if (saved) {
        const date = new Date(saved);
        if (!isNaN(date.getTime())) {
          set({ lastExportDate: date, isLoading: false });
        } else {
          set({ lastExportDate: null, isLoading: false });
        }
      } else {
        set({ lastExportDate: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading last export date:', error);
      set({ lastExportDate: null, isLoading: false });
    }
  },

  clearLastExportDate: async () => {
    try {
      await AsyncStorage.removeItem(LAST_EXPORT_DATE_KEY);
      set({ lastExportDate: null });
    } catch (error) {
      console.error('Error clearing last export date:', error);
    }
  },
}));

