import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  Scale,
  Award,
  Sparkles,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { formatCurrencyInr } from '../../data/fiscalIncentivesEngine';

export default function FiscalTaxValuationDossier({
  assessment,
  registeredAmount,
  simulatedAmount,
  onSimulateAmount,
  onResetSimulation,
  isSimulating,
  businessName,
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  const presets = [
    { label: '₹75 Lakh (Micro)', value: 7500000 },
    { label: '₹5.0 Cr (Small)', value: 50000000 },
    { label: '₹12.5 Cr (Medium)', value: 125000000 },
    { label: '₹25.0 Cr (Medium)', value: 250000000 },
    { label: '₹60.0 Cr (Mega)', value: 600000000 },
  ];

  return (
    <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)] space-y-5">
      {/* Top Header Row with Active Mode & Simulation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#262522]/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#18324A]" />
            <span className="font-mono-data text-[10px] sm:text-xs font-bold text-[#18324A] uppercase tracking-wider">
              STATUTORY FISCAL, TAX & VALUATION ASSESSMENT
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono-data font-bold rounded bg-[#18324A]/10 text-[#18324A]">
              ODISHA IPR 2022 & MSMED ACT
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight uppercase flex items-center gap-2">
            <span>Investment-Linked Fiscal Assessment:</span>
            <span className="text-[#18324A] font-mono-data">
              {assessment.formattedInvestment}
            </span>
          </h2>
          <p className="text-xs text-[#6E6A61] font-sans mt-0.5">
            Enterprise: <strong className="text-[#171717]">{businessName || 'Registered Enterprise'}</strong> • Linked to registered capital outlay.
          </p>
        </div>

        {/* Simulation Controls & Presets */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-[#FFFFFF] border border-[#D6D0C3] p-2 sm:p-2.5 rounded-[4px]">
          <div className="flex items-center gap-1.5 text-xs font-mono-data font-semibold text-[#18324A]">
            <Sliders className="w-3.5 h-3.5 text-[#18324A]" />
            <span className="hidden sm:inline">Simulate Outlay:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {presets.map((p) => {
              const isActive = Math.abs(simulatedAmount - p.value) < 1000;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onSimulateAmount(p.value)}
                  className={`px-2 py-1 text-[11px] font-mono-data font-semibold rounded-[3px] border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#18324A] text-[#FAF8F2] border-[#18324A]'
                      : 'bg-[#FAF8F2] hover:bg-[#E9E1D0] text-[#30302D] border-[#D6D0C3]'
                  }`}
                  title={`Simulate incentives with ${p.label}`}
                >
                  {p.label}
                </button>
              );
            })}

            {isSimulating && (
              <button
                type="button"
                onClick={onResetSimulation}
                className="px-2 py-1 text-[11px] font-mono-data font-bold rounded-[3px] bg-[#FAF6E9] hover:bg-[#F3EFE5] text-[#8A6A14] border border-[#C59B27] flex items-center gap-1 transition-colors cursor-pointer ml-1"
                title="Reset to your registered investment amount"
              >
                <RotateCcw className="w-3 h-3 text-[#8A6A14]" />
                <span>Reset to Reg ({formatCurrencyInr(registeredAmount)})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Pillars Analytical Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Enterprise Valuation & MSME Tier */}
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="meta-label text-[10px] text-[#6E6A61]">
                PILLAR 01 // VALUATION & TIER
              </span>
              <Scale className="w-4 h-4 text-[#18324A]" />
            </div>
            <div className="mb-2">
              <span className={`inline-block px-2 py-0.5 rounded-[2px] text-[11px] font-mono-data font-bold ${assessment.valuation.badgeColor}`}>
                {assessment.valuation.tier}
              </span>
            </div>
            <p className="text-xs text-[#524E48] font-sans leading-relaxed mb-3">
              {assessment.valuation.description}
            </p>
          </div>

          <div className="pt-3 border-t border-[#D6D0C3] space-y-1.5 text-xs font-mono-data">
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Plant & Machinery (65%):</span>
              <span className="font-bold text-[#171717]">{assessment.valuation.formattedPlantCapex}</span>
            </div>
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Civil & Factory (20%):</span>
              <span className="font-semibold text-[#171717]">{assessment.valuation.formattedCivilCapex}</span>
            </div>
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Working Capital (15%):</span>
              <span className="font-semibold text-[#171717]">{assessment.valuation.formattedWorkingCapital}</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: GST & Input Tax Credit (ITC) Impact */}
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="meta-label text-[10px] text-[#6E6A61]">
                PILLAR 02 // GST & SGST REIMBURSEMENT
              </span>
              <Receipt className="w-4 h-4 text-[#5D8068]" />
            </div>
            <div className="text-xl font-bold font-mono-data text-[#171717] mb-1">
              {assessment.gst.formattedNetSgstCap}
            </div>
            <p className="text-[11px] text-[#5D8068] font-mono-data font-semibold mb-2">
              100% Net SGST Refund Ceiling (7 Years)
            </p>
            <p className="text-xs text-[#524E48] font-sans leading-relaxed mb-3">
              Direct state tax refund under Odisha IPR 2022 Clause 14.4, capped at 150% of plant capex.
            </p>
          </div>

          <div className="pt-3 border-t border-[#D6D0C3] space-y-1.5 text-xs font-mono-data">
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Procurement GST (18% ITC):</span>
              <span className="font-bold text-[#5D8068]">{assessment.gst.formattedInputTaxCredit}</span>
            </div>
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Est. Annual Net SGST:</span>
              <span className="font-semibold text-[#171717]">{assessment.gst.formattedAnnualNetSgst}</span>
            </div>
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Benefit Duration:</span>
              <span className="font-semibold text-[#18324A]">7 Consecutive Years</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Corporate Tax & Depreciation Shield */}
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="meta-label text-[10px] text-[#6E6A61]">
                PILLAR 03 // CORPORATE TAX & DEPRECIATION
              </span>
              <TrendingUp className="w-4 h-4 text-[#C08A3E]" />
            </div>
            <div className="text-xl font-bold font-mono-data text-[#171717] mb-1">
              {assessment.tax.corporateTaxRate}
            </div>
            <p className="text-[11px] text-[#C08A3E] font-mono-data font-semibold mb-2">
              Section 115BAA Concessional Tax Rate
            </p>
            <p className="text-xs text-[#524E48] font-sans leading-relaxed mb-3">
              Saves {assessment.tax.corporateTaxSavingsPercentage} vs standard rate, combined with 35% Year-1 accelerated depreciation.
            </p>
          </div>

          <div className="pt-3 border-t border-[#D6D0C3] space-y-1.5 text-xs font-mono-data">
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Year-1 Depreciation Shield:</span>
              <span className="font-bold text-[#171717]">{assessment.tax.formattedYear1Depreciation}</span>
            </div>
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Direct Cash Tax Saved (Y1):</span>
              <span className="font-bold text-[#5D8068]">{assessment.tax.formattedTaxCashSaved}</span>
            </div>
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Depreciation Rate:</span>
              <span className="font-semibold text-[#18324A]">35% (15% Normal + 20% Addl)</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Total Statutory Subsidy Pool */}
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 flex flex-col justify-between shadow-xs bg-gradient-to-br from-[#FAF8F2] to-[#FAF6E9]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="meta-label text-[10px] text-[#8A6A14]">
                PILLAR 04 // TOTAL FISCAL BENEFIT POOL
              </span>
              <Award className="w-4 h-4 text-[#8A6A14]" />
            </div>
            <div className="text-xl font-bold font-mono-data text-[#18324A] mb-1">
              {assessment.subsidies.formattedSubsidyEntitlement}
            </div>
            <p className="text-[11px] text-[#8A6A14] font-mono-data font-bold mb-2">
              Statutory Claimable Subsidies
            </p>
            <p className="text-xs text-[#524E48] font-sans leading-relaxed mb-3">
              Sum of CIS, Net SGST, Interest Subvention, and Utility Exemptions verified for your capital size.
            </p>
          </div>

          <div className="pt-3 border-t border-[#C59B27]/40 space-y-1.5 text-xs font-mono-data">
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Capital Subsidy (CIS):</span>
              <span className="font-bold text-[#18324A]">
                {formatCurrencyInr(assessment.subsidies.schemes.find((s) => s.id === 'INC-2026-001')?.estimatedEntitlement || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#6E6A61]">
              <span>Combined Fiscal Value:</span>
              <span className="font-bold text-[#5D8068]">{assessment.subsidies.formattedTotalAdvantage}</span>
            </div>
            <div className="flex items-center justify-between text-[#8A6A14] font-bold">
              <span>Policy Compliance:</span>
              <span>100% Eligible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Formula Disclosure Toggle */}
      <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs font-mono-data text-[#6E6A61]">
        <button
          type="button"
          onClick={() => setShowExplanation((prev) => !prev)}
          className="text-[#18324A] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showExplanation ? 'Hide Statutory Formulas & References' : 'View Statutory Formulas & Policy References (Odisha IPR 2022)'}</span>
        </button>

        <span className="text-[11px] text-[#8B8982]">
          Authority: Directorate of Industries • MSME Department • Commercial Taxes Directorate
        </span>
      </div>

      {/* Expandable Statutory Disclosure */}
      {showExplanation && (
        <div className="p-4 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs font-mono-data text-[#524E48] space-y-2 leading-relaxed">
          <div className="font-bold text-[#18324A] uppercase text-[11px]">
            Statutory Calculation Methodology & Rules:
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[#30302D]">
            <li>
              <strong>Plant & Machinery Capex (65%):</strong> Standard regulatory allocation under IPR 2022 for manufacturing/processing units, serving as the eligible benchmark for Capital Investment Subsidies and SGST reimbursement caps.
            </li>
            <li>
              <strong>Odisha IPR 2022 Clause 14.1 (CIS):</strong> 30% of Plant & Machinery Capex in Zone B/C or 20% in Zone A, capped at ₹1.00 Crore (or up to ₹2.5 Cr for priority sectors).
            </li>
            <li>
              <strong>Odisha IPR 2022 Clause 14.4 (Net SGST):</strong> 100% reimbursement of Net SGST deposited for 7 years from commercial production, subject to a lifetime cap of 150% of Plant Capex.
            </li>
            <li>
              <strong>Income Tax Act Section 32:</strong> 15% Normal Depreciation + 20% Additional Initial Depreciation on new plant & machinery in the first year = 35% cash tax shield write-off.
            </li>
            <li>
              <strong>Income Tax Act Section 115BAA:</strong> 15% base corporate tax rate for new domestic manufacturing enterprises vs standard 25%–30%.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
