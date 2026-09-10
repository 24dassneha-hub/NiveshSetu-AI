import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, Check, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getApprovals } from '../data/approvalsStorage';
import {
  getDocumentById,
  saveDocumentToSupabase,
  uploadDocumentFileToStorage,
  formatFileSize,
  DOCUMENT_TYPES,
  DOCUMENT_STATUSES,
  VERIFICATION_STATUSES,
} from '../data/documentsStorage';

const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function DocumentForm() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const editId = params?.id;
  const isEditing = Boolean(editId);

  // Existing approvals for related dropdown
  const [approvalsList] = useState(() => getApprovals());

  // Form State (lazy initialization for edit vs new)
  const [formData, setFormData] = useState(() => {
    if (editId) {
      const existing = getDocumentById(editId);
      if (existing) {
        return {
          id: existing.id,
          name: existing.name || '',
          type: existing.type || 'IDENTITY',
          documentNumber: existing.documentNumber || '',
          description: existing.description || '',
          approvalId: existing.approvalId || '',
          dates: {
            issueDate: existing.dates?.issueDate || '',
            expiryDate: existing.dates?.expiryDate || '',
            hasExpiry: Boolean(existing.dates?.hasExpiry),
          },
          status: existing.status || 'UPLOADED',
          verification: {
            status: existing.verification?.status || 'PENDING',
            rejectionReason: existing.verification?.rejectionReason || '',
          },
          file: existing.file || null,
          notes: existing.notes || '',
        };
      }
    }
    return {
      name: '',
      type: 'IDENTITY',
      documentNumber: '',
      description: '',
      approvalId: '',
      dates: {
        issueDate: '',
        expiryDate: '',
        hasExpiry: false,
      },
      status: 'UPLOADED',
      verification: {
        status: 'PENDING',
        rejectionReason: '',
      },
      file: null,
      notes: '',
    };
  });

  // Validation errors & status states
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Field refs for auto-focusing on validation failure
  const nameRef = useRef(null);
  const typeRef = useRef(null);
  const expiryDateRef = useRef(null);
  const fileInputRef = useRef(null);

  // Find currently selected approval details for Section 02 preview
  const selectedApprovalObj = approvalsList.find((a) => a.id === formData.approvalId);

  // Handle File Input Change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError('Unsupported file type. Please upload PDF, PNG, JPG, DOC, or DOCX.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File size exceeds 10 MB limit. Please select a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Save actual File object for Supabase Storage upload
    setRawFile(file);

    // Generate safe preview URL for immediate in-session view
    let previewUrl = null;
    try {
      previewUrl = URL.createObjectURL(file);
    } catch {
      previewUrl = null;
    }

    setFormData((prev) => ({
      ...prev,
      file: {
        name: file.name,
        type: file.type || `application/${ext}`,
        size: file.size,
        storageKey: `uploads/${Date.now()}_${file.name}`,
        url: previewUrl,
      },
      // If status was REQUIRED, auto-set to UPLOADED upon attaching file
      status: prev.status === 'REQUIRED' ? 'UPLOADED' : prev.status,
    }));
  };

  // Remove File
  const handleRemoveFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setRawFile(null);
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
    setFileError('');
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Document Name is required.';
    }
    if (!formData.type) {
      errs.type = 'Document Type is required.';
    }

    // Dates check
    if (formData.dates.hasExpiry) {
      if (!formData.dates.expiryDate) {
        errs.expiryDate = 'Expiry Date is required when expiry is enabled.';
      } else if (
        formData.dates.issueDate &&
        new Date(formData.dates.expiryDate) < new Date(formData.dates.issueDate)
      ) {
        errs.expiryDate = 'Expiry date cannot be earlier than issue date.';
      }
    }

    setErrors(errs);

    if (errs.name) nameRef.current?.focus();
    else if (errs.type) typeRef.current?.focus();
    else if (errs.expiryDate) expiryDateRef.current?.focus();

    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let finalFormData = { ...formData };

      // Upload raw file to Supabase Storage if user selected a new file
      if (rawFile) {
        try {
          const uploadRes = await uploadDocumentFileToStorage(rawFile, user?.id);
          if (uploadRes) {
            finalFormData.file = {
              name: uploadRes.fileName,
              type: uploadRes.fileType,
              size: uploadRes.fileSize,
              storageKey: uploadRes.filePath,
              url: uploadRes.url,
            };
          }
        } catch (uploadErr) {
          console.warn('Supabase storage upload notice, continuing with document record:', uploadErr);
        }
      }

      const saved = await saveDocumentToSupabase(finalFormData, user);
      setIsSubmitting(false);
      setIsSaved(true);

      setTimeout(() => {
        if (isEditing) {
          navigate(`/documents/${saved.id}`);
        } else {
          navigate('/documents');
        }
      }, 600);
    } catch (err) {
      console.error('Error submitting document:', err);
      setIsSubmitting(false);
      setFileError('Failed to save document. Please retry.');
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Form Header */}
        <div className="border-b border-[#262522] pb-4">
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← BACK TO DOCUMENTS</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div>
              <span className="font-mono-data text-[10px] text-[#6E6A61] font-bold uppercase tracking-wider block">
                BUSINESS COMPLIANCE RECORD
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
                {isEditing ? `EDIT DOCUMENT — ${formData.id}` : 'ADD DOCUMENT'}
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
                {isEditing
                  ? 'Modify metadata and compliance specifications for this document record.'
                  : 'Enter the details of the document you want to track.'}
              </p>
            </div>

            {isEditing && (
              <span className="font-mono-data text-xs font-bold bg-[#E9E1D0] border border-[#D6D0C3] px-2.5 py-1 rounded self-start sm:self-auto text-[#18324A]">
                {formData.id}
              </span>
            )}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* SIH Evaluation Quick Fill Panel */}
          {!isEditing && (
            <div className="p-3.5 bg-[#FAF6E9] border border-[#C59B27]/40 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className="w-4 h-4 text-[#C59B27]" />
                <span className="font-mono-data font-bold text-[#8A6A14] uppercase text-[11px]">
                  SIH Demo Quick Fill:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono-data text-[11px]">
                {[
                  {
                    label: '🚒 Fire Safety Plan',
                    name: 'Fire Safety Plan & Drawing',
                    type: 'FIRE_SAFETY',
                    num: 'FSP-2026-OD-881',
                    desc: 'Detailed architectural site layout with emergency fire exits and hydrants.',
                  },
                  {
                    label: '🍲 FSSAI License',
                    name: 'FSSAI Central Food License',
                    type: 'LICENSE',
                    num: '12026001000492',
                    desc: 'Central statutory license under Food Safety and Standards Act 2006.',
                  },
                  {
                    label: '🌿 Pollution CTE',
                    name: 'Consent to Establish (CTE)',
                    type: 'POLLUTION',
                    num: 'CTE-OSPCB-2026-90',
                    desc: 'State Pollution Control Board environmental discharge clearance.',
                  },
                  {
                    label: '📑 GST Certificate',
                    name: 'GST Certificate (REG-06)',
                    type: 'TAX',
                    num: '21AAAFO1234F1Z9',
                    desc: 'Goods and Services Tax registration certificate with Principal Place of Business.',
                  },
                ].map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        name: sample.name,
                        type: sample.type,
                        documentNumber: sample.num,
                        description: sample.desc,
                        status: 'UPLOADED',
                      }));
                      setErrors({});
                    }}
                    className="px-2 py-1 bg-white hover:bg-[#FAF8F2] border border-[#262522]/20 rounded text-[#18324A] font-semibold transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 01 — DOCUMENT INFORMATION */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
              01 — DOCUMENT INFORMATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Document Name *
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  placeholder="e.g. Fire Safety Plan"
                  className={`w-full h-10 px-3 bg-[#FFFFFF] border rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors ${
                    errors.name ? 'border-[#B85C4A] ring-1 ring-[#B85C4A]' : 'border-[#D6D0C3] focus:border-[#18324A]'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] font-mono-data text-[#B85C4A] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Document Type *
                </label>
                <select
                  ref={typeRef}
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value });
                    if (errors.type) setErrors({ ...errors, type: null });
                  }}
                  className={`w-full h-10 px-3 bg-[#FFFFFF] border rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors ${
                    errors.type ? 'border-[#B85C4A] ring-1 ring-[#B85C4A]' : 'border-[#D6D0C3] focus:border-[#18324A]'
                  }`}
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-[11px] font-mono-data text-[#B85C4A] mt-1">
                    {errors.type}
                  </p>
                )}
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Document Number
                </label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  placeholder="e.g. FS-OD-2026-00128"
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what this document certifies or relates to..."
                  className="w-full p-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECTION 02 — RELATED APPROVAL */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
              02 — RELATED APPROVAL
            </h2>

            <div>
              <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                Associate with Approval
              </label>
              <select
                value={formData.approvalId}
                onChange={(e) => setFormData({ ...formData, approvalId: e.target.value })}
                className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
              >
                <option value="">No Approval Associated (Standalone Document)</option>
                {approvalsList.map((appr) => (
                  <option key={appr.id} value={appr.id}>
                    {appr.name} ({appr.id}) — {appr.authority?.name || appr.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Compact Selected Approval Info Card */}
            {selectedApprovalObj && (
              <div className="p-3.5 bg-[#E9E1D0]/60 border border-[#262522] rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono-data text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#18324A] bg-[#FAF8F2] px-1.5 py-0.2 rounded border border-[#D6D0C3] text-[10px]">
                      {selectedApprovalObj.id}
                    </span>
                    <span className="font-sans font-bold text-sm text-[#171717]">
                      {selectedApprovalObj.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6E6A61] block">
                    {selectedApprovalObj.authority?.name} • {selectedApprovalObj.authority?.jurisdiction || selectedApprovalObj.authority?.state}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#6E6A61] uppercase">Status:</span>
                  <StatusBadge
                    status={selectedApprovalObj.application?.status}
                    label={selectedApprovalObj.application?.status}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 03 — DOCUMENT DATES */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
              03 — DOCUMENT DATES
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Issue Date */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.dates.issueDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dates: { ...formData.dates, issueDate: e.target.value },
                    })
                  }
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase">
                    Expiry Date
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-mono-data text-[#6E6A61] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.dates.hasExpiry}
                      onChange={(e) => {
                        const noExpiry = e.target.checked;
                        setFormData({
                          ...formData,
                          dates: {
                            ...formData.dates,
                            hasExpiry: !noExpiry,
                            expiryDate: noExpiry ? '' : formData.dates.expiryDate,
                          },
                        });
                        if (errors.expiryDate) setErrors({ ...errors, expiryDate: null });
                      }}
                      className="rounded border-[#D6D0C3] text-[#18324A] focus:ring-0"
                    />
                    <span>This document does not expire</span>
                  </label>
                </div>

                <input
                  ref={expiryDateRef}
                  type="date"
                  disabled={!formData.dates.hasExpiry}
                  value={formData.dates.expiryDate}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      dates: { ...formData.dates, expiryDate: e.target.value },
                    });
                    if (errors.expiryDate) setErrors({ ...errors, expiryDate: null });
                  }}
                  className={`w-full h-10 px-3 rounded-[3px] text-xs font-mono-data transition-colors focus:outline-none ${
                    !formData.dates.hasExpiry
                      ? 'bg-[#E9E1D0]/40 text-[#8B8982] border-[#D6D0C3] cursor-not-allowed'
                      : errors.expiryDate
                      ? 'bg-[#FFFFFF] border-[#B85C4A] ring-1 ring-[#B85C4A] text-[#171717]'
                      : 'bg-[#FFFFFF] border-[#D6D0C3] focus:border-[#18324A] text-[#171717]'
                  }`}
                />
                {errors.expiryDate && (
                  <p className="text-[11px] font-mono-data text-[#B85C4A] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.expiryDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 04 — DOCUMENT STATUS */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
              04 — STATUS & VERIFICATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document Status */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Document Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                >
                  {DOCUMENT_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] font-mono-data text-[#6E6A61] mt-1">
                  Select "Required" if tracking an un-uploaded compliance requirement.
                </p>
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Verification Status
                </label>
                <select
                  value={formData.verification.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      verification: { ...formData.verification, status: e.target.value },
                    })
                  }
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                >
                  {VERIFICATION_STATUSES.map((vs) => (
                    <option key={vs.value} value={vs.value}>
                      {vs.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] font-mono-data text-[#6E6A61] mt-1">
                  Verification state is tracked independently from upload status.
                </p>
              </div>

              {/* Rejection reason (if rejected) */}
              {formData.verification.status === 'REJECTED' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-data font-bold text-[#B85C4A] uppercase mb-1">
                    Rejection Reason
                  </label>
                  <input
                    type="text"
                    value={formData.verification.rejectionReason}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        verification: {
                          ...formData.verification,
                          rejectionReason: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Seal illegible or missing civil engineer signature"
                    className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#B85C4A] focus:border-[#B85C4A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 05 — FILE UPLOAD */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
              05 — DOCUMENT FILE
            </h2>
            <p className="text-xs text-[#6E6A61] font-sans">
              Upload the digital file associated with this record. Supported formats: PDF, PNG, JPG, JPEG, DOC, DOCX (Max 10 MB).
            </p>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* File display or upload drop zone */}
            {formData.file?.name ? (
              <div className="p-4 bg-[#FFFFFF] border border-[#262522] rounded-[3px] flex items-center justify-between gap-4 font-mono-data text-xs">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded bg-[#E9E1D0] border border-[#D6D0C3] flex items-center justify-center text-[#18324A] shrink-0 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-[#171717] block truncate">
                      {formData.file.name}
                    </span>
                    <span className="text-[10px] text-[#6E6A61] block">
                      {formatFileSize(formData.file.size)} • {formData.file.type || 'Document'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs text-[#18324A] hover:bg-[#E9E1D0] border border-[#D6D0C3] rounded transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-[#B85C4A] hover:bg-[#B85C4A]/10 rounded transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D6D0C3] hover:border-[#18324A] rounded-[4px] p-6 text-center cursor-pointer transition-colors bg-[#FFFFFF]/50 hover:bg-[#FFFFFF]"
              >
                <div className="w-10 h-10 rounded-full bg-[#E9E1D0] border border-[#D6D0C3] flex items-center justify-center mx-auto mb-2 text-[#18324A]">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-mono-data text-xs font-bold text-[#18324A] block mb-1">
                  CLICK TO SELECT OR DRAG FILE HERE
                </span>
                <span className="text-[11px] font-mono-data text-[#8B8982] block">
                  PDF, PNG, JPG, DOC, DOCX up to 10 MB
                </span>
              </div>
            )}

            {fileError && (
              <p className="text-[11px] font-mono-data text-[#B85C4A] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fileError}
              </p>
            )}
          </div>

          {/* SECTION 06 — NOTES */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
              06 — OPERATIONAL NOTES
            </h2>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional information about this document..."
              className="w-full p-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-[#262522]">
            <Link to="/documents">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              {isSaved && (
                <span className="font-mono-data text-xs font-bold text-[#5D8068] flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  ✓ DOCUMENT SAVED
                </span>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || isSaved}
              >
                {isSubmitting ? 'SAVING...' : 'SAVE DOCUMENT'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
