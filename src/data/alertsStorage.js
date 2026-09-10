/**
 * Centralized local persistence and data contracts for Compliance Alerts & Scrutiny Notifications.
 */

import { isCleanMode, USER_ALERTS_KEY } from './appModeState.js';

export const ALERTS_STORAGE_KEY = 'niveshsetu_alerts';

export function getAlertsStorageKey() {
  return isCleanMode() ? USER_ALERTS_KEY : ALERTS_STORAGE_KEY;
}

export const SAMPLE_ALERTS = [
  {
    id: 'ALT-001',
    severity: 'CRITICAL',
    category: 'EXPIRY',
    title: 'Urgent Expiry: Factory License & Machinery Endorsement',
    message: 'Clearance expires in 9 days. Compounding late surcharge of ₹1,800/mo applies after deadline. Statutory RTSA SLA requires immediate submission.',
    link: '/renewals/REN-2026-002',
    actionLabel: 'Initiate Renewal Now',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    department: 'Directorate of Factories and Boilers'
  },
  {
    id: 'ALT-002',
    severity: 'CRITICAL',
    category: 'OVERDUE',
    title: 'Statutory Penalty Notice: Hazardous Chemical Storage Authorization',
    message: 'Authorization expired 10 days ago. Immediate renewal filing required to avoid plant closure notice under Section 15 of Environment (Protection) Act 1986.',
    link: '/renewals/REN-2026-005',
    actionLabel: 'Resolve Overdue Status',
    read: false,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    department: 'State Pollution Control Board (OSPCB)'
  },
  {
    id: 'ALT-003',
    severity: 'WARNING',
    category: 'QUERY',
    title: 'Inspector Query Raised: Consent to Operate Application',
    message: 'Regional Officer Dr. Mohapatra raised a query: "Provide certified hydraulic test report for high-pressure steam pipelines before final signoff."',
    link: '/applications/APP-2026-00421',
    actionLabel: 'Submit Query Response',
    read: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    department: 'State Pollution Control Board (OSPCB)'
  },
  {
    id: 'ALT-004',
    severity: 'INFO',
    category: 'INSPECTION',
    title: 'On-Site Field Verification Scheduled',
    message: 'Joint field inspection by Directorate of Fire Services scheduled for Friday, 11:30 AM. Please keep safety warden logs accessible.',
    link: '/approvals',
    actionLabel: 'View Inspection Protocol',
    read: true,
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    department: 'Directorate of Fire and Emergency Services'
  },
  {
    id: 'ALT-005',
    severity: 'SUCCESS',
    category: 'INCENTIVE',
    title: 'Statutory Incentive Disbursed: Electricity Duty Exemption',
    message: '₹4,80,000 duty waiver sanction order received from Department of Energy. Monthly billing codes updated in DISCOM portal.',
    link: '/incentives/INC-2026-004',
    actionLabel: 'View Sanction Order',
    read: true,
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    department: 'Department of Energy, Odisha'
  }
];

export function getAlerts() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const key = getAlertsStorageKey();
    const raw = localStorage.getItem(key);
    if (raw === null) {
      if (!isCleanMode()) {
        localStorage.setItem(key, JSON.stringify(SAMPLE_ALERTS));
        return SAMPLE_ALERTS;
      } else {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading alerts from localStorage:', err);
    return [];
  }
}

export function markAlertAsRead(id) {
  if (typeof localStorage === 'undefined') return;
  const key = getAlertsStorageKey();
  const list = getAlerts();
  const updated = list.map((a) => (a.id === id ? { ...a, read: true } : a));
  try {
    localStorage.setItem(key, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alertsUpdated', { detail: updated }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Failed to update alert in localStorage:', err);
  }
  return updated;
}

export function markAllAlertsAsRead() {
  if (typeof localStorage === 'undefined') return;
  const key = getAlertsStorageKey();
  const list = getAlerts();
  const updated = list.map((a) => ({ ...a, read: true }));
  try {
    localStorage.setItem(key, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alertsUpdated', { detail: updated }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Failed to update alerts in localStorage:', err);
  }
  return updated;
}

export function dismissAlert(id) {
  if (typeof localStorage === 'undefined') return;
  const key = getAlertsStorageKey();
  const list = getAlerts();
  const updated = list.filter((a) => a.id !== id);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alertsUpdated', { detail: updated }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Failed to dismiss alert in localStorage:', err);
  }
  return updated;
}

export function getUnreadAlertsCount(alertsList = null) {
  const list = alertsList || getAlerts();
  return list.filter((a) => !a.read).length;
}

export function calculateAlertMetrics(alertsList = null) {
  const list = alertsList || getAlerts();
  let total = list.length;
  let unread = 0;
  let critical = 0;
  let warning = 0;

  list.forEach((a) => {
    if (!a.read) unread++;
    if (a.severity === 'CRITICAL') critical++;
    if (a.severity === 'WARNING') warning++;
  });

  return { total, unread, critical, warning };
}

export function addAlert(alertData) {
  if (typeof localStorage === 'undefined') return null;
  const key = getAlertsStorageKey();
  const list = getAlerts();
  const nextId = `ALT-${String(list.length + 1).padStart(3, '0')}`;
  const newAlert = {
    id: alertData.id || nextId,
    severity: alertData.priority === 'CRITICAL' ? 'CRITICAL' : alertData.type === 'APPROVED' ? 'SUCCESS' : 'WARNING',
    category: alertData.type || 'COMPLIANCE',
    title: alertData.title,
    message: alertData.message,
    link: alertData.link || '/approvals',
    actionLabel: alertData.actionLabel || 'View in Monitor',
    read: false,
    timestamp: new Date().toISOString(),
    department: alertData.department || 'Single Window Authority',
  };
  const updated = [newAlert, ...list];
  try {
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save alert in localStorage:', err);
  }
  return newAlert;
}
