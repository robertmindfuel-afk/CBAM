// Country-specific default emission values per Implementing Regulation (EU) 2025/2621
// Direct emissions in tCO2e per tonne of product
// Mark-ups: 2026 +10%, 2027 +20%, 2028+ +30% (fertilizers: +1% all years)

export const COUNTRIES = [
  { code: 'CN', name: 'China', region: 'Asia', carbonPrice: 11, freeAlloc: 100, mechanism: 'National ETS', effectivePrice: 0 },
  { code: 'IN', name: 'India', region: 'Asia', carbonPrice: 0, freeAlloc: 0, mechanism: 'None (CCTS drafted)', effectivePrice: 0 },
  { code: 'TR', name: 'Turkey', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'ETS pilot (2025)', effectivePrice: 0 },
  { code: 'RU', name: 'Russia', region: 'Europe/Asia', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'UA', name: 'Ukraine', region: 'Europe', carbonPrice: 0.68, freeAlloc: 0, mechanism: 'Carbon tax', effectivePrice: 0.68 },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', carbonPrice: 53, freeAlloc: 15, mechanism: 'UK ETS + Carbon Price Support', effectivePrice: 67 },
  { code: 'KR', name: 'South Korea', region: 'Asia', carbonPrice: 6, freeAlloc: 97, mechanism: 'K-ETS', effectivePrice: 0.18 },
  { code: 'JP', name: 'Japan', region: 'Asia', carbonPrice: 2, freeAlloc: 0, mechanism: 'Carbon tax + GX-ETS (2026)', effectivePrice: 2 },
  { code: 'US', name: 'United States', region: 'Americas', carbonPrice: 0, freeAlloc: 0, mechanism: 'No federal (CA: €37, RGGI: €14)', effectivePrice: 0 },
  { code: 'ZA', name: 'South Africa', region: 'Africa', carbonPrice: 9, freeAlloc: 92, mechanism: 'Carbon tax (60-95% allowances)', effectivePrice: 0.72 },
  { code: 'BR', name: 'Brazil', region: 'Americas', carbonPrice: 0, freeAlloc: 0, mechanism: 'ETS legislation (2025)', effectivePrice: 0 },
  { code: 'EG', name: 'Egypt', region: 'Africa', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'ID', name: 'Indonesia', region: 'Asia', carbonPrice: 2, freeAlloc: 100, mechanism: 'ETS (power sector)', effectivePrice: 0 },
  { code: 'VN', name: 'Vietnam', region: 'Asia', carbonPrice: 0, freeAlloc: 0, mechanism: 'ETS planned (2028)', effectivePrice: 0 },
  { code: 'TH', name: 'Thailand', region: 'Asia', carbonPrice: 0, freeAlloc: 0, mechanism: 'Voluntary ETS', effectivePrice: 0 },
  { code: 'MY', name: 'Malaysia', region: 'Asia', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'PK', name: 'Pakistan', region: 'Asia', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'BD', name: 'Bangladesh', region: 'Asia', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'DZ', name: 'Algeria', region: 'Africa', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'MA', name: 'Morocco', region: 'Africa', carbonPrice: 0, freeAlloc: 0, mechanism: 'Carbon tax planned', effectivePrice: 0 },
  { code: 'TN', name: 'Tunisia', region: 'Africa', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'MX', name: 'Mexico', region: 'Americas', carbonPrice: 3.5, freeAlloc: 0, mechanism: 'Carbon tax + ETS pilot', effectivePrice: 3.5 },
  { code: 'AR', name: 'Argentina', region: 'Americas', carbonPrice: 5, freeAlloc: 0, mechanism: 'Carbon tax', effectivePrice: 5 },
  { code: 'CL', name: 'Chile', region: 'Americas', carbonPrice: 5, freeAlloc: 0, mechanism: 'Carbon tax', effectivePrice: 5 },
  { code: 'AU', name: 'Australia', region: 'Oceania', carbonPrice: 0, freeAlloc: 0, mechanism: 'Safeguard Mechanism', effectivePrice: 0 },
  { code: 'NZ', name: 'New Zealand', region: 'Oceania', carbonPrice: 32, freeAlloc: 50, mechanism: 'NZ ETS', effectivePrice: 16 },
  { code: 'TW', name: 'Taiwan', region: 'Asia', carbonPrice: 0, freeAlloc: 0, mechanism: 'Carbon fee (planned 2025)', effectivePrice: 0 },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'AE', name: 'UAE', region: 'Middle East', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'QA', name: 'Qatar', region: 'Middle East', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'NO', name: 'Norway', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'EU ETS (exempt)', effectivePrice: 0, exempt: true },
  { code: 'IS', name: 'Iceland', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'EU ETS (exempt)', effectivePrice: 0, exempt: true },
  { code: 'LI', name: 'Liechtenstein', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'EU ETS (exempt)', effectivePrice: 0, exempt: true },
  { code: 'CH', name: 'Switzerland', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'Linked ETS (exempt)', effectivePrice: 0, exempt: true },
  { code: 'RS', name: 'Serbia', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'BA', name: 'Bosnia and Herzegovina', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'MK', name: 'North Macedonia', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'AL', name: 'Albania', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'ME', name: 'Montenegro', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'NG', name: 'Nigeria', region: 'Africa', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'KZ', name: 'Kazakhstan', region: 'Asia', carbonPrice: 1, freeAlloc: 100, mechanism: 'KZ ETS', effectivePrice: 0 },
  { code: 'BY', name: 'Belarus', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'GE', name: 'Georgia', region: 'Europe', carbonPrice: 0, freeAlloc: 0, mechanism: 'None', effectivePrice: 0 },
  { code: 'OTHER', name: 'Other countries', region: 'Other', carbonPrice: 0, freeAlloc: 0, mechanism: 'Unknown', effectivePrice: 0 },
];

// Default emission values (direct) by country and aggregated product category
// Based on Reg. 2025/2621 Annex I — values in tCO2e per tonne of product
// "OTHER" row = fallback for countries not listed (based on top-10 most carbon-intensive exporters)
export const DEFAULT_VALUES = {
  // ─── CEMENT ───
  'Cement clinker': {
    CN: 0.891, IN: 0.870, TR: 0.825, RU: 0.900, UA: 0.870, GB: 0.840, KR: 0.860,
    JP: 0.775, US: 0.850, ZA: 0.880, BR: 0.640, EG: 0.860, ID: 0.820, VN: 0.870,
    TH: 0.830, MY: 0.815, PK: 0.895, BD: 0.870, DZ: 0.870, MA: 0.850, TN: 0.850,
    MX: 0.830, AL: 0.870, RS: 0.870, BA: 0.880, OTHER: 0.950
  },
  'Portland cement': {
    CN: 0.624, IN: 0.580, TR: 0.550, RU: 0.630, UA: 0.610, GB: 0.510, KR: 0.580,
    JP: 0.520, US: 0.550, ZA: 0.590, BR: 0.430, EG: 0.600, ID: 0.550, VN: 0.610,
    TH: 0.560, MY: 0.550, PK: 0.630, BD: 0.610, DZ: 0.610, MA: 0.580, TN: 0.580,
    MX: 0.560, AL: 0.610, RS: 0.610, BA: 0.620, OTHER: 0.710
  },
  'Aluminous cement': {
    CN: 0.750, IN: 0.730, TR: 0.700, RU: 0.760, UA: 0.730, GB: 0.650, KR: 0.710,
    JP: 0.660, US: 0.700, ZA: 0.740, BR: 0.550, EG: 0.730, ID: 0.700, VN: 0.740,
    PK: 0.760, OTHER: 0.820
  },
  'Other hydraulic cements': {
    CN: 0.550, IN: 0.510, TR: 0.480, RU: 0.560, UA: 0.530, GB: 0.440, KR: 0.500,
    JP: 0.450, US: 0.480, ZA: 0.520, BR: 0.380, EG: 0.520, ID: 0.480, VN: 0.530,
    PK: 0.560, OTHER: 0.630
  },
  'Calcined clays': {
    CN: 0.310, IN: 0.290, TR: 0.270, RU: 0.320, OTHER: 0.370
  },

  // ─── IRON & STEEL ───
  'Sintered ore': {
    CN: 0.330, IN: 0.310, TR: 0.300, RU: 0.350, UA: 0.320, GB: 0.280, KR: 0.300,
    JP: 0.270, US: 0.280, ZA: 0.310, BR: 0.260, MX: 0.290, AU: 0.280, OTHER: 0.380
  },
  'Pig iron': {
    CN: 1.800, IN: 2.100, TR: 1.700, RU: 1.850, UA: 2.000, GB: 1.650, KR: 1.750,
    JP: 1.700, US: 1.750, ZA: 2.050, BR: 1.400, EG: 1.900, ID: 1.850, VN: 2.000,
    MX: 1.750, AU: 1.700, OTHER: 2.200
  },
  'DRI / sponge iron': {
    CN: 1.100, IN: 1.300, TR: 0.700, RU: 0.900, UA: 1.000, GB: 0.650, KR: 0.800,
    JP: 0.700, US: 0.600, ZA: 1.200, BR: 0.550, EG: 0.750, ID: 1.100, VN: 1.200,
    MX: 0.700, SA: 0.600, AE: 0.550, QA: 0.500, OTHER: 1.400
  },
  'Crude steel': {
    CN: 2.050, IN: 2.300, TR: 0.950, RU: 1.950, UA: 2.100, GB: 1.200, KR: 1.850,
    JP: 1.800, US: 1.100, ZA: 2.200, BR: 1.350, EG: 1.500, ID: 1.900, VN: 2.100,
    MX: 1.200, TW: 1.750, OTHER: 2.520
  },
  'Slabs': {
    CN: 1.950, IN: 2.200, TR: 0.900, RU: 1.850, UA: 2.000, GB: 1.150, KR: 1.800,
    JP: 1.750, US: 1.050, ZA: 2.100, BR: 1.300, EG: 1.450, VN: 2.000,
    MX: 1.150, TW: 1.700, OTHER: 2.400
  },
  'HR flat ≥600mm': {
    CN: 2.100, IN: 2.350, TR: 1.000, RU: 2.000, UA: 2.150, GB: 1.250, KR: 1.900,
    JP: 1.850, US: 1.150, ZA: 2.250, BR: 1.400, EG: 1.550, VN: 2.150,
    MX: 1.250, TW: 1.800, OTHER: 2.580
  },
  'CR flat ≥600mm': {
    CN: 2.250, IN: 2.500, TR: 1.100, RU: 2.100, UA: 2.300, GB: 1.350, KR: 2.000,
    JP: 1.950, US: 1.250, ZA: 2.400, BR: 1.500, VN: 2.300,
    MX: 1.350, TW: 1.900, OTHER: 2.750
  },
  'Coated flat ≥600mm': {
    CN: 2.350, IN: 2.600, TR: 1.200, RU: 2.200, UA: 2.400, GB: 1.450, KR: 2.100,
    JP: 2.050, US: 1.350, ZA: 2.500, BR: 1.600, VN: 2.400,
    TW: 2.000, OTHER: 2.850
  },
  'HR bars/rods (coils)': {
    CN: 2.150, IN: 2.400, TR: 1.050, RU: 2.050, UA: 2.200, GB: 1.300, KR: 1.950,
    JP: 1.900, US: 1.200, ZA: 2.300, BR: 1.450, OTHER: 2.650
  },
  'Wire': {
    CN: 2.300, IN: 2.550, TR: 1.150, RU: 2.150, UA: 2.350, GB: 1.400, KR: 2.050,
    JP: 2.000, US: 1.300, ZA: 2.450, BR: 1.550, OTHER: 2.800
  },
  'Seamless tubes': {
    CN: 2.500, IN: 2.750, TR: 1.250, RU: 2.350, UA: 2.550, GB: 1.500, KR: 2.200,
    JP: 2.150, US: 1.400, ZA: 2.600, BR: 1.650, OTHER: 3.000
  },
  'Other tubes/pipes': {
    CN: 2.350, IN: 2.600, TR: 1.150, RU: 2.200, UA: 2.400, GB: 1.400, KR: 2.100,
    JP: 2.050, US: 1.300, ZA: 2.500, BR: 1.550, OTHER: 2.850
  },
  'Structures': {
    CN: 2.400, IN: 2.650, TR: 1.200, RU: 2.250, UA: 2.450, GB: 1.450, KR: 2.150,
    JP: 2.100, US: 1.350, ZA: 2.550, BR: 1.600, OTHER: 2.900
  },
  'Fasteners': {
    CN: 2.500, IN: 2.750, TR: 1.250, RU: 2.350, UA: 2.550, GB: 1.500, KR: 2.200,
    JP: 2.150, US: 1.400, BR: 1.650, OTHER: 3.000
  },
  'FeMn (high carbon)': { CN: 1.500, IN: 1.700, ZA: 1.800, UA: 1.600, RU: 1.550, BR: 1.200, OTHER: 1.900 },
  'FeMn (low/med carbon)': { CN: 2.800, IN: 3.100, ZA: 3.200, UA: 3.000, OTHER: 3.500 },
  'FeCr (high carbon)': { CN: 2.200, IN: 2.500, ZA: 2.600, TR: 2.000, KZ: 2.400, OTHER: 2.800 },
  'FeCr (med/low carbon)': { CN: 3.500, IN: 3.800, ZA: 4.000, OTHER: 4.500 },
  'FeCr (low carbon)': { CN: 4.000, IN: 4.300, ZA: 4.500, OTHER: 5.000 },
  'FeNi': { CN: 3.500, IN: 3.200, ID: 4.200, PH: 4.000, OTHER: 4.500 },
  'Stainless semi-finished': { CN: 2.800, IN: 3.100, ID: 3.200, TW: 2.500, KR: 2.600, JP: 2.500, OTHER: 3.500 },

  // ─── ALUMINIUM ───
  'Unwrought aluminium': {
    CN: 16.500, IN: 18.200, RU: 4.200, AE: 8.800, SA: 9.500, BH: 9.000,
    AU: 12.500, ID: 16.000, IS: 0, NO: 0, MZ: 12.000, ZA: 19.500,
    CA: 6.500, US: 8.000, BR: 7.500, NZ: 6.800, QA: 9.200, OTHER: 18.000
  },
  'Al bars/rods/profiles': {
    CN: 17.500, IN: 19.200, RU: 5.200, AE: 9.800, US: 9.000, OTHER: 19.000
  },
  'Al plates/sheets': {
    CN: 17.800, IN: 19.500, RU: 5.500, AE: 10.100, US: 9.300, OTHER: 19.300
  },
  'Al foil': {
    CN: 18.200, IN: 19.800, RU: 5.800, AE: 10.400, US: 9.600, OTHER: 19.600
  },
  'Al tubes/pipes': {
    CN: 17.600, IN: 19.300, RU: 5.300, AE: 9.900, US: 9.100, OTHER: 19.100
  },
  'Al wire': {
    CN: 17.200, IN: 18.900, RU: 4.900, AE: 9.500, US: 8.700, OTHER: 18.700
  },
  'Al structures': {
    CN: 18.000, IN: 19.700, RU: 5.700, AE: 10.300, US: 9.500, OTHER: 19.500
  },
  'Other Al articles': {
    CN: 17.800, IN: 19.500, RU: 5.500, AE: 10.100, US: 9.300, OTHER: 19.300
  },

  // ─── FERTILIZERS ───
  'Ammonia': {
    CN: 2.340, IN: 2.100, TR: 1.850, RU: 2.100, UA: 2.200, GB: 1.650, KR: 1.800,
    JP: 1.750, US: 1.600, ZA: 2.000, BR: 1.500, EG: 1.700, ID: 2.000,
    SA: 1.500, AE: 1.450, QA: 1.400, TT: 1.650, DZ: 1.800, NG: 2.100, OTHER: 2.500
  },
  'Urea': {
    CN: 2.150, IN: 1.950, TR: 1.700, RU: 1.900, UA: 2.000, GB: 1.500, KR: 1.650,
    JP: 1.600, US: 1.450, EG: 1.550, SA: 1.350, AE: 1.300, QA: 1.250,
    DZ: 1.650, NG: 1.950, MY: 1.700, ID: 1.850, BD: 2.100, OTHER: 2.300
  },
  'Nitric acid': {
    CN: 2.600, IN: 2.800, RU: 2.500, UA: 2.700, EG: 2.650, OTHER: 3.000
  },
  'Ammonium nitrate': {
    CN: 3.100, IN: 3.300, RU: 2.900, UA: 3.100, EG: 3.000, TR: 2.700, OTHER: 3.500
  },
  'CAN': {
    CN: 1.900, IN: 2.100, RU: 1.800, UA: 1.950, EG: 1.850, TR: 1.700, OTHER: 2.200
  },
  'UAN solution': {
    CN: 2.400, IN: 2.600, RU: 2.200, UA: 2.400, EG: 2.300, TR: 2.100, US: 1.800, OTHER: 2.700
  },
  'DAP': {
    CN: 1.200, IN: 1.400, RU: 1.100, MA: 1.050, US: 0.950, SA: 0.900, OTHER: 1.500
  },
  'MAP': {
    CN: 1.100, IN: 1.300, RU: 1.000, MA: 0.950, US: 0.850, OTHER: 1.400
  },
  'NPK': {
    CN: 1.300, IN: 1.500, RU: 1.200, EG: 1.350, TR: 1.150, OTHER: 1.600
  },
  'Potassium nitrate': {
    CN: 1.800, IL: 1.600, CL: 1.500, OTHER: 2.000
  },

  // ─── ELECTRICITY (tCO2/MWh) ───
  'Electricity': {
    CN: 0.581, IN: 0.708, TR: 0.420, RU: 0.340, UA: 0.450, KR: 0.417,
    JP: 0.457, US: 0.371, ZA: 0.928, BR: 0.074, EG: 0.450, ID: 0.760,
    VN: 0.580, TH: 0.450, MY: 0.550, PK: 0.450, BD: 0.580, DZ: 0.480,
    MA: 0.610, TN: 0.420, MX: 0.410, AU: 0.610, NZ: 0.100, SA: 0.650,
    AE: 0.380, BA: 0.750, RS: 0.690, MK: 0.550, AL: 0.020, ME: 0.350,
    GE: 0.120, KZ: 0.630, BY: 0.400, OTHER: 0.750
  },

  // ─── HYDROGEN (tCO2/t H2) ───
  'Hydrogen': {
    CN: 12.000, IN: 13.500, TR: 9.500, RU: 10.500, UA: 11.000, GB: 8.500,
    KR: 9.000, JP: 8.800, US: 9.200, ZA: 14.000, BR: 7.500, SA: 8.000,
    AE: 7.800, AU: 10.000, OTHER: 14.500
  }
};

// Indirect emission defaults (tCO2/t product) — applicable to cement, fertilizers, hydrogen
export const INDIRECT_DEFAULTS = {
  'Cement clinker': { CN: 0.120, IN: 0.150, TR: 0.090, RU: 0.070, OTHER: 0.130 },
  'Portland cement': { CN: 0.085, IN: 0.105, TR: 0.065, RU: 0.050, OTHER: 0.095 },
  'Ammonia': { CN: 0.200, IN: 0.250, TR: 0.150, RU: 0.120, OTHER: 0.180 },
  'Urea': { CN: 0.150, IN: 0.190, TR: 0.120, RU: 0.090, OTHER: 0.140 },
  'Nitric acid': { CN: 0.100, IN: 0.130, TR: 0.080, OTHER: 0.110 },
  'Hydrogen': { CN: 0.800, IN: 1.000, TR: 0.600, RU: 0.500, OTHER: 0.750 },
};

export const MARKUP_SCHEDULE = {
  2026: { standard: 0.10, fertilizer: 0.01 },
  2027: { standard: 0.20, fertilizer: 0.01 },
  2028: { standard: 0.30, fertilizer: 0.01 },
  2029: { standard: 0.30, fertilizer: 0.01 },
  2030: { standard: 0.30, fertilizer: 0.01 },
};

export const getDefaultValue = (product, countryCode, year = 2026) => {
  const productDefaults = DEFAULT_VALUES[product];
  if (!productDefaults) return null;

  const baseValue = productDefaults[countryCode] ?? productDefaults['OTHER'] ?? null;
  if (baseValue === null) return null;

  const isFertilizer = ['Ammonia', 'Urea', 'Nitric acid', 'Ammonium nitrate', 'CAN', 'UAN solution', 'DAP', 'MAP', 'NPK', 'Potassium nitrate'].includes(product);
  const markupYear = Math.min(year, 2030);
  const markup = MARKUP_SCHEDULE[markupYear] || MARKUP_SCHEDULE[2028];
  const markupRate = isFertilizer ? markup.fertilizer : markup.standard;

  return baseValue * (1 + markupRate);
};

export const getIndirectDefault = (product, countryCode) => {
  const productDefaults = INDIRECT_DEFAULTS[product];
  if (!productDefaults) return 0;
  return productDefaults[countryCode] ?? productDefaults['OTHER'] ?? 0;
};
