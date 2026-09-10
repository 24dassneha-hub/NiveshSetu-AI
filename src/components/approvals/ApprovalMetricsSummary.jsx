import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, HelpCircle, Layers } from 'lucide-react';
import { NORMALIZED_STATUS } from '../../services/monitoringService.js';

export default function ApprovalMetricsSummary({ approvals = [] }) {
  const total = approvals.length;
  const approved = approvals.filter((a) => a.status?.normalized === NORMALIZED_STATUS.APPROVED).length;
  const underProcess = approvals.filter((a) => a.status?.normalized === NORMALIZED_STATUS.UNDER_PROCESS).length;
  const actionRequired = approvals.filter((a) => a.status?.normalized === NORMALIZED_STATUS.ACTION_REQUIRED).length;
  const notYet = approvals.filter((a) => a.status?.normalized === NORMALIZED_STATUS.NOT_YET).length;

  const metrics = [
    {
      label: 'TOTAL APPROVALS',
      value: total,
      subtext: 'Tracked in Monitor',
      icon: Layers,
      textColor: 'text-[#171717]',
      bgBadge: 'bg-[#FAF8F2] border-[#262522]',
    },
    {
      label: 'APPROVED',
      value: approved,
      subtext: 'Certificates Granted',
      icon: ShieldCheck,
      textColor: 'text-[#5D8068]',
      bgBadge: 'bg-[#5D8068]/10 border-[#5D8068]/30',
    },
    {
      label: 'UNDER PROCESS',
      value: underProcess,
      subtext: 'In Official Review',
      icon: Clock,
      textColor: 'text-[#C08A3E]',
      bgBadge: 'bg-[#C08A3E]/10 border-[#C08A3E]/30',
    },
    {
      label: 'ACTION REQUIRED',
      value: actionRequired,
      subtext: actionRequired > 0 ? 'Department Queries Pending' : 'No Pending Queries',
      icon: AlertTriangle,
      textColor: actionRequired > 0 ? 'text-[#B85C4A]' : 'text-[#6E6A61]',
      bgBadge: actionRequired > 0 ? 'bg-[#B85C4A]/10 border-[#B85C4A]/40 ring-1 ring-[#B85C4A]/20' : 'bg-[#FAF8F2] border-[#D6D0C3]',
      highlight: actionRequired > 0,
    },
    {
      label: 'NOT YET APPLIED',
      value: notYet,
      subtext: 'Identified Clearances',
      icon: HelpCircle,
      textColor: 'text-[#8B8982]',
      bgBadge: 'bg-[#8B8982]/10 border-[#8B8982]/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-[4px] border ${m.bgBadge} transition-all duration-160 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="font-mono-data text-[10px] font-bold tracking-wider text-[#6E6A61] uppercase truncate">
                {m.label}
              </span>
              <Icon className={`w-3.5 h-3.5 shrink-0 ${m.textColor}`} />
            </div>
            <div>
              <span className={`font-mono-data font-bold text-2xl sm:text-3xl tracking-tight ${m.textColor}`}>
                {m.value}
              </span>
              <span className="block font-sans text-[11px] text-[#6E6A61] mt-0.5 truncate">
                {m.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
