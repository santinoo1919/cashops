export type TransactionType = 'in' | 'out';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: Date;
}

export interface DrawerState {
  isOpen: boolean;
  openingBalance: number;
  closingBalance: number | null;
  transactions: Transaction[];
}

export interface DrawerSession {
  id: string;
  date: Date;
  openingBalance: number;
  closingBalance: number;
  transactions: Transaction[];
  totalIn: number;
  totalOut: number;
  difference: number;
}

