import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Download, CheckCircle2, FileText, ArrowUpRight } from 'lucide-react';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';

export default function ApprovalChecklistModal({ isOpen, onClose, profileData }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!isOpen) return null;

  const checklist = [
    {
      id: 'gst',
      approval: 'GST Registration (Goods & Services Tax)',
      authority: 'Commercial Taxes Department, Government of Odisha',
      reason: 'Mandatory statutory tax registration for input tax credit and interstate trade.',
      documents: '3 documents (PAN, Bank Verification, Proof of Principal Place of Business)',
      time: '3–5 Days',
      status: 'approved',
      statusText: 'Approved',
      acts: 'Central GST Act 2017 & Odisha GST Act 2017',
      stage: 'Pre-Establishment',
    },
    {
      id: 'land_allotment',
      approval: 'Industrial Land Allotment & Lease Deed',
      authority: 'Odisha Industrial Infrastructure Development Corp (IDCO)',
      reason: 'Statutory lease agreement for industrial plot possession in designated estate.',
      documents: '5 documents (DPR, Board Resolution, Net Worth Certificate, IDCO Form A)',
      time: '14–21 Days',
      status: 'approved',
      statusText: 'Approved',
      acts: 'Odisha Industrial Infrastructure Development Corporation Act 1980',
      stage: 'Pre-Establishment',
    },
    {
      id: 'factory_plan',
      approval: 'Factory Building Plan Approval',
      authority: 'Directorate of Factories & Boilers, Labour & ESI Department',
      reason: 'Mandatory structural, ventilation, machinery layout, and fire exit safety audit.',
      documents: '6 documents (Site Plan, Machine Layout, Section Elevations, Form 1)',
      time: '15–20 Days',
      status: 'approved',
      statusText: 'Approved',
      acts: 'Section 6 of Factories Act 1948 & Odisha Factories Rules 1950',
      stage: 'Pre-Construction',
    },
    {
      id: 'pollution_cte',
      approval: 'Consent to Establish (CTE) — Orange Category',
      authority: 'Odisha State Pollution Control Board (OSPCB)',
      reason: 'Required prior to machinery installation for industrial effluent & air discharge.',
      documents: '7 documents (Process Flowchart, ETP Schematics, Water Balance, OSPCB Form)',
      time: '21–30 Days',
      status: 'in_review',
      statusText: 'In Review',
      acts: 'Water Act 1974 & Air Act 1981',
      stage: 'Pre-Construction',
    },
    {
      id: 'fire_noc',
      approval: 'Fire Safety Recommendation Certificate',
      authority: 'Directorate of Fire & Emergency Services, Home Department',
      reason: 'Statutory verification of fire fighting equipment, hydrants, and evacuation paths.',
      documents: '4 documents (Hydrant Layout, Water Reservoir Proof, Evacuation Plan)',
      time: '14 Days',
      status: 'action_required',
      statusText: 'Action Required',
      acts: 'Odisha Fire Prevention and Fire Safety Act 1993',
      stage: 'Pre-Construction',
    },
    {
      id: 'power_ht',
      approval: 'High Tension (HT) Industrial Power Sanction',
      authority: 'TP Central Odisha Distribution Ltd (TPCODL)',
      reason: 'Dedicated 33/11 kV feeder sanction for 450 kVA connected industrial load.',
      documents: '4 documents (Connected Load Schedule, Transformer Spec, Test Report)',
      time: '15–30 Days',
      status: 'in_review',
      statusText: 'In Review',
      acts: 'Electricity Act 2003 & Odisha Electricity Regulatory Commission Code',
      stage: 'Pre-Construction',
    },
    {
      id: 'water_gw',
      approval: 'Groundwater Extraction Permission',
      authority: 'Central Ground Water Authority (CGWA) / State Water Resource Dept',
      reason: 'Industrial borehole extraction permit exceeding 25 cubic meters / day.',
      documents: '5 documents (Hydro-geological Report, Water Meter Scheme, Rainwater Plan)',
      time: '30–45 Days',
      status: 'in_review',
      statusText: 'In Review',
      acts: 'Environment (Protection) Act 1986 & State Ground Water Guidelines',
      stage: 'Pre-Operation',
    },
    {
      id: 'labour_cl',
      approval: 'Contract Labour Principal Employer Registration',
      authority: 'Office of the District Labour Officer',
      reason: 'Employing 20 or more contractual workers for manufacturing operations.',
      documents: '3 documents (Form I Application, Contractor Agreements, Treasury Challan)',
      time: '7–10 Days',
      status: 'in_review',
      statusText: 'In Review',
      acts: 'Section 7 of Contract Labour (Regulation and Abolition) Act 1970',
      stage: 'Pre-Operation',
    },
    {
      id: 'boiler_reg',
      approval: 'Boiler & Steam Pipeline Registration',
      authority: 'Directorate of Factories & Boilers',
      reason: 'Commissioning of industrial package boiler above 25 sq. meter heating surface.',
      documents: '6 documents (Boiler Fabricator Test Certificate, Welder Qual, Form II)',
      time: '14–21 Days',
      status: 'not_started',
      statusText: 'Not Started',
      acts: 'Indian Boilers Act 1923 & Indian Boiler Regulations 1950',
      stage: 'Pre-Operation',
    },
    {
      id: 'pollution_cto',
      approval: 'Consent to Operate (CTO) & Hazardous Waste Auth',
      authority: 'Odisha State Pollution Control Board (OSPCB)',
      reason: 'Permission to commence commercial production following physical compliance trial.',
      documents: '5 documents (CTE Compliance Report, Effluent Test Certificate, Site Photos)',
      time: '15–20 Days',
      status: 'not_started',
      statusText: 'Not Started',
      acts: 'Water Act 1974, Air Act 1981 & Hazardous Waste Management Rules 2016',
      stage: 'Operation',
    },
    {
      id: 'factory_lic',
      approval: 'Grant of Factory Operating License',
      authority: 'Chief Inspector of Factories & Boilers',
      reason: 'Statutory operating licence required prior to engaging commercial workforce.',
      documents: '4 documents (Form 2 Application, Notice of Appointment, Fee Challan)',
      time: '10–14 Days',
      status: 'not_started',
      statusText: 'Not Started',
      acts: 'Section 6 of Factories Act 1948',
      stage: 'Operation',
    },
    {
      id: 'subsidy_ipr',
      approval: 'Industrial Investment Subsidy (IPR 2022 Scheme)',
      authority: 'Directorate of Industries / District Industries Centre (DIC)',
      reason: 'Capital investment subsidy eligibility for agro-food processing units in Odisha.',
      documents: '6 documents (Chartered Accountant Fixed Asset Certificate, Commercial Invoices)',
      time: '30–60 Days',
      status: 'not_started',
      statusText: 'Eligible for Claim',
      acts: 'Odisha Industrial Policy Resolution (IPR) 2022',
      stage: 'Post-Commercial Production',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#171717]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] w-full max-w-6xl shadow-[0_12px_40px_rgba(23,23,23,0.12)] overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 bg-[#FAF8F2] border-b border-[#262522] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#18324A]"></span>
              <span className="meta-label text-[#18324A]">AI-ASSISTED RECOMMENDATION</span>
              <span className="text-[#D6D0C3]">|</span>
              <span className="font-mono-data text-xs text-[#6E6A61]">
                ENTITLEMENT ENGINE V3.4
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              Your Approval Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6A61] mt-0.5">
              Based on your business profile, we identified{' '}
              <strong className="text-[#171717]">12 potentially applicable approvals</strong> across{' '}
              <strong className="text-[#171717]">7 statutory authorities</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" icon={Download}>
              Export Matrix PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] border border-transparent hover:border-[#262522] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Summary Strip */}
        <div className="px-6 py-2.5 bg-[#E9E1D0] border-b border-[#262522] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-data">
          <div className="flex items-center gap-4 text-[#30302D]">
            <span>UNIT: <strong>{profileData?.businessName || 'Utkal Agro-Tech Ltd.'}</strong></span>
            <span>•</span>
            <span>SECTOR: <strong>{profileData?.sector || 'Agro-Processing'}</strong></span>
            <span>•</span>
            <span>SCALE: <strong>{profileData?.projectScale || 'Medium Enterprise'}</strong></span>
          </div>
          <div className="text-[#18324A] font-semibold">
            ESTIMATED OVERALL CLEARANCE DURATION: 45 WORKING DAYS (PARALLEL)
          </div>
        </div>

        {/* Structured Editorial Table */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          <div className="overflow-x-auto border border-[#262522] rounded-[3px] bg-[#FFFFFF]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F2] border-b border-[#262522] text-[#171717] font-mono-data text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 font-semibold">Approval / Licence</th>
                  <th className="p-3.5 font-semibold">Statutory Authority</th>
                  <th className="p-3.5 font-semibold">Reason Required</th>
                  <th className="p-3.5 font-semibold">Required Dossier</th>
                  <th className="p-3.5 font-semibold">Est. SLA</th>
                  <th className="p-3.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D0C3]">
                {checklist.map((item) => {
                  const isExpanded = expandedRow === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                        className="hover:bg-[#FAF8F2] transition-colors cursor-pointer"
                      >
                        {/* Approval Name */}
                        <td className="p-3.5 font-semibold text-[#171717] flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#18324A]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#6E6A61]" />
                          )}
                          <span>{item.approval}</span>
                        </td>

                        {/* Authority */}
                        <td className="p-3.5 text-[#30302D] font-mono-data text-[11px]">
                          {item.authority}
                        </td>

                        {/* Reason */}
                        <td className="p-3.5 text-[#6E6A61] max-w-xs">
                          {item.reason}
                        </td>

                        {/* Documents */}
                        <td className="p-3.5 font-mono-data text-[11px] text-[#30302D]">
                          {item.documents}
                        </td>

                        {/* Est Time */}
                        <td className="p-3.5 font-mono-data text-[11px] font-semibold text-[#18324A]">
                          {item.time}
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-right">
                          <StatusBadge status={item.status} label={item.statusText} />
                        </td>
                      </tr>

                      {/* Expandable Accordion Row for deep scrutiny details */}
                      {isExpanded && (
                        <tr className="bg-[#FAF8F2] border-y border-[#262522]">
                          <td colSpan={6} className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-data">
                              <div className="p-3 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px]">
                                <span className="text-[10px] text-[#6E6A61] uppercase block mb-1">
                                  Governing Statutory Statute:
                                </span>
                                <span className="font-semibold text-[#171717]">
                                  {item.acts}
                                </span>
                              </div>
                              <div className="p-3 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px]">
                                <span className="text-[10px] text-[#6E6A61] uppercase block mb-1">
                                  Project Stage Classification:
                                </span>
                                <span className="font-semibold text-[#18324A]">
                                  {item.stage}
                                </span>
                              </div>
                              <div className="p-3 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-[#6E6A61] uppercase block">
                                    Pre-Validation Readiness:
                                  </span>
                                  <span className="font-semibold text-[#5D8068]">
                                    Dossier Template Available
                                  </span>
                                </div>
                                <button className="px-2 py-1 bg-[#18324A] text-[#FAF8F2] text-[10px] font-sans font-semibold rounded-[2px] hover:bg-[#234563]">
                                  Open Workspace
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-[#FAF8F2] border-t border-[#262522] flex items-center justify-between">
          <span className="text-xs font-mono-data text-[#6E6A61]">
            12 Approvals Identified • Next Step: Upload Dossiers for Automated Pre-Check
          </span>
          <Button variant="primary" size="md" onClick={onClose}>
            Done & Save to Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
