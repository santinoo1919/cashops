export const EXPENSE_CATEGORIES = [
  { id: 'fuel', label: 'Fuel', icon: '⛽' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'change', label: 'Change for Clients', icon: '💰' },
  { id: 'supplies', label: 'Supplies', icon: '📦' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'other', label: 'Other', icon: '📝' },
] as const;

export const INCOME_CATEGORIES = [
  { id: 'deliveries', label: 'Cash from Deliveries', icon: '📦' },
  { id: 'returns', label: 'Partial Returns', icon: '↩️' },
  { id: 'other', label: 'Other', icon: '📝' },
] as const;

export type CategoryId = typeof EXPENSE_CATEGORIES[number]['id'] | typeof INCOME_CATEGORIES[number]['id'];

