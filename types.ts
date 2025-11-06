export type TransactionType = 'in' | 'out';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  driverName?: string; // Driver name as text input
  description?: string;
  timestamp: Date;
  // Order reconciliation fields (for cash from deliveries)
  cashGiven?: number; // Cash given to driver
  cashChange?: number; // Cash change given to customer
  orderAmount?: number; // Calculated: cashGiven - cashChange
}

export interface DrawerState {
  isOpen: boolean;
  openingBalance: number;
  closingBalance: number | null;
  transactions: Transaction[];
}

export interface DriverReconciliation {
  driverName: string;
  totalOrders: number; // Total order amounts
  totalCashGiven: number; // Total cash given to driver
  totalCashChange: number; // Total cash change to customers
  totalReceived: number; // Total received (cashGiven - cashChange)
  difference: number; // totalReceived - totalOrders
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
  driverReconciliations?: DriverReconciliation[];
}

