import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyCode, DEFAULT_CURRENCY } from '../constants/currencies';

const CURRENCY_STORAGE_KEY = 'selectedCurrency';

interface CurrencyState {
  currency: CurrencyCode;
  isLoading: boolean;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  loadCurrency: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: DEFAULT_CURRENCY,
  isLoading: true,

  setCurrency: async (currency: CurrencyCode) => {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currency);
      set({ currency });
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  },

  loadCurrency: async () => {
    try {
      set({ isLoading: true });
      const saved = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      
      if (saved && isValidCurrencyCode(saved)) {
        set({ currency: saved as CurrencyCode, isLoading: false });
      } else {
        set({ currency: DEFAULT_CURRENCY, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading currency:', error);
      set({ currency: DEFAULT_CURRENCY, isLoading: false });
    }
  },
}));

// Helper to validate currency code
function isValidCurrencyCode(code: string): boolean {
  // You can add validation logic here if needed
  return typeof code === 'string' && code.length === 3;
}

