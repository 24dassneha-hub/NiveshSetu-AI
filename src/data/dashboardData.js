/**
 * Dynamic live data engine for NiveshSetu AI Entrepreneur Dashboard.
 * 
 * Computes live metrics, interactive roadmap DAG, action items, deadlines,
 * and compliance scores in REAL TIME directly from the user's actual records:
 * - approvalsStorage
 * - applicationsStorage
 * - documentsStorage
 * - renewalsStorage
 * - AuthContext user profile
 */

import { getApprovals } from './approvalsStorage.js';
import { getApplications } from './applicationsStorage.js';
import { getDocuments } from './documentsStorage.js';
import { getRenewals, getRenewalUrgency } from './renewalsStorage.js';
import { getAlerts } from './alertsStorage.js';
import {
  getAppMode,
  DEMO_BUSINESS_PROFILE,
  getUserBusinessProfile,
  APP_MODE,
} from './appModeState.js';

export function getLiveDashboardData(user = null) {
  const mode = getAppMode();
  const isDemo = mode === APP_MODE.DEMO;

  const approvals = getApprovals();
  const applications = getApplications();
  const documents = getDocuments();
  const renewals = getRenewals();
  const alerts = getAlerts();

  // 1. Business Profile Information
  let business;
  if (isDemo) {
    business = {
      name: DEMO_BUSINESS_PROFILE.businessName,
      accountType: DEMO_BUSINESS_PROFILE.accountType,
      initials: 'OE',
      project: DEMO_BUSINESS_PROFILE.industrySector,
      location: DEMO_BUSINESS_PROFILE.location,
      projectValue: DEMO_BUSINESS_PROFILE.investmentRange,
      employees: `${DEMO_BUSINESS_PROFILE.employees} Personnel`,
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      isLive: false,
      isDemo: true,
      mode: APP_MODE.DEMO,
    };
  } else {
    const userProfile = getUserBusinessProfile(user);
    const resolvedName = userProfile.name || userProfile.businessName || '';
    const hasName = Boolean(resolvedName && resolvedName.trim());
    const resolvedSector = userProfile.project || userProfile.sector || userProfile.industrySector || userProfile.businessType || '';
    const resolvedLocation = userProfile.location || (userProfile.district ? `${userProfile.district}, ${userProfile.state || 'Odisha'}` : '');
    const resolvedValue = userProfile.projectValue || userProfile.investmentRange || userProfile.investment || '';
    const resolvedEmployees = userProfile.employees
      ? (String(userProfile.employees).includes('Personnel') ? userProfile.employees : `${userProfile.employees} Personnel`)
      : userProfile.employmentEstimate
      ? `${userProfile.employmentEstimate} Personnel`
      : '';

    business = {
      name: hasName ? resolvedName : '[Enter Business Name]',
      accountType: userProfile.accountType || 'Single Window Registered Enterprise',
      initials: hasName
        ? resolvedName.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'EN'
        : 'NE',
      project: resolvedSector || '[Select Business Sector]',
      location: resolvedLocation || '[Select Location]',
      projectValue: resolvedValue || '[Enter Investment]',
      employees: resolvedEmployees || '[Enter Employees]',
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      isLive: true,
      isDemo: false,
      isConfigured: hasName,
      mode: APP_MODE.CLEAN,
    };
  }

  // 2. Compute Real-Time Metric Counters
  let completedCount = 0;
  let inReviewCount = 0;
  let actionRequiredCount = 0;

  approvals.forEach((appr) => {
    const status = (appr.application?.status || '').toLowerCase();
    if (status === 'approved' || status === 'completed') {
      completedCount++;
    } else if (['in review', 'in_review', 'under review', 'submitted', 'inspection pending'].includes(status)) {
      inReviewCount++;
    } else if (['documents required', 'query raised', 'action required', 'rejected'].includes(status)) {
      actionRequiredCount++;
    }
  });

  // Also include applications and renewals in action/review counts
  applications.forEach((app) => {
    if (['UNDER_REVIEW', 'SUBMITTED', 'INSPECTION_PENDING'].includes(app.status)) {
      inReviewCount++;
    } else if (['QUERY_RAISED', 'REJECTED'].includes(app.status)) {
      actionRequiredCount++;
    }
  });

  renewals.forEach((r) => {
    const urgency = getRenewalUrgency(r);
    if (urgency.isCritical || urgency.isExpired) {
      actionRequiredCount++;
    } else if (r.status === 'IN_PROGRESS') {
      inReviewCount++;
    }
  });

  const totalApprovalsCount = approvals.length;
  const compliancePercentage = totalApprovalsCount > 0
    ? Math.round((completedCount / totalApprovalsCount) * 100)
    : 0;

  const metrics = [
    {
      id: 'total_approvals',
      label: 'TOTAL CLEARANCES',
      value: String(totalApprovalsCount),
      supporting: totalApprovalsCount > 0 ? `${completedCount} active / verified` : 'Add your first clearance',
      status: totalApprovalsCount > 0 ? 'approved' : 'neutral',
      indicatorColor: '#18324A',
    },
    {
      id: 'in_review',
      label: 'IN SCRUTINY',
      value: String(inReviewCount),
      supporting: inReviewCount > 0 ? `${inReviewCount} filings under review` : 'No active scrutiny',
      status: inReviewCount > 0 ? 'pending' : 'neutral',
      indicatorColor: inReviewCount > 0 ? '#C08A3E' : '#8B8982',
    },
    {
      id: 'action_required',
      label: 'ACTION REQUIRED',
      value: String(actionRequiredCount),
      supporting: actionRequiredCount > 0 ? `${actionRequiredCount} items need attention` : 'All items up to date',
      status: actionRequiredCount > 0 ? 'action_required' : 'approved',
      indicatorColor: actionRequiredCount > 0 ? '#B85C4A' : '#5D8068',
    },
    {
      id: 'compliance_score',
      label: 'COMPLIANCE SCORE',
      value: totalApprovalsCount > 0 ? `${compliancePercentage}%` : '0%',
      supporting: totalApprovalsCount > 0 ? (compliancePercentage >= 70 ? 'Statutory status healthy' : 'Action items pending') : 'Upload data to calculate',
      status: compliancePercentage >= 70 ? 'approved' : 'pending',
      indicatorColor: compliancePercentage >= 70 ? '#5D8068' : '#C08A3E',
    },
  ];

  // 3. Approval Roadmap (DAG) Generated from User's Real Approvals
  const roadmap = approvals.map((appr, idx) => {
    const rawStatus = (appr.application?.status || '').toLowerCase().replace(/[\s-]/g, '_');
    let mappedStatus = 'not_started';
    let symbol = '○';

    if (['approved', 'completed', 'active'].includes(rawStatus)) {
      mappedStatus = 'completed';
      symbol = '✓';
    } else if (['in_review', 'under_review', 'submitted', 'inspection_pending'].includes(rawStatus)) {
      mappedStatus = 'in_review';
      symbol = '●';
    } else if (['documents_required', 'query_raised', 'action_required', 'rejected'].includes(rawStatus)) {
      mappedStatus = 'action_required';
      symbol = '!';
    }

    return {
      id: appr.id,
      stepNumber: idx + 1,
      name: appr.name || 'Statutory Clearance',
      status: mappedStatus,
      statusLabel: (appr.application?.status || 'NOT STARTED').toUpperCase(),
      symbol: symbol,
      authority: appr.authority?.name || appr.issuingAuthority || 'Issuing Authority',
      submittedDate: appr.appliedDate || (appr.createdAt ? new Date(appr.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : null),
      expectedUpdate: appr.sla?.deadline ? `SLA: ${appr.sla.deadline}` : 'Within Mandated SLA',
      completedDate: appr.approvedDate || null,
      nextAction: mappedStatus === 'completed'
        ? 'Clearance granted & active'
        : mappedStatus === 'action_required'
        ? 'Submit required compliance filings'
        : 'Under department scrutiny',
      description: appr.description || 'Statutory compliance clearance.',
    };
  });

  // 4. Real Actions Required Generated from User's Live State
  const actions = [];

  // Add actions for approvals needing documents
  approvals.forEach((appr) => {
    const st = (appr.application?.status || '').toLowerCase();
    if (st === 'documents required' || st === 'documents_required') {
      actions.push({
        id: `act_appr_${appr.id}`,
        title: `Upload mandatory documents for ${appr.name}`,
        status: 'action_required',
        statusLabel: 'DOCUMENTS REQUIRED',
        due: 'Action Needed',
        ctaText: 'UPLOAD →',
        nodeId: appr.id,
      });
    }
  });

  // Add actions for applications with queries raised
  applications.forEach((app) => {
    if (app.status === 'QUERY_RAISED') {
      actions.push({
        id: `act_app_${app.id}`,
        title: `Respond to scrutiny query on ${app.title}`,
        status: 'action_required',
        statusLabel: 'QUERY RAISED',
        due: 'Urgent',
        ctaText: 'RESPOND →',
        nodeId: app.approvalId || app.id,
      });
    }
  });

  // Add actions for urgent renewals
  renewals.forEach((r) => {
    const urgency = getRenewalUrgency(r);
    if ((urgency.isCritical || urgency.isExpired) && r.status !== 'IN_PROGRESS') {
      actions.push({
        id: `act_ren_${r.id}`,
        title: `Renew clearance: ${r.clearanceName}`,
        status: 'action_required',
        statusLabel: urgency.label,
        due: urgency.daysRemaining >= 0 ? `${urgency.daysRemaining} days left` : 'Overdue',
        ctaText: 'RENEW →',
        nodeId: r.approvalId || r.id,
      });
    }
  });

  // 5. Upcoming Deadlines Generated from User's Real Dates
  const deadlines = [];

  renewals.forEach((r) => {
    if (r.expiryDate) {
      const urgency = getRenewalUrgency(r);
      deadlines.push({
        id: `dl_ren_${r.id}`,
        date: new Date(r.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase(),
        item: r.clearanceName,
        type: 'Renewal Expiry',
        status: urgency.isCritical ? 'action_required' : urgency.isDueSoon ? 'due_soon' : 'in_review',
        statusLabel: urgency.daysRemaining >= 0 ? `${urgency.daysRemaining}d left` : 'Expired',
        statusColor: urgency.color,
      });
    }
  });

  applications.forEach((app) => {
    if (app.deadline || app.createdAt) {
      const d = app.deadline || app.createdAt;
      deadlines.push({
        id: `dl_app_${app.id}`,
        date: new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase(),
        item: app.title,
        type: 'Application SLA',
        status: app.status === 'QUERY_RAISED' ? 'action_required' : 'in_review',
        statusLabel: app.status,
        statusColor: '#18324A',
      });
    }
  });

  // Sort deadlines by date ascending
  deadlines.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // 6. Recent Activity Generated from Real Events
  const activity = [];

  applications.forEach((app) => {
    if (Array.isArray(app.timeline)) {
      app.timeline.forEach((evt) => {
        activity.push({
          id: evt.id || `act_${Math.random()}`,
          timestamp: evt.timestamp ? new Date(evt.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
          text: `${app.title}: ${evt.title || evt.description}`,
        });
      });
    }
  });

  documents.forEach((doc) => {
    if (doc.createdAt) {
      activity.push({
        id: `act_doc_${doc.id}`,
        timestamp: new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        text: `Document uploaded: ${doc.name} (${doc.type})`,
      });
    }
  });

  // Sort by timestamp desc and take top 5
  activity.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  const topActivity = activity.slice(0, 5);

  // 7. Real Compliance Snapshot Breakdown
  const compliance = {
    percentage: compliancePercentage,
    summary: totalApprovalsCount > 0
      ? `${completedCount} of ${totalApprovalsCount} statutory requirements satisfied`
      : 'No approvals recorded. Add your clearances to begin tracking.',
    breakdown: {
      completed: totalApprovalsCount > 0 ? Math.round((completedCount / totalApprovalsCount) * 100) : 0,
      inReview: totalApprovalsCount > 0 ? Math.round((inReviewCount / totalApprovalsCount) * 100) : 0,
      actionRequired: totalApprovalsCount > 0 ? Math.round((actionRequiredCount / totalApprovalsCount) * 100) : 0,
    },
    counts: {
      completed: completedCount,
      inReview: inReviewCount,
      actionRequired: actionRequiredCount,
      total: totalApprovalsCount,
    }
  };

  // 8. Notifications mapped from real alerts
  const notifications = alerts.map((a) => ({
    id: a.id,
    title: a.title,
    detail: a.message,
    time: new Date(a.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    isUrgent: a.severity === 'CRITICAL',
    link: a.link,
  }));

  return {
    business,
    metrics,
    roadmap,
    actions,
    deadlines,
    activity: topActivity,
    compliance,
    notifications,
    mode,
    isDemo,
  };
}

// Reactive proxy ensuring backward compatibility with components importing dashboardData
export const dashboardData = new Proxy({}, {
  get(target, prop) {
    const live = getLiveDashboardData();
    return live[prop];
  }
});
