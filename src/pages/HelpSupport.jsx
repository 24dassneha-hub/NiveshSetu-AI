import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Scale,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { Link } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import Button from '../components/ui/Button';
import { getApplications } from '../data/applicationsStorage';

const DIC_DIRECTORY = [
  { district: 'Khordha (Bhubaneswar)', gm: 'Shri A. K. Nayak', phone: '+91 674 2530192', email: 'dic-khurda@gov.in', address: 'DIC Building, Industrial Area, Rasulgarh, Bhubaneswar' },
  { district: 'Cuttack', gm: 'Smt. S. Pattnaik', phone: '+91 671 2341829', email: 'dic-cuttack@gov.in', address: 'Madhupatna Industrial Estate, Cuttack' },
  { district: 'Sundargarh (Rourkela)', gm: 'Er. R. C. Pradhan', phone: '+91 661 2501044', email: 'dic-sundargarh@gov.in', address: 'Civil Township, Rourkela' },
  { district: 'Jharsuguda', gm: 'Shri B. B. Sahoo', phone: '+91 6645 272183', email: 'dic-jharsuguda@gov.in', address: 'Near Collectorate, Jharsuguda' },
  { district: 'Sambalpur', gm: 'Dr. K. N. Tripathy', phone: '+91 663 2410882', email: 'dic-sambalpur@gov.in', address: 'Khetrajpur, Sambalpur' },
  { district: 'Balasore', gm: 'Shri D. K. Behera', phone: '+91 6782 262109', email: 'dic-balasore@gov.in', address: 'Angargadia, Balasore' },
  { district: 'Ganjam (Berhampur)', gm: 'Er. M. K. Panda', phone: '+91 680 2280455', email: 'dic-ganjam@gov.in', address: 'Industrial Estate, Berhampur' },
  { district: 'Angul', gm: 'Shri T. K. Mishra', phone: '+91 6764 230911', email: 'dic-angul@gov.in', address: 'Collectorate Road, Angul' },
  { district: 'Jajpur (Kalinganagar)', gm: 'Shri P. C. Das', phone: '+91 6726 220194', email: 'dic-jajpur@gov.in', address: 'Kalinganagar Industrial Complex, Jajpur' }
];

const FAQS = [
  {
    q: 'How does the Deemed Approval clause work under the Odisha Single Window Act?',
    a: 'Under Section 13(1) of the Odisha Industries (Facilitation) Act 2004, if an issuing authority fails to communicate either an approval, rejection, or statutory query within the prescribed SLA timeline, the clearance is deemed to have been granted. NIVESHSETU AI automatically flags applications crossing their SLA limit and generates a Deemed Clearance Certificate request.'
  },
  {
    q: 'What is the statutory renewal timeline for Consent to Operate (CTO)?',
    a: 'Under the Water (Prevention & Control of Pollution) Act 1974 and Air Act 1981, industries must submit renewal applications at least 60 days prior to certificate expiry. Filing within this statutory window guarantees uninterrupted legal protection and avoids compounding surcharges.'
  },
  {
    q: 'What is the Odisha Right to Public Services Act (ORTPSA 2012) Appeal process?',
    a: 'If any notified statutory clearance is delayed beyond its SLA, entrepreneurs can file a First Appeal to the Director of Industries / Designated Appellate Authority. The authority is legally bound to dispose of the appeal within 30 days and may levy financial penalties up to ₹5,000 on the defaulting scrutiny officer.'
  },
  {
    q: 'How do I claim Net SGST Reimbursement under IPR 2022?',
    a: 'Eligible industrial units can file bi-annual reimbursement claims under Clause 14.4 of IPR 2022 through the Incentives module. Requirements include verified GSTR-3B filings, DIC commercial production certificate, and active bank account mandate.'
  },
  {
    q: 'Can an inspector request documents not listed in the initial checklist?',
    a: 'No. Under the Single Window Compliance mandate and Business Action Reform Plan (BRAP), scrutiny officers are strictly prohibited from raising ad-hoc queries outside the published standard operating procedures. Any repeated unauthorized query can be escalated through an ORTPSA grievance.'
  }
];

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState('ORTPSA'); // 'ORTPSA' | 'DIC' | 'FAQ'
  const [dicSearch, setDicSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Grievance Form State
  const applications = useMemo(() => getApplications(), []);
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || '');
  const [grievanceType, setGrievanceType] = useState('SLA_BREACH');
  const [appealNotes, setAppealNotes] = useState('');
  const [appealFiled, setAppealFiled] = useState(false);

  const filteredDics = useMemo(() => {
    if (!dicSearch.trim()) return DIC_DIRECTORY;
    const q = dicSearch.toLowerCase();
    return DIC_DIRECTORY.filter(
      (d) => d.district.toLowerCase().includes(q) || d.gm.toLowerCase().includes(q)
    );
  }, [dicSearch]);

  const handleAppealSubmit = (e) => {
    e.preventDefault();
    setAppealFiled(true);
  };

  return (
    <DashboardShell>
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#18324A]" />
            <span className="font-mono-data text-xs text-[#18324A] font-bold uppercase tracking-wider">
              REGULATORY ADVOCACY & STATUTORY GRIEVANCES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
            HELP & GRIEVANCE REDRESSAL
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
            Odisha Right to Public Services Act (ORTPSA 2012) statutory appeals, District DIC directory, and compliance knowledge base.
          </p>
        </div>
      </div>

      {/* 2. Top Emergency Support Helpline Box */}
      <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 shadow-[0_4px_16px_rgba(23,23,23,0.03)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#18324A] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase font-bold block">
              IPICOL SINGLE WINDOW TOLL-FREE
            </span>
            <span className="font-bold text-sm text-[#171717]">1800-345-7158</span>
            <span className="text-[11px] text-[#6E6A61] block font-sans">Mon - Sat (10:00 AM - 6:00 PM)</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#5D8068] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase font-bold block">
              REGULATORY HELPDESK EMAIL
            </span>
            <span className="font-bold text-sm text-[#171717]">support.investodisha@gov.in</span>
            <span className="text-[11px] text-[#6E6A61] block font-sans">Response within 24 business hours</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#C08A3E] text-white flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase font-bold block">
              PHYSICAL FACILITATION CELL
            </span>
            <span className="font-bold text-xs text-[#171717]">IPICOL House, Janpath, Bhubaneswar</span>
            <span className="text-[11px] text-[#6E6A61] block font-sans">Pin 751022, Odisha</span>
          </div>
        </div>
      </div>

      {/* 3. Section Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262522] pb-1 text-xs font-mono-data">
        {[
          { id: 'ORTPSA', label: 'ORTPSA STATUTORY DELAY APPEAL' },
          { id: 'DIC', label: 'DISTRICT DIC DIRECTORY' },
          { id: 'FAQ', label: 'REGULATORY COMPLIANCE FAQS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 font-bold uppercase transition-all border-b-2 -mb-1 ${
              activeTab === tab.id
                ? 'border-[#18324A] text-[#18324A] bg-[#FAF8F2]'
                : 'border-transparent text-[#6E6A61] hover:text-[#171717]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 'ORTPSA' ? (
        /* ORTPSA GRIEVANCE & APPEAL */
        <div className="space-y-4">
          <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
            <div className="flex items-start gap-3">
              <Scale className="w-6 h-6 text-[#18324A] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-[#171717] tracking-tight uppercase">
                  Odisha Right to Public Services Act (ORTPSA 2012) Statutory Appeal
                </h3>
                <p className="text-xs text-[#6E6A61] mt-1 font-sans leading-relaxed">
                  Under the ORTPSA Act 2012 and Single Window Facilitation Rules, every government department is legally mandated to dispose of clearance applications within notified SLAs. If your application has been delayed without justifiable cause, you are entitled to file a legal appeal directly to the First Appellate Authority.
                </p>
              </div>
            </div>

            {appealFiled ? (
              <div className="p-4 bg-[#5D8068]/10 border border-[#5D8068] rounded-[4px] text-center space-y-2 my-4">
                <CheckCircle className="w-8 h-8 text-[#5D8068] mx-auto" />
                <span className="font-mono-data text-xs font-bold text-[#5D8068] uppercase block">
                  STATUTORY APPEAL FILED SUCCESSFULLY
                </span>
                <h4 className="text-sm font-bold text-[#171717]">
                  Appeal Docket Reference: ORTPSA-APP-{Date.now().toString().slice(-6)}
                </h4>
                <p className="text-xs text-[#6E6A61] max-w-md mx-auto font-sans">
                  Transmitted to the First Appellate Authority (Director of Industries, Odisha). Under statutory law, the appellate authority must resolve your grievance within 30 working days.
                </p>
                <div className="pt-2">
                  <Button variant="secondary" size="sm" onClick={() => setAppealFiled(false)}>
                    FILE ANOTHER APPEAL
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAppealSubmit} className="space-y-3 pt-2 font-mono-data text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                    Select Delayed Clearance Application
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs text-[#171717] focus:outline-none"
                    required
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.id} — {app.title} ({app.authority?.department || 'Department'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                    Nature of Statutory Grievance
                  </label>
                  <select
                    value={grievanceType}
                    onChange={(e) => setGrievanceType(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs text-[#171717] focus:outline-none"
                  >
                    <option value="SLA_BREACH">Statutory SLA Breached (No Decision within Mandated Days)</option>
                    <option value="UNAUTHORIZED_QUERY">Non-Standard / Repeated Queries Outside SOP</option>
                    <option value="INSPECTION_DELAY">Unscheduled / Indefinitely Delayed Field Inspection</option>
                    <option value="FEE_DISPUTE">Disputed Demand Note / Surcharge Calculation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6E6A61] mb-1">
                    Factual Summary & Supporting Chronology
                  </label>
                  <textarea
                    rows={3}
                    value={appealNotes}
                    onChange={(e) => setAppealNotes(e.target.value)}
                    placeholder="Briefly state application filing date, days lapsed, and prejudice caused to enterprise operations..."
                    className="w-full p-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs text-[#171717] focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button variant="danger" size="md" icon={Send} type="submit">
                    SUBMIT STATUTORY APPEAL UNDER ORTPSA
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : activeTab === 'DIC' ? (
        /* DISTRICT DIC DIRECTORY */
        <div className="space-y-4">
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={dicSearch}
                onChange={(e) => setDicSearch(e.target.value)}
                placeholder="Search District Industries Centre by district name or officer..."
                className="w-full h-10 pl-9 pr-3 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs font-mono-data text-[#171717] focus:outline-none focus:border-[#18324A]"
              />
              <Search className="w-4 h-4 text-[#6E6A61] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs font-mono-data text-[#6E6A61]">
              {filteredDics.length} Centers Found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDics.map((dic, idx) => (
              <div
                key={idx}
                className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 font-mono-data text-xs space-y-2 hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#D6D0C3]">
                  <Building2 className="w-4 h-4 text-[#18324A]" />
                  <span className="font-bold text-[#171717] text-sm uppercase">{dic.district}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block">GENERAL MANAGER:</span>
                  <span className="font-semibold text-[#171717]">{dic.gm}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block">CONTACT PHONE:</span>
                  <a href={`tel:${dic.phone}`} className="text-[#18324A] font-bold hover:underline">
                    {dic.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block">EMAIL ADDRESS:</span>
                  <a href={`mailto:${dic.email}`} className="text-[#18324A] hover:underline">
                    {dic.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block">OFFICE ADDRESS:</span>
                  <span className="font-sans text-xs text-[#6E6A61] leading-tight block">
                    {dic.address}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* REGULATORY COMPLIANCE FAQS */
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#FAF8F2] transition-colors"
              >
                <span className="text-sm font-bold text-[#171717] tracking-tight">
                  {faq.q}
                </span>
                {expandedFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#18324A] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6E6A61] shrink-0" />
                )}
              </button>

              {expandedFaq === idx && (
                <div className="px-4 pb-4 text-xs font-sans text-[#6E6A61] leading-relaxed border-t border-[#D6D0C3] pt-3 bg-[#FAF8F2]/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
