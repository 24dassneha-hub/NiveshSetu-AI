import React, { useState } from 'react';
import { ArrowLeft, Compass, Save, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import {
  getApprovalById,
  saveApproval,
  saveApprovalToSupabase,
  trackNewApplication,
  CATEGORIES,
  APPLICATION_STATUSES,
} from '../data/approvalsStorage';
import { useAuth } from '../context/AuthContext';

export default function ApprovalForm() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const editId = params?.id;
  const isEditing = Boolean(editId);

  const existingApproval = isEditing ? getApprovalById(editId) : null;

  const [approvalName, setApprovalName] = useState(existingApproval?.name || '');
  const [authorityName, setAuthorityName] = useState(existingApproval?.authority?.name || '');
  const [department, setDepartment] = useState(existingApproval?.authority?.department || '');
  const [category, setCategory] = useState(existingApproval?.category || 'Factory');
  const [applicationId, setApplicationId] = useState(
    existingApproval?.application?.applicationId || existingApproval?.id || ''
  );
  const [monitoringSource, setMonitoringSource] = useState(
    existingApproval?.monitoring?.source || 'NSWS'
  );
  const [status, setStatus] = useState(existingApproval?.status?.normalized || 'UNDER_PROCESS');
  const [currentStage, setCurrentStage] = useState(
    existingApproval?.status?.currentStage || existingApproval?.status?.sourceStatus || 'Document Scrutiny'
  );
  const [slaDays, setSlaDays] = useState(existingApproval?.sla?.durationDays || 30);
  const [certificateNumber, setCertificateNumber] = useState(existingApproval?.certificate?.number || '');
  const [remarks, setRemarks] = useState(existingApproval?.actionRequired?.message || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!approvalName.trim()) {
      setError('Please provide the clearance name.');
      return;
    }
    if (!applicationId.trim()) {
      setError('Please provide the official government application reference ID.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing && existingApproval) {
        const updatedRecord = {
          ...existingApproval,
          name: approvalName.trim(),
          category,
          authority: {
            ...existingApproval.authority,
            name: authorityName.trim() || existingApproval.authority?.name || 'Directorate of Industries',
            department: department.trim() || existingApproval.authority?.department || 'Industries Department',
          },
          application: {
            ...existingApproval.application,
            applicationId: applicationId.trim(),
            status: status === 'APPROVED' ? 'Approved' : status === 'ACTION_REQUIRED' ? 'Query Raised' : 'Under Review',
          },
          monitoring: {
            ...existingApproval.monitoring,
            source: monitoringSource,
          },
          status: {
            ...existingApproval.status,
            normalized: status,
            currentStage: currentStage.trim(),
            sourceStatus: currentStage.trim(),
            changedAt: new Date().toISOString(),
          },
          sla: {
            ...existingApproval.sla,
            durationDays: Number(slaDays) || 30,
          },
          certificate: certificateNumber.trim()
            ? {
                available: true,
                number: certificateNumber.trim(),
                issuedAt: existingApproval.certificate?.issuedAt || new Date().toISOString().split('T')[0],
                validUntil: existingApproval.certificate?.validUntil || '2028-12-31',
              }
            : existingApproval.certificate,
          actionRequired: {
            required: status === 'ACTION_REQUIRED',
            message: remarks.trim() || null,
            deadline: existingApproval.actionRequired?.deadline || null,
          },
        };

        saveApproval(updatedRecord, user);
        await saveApprovalToSupabase(updatedRecord, user);
        navigate(`/approvals/${existingApproval.id}`);
      } else {
        const newRecord = trackNewApplication({
          approvalName: approvalName.trim(),
          authorityName: authorityName.trim() || 'Issuing Department',
          applicationId: applicationId.trim(),
          monitoringSource,
          category,
        });

        if (newRecord) {
          await saveApprovalToSupabase(newRecord, user);
        }
        navigate('/approvals');
      }
    } catch (err) {
      console.error('Error saving approval:', err);
      setError('Failed to save approval record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            to={isEditing && existingApproval ? `/approvals/${existingApproval.id}` : '/approvals'}
            className="inline-flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A] hover:underline mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEditing ? 'BACK TO CLEARANCE DETAIL' : 'BACK TO APPROVAL MONITOR'}</span>
          </Link>

          <div className="pb-4 border-b border-[#262522]">
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#6E6A61] font-bold block mb-1">
              {isEditing ? `RECORD: ${existingApproval?.id || editId}` : 'CONNECT GOVERNMENT APPLICATION'}
            </span>
            <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#171717] tracking-tight">
              {isEditing ? 'Modify Clearance Details' : 'Track Government Clearance'}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#6E6A61] mt-1 leading-relaxed">
              {isEditing
                ? 'Update departmental scrutiny stages, SLA thresholds, statutory references, and clearance certificates.'
                : 'Link an official application reference or acknowledgment number you received from NSWS, OCMMS, or an Odisha single window to enable automated monitoring by Sneha AI.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#B85C4A]/10 border border-[#B85C4A]/30 rounded-[3px] text-xs font-sans text-[#B85C4A]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-[#262522] rounded-[4px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#D6D0C3]">
              1. CLEARANCE IDENTIFICATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Clearance / Approval Name *
                </label>
                <input
                  type="text"
                  required
                  value={approvalName}
                  onChange={(e) => setApprovalName(e.target.value)}
                  placeholder="e.g. Consent to Establish (CTE), Fire Safety NOC, Factory License"
                  className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-sans text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Clearance Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-mono-data text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Application / Acknowledgment ID *
                </label>
                <input
                  type="text"
                  required
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  placeholder="e.g. FL-2026-00421 or OCMMS-CTE-8401"
                  className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-mono-data font-bold text-[#18324A] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#D6D0C3]">
              2. ISSUING AUTHORITY & MONITORING
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Issuing Authority / Directorate
                </label>
                <input
                  type="text"
                  value={authorityName}
                  onChange={(e) => setAuthorityName(e.target.value)}
                  placeholder="e.g. Directorate of Factories & Boilers"
                  className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-sans text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Administrative Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Labour & ESI Department, Odisha"
                  className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-sans text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Single Window Source
                </label>
                <select
                  value={monitoringSource}
                  onChange={(e) => setMonitoringSource(e.target.value)}
                  className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-mono-data text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  <option value="NSWS">National Single Window System (NSWS)</option>
                  <option value="Department API">State Single Window (GO-SWIFT / OCMMS)</option>
                  <option value="API Setu">API Setu / Government Open API Gateway</option>
                  <option value="Direct Physical Filing">Direct Physical / Manual Filing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Notified Statutory SLA (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={slaDays}
                  onChange={(e) => setSlaDays(e.target.value)}
                  className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-mono-data text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4">
              <h2 className="font-mono-data text-xs font-bold text-[#18324A] uppercase tracking-wider pb-2 border-b border-[#D6D0C3]">
                3. STATUTORY STATUS & CERTIFICATE
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                    Clearance Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-mono-data font-bold text-[#18324A] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  >
                    {APPLICATION_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                    Current Scrutiny Stage
                  </label>
                  <input
                    type="text"
                    value={currentStage}
                    onChange={(e) => setCurrentStage(e.target.value)}
                    placeholder="e.g. Under Document Examination, Joint Site Inspection"
                    className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-sans text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                    Digital Certificate Number (if approved)
                  </label>
                  <input
                    type="text"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder="e.g. OD-FAC-2026-88412"
                    className="w-full bg-[#FAF8F2] border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-mono-data text-[#5D8068] font-bold focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                  />
                </div>

                {status === 'ACTION_REQUIRED' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono-data font-bold text-[#B85C4A] uppercase tracking-wider mb-1.5">
                      Deficiency Notice / Query Message *
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Specify the officer's query or required clarifications..."
                      className="w-full bg-[#FAF8F2] border border-[#B85C4A] rounded-[3px] py-2 px-3 text-xs font-sans text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#B85C4A]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E9E1D0] flex flex-col sm:flex-row items-center justify-between gap-4">
            {!isEditing ? (
              <Link
                to="/apply"
                className="text-xs font-mono-data font-semibold text-[#18324A] hover:underline flex items-center gap-1"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Need to prepare a new application? Go to Apply →</span>
              </Link>
            ) : (
              <span className="text-[11px] font-mono-data text-[#6E6A61] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5D8068]" />
                <span>Single Window Synchronized Record</span>
              </span>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Link
                to={isEditing && existingApproval ? `/approvals/${existingApproval.id}` : '/approvals'}
                className="px-4 py-2 bg-white border border-[#262522] text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] text-xs font-mono-data font-semibold transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#18324A] hover:bg-[#224564] text-white rounded-[3px] text-xs font-mono-data font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Connect to Monitor'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
