import React, { useState } from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function ApprovalRoadmapPreview({ onBuildRoadmap }) {
  const sectionRef = useScrollReveal();
  const [selectedNode, setSelectedNode] = useState('pollution');
  const activeSector = 'manufacturing';

  const roadmapData = {
    manufacturing: [
      {
        id: 'gst',
        stage: '01. INCEPTION & TAXATION',
        name: 'GST Registration',
        authority: 'Commercial Taxes Department',
        status: 'approved',
        statusText: 'Approved',
        time: '3–5 Days',
        docsCount: 3,
        sla: '2 Days Taken (SLA: 7 Days)',
        desc: 'Statutory prerequisite for commercial transactions and input tax credit claims.',
        dependencies: 'None (Root Node)',
        dependents: 'Factory License, Industrial Power Connection',
        requiredDocs: ['PAN Card of Entity', 'Proof of Registered Office', 'Bank Verification'],
      },
      {
        id: 'factory_plan',
        stage: '02. LAND & CIVIL BLUEPRINT',
        name: 'Factory License & Plan Approval',
        authority: 'Directorate of Factories & Boilers',
        status: 'approved',
        statusText: 'Approved',
        time: '15–20 Days',
        docsCount: 6,
        sla: '14 Days Taken (SLA: 30 Days)',
        desc: 'Structural safety, machinery layouts, ventilation, and emergency exits validation.',
        dependencies: 'GST Registration, Land Revenue Allotment',
        dependents: 'Pollution CTE, Fire NOC, High Tension Power',
        requiredDocs: ['Machinery Layout Blueprint', 'Structural Stability Certificate', 'Form No. 1 Filing'],
      },
      {
        id: 'pollution',
        stage: '03. ENVIRONMENTAL SAFEGUARDS',
        name: 'Consent to Establish (CTE) — Orange Category',
        authority: 'State Pollution Control Board (SPCB)',
        status: 'in_review',
        statusText: 'In Review (Stage 3/5)',
        time: '21–30 Days',
        docsCount: 7,
        sla: '4 Working Days Remaining in SLA',
        desc: 'Statutory clearance under Water & Air Acts prior to site equipment installation.',
        dependencies: 'Factory Plan Approval, Water Source Confirmation',
        dependents: 'Final Consent to Operate (CTO)',
        requiredDocs: ['Effluent Treatment Plant Scheme', 'Air Emission Specs', 'Process Flowchart'],
      },
      {
        id: 'fire_noc',
        stage: '03. ENVIRONMENTAL SAFEGUARDS (PARALLEL)',
        name: 'Fire Safety Recommendation & NOC',
        authority: 'Directorate General of Fire Services',
        status: 'action_required',
        statusText: 'Action Required',
        time: '14 Days',
        docsCount: 4,
        sla: 'Defect Issued • 48h to respond',
        desc: 'Verification of fire suppression hydrants, smoke dampers, and evacuation corridors.',
        dependencies: 'Factory Plan Approval',
        dependents: 'Consolidated Operating License',
        requiredDocs: ['Site Evacuation Blueprint', 'Static Water Storage Proof', 'Pump Specs'],
      },
      {
        id: 'labour',
        stage: '04. WORKFORCE & SOCIAL COMPLIANCE',
        name: 'Contract Labour Registration',
        authority: 'Department of Labour & ESI',
        status: 'in_review',
        statusText: 'In Review',
        time: '7–10 Days',
        docsCount: 3,
        sla: '6 Working Days Remaining in SLA',
        desc: 'Principal employer registration for construction and operational manpower.',
        dependencies: 'Factory License',
        dependents: 'Commercial Operation Date (COD)',
        requiredDocs: ['Principal Employer Form I', 'Contractor Agreements', 'Treasury Challan'],
      },
      {
        id: 'final_cto',
        stage: '05. FINAL OPERATIONAL CLEARANCE',
        name: 'Consolidated Consent to Operate (CTO)',
        authority: 'Single Window Clearance Authority',
        status: 'not_started',
        statusText: 'Pending Prior Clearances',
        time: '15 Days',
        docsCount: 5,
        sla: 'Scheduled After Joint Inspection',
        desc: 'Final integrated clearance granting commercial production commencement.',
        dependencies: 'Pollution CTE, Fire NOC, Labour License',
        dependents: 'Commercial Operations & Subsidy Claim',
        requiredDocs: ['CTE Compliance Report', 'Joint Inspection Report', 'Capital Investment Certificate'],
      },
    ],
  };

  const activeRoadmap = roadmapData[activeSector];
  const currentNode = activeRoadmap.find((n) => n.id === selectedNode) || activeRoadmap[2];

  return (
    <section id="roadmap" ref={sectionRef} className="scroll-mt-section bg-[#F3EFE5] border-b border-[#262522]">
      <div className="max-w-7xl mx-auto border-x border-[#262522]">
        {/* Header Block */}
        <div className="reveal-init p-6 sm:p-10 border-b border-[#262522] bg-[#FAF8F2] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px]">
                SECTION 03
              </span>
              <span className="meta-label text-[#6E6A61]">SIGNATURE CAPABILITY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
              The Approval Roadmap
            </h2>
          </div>
          <div className="text-xs font-mono-data text-[#6E6A61] flex items-center gap-4">
            <span>SECTOR TEMPLATE:</span>
            <div className="inline-flex bg-[#E9E1D0] p-0.5 rounded-[3px] border border-[#D6D0C3]">
              <span
                className="px-2.5 py-1 text-xs font-semibold rounded-[2px] bg-[#18324A] text-[#FAF8F2]"
              >
                MANUFACTURING & AGRO
              </span>
            </div>
          </div>
        </div>

        {/* Informational Subtext & Legend */}
        <div className="reveal-init px-6 sm:px-10 py-3 bg-[#E9E1D0] border-b border-[#262522] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-data">
          <span className="text-[#30302D]">
            Interactive clearance path: Click any node to inspect dependencies, statutory SLAs, and required filings.
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#5D8068]">
              <strong>✓</strong> Approved
            </span>
            <span className="flex items-center gap-1.5 text-[#C08A3E]">
              <strong>●</strong> In Review
            </span>
            <span className="flex items-center gap-1.5 text-[#B85C4A]">
              <strong>!</strong> Action Required
            </span>
            <span className="flex items-center gap-1.5 text-[#8B8982]">
              <strong>○</strong> Not Started
            </span>
          </div>
        </div>

        {/* 2-Column Editorial Roadmap Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#262522]">
          {/* Left Column: Interactive Roadmap DAG Tree (7 cols) */}
          <div className="reveal-init lg:col-span-7 p-6 sm:p-8 bg-[#FAF8F2] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6D0C3]">
              <span className="meta-label">STATUTORY CLEARANCE PIPELINE</span>
              <span className="font-mono-data text-xs text-[#6E6A61]">6 PHASES</span>
            </div>

            {/* Tree Nodes */}
            <div className="space-y-3 relative">
              {activeRoadmap.map((node, index) => {
                const isSelected = node.id === currentNode.id;
                return (
                  <div key={node.id} className="relative">
                    {/* Visual Connector Wire */}
                    {index < activeRoadmap.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-6 bg-[#262522] z-0 opacity-40"></div>
                    )}

                    <div
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={`Inspect ${node.name} stage`}
                      onClick={() => setSelectedNode(node.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedNode(node.id);
                        }
                      }}
                      className={`relative z-10 cursor-pointer p-4 rounded-[4px] border transition-[background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A] ${
                        isSelected
                          ? 'border-[#18324A] bg-[#FFFFFF] shadow-[0_4px_12px_rgba(24,50,74,0.08)] ring-1 ring-[#18324A]'
                          : 'border-[#262522] bg-[#FAF8F2] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono-data text-[10px] text-[#6E6A61] font-semibold tracking-wider">
                            {node.stage}
                          </span>
                        </div>
                        <StatusBadge status={node.status} label={node.statusText} />
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-base text-[#171717] tracking-tight">
                            {node.name}
                          </h4>
                          <p className="text-xs text-[#6E6A61] mt-0.5 font-mono-data">
                            {node.authority}
                          </p>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform shrink-0 mt-1 ${
                            isSelected ? 'rotate-90 text-[#18324A]' : 'text-[#6E6A61]'
                          }`}
                        />
                      </div>

                      {/* Footer micro details */}
                      <div className="mt-3 pt-2.5 border-t border-[#D6D0C3] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-data text-[#6E6A61]">
                        <span>Est. SLA: {node.time}</span>
                        <span>{node.docsCount} Required Documents</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Node Scrutiny Detail Workspace (5 cols) */}
          <div className="reveal-init lg:col-span-5 p-6 sm:p-8 bg-[#FAF8F2] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D6D0C3]">
                <span className="meta-label">NODE SCRUTINY & AUDIT DOSSIER</span>
                <span className="font-mono-data text-xs text-[#18324A] font-semibold">
                  NODE ID: #{currentNode.id.toUpperCase()}
                </span>
              </div>

              {/* Title & Badge */}
              <div className="mb-4">
                <StatusBadge status={currentNode.status} label={currentNode.statusText} />
                <h3 className="text-xl font-bold text-[#171717] mt-2 tracking-tight">
                  {currentNode.name}
                </h3>
                <p className="text-xs text-[#6E6A61] mt-1 font-mono-data">
                  {currentNode.authority}
                </p>
              </div>

              {/* Narrative description */}
              <div className="p-3.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] mb-4">
                <p className="text-xs text-[#30302D] leading-relaxed">
                  {currentNode.desc}
                </p>
              </div>

              {/* Dependency Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono-data">
                <div className="p-3 bg-[#E9E1D0] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block mb-1">
                    Prerequisite Nodes:
                  </span>
                  <span className="font-semibold text-[#171717] block">
                    {currentNode.dependencies}
                  </span>
                </div>
                <div className="p-3 bg-[#E9E1D0] border border-[#D6D0C3] rounded-[3px]">
                  <span className="text-[10px] text-[#6E6A61] uppercase block mb-1">
                    Unlocks Dependents:
                  </span>
                  <span className="font-semibold text-[#18324A] block">
                    {currentNode.dependents}
                  </span>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="border border-[#262522] rounded-[3px] bg-[#FFFFFF] overflow-hidden mb-6">
                <div className="px-3 py-2 bg-[#F3EFE5] border-b border-[#262522] flex items-center justify-between text-xs font-mono-data font-semibold text-[#171717]">
                  <span>MANDATORY STATUTORY FILINGS</span>
                  <span>{currentNode.requiredDocs.length} FILES</span>
                </div>
                <ul className="divide-y divide-[#D6D0C3] text-xs">
                  {currentNode.requiredDocs.map((doc, idx) => (
                    <li key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#5E7D91]" />
                        <span className="text-[#30302D]">{doc}</span>
                      </div>
                      <span className="text-[10px] font-mono-data text-[#6E6A61] uppercase">
                        {idx === 0 ? 'Pre-verified' : 'Ready to Scrutinize'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#D6D0C3]">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center btn-editorial-hover"
                onClick={onBuildRoadmap}
              >
                Generate Full Roadmap for Your Unit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
