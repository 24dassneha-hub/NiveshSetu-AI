/**
 * Centralized local persistence and data contracts for Clearance Renewals & Expiry Lifecycle Engine.
 * 
 * Maps statutory compliance validity periods under:
 * - Odisha Single Window Clearance Act
 * - Water (P&CP) Act 1974 & Air (P&CP) Act 1981
 * - The Factories Act, 1948
 * - Odisha Fire Prevention & Safety Act
 * - The Boilers Act, 1923
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { getApplications, saveApplication } from './applicationsStorage.js';
import { getDocuments } from './documentsStorage.js';
import { isCleanMode, USER_RENEWALS_KEY } from './appModeState.js';

export const RENEWALS_STORAGE_KEY = 'niveshsetu_renewals';

export function getRenewalsStorageKey() {
  return isCleanMode() ? USER_RENEWALS_KEY : RENEWALS_STORAGE_KEY;
}

export const RENEWAL_STATUS_TYPES = [
  { value: 'ACTIVE', label: 'Active & Valid', color: '#5D8068', bg: 'rgba(93,128,104,0.12)' },
  { value: 'RENEWAL_DUE', label: 'Renewal Due (<60d)', color: '#C08A3E', bg: 'rgba(192,138,62,0.12)' },
  { value: 'CRITICAL_EXPIRING', label: 'Urgent Expiry (<15d)', color: '#B85C4A', bg: 'rgba(184,92,74,0.12)' },
  { value: 'IN_PROGRESS', label: 'Renewal In Progress', color: '#18324A', bg: 'rgba(24,50,74,0.12)' },
  { value: 'EXPIRED', label: 'Expired / Penalty Risk', color: '#B85C4A', bg: 'rgba(184,92,74,0.12)' },
  { value: 'RENEWED', label: 'Renewed', color: '#5D8068', bg: 'rgba(93,128,104,0.12)' },
];

/**
 * Generate dates relative to current date (e.g. +22 days, -10 days)
 * ensuring sample seeds always remain dynamically active for live evaluation.
 */
function getRelativeDateISO(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

/**
 * Default sample industrial clearances for seed initialization
 */
export const SAMPLE_RENEWALS = [
  {
    id: 'REN-2026-001',
    approvalId: 'APR-001',
    clearanceName: 'Consent to Operate (CTO) - Air & Water',
    category: 'Pollution & Environment',
    department: 'State Pollution Control Board (OSPCB)',
    licenseNumber: 'OSPCB/CTO/2023/8892',
    issueDate: getRelativeDateISO(-1070), // ~3 years ago
    expiryDate: getRelativeDateISO(22),  // In 22 days (due soon)
    windowDays: 60,
    validityYears: 3,
    renewalFee: 25000,
    lateFeePerMonth: 2500,
    governingAct: 'Water (P&CP) Act 1974 & Air (P&CP) Act 1981',
    slaDays: 30,
    officerInCharge: 'Dr. P. K. Mohapatra (Senior Env. Engineer, BBSR)',
    escalationContact: 'Member Secretary, OSPCB (msospcb@ospcb.gov.in)',
    penalConsequence: 'Closure notice under Section 31A of Air Act & Power cut order',
    status: 'RENEWAL_DUE',
    requiredDocuments: [
      { id: 'req-1', name: 'Annual Environmental Statement (Form V)', type: 'ENVIRONMENT', mandatory: true },
      { id: 'req-2', name: 'Stack Emission & Effluent Lab Analysis Report', type: 'POLLUTION', mandatory: true },
      { id: 'req-3', name: 'Gross Fixed Capital Investment CA Certificate', type: 'FINANCIAL', mandatory: true },
    ],
    history: [
      {
        cycle: '2023 - 2026',
        renewalRef: 'OSPCB/REN/2023/8892',
        grantedOn: '2023-04-15',
        validUntil: getRelativeDateISO(22),
        term: '3 Years',
        feePaid: '₹25,000',
        certificateNumber: 'CTO-AW-2023-8892',
        status: 'GRANTED'
      },
      {
        cycle: '2020 - 2023',
        renewalRef: 'OSPCB/REN/2020/4102',
        grantedOn: '2020-04-10',
        validUntil: '2023-04-14',
        term: '3 Years',
        feePaid: '₹22,000',
        certificateNumber: 'CTO-AW-2020-4102',
        status: 'EXPIRED'
      }
    ]
  },
  {
    id: 'REN-2026-002',
    approvalId: 'APR-002',
    clearanceName: 'Factory License & Machinery Endorsement',
    category: 'Factory & Labour',
    department: 'Directorate of Factories and Boilers, Odisha',
    licenseNumber: 'DFB/OD/FL-2025-0419',
    issueDate: getRelativeDateISO(-355), // ~1 year ago
    expiryDate: getRelativeDateISO(9),   // In 9 days (CRITICAL!)
    windowDays: 60,
    validityYears: 1,
    renewalFee: 12000,
    lateFeePerMonth: 1800,
    governingAct: 'The Factories Act, 1948 (Section 6 & 7)',
    slaDays: 21,
    officerInCharge: 'Shri B. C. Jena (Joint Director of Factories, Sambalpur)',
    escalationContact: 'Director of Factories & Boilers (dfb-odisha@nic.in)',
    penalConsequence: '25% compounding penalty per month and prohibition of plant operation',
    status: 'CRITICAL_EXPIRING',
    requiredDocuments: [
      { id: 'req-4', name: 'Factory Building Plan & Machinery Layout', type: 'BUILDING_PLAN', mandatory: true },
      { id: 'req-5', name: 'Half-Yearly Labour Safety & Welfare Return (Form 21)', type: 'LABOUR', mandatory: true },
      { id: 'req-6', name: 'Stability Certificate by Competent Person', type: 'CERTIFICATE', mandatory: true },
    ],
    history: [
      {
        cycle: '2025 - 2026',
        renewalRef: 'DFB/REN/2025/1190',
        grantedOn: '2025-01-01',
        validUntil: getRelativeDateISO(9),
        term: '1 Year',
        feePaid: '₹12,000',
        certificateNumber: 'FL-2025-1190',
        status: 'GRANTED'
      }
    ]
  },
  {
    id: 'REN-2026-003',
    approvalId: 'APR-003',
    clearanceName: 'Fire Safety Recommendation & Compliance Certificate',
    category: 'Fire & Safety',
    department: 'Directorate of Fire and Emergency Services',
    licenseNumber: 'FS/OD/NOC-2024-551',
    issueDate: getRelativeDateISO(-400),
    expiryDate: getRelativeDateISO(145), // In 145 days (Active)
    windowDays: 45,
    validityYears: 2,
    renewalFee: 8500,
    lateFeePerMonth: 1000,
    governingAct: 'Odisha Fire Prevention and Fire Safety Act, 2021',
    slaDays: 15,
    officerInCharge: 'Assistant Fire Officer, Zone IV, Cuttack',
    escalationContact: 'Chief Fire Officer (fire-dg.od@gov.in)',
    penalConsequence: 'Revocation of building occupancy authorization',
    status: 'ACTIVE',
    requiredDocuments: [
      { id: 'req-7', name: 'Fire Suppression Equipment Maintenance Audit', type: 'FIRE_SAFETY', mandatory: true },
      { id: 'req-8', name: 'Evacuation Drill Log & Warden Certificate', type: 'DECLARATION', mandatory: false },
    ],
    history: [
      {
        cycle: '2024 - 2026',
        renewalRef: 'FS/REC/2024/0912',
        grantedOn: '2024-03-01',
        validUntil: getRelativeDateISO(145),
        term: '2 Years',
        feePaid: '₹8,500',
        certificateNumber: 'FSC-2024-551',
        status: 'GRANTED'
      }
    ]
  },
  {
    id: 'REN-2026-004',
    approvalId: 'APR-004',
    clearanceName: 'Industrial Boiler Annual Inspection & Safety Certificate',
    category: 'Factory & Machinery',
    department: 'Chief Inspector of Boilers, Govt. of Odisha',
    licenseNumber: 'CIB/OD/BLR-2025-018',
    issueDate: getRelativeDateISO(-340),
    expiryDate: getRelativeDateISO(18),  // In 18 days (In Progress)
    windowDays: 60,
    validityYears: 1,
    renewalFee: 16500,
    lateFeePerMonth: 2000,
    governingAct: 'The Boilers Act, 1923 & Indian Boiler Regulations',
    slaDays: 14,
    officerInCharge: 'Er. S. N. Ray (Deputy Chief Inspector of Boilers)',
    escalationContact: 'Chief Inspector of Boilers (boilers.odisha@gov.in)',
    penalConsequence: 'Immediate prohibition of steam generation under Section 23',
    status: 'IN_PROGRESS',
    linkedApplicationId: 'APP-2026-0003',
    requiredDocuments: [
      { id: 'req-9', name: 'Hydraulic Test & Ultrasonic Thickness Gauge Report', type: 'TECHNICAL', mandatory: true },
      { id: 'req-10', name: 'Boiler Attendant Competency Certificate (First Class)', type: 'CERTIFICATE', mandatory: true },
    ],
    history: [
      {
        cycle: '2025 - 2026',
        renewalRef: 'BLR/OD/2025/081',
        grantedOn: '2025-02-15',
        validUntil: getRelativeDateISO(18),
        term: '1 Year',
        feePaid: '₹16,500',
        certificateNumber: 'BLR-CERT-2025-018',
        status: 'IN_PROGRESS'
      }
    ]
  },
  {
    id: 'REN-2026-005',
    approvalId: 'APR-005',
    clearanceName: 'Hazardous Chemical Storage & Handling Authorization',
    category: 'Pollution & Environment',
    department: 'State Pollution Control Board (OSPCB)',
    licenseNumber: 'OSPCB/HAZ/AUTH/2023-112',
    issueDate: getRelativeDateISO(-1105),
    expiryDate: getRelativeDateISO(-10), // Expired 10 days ago!
    windowDays: 60,
    validityYears: 3,
    renewalFee: 20000,
    lateFeePerMonth: 3500,
    governingAct: 'Hazardous & Other Wastes Rules, 2016',
    slaDays: 45,
    officerInCharge: 'Senior Environmental Scientist (Hazardous Waste Cell)',
    escalationContact: 'Member Secretary, OSPCB (msospcb@ospcb.gov.in)',
    penalConsequence: 'Compounded penalty under Section 15 of EPA 1986',
    status: 'EXPIRED',
    requiredDocuments: [
      { id: 'req-11', name: 'Manifest Records of Hazardous Waste Disposals (Form 10)', type: 'POLLUTION', mandatory: true },
      { id: 'req-12', name: 'Emergency Preparedness & Disaster Management Plan', type: 'OTHER', mandatory: true },
    ],
    history: [
      {
        cycle: '2023 - 2026',
        renewalRef: 'OSPCB/HAZ/2023/112',
        grantedOn: '2023-01-10',
        validUntil: getRelativeDateISO(-10),
        term: '3 Years',
        feePaid: '₹20,000',
        certificateNumber: 'HAZ-AUTH-2023-112',
        status: 'EXPIRED'
      }
    ]
  }
];

/**
 * Retrieve all clearance renewal records from localStorage.
 * If user has explicitly initialized a clean empty workspace, respects empty array.
 */
export function getRenewals() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const key = getRenewalsStorageKey();
    const raw = localStorage.getItem(key);
    if (raw === null) {
      if (!isCleanMode()) {
        localStorage.setItem(key, JSON.stringify(SAMPLE_RENEWALS));
        return SAMPLE_RENEWALS;
      } else {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading renewals from localStorage:', err);
    return [];
  }
}

/**
 * Find a specific renewal record by ID
 */
export function getRenewalById(id) {
  if (!id) return null;
  const renewals = getRenewals();
  return renewals.find((r) => r.id === id) || null;
}

/**
 * Calculate dynamic urgency, days remaining, and progress percent for a renewal
 */
export function getRenewalUrgency(renewal) {
  if (!renewal || !renewal.expiryDate) {
    return {
      daysRemaining: 0,
      urgency: 'ACTIVE',
      label: 'Unknown',
      color: '#6E6A61',
      badgeVariant: 'neutral',
      progressPercent: 0,
      isExpired: false,
      isDueSoon: false,
      isCritical: false,
    };
  }

  const now = new Date();
  const expiry = new Date(renewal.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Calculate elapsed progress percentage
  let progressPercent = 0;
  if (renewal.issueDate) {
    const start = new Date(renewal.issueDate).getTime();
    const end = expiry.getTime();
    const current = now.getTime();
    if (end > start) {
      progressPercent = Math.min(100, Math.max(0, Math.round(((current - start) / (end - start)) * 100)));
    }
  }

  // Check state
  if (renewal.status === 'IN_PROGRESS') {
    return {
      daysRemaining,
      urgency: 'IN_PROGRESS',
      label: 'Renewal In Progress',
      color: '#18324A',
      badgeVariant: 'info',
      progressPercent,
      isExpired: daysRemaining < 0,
      isDueSoon: daysRemaining <= (renewal.windowDays || 60) && daysRemaining >= 0,
      isCritical: daysRemaining <= 15 && daysRemaining >= 0,
    };
  }

  if (renewal.status === 'RENEWED') {
    return {
      daysRemaining,
      urgency: 'RENEWED',
      label: 'Renewed',
      color: '#5D8068',
      badgeVariant: 'success',
      progressPercent: 10,
      isExpired: false,
      isDueSoon: false,
      isCritical: false,
    };
  }

  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    return {
      daysRemaining,
      urgency: 'EXPIRED',
      label: `Expired ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`,
      color: '#B85C4A',
      badgeVariant: 'error',
      progressPercent: 100,
      isExpired: true,
      isDueSoon: false,
      isCritical: true,
    };
  }

  if (daysRemaining <= 15) {
    return {
      daysRemaining,
      urgency: 'CRITICAL',
      label: `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} (Critical)`,
      color: '#B85C4A',
      badgeVariant: 'error',
      progressPercent,
      isExpired: false,
      isDueSoon: true,
      isCritical: true,
    };
  }

  const window = renewal.windowDays || 60;
  if (daysRemaining <= window) {
    return {
      daysRemaining,
      urgency: 'RENEWAL_DUE',
      label: `Renewal Due (${daysRemaining} days left)`,
      color: '#C08A3E',
      badgeVariant: 'warning',
      progressPercent,
      isExpired: false,
      isDueSoon: true,
      isCritical: false,
    };
  }

  return {
    daysRemaining,
    urgency: 'ACTIVE',
    label: `Active (${daysRemaining} days left)`,
    color: '#5D8068',
    badgeVariant: 'success',
    progressPercent,
    isExpired: false,
    isDueSoon: false,
    isCritical: false,
  };
}

/**
 * Calculate high-level metrics for dashboard cards
 */
export function calculateRenewalMetrics(renewalsList = null) {
  const renewals = renewalsList || getRenewals();
  let total = renewals.length;
  let renewalDue = 0;
  let critical = 0;
  let inProgress = 0;
  let expired = 0;
  let active = 0;

  renewals.forEach((r) => {
    const urgencyInfo = getRenewalUrgency(r);
    if (r.status === 'IN_PROGRESS' || urgencyInfo.urgency === 'IN_PROGRESS') {
      inProgress++;
    } else if (urgencyInfo.isExpired) {
      expired++;
    } else if (urgencyInfo.isCritical) {
      critical++;
      renewalDue++;
    } else if (urgencyInfo.isDueSoon) {
      renewalDue++;
    } else {
      active++;
    }
  });

  return {
    total,
    renewalDue,
    critical,
    inProgress,
    expired,
    active,
  };
}

/**
 * Save or update a renewal entry
 */
export function saveRenewal(renewalData, user = null) {
  if (typeof localStorage === 'undefined') return null;
  const renewals = getRenewals();
  const now = new Date().toISOString();

  const key = getRenewalsStorageKey();
  if (renewalData.id) {
    const index = renewals.findIndex((r) => r.id === renewalData.id);
    if (index !== -1) {
      const existing = renewals[index];
      const updated = {
        ...existing,
        ...renewalData,
        updatedAt: now,
      };
      renewals[index] = updated;
      try {
        localStorage.setItem(key, JSON.stringify(renewals));
      } catch (err) {
        console.error('Failed to save renewal in localStorage:', err);
      }
      return updated;
    }
  }

  // Create new renewal
  const nextNum = renewals.length + 1;
  const newId = `REN-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
  const newRecord = {
    id: newId,
    ...renewalData,
    createdAt: now,
    updatedAt: now,
  };

  renewals.unshift(newRecord);
  try {
    localStorage.setItem(key, JSON.stringify(renewals));
  } catch (err) {
    console.error('Failed to insert renewal in localStorage:', err);
  }
  return newRecord;
}

/**
 * Check if the Document Vault contains documents matching the renewal requirement
 */
export function checkRenewalPrerequisites(renewal) {
  if (!renewal || !Array.isArray(renewal.requiredDocuments)) {
    return { allMatched: true, requirements: [] };
  }

  const vaultDocs = getDocuments();
  let allMatched = true;

  const requirements = renewal.requiredDocuments.map((req) => {
    // Find matching document in vault by type or title
    const matchedDoc = vaultDocs.find((doc) => {
      if (req.type && doc.type === req.type) return true;
      if (req.name && doc.name && doc.name.toLowerCase().includes(req.name.toLowerCase())) return true;
      return false;
    });

    const isSatisfied = !!matchedDoc;
    if (req.mandatory && !isSatisfied) {
      allMatched = false;
    }

    return {
      ...req,
      isSatisfied,
      matchedDoc: matchedDoc || null,
    };
  });

  return {
    allMatched,
    requirements,
  };
}

/**
 * 1-Click Renewal Initiation Workflow:
 * - Creates an official tracking entry in composite applications (`applicationsStorage`)
 * - Sets the clearance renewal status to `IN_PROGRESS`
 * - Links the new application ID to the renewal record
 * - Appends a pending cycle entry to the historical audit trail
 */
export function initiateRenewalApplication(renewalId, formData = {}, user = null) {
  if (typeof localStorage === 'undefined') return { success: false, error: 'Storage unavailable' };

  const renewal = getRenewalById(renewalId);
  if (!renewal) {
    return { success: false, error: 'Clearance record not found' };
  }

  const now = new Date().toISOString();
  const selectedTerm = formData.termYears || renewal.validityYears || 1;
  const baseFee = renewal.renewalFee || 10000;
  const renewalFee = baseFee * (selectedTerm === 5 ? 4.5 : selectedTerm === 3 ? 2.8 : selectedTerm);
  const feeNumber = Math.round(renewalFee);

  // 1. Create linked entry in applicationsStorage
  const appTitle = `Statutory Renewal: ${renewal.clearanceName} (${selectedTerm} Year${selectedTerm > 1 ? 's' : ''})`;
  const applicationPayload = {
    approvalId: renewal.approvalId || 'APR-GEN',
    title: appTitle,
    applicant: {
      name: user?.name || user?.businessName || 'Ray Green Energy Ltd',
      contactName: user?.name || 'Authorized Signatory',
      contactEmail: user?.email || 'compliance@rayenergy.odisha.gov.in',
      contactPhone: user?.phone || '+91 94370 12345',
    },
    authority: {
      name: renewal.department,
      department: renewal.department,
      officer: renewal.officerInCharge,
    },
    submission: {
      mode: 'Online Single Window (OSW)',
      date: now.split('T')[0],
      referenceNumber: `REN-APP-${Date.now().toString().slice(-6)}`,
    },
    status: 'SUBMITTED',
    currentStage: 'Filing & Statutory Fee Verification',
    fees: {
      amount: feeNumber,
      status: 'PAID',
      paymentMode: 'Treasury Challan / e-Payment',
      transactionRef: `eGRAS-OD-${Date.now().toString().slice(-8)}`,
      receiptDate: now.split('T')[0],
    },
    timeline: [
      {
        id: `evt-${Date.now()}-1`,
        title: 'Renewal Application Filed',
        description: `Automated filing initiated for renewal of license ${renewal.licenseNumber}. Extension term requested: ${selectedTerm} year(s).`,
        timestamp: now,
        actor: user?.name || 'Applicant Entrepreneur',
      },
      {
        id: `evt-${Date.now()}-2`,
        title: 'Statutory Fee Paid',
        description: `₹${feeNumber.toLocaleString('en-IN')} paid via Integrated e-Treasury Portal.`,
        timestamp: now,
        actor: 'Payment Gateway',
      }
    ],
    notes: `Renewal of existing certificate ${renewal.licenseNumber}. Governing Act: ${renewal.governingAct}. SLA commitment: ${renewal.slaDays} days.`,
    isRenewal: true,
    renewalId: renewal.id,
  };

  const createdApp = saveApplication(applicationPayload, user);

  // 2. Update renewal record
  const updatedHistory = [
    {
      cycle: `${new Date().getFullYear()} - ${new Date().getFullYear() + selectedTerm} (Requested)`,
      renewalRef: createdApp ? createdApp.id : `APP-${Date.now().toString().slice(-4)}`,
      grantedOn: 'Pending Verification',
      validUntil: 'Pending Approval',
      term: `${selectedTerm} Year${selectedTerm > 1 ? 's' : ''}`,
      feePaid: `₹${feeNumber.toLocaleString('en-IN')}`,
      certificateNumber: 'Awaiting Issuance',
      status: 'APPLICATION_FILED',
      initiatedDate: now.split('T')[0],
    },
    ...(renewal.history || []),
  ];

  const updatedRenewal = saveRenewal({
    ...renewal,
    status: 'IN_PROGRESS',
    linkedApplicationId: createdApp ? createdApp.id : null,
    lastRenewalInitiated: now,
    history: updatedHistory,
  }, user);

  return {
    success: true,
    application: createdApp,
    renewal: updatedRenewal,
  };
}
