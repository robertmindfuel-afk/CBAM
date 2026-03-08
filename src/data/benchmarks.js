// EU CBAM Benchmark values per Implementing Regulation (EU) 2025/2620
// Values in tCO2e per tonne of product
// Column A = actual/verified data benchmarks, Column B = default value benchmarks

export const BENCHMARKS = {
  // ─── CEMENT ───
  cement: [
    { product: 'Grey clinker', route: 'Standard', benchA: 0.766, benchB: 0.766, unit: 'tCO2/t clinker' },
    { product: 'White clinker', route: 'Standard', benchA: 0.987, benchB: 0.987, unit: 'tCO2/t clinker' },
    { product: 'Cement', route: 'From clinker', benchA: null, benchB: null, unit: 'Derived from clinker ratio', note: 'Calculated as clinker_ratio × clinker_benchmark' },
  ],
  // ─── IRON & STEEL ───
  iron_steel: [
    { product: 'Sintered ore', route: 'Sintering', benchA: 0.171, benchB: 0.240, unit: 'tCO2/t sinter' },
    { product: 'Pig iron / HM', route: 'Blast Furnace', benchA: 1.328, benchB: 1.328, unit: 'tCO2/t hot metal' },
    { product: 'DRI / Sponge iron', route: 'Gas-based DRI', benchA: 0.540, benchB: 0.540, unit: 'tCO2/t DRI' },
    { product: 'DRI / Sponge iron', route: 'Coal-based DRI', benchA: 1.100, benchB: 1.100, unit: 'tCO2/t DRI' },
    { product: 'EAF carbon steel', route: 'EAF (100% DRI)', benchA: 0.283, benchB: 0.283, unit: 'tCO2/t liquid steel' },
    { product: 'EAF carbon steel', route: 'EAF (100% scrap)', benchA: 0.072, benchB: 0.072, unit: 'tCO2/t liquid steel' },
    { product: 'BOF steel', route: 'BOF/BOS', benchA: 0.232, benchB: 0.232, unit: 'tCO2/t liquid steel' },
    { product: 'Semi-finished / HRC', route: 'BF-BOF integrated', benchA: 1.370, benchB: 1.852, unit: 'tCO2/t' },
    { product: 'Semi-finished / HRC', route: 'DRI-EAF', benchA: 0.481, benchB: 0.700, unit: 'tCO2/t' },
    { product: 'Semi-finished / HRC', route: 'Scrap-EAF', benchA: 0.072, benchB: 0.283, unit: 'tCO2/t' },
    { product: 'Cold-rolled', route: 'From HR coil', benchA: 0.045, benchB: 0.045, unit: 'tCO2/t (incremental)' },
    { product: 'Coated/plated', route: 'From CR coil', benchA: 0.025, benchB: 0.025, unit: 'tCO2/t (incremental)' },
    { product: 'Long products', route: 'BF-BOF', benchA: 1.420, benchB: 1.900, unit: 'tCO2/t' },
    { product: 'Long products', route: 'Scrap-EAF', benchA: 0.148, benchB: 0.350, unit: 'tCO2/t' },
    { product: 'Tubes/pipes seamless', route: 'From billet', benchA: 0.090, benchB: 0.090, unit: 'tCO2/t (incremental)' },
    { product: 'Tubes/pipes welded', route: 'From HR/CR', benchA: 0.035, benchB: 0.035, unit: 'tCO2/t (incremental)' },
    { product: 'FeMn (high C)', route: 'BF/SAF', benchA: 1.280, benchB: 1.280, unit: 'tCO2/t' },
    { product: 'FeMn (low/med C)', route: 'SAF + refining', benchA: 2.430, benchB: 2.430, unit: 'tCO2/t' },
    { product: 'FeCr (high C)', route: 'SAF', benchA: 1.600, benchB: 1.600, unit: 'tCO2/t' },
    { product: 'FeCr (low C)', route: 'SAF + refining', benchA: 3.200, benchB: 3.200, unit: 'tCO2/t' },
    { product: 'FeNi', route: 'RKEF', benchA: 2.700, benchB: 2.700, unit: 'tCO2/t' },
    { product: 'Stainless steel', route: 'EAF + AOD', benchA: 0.352, benchB: 0.352, unit: 'tCO2/t liquid steel' },
  ],
  // ─── ALUMINIUM ───
  aluminium: [
    { product: 'Unwrought aluminium', route: 'Primary (electrolysis)', benchA: 1.464, benchB: 1.464, unit: 'tCO2/t Al' },
    { product: 'Unwrought aluminium', route: 'Secondary (>50% scrap)', benchA: 0.139, benchB: 0.139, unit: 'tCO2/t Al' },
    { product: 'Alumina (precursor)', route: 'Bayer process', benchA: 0.472, benchB: 0.472, unit: 'tCO2/t alumina' },
    { product: 'Al semi-products', route: 'From primary ingot', benchA: 0.045, benchB: 0.045, unit: 'tCO2/t (incremental)' },
    { product: 'Al foil', route: 'From primary', benchA: 0.065, benchB: 0.065, unit: 'tCO2/t (incremental)' },
  ],
  // ─── FERTILIZERS ───
  fertilizers: [
    { product: 'Ammonia', route: 'Steam methane reforming', benchA: 1.522, benchB: 1.522, unit: 'tCO2/t NH3' },
    { product: 'Ammonia', route: 'Coal gasification', benchA: 2.800, benchB: 2.800, unit: 'tCO2/t NH3' },
    { product: 'Nitric acid', route: 'Standard', benchA: 0.302, benchB: 0.302, unit: 'tCO2e/t HNO3 (incl. N2O)' },
    { product: 'Urea', route: 'Standard', benchA: 0.053, benchB: 0.053, unit: 'tCO2/t urea (excl. NH3)' },
    { product: 'Ammonium nitrate', route: 'From NH3 + HNO3', benchA: 0.180, benchB: 0.180, unit: 'tCO2e/t AN (incl. N2O, excl. precursors)' },
    { product: 'CAN', route: 'Mixed', benchA: 0.120, benchB: 0.120, unit: 'tCO2e/t CAN' },
    { product: 'UAN', route: 'Solution', benchA: 0.100, benchB: 0.100, unit: 'tCO2e/t UAN' },
  ],
  // ─── ELECTRICITY ───
  electricity: [
    { product: 'Electricity', route: 'Grid average', benchA: 0, benchB: 0, unit: 'tCO2/MWh', note: 'No free allocation for electricity' },
  ],
  // ─── HYDROGEN ───
  hydrogen: [
    { product: 'Hydrogen', route: 'Steam methane reforming', benchA: 8.850, benchB: 8.850, unit: 'tCO2/t H2' },
    { product: 'Hydrogen', route: 'Electrolysis (green)', benchA: 0.000, benchB: 0.000, unit: 'tCO2/t H2' },
    { product: 'Hydrogen', route: 'Coal gasification', benchA: 18.000, benchB: 18.000, unit: 'tCO2/t H2' },
  ],
};

// Free allocation phase-out schedule (CBAM factor = remaining free allocation %)
export const PHASE_OUT = [
  { year: 2025, cbamFactor: 1.000, obligation: 0.000, label: 'Transition (reporting only)' },
  { year: 2026, cbamFactor: 0.975, obligation: 0.025, label: 'Year 1 — 2.5% liability' },
  { year: 2027, cbamFactor: 0.950, obligation: 0.050, label: 'Year 2 — 5% liability' },
  { year: 2028, cbamFactor: 0.900, obligation: 0.100, label: 'Year 3 — 10% liability' },
  { year: 2029, cbamFactor: 0.775, obligation: 0.225, label: 'Year 4 — 22.5% liability' },
  { year: 2030, cbamFactor: 0.515, obligation: 0.485, label: 'Year 5 — 48.5% liability' },
  { year: 2031, cbamFactor: 0.390, obligation: 0.610, label: 'Year 6 — 61% liability' },
  { year: 2032, cbamFactor: 0.265, obligation: 0.735, label: 'Year 7 — 73.5% liability' },
  { year: 2033, cbamFactor: 0.140, obligation: 0.860, label: 'Year 8 — 86% liability' },
  { year: 2034, cbamFactor: 0.000, obligation: 1.000, label: 'Full CBAM — 100% liability' },
];

export const getPhaseOutForYear = (year) => {
  const entry = PHASE_OUT.find(p => p.year === year);
  if (entry) return entry;
  if (year < 2025) return { year, cbamFactor: 1, obligation: 0, label: 'Pre-CBAM' };
  if (year > 2034) return { year, cbamFactor: 0, obligation: 1, label: 'Full CBAM' };
  return PHASE_OUT[PHASE_OUT.length - 1];
};

// EU ETS price projections
export const ETS_PRICES = {
  2024: 65, 2025: 72, 2026: 85, 2027: 100, 2028: 108,
  2029: 115, 2030: 126, 2031: 132, 2032: 138, 2033: 144, 2034: 150,
};

export const getETSPrice = (year) => ETS_PRICES[year] || ETS_PRICES[2034];

// De minimis threshold (tonnes per year)
export const DE_MINIMIS_THRESHOLD = 50;

// Cross-sectoral correction factor (assumed ~1.0 for simplification)
export const CSCF = 1.0;
