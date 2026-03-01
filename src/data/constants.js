// ═══════════════════════════════════════════════════════════════
// CBAM Official Constants — EU Regulation 2023/956 & 2023/1773
// ═══════════════════════════════════════════════════════════════

// Phase-in schedule (% of certificates to surrender)
export const PHASE_IN_FACTORS = {
    2026: 0.025, 2027: 0.05, 2028: 0.10, 2029: 0.225,
    2030: 0.485, 2031: 0.61, 2032: 0.735, 2033: 0.86, 2034: 1.0,
};
export const YEARS = Object.keys(PHASE_IN_FACTORS).map(Number);

export const PRODUCT_CATEGORIES = [
    "All Categories", "Cement", "Fertilisers", "Hydrogen", "Iron and steel",
];

export const DEFAULT_EU_ETS_PRICE = 85;
export const DEFAULT_INDIA_CARBON_PRICE = 0;
export const EXEMPTION_THRESHOLD_TONNES = 50;
export const N2O_GWP = 298;

// ═══════════════════════════════════════════════════════════════
// EU Benchmarks (tCO₂/t product) — Regulation 2019/331
// Used when no actual data is available
// ═══════════════════════════════════════════════════════════════
export const EU_BENCHMARKS = {
    "clinker": { value: 0.766, unit: "tCO₂/t clinker", note: "EU benchmark for grey clinker" },
    "cement": { value: 0.554, unit: "tCO₂/t cement", note: "EU benchmark for grey cement" },
    "pig_iron": { value: 1.328, unit: "tCO₂/t hot metal", note: "EU blast furnace benchmark" },
    "eaf_steel": { value: 0.283, unit: "tCO₂/t crude steel", note: "EU EAF carbon steel benchmark" },
    "eaf_alloy": { value: 0.352, unit: "tCO₂/t crude steel", note: "EU EAF high alloy steel benchmark" },
    "sintered_ore": { value: 0.171, unit: "tCO₂/t sinter", note: "EU sintered ore benchmark" },
    "nitric_acid": { value: 0.302, unit: "tCO₂e/t 100%HNO₃", note: "Includes N₂O (GWP 298)" },
    "ammonia": { value: 1.619, unit: "tCO₂/t NH₃", note: "EU ammonia benchmark" },
    "hydrogen": { value: 8.85, unit: "tCO₂/t H₂", note: "EU hydrogen benchmark (SMR)" },
    "ferro_mn_hc": { value: 1.543, unit: "tCO₂/t FeMn", note: "High-carbon ferro-manganese" },
    "ferro_cr_hc": { value: 2.094, unit: "tCO₂/t FeCr", note: "High-carbon ferro-chromium" },
    "ferro_ni": { value: 2.831, unit: "tCO₂/t FeNi", note: "Ferro-nickel" },
    "dri": { value: 0.560, unit: "tCO₂/t DRI", note: "Direct reduced iron (gas-based)" },
};

// ═══════════════════════════════════════════════════════════════
// PRECURSOR MAP — Annex II (EU) 2023/1773
// Comprehensive mapping of complex goods to their precursors
//
// Each precursor entry:
//   name: Human-readable name
//   cn: Reference CN code in our database
//   defaultMass: Default mass ratio (tonnes precursor / tonne product)
//   note: Regulatory context
// ═══════════════════════════════════════════════════════════════

const PI = "Pig Iron";      // CN 7201
const DRI_N = "DRI / Sponge Iron"; // CN 7203
const FEMN = "Ferro-Manganese";    // CN 720211/720219
const FECR = "Ferro-Chromium";     // CN 720241/720249
const FENI = "Ferro-Nickel";       // CN 72026000
const CS = "Crude Steel (Non-alloy)"; // CN 72061000
const CS_SS = "Crude Steel (Stainless)"; // CN 72181000
const CS_AL = "Crude Steel (Alloy)";  // CN 722410
const CLK = "Cement Clinker";

// === BOF (Basic Oxygen Furnace) precursors for crude steel ===
const BOF_PRECURSORS = [
    { name: PI, cn: "7201", defaultMass: 0.90, note: "Primary input for BOF steelmaking" },
    { name: DRI_N, cn: "7203", defaultMass: 0.05, note: "Optional DRI charge in BOF" },
    { name: FEMN, cn: "720211", defaultMass: 0.008, note: "Deoxidiser / alloying" },
    { name: FECR, cn: "720241", defaultMass: 0.003, note: "Alloying element (if used)" },
    { name: FENI, cn: "72026000", defaultMass: 0.002, note: "Alloying element (if used)" },
];

// === EAF (Electric Arc Furnace) precursors for crude steel ===
const EAF_PRECURSORS = [
    { name: PI, cn: "7201", defaultMass: 0.25, note: "Pig iron charge in EAF" },
    { name: DRI_N, cn: "7203", defaultMass: 0.35, note: "DRI charge in EAF" },
    { name: FEMN, cn: "720211", defaultMass: 0.008, note: "Deoxidiser / alloying" },
    { name: FECR, cn: "720241", defaultMass: 0.003, note: "Alloying element" },
    { name: FENI, cn: "72026000", defaultMass: 0.002, note: "Alloying element" },
];

// === Non-alloy steel products use crude steel as precursor ===
const NONALLOY_PRODUCT = [
    { name: CS, cn: "72061000", defaultMass: 1.08, note: "Crude steel input (incl. yield loss)" },
];

// === Stainless steel products ===
const STAINLESS_PRODUCT = [
    { name: CS_SS, cn: "72181000", defaultMass: 1.10, note: "Stainless crude steel input" },
    { name: FECR, cn: "720241", defaultMass: 0.18, note: "Chromium content for stainless" },
    { name: FENI, cn: "72026000", defaultMass: 0.08, note: "Nickel content for stainless" },
];

// === Alloy steel products ===
const ALLOY_PRODUCT = [
    { name: CS_AL, cn: "722410", defaultMass: 1.10, note: "Alloy crude steel input" },
    { name: FEMN, cn: "720211", defaultMass: 0.02, note: "Manganese alloying" },
    { name: FECR, cn: "720241", defaultMass: 0.05, note: "Chromium alloying (if applicable)" },
];

// === Downstream steel (tubes, structures, fasteners, articles) ===
const DOWNSTREAM_NONALLOY = [
    { name: CS, cn: "72061000", defaultMass: 1.12, note: "Crude steel (higher yield loss for downstream)" },
];
const DOWNSTREAM_STAINLESS = [
    { name: CS_SS, cn: "72181000", defaultMass: 1.15, note: "Stainless crude steel" },
    { name: FECR, cn: "720241", defaultMass: 0.18, note: "Chromium for stainless" },
    { name: FENI, cn: "72026000", defaultMass: 0.08, note: "Nickel for stainless" },
];

// === Fertiliser precursors ===
const FERT_AMMONIA = { name: "Ammonia (NH₃)", cn: "28080000", defaultMass: 0.21, note: "Haber-Bosch process input" };
const FERT_NITRIC = { name: "Nitric Acid (HNO₃)", cn: "28080000", defaultMass: 0.35, note: "Includes N₂O emissions (GWP 298)" };
const FERT_UREA = { name: "Urea", cn: "31021090", defaultMass: 0.30, note: "CO₂-intensive nitrogen source" };

export const PRECURSOR_MAP = {
    // ─── CEMENT ────────────────────────────────────────────────
    // Portland cements → clinker
    "25232100": [{ name: CLK + " (White)", cn: "25231000", defaultMass: 0.95, note: "White Portland: ~95% clinker" }],
    "25232900": [{ name: CLK + " (Grey)", cn: "25231000", defaultMass: 0.73, note: "Grey Portland: 65-80% clinker (CEM I-IV)" }],
    "25233000": [{ name: CLK, cn: "25231000", defaultMass: 0.80, note: "Aluminous cement uses aluminous clinker" }],
    // Hydraulic cements (may use clinker)
    "25239000": [{ name: CLK, cn: "25231000", defaultMass: 0.50, note: "Hydraulic cements: variable clinker ratio" }],

    // ─── IRON & STEEL: Sintered ore ────────────────────────────
    // Agglomerated iron ores are simple goods (no precursors)

    // ─── IRON & STEEL: DRI ────────────────────────────────────
    // DRI can use sintered ore and hydrogen
    "7203": [
        { name: "Sintered Ore", cn: "26011200", defaultMass: 1.40, note: "Iron ore feed for DRI" },
        { name: "Hydrogen", cn: "28041000", defaultMass: 0.05, note: "H₂-based DRI (if applicable)" },
    ],

    // ─── IRON & STEEL: Crude steel (BOF route) ────────────────
    "72061000": BOF_PRECURSORS,
    "72069000": BOF_PRECURSORS,

    // ─── IRON & STEEL: Semi-finished non-alloy (7207) ─────────
    "7207": NONALLOY_PRODUCT,

    // ─── IRON & STEEL: Flat-rolled non-alloy (7208-7212) ──────
    "7208": NONALLOY_PRODUCT,
    "7209": NONALLOY_PRODUCT,
    "7210": NONALLOY_PRODUCT,
    "7211": NONALLOY_PRODUCT,
    "7212": NONALLOY_PRODUCT,

    // ─── IRON & STEEL: Bars/rods/wire non-alloy (7213-7217) ───
    "7213": NONALLOY_PRODUCT,
    "7214": NONALLOY_PRODUCT,
    "7215": NONALLOY_PRODUCT,
    "7216": NONALLOY_PRODUCT,
    "7217": NONALLOY_PRODUCT,

    // ─── IRON & STEEL: Stainless (7218-7223) ──────────────────
    "7218": STAINLESS_PRODUCT,
    "7219": STAINLESS_PRODUCT,
    "7220": STAINLESS_PRODUCT,
    "7221": STAINLESS_PRODUCT,
    "7222": STAINLESS_PRODUCT,
    "7223": STAINLESS_PRODUCT,

    // ─── IRON & STEEL: Alloy non-stainless (7224-7229) ────────
    "7224": ALLOY_PRODUCT,
    "7225": ALLOY_PRODUCT,
    "7226": ALLOY_PRODUCT,
    "7227": ALLOY_PRODUCT,
    "7228": ALLOY_PRODUCT,
    "7229": ALLOY_PRODUCT,

    // ─── IRON & STEEL: Downstream products ────────────────────
    // Sheet piling, railway material
    "7301": DOWNSTREAM_NONALLOY,
    "7302": DOWNSTREAM_NONALLOY,
    // Cast iron tubes
    "7303": [{ name: PI, cn: "7201", defaultMass: 1.05, note: "Cast iron tube from pig iron" }],
    // Seamless tubes
    "7304": DOWNSTREAM_NONALLOY,
    "7305": DOWNSTREAM_NONALLOY,
    // Welded tubes (mixed: some stainless CN codes)
    "7306": DOWNSTREAM_NONALLOY,
    // Tube fittings
    "7307": DOWNSTREAM_NONALLOY,
    // Structures
    "7308": DOWNSTREAM_NONALLOY,
    // Reservoirs/tanks
    "7309": DOWNSTREAM_NONALLOY,
    "7310": DOWNSTREAM_NONALLOY,
    // Gas containers
    "7311": DOWNSTREAM_NONALLOY,
    // Fasteners
    "7318": DOWNSTREAM_NONALLOY,
    // Articles
    "7326": DOWNSTREAM_NONALLOY,

    // Override specific stainless tube/fitting CN codes
    "73041100": DOWNSTREAM_STAINLESS,
    "73042200": DOWNSTREAM_STAINLESS,
    "73042400": DOWNSTREAM_STAINLESS,
    "73044100": DOWNSTREAM_STAINLESS,
    "73061100": DOWNSTREAM_STAINLESS,
    "73062100": DOWNSTREAM_STAINLESS,
    "73064020": DOWNSTREAM_STAINLESS,
    "73064080": DOWNSTREAM_STAINLESS,
    "73066110": DOWNSTREAM_STAINLESS,
    "73066910": DOWNSTREAM_STAINLESS,
    // Stainless fittings
    "73072100": DOWNSTREAM_STAINLESS,
    "730722": DOWNSTREAM_STAINLESS,
    "730723": DOWNSTREAM_STAINLESS,
    "730729": DOWNSTREAM_STAINLESS,
    // Stainless fasteners
    "73181210": DOWNSTREAM_STAINLESS,
    "73181410": DOWNSTREAM_STAINLESS,

    // ─── FERTILISERS ──────────────────────────────────────────
    // Nitric acid → uses ammonia (ammonia is precursor)
    "28080000": [{ name: "Ammonia (NH₃)", cn: "28080000", defaultMass: 0.29, note: "Ammonia oxidation to produce HNO₃" }],
    // Ammonium sulphate
    "31022100": [FERT_AMMONIA],
    // Double salts ammonium sulphate + nitrate
    "31022900": [FERT_AMMONIA, FERT_NITRIC],
    // Ammonium nitrate
    "31023010": [FERT_AMMONIA, FERT_NITRIC],
    "31023090": [FERT_AMMONIA, FERT_NITRIC],
    // Ammonium nitrate + calcium carbonate (CAN)
    "31024010": [FERT_AMMONIA, FERT_NITRIC],
    "31024090": [FERT_AMMONIA, FERT_NITRIC],
    // Sodium nitrate
    "31025000": [FERT_NITRIC],
    // Calcium nitrate + ammonium nitrate
    "31026000": [FERT_AMMONIA, FERT_NITRIC],
    // Urea + ammonium nitrate (UAN)
    "31028000": [FERT_UREA, FERT_AMMONIA, FERT_NITRIC],
    // Other nitrogen fertilisers
    "31029000": [FERT_AMMONIA],
    // Fertilisers in tablets
    "31051000": [FERT_AMMONIA],
    // NPK
    "31052010": [FERT_NITRIC, FERT_AMMONIA],
    "31052090": [FERT_NITRIC, FERT_AMMONIA],
    // DAP
    "31053000": [FERT_AMMONIA],
    // MAP
    "31054000": [FERT_AMMONIA],
    // NP fertilisers
    "31055100": [FERT_NITRIC, FERT_AMMONIA],
    "31055900": [FERT_AMMONIA],
    // NK fertilisers
    "31059020": [FERT_AMMONIA, FERT_NITRIC],
    "31059080": [FERT_AMMONIA],
};

/**
 * Look up precursors for a CN code.
 * Priority: exact CN → 8-digit prefix → 6-digit → 4-digit
 */
export function getPrecursors(cnCode) {
    if (PRECURSOR_MAP[cnCode]) return PRECURSOR_MAP[cnCode];
    // Try progressively shorter prefixes
    for (const len of [8, 6, 4]) {
        const prefix = cnCode.substring(0, len);
        if (PRECURSOR_MAP[prefix]) return PRECURSOR_MAP[prefix];
    }
    return [];
}

/** Is this a complex good (has CBAM precursors)? */
export function isComplexGood(cnCode) {
    return getPrecursors(cnCode).length > 0;
}

/** Get EU benchmark for a product type (if available) */
export function getBenchmark(key) {
    return EU_BENCHMARKS[key] || null;
}
