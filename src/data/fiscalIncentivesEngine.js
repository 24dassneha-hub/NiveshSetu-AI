/**
 * Centralized statutory computation engine for:
 * - Enterprise Valuation & MSME Classification
 * - Plant & Machinery Capex Allocation
 * - GST & Input Tax Credit (ITC) Impact
 * - Direct Corporate Tax & Accelerated Depreciation Shield
 * - Dynamic Investment-Linked Incentive & Subsidy Entitlements
 * 
 * Based on:
 * - Odisha Industrial Policy Resolution (IPR 2022)
 * - Central MSMED Act 2020
 * - Income Tax Act 1961 (Sections 32 & 115BAA)
 * - Central & State Goods & Services Tax Acts
 */

import { SAMPLE_INCENTIVES, getIncentives } from './incentivesStorage.js';

/**
 * Robustly parses various user investment string formats into a numeric integer (in Rupees)
 * e.g.:
 *   "₹12.5 Cr" -> 125000000
 *   "12.5 Cr"  -> 125000000
 *   "₹50 Lakh" -> 5000000
 *   "50,00,000"-> 5000000
 *   "₹5 Cr - ₹25 Cr" -> 100000000
 */
export function parseInvestmentAmount(rawInput, fallbackAmount = 100000000) {
  if (typeof rawInput === 'number' && !isNaN(rawInput) && rawInput > 0) {
    return Math.round(rawInput);
  }
  if (!rawInput || typeof rawInput !== 'string') {
    return fallbackAmount;
  }

  const clean = rawInput.trim();
  const lower = clean.toLowerCase();

  // 1. Range format: "₹5 Cr - ₹25 Cr" -> extract first or average
  if (lower.includes('-')) {
    const parts = lower.split('-');
    const parsedParts = parts.map((p) => parseInvestmentAmount(p, 0)).filter((n) => n > 0);
    if (parsedParts.length === 2) {
      return Math.round((parsedParts[0] + parsedParts[1]) / 2);
    }
    if (parsedParts.length === 1) {
      return parsedParts[0];
    }
  }

  // 2. Contains "cr" or "crore"
  if (lower.includes('cr') || lower.includes('crore')) {
    const numMatch = lower.match(/[\d.]+/);
    if (numMatch) {
      const val = parseFloat(numMatch[0]);
      if (!isNaN(val)) {
        return Math.round(val * 10000000);
      }
    }
  }

  // 3. Contains "lakh" or "lac" or "l"
  if (lower.includes('lakh') || lower.includes('lac') || lower.match(/\b\d+(\.\d+)?\s*l\b/)) {
    const numMatch = lower.match(/[\d.]+/);
    if (numMatch) {
      const val = parseFloat(numMatch[0]);
      if (!isNaN(val)) {
        return Math.round(val * 100000);
      }
    }
  }

  // 4. Plain numeric with optional commas or currency symbols: "50,00,000", "₹12000000"
  const digitsOnly = clean.replace(/[^\d.]/g, '');
  if (digitsOnly) {
    const val = parseFloat(digitsOnly);
    if (!isNaN(val) && val > 0) {
      // If user typed a small number like "10" without "Cr", check if it's meant to be Cr or raw rupees
      if (val <= 1000 && clean.includes('.')) {
        // likely typed 12.5 without unit
        return Math.round(val * 10000000);
      }
      return Math.round(val);
    }
  }

  return fallbackAmount;
}

/**
 * Format currency in Indian notation with appropriate Cr / L / K suffixes
 */
export function formatCurrencyInr(amount, includeDecimals = true) {
  const n = Number(amount) || 0;
  if (n >= 10000000) {
    const cr = n / 10000000;
    return includeDecimals && cr % 1 !== 0
      ? `₹${cr.toFixed(2)} Cr`
      : `₹${cr.toFixed(1).replace('.0', '')} Cr`;
  }
  if (n >= 100000) {
    const l = n / 100000;
    return includeDecimals && l % 1 !== 0
      ? `₹${l.toFixed(2)} L`
      : `₹${l.toFixed(1).replace('.0', '')} L`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
}

/**
 * Compute the complete Statutory Fiscal, Tax, GST, and Valuation Assessment
 */
export function getFiscalAssessment(investmentInput, businessProfile = {}) {
  const totalInvestment = Math.max(
    1000000,
    parseInvestmentAmount(investmentInput, 100000000) // Default ₹10 Cr if unstated
  );

  // 1. Asset Breakdown & Plant Capex (Statutory Base)
  // Under IPR 2022, Plant & Machinery capex is the primary base for CIS and Net SGST caps
  const plantMachineryCapex = Math.round(totalInvestment * 0.65);
  const civilInfraCapex = Math.round(totalInvestment * 0.20);
  const workingCapital = Math.round(totalInvestment * 0.15);

  // 2. Enterprise Valuation & Classification (MSMED Act 2020)
  let valuationTier = 'Small Enterprise';
  let valuationCode = 'SMALL';
  let tierBadgeColor = 'bg-[#18324A] text-[#FAF8F2]';
  let msmeSlabDescription = 'Investment in Plant & Machinery ₹1 Cr to ₹10 Cr';

  if (totalInvestment < 10000000) {
    valuationTier = 'Micro Enterprise';
    valuationCode = 'MICRO';
    tierBadgeColor = 'bg-[#5D8068] text-[#FAF8F2]';
    msmeSlabDescription = 'Capital Outlay up to ₹1.00 Cr (Priority Sourcing & 30% CIS)';
  } else if (totalInvestment <= 100000000) {
    valuationTier = 'Small Enterprise';
    valuationCode = 'SMALL';
    tierBadgeColor = 'bg-[#18324A] text-[#FAF8F2]';
    msmeSlabDescription = 'Capital Outlay ₹1 Cr – ₹10 Cr (Full SGST Refund + 5% Interest Subvention)';
  } else if (totalInvestment <= 500000000) {
    valuationTier = 'Medium Enterprise';
    valuationCode = 'MEDIUM';
    tierBadgeColor = 'bg-[#C08A3E] text-[#FAF8F2]';
    msmeSlabDescription = 'Capital Outlay ₹10 Cr – ₹50 Cr (High Industrial Impact & Priority Power)';
  } else {
    valuationTier = 'Large / Mega Industrial Project';
    valuationCode = 'MEGA';
    tierBadgeColor = 'bg-[#8A6A14] text-[#FAF8F2]';
    msmeSlabDescription = 'Capital Outlay > ₹50 Cr (Eligible for Customized HLCA Cabinet Concession Package)';
  }

  // 3. GST & Input Tax Credit (ITC) Impact
  // 18% GST on Plant & Machinery Capex represents immediate Input Tax Credit (ITC)
  const capexInputTaxCredit = Math.round(plantMachineryCapex * 0.18);
  // Estimated annual Net SGST deposited by unit (~7% of investment basis)
  const annualNetSgstEstimate = Math.round(totalInvestment * 0.07);
  // Under Odisha IPR 2022 Clause 14.4: 100% Net SGST Reimbursement for 7 Years, capped at 150% of plant capex
  const netSgst7YearReimbursementCap = Math.round(plantMachineryCapex * 1.50);

  // 4. Direct Corporate Tax & Depreciation Benefits (Income Tax Act)
  // Section 115BAA concessional corporate tax for new manufacturing: 15% base (vs standard 25-30%)
  const corporateTaxRate = '15%';
  const corporateTaxEffective = '17.16% (incl. Surcharge & Cess)';
  const corporateTaxSavingsPercentage = '10% – 15%';
  // Accelerated Depreciation (Section 32): 15% Normal + 20% Additional Initial Depreciation = 35% Year 1
  const year1DepreciationRate = '35%';
  const year1DepreciationShield = Math.round(plantMachineryCapex * 0.35);
  // Direct Cash Tax Saved in Year 1 from depreciation shield (at 17.16% effective tax)
  const taxCashShieldSavings = Math.round(year1DepreciationShield * 0.1716);

  // 5. Dynamic Incentive Schemes Computation
  const baseSchemes = getIncentives();
  const dynamicSchemes = baseSchemes.map((scheme) => {
    let entitlement = scheme.estimatedEntitlement;
    let status = scheme.status;
    let formulaNote = scheme.subsidyRate;
    let thresholdGap = 0;

    switch (scheme.id) {
      case 'INC-2026-001': {
        // Capital Investment Subsidy (CIS) - 30% of plant capex, max ₹1.00 Cr
        const rawCis = Math.round(plantMachineryCapex * 0.30);
        entitlement = Math.min(10000000, rawCis);
        status = totalInvestment >= 2500000 ? (scheme.status === 'CLAIMED' ? 'CLAIMED' : 'ELIGIBLE') : 'NOT_ELIGIBLE';
        formulaNote = `30% of ${formatCurrencyInr(plantMachineryCapex)} Plant Capex (Statutory ceiling: ₹1.00 Cr)`;
        break;
      }
      case 'INC-2026-002': {
        // Net SGST 100% Fiscal Reimbursement - 100% Net SGST capped at 150% plant capex (max ₹2.5 Cr standard)
        const rawSgstCap = Math.round(plantMachineryCapex * 1.50);
        entitlement = Math.min(25000000, rawSgstCap);
        status = totalInvestment >= 5000000 ? (scheme.status === 'CLAIMED' ? 'CLAIMED' : 'ELIGIBLE') : 'NOT_ELIGIBLE';
        formulaNote = `100% Net SGST for 7 yrs (150% Plant Capex cap = ${formatCurrencyInr(rawSgstCap)})`;
        break;
      }
      case 'INC-2026-003': {
        // Interest Subvention on Term Loan - 5% p.a. on 60% debt over 5 yrs
        const termLoan = Math.round(totalInvestment * 0.60);
        const fiveYearInterestRelief = Math.round(termLoan * 0.05 * 5);
        entitlement = Math.min(12500000, fiveYearInterestRelief);
        status = totalInvestment >= 1000000 ? (scheme.status === 'CLAIMED' ? 'CLAIMED' : 'ELIGIBLE') : 'NOT_ELIGIBLE';
        formulaNote = `5% p.a. interest relief on ${formatCurrencyInr(termLoan)} Term Loan over 5 years`;
        break;
      }
      case 'INC-2026-004': {
        // Electricity Duty 100% Exemption - approx 4.8% over 5 years
        const rawPowerBenefit = Math.round(totalInvestment * 0.048);
        entitlement = Math.min(5000000, rawPowerBenefit);
        status = scheme.status === 'DISBURSED' ? 'DISBURSED' : (totalInvestment >= 1000000 ? 'ELIGIBLE' : 'NOT_ELIGIBLE');
        formulaNote = `100% State Electricity Duty waiver on industrial connected load for 5 years`;
        break;
      }
      case 'INC-2026-005': {
        // Environmental Protection & Green Grant - 50% on ~10% green capex
        const greenEquipment = Math.round(totalInvestment * 0.10);
        const rawGreenGrant = Math.round(greenEquipment * 0.50);
        entitlement = Math.min(5000000, rawGreenGrant);
        status = totalInvestment >= 1500000 ? (scheme.status === 'CLAIMED' ? 'CLAIMED' : 'ELIGIBLE') : 'NOT_ELIGIBLE';
        formulaNote = `50% Capital Grant on ${formatCurrencyInr(greenEquipment)} green & effluent equipment`;
        break;
      }
      case 'INC-2026-006': {
        // Pioneer Mega Project Anchor Package - min ₹50 Cr
        if (totalInvestment >= 500000000) {
          entitlement = Math.min(100000000, Math.round(totalInvestment * 0.12));
          status = 'ELIGIBLE';
          formulaNote = `High Level Clearance Authority (HLCA) Mega Concession Package`;
        } else {
          entitlement = 0;
          status = 'NOT_ELIGIBLE';
          thresholdGap = 500000000 - totalInvestment;
          formulaNote = `Requires min. ₹50 Cr capital investment (Gap: ${formatCurrencyInr(thresholdGap)})`;
        }
        break;
      }
      default:
        break;
    }

    return {
      ...scheme,
      estimatedEntitlement: entitlement,
      status,
      formulaNote,
      thresholdGap,
    };
  });

  // Calculate total potential subsidy entitlement from active eligible/claimed schemes
  let totalSubsidyEntitlement = 0;
  dynamicSchemes.forEach((s) => {
    if (s.status === 'ELIGIBLE' || s.status === 'CLAIMED' || s.status === 'DISBURSED') {
      totalSubsidyEntitlement += s.estimatedEntitlement || 0;
    }
  });

  // Total Fiscal Benefit Pool = Subsidy Entitlements + Year 1 Tax Shield + GST Input Credit
  const totalCombinedFiscalAdvantage = totalSubsidyEntitlement + taxCashShieldSavings + capexInputTaxCredit;

  return {
    totalInvestment,
    formattedInvestment: formatCurrencyInr(totalInvestment),
    valuation: {
      tier: valuationTier,
      code: valuationCode,
      badgeColor: tierBadgeColor,
      description: msmeSlabDescription,
      plantMachineryCapex,
      civilInfraCapex,
      workingCapital,
      formattedPlantCapex: formatCurrencyInr(plantMachineryCapex),
      formattedCivilCapex: formatCurrencyInr(civilInfraCapex),
      formattedWorkingCapital: formatCurrencyInr(workingCapital),
    },
    gst: {
      capexGstRate: 18,
      capexInputTaxCredit,
      formattedInputTaxCredit: formatCurrencyInr(capexInputTaxCredit),
      annualNetSgstEstimate,
      formattedAnnualNetSgst: formatCurrencyInr(annualNetSgstEstimate),
      netSgst7YearReimbursementCap,
      formattedNetSgstCap: formatCurrencyInr(netSgst7YearReimbursementCap),
      policyClause: 'Odisha IPR 2022 - Clause 14.4 (100% Net SGST Reimbursement for 7 Years)',
    },
    tax: {
      corporateTaxRate,
      corporateTaxEffective,
      corporateTaxSavingsPercentage,
      year1DepreciationRate,
      year1DepreciationShield,
      formattedYear1Depreciation: formatCurrencyInr(year1DepreciationShield),
      taxCashShieldSavings,
      formattedTaxCashSaved: formatCurrencyInr(taxCashShieldSavings),
      policyClause: 'Income Tax Act - Section 115BAA (15% Mfg Rate) & Section 32 (35% Y1 Depreciation)',
    },
    subsidies: {
      schemes: dynamicSchemes,
      totalSubsidyEntitlement,
      formattedSubsidyEntitlement: formatCurrencyInr(totalSubsidyEntitlement),
      totalCombinedFiscalAdvantage,
      formattedTotalAdvantage: formatCurrencyInr(totalCombinedFiscalAdvantage),
    },
  };
}
