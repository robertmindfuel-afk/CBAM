// Complete CBAM CN Code database per Annex I of Regulation (EU) 2023/956
// and Implementing Regulation (EU) 2025/2547

export const SECTORS = {
  CEMENT: { id: 'cement', name: 'Cement', icon: '🏗️', color: '#94a3b8', ghg: ['CO2'], emissionTypes: ['direct', 'indirect'] },
  IRON_STEEL: { id: 'iron_steel', name: 'Iron & Steel', icon: '⚙️', color: '#60a5fa', ghg: ['CO2'], emissionTypes: ['direct'] },
  ALUMINIUM: { id: 'aluminium', name: 'Aluminium', icon: '🔩', color: '#a78bfa', ghg: ['CO2', 'PFC'], emissionTypes: ['direct'] },
  FERTILIZERS: { id: 'fertilizers', name: 'Fertilizers', icon: '🌱', color: '#4ade80', ghg: ['CO2', 'N2O'], emissionTypes: ['direct', 'indirect'] },
  ELECTRICITY: { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#fbbf24', ghg: ['CO2'], emissionTypes: ['direct'] },
  HYDROGEN: { id: 'hydrogen', name: 'Hydrogen', icon: '💧', color: '#38bdf8', ghg: ['CO2'], emissionTypes: ['direct', 'indirect'] },
};

export const CN_CODES = [
  // ═══════════════════════════════════════════
  // CEMENT
  // ═══════════════════════════════════════════
  { cn: '2507 00 80', desc: 'Other kaolinic clays (calcined)', sector: 'cement', aggregated: 'Calcined clays', unit: 'tonne', deMinimis: true },
  { cn: '2523 10 00', desc: 'Cement clinkers', sector: 'cement', aggregated: 'Cement clinker', unit: 'tonne', deMinimis: true },
  { cn: '2523 21 00', desc: 'White Portland cement', sector: 'cement', aggregated: 'Portland cement', unit: 'tonne', deMinimis: true },
  { cn: '2523 29 00', desc: 'Other Portland cement', sector: 'cement', aggregated: 'Portland cement', unit: 'tonne', deMinimis: true },
  { cn: '2523 30 00', desc: 'Aluminous cement', sector: 'cement', aggregated: 'Aluminous cement', unit: 'tonne', deMinimis: true },
  { cn: '2523 90 00', desc: 'Other hydraulic cements', sector: 'cement', aggregated: 'Other hydraulic cements', unit: 'tonne', deMinimis: true },

  // ═══════════════════════════════════════════
  // IRON & STEEL - Iron ores
  // ═══════════════════════════════════════════
  { cn: '2601 12 00', desc: 'Agglomerated iron ores and concentrates', sector: 'iron_steel', aggregated: 'Sintered ore', unit: 'tonne', deMinimis: true },

  // IRON & STEEL - Primary products (Chapter 72)
  { cn: '7201 10 11', desc: 'Non-alloy pig iron, Mn≤0.4%, Si≤0.5%', sector: 'iron_steel', aggregated: 'Pig iron', unit: 'tonne', deMinimis: true },
  { cn: '7201 10 19', desc: 'Non-alloy pig iron, Mn≤0.4%, Si>0.5%', sector: 'iron_steel', aggregated: 'Pig iron', unit: 'tonne', deMinimis: true },
  { cn: '7201 10 30', desc: 'Non-alloy pig iron, Mn>0.4%', sector: 'iron_steel', aggregated: 'Pig iron', unit: 'tonne', deMinimis: true },
  { cn: '7201 20 00', desc: 'Alloy pig iron', sector: 'iron_steel', aggregated: 'Pig iron', unit: 'tonne', deMinimis: true },
  { cn: '7201 50 10', desc: 'Spiegeleisen', sector: 'iron_steel', aggregated: 'Pig iron', unit: 'tonne', deMinimis: true },
  { cn: '7202 11 20', desc: 'Ferro-manganese, C>2%, granulometry≤5mm', sector: 'iron_steel', aggregated: 'FeMn (high carbon)', unit: 'tonne', deMinimis: true },
  { cn: '7202 11 80', desc: 'Ferro-manganese, C>2%, other', sector: 'iron_steel', aggregated: 'FeMn (high carbon)', unit: 'tonne', deMinimis: true },
  { cn: '7202 19 00', desc: 'Ferro-manganese, C≤2%', sector: 'iron_steel', aggregated: 'FeMn (low/med carbon)', unit: 'tonne', deMinimis: true },
  { cn: '7202 41 10', desc: 'Ferro-chromium, C>4%', sector: 'iron_steel', aggregated: 'FeCr (high carbon)', unit: 'tonne', deMinimis: true },
  { cn: '7202 41 90', desc: 'Ferro-chromium, 3%<C≤4%', sector: 'iron_steel', aggregated: 'FeCr (high carbon)', unit: 'tonne', deMinimis: true },
  { cn: '7202 49 10', desc: 'Ferro-chromium, 0.5%<C≤3%', sector: 'iron_steel', aggregated: 'FeCr (med/low carbon)', unit: 'tonne', deMinimis: true },
  { cn: '7202 49 50', desc: 'Ferro-chromium, C≤0.5%', sector: 'iron_steel', aggregated: 'FeCr (low carbon)', unit: 'tonne', deMinimis: true },
  { cn: '7202 49 90', desc: 'Other ferro-chromium', sector: 'iron_steel', aggregated: 'FeCr (other)', unit: 'tonne', deMinimis: true },
  { cn: '7202 60 00', desc: 'Ferro-nickel', sector: 'iron_steel', aggregated: 'FeNi', unit: 'tonne', deMinimis: true },
  { cn: '7203 10 00', desc: 'Ferrous products from direct reduction (DRI)', sector: 'iron_steel', aggregated: 'DRI / sponge iron', unit: 'tonne', deMinimis: true },
  { cn: '7203 90 00', desc: 'Other spongy ferrous products', sector: 'iron_steel', aggregated: 'DRI / sponge iron', unit: 'tonne', deMinimis: true },
  { cn: '7205 10 00', desc: 'Granules of pig iron/spiegeleisen/steel', sector: 'iron_steel', aggregated: 'Iron/steel granules', unit: 'tonne', deMinimis: true },
  { cn: '7205 21 00', desc: 'Alloy steel powders', sector: 'iron_steel', aggregated: 'Iron/steel powder', unit: 'tonne', deMinimis: true },
  { cn: '7205 29 00', desc: 'Other iron/steel powders', sector: 'iron_steel', aggregated: 'Iron/steel powder', unit: 'tonne', deMinimis: true },
  { cn: '7206 10 00', desc: 'Ingots of iron and non-alloy steel', sector: 'iron_steel', aggregated: 'Crude steel', unit: 'tonne', deMinimis: true },
  { cn: '7206 90 00', desc: 'Other primary forms of iron/non-alloy steel', sector: 'iron_steel', aggregated: 'Crude steel', unit: 'tonne', deMinimis: true },

  // Semi-finished
  { cn: '7207 11 11', desc: 'Semi-finished, C<0.25%, rectangular, width≥2×thickness', sector: 'iron_steel', aggregated: 'Slabs', unit: 'tonne', deMinimis: true },
  { cn: '7207 11 14', desc: 'Semi-finished, C<0.25%, other rectangular', sector: 'iron_steel', aggregated: 'Billets/blooms', unit: 'tonne', deMinimis: true },
  { cn: '7207 11 16', desc: 'Semi-finished, C<0.25%, other', sector: 'iron_steel', aggregated: 'Other semi-finished', unit: 'tonne', deMinimis: true },
  { cn: '7207 12 10', desc: 'Semi-finished, C≥0.25%, rectangular', sector: 'iron_steel', aggregated: 'Slabs (med/high C)', unit: 'tonne', deMinimis: true },
  { cn: '7207 19 12', desc: 'Semi-finished, for re-rolling', sector: 'iron_steel', aggregated: 'Semi-finished for rolling', unit: 'tonne', deMinimis: true },
  { cn: '7207 19 80', desc: 'Semi-finished, other', sector: 'iron_steel', aggregated: 'Other semi-finished', unit: 'tonne', deMinimis: true },
  { cn: '7207 20 11', desc: 'Semi-finished stainless, Ni≥2.5%', sector: 'iron_steel', aggregated: 'Stainless semi-finished', unit: 'tonne', deMinimis: true },
  { cn: '7207 20 15', desc: 'Semi-finished stainless, Ni<2.5%', sector: 'iron_steel', aggregated: 'Stainless semi-finished', unit: 'tonne', deMinimis: true },
  { cn: '7207 20 17', desc: 'Semi-finished stainless, other', sector: 'iron_steel', aggregated: 'Stainless semi-finished', unit: 'tonne', deMinimis: true },
  { cn: '7207 20 32', desc: 'Semi-finished, alloy other than stainless, HSS', sector: 'iron_steel', aggregated: 'Alloy semi-finished', unit: 'tonne', deMinimis: true },
  { cn: '7207 20 52', desc: 'Semi-finished, alloy, rectangular, for re-rolling', sector: 'iron_steel', aggregated: 'Alloy semi-finished', unit: 'tonne', deMinimis: true },
  { cn: '7207 20 80', desc: 'Semi-finished, other alloy', sector: 'iron_steel', aggregated: 'Alloy semi-finished', unit: 'tonne', deMinimis: true },

  // Hot-rolled flat (heading covers all 7208 sub-codes)
  { cn: '7208', desc: 'Hot-rolled flat products, width≥600mm (all sub-headings)', sector: 'iron_steel', aggregated: 'HR flat ≥600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  // Cold-rolled flat
  { cn: '7209', desc: 'Cold-rolled flat products, width≥600mm (all sub-headings)', sector: 'iron_steel', aggregated: 'CR flat ≥600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7210', desc: 'Flat products, plated/coated, width≥600mm', sector: 'iron_steel', aggregated: 'Coated flat ≥600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7211', desc: 'Flat products, width<600mm, not clad/plated/coated', sector: 'iron_steel', aggregated: 'Flat <600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7212', desc: 'Flat products, width<600mm, clad/plated/coated', sector: 'iron_steel', aggregated: 'Coated flat <600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7213', desc: 'Bars and rods, hot-rolled, coils', sector: 'iron_steel', aggregated: 'HR bars/rods (coils)', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7214', desc: 'Bars and rods, hot-rolled, not in coils', sector: 'iron_steel', aggregated: 'HR bars/rods', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7215', desc: 'Other bars and rods of iron/non-alloy steel', sector: 'iron_steel', aggregated: 'Other bars/rods', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7216', desc: 'Angles, shapes and sections', sector: 'iron_steel', aggregated: 'Sections/angles', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7217', desc: 'Wire of iron or non-alloy steel', sector: 'iron_steel', aggregated: 'Wire', unit: 'tonne', isHeading: true, deMinimis: true },

  // Stainless steel
  { cn: '7218', desc: 'Stainless steel semi-finished products', sector: 'iron_steel', aggregated: 'Stainless semi-finished', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7219', desc: 'Stainless steel flat-rolled, width≥600mm', sector: 'iron_steel', aggregated: 'Stainless flat ≥600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7220', desc: 'Stainless steel flat-rolled, width<600mm', sector: 'iron_steel', aggregated: 'Stainless flat <600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7221 00', desc: 'Stainless steel bars/rods, hot-rolled, coils', sector: 'iron_steel', aggregated: 'Stainless bars (coils)', unit: 'tonne', deMinimis: true },
  { cn: '7222', desc: 'Stainless steel bars/rods/sections/wire', sector: 'iron_steel', aggregated: 'Stainless bars/sections', unit: 'tonne', isHeading: true, deMinimis: true },

  // Other alloy steel
  { cn: '7224', desc: 'Other alloy steel semi-finished', sector: 'iron_steel', aggregated: 'Alloy semi-finished', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7225', desc: 'Other alloy steel flat-rolled, width≥600mm', sector: 'iron_steel', aggregated: 'Alloy flat ≥600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7226', desc: 'Other alloy steel flat-rolled, width<600mm', sector: 'iron_steel', aggregated: 'Alloy flat <600mm', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7227', desc: 'Other alloy steel bars/rods, hot-rolled, coils', sector: 'iron_steel', aggregated: 'Alloy bars (coils)', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7228', desc: 'Other alloy steel bars/rods/shapes/sections', sector: 'iron_steel', aggregated: 'Alloy bars/sections', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7229', desc: 'Other alloy steel wire', sector: 'iron_steel', aggregated: 'Alloy wire', unit: 'tonne', isHeading: true, deMinimis: true },

  // Chapter 73 articles
  { cn: '7301', desc: 'Sheet piling of iron or steel', sector: 'iron_steel', aggregated: 'Sheet piling', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7302', desc: 'Railway/tramway track construction material', sector: 'iron_steel', aggregated: 'Railway material', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7303 00', desc: 'Tubes/pipes of cast iron', sector: 'iron_steel', aggregated: 'Cast iron tubes', unit: 'tonne', deMinimis: true },
  { cn: '7304', desc: 'Tubes/pipes seamless, of iron/steel', sector: 'iron_steel', aggregated: 'Seamless tubes', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7305', desc: 'Tubes/pipes welded, ext. diameter >406.4mm', sector: 'iron_steel', aggregated: 'Large welded tubes', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7306', desc: 'Other tubes, pipes and hollow profiles', sector: 'iron_steel', aggregated: 'Other tubes/pipes', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7307', desc: 'Tube or pipe fittings', sector: 'iron_steel', aggregated: 'Tube fittings', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7308', desc: 'Structures and parts of structures', sector: 'iron_steel', aggregated: 'Structures', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7309 00', desc: 'Reservoirs/tanks/vats >300 litres', sector: 'iron_steel', aggregated: 'Large containers', unit: 'tonne', deMinimis: true },
  { cn: '7310', desc: 'Tanks/drums/cans ≤300 litres', sector: 'iron_steel', aggregated: 'Small containers', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7311 00', desc: 'Containers for compressed/liquefied gas', sector: 'iron_steel', aggregated: 'Gas containers', unit: 'tonne', deMinimis: true },
  { cn: '7318', desc: 'Screws, bolts, nuts, washers etc.', sector: 'iron_steel', aggregated: 'Fasteners', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7326', desc: 'Other articles of iron or steel', sector: 'iron_steel', aggregated: 'Other steel articles', unit: 'tonne', isHeading: true, deMinimis: true },

  // ═══════════════════════════════════════════
  // ALUMINIUM
  // ═══════════════════════════════════════════
  { cn: '7601', desc: 'Unwrought aluminium', sector: 'aluminium', aggregated: 'Unwrought aluminium', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7603', desc: 'Aluminium powders and flakes', sector: 'aluminium', aggregated: 'Al powders/flakes', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7604', desc: 'Aluminium bars, rods and profiles', sector: 'aluminium', aggregated: 'Al bars/rods/profiles', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7605', desc: 'Aluminium wire', sector: 'aluminium', aggregated: 'Al wire', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7606', desc: 'Aluminium plates/sheets/strip >0.2mm', sector: 'aluminium', aggregated: 'Al plates/sheets', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7607', desc: 'Aluminium foil ≤0.2mm', sector: 'aluminium', aggregated: 'Al foil', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7608', desc: 'Aluminium tubes and pipes', sector: 'aluminium', aggregated: 'Al tubes/pipes', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7609 00 00', desc: 'Aluminium tube/pipe fittings', sector: 'aluminium', aggregated: 'Al tube fittings', unit: 'tonne', deMinimis: true },
  { cn: '7610', desc: 'Aluminium structures and parts', sector: 'aluminium', aggregated: 'Al structures', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7611 00 00', desc: 'Aluminium reservoirs/tanks >300L', sector: 'aluminium', aggregated: 'Al large containers', unit: 'tonne', deMinimis: true },
  { cn: '7612', desc: 'Aluminium casks/drums/cans ≤300L', sector: 'aluminium', aggregated: 'Al small containers', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7613 00 00', desc: 'Aluminium containers for compressed gas', sector: 'aluminium', aggregated: 'Al gas containers', unit: 'tonne', deMinimis: true },
  { cn: '7614', desc: 'Aluminium stranded wire/cables', sector: 'aluminium', aggregated: 'Al cables', unit: 'tonne', isHeading: true, deMinimis: true },
  { cn: '7616', desc: 'Other articles of aluminium', sector: 'aluminium', aggregated: 'Other Al articles', unit: 'tonne', isHeading: true, deMinimis: true },

  // ═══════════════════════════════════════════
  // FERTILIZERS
  // ═══════════════════════════════════════════
  { cn: '2808 00 00', desc: 'Nitric acid; sulphonitric acids', sector: 'fertilizers', aggregated: 'Nitric acid', unit: 'tonne', deMinimis: true },
  { cn: '2814 10 00', desc: 'Anhydrous ammonia', sector: 'fertilizers', aggregated: 'Ammonia', unit: 'tonne', deMinimis: true },
  { cn: '2814 20 00', desc: 'Ammonia in aqueous solution', sector: 'fertilizers', aggregated: 'Ammonia (aqueous)', unit: 'tonne', deMinimis: true },
  { cn: '2834 21 00', desc: 'Potassium nitrate', sector: 'fertilizers', aggregated: 'Potassium nitrate', unit: 'tonne', deMinimis: true },
  { cn: '3102 10 10', desc: 'Urea with >45% N, in aqueous solution', sector: 'fertilizers', aggregated: 'Urea', unit: 'tonne', deMinimis: true },
  { cn: '3102 10 90', desc: 'Other urea', sector: 'fertilizers', aggregated: 'Urea', unit: 'tonne', deMinimis: true },
  { cn: '3102 21 00', desc: 'Ammonium sulphate', sector: 'fertilizers', aggregated: 'Ammonium sulphate', unit: 'tonne', deMinimis: true },
  { cn: '3102 29 00', desc: 'Double salts/mixtures of ammonium sulphate & nitrate', sector: 'fertilizers', aggregated: 'Ammonium sulphate/nitrate mix', unit: 'tonne', deMinimis: true },
  { cn: '3102 30 10', desc: 'Ammonium nitrate, in aqueous solution', sector: 'fertilizers', aggregated: 'Ammonium nitrate', unit: 'tonne', deMinimis: true },
  { cn: '3102 30 90', desc: 'Other ammonium nitrate', sector: 'fertilizers', aggregated: 'Ammonium nitrate', unit: 'tonne', deMinimis: true },
  { cn: '3102 40 10', desc: 'Calcium ammonium nitrate/ammonium nitrate-calcium mixtures', sector: 'fertilizers', aggregated: 'CAN', unit: 'tonne', deMinimis: true },
  { cn: '3102 40 90', desc: 'Other ammonium nitrate-calcium mixtures', sector: 'fertilizers', aggregated: 'CAN', unit: 'tonne', deMinimis: true },
  { cn: '3102 50 00', desc: 'Sodium nitrate', sector: 'fertilizers', aggregated: 'Sodium nitrate', unit: 'tonne', deMinimis: true },
  { cn: '3102 60 00', desc: 'Double salts of calcium nitrate and ammonium nitrate', sector: 'fertilizers', aggregated: 'Ca/ammonium nitrate', unit: 'tonne', deMinimis: true },
  { cn: '3102 80 00', desc: 'Urea + ammonium nitrate in aqueous/ammoniacal solution', sector: 'fertilizers', aggregated: 'UAN solution', unit: 'tonne', deMinimis: true },
  { cn: '3102 90 00', desc: 'Other nitrogenous mineral/chemical fertilizers', sector: 'fertilizers', aggregated: 'Other N-fertilizers', unit: 'tonne', deMinimis: true },
  { cn: '3105 10 00', desc: 'Goods in tablets/packages ≤10kg', sector: 'fertilizers', aggregated: 'Packaged NPK', unit: 'tonne', deMinimis: true },
  { cn: '3105 20 10', desc: 'NPK fertilizers, N>10%', sector: 'fertilizers', aggregated: 'NPK (high N)', unit: 'tonne', deMinimis: true },
  { cn: '3105 20 90', desc: 'Other NPK fertilizers', sector: 'fertilizers', aggregated: 'NPK', unit: 'tonne', deMinimis: true },
  { cn: '3105 30 00', desc: 'Diammonium hydrogenorthophosphate (DAP)', sector: 'fertilizers', aggregated: 'DAP', unit: 'tonne', deMinimis: true },
  { cn: '3105 40 00', desc: 'Ammonium dihydrogenorthophosphate (MAP)', sector: 'fertilizers', aggregated: 'MAP', unit: 'tonne', deMinimis: true },
  { cn: '3105 51 00', desc: 'NP fertilizers with nitrates and phosphates', sector: 'fertilizers', aggregated: 'NP', unit: 'tonne', deMinimis: true },
  { cn: '3105 59 00', desc: 'Other NP fertilizers', sector: 'fertilizers', aggregated: 'NP other', unit: 'tonne', deMinimis: true },
  { cn: '3105 90 20', desc: 'NK fertilizers, N>10%', sector: 'fertilizers', aggregated: 'NK', unit: 'tonne', deMinimis: true },
  { cn: '3105 90 80', desc: 'Other mixed fertilizers', sector: 'fertilizers', aggregated: 'Mixed fertilizers', unit: 'tonne', deMinimis: true },

  // ═══════════════════════════════════════════
  // ELECTRICITY
  // ═══════════════════════════════════════════
  { cn: '2716 00 00', desc: 'Electrical energy', sector: 'electricity', aggregated: 'Electricity', unit: 'MWh', deMinimis: false },

  // ═══════════════════════════════════════════
  // HYDROGEN
  // ═══════════════════════════════════════════
  { cn: '2804 10 00', desc: 'Hydrogen', sector: 'hydrogen', aggregated: 'Hydrogen', unit: 'tonne', deMinimis: false },
];

export const getCNCodesBySector = (sectorId) => CN_CODES.filter(c => c.sector === sectorId);
export const searchCNCodes = (query) => {
  const q = query.toLowerCase();
  return CN_CODES.filter(c =>
    c.cn.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
    c.desc.toLowerCase().includes(q) ||
    c.aggregated.toLowerCase().includes(q) ||
    c.sector.toLowerCase().includes(q)
  );
};
