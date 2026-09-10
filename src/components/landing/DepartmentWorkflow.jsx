import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function DepartmentWorkflow({ onExploreRoadmap }) {
  const sectionRef = useScrollReveal();

  const departmentQueue = [
    {
      id: 'NS-APP-2026-9041',
      business: 'Utkal Agro-Tech Ltd.',
      sector: 'Food Processing (Orange Category)',
      department: 'OSPCB',
      deptName: 'State Pollution Control Board',
      approval: 'Consent to Establish (Air & Water)',
      stage: 'Technical Scrutiny',
      slaRemaining: '4 Working Days',
      slaStatus: 'on_track',
      riskScore: '32 / 100',
      riskLevel: 'Low Risk',
      riskColor: '#5D8068',
      action: 'Inspection Ready',
    },
    {
      id: 'NS-APP-2026-8910',
      business: 'Kalinga Precision Gears',
      sector: 'Light Engineering & Casting',
      department: 'Factories & Boilers',
      deptName: 'Directorate of Factories & Boilers',
      approval: 'Factory Building Plan Approval',
      stage: 'Engineering Verification',
      slaRemaining: '1 Working Day',
      slaStatus: 'at_risk',
      riskScore: '48 / 100',
      riskLevel: 'Medium Risk',
      riskColor: '#C08A3E',
      action: 'Officer Signoff',
    },
    {
      id: 'NS-APP-2026-8744',
      business: 'Mahanadi Cold Storage LLP',
      sector: 'Perishable Logistics',
      department: 'Fire Services',
      deptName: 'Directorate of Fire Services',
      approval: 'Fire Safety Recommendation',
      stage: 'Joint Inspection Scheduled',
      slaRemaining: '6 Working Days',
      slaStatus: 'on_track',
      riskScore: '22 / 100',
      riskLevel: 'Low Risk',
      riskColor: '#5D8068',
      action: 'Joint Inspection on 14 Sep',
    },
    {
      id: 'NS-APP-2026-8601',
      business: 'Barbil Minerals Processing',
      sector: 'Mineral Beneficiation (Red Category)',
      department: 'Mining & Steel',
      deptName: 'Steel & Mines Department',
      approval: 'Storage & Stocking License',
      stage: 'Groundwater Query',
      slaRemaining: '0 Days (SLA Breached)',
      slaStatus: 'breached',
      riskScore: '78 / 100',
      riskLevel: 'High Risk',
      riskColor: '#B85C4A',
      action: 'Escalated to Collector',
    },
  ];

  return (
    <section id="department-workflow" ref={sectionRef} className="scroll-mt-section bg-[#F3EFE5] border-b border-[#262522]">
      <div className="max-w-7xl mx-auto border-x border-[#262522]">
        {/* Section Header */}
        <div className="reveal-init p-6 sm:p-10 border-b border-[#262522] bg-[#FAF8F2] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px]">
                SECTION 05
              </span>
              <span className="meta-label text-[#6E6A61]">ADMINISTRATIVE ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
              Department Workflow & Scrutiny
            </h2>
          </div>
          <p className="text-sm text-[#6E6A61] max-w-md font-mono-data">
            Transparent tracking of multi-agency scrutiny queues, statutory SLA commitments, and synchronized joint site inspections.
          </p>
        </div>

        {/* Parallel vs Sequential Comparative Banner */}
        <div className="reveal-init grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#262522] bg-[#FAF8F2] border-b border-[#262522]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-3">
              <span className="meta-label text-[#B85C4A]">TRADITIONAL SEQUENTIAL SCRUTINY</span>
              <span className="font-mono-data text-xs text-[#B85C4A] font-bold">114 WORKING DAYS</span>
            </div>
            <h3 className="text-lg font-bold text-[#171717] mb-2">Linear Department Hand-offs</h3>
            <p className="text-xs text-[#6E6A61] leading-relaxed mb-4">
              Submissions move serially from one agency to the next. Any defect restarts the entire sequence with uncoordinated inspections.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono-data text-[#6E6A61]">
              <span className="w-2 h-2 rounded-full bg-[#B85C4A]"></span>
              <span>Duplicate documentation & recurring delays</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-[#FAF8F2]">
            <div className="flex items-center justify-between mb-3">
              <span className="meta-label text-[#5D8068]">SYNCHRONIZED PARALLEL PROTOCOL</span>
              <span className="font-mono-data text-xs text-[#5D8068] font-bold">38 WORKING DAYS</span>
            </div>
            <h3 className="text-lg font-bold text-[#171717] mb-2">Simultaneous Multi-Agency Scrutiny</h3>
            <p className="text-xs text-[#6E6A61] leading-relaxed mb-4">
              A single verified dossier distributes concurrently to Pollution, Fire, and Factories with synchronized joint site inspections.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono-data text-[#5D8068]">
              <span className="w-2 h-2 rounded-full bg-[#5D8068]"></span>
              <span>66% compression in time-to-commercial-clearance</span>
            </div>
          </div>
        </div>

        {/* Operational Scrutiny Queue */}
        <div className="reveal-init p-6 sm:p-8 bg-[#FAF8F2]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#D6D0C3]">
            <div>
              <span className="meta-label">MULTI-DEPARTMENT SCRUTINY MONITOR</span>
              <h3 className="text-lg font-bold text-[#171717] mt-0.5">
                Real-Time Department Status Queue
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono-data">
              <span className="text-[#6E6A61]">JURISDICTION:</span>
              <span className="px-2 py-1 bg-[#E9E1D0] border border-[#262522] rounded-[3px] font-semibold text-[#18324A]">
                STATE SINGLE WINDOW SECRETARIAT
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-[#262522] rounded-[3px] bg-[#FFFFFF]">
            <table className="w-full text-left text-xs border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-[#FAF8F2] border-b border-[#262522] text-[#171717] font-mono-data text-[11px] uppercase tracking-wider">
                  <th className="p-3 font-semibold">Application ID</th>
                  <th className="p-3 font-semibold">Business Unit</th>
                  <th className="p-3 font-semibold">Clearance Authority</th>
                  <th className="p-3 font-semibold">Current Stage</th>
                  <th className="p-3 font-semibold">SLA Commitment</th>
                  <th className="p-3 font-semibold">Risk Scrutiny</th>
                  <th className="p-3 font-semibold text-right">Operational Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D0C3] font-mono-data">
                {departmentQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F2] transition-colors">
                    {/* ID */}
                    <td className="p-3 font-semibold text-[#18324A]">
                      {item.id}
                    </td>

                    {/* Business */}
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-[#171717]">{item.business}</div>
                      <div className="text-[11px] text-[#6E6A61]">{item.sector}</div>
                    </td>

                    {/* Department */}
                    <td className="p-3 font-sans">
                      <span className="font-semibold text-[#171717]">{item.department}</span>
                      <div className="text-[10px] text-[#6E6A61] font-mono-data">{item.approval}</div>
                    </td>

                    {/* Stage */}
                    <td className="p-3 font-sans">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#E9E1D0] text-[#30302D] text-[11px] font-medium">
                        {item.stage}
                      </span>
                    </td>

                    {/* SLA */}
                    <td className="p-3">
                      <span
                        className={`text-xs font-semibold ${
                          item.slaStatus === 'on_track'
                            ? 'text-[#5D8068]'
                            : item.slaStatus === 'at_risk'
                            ? 'text-[#C08A3E]'
                            : 'text-[#B85C4A]'
                        }`}
                      >
                        {item.slaRemaining}
                      </span>
                    </td>

                    {/* Explainable Risk */}
                    <td className="p-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.riskColor }}
                        ></span>
                        <span className="font-semibold text-xs text-[#171717]">
                          {item.riskLevel}
                        </span>
                        <span className="text-[10px] font-mono-data text-[#6E6A61]">
                          ({item.riskScore})
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-3 text-right">
                      <button
                        onClick={onExploreRoadmap}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F2] hover:bg-[#18324A] hover:text-[#FAF8F2] active:scale-[0.98] border border-[#262522] rounded-[3px] text-[11px] font-semibold text-[#171717] transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A]"
                      >
                        <span>{item.action}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Joint Inspection Explainer Panel */}
          <div className="mt-6 p-4 bg-[#E9E1D0] border border-[#262522] rounded-[3px] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#18324A] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#171717]">
                  COMMON INSPECTION SCHEDULER & ESCALATION PROTOCOL
                </div>
                <div className="text-[11px] text-[#6E6A61] font-mono-data">
                  Integrates site visits across departments onto one date. Statutory deemed approvals trigger when timelines expire.
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onExploreRoadmap}
              className="btn-editorial-hover shrink-0"
            >
              Explore Clearance Roadmap
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
