/**
 * Centralized local persistence and data contracts for Business Documents.
 * 
 * Future Backend Architecture:
 * - Direct mapping to PostgreSQL tables 'documents', 'document_files', 'document_verifications'
 * - REST endpoints:
 *   - GET    /api/v1/businesses/{businessId}/documents
 *   - POST   /api/v1/businesses/{businessId}/documents
 *   - GET    /api/v1/documents/{id}
 *   - PUT    /api/v1/documents/{id}
 *   - DELETE /api/v1/documents/{id}
 *   - POST   /api/v1/documents/{id}/upload
 */

import { supabase, isSupabaseConfigured, DOCUMENTS_BUCKET } from '../lib/supabaseClient.js';
import { isCleanMode, USER_DOCUMENTS_KEY } from './appModeState.js';

export const DOCUMENTS_STORAGE_KEY = 'niveshsetu_documents';

export function getDocumentsStorageKey() {
  return isCleanMode() ? USER_DOCUMENTS_KEY : DOCUMENTS_STORAGE_KEY;
}

export const DOCUMENT_TYPES = [
  { value: 'IDENTITY', label: 'Identity Proof' },
  { value: 'ADDRESS_PROOF', label: 'Address Proof' },
  { value: 'BUSINESS_REGISTRATION', label: 'Business Registration' },
  { value: 'OWNERSHIP', label: 'Ownership Document' },
  { value: 'LEASE', label: 'Lease Agreement' },
  { value: 'LAND', label: 'Land Document' },
  { value: 'BUILDING_PLAN', label: 'Building Plan' },
  { value: 'SITE_PLAN', label: 'Site Plan' },
  { value: 'FIRE_SAFETY', label: 'Fire Safety Plan' },
  { value: 'ENVIRONMENT', label: 'Environmental Document' },
  { value: 'POLLUTION', label: 'Pollution Control Report' },
  { value: 'FINANCIAL', label: 'Financial Statement' },
  { value: 'TAX', label: 'Tax Document' },
  { value: 'LABOUR', label: 'Labour Declaration' },
  { value: 'TECHNICAL', label: 'Technical Specification' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'LICENSE', label: 'License' },
  { value: 'NOC', label: 'No Objection Certificate (NOC)' },
  { value: 'DECLARATION', label: 'Declaration / Affidavit' },
  { value: 'OTHER', label: 'Other' },
];

export const DOCUMENT_STATUSES = [
  { value: 'REQUIRED', label: 'Required', color: '#8B8982', bg: 'rgba(139,137,130,0.12)' },
  { value: 'UPLOADED', label: 'Uploaded', color: '#18324A', bg: 'rgba(24,50,74,0.12)' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: '#C08A3E', bg: 'rgba(192,138,62,0.12)' },
  { value: 'VERIFIED', label: 'Verified', color: '#5D8068', bg: 'rgba(93,128,104,0.12)' },
  { value: 'REJECTED', label: 'Rejected', color: '#B85C4A', bg: 'rgba(184,92,74,0.12)' },
  { value: 'EXPIRED', label: 'Expired', color: '#B85C4A', bg: 'rgba(184,92,74,0.12)' },
];

export const VERIFICATION_STATUSES = [
  { value: 'NOT_VERIFIED', label: 'Not Verified', color: '#8B8982', bg: 'rgba(139,137,130,0.12)' },
  { value: 'PENDING', label: 'Pending', color: '#C08A3E', bg: 'rgba(192,138,62,0.12)' },
  { value: 'VERIFIED', label: 'Verified', color: '#5D8068', bg: 'rgba(93,128,104,0.12)' },
  { value: 'REJECTED', label: 'Rejected', color: '#B85C4A', bg: 'rgba(184,92,74,0.12)' },
];

export const EXPIRY_FILTER_OPTIONS = [
  'All',
  'No Expiry',
  'Expiring within 30 days',
  'Expired',
];

export const SORT_OPTIONS = [
  'Uploaded Date (Newest)',
  'Uploaded Date (Oldest)',
  'Document Name',
  'Expiry Date',
  'Status',
  'Verification Status',
];

/**
 * Format bytes to readable size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Calculate dynamic expiry status and label
 */
export function getExpiryInfo(doc) {
  if (!doc?.dates?.hasExpiry || !doc?.dates?.expiryDate) {
    return {
      status: 'No Expiry',
      label: 'No Expiry',
      badgeColor: '#8B8982',
      badgeBg: 'rgba(139,137,130,0.12)',
      isExpiringSoon: false,
      isExpired: false,
      daysRemaining: null,
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(doc.dates.expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      status: 'Expired',
      label: `Expired ${absDays === 1 ? '1 day ago' : `${absDays} days ago`}`,
      badgeColor: '#B85C4A',
      badgeBg: 'rgba(184,92,74,0.12)',
      isExpiringSoon: false,
      isExpired: true,
      daysRemaining: diffDays,
    };
  }

  if (diffDays <= 30) {
    return {
      status: 'Expiring Soon',
      label: diffDays === 0 ? 'Expires today' : `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
      badgeColor: '#C08A3E',
      badgeBg: 'rgba(192,138,62,0.12)',
      isExpiringSoon: true,
      isExpired: false,
      daysRemaining: diffDays,
    };
  }

  return {
    status: 'Valid',
    label: doc.dates.expiryDate,
    badgeColor: '#5D8068',
    badgeBg: 'rgba(93,128,104,0.12)',
    isExpiringSoon: false,
    isExpired: false,
    daysRemaining: diffDays,
  };
}

/**
 * Retrieve all documents from local storage
 */
export function getDocuments() {
  if (typeof localStorage === 'undefined') return isCleanMode() ? [] : SAMPLE_DOCUMENTS;
  const storageKey = getDocumentsStorageKey();
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      if (isCleanMode()) return [];
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(SAMPLE_DOCUMENTS));
      return SAMPLE_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return isCleanMode() ? [] : SAMPLE_DOCUMENTS;
    }
    if (!isCleanMode() && parsed.length === 0) {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(SAMPLE_DOCUMENTS));
      return SAMPLE_DOCUMENTS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading documents from localStorage:', err);
    return isCleanMode() ? [] : SAMPLE_DOCUMENTS;
  }
}

/**
 * Find a specific document by its unique ID
 */
export function getDocumentById(id) {
  if (!id) return null;
  const docs = getDocuments();
  return docs.find((d) => d.id === id) || null;
}

/**
 * Generate a sequential document identifier (e.g. DOC-2026-0001)
 */
export function getNextDocumentId(existingDocs = []) {
  const currentYear = new Date().getFullYear();
  const ids = existingDocs
    .map((d) => {
      const match = (d.id || '').match(/DOC-\d{4}-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  const nextNum = maxId + 1;
  return `DOC-${currentYear}-${String(nextNum).padStart(4, '0')}`;
}

/**
 * Calculate dynamic document metrics
 */
export function calculateDocumentMetrics(docs = []) {
  const total = docs.length;
  const uploaded = docs.filter((d) => d.status === 'UPLOADED' || Boolean(d.file?.name)).length;
  const verified = docs.filter(
    (d) => d.verification?.status === 'VERIFIED' || d.status === 'VERIFIED'
  ).length;
  const pendingVerification = docs.filter(
    (d) => d.verification?.status === 'PENDING' && d.status !== 'REJECTED'
  ).length;
  const missing = docs.filter((d) => d.status === 'REQUIRED' && !d.file?.name).length;
  const expiringSoon = docs.filter((d) => {
    const info = getExpiryInfo(d);
    return info.isExpiringSoon;
  }).length;

  return {
    total,
    uploaded,
    verified,
    pendingVerification,
    missing,
    expiringSoon,
  };
}

/**
 * Save a document (create or update)
 */
export function saveDocument(formData, user = null) {
  if (typeof localStorage === 'undefined') return null;
  const docs = getDocuments();
  const now = new Date().toISOString();

  // If editing an existing document
  if (formData.id) {
    const index = docs.findIndex((d) => d.id === formData.id);
    if (index !== -1) {
      const updated = {
        ...docs[index],
        ...formData,
        updatedAt: now,
      };
      docs[index] = updated;
      try {
        localStorage.setItem(getDocumentsStorageKey(), JSON.stringify(docs));
      } catch (e) {
        console.error('Failed to update document in localStorage:', e);
      }
      return updated;
    }
  }

  // Create new document
  const newId = getNextDocumentId(docs);
  const newRecord = {
    id: newId,
    businessId: user?.businessId || user?.businessName || user?.id || user?.email || 'BUS-2026-0001',
    name: formData.name ? formData.name.trim() : '',
    type: formData.type || 'OTHER',
    description: formData.description || '',
    documentNumber: formData.documentNumber ? formData.documentNumber.trim() : '',
    approvalId: formData.approvalId || null,

    file: formData.file
      ? {
          name: formData.file.name || '',
          type: formData.file.type || '',
          size: formData.file.size || 0,
          storageKey: formData.file.storageKey || null,
          url: formData.file.url || null,
        }
      : {
          name: '',
          type: '',
          size: 0,
          storageKey: null,
          url: null,
        },

    dates: {
      issueDate: formData.dates?.issueDate || null,
      expiryDate: formData.dates?.hasExpiry ? formData.dates?.expiryDate || null : null,
      hasExpiry: Boolean(formData.dates?.hasExpiry),
    },

    status: formData.status || 'UPLOADED',

    verification: {
      status: formData.verification?.status || 'PENDING',
      verifiedAt: formData.verification?.status === 'VERIFIED' ? now : null,
      verifiedBy: formData.verification?.status === 'VERIFIED' ? 'Designated Officer' : null,
      rejectionReason: formData.verification?.rejectionReason || null,
    },

    aiValidation: {
      status: 'NOT_RUN',
      score: null,
      issues: [],
      extractedData: {},
      validatedAt: null,
    },

    notes: formData.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  docs.unshift(newRecord);
  try {
    localStorage.setItem(getDocumentsStorageKey(), JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save new document in localStorage:', e);
  }
  return newRecord;
}

/**
 * Remove a document by ID
 */
export function deleteDocument(id) {
  if (typeof localStorage === 'undefined' || !id) return false;
  const docs = getDocuments();
  const filtered = docs.filter((d) => d.id !== id);
  try {
    localStorage.setItem(getDocumentsStorageKey(), JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete document from localStorage:', e);
    return false;
  }
}

/**
 * Upload a document file to Supabase Storage bucket ('documents')
 */
export async function uploadDocumentFileToStorage(file, userId = 'general') {
  if (!file) return null;

  if (!isSupabaseConfigured || !supabase) {
    let previewUrl = null;
    try {
      previewUrl = URL.createObjectURL(file);
    } catch {}
    return {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      filePath: `local/${Date.now()}_${file.name}`,
      url: previewUrl,
    };
  }

  const sanitizedName = (file.name || 'document').replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Failed to upload file to Supabase storage:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(DOCUMENTS_BUCKET)
    .getPublicUrl(data.path);

  return {
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    filePath: data.path,
    url: publicData?.publicUrl || null,
  };
}

/**
 * Fetch documents from Supabase with fallback to local cache
 */
export async function fetchDocumentsFromSupabase(userId = null) {
  if (!isSupabaseConfigured || !supabase) {
    return getDocuments();
  }

  try {
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (userId && isValidUUID(userId)) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Notice from Supabase fetchDocuments:', error.message);
      return getDocuments();
    }

    if (!data || data.length === 0) {
      return getDocuments();
    }

    const formattedDocs = data.map((row) => ({
      id: row.id,
      businessId: row.business_id || 'BUS-2026-0001',
      name: row.name || 'Untitled Document',
      type: row.type || 'OTHER',
      description: row.description || '',
      documentNumber: row.document_number || '',
      approvalId: row.approval_id || null,
      file: row.file_name
        ? {
            name: row.file_name,
            type: row.file_type || 'application/pdf',
            size: Number(row.file_size || 0),
            storageKey: row.file_path,
            url: row.file_url,
          }
        : null,
      dates: {
        issueDate: row.issue_date || null,
        expiryDate: row.expiry_date || null,
        hasExpiry: Boolean(row.has_expiry),
      },
      status: row.status || 'UPLOADED',
      verification: {
        status: row.verification_status || 'PENDING',
        verifiedAt: row.verified_at || null,
        verifiedBy: row.verified_by || null,
        rejectionReason: row.rejection_reason || null,
      },
      aiValidation: row.ai_validation || { status: 'NOT_RUN', score: null, issues: [], extractedData: {} },
      notes: row.notes || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    try {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(formattedDocs));
    } catch {}

    return formattedDocs;
  } catch (err) {
    console.error('Error fetching documents from Supabase:', err);
    return getDocuments();
  }
}

function isValidUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Save document to Supabase and update local cache
 */
export async function saveDocumentToSupabase(formData, user = null) {
  const localSaved = saveDocument(formData, user);

  if (!isSupabaseConfigured || !supabase || !isValidUUID(user?.id)) {
    return localSaved;
  }

  try {
    const payload = {
      id: localSaved.id,
      user_id: user.id,
      business_id: user.businessId || user.businessName || 'BUS-2026-0001',
      name: localSaved.name,
      type: localSaved.type,
      description: localSaved.description || '',
      document_number: localSaved.documentNumber || '',
      approval_id: localSaved.approvalId || null,
      file_name: localSaved.file?.name || null,
      file_type: localSaved.file?.type || null,
      file_size: localSaved.file?.size || 0,
      file_path: localSaved.file?.storageKey || null,
      file_url: localSaved.file?.url || null,
      has_expiry: Boolean(localSaved.dates?.hasExpiry),
      issue_date: localSaved.dates?.issueDate || null,
      expiry_date: localSaved.dates?.expiryDate || null,
      status: localSaved.status || 'UPLOADED',
      verification_status: localSaved.verification?.status || 'PENDING',
      verified_at: localSaved.verification?.verifiedAt || null,
      verified_by: localSaved.verification?.verifiedBy || null,
      rejection_reason: localSaved.verification?.rejectionReason || null,
      ai_validation: localSaved.aiValidation || { status: 'NOT_RUN' },
      notes: localSaved.notes || '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('documents')
      .upsert(payload);

    if (error) {
      console.warn('Failed to upsert document to Supabase:', error.message);
    }
  } catch (err) {
    console.error('Error in saveDocumentToSupabase:', err);
  }

  return localSaved;
}

/**
 * Delete document from Supabase and delete associated file from storage
 */
export async function deleteDocumentFromSupabase(id, user = null) {
  const doc = getDocumentById(id);

  deleteDocument(id);

  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  try {
    if (doc?.file?.storageKey) {
      await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.file.storageKey]);
    }

    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
      console.warn('Failed to delete document row from Supabase:', error.message);
    }
    return true;
  } catch (err) {
    console.error('Error deleting document from Supabase:', err);
    return false;
  }
}

/**
 * Realistic sample documents for demo seeding
 */
export const SAMPLE_DOCUMENTS = [
  {
    name: 'Fire Safety Plan',
    type: 'FIRE_SAFETY',
    description: 'Statutory fire evacuation drawing and equipment schedule.',
    documentNumber: 'FS-OD-2026-00128',
    approvalId: 'APR-001',
    file: {
      name: 'fire-safety-plan-chandaka.pdf',
      type: 'application/pdf',
      size: 2450000,
      storageKey: 'docs/chandaka/fire_safety_plan.pdf',
      url: null,
    },
    dates: {
      issueDate: '2026-09-01',
      expiryDate: null,
      hasExpiry: false,
    },
    status: 'UPLOADED',
    verification: {
      status: 'PENDING',
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
    },
    aiValidation: { status: 'NOT_RUN', score: null, issues: [], extractedData: {}, validatedAt: null },
    notes: 'Submitted for scrutiny under Odisha Fire Services Act.',
  },
  {
    name: 'Factory Building Plan',
    type: 'BUILDING_PLAN',
    description: 'Architectural structural plan certified by registered civil engineer.',
    documentNumber: 'FBP-BBSR-2026-90',
    approvalId: 'APR-002',
    file: {
      name: 'factory-structural-drawing.pdf',
      type: 'application/pdf',
      size: 4800000,
      storageKey: 'docs/chandaka/factory_plan.pdf',
      url: null,
    },
    dates: {
      issueDate: '2026-08-15',
      expiryDate: null,
      hasExpiry: false,
    },
    status: 'VERIFIED',
    verification: {
      status: 'VERIFIED',
      verifiedAt: '2026-08-28T14:30:00Z',
      verifiedBy: 'Chief Inspector of Factories',
      rejectionReason: null,
    },
    aiValidation: { status: 'NOT_RUN', score: null, issues: [], extractedData: {}, validatedAt: null },
    notes: 'Structural safety clearance approved without objections.',
  },
  {
    name: 'Pollution Control Report',
    type: 'POLLUTION',
    description: 'Effluent treatment analysis and stack emission audit report.',
    documentNumber: 'PCB-OD-2026-778',
    approvalId: 'APR-003',
    file: {
      name: 'effluent-analysis-q3.pdf',
      type: 'application/pdf',
      size: 1850000,
      storageKey: 'docs/chandaka/pollution_audit.pdf',
      url: null,
    },
    dates: {
      issueDate: '2026-08-01',
      expiryDate: '2026-09-20', // Expiring soon (< 30 days)
      hasExpiry: true,
    },
    status: 'UNDER_REVIEW',
    verification: {
      status: 'PENDING',
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
    },
    aiValidation: { status: 'NOT_RUN', score: null, issues: [], extractedData: {}, validatedAt: null },
    notes: 'Requires annual renewal before CTO inspection.',
  },
  {
    name: 'Land Ownership Document (Patta)',
    type: 'LAND',
    description: 'Record of Rights (RoR) registered with IDCO.',
    documentNumber: 'ROR-IDCO-PLOT-42',
    approvalId: 'APR-002',
    file: {
      name: 'idco-land-allotment-patta.pdf',
      type: 'application/pdf',
      size: 3100000,
      storageKey: 'docs/chandaka/land_patta.pdf',
      url: null,
    },
    dates: {
      issueDate: '2025-04-10',
      expiryDate: null,
      hasExpiry: false,
    },
    status: 'VERIFIED',
    verification: {
      status: 'VERIFIED',
      verifiedAt: '2026-05-12T11:00:00Z',
      verifiedBy: 'Revenue Authority',
      rejectionReason: null,
    },
    aiValidation: { status: 'NOT_RUN', score: null, issues: [], extractedData: {}, validatedAt: null },
    notes: '99-year industrial lease deed registered at Bhubaneswar Sub-Registrar.',
  },
  {
    name: 'GST Certificate (REG-06)',
    type: 'TAX',
    description: 'Goods and Services Tax registration certificate with Principal Place of Business.',
    documentNumber: 'GSTIN-21AAAFO1234F1Z9',
    approvalId: null,
    file: {
      name: 'gst-certificate-omm.pdf',
      type: 'application/pdf',
      size: 920000,
      storageKey: 'docs/tax/gst_cert.pdf',
      url: null,
    },
    dates: {
      issueDate: '2024-01-15',
      expiryDate: null,
      hasExpiry: false,
    },
    status: 'VERIFIED',
    verification: {
      status: 'VERIFIED',
      verifiedAt: '2026-01-20T10:00:00Z',
      verifiedBy: 'State Tax Officer',
      rejectionReason: null,
    },
    aiValidation: { status: 'NOT_RUN', score: null, issues: [], extractedData: {}, validatedAt: null },
    notes: 'Active GST registration for food processing manufacture.',
  },
  {
    name: 'PAN Card (Business Entity)',
    type: 'IDENTITY',
    description: 'Permanent Account Number issued by Income Tax Department.',
    documentNumber: 'AAAFO1234F',
    approvalId: null,
    file: {
      name: 'pan-card-entity.jpg',
      type: 'image/jpeg',
      size: 640000,
      storageKey: 'docs/identity/entity_pan.jpg',
      url: null,
    },
    dates: {
      issueDate: '2023-11-20',
      expiryDate: null,
      hasExpiry: false,
    },
    status: 'VERIFIED',
    verification: {
      status: 'VERIFIED',
      verifiedAt: '2026-01-20T10:00:00Z',
      verifiedBy: 'System',
      rejectionReason: null,
    },
    aiValidation: { status: 'NOT_RUN', score: null, issues: [], extractedData: {}, validatedAt: null },
    notes: 'Verified against NSDL portal database.',
  },
  {
    name: 'Electricity Load Sanction Letter',
    type: 'TECHNICAL',
    description: 'Contract demand approval for 150 kVA 11kV connection.',
    documentNumber: 'TPCODL-HT-2026-44',
    approvalId: null,
    file: {
      name: 'tpcodl-sanction-letter.pdf',
      type: 'application/pdf',
      size: 1450000,
      storageKey: 'docs/technical/power_sanction.pdf',
      url: null,
    },
    dates: {
      issueDate: '2026-06-10',
      expiryDate: null,
      hasExpiry: false,
    },
    status: 'UPLOADED',
    verification: {
      status: 'PENDING',
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
    },
    aiValidation: { status: 'NOT_RUN', score: null, issues: [], extractedData: {}, validatedAt: null },
    notes: 'Feasibility test cleared. Transformer installation scheduled.',
  },
  {
    name: 'Labour Contract Declaration',
    type: 'LABOUR',
    description: 'Statutory return under Contract Labour (Regulation and Abolition) Act.',
    documentNumber: 'CL-BBSR-2026-019',
    approvalId: null,
    file: null, // REQUIRED state, file not uploaded yet
    dates: {
      issueDate: null,
      expiryDate: null,
      hasExpiry: false,
    },
    status: 'REQUIRED',
    verification: {
      status: 'NOT_VERIFIED',
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
    },
    aiValidation: { status: 'NOT_RUN', score: null, issues: [], extractedData: {}, validatedAt: null },
    notes: 'Mandatory declaration before deploying contractual workforce.',
  },
];

/**
 * Seed sample documents into local storage for demonstration
 */
export function seedSampleDocuments(user = null) {
  if (typeof localStorage === 'undefined') return [];
  const existing = getDocuments();
  if (existing.length > 0) return existing;

  const currentYear = new Date().getFullYear();
  const seeded = SAMPLE_DOCUMENTS.map((doc, idx) => {
    const num = idx + 1;
    const now = new Date().toISOString();
    return {
      ...doc,
      id: `DOC-${currentYear}-${String(num).padStart(4, '0')}`,
      businessId: user?.businessId || user?.businessName || user?.id || user?.email || 'BUS-2026-0001',
      createdAt: now,
      updatedAt: now,
    };
  });

  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(seeded));
  } catch (e) {
    console.error('Failed to seed sample documents:', e);
  }
  return seeded;
}

/**
 * Automatically generate empty document slots (status: 'REQUIRED')
 * in the user's Document Vault for a specified license/approval.
 * Prevents duplicates if slot with the same name already exists for this approval.
 */
export function createDocumentSlotsForLicense(license, user = null) {
  if (!license || !Array.isArray(license.requiredDocuments)) {
    return { created: [], skipped: [], total: 0 };
  }

  const existingDocs = getDocuments();
  const created = [];
  const skipped = [];

  license.requiredDocuments.forEach((docSpec) => {
    // Check if slot or document with same name already exists for this approval/license
    const alreadyExists = existingDocs.some(
      (d) =>
        d.name.toLowerCase() === docSpec.name.toLowerCase() &&
        (d.approvalId === license.id || d.approvalId === license.code)
    );

    if (alreadyExists) {
      skipped.push(docSpec.name);
      return;
    }

    const payload = {
      name: docSpec.name,
      type: docSpec.type || 'OTHER',
      description: docSpec.description || `Required for ${license.name}`,
      approvalId: license.id,
      status: 'REQUIRED',
      file: {
        name: '',
        type: '',
        size: 0,
        storageKey: null,
        url: null,
      },
      dates: {
        issueDate: null,
        expiryDate: null,
        hasExpiry: false,
      },
      verification: {
        status: 'NOT_VERIFIED',
      },
      notes: `Generated by Sneha (AI Assistant) for ${license.name}`,
    };

    const newRecord = saveDocument(payload, user);
    if (newRecord) {
      created.push(newRecord);
      existingDocs.unshift(newRecord);
    }
  });

  // Notify any active components on current page or tab
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('documentsUpdated', { detail: { created, skipped } }));
    } catch {}
  }

  return {
    created,
    skipped,
    total: created.length,
  };
}
