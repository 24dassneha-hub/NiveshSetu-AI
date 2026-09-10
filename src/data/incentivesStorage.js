/**
 * Centralized local persistence and data contracts for Industrial Incentives & Subsidies Engine.
 * 
 * Maps statutory incentive policies under:
 * - Odisha Industrial Policy Resolution (IPR 2022)
 * - Odisha MSME Development Policy 2022
 * - Odisha Green Energy & Environmental Subsidy Framework
 */

import { getApplications, saveApplication } from './applicationsStorage.js';

export const INCENTIVES_STORAGE_KEY = 'niveshsetu_incentives';

export const INCENTIVE_CATEGORIES = [
  'All',
  'Capital Subsidy',
  'Fiscal Incentive',
  'Finance Support',
  'Utility Subsidy',
  'Green Grant',
  'Mega Project',
];

export const INCENTIVE_STATUSES = [
  { value: 'ELIGIBLE', label: 'Eligible to Claim', color: '#5D8068', bg: 'rgba(93,128,104,0.12)' },
  { value: 'CLAIMED', label: 'Claim Under Review', color: '#C08A3E', bg: 'rgba(192,138,62,0.12)' },
  { value: 'DISBURSED', label: 'Disbursed / Availed', color: '#18324A', bg: 'rgba(24,50,74,0.12)' },
  { value: 'NOT_ELIGIBLE', label: 'Not Eligible', color: '#8B8982', bg: 'rgba(139,137,130,0.12)' },
];

export const SAMPLE_INCENTIVES = [
  {
    id: 'INC-2026-001',
    schemeName: 'Capital Investment Subsidy (CIS)',
    category: 'Capital Subsidy',
    authority: 'Directorate of Industries, Odisha / IPICOL',
    policyReference: 'Odisha IPR 2022 - Clause 14.1',
    maxBenefitCap: 10000000, // ₹1.00 Cr
    subsidyRate: '30% of Plant & Machinery Capex (Zone B/C) / 20% (Zone A)',
    description: 'Direct capital reimbursement on verified investment in plant, machinery, and equipment for manufacturing and processing enterprises.',
    targetSectors: ['Manufacturing', 'Renewable Energy', 'Food Processing', 'Textiles', 'Engineering'],
    eligibleZones: ['Zone A', 'Zone B', 'Zone C'],
    minInvestment: 2500000,
    slaDays: 45,
    estimatedEntitlement: 3500000, // ₹35 Lakh
    status: 'ELIGIBLE',
    claimWindow: 'Within 1 year of starting commercial production',
    disbursedAmount: 0,
    requiredDocuments: [
      'Chartered Accountant (CA) Certificate of Fixed Capital Investment',
      'Bank Term Loan Appraisal & Disbursement Certificate',
      'First Sale Invoice / Commercial Production Certificate',
      'Consent to Operate (CTO) issued by OSPCB'
    ],
    milestones: [
      { name: 'Initial Scrutiny & Plant Inspection', days: 15 },
      { name: 'District Level Committee (DLC) Sanction', days: 20 },
      { name: 'Treasury e-Disbursement to Escrow Account', days: 10 }
    ]
  },
  {
    id: 'INC-2026-002',
    schemeName: 'Net SGST 100% Fiscal Reimbursement',
    category: 'Fiscal Incentive',
    authority: 'Commercial Taxes and Goods & Services Tax Directorate',
    policyReference: 'Odisha IPR 2022 - Clause 14.4',
    maxBenefitCap: 25000000, // ₹2.5 Cr
    subsidyRate: '100% of Net SGST paid for 7 years (capped at 150% of plant capex)',
    description: 'Refund of net state GST deposited after utilization of input tax credit, strengthening cash-flow and competitive margin.',
    targetSectors: ['Renewable Energy', 'Manufacturing', 'Electronics', 'Chemicals'],
    eligibleZones: ['Zone A', 'Zone B', 'Zone C'],
    minInvestment: 5000000,
    slaDays: 30,
    estimatedEntitlement: 4800000, // ₹48 Lakh
    status: 'ELIGIBLE',
    claimWindow: 'Filed bi-annually on 30th Sept and 31st March',
    disbursedAmount: 0,
    requiredDocuments: [
      'GSTR-3B & GSTR-1 Annual Returns Verification',
      'Bank Account Mandate Form (PFMS registered)',
      'Proof of Commercial Production from DIC'
    ],
    milestones: [
      { name: 'Tax Reconciliation Audit', days: 14 },
      { name: 'CT & GST Commissionerate Concurrence', days: 10 },
      { name: 'Direct Benefit Transfer (DBT)', days: 6 }
    ]
  },
  {
    id: 'INC-2026-003',
    schemeName: 'Interest Subvention on Term Loan',
    category: 'Finance Support',
    authority: 'MSME Department & OSFC, Odisha',
    policyReference: 'Odisha MSME Development Policy 2022',
    maxBenefitCap: 12500000, // ₹1.25 Cr over 5 yrs
    subsidyRate: '5% per annum interest rate relief for 5 consecutive years',
    description: 'Direct reimbursement of 5% interest paid to scheduled commercial banks or OSFC against long-term capital loans.',
    targetSectors: ['All MSMEs', 'Renewable Energy', 'Manufacturing'],
    eligibleZones: ['Zone A', 'Zone B', 'Zone C'],
    minInvestment: 1000000,
    slaDays: 30,
    estimatedEntitlement: 1850000, // ₹18.5 Lakh
    status: 'CLAIMED',
    linkedApplicationId: 'APP-2026-00420',
    claimWindow: 'Annual filing within 3 months of fiscal year-end',
    disbursedAmount: 0,
    requiredDocuments: [
      'Bank Interest Paid Certificate with Term Loan Account Ledger',
      'Udyam Registration Certificate',
      'Audited Annual Balance Sheet & P&L'
    ],
    milestones: [
      { name: 'Financial Verification by OSFC', days: 12 },
      { name: 'State Level Committee Clearance', days: 12 },
      { name: 'Interest Credit to Loan Account', days: 6 }
    ]
  },
  {
    id: 'INC-2026-004',
    schemeName: 'Electricity Duty 100% Exemption',
    category: 'Utility Subsidy',
    authority: 'Department of Energy / DISCOM (TPCODL/TPNODL)',
    policyReference: 'Odisha IPR 2022 - Clause 15.2',
    maxBenefitCap: 5000000, // ₹50 Lakh
    subsidyRate: '100% waiver of state electricity duty for 5 continuous years',
    description: 'Exemption from state power duty collected on HT and LT industrial connections from date of power charging.',
    targetSectors: ['All Industrial Consumers', 'Manufacturing', 'Food Processing'],
    eligibleZones: ['Zone A', 'Zone B', 'Zone C'],
    minInvestment: 1000000,
    slaDays: 21,
    estimatedEntitlement: 480000, // ₹4.8 Lakh
    status: 'DISBURSED',
    claimWindow: 'Apply within 90 days of contract demand release',
    disbursedAmount: 480000,
    requiredDocuments: [
      'Electricity Supply Agreement with DISCOM',
      'First Consumer Power Bill & Meter Installation Protocol',
      'DIC Factory Inspection Note'
    ],
    milestones: [
      { name: 'Chief Electrical Inspector (CEI) Scrutiny', days: 10 },
      { name: 'DISCOM Billing System Code Update', days: 7 },
      { name: 'Duty Waiver Applied to Monthly Invoice', days: 4 }
    ]
  },
  {
    id: 'INC-2026-005',
    schemeName: 'Environmental Protection & Green Energy Grant',
    category: 'Green Grant',
    authority: 'State Pollution Control Board & OREDA',
    policyReference: 'Odisha Green Industrial Transition Grant 2023',
    maxBenefitCap: 5000000, // ₹50 Lakh
    subsidyRate: '50% grant on Solar Rooftop, Biomass Boiler, and ZLD ETP',
    description: 'Financial grant encouraging clean energy transition, effluent recycling plants, and zero-liquid-discharge installations.',
    targetSectors: ['Renewable Energy', 'Chemicals', 'Textiles', 'Engineering'],
    eligibleZones: ['Zone A', 'Zone B', 'Zone C'],
    minInvestment: 1500000,
    slaDays: 30,
    estimatedEntitlement: 2200000, // ₹22 Lakh
    status: 'ELIGIBLE',
    claimWindow: 'Within 6 months of commissioning green equipment',
    disbursedAmount: 0,
    requiredDocuments: [
      'Vendor Invoices & Equipment Installation Certificate',
      'SPCB / OREDA Technical Performance Audit Report',
      'Net-Metering Commissioning Report with Grid Connectivity'
    ],
    milestones: [
      { name: 'SPCB Technical Field Inspection', days: 14 },
      { name: 'Green Fund Sanction Committee', days: 10 },
      { name: 'Direct Credit to Capital Account', days: 6 }
    ]
  },
  {
    id: 'INC-2026-006',
    schemeName: 'Pioneer Mega Project Anchor Package',
    category: 'Mega Project',
    authority: 'High Level Clearance Authority (HLCA) / IPICOL',
    policyReference: 'Odisha Mega Industrial Policy 2022',
    maxBenefitCap: 100000000, // ₹10.00 Cr
    subsidyRate: 'Customized Land, Stamp Duty, and Infrastructure Subsidy',
    description: 'Special customized concession package for premier pioneer projects making initial large-scale investment in industrially backward districts.',
    targetSectors: ['Mega Aerospace', 'Semiconductor', 'EV Battery Giga-factories'],
    eligibleZones: ['Zone B', 'Zone C'],
    minInvestment: 500000000, // ₹50 Cr
    slaDays: 60,
    estimatedEntitlement: 0,
    status: 'NOT_ELIGIBLE',
    claimWindow: 'Prior to Project Groundbreaking Ceremony',
    disbursedAmount: 0,
    requiredDocuments: [
      'Detailed Project Report (DPR) approved by HLCA',
      'High-Power Committee Allotment Order'
    ],
    milestones: [
      { name: 'Cabinet Approval & MoU Signing', days: 30 },
      { name: 'Concession Agreement Execution', days: 30 }
    ]
  }
];

/**
 * Get all incentive schemes from localStorage (or seed defaults)
 */
export function getIncentives() {
  if (typeof localStorage === 'undefined') return SAMPLE_INCENTIVES;
  try {
    const raw = localStorage.getItem(INCENTIVES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INCENTIVES_STORAGE_KEY, JSON.stringify(SAMPLE_INCENTIVES));
      return SAMPLE_INCENTIVES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_INCENTIVES;
  } catch (err) {
    console.error('Error reading incentives from localStorage:', err);
    return SAMPLE_INCENTIVES;
  }
}

/**
 * Get single incentive by ID
 */
export function getIncentiveById(id) {
  if (!id) return null;
  const list = getIncentives();
  return list.find((i) => i.id === id) || null;
}

/**
 * Compute aggregated KPI metrics
 */
export function calculateIncentiveMetrics(incentivesList = null) {
  const list = incentivesList || getIncentives();
  let totalSchemes = list.length;
  let eligibleCount = 0;
  let claimedCount = 0;
  let disbursedCount = 0;
  let totalPotentialBenefit = 0;
  let totalDisbursedBenefit = 0;

  list.forEach((item) => {
    if (item.status === 'ELIGIBLE') {
      eligibleCount++;
      totalPotentialBenefit += item.estimatedEntitlement || 0;
    } else if (item.status === 'CLAIMED') {
      claimedCount++;
      totalPotentialBenefit += item.estimatedEntitlement || 0;
    } else if (item.status === 'DISBURSED') {
      disbursedCount++;
      totalDisbursedBenefit += item.disbursedAmount || item.estimatedEntitlement || 0;
    }
  });

  return {
    totalSchemes,
    eligibleCount,
    claimedCount,
    disbursedCount,
    totalPotentialBenefit,
    totalDisbursedBenefit,
  };
}

/**
 * File an incentive claim:
 * 1. Creates an application entry in applicationsStorage
 * 2. Updates scheme status to CLAIMED
 */
export function fileIncentiveClaim(schemeId, claimData = {}, user = null) {
  if (typeof localStorage === 'undefined') return { success: false, error: 'Storage unavailable' };

  const scheme = getIncentiveById(schemeId);
  if (!scheme) return { success: false, error: 'Scheme not found' };

  const now = new Date().toISOString();
  const claimAmount = Number(claimData.claimAmount) || scheme.estimatedEntitlement || 1000000;

  // 1. Create linked application
  const appTitle = `Incentive Claim: ${scheme.schemeName}`;
  const appPayload = {
    approvalId: 'INC-SCHEME',
    title: appTitle,
    applicant: {
      name: user?.name || user?.businessName || 'Ray Green Energy Ltd',
      contactName: user?.name || 'Authorized Signatory',
      contactEmail: user?.email || 'compliance@rayenergy.odisha.gov.in',
      contactPhone: user?.phone || '+91 94370 12345',
    },
    authority: {
      name: scheme.authority,
      department: scheme.authority,
      officer: 'District Industries Centre (DIC) General Manager',
    },
    submission: {
      mode: 'IPICOL GO-SWIFT Portal / Single Window',
      date: now.split('T')[0],
      referenceNumber: `INC-CLAIM-${Date.now().toString().slice(-6)}`,
    },
    status: 'SUBMITTED',
    currentStage: 'Capex Verification & Scrutiny',
    fees: {
      amount: 0,
      status: 'EXEMPT',
      paymentMode: 'Free Government Scheme',
    },
    timeline: [
      {
        id: `evt-${Date.now()}-1`,
        title: 'Subsidy Claim Filed',
        description: `Claim submitted for ₹${claimAmount.toLocaleString('en-IN')} under ${scheme.policyReference}.`,
        timestamp: now,
        actor: user?.name || 'Applicant Entrepreneur',
      },
      {
        id: `evt-${Date.now()}-2`,
        title: 'DIC Scrutiny Scheduled',
        description: `SLA timer of ${scheme.slaDays} days initiated under Odisha RTSA.`,
        timestamp: now,
        actor: 'Single Window Automation',
      }
    ],
    notes: `Claim for ${scheme.schemeName}. Declared Plant Capex: ₹${(claimData.capexAmount || 15000000).toLocaleString('en-IN')}. Target benefit: ₹${claimAmount.toLocaleString('en-IN')}.`,
    isIncentive: true,
    schemeId: scheme.id,
  };

  const createdApp = saveApplication(appPayload, user);

  // 2. Update scheme status in storage
  const list = getIncentives();
  const idx = list.findIndex((i) => i.id === schemeId);
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      status: 'CLAIMED',
      linkedApplicationId: createdApp ? createdApp.id : null,
      claimedAmount: claimAmount,
      claimedDate: now.split('T')[0],
      updatedAt: now,
    };
    try {
      localStorage.setItem(INCENTIVES_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update incentive in localStorage:', e);
    }
  }

  return {
    success: true,
    application: createdApp,
    scheme: list[idx],
  };
}
