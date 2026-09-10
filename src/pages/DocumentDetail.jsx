import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Download,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Eye,
  Loader2,
} from 'lucide-react';
import { Link, useNavigate, useParams } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getApprovalById } from '../data/approvalsStorage';
import {
  getDocumentById,
  saveDocument,
  saveDocumentToSupabase,
  deleteDocumentFromSupabase,
  getExpiryInfo,
  formatFileSize,
  DOCUMENT_TYPES,
} from '../data/documentsStorage';
import { verifyDocumentWithGemini } from '../lib/graceAiService';

export default function DocumentDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const docId = params?.id;
  const { user } = useAuth();

  const [currentDoc, setCurrentDoc] = useState(() => (docId ? getDocumentById(docId) : null));
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAiRunning, setIsAiRunning] = useState(false);

  const doc = currentDoc;
  const relatedApproval = useMemo(
    () => (doc?.approvalId ? getApprovalById(doc.approvalId) : null),
    [doc]
  );

  // If document does not exist
  if (!doc) {
    return (
      <DashboardShell>
        <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-12 text-center my-8">
          <span className="font-mono-data text-xs text-[#B85C4A] font-bold block mb-1">
            RECORD NOT FOUND
          </span>
          <h2 className="text-xl font-bold text-[#171717] mb-2 uppercase">
            Document {docId} does not exist
          </h2>
          <p className="text-xs text-[#6E6A61] mb-6 font-mono-data">
            The document may have been deleted or the link is incorrect.
          </p>
          <Link to="/documents">
            <Button variant="primary" size="md" icon={ArrowLeft}>
              BACK TO DOCUMENTS
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const expiryInfo = getExpiryInfo(doc);
  const typeObj = DOCUMENT_TYPES.find((t) => t.value === doc.type);

  // Trigger Gemini AI Scrutiny
  const handleRunAiScrutiny = async () => {
    setIsAiRunning(true);
    try {
      const verificationResult = await verifyDocumentWithGemini(doc, user);
      setAiResult(verificationResult);

      const updated = {
        ...doc,
        verification: {
          ...doc.verification,
          status: verificationResult.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
          verifiedAt: verificationResult.validatedAt,
          verifiedBy: verificationResult.engine,
          rejectionReason: verificationResult.issues?.length > 0 ? verificationResult.issues.join('; ') : null,
        },
        aiValidation: {
          status: verificationResult.status,
          score: verificationResult.score,
          issues: verificationResult.issues,
          extractedData: verificationResult.extractedData,
          validatedAt: verificationResult.validatedAt,
          engine: verificationResult.engine,
        },
        updatedAt: new Date().toISOString(),
      };

      saveDocument(updated, user);
      await saveDocumentToSupabase(updated, user);
      setCurrentDoc(updated);
    } catch (err) {
      console.error('Error running AI Scrutiny:', err);
    } finally {
      setIsAiRunning(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteDocumentFromSupabase(doc.id, user);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      navigate('/documents');
    } catch (err) {
      console.error('Error deleting document:', err);
      setIsDeleting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 pb-16">
        {/* Header & Quick Action Bar */}
        <div className="space-y-3 pb-4 border-b border-[#262522]">
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO DOCUMENTS</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px] border border-[#D6D0C3]">
                  {doc.id}
                </span>
                <span className="font-mono-data text-xs text-[#6E6A61] bg-[#FAF8F2] px-2 py-0.5 rounded-[2px] border border-[#D6D0C3]">
                  {typeObj?.label || doc.type}
                </span>
                <StatusBadge status={doc.status} label={doc.status} />
                <StatusBadge
                  status={doc.verification?.status}
                  label={doc.verification?.status || 'PENDING'}
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
                {doc.name}
              </h1>
              {doc.documentNumber && (
                <p className="text-xs sm:text-sm text-[#6E6A61] font-mono-data mt-0.5">
                  Document No: #{doc.documentNumber}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 self-start lg:self-auto">
              <Link to={`/documents/${doc.id}/edit`}>
                <Button variant="secondary" size="md" icon={Edit}>
                  EDIT DOCUMENT
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                icon={Trash2}
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-[#B85C4A] hover:bg-[#B85C4A]/10 border-[#B85C4A]/40 hover:border-[#B85C4A]"
              >
                DELETE
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metadata Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 text-xs font-mono-data shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
          <div className="border-r border-[#D6D0C3] pr-2">
            <span className="text-[10px] text-[#6E6A61] uppercase block">DOCUMENT TYPE</span>
            <span className="font-bold text-sm text-[#18324A] truncate block mt-0.5">
              {typeObj?.label || doc.type}
            </span>
          </div>

          <div className="sm:border-r border-[#D6D0C3] pr-2">
            <span className="text-[10px] text-[#6E6A61] uppercase block">RELATED APPROVAL</span>
            <span className="font-bold text-sm text-[#171717] truncate block mt-0.5">
              {relatedApproval?.name || doc.approvalId || 'None'}
            </span>
          </div>

          <div className="border-r border-[#D6D0C3] pr-2">
            <span className="text-[10px] text-[#6E6A61] uppercase block">EXPIRY STATUS</span>
            <span
              className="font-bold text-sm truncate block mt-0.5"
              style={{ color: expiryInfo.badgeColor }}
            >
              {expiryInfo.label}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#6E6A61] uppercase block">LAST UPDATED</span>
            <span className="font-bold text-sm text-[#6E6A61] truncate block mt-0.5">
              {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Overview, File Scrutiny, Notes */}
          <div className="lg:col-span-7 space-y-6">
            {/* Overview Section */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
                OVERVIEW & RECORD DETAILS
              </h2>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-mono-data text-[#6E6A61] uppercase block mb-1">
                    DOCUMENT TITLE
                  </span>
                  <p className="text-sm font-sans font-bold text-[#171717]">
                    {doc.name}
                  </p>
                </div>

                {doc.description && (
                  <div>
                    <span className="text-[10px] font-mono-data text-[#6E6A61] uppercase block mb-1">
                      DESCRIPTION
                    </span>
                    <p className="text-sm font-sans text-[#30302D] leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#D6D0C3] font-mono-data text-xs">
                  <div>
                    <span className="text-[10px] text-[#6E6A61] uppercase block">
                      DOCUMENT NUMBER
                    </span>
                    <span className="font-bold text-[#171717]">
                      {doc.documentNumber || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#6E6A61] uppercase block">
                      RECORD ID
                    </span>
                    <span className="font-bold text-[#18324A]">
                      {doc.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Scrutiny Section */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#262522]">
                <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider">
                  DIGITAL FILE ATTACHMENT
                </h2>
                {doc.file?.name && (
                  <span className="text-[10px] font-mono-data text-[#5D8068] font-bold">
                    ✓ FILE ATTACHED
                  </span>
                )}
              </div>

              {doc.file?.name ? (
                <div className="p-4 bg-[#FFFFFF] border border-[#262522] rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono-data text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#E9E1D0] border border-[#D6D0C3] flex items-center justify-center text-[#18324A] shrink-0 font-bold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-[#171717] block text-sm truncate max-w-sm">
                        {doc.file.name}
                      </span>
                      <span className="text-[11px] text-[#6E6A61] block mt-0.5">
                        {formatFileSize(doc.file.size)} • {doc.file.type || 'Document'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {doc.file.url ? (
                      <a
                        href={doc.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#18324A] text-[#FAF8F2] text-xs font-bold rounded-[3px] hover:bg-[#254A6B] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview File</span>
                      </a>
                    ) : (
                      <button
                        onClick={() =>
                          alert(`File reference: ${doc.file.name}\nSize: ${formatFileSize(doc.file.size)}\nStorage Key: ${doc.file.storageKey || 'local'}`)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F2] border border-[#262522] text-[#18324A] text-xs font-bold rounded-[3px] hover:bg-[#E9E1D0] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Inspect File Ref</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#E9E1D0]/40 border border-[#D6D0C3] rounded text-center font-mono-data text-xs space-y-2">
                  <span className="text-[#B85C4A] font-bold block">
                    No file attached to this record
                  </span>
                  <p className="text-[#6E6A61] text-[11px]">
                    This document is currently recorded as a requirement without a file upload.
                  </p>
                  <Link to={`/documents/${doc.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Attach File Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Operational Notes */}
            {doc.notes && (
              <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-2">
                <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
                  INTERNAL NOTES
                </h2>
                <p className="text-xs sm:text-sm font-sans text-[#30302D] leading-relaxed whitespace-pre-line">
                  {doc.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Related Approval, Dates, Verification, Future AI */}
          <div className="lg:col-span-5 space-y-6">
            {/* Related Approval Card */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
                STATUTORY APPROVAL LINKAGE
              </h2>

              {relatedApproval ? (
                <div className="space-y-3 font-mono-data text-xs">
                  <div>
                    <span className="text-[10px] text-[#6E6A61] uppercase block">APPROVAL NAME</span>
                    <span className="font-bold text-[#171717] font-sans text-sm block">
                      {relatedApproval.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6A61]">Authority:</span>
                    <span className="font-bold text-[#18324A]">
                      {relatedApproval.authority?.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6A61]">Application ID:</span>
                    <span className="font-bold text-[#171717]">
                      {relatedApproval.application?.id || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6A61]">Approval Status:</span>
                    <StatusBadge
                      status={relatedApproval.application?.status}
                      label={relatedApproval.application?.status}
                    />
                  </div>

                  <div className="pt-2 border-t border-[#D6D0C3]">
                    <Link
                      to={`/approvals/${relatedApproval.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#18324A] hover:underline"
                    >
                      <span>VIEW APPROVAL DOSSIER</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono-data text-[#6E6A61]">
                  <p>No specific approval linked to this document.</p>
                  <p className="text-[11px] text-[#8B8982] mt-1">
                    This document serves as an independent enterprise compliance asset.
                  </p>
                </div>
              )}
            </div>

            {/* Dates & Expiry Card */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
                VALIDITY & DATES
              </h2>

              <div className="space-y-2.5 text-xs font-mono-data">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6A61]">Issue Date:</span>
                  <span className="font-bold text-[#171717]">
                    {doc.dates?.issueDate || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6E6A61]">Expiry Date:</span>
                  <span className="font-bold text-[#171717]">
                    {doc.dates?.hasExpiry && doc.dates?.expiryDate
                      ? doc.dates.expiryDate
                      : 'No Expiry'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#D6D0C3]">
                  <span className="text-[#6E6A61]">Status:</span>
                  <span
                    className="px-2 py-0.5 rounded-[2px] font-bold border"
                    style={{
                      color: expiryInfo.badgeColor,
                      backgroundColor: expiryInfo.badgeBg,
                      borderColor: expiryInfo.badgeColor + '40',
                    }}
                  >
                    {expiryInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Dossier */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
                VERIFICATION DOSSIER
              </h2>

              <div className="space-y-2.5 text-xs font-mono-data">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6A61]">Verification Status:</span>
                  <StatusBadge
                    status={doc.verification?.status}
                    label={doc.verification?.status || 'PENDING'}
                  />
                </div>

                {doc.verification?.verifiedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6A61]">Verified At:</span>
                    <span className="font-bold text-[#171717]">
                      {new Date(doc.verification.verifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {doc.verification?.verifiedBy && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6A61]">Verified By:</span>
                    <span className="font-bold text-[#18324A]">
                      {doc.verification.verifiedBy}
                    </span>
                  </div>
                )}

                {doc.verification?.rejectionReason && (
                  <div className="p-2.5 bg-[rgba(184,92,74,0.1)] border border-[#B85C4A]/40 rounded text-xs">
                    <span className="text-[10px] text-[#B85C4A] font-bold uppercase block mb-0.5">
                      REJECTION REASON
                    </span>
                    <p className="text-[#171717] font-sans">
                      {doc.verification.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Document Validation & OCR Card */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D6D0C3]">
                <div className="flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C08A3E]" />
                  <span>SNEHA AI OCR & SCRUTINY</span>
                </div>
                {doc.aiValidation?.status && doc.aiValidation?.status !== 'NOT_RUN' ? (
                  <span
                    className={`text-[10px] font-mono-data px-2 py-0.5 rounded font-bold border ${
                      doc.aiValidation.status === 'VERIFIED'
                        ? 'bg-[#5D8068]/15 text-[#5D8068] border-[#5D8068]/30'
                        : 'bg-[#B85C4A]/15 text-[#B85C4A] border-[#B85C4A]/30'
                    }`}
                  >
                    {doc.aiValidation.status === 'VERIFIED' ? '✓ AI VERIFIED' : '⚠ FLAGGED'}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono-data bg-[#E9E1D0] px-1.5 py-0.5 rounded border border-[#D6D0C3] text-[#6E6A61]">
                    READY TO SCRUTINIZE
                  </span>
                )}
              </div>

              {doc.aiValidation?.score ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono-data">
                    <span className="text-[#6E6A61]">Scrutiny Confidence:</span>
                    <span className="font-bold text-[#18324A]">{doc.aiValidation.score}% Match</span>
                  </div>
                  <div className="w-full bg-[#E9E1D0] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        doc.aiValidation.score >= 80 ? 'bg-[#5D8068]' : 'bg-[#C08A3E]'
                      }`}
                      style={{ width: `${doc.aiValidation.score}%` }}
                    />
                  </div>

                  {doc.aiValidation.extractedData && (
                    <div className="p-3 bg-white border border-[#D6D0C3] rounded-[3px] text-xs font-mono-data space-y-1.5">
                      <span className="text-[10px] font-bold text-[#6E6A61] uppercase block border-b border-[#E9E1D0] pb-1">
                        EXTRACTED OCR ENTITIES
                      </span>
                      {doc.aiValidation.extractedData.entityName && (
                        <div className="flex justify-between">
                          <span className="text-[#6E6A61]">Entity:</span>
                          <span className="font-bold text-[#171717] truncate max-w-[170px]">
                            {doc.aiValidation.extractedData.entityName}
                          </span>
                        </div>
                      )}
                      {doc.aiValidation.extractedData.documentNumber && (
                        <div className="flex justify-between">
                          <span className="text-[#6E6A61]">Ref No:</span>
                          <span className="font-bold text-[#18324A]">
                            {doc.aiValidation.extractedData.documentNumber}
                          </span>
                        </div>
                      )}
                      {doc.aiValidation.extractedData.validUntil && (
                        <div className="flex justify-between">
                          <span className="text-[#6E6A61]">Validity:</span>
                          <span className="font-bold text-[#5D8068]">
                            {doc.aiValidation.extractedData.validUntil}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {doc.aiValidation.issues && doc.aiValidation.issues.length > 0 && (
                    <div className="p-2.5 bg-[#B85C4A]/10 border border-[#B85C4A]/30 rounded text-xs space-y-1 text-[#B85C4A]">
                      <span className="font-bold block text-[10px] uppercase">SCRUTINY FLAGS</span>
                      {doc.aiValidation.issues.map((iss, i) => (
                        <p key={i} className="font-sans leading-tight">• {iss}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#6E6A61] font-sans leading-relaxed">
                  Trigger automated optical character recognition (OCR) and statutory cross-verification to validate this file against single window compliance rules.
                </p>
              )}

              <button
                type="button"
                onClick={handleRunAiScrutiny}
                disabled={isAiRunning}
                className="w-full mt-2 py-2 px-3 bg-[#18324A] hover:bg-[#224564] text-white text-xs font-mono-data font-bold rounded-[3px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAiRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Document with Gemini Vision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#E6AF2E]" />
                    <span>{doc.aiValidation?.status && doc.aiValidation?.status !== 'NOT_RUN' ? 'Re-Run AI Scrutiny' : 'Run AI Scrutiny & OCR'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#FAF8F2] border-2 border-[#B85C4A] rounded-[4px] p-6 shadow-[0_16px_48px_rgba(23,23,23,0.2)] z-10 auth-page-enter">
            <div className="w-10 h-10 rounded-[3px] bg-[rgba(184,92,74,0.12)] border border-[#B85C4A] text-[#B85C4A] flex items-center justify-center font-bold text-lg mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold text-[#171717] uppercase tracking-tight mb-2">
              Delete document?
            </h3>

            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans leading-relaxed mb-6">
              This will permanently remove{' '}
              <span className="font-bold text-[#171717]">{doc.name} ({doc.id})</span>{' '}
              from your business compliance records.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6D0C3]">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="bg-[#B85C4A] hover:bg-[#9E4F3F] border-[#B85C4A] text-[#FAF8F2]"
              >
                {isDeleting ? 'Deleting...' : 'Delete Document'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
