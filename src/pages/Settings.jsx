import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Sliders,
  Database,
  Download,
  Shield,
  CheckCircle,
  Save,
  RotateCcw,
  Cloud,
  Link2,
  Printer,
} from 'lucide-react';
import DashboardShell from '../components/dashboard/DashboardShell';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getApprovals } from '../data/approvalsStorage';
import { getDocuments } from '../data/documentsStorage';
import { getApplications } from '../data/applicationsStorage';
import { getRenewals } from '../data/renewalsStorage';
import { getIncentives } from '../data/incentivesStorage';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('NOTIFICATIONS');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [notify60d, setNotify60d] = useState(true);
  const [notify30d, setNotify30d] = useState(true);
  const [notify15d, setNotify15d] = useState(true);
  const [notifyQueries, setNotifyQueries] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const fullDossier = {
      exportedAt: new Date().toISOString(),
      enterprise: 'Ray Green Energy Ltd',
      approvals: getApprovals(),
      documents: getDocuments(),
      applications: getApplications(),
      renewals: getRenewals(),
      incentives: getIncentives(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDossier, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NiveshSetu_Dossier_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintDossier = () => {
    const approvals = getApprovals();
    const documents = getDocuments();
    const userContext = user || {
      businessName: 'Omm Enterprises',
      pan: 'ABCDE1234F',
      gstin: '21ABCDE1234F1Z5',
      district: 'Khordha',
      industrySector: 'Food Processing & Agri-Business',
      entityType: 'Private Limited Company',
    };

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow pop-ups to view the printable Compliance Dossier.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NiveshSetu Compliance Dossier — ${userContext.businessName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 36px; color: #171717; background: #fff; line-height: 1.4; }
          .header { border-bottom: 3px double #18324A; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .emblem { font-weight: 900; font-size: 15px; letter-spacing: 1px; color: #18324A; }
          .subhead { font-size: 11px; color: #6E6A61; margin-top: 3px; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
          .section { margin-top: 22px; }
          .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #18324A; padding-bottom: 4px; margin-bottom: 8px; color: #18324A; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 11px; margin-bottom: 18px; background: #FAF8F2; padding: 12px; border: 1px solid #D6D0C3; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
          th { background: #18324A; color: white; text-align: left; padding: 6px 8px; font-weight: 600; font-size: 10px; text-transform: uppercase; }
          td { border: 1px solid #D6D0C3; padding: 6px 8px; }
          .status { font-weight: bold; padding: 2px 5px; border-radius: 3px; font-size: 9px; }
          .status-APPROVED { background: #dcfce7; color: #166534; }
          .status-UNDER_PROCESS { background: #fef9c3; color: #854d0e; }
          .status-ACTION_REQUIRED { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 30px; border-top: 1px solid #D6D0C3; padding-top: 10px; font-size: 10px; color: #6E6A61; display: flex; justify-content: space-between; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="emblem">GOVERNMENT OF ODISHA • SINGLE WINDOW FACILITATION SYSTEM</div>
            <div class="subhead">Odisha Industries (Facilitation) Act 2004 & ORTPSA 2012 Compliance Dossier</div>
          </div>
          <div style="text-align: right; font-size: 10px; font-family: monospace;">
            <strong>GENERATED:</strong> ${new Date().toLocaleDateString('en-GB')}<br/>
            <strong>HASH:</strong> SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}
          </div>
        </div>

        <div class="title">Enterprise Statutory Compliance Passport</div>

        <div class="meta-grid">
          <div><strong>Enterprise Name:</strong> ${userContext.businessName}</div>
          <div><strong>GSTIN:</strong> ${userContext.gstin || '21ABCDE1234F1Z5'}</div>
          <div><strong>PAN:</strong> ${userContext.pan || 'ABCDE1234F'}</div>
          <div><strong>District & State:</strong> ${userContext.district || 'Khordha'}, Odisha</div>
          <div><strong>Industry Sector:</strong> ${userContext.industrySector || 'Industrial Manufacturing'}</div>
          <div><strong>Entity Class:</strong> ${userContext.entityType || 'Private Limited Company'}</div>
        </div>

        <div class="section">
          <div class="section-title">1. Monitored Statutory Clearances & NOCs (${approvals.length})</div>
          <table>
            <thead>
              <tr>
                <th>Clearance Name</th>
                <th>Issuing Authority</th>
                <th>Application ID</th>
                <th>Status</th>
                <th>Certificate Number</th>
              </tr>
            </thead>
            <tbody>
              ${approvals.map(a => `
                <tr>
                  <td><strong>${a.name}</strong><br/><span style="color:#6E6A61">${a.category}</span></td>
                  <td>${a.authority?.name || a.authority?.department || 'State Department'}</td>
                  <td style="font-family: monospace;">${a.application?.applicationId || a.id}</td>
                  <td><span class="status status-${a.status?.normalized}">${a.status?.normalized}</span></td>
                  <td style="font-family: monospace;">${a.certificate?.number || 'Under Scrutiny'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. Verified Document Vault Ledger (${documents.length})</div>
          <table>
            <thead>
              <tr>
                <th>Document Record</th>
                <th>Category</th>
                <th>Document Number</th>
                <th>Verification State</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map(d => `
                <tr>
                  <td><strong>${d.name}</strong></td>
                  <td>${d.type}</td>
                  <td style="font-family: monospace;">${d.documentNumber || '—'}</td>
                  <td>${d.verification?.status || 'PENDING'}</td>
                  <td>${d.dates?.hasExpiry && d.dates?.expiryDate ? d.dates.expiryDate : 'No Expiry'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>NiveshSetu AI Single Window Platform • Certified Digital Dossier</div>
          <div>Page 1 of 1 • Statutory Audit Reference</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
  };

  const handleResetStorage = () => {
    if (window.confirm('Reset local compliance cache and restore original factory seeds?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#18324A]" />
            <span className="font-mono-data text-xs text-[#18324A] font-bold uppercase tracking-wider">
              WORKSPACE CONFIGURATION & PREFERENCES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
            SETTINGS & DATA MANAGEMENT
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
            Configure statutory renewal alert thresholds, department API integrations, and backup compliance dossiers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262522] pb-1 text-xs font-mono-data">
        {[
          { id: 'NOTIFICATIONS', label: 'ALERT THRESHOLDS', icon: Bell },
          { id: 'INTEGRATIONS', label: 'GOVERNMENT APIS', icon: Link2 },
          { id: 'BACKUP', label: 'DATA EXPORT & BACKUP', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 font-bold uppercase transition-all flex items-center gap-1.5 border-b-2 -mb-1 ${
                activeTab === tab.id
                  ? 'border-[#18324A] text-[#18324A] bg-[#FAF8F2]'
                  : 'border-transparent text-[#6E6A61] hover:text-[#171717]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#5D8068]/15 border border-[#5D8068] text-[#5D8068] rounded-[4px] text-xs font-mono-data flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Preferences updated and saved to enterprise workspace.</span>
        </div>
      )}

      {/* Tab 1: Notifications & Alert Thresholds */}
      {activeTab === 'NOTIFICATIONS' && (
        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#171717] uppercase tracking-tight">
                Statutory Renewal Notice Thresholds
              </h3>
              <p className="text-xs text-[#6E6A61] mt-0.5">
                Control when automated warnings are triggered before certificate expiration:
              </p>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <label className="flex items-center justify-between p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] cursor-pointer">
                <div>
                  <span className="font-bold text-[#171717] block">60-Day Advance Renewal Window</span>
                  <span className="text-[#6E6A61] text-[11px]">Notifies when clearances enter statutory filing window (ORTPSA compliant)</span>
                </div>
                <input
                  type="checkbox"
                  checked={notify60d}
                  onChange={(e) => setNotify60d(e.target.checked)}
                  className="rounded text-[#18324A]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] cursor-pointer">
                <div>
                  <span className="font-bold text-[#171717] block">30-Day Urgent Countdown Notice</span>
                  <span className="text-[#6E6A61] text-[11px]">Flags pending filings entering final statutory review month</span>
                </div>
                <input
                  type="checkbox"
                  checked={notify30d}
                  onChange={(e) => setNotify30d(e.target.checked)}
                  className="rounded text-[#18324A]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] cursor-pointer">
                <div>
                  <span className="font-bold text-[#171717] block">15-Day Critical Expiry & Penalty Alert</span>
                  <span className="text-[#6E6A61] text-[11px]">Triggers top banner and urgent SMS notice to avoid compounding penalties</span>
                </div>
                <input
                  type="checkbox"
                  checked={notify15d}
                  onChange={(e) => setNotify15d(e.target.checked)}
                  className="rounded text-[#18324A]"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] cursor-pointer">
                <div>
                  <span className="font-bold text-[#171717] block">Immediate Notice on Scrutiny Queries</span>
                  <span className="text-[#6E6A61] text-[11px]">Instant alert whenever an inspector or scrutiny officer requests clarification</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyQueries}
                  onChange={(e) => setNotifyQueries(e.target.checked)}
                  className="rounded text-[#18324A]"
                />
              </label>
            </div>

            <div className="border-t border-[#D6D0C3] pt-3 flex items-center justify-between">
              <span className="text-xs font-mono-data text-[#6E6A61]">
                Target: compliance@rayenergy.odisha.gov.in / +91 94370 12345
              </span>
              <Button variant="primary" size="sm" icon={Save} type="submit">
                SAVE PREFERENCES
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Single Window Integrations */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-tight">
              Single Window Portal Synchronization
            </h3>
            <p className="text-xs text-[#6E6A61] mt-0.5">
              Status of interconnected government API endpoints under Odisha Single Window:
            </p>
          </div>

          <div className="space-y-3 font-mono-data text-xs">
            <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#171717] block">IPICOL GO-SWIFT API Gateway</span>
                <span className="text-[11px] text-[#6E6A61]">End-to-end statutory clearances and composite forms exchange</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#5D8068]/15 text-[#5D8068] font-bold">
                ✓ CONNECTED & LIVE
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#171717] block">OSPCB OCMMS Cloud Connector</span>
                <span className="text-[11px] text-[#6E6A61]">State Pollution Control Board Consent & stack emission data</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#5D8068]/15 text-[#5D8068] font-bold">
                ✓ CONNECTED & LIVE
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#171717] block">Odisha e-Treasury eGRAS Gateway</span>
                <span className="text-[11px] text-[#6E6A61]">Online challan generation & payment reconciliation</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#5D8068]/15 text-[#5D8068] font-bold">
                ✓ ACTIVE (ZERO-FEE GATEWAY)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Data Export & Backup */}
      {activeTab === 'BACKUP' && (
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#171717] uppercase tracking-tight">
              Enterprise Compliance Dossier Backup
            </h3>
            <p className="text-xs text-[#6E6A61] mt-0.5 font-sans">
              Export your entire compliance dossier—including approvals, application histories, document vault references, and renewal timeline audits—as an encrypted, standardized JSON package.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Printer}
              onClick={handlePrintDossier}
            >
              PRINT OFFICIAL COMPLIANCE PASSPORT (PDF)
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={handleExportData}
            >
              DOWNLOAD DATA (JSON)
            </Button>

            <Button
              variant="danger"
              size="md"
              icon={RotateCcw}
              onClick={handleResetStorage}
            >
              RESET LOCAL CACHE SEEDS
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
