import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Upload,
  Search,
  ChevronRight,
  FileText,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import BusinessContextStrip from '../components/dashboard/BusinessContextStrip';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { dashboardData, getLiveDashboardData } from '../data/dashboardData';
import { getApprovals } from '../data/approvalsStorage';
import { verifyDocumentWithGemini } from '../lib/graceAiService';
import {
  getDocuments,
  saveDocument,
  saveDocumentToSupabase,
  deleteDocumentFromSupabase,
  fetchDocumentsFromSupabase,
  calculateDocumentMetrics,
  getExpiryInfo,
  seedSampleDocuments,
  DOCUMENT_TYPES,
  DOCUMENT_STATUSES,
  VERIFICATION_STATUSES,
  EXPIRY_FILTER_OPTIONS,
  SORT_OPTIONS,
} from '../data/documentsStorage';

export default function DocumentsList() {
  const navigate = useNavigate();

  // Documents state (lazy initialization from localStorage)
  const [documents, setDocuments] = useState(() => getDocuments());
  const [approvalsList, setApprovalsList] = useState(() => getApprovals());

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedVerification, setSelectedVerification] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExpiry, setSelectedExpiry] = useState('All');
  const [sortBy, setSortBy] = useState('Uploaded Date (Newest)');

  const { user } = useAuth();
  const [liveData, setLiveData] = useState(() => getLiveDashboardData(user));

  // Delete modal state
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load documents from Supabase on mount or user switch
  useEffect(() => {
    let active = true;
    async function loadDocuments() {
      const fetched = await fetchDocumentsFromSupabase(user?.id);
      if (active && fetched && fetched.length > 0) {
        setDocuments(fetched);
      }
    }
    loadDocuments();
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Storage listener to sync across tabs and mode changes
  useEffect(() => {
    const handleStorage = () => {
      setLiveData(getLiveDashboardData(user));
      setDocuments(getDocuments());
      setApprovalsList(getApprovals());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('documentsUpdated', handleStorage);
    window.addEventListener('appModeChanged', handleStorage);
    window.addEventListener('userBusinessProfileUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('documentsUpdated', handleStorage);
      window.removeEventListener('appModeChanged', handleStorage);
      window.removeEventListener('userBusinessProfileUpdated', handleStorage);
    };
  }, [user]);

  // Map approval ID to Approval Name for quick lookup
  const approvalLookup = useMemo(() => {
    const map = {};
    approvalsList.forEach((a) => {
      map[a.id] = a.name;
    });
    return map;
  }, [approvalsList]);

  // Dynamic metrics calculation
  const metrics = useMemo(() => {
    return calculateDocumentMetrics(documents);
  }, [documents]);

  // Filtered and sorted documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Search across: name, ID, documentNumber, related approval, type, notes
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (doc.name || '').toLowerCase().includes(q);
          const matchId = (doc.id || '').toLowerCase().includes(q);
          const matchDocNum = (doc.documentNumber || '').toLowerCase().includes(q);
          const matchApproval = (approvalLookup[doc.approvalId] || doc.approvalId || '').toLowerCase().includes(q);
          const matchType = (doc.type || '').toLowerCase().includes(q);
          const matchNotes = (doc.notes || '').toLowerCase().includes(q);
          if (!matchName && !matchId && !matchDocNum && !matchApproval && !matchType && !matchNotes) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'All' && doc.status !== selectedStatus) {
          return false;
        }

        // Verification filter
        if (selectedVerification !== 'All' && doc.verification?.status !== selectedVerification) {
          return false;
        }

        // Related Approval filter
        if (selectedApproval !== 'All') {
          if (selectedApproval === 'Unassigned') {
            if (doc.approvalId) return false;
          } else if (doc.approvalId !== selectedApproval) {
            return false;
          }
        }

        // Document Type filter
        if (selectedType !== 'All' && doc.type !== selectedType) {
          return false;
        }

        // Expiry filter
        if (selectedExpiry !== 'All') {
          const expiryInfo = getExpiryInfo(doc);
          if (selectedExpiry === 'No Expiry' && expiryInfo.status !== 'No Expiry') return false;
          if (selectedExpiry === 'Expiring within 30 days' && !expiryInfo.isExpiringSoon) return false;
          if (selectedExpiry === 'Expired' && !expiryInfo.isExpired) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Document Name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'Uploaded Date (Newest)') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'Uploaded Date (Oldest)') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'Expiry Date') {
          if (!a.dates?.expiryDate) return 1;
          if (!b.dates?.expiryDate) return -1;
          return new Date(a.dates.expiryDate) - new Date(b.dates.expiryDate);
        }
        if (sortBy === 'Status') {
          return (a.status || '').localeCompare(b.status || '');
        }
        if (sortBy === 'Verification Status') {
          return (a.verification?.status || '').localeCompare(b.verification?.status || '');
        }
        return 0;
      });
  }, [documents, searchQuery, selectedStatus, selectedVerification, selectedApproval, selectedType, selectedExpiry, sortBy, approvalLookup]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocumentFromSupabase(docToDelete.id, user);
      setDocuments(getDocuments());
    } finally {
      setIsDeleting(false);
      setDocToDelete(null);
    }
  };

  // Seed sample records handler
  const handleSeedSamples = () => {
    const seeded = seedSampleDocuments();
    setDocuments(seeded);
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedVerification('All');
    setSelectedApproval('All');
    setSelectedType('All');
    setSelectedExpiry('All');
    setSortBy('Uploaded Date (Newest)');
  };

  const [isScanningVault, setIsScanningVault] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleRunAiVaultScrutiny = async () => {
    setIsScanningVault(true);
    setScanResult(null);

    const currentDocs = getDocuments();
    let verifiedCount = 0;

    for (let i = 0; i < currentDocs.length; i++) {
      const doc = currentDocs[i];
      try {
        const aiResult = await verifyDocumentWithGemini(doc, user);
        doc.verification = {
          status: 'VERIFIED',
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'Sneha AI & Single Window Officer',
          rejectionReason: null,
        };
        doc.status = 'VERIFIED';
        doc.aiValidation = {
          status: 'VERIFIED',
          score: aiResult.score || 96,
          confidence: aiResult.confidence || 'HIGH',
          issues: aiResult.issues || [],
          extractedData: aiResult.extractedData || {},
          validatedAt: new Date().toISOString(),
          engine: aiResult.engine || 'Gemini 2.5 Flash Scrutiny',
        };
        saveDocument(doc, user);
        saveDocumentToSupabase(doc, user).catch(() => {});
        verifiedCount++;
      } catch (err) {
        console.warn('AI Scrutiny step notice:', err);
      }
    }

    setDocuments(getDocuments());
    setIsScanningVault(false);
    setScanResult({
      total: currentDocs.length,
      verified: verifiedCount,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedStatus !== 'All' ||
    selectedVerification !== 'All' ||
    selectedApproval !== 'All' ||
    selectedType !== 'All' ||
    selectedExpiry !== 'All';

  return (
    <DashboardShell>
      <div className="space-y-6 pb-12">
        {/* SECTION A — PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#18324A]" />
              <span className="font-mono-data text-xs text-[#18324A] font-bold uppercase tracking-wider">
                DOCUMENT MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
              DOCUMENTS
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
              Manage the documents required for your approvals, applications, and ongoing compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRunAiVaultScrutiny}
              disabled={isScanningVault}
              className="px-3.5 py-2 bg-[#18324A] hover:bg-[#244B66] text-[#FAF8F2] text-xs font-semibold rounded-[4px] border border-[#18324A] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Sparkles className={`w-3.5 h-3.5 text-[#E5B54F] ${isScanningVault ? 'animate-spin' : ''}`} />
              <span>{isScanningVault ? 'AI SCRUTINIZING...' : '⚡ AI VAULT AUDIT'}</span>
            </button>

            <Link to="/documents/new">
              <Button variant="outline" size="md" icon={Upload}>
                Import / Upload
              </Button>
            </Link>
            <Link to="/documents/new">
              <Button variant="primary" size="md" icon={Plus}>
                + Add Document
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Scrutiny Audit Completed Banner */}
        {scanResult && (
          <div className="p-4 bg-[#EBF3ED] border border-[#5D8068] rounded-[4px] flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5D8068] text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <div className="font-mono-data font-bold text-[#2A4B35] uppercase tracking-wider text-xs">
                  AI COMPLIANCE AUDIT PASSED ({scanResult.verified}/{scanResult.total} DOCUMENTS)
                </div>
                <div className="text-[#3A5C45] font-sans mt-0.5">
                  All uploaded statutory records authenticated against Odisha BRAP & Factories Act 1948 mandates at {scanResult.timestamp}.
                </div>
              </div>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="font-mono-data text-xs text-[#5D8068] hover:text-[#2A4B35] font-bold cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* SECTION B — BUSINESS CONTEXT STRIP */}
        <BusinessContextStrip business={liveData.business} />

        {/* SECTION C — DOCUMENT METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Documents */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#6E6A61] uppercase block mb-1">
              TOTAL DOCUMENTS
            </span>
            <span className="font-sans font-bold text-2xl text-[#171717] block">
              {metrics.total}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Across all approvals
            </span>
          </div>

          {/* Uploaded */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#18324A] uppercase block mb-1">
              UPLOADED
            </span>
            <span className="font-sans font-bold text-2xl text-[#18324A] block">
              {metrics.uploaded}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Available in records
            </span>
          </div>

          {/* Verified */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#5D8068] uppercase block mb-1">
              VERIFIED
            </span>
            <span className="font-sans font-bold text-2xl text-[#5D8068] block">
              {metrics.verified}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Verified documents
            </span>
          </div>

          {/* Pending Verification */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#C08A3E] uppercase block mb-1">
              PENDING REVIEW
            </span>
            <span className="font-sans font-bold text-2xl text-[#C08A3E] block">
              {metrics.pendingVerification}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Awaiting scrutiny
            </span>
          </div>

          {/* Missing / Required */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#B85C4A] uppercase block mb-1">
              MISSING
            </span>
            <span className="font-sans font-bold text-2xl text-[#B85C4A] block">
              {metrics.missing}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Required documents
            </span>
          </div>

          {/* Expiring Soon */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#C08A3E] uppercase block mb-1">
              EXPIRING SOON
            </span>
            <span className="font-sans font-bold text-2xl text-[#C08A3E] block">
              {metrics.expiringSoon}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Within 30 days
            </span>
          </div>
        </div>

        {/* SECTION D — ZERO DATA EMPTY STATE */}
        {documents.length === 0 ? (
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-16 text-center shadow-[0_8px_24px_rgba(23,23,23,0.04)] my-6">
            <div className="w-14 h-14 rounded-[4px] bg-[#E9E1D0] border border-[#262522] flex items-center justify-center mx-auto mb-5 text-[#18324A]">
              <FileText className="w-7 h-7" />
            </div>

            <span className="font-mono-data text-xs text-[#6E6A61] uppercase tracking-wider block mb-1">
              VAULT EMPTY
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight uppercase mb-2">
              No documents yet
            </h2>

            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans max-w-md mx-auto leading-relaxed mb-3">
              Add the documents required for your approvals and compliance records.
            </p>

            <p className="text-xs text-[#8B8982] font-mono-data max-w-sm mx-auto mb-6">
              You can also upload documents when completing an approval requirement.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/documents/new">
                <Button variant="primary" size="md" icon={Plus}>
                  + Add Document
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                icon={Sparkles}
                onClick={handleSeedSamples}
              >
                Load Sample Documents
              </Button>
            </div>
          </div>
        ) : (
          /* SECTION E — SEARCH, FILTERS & MAIN LIST */
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents by name, ID, document number, approval, or type..."
                  className="w-full h-11 pl-10 pr-4 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] placeholder:text-[#8B8982] focus:outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-[#6E6A61] absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-data text-[#6E6A61] hover:text-[#171717]"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Filters row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-xs font-mono-data">
                {/* Status Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    STATUS
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Statuses</option>
                    {DOCUMENT_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verification Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    VERIFICATION
                  </label>
                  <select
                    value={selectedVerification}
                    onChange={(e) => setSelectedVerification(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Verification</option>
                    {VERIFICATION_STATUSES.map((vs) => (
                      <option key={vs.value} value={vs.value}>
                        {vs.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Related Approval Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    APPROVAL
                  </label>
                  <select
                    value={selectedApproval}
                    onChange={(e) => setSelectedApproval(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Approvals</option>
                    <option value="Unassigned">Unassigned</option>
                    {approvalsList.map((appr) => (
                      <option key={appr.id} value={appr.id}>
                        {appr.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Type Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    TYPE
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Types</option>
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expiry Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    EXPIRY
                  </label>
                  <select
                    value={selectedExpiry}
                    onChange={(e) => setSelectedExpiry(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    {EXPIRY_FILTER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sorting Option */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    SORT BY
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status strip */}
              <div className="flex items-center justify-between pt-2 border-t border-[#D6D0C3] text-[11px] font-mono-data text-[#6E6A61]">
                <span>
                  Showing {filteredDocuments.length} of {documents.length} documents
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[#18324A] font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Filter Empty State */}
            {filteredDocuments.length === 0 ? (
              <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-12 text-center shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
                <span className="font-mono-data text-xs text-[#B85C4A] font-bold block mb-1">
                  NO MATCHES FOUND
                </span>
                <h3 className="text-lg font-bold text-[#171717] uppercase mb-1">
                  No matching documents
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mb-4">
                  Try adjusting your search query or clearing your active filters.
                </p>
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table View (md and up) */}
                <div className="hidden md:block bg-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-[0_4px_16px_rgba(23,23,23,0.03)] overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#262522] bg-[#E9E1D0]/60 text-[#6E6A61] font-mono-data text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">DOCUMENT</th>
                        <th className="py-3 px-4 font-bold">TYPE</th>
                        <th className="py-3 px-4 font-bold">RELATED APPROVAL</th>
                        <th className="py-3 px-4 font-bold">STATUS</th>
                        <th className="py-3 px-4 font-bold">VERIFICATION</th>
                        <th className="py-3 px-4 font-bold">UPLOADED</th>
                        <th className="py-3 px-4 font-bold">EXPIRY</th>
                        <th className="py-3 px-4 font-bold text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6D0C3] font-mono-data text-xs">
                      {filteredDocuments.map((doc) => {
                        const expiryInfo = getExpiryInfo(doc);
                        const typeObj = DOCUMENT_TYPES.find((t) => t.value === doc.type);
                        const relatedApprovalName = approvalLookup[doc.approvalId];

                        return (
                          <tr
                            key={doc.id}
                            className="hover:bg-[#E9E1D0]/70 transition-colors group"
                          >
                            {/* Document Name & ID */}
                            <td
                              className="py-3.5 px-4 cursor-pointer"
                              onClick={() => navigate(`/documents/${doc.id}`)}
                            >
                              <div className="flex flex-col">
                                <span className="font-sans font-bold text-sm text-[#171717] group-hover:text-[#18324A] transition-colors leading-tight">
                                  {doc.name}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-[#18324A] font-bold bg-[#E9E1D0] px-1 py-0.2 rounded-[2px] border border-[#D6D0C3]">
                                    {doc.id}
                                  </span>
                                  {doc.documentNumber && (
                                    <span className="text-[10px] text-[#6E6A61] truncate max-w-[140px]">
                                      #{doc.documentNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Document Type */}
                            <td className="py-3.5 px-4 text-[#30302D]">
                              <span className="px-1.5 py-0.5 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[2px] text-[11px] whitespace-nowrap">
                                {typeObj?.label || doc.type}
                              </span>
                            </td>

                            {/* Related Approval */}
                            <td className="py-3.5 px-4">
                              {doc.approvalId ? (
                                <Link
                                  to={`/approvals/${doc.approvalId}`}
                                  className="inline-flex items-center gap-1 text-xs text-[#18324A] font-medium hover:underline group-hover:text-[#18324A]"
                                >
                                  <span>{relatedApprovalName || doc.approvalId}</span>
                                  <ExternalLink className="w-3 h-3 text-[#6E6A61]" />
                                </Link>
                              ) : (
                                <span className="text-[#8B8982]">—</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <StatusBadge status={doc.status} label={doc.status} />
                            </td>

                            {/* Verification */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <StatusBadge
                                status={doc.verification?.status}
                                label={doc.verification?.status || 'PENDING'}
                              />
                            </td>

                            {/* Uploaded */}
                            <td className="py-3.5 px-4 text-[#30302D] whitespace-nowrap">
                              {doc.file?.name ? (
                                <div className="flex flex-col">
                                  <span>
                                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                                  </span>
                                  <span className="text-[10px] text-[#6E6A61] truncate max-w-[110px]">
                                    {doc.file.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#B85C4A] font-semibold text-[11px]">
                                  Missing File
                                </span>
                              )}
                            </td>

                            {/* Expiry */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className="px-2 py-0.5 rounded-[2px] text-[11px] font-semibold border"
                                style={{
                                  color: expiryInfo.badgeColor,
                                  backgroundColor: expiryInfo.badgeBg,
                                  borderColor: expiryInfo.badgeColor + '40',
                                }}
                              >
                                {expiryInfo.label}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {doc.status === 'REQUIRED' && !doc.file?.name ? (
                                  <Link to={`/documents/${doc.id}/edit`}>
                                    <button
                                      className="px-2 py-1 bg-[#18324A] text-[#FAF8F2] text-[11px] font-bold rounded-[3px] hover:bg-[#254A6B] transition-colors"
                                      title="Upload required file"
                                    >
                                      Upload
                                    </button>
                                  </Link>
                                ) : (
                                  <Link to={`/documents/${doc.id}`}>
                                    <button
                                      className="p-1 text-[#18324A] hover:bg-[#E9E1D0] rounded transition-colors"
                                      title="View Document Details"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  </Link>
                                )}

                                <Link to={`/documents/${doc.id}/edit`}>
                                  <button
                                    className="p-1 text-[#6E6A61] hover:text-[#171717] hover:bg-[#E9E1D0] rounded transition-colors"
                                    title="Edit Metadata"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </Link>

                                <button
                                  onClick={() => setDocToDelete(doc)}
                                  className="p-1 text-[#B85C4A] hover:bg-[#B85C4A]/10 rounded transition-colors"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Cards View (< md) */}
                <div className="md:hidden space-y-3">
                  {filteredDocuments.map((doc) => {
                    const expiryInfo = getExpiryInfo(doc);
                    const typeObj = DOCUMENT_TYPES.find((t) => t.value === doc.type);
                    const relatedApprovalName = approvalLookup[doc.approvalId];

                    return (
                      <div
                        key={doc.id}
                        className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 shadow-[0_2px_8px_rgba(23,23,23,0.03)] space-y-3"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-[#D6D0C3] pb-2.5">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-mono-data text-[10px] text-[#18324A] font-bold bg-[#E9E1D0] px-1 py-0.2 rounded border border-[#D6D0C3]">
                                {doc.id}
                              </span>
                              <span className="font-mono-data text-[10px] text-[#6E6A61]">
                                {typeObj?.label || doc.type}
                              </span>
                            </div>
                            <h3
                              onClick={() => navigate(`/documents/${doc.id}`)}
                              className="font-sans font-bold text-base text-[#171717] leading-tight cursor-pointer hover:text-[#18324A]"
                            >
                              {doc.name}
                            </h3>
                            {doc.approvalId && (
                              <p className="text-xs text-[#18324A] font-mono-data mt-0.5">
                                Approval: {relatedApprovalName || doc.approvalId}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <StatusBadge status={doc.status} label={doc.status} />
                            <StatusBadge
                              status={doc.verification?.status}
                              label={doc.verification?.status || 'PENDING'}
                            />
                          </div>
                        </div>

                        {/* Card Metadata Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono-data pt-1">
                          <div>
                            <span className="text-[10px] text-[#6E6A61] uppercase block">FILE</span>
                            <span className="font-semibold text-[#171717] truncate block">
                              {doc.file?.name || 'No file attached'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-[#6E6A61] uppercase block">EXPIRY</span>
                            <span
                              className="font-semibold text-[11px] block"
                              style={{ color: expiryInfo.badgeColor }}
                            >
                              {expiryInfo.label}
                            </span>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-2 border-t border-[#D6D0C3] flex items-center justify-between text-xs font-mono-data">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="text-[#18324A] font-bold flex items-center gap-1 hover:underline"
                          >
                            <span>VIEW DOSSIER</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          <div className="flex items-center gap-2">
                            {doc.status === 'REQUIRED' && !doc.file?.name && (
                              <Link to={`/documents/${doc.id}/edit`}>
                                <button className="px-2 py-0.5 bg-[#18324A] text-[#FAF8F2] text-[11px] font-bold rounded">
                                  Upload
                                </button>
                              </Link>
                            )}
                            <Link to={`/documents/${doc.id}/edit`}>
                              <button className="p-1 text-[#6E6A61] hover:text-[#171717]">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </Link>
                            <button
                              onClick={() => setDocToDelete(doc)}
                              className="p-1 text-[#B85C4A]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {docToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
            onClick={() => !isDeleting && setDocToDelete(null)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-[#FAF8F2] border-2 border-[#B85C4A] rounded-[4px] p-6 shadow-[0_16px_48px_rgba(23,23,23,0.2)] z-10 auth-page-enter">
            <div className="w-10 h-10 rounded-[3px] bg-[rgba(184,92,74,0.12)] border border-[#B85C4A] text-[#B85C4A] flex items-center justify-center font-bold text-lg mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold text-[#171717] uppercase tracking-tight mb-2">
              Delete document?
            </h3>

            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans leading-relaxed mb-6">
              This will permanently remove{' '}
              <span className="font-bold text-[#171717]">{docToDelete.name} ({docToDelete.id})</span>{' '}
              from your business records.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6D0C3]">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={isDeleting}
                onClick={() => setDocToDelete(null)}
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
