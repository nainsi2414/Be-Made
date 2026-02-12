// SeatingConfig.ts
export const SEATING_CHART = {
  // Capsule, Rectangle, Oblong, Oval all use the same scale in the PDF
  standard: [
    { len: 1600, comfortable: 6, compact: 6 },
    { len: 1700, comfortable: 6, compact: 6 },
    { len: 1800, comfortable: 6, compact: 8 },
    { len: 1900, comfortable: 6, compact: 8 },
    { len: 2000, comfortable: 8, compact: 8 },
    { len: 2100, comfortable: 8, compact: 8 },
    { len: 2200, comfortable: 8, compact: 8 },
    { len: 2300, comfortable: 8, compact: 8 },
    { len: 2400, comfortable: 8, compact: 10 },
    { len: 2500, comfortable: 8, compact: 10 },
    { len: 2600, comfortable: 10, compact: 10 },
    { len: 2700, comfortable: 10, compact: 10 },
    { len: 2800, comfortable: 10, compact: 10 },
    { len: 2900, comfortable: 10, compact: 10 },
    { len: 3000, comfortable: 10, compact: 12 },
    { len: 3100, comfortable: 12, compact: 12 },
    { len: 3180, comfortable: 12, compact: 12 },
  ],
  round: [
    { len: 1200, comfortable: 6, compact: 6 },
    { len: 1300, comfortable: 6, compact: 6 },
    { len: 1400, comfortable: 6, compact: 7 },
    { len: 1500, comfortable: 7, compact: 7 },
    { len: 1580, comfortable: 8, compact: 8 },
  ],
  square: [
    { len: 1200, comfortable: 4, compact: 4 }, // Fallback logic
    { len: 1500, comfortable: 8, compact: 8 },
    { len: 1580, comfortable: 8, compact: 8 },
  ]
};