import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Send,
  AlertTriangle,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getApprovalById } from '../data/approvalsStorage';
import { getDocuments } from '../data/documentsStorage';
import {
  getApplicationById,
  deleteDraftApplication,
  submitApplication,
  respondToQuery,
  withdrawApplication,
  deriveNextAction,
  calculateSLAStatus,
  calculateApplicationReadiness,
} from '../data/applicationsStorage';

const LIFECYCLE_STAGES = [
  { id: 'DRAFT', label: 'Draft' },
  { id: 'READY_TO_SUBMIT', label: 'Ready' },
  { id: 'SUBMITTED', label: 'Submitted' },
  { id: 'UNDER_REVIEW', label: 'Under Review' },
  { id: 'SCRUTINY_STAGE', label: 'Query / Inspection' },
  { id: 'DECISION_PENDING', label: 'Decision' },
  { id: 'APPROVED', label: 'Approved' },
];

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const appId = params?.id;

  // Retrieve current application
  const [app, setApp] = useState(() => (appId ? getApplicationById(appId) : null));
  const [documentsList] = useState(() => getDocuments());

  // Linked approval
  const approval = useMemo(
    () => (app?.approvalId ? getApprovalById(app.approvalId) : null),
    [app]
  );

  // Readiness Engine
  const readiness = useMemo(() => {
    return calculateApplicationReadiness(app, approval, documentsList);
  }, [app, approval, documentsList]);

  // SLA status
  const slaStatus = useMemo(() => calculateSLAStatus(app), [app]);
  const nextAction = useMemo(() => deriveNextAction(app), [app]);

  // Interactive Query response state
  const [queryResponseText, setQueryResponseText] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // If application does not exist
  if (!app) {
    return (
      <DashboardShell>
        <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-12 text-center my-8">
          <span className="font-mono-data text-xs text-[#B85C4A] font-bold block mb-1">
            RECORD NOT FOUND
          </span>
          <h2 className="text-xl font-bold text-[#171717] mb-2 uppercase">
            Application {appId} does not exist
          </h2>
          <p className="text-xs text-[#6E6A61] mb-6 font-mono-data">
            The application may have been deleted or the link is invalid.
          </p>
          <Link to="/applications">
            <Button variant="primary" size="md" icon={ArrowLeft}>
              Back to Applications
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // Handle Query Clarification Submission
  const handleQueryResponseSubmit = (queryId) => {
    if (!queryResponseText.trim()) return;
    setIsSubmittingResponse(true);
    setTimeout(() => {
      const updated = respondToQuery(app.id, queryId, queryResponseText, selectedDocId, user);
      setApp(updated);
      setQueryResponseText('');
      setSelectedDocId('');
      setIsSubmittingResponse(false);
    }, 250);
  };

  // Handle Delete Draft
  const handleDeleteDraftConfirm = () => {
    setIsActionLoading(true);
    setTimeout(() => {
      deleteDraftApplication(app.id);
      setIsActionLoading(false);
      setIsDeleteModalOpen(false);
      navigate('/applications');
    }, 250);
  };

  // Handle Direct Submission
  const handleSubmitConfirm = () => {
    setIsActionLoading(true);
    setTimeout(() => {
      const updated = submitApplication(app.id, user);
      setApp(updated);
      setIsActionLoading(false);
      setIsSubmitModalOpen(false);
    }, 250);
  };

  // Handle Withdrawal
  const handleWithdrawConfirm = () => {
    setIsActionLoading(true);
    setTimeout(() => {
      const updated = withdrawApplication(app.id, withdrawReason, user);
      setApp(updated);
      setIsActionLoading(false);
      setIsWithdrawModalOpen(false);
      setWithdrawReason('');
    }, 250);
  };

  // Calculate current stage index for lifecycle tracker
  const getStageStatus = (stageId) => {
    const statusOrder = [
      'DRAFT',
      'READY_TO_SUBMIT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'QUERY_RAISED',
      'INSPECTION_PENDING',
      'DECISION_PENDING',
      'APPROVED',
    ];

    if (app.status === 'WITHDRAWN') {
      return stageId === 'DRAFT' ? 'completed' : 'disabled';
    }
    if (app.status === 'REJECTED') {
      return stageId === 'DECISION_PENDING' ? 'current' : 'completed';
    }

    if (stageId === 'SCRUTINY_STAGE') {
      if (['QUERY_RAISED', 'INSPECTION_PENDING'].includes(app.status)) return 'current';
      if (['DECISION_PENDING', 'APPROVED'].includes(app.status)) return 'completed';
      return 'future';
    }

    const currentIdx = statusOrder.indexOf(app.status);
    const stageIdx = statusOrder.indexOf(stageId);

    if (currentIdx === stageIdx) return 'current';
    if (currentIdx > stageIdx) return 'completed';
    return 'future';
  };

  const isDraft = app.status === 'DRAFT';
  const isReady = app.status === 'READY_TO_SUBMIT';
  const isQueryRaised = app.status === 'QUERY_RAISED';
  const isSubmittedOrActive = ['SUBMITTED', 'UNDER_REVIEW', 'INSPECTION_PENDING', 'DECISION_PENDING'].includes(app.status);
  const isApproved = app.status === 'APPROVED';

  return (
    <DashboardShell>
      <div className="space-y-6 pb-16">
        {/* Header and Actions Bar */}
        <div className="space-y-3 pb-4 border-b border-[#262522]">
          <Link
            to="/applications"
            className="inline-flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO APPLICATIONS</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px] border border-[#D6D0C3]">
                  {app.id}
                </span>
                <span className="font-mono-data text-xs text-[#6E6A61] bg-[#FAF8F2] px-2 py-0.5 rounded-[2px] border border-[#D6D0C3]">
                  {approval?.name || app.approvalId}
                </span>
                <StatusBadge status={app.status} label={app.status} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
                {app.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6A61] font-mono-data mt-0.5">
                {app.authority?.name} • {app.authority?.jurisdiction}, {app.authority?.state}
              </p>
            </div>

            {/* Dynamic Actions based on status */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              {/* Draft actions */}
              {isDraft && (
                <>
                  <Link to={`/applications/${app.id}/edit`}>
                    <Button variant="secondary" size="md" icon={Edit}>
                      Edit Application
                    </Button>
                  </Link>

                  <Button
                    variant="primary"
                    size="md"
                    icon={Send}
                    disabled={!readiness.canSubmit}
                    onClick={() => setIsSubmitModalOpen(true)}
                  >
                    Submit Application
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    icon={Trash2}
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-[#B85C4A] hover:bg-[#B85C4A]/10 border-[#B85C4A]/40 hover:border-[#B85C4A]"
                  >
                    Delete Draft
                  </Button>
                </>
              )}

              {/* Ready to submit */}
              {isReady && (
                <>
                  <Link to={`/applications/${app.id}/edit`}>
                    <Button variant="secondary" size="md" icon={Edit}>
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="primary"
                    size="md"
                    icon={Send}
                    onClick={() => setIsSubmitModalOpen(true)}
                  >
                    Submit Application
                  </Button>
                </>
              )}

              {/* Active submitted application withdrawal */}
              {(isSubmittedOrActive || isQueryRaised) && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="text-[#B85C4A] border-[#B85C4A]/40 hover:border-[#B85C4A]"
                >
                  Withdraw Application
                </Button>
              )}

              {/* Approved link */}
              {isApproved && (
                <Link to={`/approvals/${app.approvalId}`}>
                  <Button variant="primary" size="md" icon={ExternalLink}>
                    View Approval Dossier
                  </Button>
                </Link>
              )}

              {/* Rejected / Withdrawn restart */}
              {(app.status === 'REJECTED' || app.status === 'WITHDRAWN') && (
                <Link to="/applications/new">
                  <Button variant="secondary" size="md" icon={Send}>
                    Start New Application
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* PROMINENT ACTION REQUIRED BANNER (If Query Raised) */}
        {isQueryRaised && (
          <div className="p-5 bg-[rgba(184,92,74,0.08)] border-2 border-[#B85C4A] rounded-[4px] shadow-[0_4px_16px_rgba(184,92,74,0.08)] space-y-3">
            <div className="flex items-center gap-2 text-[#B85C4A] font-bold text-xs font-mono-data uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>ACTION REQUIRED — CLARIFICATION QUERY PENDING</span>
            </div>

            <p className="text-sm font-sans font-semibold text-[#171717]">
              The scrutinizing officer has raised an inquiry regarding this filing. Please review the query details below and submit your response before the deadline.
            </p>

            <a
              href="#query-section"
              className="inline-flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A] hover:underline"
            >
              <span>JUMP TO QUERY & SUBMIT RESPONSE ↓</span>
            </a>
          </div>
        )}

        {/* LIFECYCLE PROGRESS TRACKER */}
        <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
          <div className="flex items-center justify-between border-b border-[#D6D0C3] pb-2">
            <span className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider">
              LIFECYCLE PROGRESS TRACKER
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61]">
              Current: <strong className="text-[#171717]">{app.status}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 font-mono-data text-xs">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const stageState = getStageStatus(stage.id);

              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-[3px] border transition-colors flex flex-col justify-between ${
                    stageState === 'current'
                      ? 'bg-[#18324A] text-[#FAF8F2] border-[#18324A]'
                      : stageState === 'completed'
                      ? 'bg-[#FAF8F2] text-[#5D8068] border-[#5D8068]'
                      : 'bg-[#FAF8F2]/60 text-[#8B8982] border-[#D6D0C3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px]">
                    <span className="font-bold">0{idx + 1}</span>
                    <span>
                      {stageState === 'completed' ? '✓' : stageState === 'current' ? '●' : '○'}
                    </span>
                  </div>
                  <span className="font-bold text-[11px] truncate leading-tight">
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* KEY METADATA QUICK BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 text-xs font-mono-data shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
          <div className="border-r border-[#D6D0C3] pr-2">
            <span className="text-[10px] text-[#6E6A61] uppercase block">SUBMISSION MODE</span>
            <span className="font-bold text-sm text-[#18324A] truncate block mt-0.5">
              {app.submission?.mode || 'ONLINE'}
            </span>
          </div>

          <div className="sm:border-r border-[#D6D0C3] pr-2">
            <span className="text-[10px] text-[#6E6A61] uppercase block">SUBMITTED DATE</span>
            <span className="font-bold text-sm text-[#171717] truncate block mt-0.5">
              {app.submission?.submittedAt
                ? new Date(app.submission.submittedAt).toLocaleDateString()
                : 'Not Submitted'}
            </span>
          </div>

          <div className="border-r border-[#D6D0C3] pr-2">
            <span className="text-[10px] text-[#6E6A61] uppercase block">SLA DEADLINE</span>
            <span
              className="font-bold text-sm truncate block mt-0.5"
              style={{
                color:
                  slaStatus === 'BREACHED'
                    ? '#B85C4A'
                    : slaStatus === 'AT_RISK'
                    ? '#C08A3E'
                    : '#171717',
              }}
            >
              {app.sla?.deadline || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#6E6A61] uppercase block">NEXT ACTION</span>
            <span className="font-bold text-sm text-[#18324A] truncate block mt-0.5">
              {nextAction}
            </span>
          </div>
        </div>

        {/* DETAILED SCRUTINY SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Queries, Documents, Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* QUERY MANAGEMENT SECTION (Anchored by #query-section) */}
            <div
              id="query-section"
              className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#262522]">
                <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>DEPARTMENTAL INQUIRIES & QUERIES ({app.queries?.length || 0})</span>
                </h2>
                {app.queries?.some((q) => q.status === 'OPEN') && (
                  <span className="text-[10px] font-mono-data text-[#B85C4A] font-bold">
                    ! CLARIFICATION REQUIRED
                  </span>
                )}
              </div>

              {(!app.queries || app.queries.length === 0) ? (
                <p className="text-xs font-mono-data text-[#6E6A61] bg-[#E9E1D0]/40 p-4 border border-[#D6D0C3] rounded text-center">
                  No official queries or objections have been raised for this application filing.
                </p>
              ) : (
                <div className="space-y-4">
                  {app.queries.map((qry) => (
                    <div
                      key={qry.id}
                      className="p-4 bg-[#FFFFFF] border border-[#262522] rounded-[3px] space-y-3 font-mono-data text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-[#D6D0C3] pb-2">
                        <div>
                          <span className="font-bold text-[#171717] font-sans text-sm block">
                            {qry.subject}
                          </span>
                          <span className="text-[10px] text-[#6E6A61] mt-0.5 block">
                            Raised: {new Date(qry.raisedAt).toLocaleDateString()} • Due: {qry.dueDate || 'Immediate'}
                          </span>
                        </div>
                        <StatusBadge status={qry.status} label={qry.status} />
                      </div>

                      <p className="font-sans text-xs text-[#30302D] leading-relaxed">
                        {qry.description}
                      </p>

                      {/* If query has already been responded */}
                      {qry.status === 'RESPONDED' ? (
                        <div className="p-3 bg-[rgba(93,128,104,0.08)] border border-[#5D8068]/40 rounded text-xs space-y-1">
                          <span className="text-[10px] text-[#5D8068] font-bold uppercase block">
                            ✓ RESPONSE SUBMITTED ON {new Date(qry.respondedAt).toLocaleDateString()}
                          </span>
                          <p className="text-[#171717] font-sans">
                            {qry.response}
                          </p>
                        </div>
                      ) : (
                        /* Open Query Response Form */
                        <div className="pt-2 border-t border-[#D6D0C3] space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#171717] uppercase mb-1">
                              Enter Applicant Clarification Response *
                            </label>
                            <textarea
                              rows={3}
                              value={queryResponseText}
                              onChange={(e) => setQueryResponseText(e.target.value)}
                              placeholder="Provide the requested details or explain regulatory adherence..."
                              className="w-full p-2.5 bg-[#FAF8F2] border border-[#D6D0C3] focus:border-[#18324A] rounded text-xs font-mono-data text-[#171717] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#171717] uppercase mb-1">
                              Attach Supporting Document from Records (Optional)
                            </label>
                            <select
                              value={selectedDocId}
                              onChange={(e) => setSelectedDocId(e.target.value)}
                              className="w-full h-9 px-2.5 bg-[#FAF8F2] border border-[#D6D0C3] rounded text-xs font-mono-data text-[#171717] focus:outline-none"
                            >
                              <option value="">No Document Attached</option>
                              {documentsList.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name} ({d.id})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              icon={Send}
                              disabled={!queryResponseText.trim() || isSubmittingResponse}
                              onClick={() => handleQueryResponseSubmit(qry.id)}
                            >
                              {isSubmittingResponse ? 'Submitting...' : 'Submit Clarification'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* APPLICATION DOCUMENTS CHECKLIST */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#262522]">
                <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider">
                  REQUIRED SUPPORTING DOCUMENTS
                </h2>
                <span className="text-[10px] font-mono-data text-[#6E6A61]">
                  Readiness: <strong className="text-[#171717]">{readiness.completionPercentage}%</strong>
                </span>
              </div>

              {approval?.documents?.length > 0 ? (
                <div className="divide-y divide-[#D6D0C3] border border-[#262522] rounded-[3px] bg-[#FFFFFF] overflow-hidden">
                  {approval.documents.map((docReq, idx) => {
                    const match = documentsList.find(
                      (d) =>
                        (d.approvalId === approval.id || (app.documentIds || []).includes(d.id)) &&
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
                              {isAvailable ? `Linked Document (${match.id})` : 'Missing document file'}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isAvailable ? (
                            <Link to={`/documents/${match.id}`}>
                              <button className="text-xs font-bold text-[#18324A] hover:underline flex items-center gap-1">
                                <span>View File</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </Link>
                          ) : (
                            <Link to="/documents/new">
                              <span className="text-xs font-bold text-[#B85C4A] hover:underline">
                                Upload
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
                  No specific statutory documents attached to this approval.
                </p>
              )}
            </div>

            {/* OPERATIONAL NOTES */}
            {app.notes && (
              <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-2">
                <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
                  INTERNAL FILING NOTES
                </h2>
                <p className="text-xs sm:text-sm font-sans text-[#30302D] leading-relaxed whitespace-pre-line">
                  {app.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Authority, Inspection, Timeline */}
          <div className="lg:col-span-5 space-y-6">
            {/* Authority Dossier */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
                AUTHORITY DETAILS
              </h2>

              <div className="space-y-2.5 text-xs font-mono-data">
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block">DEPARTMENT / AUTHORITY</span>
                  <span className="font-bold text-[#171717] font-sans text-sm block">
                    {app.authority?.name || '—'}
                  </span>
                </div>

                {app.authority?.department && (
                  <div>
                    <span className="text-[10px] text-[#6E6A61] uppercase block">DIRECTORATE</span>
                    <span className="font-medium text-[#30302D]">
                      {app.authority.department}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D6D0C3]">
                  <div>
                    <span className="text-[10px] text-[#6E6A61] uppercase block">JURISDICTION</span>
                    <span className="font-bold text-[#18324A]">
                      {app.authority?.jurisdiction || 'Odisha'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#6E6A61] uppercase block">STATE</span>
                    <span className="font-bold text-[#171717]">
                      {app.authority?.state || 'Odisha'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Dossier */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#262522]">
                <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider">
                  FIELD INSPECTION
                </h2>
                <StatusBadge
                  status={app.inspection?.status || 'NOT_REQUIRED'}
                  label={app.inspection?.status || 'NOT_REQUIRED'}
                />
              </div>

              <div className="text-xs font-mono-data space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6A61]">Inspection Required:</span>
                  <span className={`font-bold ${app.inspection?.required ? 'text-[#18324A]' : 'text-[#6E6A61]'}`}>
                    {app.inspection?.required ? 'Yes' : 'No'}
                  </span>
                </div>

                {app.inspection?.scheduledDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6A61]">Scheduled Date:</span>
                    <span className="font-bold text-[#171717]">
                      {app.inspection.scheduledDate}
                    </span>
                  </div>
                )}

                {app.inspection?.location && (
                  <div>
                    <span className="text-[10px] text-[#6E6A61] uppercase block">LOCATION</span>
                    <span className="font-sans text-[#30302D]">
                      {app.inspection.location}
                    </span>
                  </div>
                )}

                {app.inspection?.notes && (
                  <div className="p-2.5 bg-[#E9E1D0]/60 border border-[#D6D0C3] rounded mt-2">
                    <span className="text-[10px] text-[#18324A] font-bold uppercase block mb-0.5">
                      INSPECTOR NOTE
                    </span>
                    <p className="font-sans text-[#171717]">
                      {app.inspection.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Timeline Stream */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#262522]">
                ACTIVITY & AUDIT TIMELINE
              </h2>

              {(!app.timeline || app.timeline.length === 0) ? (
                <p className="text-xs font-mono-data text-[#6E6A61]">
                  No events logged yet.
                </p>
              ) : (
                <div className="relative pl-5 space-y-4 border-l-2 border-[#D6D0C3] my-2 font-mono-data text-xs">
                  {app.timeline.map((evt) => (
                    <div key={evt.id} className="relative group">
                      <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#FAF8F2] border-2 border-[#18324A] flex items-center justify-center" />
                      <div className="flex items-center justify-between text-[10px] text-[#6E6A61] mb-0.5">
                        <span>{evt.timestamp ? new Date(evt.timestamp).toLocaleDateString() : '—'}</span>
                        <span className="font-bold">{evt.actor || 'System'}</span>
                      </div>
                      <span className="font-sans font-bold text-xs text-[#171717] block leading-tight">
                        {evt.title}
                      </span>
                      {evt.description && (
                        <p className="text-[11px] font-sans text-[#6E6A61] mt-0.5 leading-snug">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE DRAFT MODAL */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
            onClick={() => !isActionLoading && setIsDeleteModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#FAF8F2] border-2 border-[#B85C4A] rounded-[4px] p-6 shadow-[0_16px_48px_rgba(23,23,23,0.2)] z-10 auth-page-enter">
            <div className="w-10 h-10 rounded-[3px] bg-[rgba(184,92,74,0.12)] border border-[#B85C4A] text-[#B85C4A] flex items-center justify-center font-bold text-lg mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold text-[#171717] uppercase tracking-tight mb-2">
              Delete draft application?
            </h3>

            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans leading-relaxed mb-6">
              This will permanently delete draft filing <span className="font-bold text-[#171717]">{app.title} ({app.id})</span>. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6D0C3]">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isActionLoading}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isActionLoading}
                onClick={handleDeleteDraftConfirm}
                className="bg-[#B85C4A] hover:bg-[#9E4F3F] border-[#B85C4A] text-[#FAF8F2]"
              >
                {isActionLoading ? 'Deleting...' : 'Delete Draft'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SUBMISSION MODAL */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
            onClick={() => !isActionLoading && setIsSubmitModalOpen(false)}
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
                disabled={isActionLoading}
                onClick={() => setIsSubmitModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isActionLoading}
                onClick={handleSubmitConfirm}
              >
                {isActionLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW APPLICATION MODAL */}
      {isWithdrawModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
            onClick={() => !isActionLoading && setIsWithdrawModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#FAF8F2] border-2 border-[#B85C4A] rounded-[4px] p-6 shadow-[0_16px_48px_rgba(23,23,23,0.2)] z-10 auth-page-enter">
            <div className="w-10 h-10 rounded-[3px] bg-[rgba(184,92,74,0.12)] border border-[#B85C4A] text-[#B85C4A] flex items-center justify-center font-bold text-lg mb-4">
              <XCircle className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold text-[#171717] uppercase tracking-tight mb-2">
              Withdraw application?
            </h3>

            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans leading-relaxed mb-4">
              This will mark the filing as withdrawn. This action should only be used if you no longer want to proceed with this submission.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase mb-1">
                Reason for Withdrawal (Optional)
              </label>
              <input
                type="text"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="e.g. Plan revised or project capacity modified"
                className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded text-xs font-mono-data text-[#171717] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6D0C3]">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isActionLoading}
                onClick={() => setIsWithdrawModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isActionLoading}
                onClick={handleWithdrawConfirm}
                className="bg-[#B85C4A] hover:bg-[#9E4F3F] border-[#B85C4A] text-[#FAF8F2]"
              >
                {isActionLoading ? 'Withdrawing...' : 'Withdraw Application'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
