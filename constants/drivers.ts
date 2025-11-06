export const DRIVERS = [
  { id: 'ahmed', name: 'Ahmed' },
  { id: 'sami', name: 'Sami' },
  { id: 'mohamed', name: 'Mohamed' },
  { id: 'ali', name: 'Ali' },
  { id: 'other', name: 'Other' },
] as const;

export type DriverId = typeof DRIVERS[number]['id'];

