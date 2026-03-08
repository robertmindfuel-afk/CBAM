// CBAM Calculation Engine
// Implements the full calculation methodology per Reg. 2023/956 and 2025/2547

import { getPhaseOutForYear, getETSPrice, CSCF } from '../data/benchmarks.js';
import { getDefaultValue, getIndirectDefault, COUNTRIES } from '../data/defaultValues.js';

/**
 * Calculate total embedded emissions for a product
 */
export function calculateEmbeddedEmissions({
  quantity, // tonnes
  specificEmissions, // tCO2e/t (direct)
  indirectEmissions = 0, // tCO2e/t (indirect, if applicable)
}) {
  const directTotal = quantity * specificEmissions;
  const indirectTotal = quantity * indirectEmissions;
  return {
    directTotal,
    indirectTotal,
    totalEmbedded: directTotal + indirectTotal,
    specificDirect: specificEmissions,
    specificIndirect: indirectEmissions,
    specificTotal: specificEmissions + indirectEmissions,
  };
}

/**
 * Calculate free allocation adjustment (SEFA)
 */
export function calculateFreeAllocation({
  benchmark, // tCO2e/t
  quantity, // tonnes
  year,
}) {
  const phaseOut = getPhaseOutForYear(year);
  const sefa = phaseOut.cbamFactor * CSCF * benchmark * quantity;
  return {
    sefa,
    cbamFactor: phaseOut.cbamFactor,
    cscf: CSCF,
    benchmark,
    obligation: phaseOut.obligation,
  };
}

/**
 * Calculate carbon price deduction
 */
export function calculateCarbonPriceDeduction({
  countryCode,
  totalEmbeddedEmissions, // tCO2e
  year,
}) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return { deduction: 0, effectivePrice: 0, deductionTonnes: 0 };

  const effectivePrice = country.effectivePrice || 0;
  const etsPrice = getETSPrice(year);

  if (effectivePrice <= 0 || etsPrice <= 0) {
    return { deduction: 0, effectivePrice: 0, deductionTonnes: 0 };
  }

  // Deduction in euros
  const totalDeductionEur = effectivePrice * totalEmbeddedEmissions;
  // Convert to certificate equivalents
  const deductionTonnes = totalDeductionEur / etsPrice;

  return {
    deduction: totalDeductionEur,
    effectivePrice,
    deductionTonnes: Math.min(deductionTonnes, totalEmbeddedEmissions),
  };
}

/**
 * Master CBAM calculation
 */
export function calculateCBAM({
  quantity, // tonnes of product
  product, // aggregated product name
  countryCode, // origin country
  year = 2026,
  benchmark = 0, // tCO2e/t
  useActualEmissions = false,
  actualDirectEmissions = null, // tCO2e/t if using actual
  actualIndirectEmissions = null, // tCO2e/t if using actual
  sector = 'iron_steel',
}) {
  // Step 1: Determine specific embedded emissions
  let specificDirect, specificIndirect;

  if (useActualEmissions && actualDirectEmissions !== null) {
    specificDirect = actualDirectEmissions;
    specificIndirect = actualIndirectEmissions || 0;
  } else {
    specificDirect = getDefaultValue(product, countryCode, year) || 0;
    specificIndirect = getIndirectDefault(product, countryCode) || 0;
  }

  // Include indirect only for cement, fertilizers, hydrogen
  const includeIndirect = ['cement', 'fertilizers', 'hydrogen'].includes(sector);
  if (!includeIndirect) specificIndirect = 0;

  // Step 2: Embedded emissions
  const emissions = calculateEmbeddedEmissions({
    quantity,
    specificEmissions: specificDirect,
    indirectEmissions: specificIndirect,
  });

  // Step 3: Free allocation adjustment
  const freeAlloc = calculateFreeAllocation({
    benchmark,
    quantity,
    year,
  });

  // Step 4: Carbon price deduction
  const cpDeduction = calculateCarbonPriceDeduction({
    countryCode,
    totalEmbeddedEmissions: emissions.totalEmbedded,
    year,
  });

  // Step 5: Net certificates
  const grossCertificates = Math.max(0, emissions.totalEmbedded - freeAlloc.sefa);
  const netCertificates = Math.max(0, grossCertificates - cpDeduction.deductionTonnes);

  // Step 6: Total cost
  const etsPrice = getETSPrice(year);
  const totalCost = netCertificates * etsPrice;

  // Cost per tonne of product
  const costPerTonne = quantity > 0 ? totalCost / quantity : 0;

  return {
    // Input summary
    input: { quantity, product, countryCode, year, benchmark, useActualEmissions, sector },
    // Emissions
    emissions,
    // Free allocation
    freeAllocation: freeAlloc,
    // Carbon price deduction
    carbonPriceDeduction: cpDeduction,
    // Results
    grossCertificates,
    netCertificates,
    etsPrice,
    totalCost,
    costPerTonne,
    // Phase-out info
    phaseOut: getPhaseOutForYear(year),
    // Country info
    country: COUNTRIES.find(c => c.code === countryCode),
    isExempt: COUNTRIES.find(c => c.code === countryCode)?.exempt || false,
  };
}

/**
 * Multi-year projection
 */
export function calculateMultiYearProjection({
  quantity, product, countryCode, benchmark, sector,
  useActualEmissions, actualDirectEmissions, actualIndirectEmissions,
  startYear = 2026, endYear = 2034,
}) {
  const results = [];
  for (let year = startYear; year <= endYear; year++) {
    results.push(calculateCBAM({
      quantity, product, countryCode, year, benchmark, sector,
      useActualEmissions, actualDirectEmissions, actualIndirectEmissions,
    }));
  }
  return results;
}

/**
 * Format currency
 */
export function formatCurrency(value, decimals = 0) {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number with commas
 */
export function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
