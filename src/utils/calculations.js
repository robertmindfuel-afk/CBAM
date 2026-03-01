import { PHASE_IN_FACTORS, YEARS } from '../data/constants';

/**
 * Core CBAM calculation — supports simple and complex goods with precursors
 * Formula: SEE = direct + indirect + Σ(massFraction × SEE_precursor)
 */
export function calculateCBAM({
    quantity, directEmissions, indirectEmissions,
    euEtsPrice, indianCarbonPrice, year,
    precursorContributions = [],
}) {
    const qty = parseFloat(quantity) || 0;
    const direct = parseFloat(directEmissions) || 0;
    const indirect = parseFloat(indirectEmissions) || 0;
    const etsPrice = parseFloat(euEtsPrice) || 0;
    const indiaCp = parseFloat(indianCarbonPrice) || 0;
    const yr = parseInt(year) || 2026;

    let precursorEmissions = 0;
    const precursorDetails = [];
    for (const pc of precursorContributions) {
        const mass = parseFloat(pc.massFraction) || 0;
        const see = parseFloat(pc.specificEmissions) || 0;
        const contrib = mass * see;
        precursorEmissions += contrib;
        precursorDetails.push({ name: pc.name, massFraction: mass, specificEmissions: see, contribution: contrib });
    }

    const specificEmbedded = direct + indirect + precursorEmissions;
    const totalEmissions = specificEmbedded * qty;
    const phaseFactor = PHASE_IN_FACTORS[yr] ?? 1;
    const certificatesRequired = totalEmissions * phaseFactor;
    const grossCost = certificatesRequired * etsPrice;
    const deduction = totalEmissions * indiaCp;
    const netPayable = Math.max(0, grossCost - deduction);
    const costPerTonne = qty > 0 ? netPayable / qty : 0;

    return {
        specificEmbedded, totalEmissions, phaseFactor, certificatesRequired,
        grossCost, deduction, netPayable, costPerTonne,
        precursorEmissions, precursorDetails,
        year: yr, quantity: qty,
        directEmissions: direct, indirectEmissions: indirect,
        euEtsPrice: etsPrice, indianCarbonPrice: indiaCp,
    };
}

/**
 * Aggregate results from multiple basket items
 */
export function aggregateBasket(items) {
    const totals = {
        totalQuantity: 0, totalEmissions: 0, totalCertificates: 0,
        totalGrossCost: 0, totalDeduction: 0, totalNetPayable: 0,
        itemCount: items.length,
    };
    for (const item of items) {
        totals.totalQuantity += item.result.quantity;
        totals.totalEmissions += item.result.totalEmissions;
        totals.totalCertificates += item.result.certificatesRequired;
        totals.totalGrossCost += item.result.grossCost;
        totals.totalDeduction += item.result.deduction;
        totals.totalNetPayable += item.result.netPayable;
    }
    totals.avgCostPerTonne = totals.totalQuantity > 0 ? totals.totalNetPayable / totals.totalQuantity : 0;
    return totals;
}

/**
 * Generate year-over-year aggregate projection for basket
 */
export function generateBasketProjection(items) {
    return YEARS.map((yr) => {
        let grossCost = 0, netPayable = 0, certificates = 0;
        for (const item of items) {
            const r = calculateCBAM({ ...item.params, year: yr, precursorContributions: item.precursorContributions || [] });
            grossCost += r.grossCost;
            netPayable += r.netPayable;
            certificates += r.certificatesRequired;
        }
        return {
            year: yr, phaseIn: ((PHASE_IN_FACTORS[yr] ?? 1) * 100).toFixed(1) + '%',
            certificates, grossCost, netPayable,
        };
    });
}

/** Generate single-product projection */
export function generateYearProjection(params) {
    return YEARS.map((yr) => {
        const r = calculateCBAM({ ...params, year: yr });
        return {
            year: yr, phaseIn: (r.phaseFactor * 100).toFixed(1) + '%',
            certificates: r.certificatesRequired, grossCost: r.grossCost,
            deduction: r.deduction, netPayable: r.netPayable,
        };
    });
}

export function formatEuro(val) {
    return new Intl.NumberFormat('en-EU', {
        style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(val);
}

export function formatNumber(val, decimals = 2) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals,
    }).format(val);
}
