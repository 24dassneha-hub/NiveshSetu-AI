import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Send,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getApprovals } from '../data/approvalsStorage';
import { getDocuments } from '../data/documentsStorage';
import {
  getApplications,
  getApplicationById,
  saveApplication,
  saveApplicationToSupabase,
  submitApplication,
  checkDuplicateActiveApplication,
  calculateApplicationReadiness,
  APPLICATION_MODES,
} from '../data/applicationsStorage';
import { getUserBusinessProfile } from '../data/appModeState';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const editId = params?.id;
  const isEditing = Boolean(editId);

  // Load existing collections
  const [approvalsList] = useState(() => getApprovals());
  const [applicationsList] = useState(() => getApplications());
  const [documentsList] = useState(() => getDocuments());

  // Form State (lazy initialization for edit vs new)
  const [formData, setFormData] = useState(() => {
    const userProfile = getUserBusinessProfile(user);
    const activeBusinessName = userProfile?.name || user?.businessName || user?.name || 'My Enterprise';

    if (editId) {
      const existing = getApplicationById(editId);
      if (existing) {
        return {
          id: existing.id,
          approvalId: existing.approvalId || '',
          title: existing.title || '',
          applicant: {
            name: existing.applicant?.name || activeBusinessName,
            contactName: existing.applicant?.contactName || '',
            contactEmail: existing.applicant?.contactEmail || user?.email || '',
            contactPhone: existing.applicant?.contactPhone || '',
          },
          submission: {
            mode: existing.submission?.mode || 'ONLINE',
            referenceNumber: existing.submission?.referenceNumber || '',
          },
          status: existing.status || 'DRAFT',
          sla: {
            durationDays: existing.sla?.durationDays || 30,
            expectedDecisionDate: existing.sla?.expectedDecisionDate || '',
            deadline: existing.sla?.deadline || '',
          },
          notes: existing.notes || '',
        };
      }
    }

    // Default for new
    const firstApproval = approvalsList[0];
    return {
      approvalId: firstApproval ? firstApproval.id : '',
      title: firstApproval ? `${firstApproval.name} Filing — ${activeBusinessName}` : '',
      applicant: {
        name: activeBusinessName,
        contactName: '',
        contactEmail: user?.email || '',
        contactPhone: '',
      },
      submission: {
        mode: 'ONLINE',
        referenceNumber: '',
      },
      status: 'DRAFT',
      sla: {
        durationDays: 30,
        expectedDecisionDate: '',
        deadline: '',
      },
      notes: '',
    };
  });

  // Selected approval object
  const selectedApproval = useMemo(() => {
    return approvalsList.find((a) => a.id === formData.approvalId) || null;
  }, [approvalsList, formData.approvalId]);

  // Duplicate active application check
  const duplicateActiveApp = useMemo(() => {
    return checkDuplicateActiveApplication(formData.approvalId, applicationsList, editId);
  }, [formData.approvalId, applicationsList, editId]);

  // Readiness Engine evaluation
  const readiness = useMemo(() => {
    return calculateApplicationReadiness(formData, selectedApproval, documentsList);
  }, [formData, selectedApproval, documentsList]);

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [blockingAlert, setBlockingAlert] = useState(null);

  // Field refs
  const titleRef = useRef(null);
  const applicantRef = useRef(null);

  // Handle Approval Selection Change
  const handleApprovalChange = (approvalId) => {
    const appr = approvalsList.find((a) => a.id === approvalId);
    setFormData((prev) => ({
      ...prev,
      approvalId,
      title: appr ? `${appr.name} Application — ${prev.applicant?.name || 'Omm Enterprises'}` : prev.title,
    }));
    setBlockingAlert(null);
  };

  // Validate basic form
  const validateForm = () => {
    const errs = {};
    if (!formData.approvalId) {
      errs.approvalId = 'Approval selection is required.';
    }
    if (!formData.title?.trim()) {
      errs.title = 'Application title is required.';
    }
    if (!formData.applicant?.name?.trim()) {
      errs.applicantName = 'Applicant name is required.';
    }
    setErrors(errs);

    if (errs.title) titleRef.current?.focus();
    else if (errs.applicantName) applicantRef.current?.focus();

    return Object.keys(errs).length === 0;
  };

  // Save Draft handler
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = {
      ...formData,
      approvalName: selectedApproval?.name,
      authority: selectedApproval?.authority,
      readiness,
      status: 'DRAFT',
    };
    saveApplication(payload, user);
    await saveApplicationToSupabase(payload, user);
    setIsSubmitting(false);
    navigate('/applications');
  };

  // Pre-submission check
  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (duplicateActiveApp) {
      setBlockingAlert(
        `An active application (${duplicateActiveApp.id}) is already open for this approval. You cannot submit a duplicate filing.`
      );
      return;
    }

    if (!readiness.canSubmit) {
      setBlockingAlert(
        `Application is not ready to submit:\n• ${readiness.blockingIssues.join('\n• ')}`
      );
      return;
    }

    setBlockingAlert(null);
    setIsSubmitModalOpen(true);
  };

  // Confirm Final Submission
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      ...formData,
      approvalName: selectedApproval?.name,
      authority: selectedApproval?.authority,
      readiness,
    };
    const saved = saveApplication(payload, user);
    const submitted = submitApplication(saved.id, user);

    await saveApplicationToSupabase(submitted || saved, user);

    setIsSubmitting(false);
    setIsSubmitModalOpen(false);
    navigate(`/applications/${saved.id}`);
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="border-b border-[#262522] pb-4">
          <Link
            to="/applications"
            className="inline-flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← BACK TO APPLICATIONS</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div>
              <span className="font-mono-data text-[10px] text-[#6E6A61] font-bold uppercase tracking-wider block">
                APPLICATION FILING PREPARATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
                {isEditing ? `EDIT APPLICATION — ${formData.id}` : 'NEW APPLICATION'}
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
                Prepare and submit statutory clearance filings associated with your business approvals.
              </p>
            </div>
          </div>
        </div>

        {/* Duplicate Active Application Alert Banner */}
        {duplicateActiveApp && (
          <div className="p-4 bg-[rgba(184,92,74,0.08)] border-2 border-[#B85C4A] rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono-data text-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#B85C4A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#B85C4A] block uppercase">
                  ACTIVE APPLICATION ALREADY EXISTS
                </span>
                <p className="text-[#171717] mt-0.5 font-sans">
                  An active filing (<span className="font-mono-data font-bold">{duplicateActiveApp.id}</span>) in status{' '}
                  <span className="font-bold text-[#18324A]">{duplicateActiveApp.status}</span> is currently processing for this approval.
                </p>
              </div>
            </div>

            <Link to={`/applications/${duplicateActiveApp.id}`} className="shrink-0">
              <Button variant="primary" size="sm">
                View Active Filing
              </Button>
            </Link>
          </div>
        )}

        {/* Blocking Issues Alert Banner */}
        {blockingAlert && (
          <div className="p-4 bg-[rgba(184,92,74,0.08)] border border-[#B85C4A] rounded-[4px] font-mono-data text-xs space-y-1 text-[#B85C4A]">
            <div className="flex items-center gap-1.5 font-bold uppercase">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Cannot Submit Application</span>
            </div>
            <p className="whitespace-pre-line text-[#171717] font-sans pl-5 text-xs">
              {blockingAlert}
            </p>
          </div>
        )}

        {/* Form Form Body */}
        <form className="space-y-6" noValidate>
          {/* STEP 1: SELECT APPROVAL */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#262522]">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider">
                01 — SELECT STATUTORY APPROVAL
              </h2>
              <span className="text-[10px] font-mono-data text-[#6E6A61]">
                STEP 1 OF 5
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                Select Approval *
              </label>
              <select
                disabled={isEditing}
                value={formData.approvalId}
                onChange={(e) => handleApprovalChange(e.target.value)}
                className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors disabled:bg-[#E9E1D0]/40 disabled:cursor-not-allowed"
              >
                {approvalsList.map((appr) => (
                  <option key={appr.id} value={appr.id}>
                    {appr.name} ({appr.id}) — {appr.authority?.name || appr.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Approval Dossier Card */}
            {selectedApproval ? (
              <div className="p-4 bg-[#FFFFFF] border border-[#262522] rounded-[3px] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-data">
                <div className="border-r border-[#D6D0C3] pr-2">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">TYPE / CATEGORY</span>
                  <span className="font-bold text-[#171717] block truncate mt-0.5">
                    {selectedApproval.type} • {selectedApproval.category}
                  </span>
                </div>

                <div className="sm:border-r border-[#D6D0C3] pr-2">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">AUTHORITY</span>
                  <span className="font-bold text-[#18324A] block truncate mt-0.5">
                    {selectedApproval.authority?.name}
                  </span>
                </div>

                <div className="border-r border-[#D6D0C3] pr-2">
                  <span className="text-[10px] text-[#6E6A61] uppercase block">JURISDICTION</span>
                  <span className="font-bold text-[#171717] block truncate mt-0.5">
                    {selectedApproval.authority?.jurisdiction}, {selectedApproval.authority?.state}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block">APPROVAL STATUS</span>
                  <div className="mt-1">
                    <StatusBadge
                      status={selectedApproval.application?.status}
                      label={selectedApproval.application?.status}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono-data text-[#B85C4A]">
                No approvals created yet. Please add an approval first in the Approvals tab.
              </p>
            )}
          </div>

          {/* SECTION 02 — APPLICATION INFORMATION */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
              02 — APPLICATION DETAILS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Application Title *
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: null });
                  }}
                  placeholder="e.g. Fire NOC Application — Omm Enterprises"
                  className={`w-full h-10 px-3 bg-[#FFFFFF] border rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors ${
                    errors.title ? 'border-[#B85C4A] ring-1 ring-[#B85C4A]' : 'border-[#D6D0C3] focus:border-[#18324A]'
                  }`}
                />
                {errors.title && (
                  <p className="text-[11px] font-mono-data text-[#B85C4A] mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Applicant Name */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Applicant Entity Name *
                </label>
                <input
                  ref={applicantRef}
                  type="text"
                  value={formData.applicant.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      applicant: { ...formData.applicant, name: e.target.value },
                    });
                    if (errors.applicantName) setErrors({ ...errors, applicantName: null });
                  }}
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Authorized Signatory / Contact Person
                </label>
                <input
                  type="text"
                  value={formData.applicant.contactName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicant: { ...formData.applicant, contactName: e.target.value },
                    })
                  }
                  placeholder="e.g. Sujit Patnaik (Managing Director)"
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.applicant.contactEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicant: { ...formData.applicant, contactEmail: e.target.value },
                    })
                  }
                  placeholder="contact@enterprise.com"
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.applicant.contactPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicant: { ...formData.applicant, contactPhone: e.target.value },
                    })
                  }
                  placeholder="+91 94370 12345"
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                />
              </div>

              {/* Application Mode */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Submission Mode
                </label>
                <select
                  value={formData.submission.mode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      submission: { ...formData.submission, mode: e.target.value },
                    })
                  }
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                >
                  {APPLICATION_MODES.map((mode) => (
                    <option key={mode} value={mode.toUpperCase().replace(/\s+/g, '_')}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                  Authority Reference / Token (Optional)
                </label>
                <input
                  type="text"
                  value={formData.submission.referenceNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      submission: { ...formData.submission, referenceNumber: e.target.value },
                    })
                  }
                  placeholder="e.g. OFS/BBSR/2026/0881"
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECTION 03 — REQUIRED DOCUMENTS & READINESS */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#262522]">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider">
                03 — REQUIRED DOCUMENTS & READINESS
              </h2>
              <div className="flex items-center gap-2 font-mono-data text-xs">
                <span className="text-[#6E6A61]">Readiness:</span>
                <span
                  className={`font-bold ${
                    readiness.canSubmit ? 'text-[#5D8068]' : 'text-[#C08A3E]'
                  }`}
                >
                  {readiness.completionPercentage}%
                </span>
              </div>
            </div>

            {/* Document Readiness Progress Bar */}
            <div className="w-full h-2 bg-[#E9E1D0] rounded-full overflow-hidden border border-[#D6D0C3]">
              <div
                className={`h-full transition-all duration-300 ${
                  readiness.canSubmit ? 'bg-[#5D8068]' : 'bg-[#C08A3E]'
                }`}
                style={{ width: `${readiness.completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono-data text-[#6E6A61]">
              <span>
                Required: {readiness.requiredDocuments} • Available: {readiness.availableDocuments} • Missing: {readiness.missingDocuments}
              </span>
              {readiness.canSubmit ? (
                <span className="text-[#5D8068] font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Ready to Submit
                </span>
              ) : (
                <span className="text-[#B85C4A] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Document Blocker
                </span>
              )}
            </div>

            {/* Documents List Checklist */}
            {selectedApproval?.documents?.length > 0 ? (
              <div className="divide-y divide-[#D6D0C3] border border-[#262522] rounded-[3px] bg-[#FFFFFF] overflow-hidden">
                {selectedApproval.documents.map((docReq, idx) => {
                  const match = documentsList.find(
                    (d) =>
                      (d.approvalId === selectedApproval.id || (formData.documentIds || []).includes(d.id)) &&
                      (d.name?.toLowerCase().trim() === docReq.name?.toLowerCase().trim() ||
                        d.id === docReq.id)
                  );
                  const isAvailable = match && (match.status === 'UPLOADED' || match.status === 'VERIFIED' || match.file?.name);

                  return (
                    <div key={docReq.id || idx} className="p-3 flex items-center justify-between gap-3 text-xs font-mono-data">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                            isAvailable
                              ? 'bg-[rgba(93,128,104,0.12)] text-[#5D8068] border-[#5D8068]'
                              : 'bg-[rgba(184,92,74,0.12)] text-[#B85C4A] border-[#B85C4A]'
                          }`}
                        >
                          {isAvailable ? '✓' : '!'}
                        </span>
                        <div>
                          <span className="font-sans font-bold text-[#171717] block">
                            {docReq.name}
                          </span>
                          <span className="text-[10px] text-[#6E6A61]">
                            {isAvailable ? `Linked from Documents (${match.id})` : 'Missing in records'}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isAvailable ? (
                          <StatusBadge status={match.status} label={match.status} />
                        ) : (
                          <Link to="/documents/new">
                            <span className="text-xs font-bold text-[#18324A] hover:underline flex items-center gap-1">
                              <span>Upload</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono-data text-[#6E6A61] bg-[#E9E1D0]/40 p-4 border border-[#D6D0C3] rounded text-center">
                No statutory document checklist recorded on this approval. Application can proceed with general filing.
              </p>
            )}
          </div>

          {/* SECTION 04 — NOTES */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
              04 — OPERATIONAL NOTES
            </h2>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add internal filing notes, dispatch numbers, or expedited processing remarks..."
              className="w-full p-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none transition-colors"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#262522]">
            <Link to="/applications">
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Button
                type="button"
                variant="secondary"
                size="md"
                icon={Save}
                disabled={isSubmitting}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                icon={Send}
                disabled={isSubmitting || Boolean(duplicateActiveApp)}
                onClick={handleInitiateSubmit}
              >
                Submit Application
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
            onClick={() => !isSubmitting && setIsSubmitModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#FAF8F2] border-2 border-[#18324A] rounded-[4px] p-6 shadow-[0_16px_48px_rgba(23,23,23,0.2)] z-10 auth-page-enter">
            <div className="w-10 h-10 rounded-[3px] bg-[#E9E1D0] border border-[#18324A] text-[#18324A] flex items-center justify-center font-bold text-lg mb-4">
              <Send className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold text-[#171717] uppercase tracking-tight mb-2">
              Submit application?
            </h3>

            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans leading-relaxed mb-6">
              Once submitted, application information cannot be freely edited unless a query or correction is requested by the department.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6D0C3]">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isSubmitting}
                onClick={() => setIsSubmitModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
