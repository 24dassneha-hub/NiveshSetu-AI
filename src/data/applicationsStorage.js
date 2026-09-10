/**
 * Centralized local persistence and data contracts for Business Applications.
 * 
 * Future Backend Architecture:
 * - Direct mapping to PostgreSQL tables 'applications', 'application_documents', 'application_queries', 'application_timeline'
 * - REST endpoints:
 *   - GET    /api/v1/businesses/{businessId}/applications
 *   - POST   /api/v1/businesses/{businessId}/applications
 *   - GET    /api/v1/applications/{id}
 *   - PUT    /api/v1/applications/{id}
 *   - DELETE /api/v1/applications/{id}
 *   - POST   /api/v1/applications/{id}/submit
 *   - POST   /api/v1/applications/{id}/withdraw
 *   - POST   /api/v1/applications/{id}/queries/{queryId}/respond
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { isCleanMode, USER_APPLICATIONS_KEY } from './appModeState.js';

export const APPLICATIONS_STORAGE_KEY = 'niveshsetu_applications';

export function getApplicationsStorageKey() {
  return isCleanMode() ? USER_APPLICATIONS_KEY : APPLICATIONS_STORAGE_KEY;
}

export const APPLICATION_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: '#8B8982', bg: 'rgba(139,137,130,0.12)' },
  { value: 'READY_TO_SUBMIT', label: 'Ready to Submit', color: '#18324A', bg: 'rgba(24,50,74,0.12)' },
  { value: 'SUBMITTED', label: 'Submitted', color: '#18324A', bg: 'rgba(24,50,74,0.12)' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: '#C08A3E', bg: 'rgba(192,138,62,0.12)' },
  { value: 'QUERY_RAISED', label: 'Query Raised', color: '#B85C4A', bg: 'rgba(184,92,74,0.12)' },
  { value: 'INSPECTION_PENDING', label: 'Inspection Pending', color: '#C08A3E', bg: 'rgba(192,138,62,0.12)' },
  { value: 'DECISION_PENDING', label: 'Decision Pending', color: '#C08A3E', bg: 'rgba(192,138,62,0.12)' },
  { value: 'APPROVED', label: 'Approved', color: '#5D8068', bg: 'rgba(93,128,104,0.12)' },
  { value: 'REJECTED', label: 'Rejected', color: '#B85C4A', bg: 'rgba(184,92,74,0.12)' },
  { value: 'WITHDRAWN', label: 'Withdrawn', color: '#8B8982', bg: 'rgba(139,137,130,0.12)' },
];

export const APPLICATION_MODES = [
  'Online',
  'Offline',
  'Department Portal',
  'Physical Submission',
  'Other',
];

export const QUERY_STATUSES = ['OPEN', 'RESPONDED', 'RESOLVED', 'OVERDUE'];

export const INSPECTION_STATUSES = [
  'NOT_REQUIRED',
  'REQUIRED',
  'REQUESTED',
  'SCHEDULED',
  'COMPLETED',
  'FAILED',
  'RESCHEDULED',
];

export const SORT_OPTIONS = [
  'Recently Updated',
  'Submitted Date (Newest)',
  'Submitted Date (Oldest)',
  'Deadline (Earliest)',
  'Application ID',
  'Status',
];

export const ACTIVE_APPLICATION_STATUSES = [
  'READY_TO_SUBMIT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'QUERY_RAISED',
  'INSPECTION_PENDING',
  'DECISION_PENDING',
];

/**
 * Check if an active application already exists for an approval
 */
export function checkDuplicateActiveApplication(approvalId, applications = null, currentAppId = null) {
  if (!approvalId) return null;
  const list = Array.isArray(applications) ? applications : getApplications();
  return list.find(
    (app) =>
      app.approvalId === approvalId &&
      app.id !== currentAppId &&
      ACTIVE_APPLICATION_STATUSES.includes(app.status)
  ) || null;
}

/**
 * Deterministic Next Action Engine
 */
export function deriveNextAction(application) {
  if (!application) return '—';
  switch (application.status) {
    case 'DRAFT':
      return 'Continue Application';
    case 'READY_TO_SUBMIT':
      return 'Submit Application';
    case 'QUERY_RAISED':
      return 'Respond to Query';
    case 'INSPECTION_PENDING':
      return 'View Inspection';
    case 'UNDER_REVIEW':
      return 'Under Authority Scrutiny';
    case 'DECISION_PENDING':
      return 'Awaiting Final Decision';
    case 'APPROVED':
      return 'View Approval Certificate';
    case 'REJECTED':
      return 'View Decision Notice';
    case 'WITHDRAWN':
      return 'Application Withdrawn';
    case 'SUBMITTED':
      return 'Await Scrutiny';
    default:
      return 'View Details';
  }
}

/**
 * Calculate SLA status deterministically
 */
export function calculateSLAStatus(application) {
  if (!application) return 'NOT_APPLICABLE';
  if (['APPROVED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) {
    return 'COMPLETED';
  }
  if (!application.sla?.deadline) {
    return 'NOT_APPLICABLE';
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(application.sla.deadline);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'BREACHED';
  if (diffDays <= 5) return 'AT_RISK';
  return 'ON_TRACK';
}

/**
 * Calculate Application Readiness
 */
export function calculateApplicationReadiness(application, approval, documents = []) {
  const blockingIssues = [];
  const requiredDocs = approval?.documents || [];
  const totalRequired = requiredDocs.length;

  let availableDocsCount = 0;
  const missingDocs = [];

  requiredDocs.forEach((docRequirement) => {
    // Look for matching document in user's documents
    const match = documents.find(
      (d) =>
        (d.approvalId === approval?.id || (application?.documentIds || []).includes(d.id)) &&
        (d.name?.toLowerCase().trim() === docRequirement.name?.toLowerCase().trim() ||
          d.id === docRequirement.id)
    );

    if (match && (match.status === 'UPLOADED' || match.status === 'VERIFIED' || match.file?.name)) {
      availableDocsCount += 1;
    } else {
      missingDocs.push(docRequirement.name);
      blockingIssues.push(`Missing required document: ${docRequirement.name}`);
    }
  });

  // Check required application form fields
  if (!application?.title?.trim()) {
    blockingIssues.push('Application Title is required.');
  }
  if (!application?.applicant?.name?.trim()) {
    blockingIssues.push('Applicant Name is required.');
  }

  const percentage =
    totalRequired > 0
      ? Math.min(100, Math.round((availableDocsCount / totalRequired) * 100))
      : 100;

  const canSubmit = blockingIssues.length === 0;

  return {
    requiredDocuments: totalRequired,
    availableDocuments: availableDocsCount,
    missingDocuments: missingDocs.length,
    missingDocumentNames: missingDocs,
    completionPercentage: percentage,
    blockingIssues,
    canSubmit,
  };
}

/**
 * Retrieve all applications from local storage
 */
export function getApplications() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const key = getApplicationsStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading applications from localStorage:', err);
    return [];
  }
}

/**
 * Find a specific application by its unique ID
 */
export function getApplicationById(id) {
  if (!id) return null;
  const apps = getApplications();
  return apps.find((a) => a.id === id) || null;
}

/**
 * Generate sequential application ID (APP-YYYY-NNNNN)
 */
export function getNextApplicationId(existingApps = []) {
  const currentYear = new Date().getFullYear();
  const ids = existingApps
    .map((a) => {
      const match = (a.id || '').match(/APP-\d{4}-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  const nextNum = maxId > 0 ? maxId + 1 : 421; // start realistically at 421 if fresh
  return `APP-${currentYear}-${String(nextNum).padStart(5, '0')}`;
}

/**
 * Calculate dynamic application metrics
 */
export function calculateApplicationMetrics(applications = null) {
  const list = Array.isArray(applications) ? applications : getApplications();
  const total = list.length;
  const drafts = list.filter((a) => a.status === 'DRAFT' || a.status === 'READY_TO_SUBMIT').length;
  const underReview = list.filter(
    (a) => a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED' || a.status === 'DECISION_PENDING'
  ).length;
  const actionRequired = list.filter(
    (a) =>
      a.status === 'QUERY_RAISED' ||
      (a.status === 'DRAFT' && a.readiness?.missingDocuments > 0)
  ).length;
  const inspectionPending = list.filter((a) => a.status === 'INSPECTION_PENDING').length;
  const approved = list.filter((a) => a.status === 'APPROVED').length;

  return {
    total,
    drafts,
    underReview,
    actionRequired,
    inspectionPending,
    approved,
  };
}

/**
 * Save an application (create new draft or update existing)
 */
export function saveApplication(formData, user = null) {
  if (typeof localStorage === 'undefined') return null;
  const apps = getApplications();
  const now = new Date().toISOString();

  // If editing an existing application
  if (formData.id) {
    const index = apps.findIndex((a) => a.id === formData.id);
    if (index !== -1) {
      const existing = apps[index];

      // Historical protection: If already submitted, prevent arbitrary metadata modification
      if (['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'].includes(existing.status) && formData.status === existing.status) {
        // Only allow safe updates (e.g. notes or internal fields)
        formData = {
          ...existing,
          notes: formData.notes !== undefined ? formData.notes : existing.notes,
        };
      }

      const updated = {
        ...existing,
        ...formData,
        updatedAt: now,
      };

      apps[index] = updated;
      try {
        localStorage.setItem(getApplicationsStorageKey(), JSON.stringify(apps));
      } catch (e) {
        console.error('Failed to update application in localStorage:', e);
      }
      return updated;
    }
  }

  // Create new application
  const newId = getNextApplicationId(apps);
  const initialTimeline = [
    {
      id: `evt-${Date.now()}-1`,
      applicationId: newId,
      type: 'CREATED',
      title: 'Application Created',
      description: `Draft created for approval: ${formData.approvalName || formData.approvalId}`,
      timestamp: now,
      actor: user?.name || 'Applicant',
    },
  ];

  const newRecord = {
    id: newId,
    businessId: user?.businessId || user?.businessName || user?.id || user?.email || 'BUS-2026-0001',
    approvalId: formData.approvalId,
    title: formData.title || `${formData.approvalName || 'Compliance'} Application`,
    applicant: {
      name: formData.applicant?.name || user?.name || (isCleanMode() ? '' : 'Omm Enterprises'),
      contactName: formData.applicant?.contactName || '',
      contactEmail: formData.applicant?.contactEmail || user?.email || '',
      contactPhone: formData.applicant?.contactPhone || '',
    },
    authority: {
      name: formData.authority?.name || '',
      department: formData.authority?.department || '',
      jurisdiction: formData.authority?.jurisdiction || 'Odisha',
      state: formData.authority?.state || 'Odisha',
    },
    submission: {
      mode: formData.submission?.mode || 'ONLINE',
      referenceNumber: formData.submission?.referenceNumber || null,
      submittedAt: null,
    },
    status: 'DRAFT',
    currentStage: 'DRAFT',
    documentIds: Array.isArray(formData.documentIds) ? formData.documentIds : [],
    readiness: formData.readiness || {
      requiredDocuments: 0,
      availableDocuments: 0,
      missingDocuments: 0,
      percentage: 0,
    },
    sla: {
      durationDays: formData.sla?.durationDays || 30,
      startDate: null,
      expectedDecisionDate: formData.sla?.expectedDecisionDate || null,
      deadline: formData.sla?.deadline || null,
      status: 'NOT_APPLICABLE',
    },
    inspection: {
      required: Boolean(formData.inspection?.required),
      status: formData.inspection?.required ? 'REQUIRED' : 'NOT_REQUIRED',
      scheduledDate: formData.inspection?.scheduledDate || null,
      location: formData.inspection?.location || null,
      authority: formData.inspection?.authority || null,
      notes: formData.inspection?.notes || null,
    },
    queries: [],
    timeline: initialTimeline,
    decision: {
      outcome: null,
      decidedAt: null,
      reason: null,
    },
    notes: formData.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  apps.unshift(newRecord);
  try {
    localStorage.setItem(getApplicationsStorageKey(), JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save new application in localStorage:', e);
  }
  return newRecord;
}

/**
 * Submit an application formally
 */
export function submitApplication(id, user = null) {
  if (typeof localStorage === 'undefined' || !id) return null;
  const apps = getApplications();
  const index = apps.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const app = apps[index];
  const now = new Date().toISOString();

  // Calculate default deadline from SLA days (e.g. 30 days)
  const slaDays = app.sla?.durationDays || 30;
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + slaDays);
  const deadlineStr = deadlineDate.toISOString().split('T')[0];

  const updated = {
    ...app,
    status: 'SUBMITTED',
    currentStage: 'SUBMITTED',
    submission: {
      ...app.submission,
      submittedAt: now,
    },
    sla: {
      ...app.sla,
      startDate: now.split('T')[0],
      deadline: app.sla?.deadline || deadlineStr,
      status: 'ON_TRACK',
    },
    updatedAt: now,
    timeline: [
      {
        id: `evt-${Date.now()}`,
        applicationId: id,
        type: 'SUBMITTED',
        title: 'Application Formally Submitted',
        description: 'Application details and statutory filings submitted for departmental scrutiny.',
        timestamp: now,
        actor: user?.name || 'Applicant',
      },
      ...(app.timeline || []),
    ],
  };

  apps[index] = updated;
  try {
    localStorage.setItem(getApplicationsStorageKey(), JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to submit application in localStorage:', e);
  }
  return updated;
}

/**
 * Respond to an open Query
 */
export function respondToQuery(appId, queryId, responseText, supportingDocId = null, user = null) {
  if (typeof localStorage === 'undefined' || !appId || !queryId) return null;
  const apps = getApplications();
  const index = apps.findIndex((a) => a.id === appId);
  if (index === -1) return null;

  const app = apps[index];
  const now = new Date().toISOString();

  const updatedQueries = (app.queries || []).map((q) => {
    if (q.id === queryId) {
      return {
        ...q,
        status: 'RESPONDED',
        response: responseText,
        supportingDocId: supportingDocId || q.supportingDocId || null,
        respondedAt: now,
      };
    }
    return q;
  });

  const updated = {
    ...app,
    status: 'UNDER_REVIEW',
    currentStage: 'UNDER_REVIEW',
    queries: updatedQueries,
    updatedAt: now,
    timeline: [
      {
        id: `evt-${Date.now()}`,
        applicationId: appId,
        type: 'QUERY_RESPONDED',
        title: 'Query Clarification Submitted',
        description: `Response submitted: "${(responseText || '').slice(0, 100)}${(responseText || '').length > 100 ? '...' : ''}"`,
        timestamp: now,
        actor: user?.name || 'Applicant',
      },
      ...(app.timeline || []),
    ],
  };

  apps[index] = updated;
  try {
    localStorage.setItem(getApplicationsStorageKey(), JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to respond to query in localStorage:', e);
  }
  return updated;
}

/**
 * Withdraw an application
 */
export function withdrawApplication(id, reason = 'Withdrawn by applicant', user = null) {
  if (typeof localStorage === 'undefined' || !id) return null;
  const apps = getApplications();
  const index = apps.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const app = apps[index];
  const now = new Date().toISOString();

  const updated = {
    ...app,
    status: 'WITHDRAWN',
    currentStage: 'WITHDRAWN',
    updatedAt: now,
    timeline: [
      {
        id: `evt-${Date.now()}`,
        applicationId: id,
        type: 'WITHDRAWN',
        title: 'Application Withdrawn',
        description: `Applicant withdrew the filing. Reason: ${reason}`,
        timestamp: now,
        actor: user?.name || 'Applicant',
      },
      ...(app.timeline || []),
    ],
  };

  apps[index] = updated;
  try {
    localStorage.setItem(getApplicationsStorageKey(), JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to withdraw application in localStorage:', e);
  }
  return updated;
}

/**
 * Delete draft application (only permitted for DRAFT status)
 */
export function deleteDraftApplication(id) {
  if (typeof localStorage === 'undefined' || !id) return false;
  const apps = getApplications();
  const target = apps.find((a) => a.id === id);
  if (!target || target.status !== 'DRAFT') {
    return false;
  }

  const filtered = apps.filter((a) => a.id !== id);
  try {
    localStorage.setItem(getApplicationsStorageKey(), JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete draft application from localStorage:', e);
    return false;
  }
}

/**
 * Export applications as CSV
 */
export function exportApplicationsCSV(applications = [], approvalsMap = {}) {
  const headers = [
    'Application ID',
    'Title',
    'Approval Name',
    'Authority',
    'Department',
    'Status',
    'Submission Mode',
    'Submitted Date',
    'Deadline',
    'Next Action',
  ];

  const rows = applications.map((app) => [
    app.id,
    `"${(app.title || '').replace(/"/g, '""')}"`,
    `"${(approvalsMap[app.approvalId] || app.approvalId || '').replace(/"/g, '""')}"`,
    `"${(app.authority?.name || '').replace(/"/g, '""')}"`,
    `"${(app.authority?.department || '').replace(/"/g, '""')}"`,
    app.status,
    app.submission?.mode || 'ONLINE',
    app.submission?.submittedAt ? app.submission.submittedAt.split('T')[0] : '—',
    app.sla?.deadline || '—',
    `"${deriveNextAction(app).replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `niveshsetu_applications_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Sample realistic applications for demo evaluation
 */
export const SAMPLE_APPLICATIONS = [
  {
    id: 'APP-2026-00421',
    businessId: 'BUS-2026-0001',
    approvalId: 'APR-001',
    title: 'Fire Safety Clearance (NOC) Filing',
    applicant: {
      name: 'Omm Enterprises',
      contactName: 'Sujit Patnaik',
      contactEmail: 'spatnaik@ommenterprises.com',
      contactPhone: '+91 94370 12345',
    },
    authority: {
      name: 'Odisha Fire Services',
      department: 'Fire Services Directorate',
      jurisdiction: 'Bhubaneswar',
      state: 'Odisha',
    },
    submission: {
      mode: 'ONLINE',
      referenceNumber: 'OFS/BBSR/2026/0881',
      submittedAt: '2026-09-01T10:15:00Z',
    },
    status: 'QUERY_RAISED',
    currentStage: 'QUERY_RAISED',
    documentIds: ['DOC-2026-0001'],
    readiness: {
      requiredDocuments: 3,
      availableDocuments: 2,
      missingDocuments: 1,
      percentage: 67,
    },
    sla: {
      durationDays: 15,
      startDate: '2026-09-01',
      expectedDecisionDate: '2026-09-16',
      deadline: '2026-09-16',
      status: 'AT_RISK',
    },
    inspection: {
      required: true,
      status: 'SCHEDULED',
      scheduledDate: '2026-09-14',
      location: 'Plot 42, Chandaka Industrial Estate, Bhubaneswar',
      authority: 'Divisional Fire Officer, Chandaka',
      notes: 'Ensure functional hydrants and sprinkler pump connectivity.',
    },
    queries: [
      {
        id: 'qry-1',
        applicationId: 'APP-2026-00421',
        subject: 'Clarification regarding secondary emergency exit width',
        description: 'The architectural layout indicates a 1.2m passage for exit #2, whereas industrial standards require 1.5m minimum clearance for units employing over 50 persons. Please provide revised drawing or mitigation rationale.',
        raisedAt: '2026-09-05T14:30:00Z',
        dueDate: '2026-09-12',
        status: 'OPEN',
        response: null,
        respondedAt: null,
      },
    ],
    timeline: [
      {
        id: 'evt-4',
        applicationId: 'APP-2026-00421',
        type: 'QUERY_RAISED',
        title: 'Scrutiny Query Raised by Fire Officer',
        description: 'Clarification requested regarding secondary emergency exit width.',
        timestamp: '2026-09-05T14:30:00Z',
        actor: 'Divisional Fire Officer',
      },
      {
        id: 'evt-3',
        applicationId: 'APP-2026-00421',
        type: 'INSPECTION_SCHEDULED',
        title: 'Site Inspection Slated',
        description: 'Inspection scheduled for 14 Sep 2026 at Chandaka Unit.',
        timestamp: '2026-09-03T11:00:00Z',
        actor: 'Odisha Fire Services',
      },
      {
        id: 'evt-2',
        applicationId: 'APP-2026-00421',
        type: 'STATUS_CHANGED',
        title: 'Application Moved to Under Review',
        description: 'Document scrutiny commenced at directorate.',
        timestamp: '2026-09-02T09:30:00Z',
        actor: 'System',
      },
      {
        id: 'evt-1',
        applicationId: 'APP-2026-00421',
        type: 'SUBMITTED',
        title: 'Application Submitted Online',
        description: 'Statutory filing submitted with application reference OFS/BBSR/2026/0881.',
        timestamp: '2026-09-01T10:15:00Z',
        actor: 'Omm Enterprises',
      },
    ],
    notes: 'Urgent priority for food unit commissioning.',
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-05T14:30:00Z',
  },
  {
    id: 'APP-2026-00418',
    businessId: 'BUS-2026-0001',
    approvalId: 'APR-002',
    title: 'Factory Operating License (Act 1948)',
    applicant: {
      name: 'Omm Enterprises',
      contactName: 'Sujit Patnaik',
      contactEmail: 'spatnaik@ommenterprises.com',
      contactPhone: '+91 94370 12345',
    },
    authority: {
      name: 'Directorate of Factories and Boilers',
      department: 'Labour & ESI Department',
      jurisdiction: 'Bhubaneswar',
      state: 'Odisha',
    },
    submission: {
      mode: 'ONLINE',
      referenceNumber: 'DFB/2026/FPU/109',
      submittedAt: '2026-08-20T11:45:00Z',
    },
    status: 'UNDER_REVIEW',
    currentStage: 'UNDER_REVIEW',
    documentIds: ['DOC-2026-0002'],
    readiness: {
      requiredDocuments: 2,
      availableDocuments: 2,
      missingDocuments: 0,
      percentage: 100,
    },
    sla: {
      durationDays: 30,
      startDate: '2026-08-20',
      expectedDecisionDate: '2026-09-19',
      deadline: '2026-09-20',
      status: 'ON_TRACK',
    },
    inspection: {
      required: true,
      status: 'REQUESTED',
      scheduledDate: null,
      location: 'Plot 42, Chandaka Industrial Estate',
      authority: null,
      notes: null,
    },
    queries: [],
    timeline: [
      {
        id: 'evt-21',
        applicationId: 'APP-2026-00418',
        type: 'STATUS_CHANGED',
        title: 'Technical Scrutiny in Progress',
        description: 'Machinery layout and electrical load scrutiny underway.',
        timestamp: '2026-08-25T10:00:00Z',
        actor: 'Inspector of Factories',
      },
      {
        id: 'evt-20',
        applicationId: 'APP-2026-00418',
        type: 'SUBMITTED',
        title: 'Factory License Filing Submitted',
        description: 'Submission acknowledged under reference DFB/2026/FPU/109.',
        timestamp: '2026-08-20T11:45:00Z',
        actor: 'Omm Enterprises',
      },
    ],
    notes: 'Awaiting inspector assignment for site layout check.',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'APP-2026-00411',
    businessId: 'BUS-2026-0001',
    approvalId: 'APR-003',
    title: 'Consent to Operate (CTO) — Green Category',
    applicant: {
      name: 'Omm Enterprises',
      contactName: 'Sujit Patnaik',
      contactEmail: 'spatnaik@ommenterprises.com',
      contactPhone: '+91 94370 12345',
    },
    authority: {
      name: 'State Pollution Control Board',
      department: 'Forest & Environment',
      jurisdiction: 'Bhubaneswar',
      state: 'Odisha',
    },
    submission: {
      mode: 'ONLINE',
      referenceNumber: 'SPCB/CTO/2026/552',
      submittedAt: '2026-08-05T09:15:00Z',
    },
    status: 'APPROVED',
    currentStage: 'APPROVED',
    documentIds: ['DOC-2026-0003'],
    readiness: {
      requiredDocuments: 1,
      availableDocuments: 1,
      missingDocuments: 0,
      percentage: 100,
    },
    sla: {
      durationDays: 30,
      startDate: '2026-08-05',
      expectedDecisionDate: '2026-08-30',
      deadline: '2026-09-04',
      status: 'COMPLETED',
    },
    inspection: {
      required: false,
      status: 'NOT_REQUIRED',
      scheduledDate: null,
      location: null,
      authority: null,
      notes: null,
    },
    queries: [],
    timeline: [
      {
        id: 'evt-32',
        applicationId: 'APP-2026-00411',
        type: 'DECISION_ISSUED',
        title: 'Consent to Operate (CTO) Granted',
        description: 'Consent order issued for 3-year operating validity.',
        timestamp: '2026-08-28T16:00:00Z',
        actor: 'Member Secretary, SPCB',
      },
      {
        id: 'evt-31',
        applicationId: 'APP-2026-00411',
        type: 'STATUS_CHANGED',
        title: 'Pollution Board Scrutiny Cleared',
        description: 'Air and water discharge compliance verified.',
        timestamp: '2026-08-15T11:30:00Z',
        actor: 'Regional Officer, SPCB',
      },
      {
        id: 'evt-30',
        applicationId: 'APP-2026-00411',
        type: 'SUBMITTED',
        title: 'Application Submitted Online',
        description: 'Online filing via Odisha Single Window Investor Portal.',
        timestamp: '2026-08-05T09:15:00Z',
        actor: 'Omm Enterprises',
      },
    ],
    decision: {
      outcome: 'APPROVED',
      decidedAt: '2026-08-28T16:00:00Z',
      reason: 'Effluent and acoustic norms comply with SPCB standards.',
    },
    notes: 'Annual environmental statement required in Form V by September 30.',
    createdAt: '2026-08-01T14:00:00Z',
    updatedAt: '2026-08-28T16:00:00Z',
  },
  {
    id: 'APP-2026-00408',
    businessId: 'BUS-2026-0001',
    approvalId: 'APR-004',
    title: 'Food Safety Hygiene & Manufacturing Permit',
    applicant: {
      name: 'Omm Enterprises',
      contactName: 'Sujit Patnaik',
      contactEmail: 'spatnaik@ommenterprises.com',
      contactPhone: '+91 94370 12345',
    },
    authority: {
      name: 'Food Safety and Standards Authority',
      department: 'Health & Family Welfare',
      jurisdiction: 'Odisha State',
      state: 'Odisha',
    },
    submission: {
      mode: 'ONLINE',
      referenceNumber: 'FSSAI/OD/2026/0991',
      submittedAt: '2026-08-12T10:00:00Z',
    },
    status: 'INSPECTION_PENDING',
    currentStage: 'INSPECTION_PENDING',
    documentIds: [],
    readiness: {
      requiredDocuments: 2,
      availableDocuments: 2,
      missingDocuments: 0,
      percentage: 100,
    },
    sla: {
      durationDays: 45,
      startDate: '2026-08-12',
      expectedDecisionDate: '2026-09-25',
      deadline: '2026-09-26',
      status: 'ON_TRACK',
    },
    inspection: {
      required: true,
      status: 'SCHEDULED',
      scheduledDate: '2026-09-18',
      location: 'Food Processing Workshop, Chandaka',
      authority: 'Designated Officer, Food Safety',
      notes: 'Physical audit of packaging zone and water potability test certificates.',
    },
    queries: [],
    timeline: [
      {
        id: 'evt-41',
        applicationId: 'APP-2026-00408',
        type: 'INSPECTION_SCHEDULED',
        title: 'Food Hygiene Audit Scheduled',
        description: 'Audit scheduled for 18 Sep 2026 at Chandaka unit.',
        timestamp: '2026-08-22T14:00:00Z',
        actor: 'FSSAI Regional Cell',
      },
      {
        id: 'evt-40',
        applicationId: 'APP-2026-00408',
        type: 'SUBMITTED',
        title: 'FSSAI Manufacturing License Application Submitted',
        description: 'Filing submitted with reference FSSAI/OD/2026/0991.',
        timestamp: '2026-08-12T10:00:00Z',
        actor: 'Omm Enterprises',
      },
    ],
    notes: 'Water test analysis report must be handed over in original to the inspector.',
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-22T14:00:00Z',
  },
  {
    id: 'APP-2026-00405',
    businessId: 'BUS-2026-0001',
    approvalId: 'APR-005',
    title: 'Boiler Operation Registration & Fitness Certificate',
    applicant: {
      name: 'Omm Enterprises',
      contactName: 'Sujit Patnaik',
      contactEmail: 'spatnaik@ommenterprises.com',
      contactPhone: '+91 94370 12345',
    },
    authority: {
      name: 'Directorate of Factories and Boilers',
      department: 'Boiler Inspection Directorate',
      jurisdiction: 'Bhubaneswar',
      state: 'Odisha',
    },
    submission: {
      mode: 'ONLINE',
      referenceNumber: null,
      submittedAt: null,
    },
    status: 'DRAFT',
    currentStage: 'DRAFT',
    documentIds: [],
    readiness: {
      requiredDocuments: 2,
      availableDocuments: 1,
      missingDocuments: 1,
      percentage: 50,
    },
    sla: {
      durationDays: 20,
      startDate: null,
      expectedDecisionDate: null,
      deadline: null,
      status: 'NOT_APPLICABLE',
    },
    inspection: {
      required: true,
      status: 'NOT_REQUIRED',
      scheduledDate: null,
      location: null,
      authority: null,
      notes: null,
    },
    queries: [],
    timeline: [
      {
        id: 'evt-50',
        applicationId: 'APP-2026-00405',
        type: 'DRAFT_CREATED',
        title: 'Draft Application Initialized',
        description: 'Filing draft created by applicant.',
        timestamp: '2026-09-02T16:00:00Z',
        actor: 'Omm Enterprises',
      },
    ],
    notes: 'Draft waiting for hydraulic test certificate from certified boiler maker.',
    createdAt: '2026-09-02T16:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
  },
];

/**
 * Seed sample applications for demo testing
 */
export function seedSampleApplications(user = null) {
  if (typeof localStorage === 'undefined') return [];
  if (isCleanMode()) return [];
  const existing = getApplications();
  if (existing.length > 0) return existing;

  const currentYear = new Date().getFullYear();
  const seeded = SAMPLE_APPLICATIONS.map((app, idx) => {
    const num = 421 - idx * 3;
    const now = new Date().toISOString();
    return {
      ...app,
      id: `APP-${currentYear}-${String(num).padStart(5, '0')}`,
      businessId: user?.businessId || user?.businessName || user?.id || user?.email || 'BUS-2026-0001',
      createdAt: app.createdAt || now,
      updatedAt: app.updatedAt || now,
    };
  });

  try {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(seeded));
  } catch (e) {
    console.error('Failed to seed sample applications:', e);
  }
  return seeded;
}

function isValidUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Fetch applications from Supabase with local fallback
 */
export async function fetchApplicationsFromSupabase(userId = null) {
  if (!isSupabaseConfigured || !supabase) {
    return getApplications();
  }

  try {
    let query = supabase.from('applications').select('*').order('created_at', { ascending: false });
    if (userId && isValidUUID(userId)) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return getApplications();
    }

    const formatted = data.map((row) => ({
      id: row.id,
      businessId: row.business_id,
      formType: row.form_type,
      title: row.title,
      department: row.department,
      status: row.status,
      currentStage: row.stage || 'SUBMITTED',
      progressPercent: row.progress_percent || 0,
      submission: {
        submittedAt: row.submission_date,
      },
      applicant: row.applicant_info || {},
      formData: row.form_data || {},
      documents: row.attached_documents || [],
      timeline: row.timeline || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    try {
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(formatted));
    } catch {}

    return formatted;
  } catch (err) {
    console.error('Error fetching applications from Supabase:', err);
    return getApplications();
  }
}

/**
 * Save application to Supabase and local cache
 */
export async function saveApplicationToSupabase(formData, user = null) {
  const localSaved = saveApplication(formData, user);

  if (!isSupabaseConfigured || !supabase || !isValidUUID(user?.id)) {
    return localSaved;
  }

  try {
    const payload = {
      id: localSaved.id,
      user_id: user.id,
      business_id: user.businessId || user.businessName || 'BUS-2026-0001',
      form_type: localSaved.formType || 'CAF',
      title: localSaved.title || 'Composite Application Form',
      department: localSaved.department || 'Industries Department',
      status: localSaved.status || 'DRAFT',
      submission_date: localSaved.submission?.submittedAt || null,
      target_completion_date: localSaved.sla?.deadline || null,
      stage: localSaved.currentStage || 'DRAFT',
      progress_percent: localSaved.progressPercent || 10,
      applicant_info: localSaved.applicant || {},
      form_data: localSaved.formData || {},
      attached_documents: localSaved.documents || [],
      timeline: localSaved.timeline || [],
      updated_at: new Date().toISOString(),
    };

    await supabase.from('applications').upsert(payload);
  } catch (err) {
    console.error('Error saving application to Supabase:', err);
  }

  return localSaved;
}

/**
 * Delete application from Supabase and local cache
 */
export async function deleteApplicationFromSupabase(id) {
  deleteApplication(id);

  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  try {
    await supabase.from('applications').delete().eq('id', id);
    return true;
  } catch (err) {
    console.error('Error deleting application from Supabase:', err);
    return false;
  }
}
