/**
 * Centralized persistence and data contracts for Monitored Government Approvals.
 * 
 * ARCHITECTURE:
 * - Direct mapping to future PostgreSQL table 'approvals' & 'application_monitoring'
 * - Government systems (NSWS, API Setu, Department APIs) are the source of truth
 * - Sneha AI normalizes statuses, highlights queries, and provides timeline explanations
 */

import { normalizeGovernmentStatus, NORMALIZED_STATUS } from '../services/monitoringService.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { isCleanMode, USER_APPROVALS_KEY } from './appModeState.js';

export const APPROVALS_STORAGE_KEY = 'niveshsetu_approvals';

export function getApprovalsStorageKey() {
  return isCleanMode() ? USER_APPROVALS_KEY : APPROVALS_STORAGE_KEY;
}

export const CATEGORIES = [
  'Business',
  'Factory',
  'Environment',
  'Fire & Safety',
  'Labour',
  'Building',
  'Pollution',
  'Tax',
  'Food Safety',
  'Electricity',
  'Water',
  'Other',
];

export const APPLICATION_STATUSES = [
  'APPROVED',
  'UNDER_PROCESS',
  'ACTION_REQUIRED',
  'NOT_YET',
  'REJECTED',
];

/**
 * Realistic default monitored approvals for demo and initial launch
 */
export const DEFAULT_MONITORED_APPROVALS = [
  {
    id: 'APR-001',
    approvalId: 'nsws-factory-license',
    name: 'Factory Operating License',
    category: 'Factory',
    authority: {
      name: 'Directorate of Factories & Boilers, Odisha',
      department: 'Labour & ESI Department',
      jurisdiction: 'State',
      state: 'Odisha',
    },
    application: {
      applicationId: 'FL-2026-00421',
      submittedAt: '2026-08-28T10:30:00Z',
      submissionDate: '28 Aug 2026',
      status: 'Approved',
    },
    monitoring: {
      source: 'NSWS',
      connectionStatus: 'CONNECTED',
      lastCheckedAt: '2026-09-09T20:42:00Z',
      nextCheckAt: '2026-09-10T08:42:00Z',
    },
    status: {
      normalized: NORMALIZED_STATUS.APPROVED,
      sourceStatus: 'Certificate Issued',
      currentStage: 'Certificate Issued',
      changedAt: '2026-09-08T15:30:00Z',
    },
    timeline: [
      { date: '28 Aug 2026', stage: 'Application Submitted', detail: 'Application Form 2 submitted via NSWS portal with plant layout attachments.', status: 'COMPLETED' },
      { date: '31 Aug 2026', stage: 'Document Scrutiny', detail: 'Machine schedule and emergency egress plans verified by Assistant Director.', status: 'COMPLETED' },
      { date: '04 Sep 2026', stage: 'Joint Site Inspection', detail: 'Safety guardrails, industrial ventilation, and power cutoffs cleared on-site.', status: 'COMPLETED' },
      { date: '08 Sep 2026', stage: 'Certificate Issued', detail: 'Statutory operating license granted under Section 6 of Factories Act 1948.', status: 'COMPLETED' },
    ],
    certificate: {
      available: true,
      name: 'Statutory Factory Operating License',
      number: 'OD-FAC-2026-88412',
      issuedAt: '08 Sep 2026',
      validUntil: '31 Dec 2027',
      downloadUrl: '#',
    },
    actionRequired: {
      required: false,
      message: null,
      deadline: null,
    },
    portalId: 'nsws-factory-license',
    officialUrl: 'https://www.nsws.gov.in',
    sla: { durationDays: 30, deadline: '2026-09-27' },
    createdAt: '2026-08-28T10:30:00Z',
    updatedAt: '2026-09-08T15:30:00Z',
  },
  {
    id: 'APR-002',
    approvalId: 'ospcb-cte',
    name: 'Consent to Establish (CTE) — Pollution Clearance',
    category: 'Environment',
    authority: {
      name: 'Odisha State Pollution Control Board (OSPCB)',
      department: 'Forest, Environment & Climate Change Department',
      jurisdiction: 'State',
      state: 'Odisha',
    },
    application: {
      applicationId: 'OCMMS-CTE-8401',
      submittedAt: '2026-09-02T11:15:00Z',
      submissionDate: '02 Sep 2026',
      status: 'Query Raised',
    },
    monitoring: {
      source: 'Department API',
      connectionStatus: 'CONNECTED',
      lastCheckedAt: '2026-09-09T22:15:00Z',
    },
    status: {
      normalized: NORMALIZED_STATUS.ACTION_REQUIRED,
      sourceStatus: 'Query Raised by Member Secretary',
      currentStage: 'Clarification Required',
      changedAt: '2026-09-07T14:10:00Z',
    },
    timeline: [
      { date: '02 Sep 2026', stage: 'Application Submitted', detail: 'Filed online via OCMMS along with EIA screening report.', status: 'COMPLETED' },
      { date: '05 Sep 2026', stage: 'Technical Scrutiny', detail: 'Under review by Regional Officer (Khordha Zone).', status: 'COMPLETED' },
      { date: '07 Sep 2026', stage: 'Query Raised', detail: 'Official query issued: Clarification on daily effluent treatment scheme needed.', status: 'PENDING' },
    ],
    actionRequired: {
      required: true,
      type: 'DEFICIENCY_QUERY',
      message: 'OSPCB Regional Office has requested technical justification for daily water consumption and ETP sludge disposal plan.',
      deadline: '16 Sep 2026',
      daysRemaining: 6,
      actionUrl: 'https://odocmms.nic.in',
    },
    certificate: {
      available: false,
      name: null,
      number: null,
    },
    portalId: 'ospcb-cte',
    officialUrl: 'https://odocmms.nic.in',
    sla: { durationDays: 45, deadline: '2026-10-17' },
    createdAt: '2026-09-02T11:15:00Z',
    updatedAt: '2026-09-07T14:10:00Z',
  },
  {
    id: 'APR-003',
    approvalId: 'odisha-fire-noc',
    name: 'Fire Safety Recommendation & Fire NOC',
    category: 'Fire & Safety',
    authority: {
      name: 'Directorate of Fire & Emergency Services, Odisha',
      department: 'Home Department',
      jurisdiction: 'State',
      state: 'Odisha',
    },
    application: {
      applicationId: 'FSC-2026-0912',
      submittedAt: '2026-09-04T09:00:00Z',
      submissionDate: '04 Sep 2026',
      status: 'In Review',
    },
    monitoring: {
      source: 'Department API',
      connectionStatus: 'CONNECTED',
      lastCheckedAt: '2026-09-09T23:10:00Z',
    },
    status: {
      normalized: NORMALIZED_STATUS.UNDER_PROCESS,
      sourceStatus: 'Under Scrutiny by Fire Officer',
      currentStage: 'Inspection Scheduled',
      changedAt: '2026-09-06T16:00:00Z',
    },
    timeline: [
      { date: '04 Sep 2026', stage: 'Application Registered', detail: 'Application filed through Agni-Shama Seva portal.', status: 'COMPLETED' },
      { date: '06 Sep 2026', stage: 'Site Inspection Scheduled', detail: 'Assistant Fire Officer scheduled on-site inspection for hydrant and sprinkler spacing.', status: 'IN_PROGRESS' },
      { date: 'Upcoming', stage: 'Final FSC Issuance', detail: 'Issuance of statutory Fire Safety Certificate upon inspection compliance.', status: 'UPCOMING' },
    ],
    actionRequired: {
      required: false,
      message: null,
      deadline: null,
    },
    certificate: {
      available: false,
      name: null,
      number: null,
    },
    portalId: 'odisha-fire-noc',
    officialUrl: 'https://agnishamaseva.odisha.gov.in',
    sla: { durationDays: 21, deadline: '2026-09-25' },
    createdAt: '2026-09-04T09:00:00Z',
    updatedAt: '2026-09-06T16:00:00Z',
  },
  {
    id: 'APR-004',
    approvalId: 'odisha-trade-license',
    name: 'Municipal Trade License (SUJOG / ULB)',
    category: 'Business',
    authority: {
      name: 'Housing & Urban Development Department, Odisha',
      department: 'Bhubaneswar Municipal Corporation (BMC)',
      jurisdiction: 'Urban Local Body',
      state: 'Odisha',
    },
    application: {
      applicationId: null,
      submittedAt: null,
      submissionDate: null,
      status: 'Not Started',
    },
    monitoring: {
      source: 'NOT_CONNECTED',
      connectionStatus: 'NOT_YET',
      lastCheckedAt: null,
    },
    status: {
      normalized: NORMALIZED_STATUS.NOT_YET,
      sourceStatus: 'Not Applied',
      currentStage: 'Pre-submission',
      changedAt: '2026-09-01T00:00:00Z',
    },
    timeline: [],
    actionRequired: {
      required: true,
      type: 'NOT_SUBMITTED',
      message: 'Application has not been submitted yet on the SUJOG urban portal.',
      deadline: null,
    },
    certificate: {
      available: false,
      name: null,
      number: null,
    },
    portalId: 'odisha-trade-license',
    officialUrl: 'https://urban.odisha.gov.in',
    sla: { durationDays: 15, deadline: null },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'APR-005',
    approvalId: 'idco-goswift',
    name: 'IDCO Industrial Land Allotment & Lease Deed',
    category: 'Business',
    authority: {
      name: 'Industrial Infrastructure Development Corp (IDCO) / GO-SWIFT',
      department: 'Industries Department, Government of Odisha',
      jurisdiction: 'State',
      state: 'Odisha',
    },
    application: {
      applicationId: 'IDCO-GO-7731',
      submittedAt: '2026-08-20T14:00:00Z',
      submissionDate: '20 Aug 2026',
      status: 'Submitted',
    },
    monitoring: {
      source: 'External Portal',
      connectionStatus: 'MONITORING_UNAVAILABLE',
      lastCheckedAt: '2026-09-09T18:00:00Z',
    },
    status: {
      normalized: NORMALIZED_STATUS.UNDER_PROCESS,
      sourceStatus: 'Application Registered (Manual Tracking Only)',
      currentStage: 'Land Allotment Committee Review',
      changedAt: '2026-08-20T14:00:00Z',
    },
    timeline: [
      { date: '20 Aug 2026', stage: 'Application Submitted', detail: 'Plot preference and project synopsis submitted on GO-SWIFT single window.', status: 'COMPLETED' },
      { date: '25 Aug 2026', stage: 'IDCO Technical Scrutiny', detail: 'Plot availability and land use classification reviewed.', status: 'COMPLETED' },
    ],
    actionRequired: {
      required: false,
      message: null,
      deadline: null,
    },
    certificate: {
      available: false,
      name: null,
      number: null,
    },
    portalId: 'idco-goswift',
    officialUrl: 'https://investodisha.gov.in',
    sla: { durationDays: 30, deadline: '2026-09-19' },
    createdAt: '2026-08-20T14:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
  },
];

/**
 * Normalizes an approval object to ensure all required fields exist
 */
function normalizeApprovalRecord(item) {
  if (!item) return null;
  const normalizedStatus = item.status?.normalized || normalizeGovernmentStatus(item.application?.status || item.status);

  return {
    id: item.id || `APR-${Date.now()}`,
    approvalId: item.approvalId || item.id,
    name: item.name || 'Statutory Clearance',
    category: item.category || 'Business',
    authority: {
      name: item.authority?.name || 'Government Authority',
      department: item.authority?.department || '',
      jurisdiction: item.authority?.jurisdiction || 'State',
      state: item.authority?.state || 'Odisha',
    },
    application: {
      applicationId: item.application?.applicationId || item.application?.id || null,
      submittedAt: item.application?.submittedAt || item.applied_date || null,
      submissionDate: item.application?.submissionDate || null,
      status: item.application?.status || item.status?.sourceStatus || 'Submitted',
    },
    monitoring: {
      source: item.monitoring?.source || 'NSWS',
      connectionStatus: item.monitoring?.connectionStatus || 'CONNECTED',
      lastCheckedAt: item.monitoring?.lastCheckedAt || new Date().toISOString(),
      nextCheckAt: item.monitoring?.nextCheckAt || null,
    },
    status: {
      normalized: normalizedStatus,
      sourceStatus: item.status?.sourceStatus || item.application?.status || 'Processing',
      currentStage: item.status?.currentStage || 'Department Review',
      changedAt: item.status?.changedAt || item.updatedAt || new Date().toISOString(),
    },
    timeline: Array.isArray(item.timeline) ? item.timeline : [],
    certificate: {
      available: Boolean(item.certificate?.available || normalizedStatus === NORMALIZED_STATUS.APPROVED),
      name: item.certificate?.name || (normalizedStatus === NORMALIZED_STATUS.APPROVED ? `${item.name} Certificate` : null),
      number: item.certificate?.number || null,
      issuedAt: item.certificate?.issuedAt || null,
      validUntil: item.certificate?.validUntil || null,
      downloadUrl: item.certificate?.downloadUrl || '#',
    },
    actionRequired: {
      required: Boolean(item.actionRequired?.required || normalizedStatus === NORMALIZED_STATUS.ACTION_REQUIRED),
      type: item.actionRequired?.type || null,
      message: item.actionRequired?.message || null,
      deadline: item.actionRequired?.deadline || null,
      daysRemaining: item.actionRequired?.daysRemaining || null,
      actionUrl: item.actionRequired?.actionUrl || null,
    },
    portalId: item.portalId || null,
    officialUrl: item.officialUrl || null,
    sla: item.sla || { durationDays: 30 },
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

/**
 * Retrieve all monitored approvals from local storage or return pre-seeded defaults
 */
export function getApprovals() {
  if (typeof localStorage === 'undefined') {
    return isCleanMode() ? [] : DEFAULT_MONITORED_APPROVALS;
  }
  const storageKey = getApprovalsStorageKey();
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      if (isCleanMode()) {
        return [];
      }
      localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(DEFAULT_MONITORED_APPROVALS));
      return DEFAULT_MONITORED_APPROVALS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return isCleanMode() ? [] : DEFAULT_MONITORED_APPROVALS;
    }
    if (!isCleanMode() && parsed.length === 0) {
      localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(DEFAULT_MONITORED_APPROVALS));
      return DEFAULT_MONITORED_APPROVALS;
    }
    return parsed.map(normalizeApprovalRecord);
  } catch (err) {
    console.error('Error reading approvals from localStorage:', err);
    return isCleanMode() ? [] : DEFAULT_MONITORED_APPROVALS;
  }
}

/**
 * Find a specific approval by its unique ID
 */
export function getApprovalById(id) {
  if (!id) return null;
  const approvals = getApprovals();
  return approvals.find((a) => a.id === id || a.approvalId === id) || null;
}

/**
 * Reset local approvals back to default pre-seeded monitoring dataset
 */
export function resetApprovalsToDefault() {
  if (typeof localStorage === 'undefined') return DEFAULT_MONITORED_APPROVALS;
  localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(DEFAULT_MONITORED_APPROVALS));
  window.dispatchEvent(new Event('storage'));
  return DEFAULT_MONITORED_APPROVALS;
}

/**
 * Track a new application ID entered by the entrepreneur
 */
export function trackNewApplication({ approvalName, authorityName, applicationId, monitoringSource = 'NSWS', portalId, officialUrl }) {
  if (typeof localStorage === 'undefined') return null;
  const storageKey = getApprovalsStorageKey();
  const approvals = getApprovals();
  const nextNum = approvals.length + 1;
  const id = `APR-${String(nextNum).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newRecord = normalizeApprovalRecord({
    id,
    approvalId: portalId || id,
    name: approvalName,
    category: 'Business',
    authority: {
      name: authorityName,
      department: '',
      jurisdiction: 'State',
      state: 'Odisha',
    },
    application: {
      applicationId,
      submittedAt: now,
      submissionDate: 'Today',
      status: 'Submitted',
    },
    monitoring: {
      source: monitoringSource,
      connectionStatus: 'CONNECTED',
      lastCheckedAt: now,
    },
    status: {
      normalized: NORMALIZED_STATUS.UNDER_PROCESS,
      sourceStatus: 'Application Submitted',
      currentStage: 'Document Verification',
      changedAt: now,
    },
    timeline: [
      { date: 'Today', stage: 'Application Tracked', detail: `Linked application ID ${applicationId} to NiveshSetu monitor.`, status: 'COMPLETED' },
    ],
    portalId,
    officialUrl,
  });

  const updated = [newRecord, ...approvals];
  localStorage.setItem(storageKey, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  return newRecord;
}

/**
 * Simulate a government status change for live demonstrations
 */
export function simulateStatusTransition(approvalId, newNormalizedStatus, newSourceStatus, extra = {}) {
  if (typeof localStorage === 'undefined') return null;
  const approvals = getApprovals();
  const index = approvals.findIndex((a) => a.id === approvalId || a.approvalId === approvalId);
  if (index === -1) return null;

  const current = approvals[index];
  const now = new Date().toISOString();

  let actionRequired = { required: false, message: null, deadline: null };
  let certificate = { ...current.certificate };

  if (newNormalizedStatus === NORMALIZED_STATUS.ACTION_REQUIRED) {
    actionRequired = {
      required: true,
      type: 'DEFICIENCY_QUERY',
      message: extra.message || 'Department has raised a query regarding statutory submission details.',
      deadline: extra.deadline || '15 Sep 2026',
      daysRemaining: 5,
      actionUrl: current.officialUrl,
    };
  } else if (newNormalizedStatus === NORMALIZED_STATUS.APPROVED) {
    certificate = {
      available: true,
      name: `${current.name} Statutory Certificate`,
      number: `OD-CERT-${Math.floor(10000 + Math.random() * 90000)}`,
      issuedAt: 'Today',
      validUntil: '31 Dec 2027',
      downloadUrl: '#',
    };
  }

  const updated = {
    ...current,
    status: {
      normalized: newNormalizedStatus,
      sourceStatus: newSourceStatus || newNormalizedStatus,
      currentStage: extra.stage || newSourceStatus || newNormalizedStatus,
      changedAt: now,
    },
    monitoring: {
      ...current.monitoring,
      lastCheckedAt: now,
    },
    actionRequired,
    certificate,
    updatedAt: now,
  };

  approvals[index] = updated;
  localStorage.setItem(getApprovalsStorageKey(), JSON.stringify(approvals));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
  return updated;
}

/**
 * Save an approval (backward compatibility)
 */
export function saveApproval(formData, _user = null) {
  if (typeof localStorage === 'undefined') return null;
  const storageKey = getApprovalsStorageKey();
  const approvals = getApprovals();
  const now = new Date().toISOString();

  if (formData.id) {
    const index = approvals.findIndex((a) => a.id === formData.id);
    if (index !== -1) {
      const updated = normalizeApprovalRecord({
        ...approvals[index],
        ...formData,
        updatedAt: now,
      });
      approvals[index] = updated;
      localStorage.setItem(storageKey, JSON.stringify(approvals));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      return updated;
    }
  }

  const nextNum = approvals.length + 1;
  const id = formData.id || `APR-${String(nextNum).padStart(3, '0')}`;
  const newRecord = normalizeApprovalRecord({
    ...formData,
    id,
    createdAt: now,
    updatedAt: now,
  });
  approvals.push(newRecord);
  localStorage.setItem(storageKey, JSON.stringify(approvals));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
  return newRecord;
}

/**
 * Delete an approval by ID
 */
export function deleteApproval(id) {
  if (typeof localStorage === 'undefined') return false;
  const storageKey = getApprovalsStorageKey();
  const approvals = getApprovals();
  const filtered = approvals.filter((a) => a.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(filtered));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
  return true;
}

function isValidUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Supabase async helpers for live cloud synchronization
 */
export async function getApprovalsFromSupabase(userId = null) {
  const localApprovals = getApprovals();
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) {
    return localApprovals;
  }

  try {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notice from Supabase getApprovalsFromSupabase:', error.message);
      return localApprovals;
    }

    if (data && data.length > 0) {
      const mapped = data.map((row) => ({
        id: row.id,
        approvalId: row.code || row.id,
        name: row.name,
        category: row.category || 'Other',
        authority: {
          name: row.issuing_authority || row.department,
          department: row.department,
          jurisdiction: 'State',
          state: 'Odisha',
        },
        application: {
          applicationId: row.reference_number || row.id,
          submittedAt: row.applied_date,
          submissionDate: row.applied_date,
          status: row.status === 'APPROVED' ? 'Approved' : 'In Scrutiny',
        },
        monitoring: {
          source: 'NSWS',
          connectionStatus: 'CONNECTED',
          lastCheckedAt: row.updated_at,
        },
        status: {
          normalized: row.status,
          sourceStatus: row.stage || row.status,
          currentStage: row.stage || row.status,
          changedAt: row.updated_at,
        },
        sla: { durationDays: row.sla_days || 30 },
        certificate: row.remarks ? { number: row.remarks, available: true } : null,
        timeline: Array.isArray(row.timeline) && row.timeline.length > 0 ? row.timeline : [
          { date: row.applied_date || 'Recently', stage: 'Application Submitted', detail: 'Application filed in single window.', status: 'COMPLETED' }
        ],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      const cloudIds = new Set(mapped.map((m) => m.id));
      const combined = [...mapped, ...localApprovals.filter((l) => !cloudIds.has(l.id))];
      try {
        localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(combined));
      } catch (e) {
        console.warn('Local caching notice:', e);
      }
      return combined;
    }
  } catch (err) {
    console.error('Error in getApprovalsFromSupabase:', err);
  }
  return localApprovals;
}

export async function saveApprovalToSupabase(formData, user = null) {
  const localRecord = saveApproval(formData, user);
  if (!isSupabaseConfigured || !supabase || !isValidUUID(user?.id)) {
    return localRecord;
  }

  try {
    const payload = {
      id: localRecord.id,
      user_id: user.id,
      business_id: user.businessId || user.businessName || 'BUS-2026-0001',
      name: localRecord.name,
      code: localRecord.approvalId || localRecord.id,
      department: localRecord.authority?.department || localRecord.authority?.name || 'Department of Industries',
      category: localRecord.category || 'Factory',
      stage: localRecord.status?.currentStage || 'Document Scrutiny',
      status: localRecord.status?.normalized || 'UNDER_PROCESS',
      priority: 'HIGH',
      sla_days: localRecord.sla?.durationDays || 30,
      applied_date: new Date().toISOString().split('T')[0],
      approved_date: localRecord.status?.normalized === 'APPROVED' ? new Date().toISOString().split('T')[0] : null,
      expiry_date: localRecord.certificate?.validUntil || null,
      fee: 2500,
      fee_status: 'PAID',
      reference_number: localRecord.application?.applicationId || localRecord.id,
      issuing_authority: localRecord.authority?.name || 'Directorate of Industries',
      remarks: localRecord.certificate?.number || localRecord.actionRequired?.message || '',
      dependencies: [],
      required_documents: [],
      timeline: localRecord.timeline || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('approvals').upsert(payload);
    if (error) {
      console.warn('Supabase approvals upsert notice:', error.message);
    }
  } catch (err) {
    console.error('Error saving approval to Supabase:', err);
  }
  return localRecord;
}

export async function deleteApprovalFromSupabase(id, user = null) {
  deleteApproval(id);
  if (!isSupabaseConfigured || !supabase || !isValidUUID(user?.id)) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('approvals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) console.warn('Supabase approval delete notice:', error.message);
  } catch (err) {
    console.error('Error deleting approval from Supabase:', err);
  }
  return true;
}
