import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCheck,
  Trash2,
  Filter,
  Building2,
  Sparkles,
  Bot
} from 'lucide-react';
import { Link } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import MetricBlock from '../components/ui/MetricBlock';
import Button from '../components/ui/Button';
import {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  dismissAlert,
  calculateAlertMetrics
} from '../data/alertsStorage';

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState(() => getAlerts());
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    const handleStorage = () => setAlerts(getAlerts());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('appModeChanged', handleStorage);
    window.addEventListener('alertsUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('appModeChanged', handleStorage);
      window.removeEventListener('alertsUpdated', handleStorage);
    };
  }, []);

  const safeAlerts = useMemo(() => (Array.isArray(alerts) ? alerts : []), [alerts]);
  const metrics = useMemo(() => calculateAlertMetrics(safeAlerts), [safeAlerts]);

  const handleMarkRead = (id) => {
    const updated = markAlertAsRead(id);
    if (updated) setAlerts(updated);
  };

  const handleMarkAllRead = () => {
    const updated = markAllAlertsAsRead();
    if (updated) setAlerts(updated);
  };

  const handleDismiss = (id) => {
    const updated = dismissAlert(id);
    if (updated) setAlerts(updated);
  };

  const filteredAlerts = useMemo(() => {
    return safeAlerts.filter((a) => {
      if (selectedFilter === 'UNREAD') return !a.read;
      if (selectedFilter === 'CRITICAL') return a.severity === 'CRITICAL';
      if (selectedFilter === 'QUERY') return a.category === 'QUERY';
      if (selectedFilter === 'EXPIRY') return a.category === 'EXPIRY' || a.category === 'OVERDUE';
      return true;
    });
  }, [safeAlerts, selectedFilter]);

  const hasZeroAlerts = safeAlerts.length === 0;

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                metrics.total > 0 ? 'bg-[#B85C4A]' : 'bg-[#5D8068]'
              }`}
            />
            <span
              className={`font-mono-data text-xs font-bold uppercase tracking-wider ${
                metrics.total > 0 ? 'text-[#B85C4A]' : 'text-[#5D8068]'
              }`}
            >
              {metrics.total > 0
                ? 'REAL-TIME COMPLIANCE MONITORING'
                : 'SYSTEMS HEALTHY • ALL COMPLIANT'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
            COMPLIANCE ALERTS
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
            Automated statutory expiry countdowns, department scrutiny queries, and SLA breach warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {metrics.unread > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              MARK ALL AS READ
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricBlock
          value={metrics.total}
          label="Total Notifications"
          subtext="Active Compliance Feed"
          variant="white"
        />
        <MetricBlock
          value={metrics.unread}
          label="Unread Alerts"
          subtext="Pending Review"
          variant="navy"
        />
        <MetricBlock
          value={metrics.critical}
          label="Critical Actions"
          subtext="Statutory Risk"
          variant="subtle"
        />
        <MetricBlock
          value={metrics.warning}
          label="Queries & Warnings"
          subtext="Inspector Scrutiny"
          variant="default"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3 flex flex-wrap items-center gap-2 text-xs font-mono-data">
        {[
          { id: 'ALL', label: `ALL (${metrics.total})` },
          { id: 'UNREAD', label: `UNREAD (${metrics.unread})` },
          { id: 'CRITICAL', label: `CRITICAL (${metrics.critical})` },
          { id: 'QUERY', label: 'INSPECTOR QUERIES' },
          { id: 'EXPIRY', label: 'EXPIRY NOTICES' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded-[3px] font-semibold transition-all cursor-pointer ${
              selectedFilter === tab.id
                ? 'bg-[#18324A] text-[#FAF8F2]'
                : 'bg-[#FFFFFF] border border-[#D6D0C3] text-[#6E6A61] hover:text-[#171717]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          hasZeroAlerts ? (
            /* Clean State: 0 alerts across the board */
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-12 text-center my-4">
              <div className="w-14 h-14 rounded-full bg-[#EBF2EC] border border-[#5D8068]/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-[#5D8068]" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EBF2EC] border border-[#5D8068]/20 text-[#5D8068] font-mono-data text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5D8068]" />
                ALL SYSTEMS CLEAR
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#171717] uppercase tracking-tight mb-2">
                NO ACTIVE COMPLIANCE ALERTS
              </h3>
              <p className="text-xs sm:text-sm text-[#6E6A61] max-w-lg mx-auto font-sans leading-relaxed mb-6">
                Your enterprise compliance profile is in good standing. There are no pending scrutiny queries, overdue statutory filings, or SLA breaches recorded.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left mb-6">
                <div className="bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171717] mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#5D8068] shrink-0" />
                    <span>SLA Timelines</span>
                  </div>
                  <p className="text-[11px] text-[#6E6A61] font-sans">
                    All department review countdowns are within normal statutory limits.
                  </p>
                </div>
                <div className="bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171717] mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#5D8068] shrink-0" />
                    <span>Scrutiny Queries</span>
                  </div>
                  <p className="text-[11px] text-[#6E6A61] font-sans">
                    Zero inspector deficiency memos or pending document requests.
                  </p>
                </div>
                <div className="bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#171717] mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#5D8068] shrink-0" />
                    <span>Statutory Licenses</span>
                  </div>
                  <p className="text-[11px] text-[#6E6A61] font-sans">
                    All operating permissions, consents, and licenses remain current.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/dashboard">
                  <Button variant="primary" size="sm" icon={ArrowRight}>
                    RETURN TO OVERVIEW
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    const eventDetail = {
                      detail: {
                        query: 'Are there any upcoming regulatory or statutory compliance obligations for my business?',
                      },
                    };
                    window.dispatchEvent(new CustomEvent('askSnehaAlert', eventDetail));
                    window.dispatchEvent(new CustomEvent('askGraceAlert', eventDetail));
                  }}
                  className="px-3.5 py-2 rounded-[3px] border border-[#262522] bg-[#FFFFFF] hover:bg-[#E9E1D0] text-xs font-mono-data font-bold text-[#18324A] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C08A3E]" />
                  <span>CONSULT SNEHA AI</span>
                </button>
              </div>
            </div>
          ) : (
            /* Filter resulted in 0 items */
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-12 text-center my-4">
              <Filter className="w-8 h-8 text-[#6E6A61] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#171717] uppercase tracking-tight mb-1">
                NO {selectedFilter} ALERTS
              </h3>
              <p className="text-xs text-[#6E6A61] mb-4">
                No active notifications match the selected "{selectedFilter}" category.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedFilter('ALL')}
              >
                SHOW ALL NOTIFICATIONS
              </Button>
            </div>
          )
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';
            const isSuccess = alert.severity === 'SUCCESS';

            const severityBorder = isCritical
              ? 'border-l-4 border-l-[#B85C4A]'
              : isWarning
              ? 'border-l-4 border-l-[#C08A3E]'
              : isSuccess
              ? 'border-l-4 border-l-[#5D8068]'
              : 'border-l-4 border-l-[#18324A]';

            const IconComp = isCritical
              ? AlertTriangle
              : isWarning
              ? AlertCircle
              : isSuccess
              ? CheckCircle
              : Info;

            const iconColor = isCritical
              ? 'text-[#B85C4A]'
              : isWarning
              ? 'text-[#C08A3E]'
              : isSuccess
              ? 'text-[#5D8068]'
              : 'text-[#18324A]';

            return (
              <div
                key={alert.id}
                className={`bg-[#FFFFFF] border border-[#262522] ${severityBorder} rounded-[4px] p-4 transition-all hover:shadow-[0_4px_12px_rgba(23,23,23,0.04)] ${
                  !alert.read ? 'bg-[#FFFFFF]' : 'bg-[#FAF8F2]/60 opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <IconComp className={`w-5 h-5 ${iconColor}`} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`font-mono-data text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isCritical
                            ? 'bg-[#B85C4A]/15 text-[#B85C4A]'
                            : isWarning
                            ? 'bg-[#C08A3E]/15 text-[#8F5E17]'
                            : isSuccess
                            ? 'bg-[#5D8068]/15 text-[#5D8068]'
                            : 'bg-[#18324A]/10 text-[#18324A]'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="font-mono-data text-[11px] text-[#6E6A61]">
                          {alert.department}
                        </span>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-[#18324A]" title="Unread alert" />
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-[#171717] tracking-tight">
                        {alert.title}
                      </h3>

                      <p className="text-xs text-[#6E6A61] mt-1 font-sans leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="mt-2.5 flex items-center gap-3 text-[11px] font-mono-data text-[#8B8982]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(alert.timestamp).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D6D0C3]">
                    {alert.link && (
                      <Link to={alert.link} onClick={() => handleMarkRead(alert.id)}>
                        <Button
                          variant={isCritical ? 'danger' : 'primary'}
                          size="sm"
                          icon={ArrowRight}
                        >
                          {alert.actionLabel || 'VIEW DETAILS'}
                        </Button>
                      </Link>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const eventDetail = {
                            detail: {
                              query: `How do I resolve the alert: "${alert.title}" from ${alert.department}? What documents or statutory steps are needed?`,
                            },
                          };
                          window.dispatchEvent(new CustomEvent('askSnehaAlert', eventDetail));
                          window.dispatchEvent(new CustomEvent('askGraceAlert', eventDetail));
                          window.scrollTo({ top: 180, behavior: 'smooth' });
                        }}
                        className="text-[11px] font-mono-data text-[#18324A] hover:text-[#C08A3E] flex items-center gap-1 font-semibold px-2 py-1 rounded bg-[#E9E1D0]/60 hover:bg-[#E9E1D0] transition-colors cursor-pointer"
                        title="Ask Sneha how to resolve this alert"
                      >
                        <Sparkles className="w-3 h-3 text-[#C08A3E]" />
                        <span>Ask Sneha</span>
                      </button>

                      {!alert.read && (
                        <button
                          onClick={() => handleMarkRead(alert.id)}
                          className="text-[11px] font-mono-data text-[#6E6A61] hover:text-[#18324A] cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="text-[#6E6A61] hover:text-[#B85C4A] p-1 cursor-pointer"
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}
