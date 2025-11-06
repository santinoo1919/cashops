import { CurrencyCode, getCurrencyByCode } from '../constants/currencies';

/**
 * Format currency amount using Intl.NumberFormat
 * Falls back to simple formatting if Intl API is not available
 */
export const formatCurrency = (amount: number, currencyCode: CurrencyCode): string => {
  try {
    // Use Intl API for proper formatting
    const formatter = new Intl.NumberFormat('default', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting if Intl API fails
    const currency = getCurrencyByCode(currencyCode);
    const formattedAmount = amount.toFixed(2);
    return `${formattedAmount} ${currency?.symbol || currencyCode}`;
  }
};

/**
 * Format currency without symbol (just the number)
 */
export const formatCurrencyAmount = (amount: number, currencyCode: CurrencyCode): string => {
  try {
    const formatter = new Intl.NumberFormat('default', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    return amount.toFixed(2);
  }
};

