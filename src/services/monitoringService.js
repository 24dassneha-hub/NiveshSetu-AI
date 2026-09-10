/**
 * Monitoring Service Layer: Handles status normalization, connector interfaces
 * for government single windows / APIs (NSWS, API Setu, Department APIs),
 * Sneha AI natural language explanations, and status diff/alert generation.
 * 
 * CORE ARCHITECTURAL RULE:
 * The government system is the sole source of truth.
 * Sneha AI normalizes terminology, explains what the status means, detects changes,
 * and surfaces required actions — it NEVER invents approvals or decisions.
 */

import { addAlert } from '../data/alertsStorage.js';

/**
 * Normalized Status Codes
 */
export const NORMALIZED_STATUS = {
  APPROVED: 'APPROVED',
  UNDER_PROCESS: 'UNDER_PROCESS',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  NOT_YET: 'NOT_YET',
  REJECTED: 'REJECTED',
};

/**
 * Normalization Dictionary: Maps disparate government department terminology
 * into unified, actionable NiveshSetu compliance states.
 */
const STATUS_MAPPINGS = {
  // APPROVED category
  'approved': NORMALIZED_STATUS.APPROVED,
  'certificate issued': NORMALIZED_STATUS.APPROVED,
  'granted': NORMALIZED_STATUS.APPROVED,
  'sanctioned': NORMALIZED_STATUS.APPROVED,
  'cleared': NORMALIZED_STATUS.APPROVED,
  'license generated': NORMALIZED_STATUS.APPROVED,

  // UNDER_PROCESS category
  'application received': NORMALIZED_STATUS.UNDER_PROCESS,
  'submitted': NORMALIZED_STATUS.UNDER_PROCESS,
  'under scrutiny': NORMALIZED_STATUS.UNDER_PROCESS,
  'under examination': NORMALIZED_STATUS.UNDER_PROCESS,
  'pending at department': NORMALIZED_STATUS.UNDER_PROCESS,
  'processing': NORMALIZED_STATUS.UNDER_PROCESS,
  'verification in progress': NORMALIZED_STATUS.UNDER_PROCESS,
  'inspection scheduled': NORMALIZED_STATUS.UNDER_PROCESS,
  'inspection completed': NORMALIZED_STATUS.UNDER_PROCESS,
  'in review': NORMALIZED_STATUS.UNDER_PROCESS,
  'department review': NORMALIZED_STATUS.UNDER_PROCESS,

  // ACTION_REQUIRED category
  'query raised': NORMALIZED_STATUS.ACTION_REQUIRED,
  'clarification required': NORMALIZED_STATUS.ACTION_REQUIRED,
  'additional documents required': NORMALIZED_STATUS.ACTION_REQUIRED,
  'deficiency notice': NORMALIZED_STATUS.ACTION_REQUIRED,
  'applicant action required': NORMALIZED_STATUS.ACTION_REQUIRED,
  'payment required': NORMALIZED_STATUS.ACTION_REQUIRED,
  're-inspection fee pending': NORMALIZED_STATUS.ACTION_REQUIRED,
  'compliance response awaited': NORMALIZED_STATUS.ACTION_REQUIRED,

  // NOT_YET category
  'not started': NORMALIZED_STATUS.NOT_YET,
  'not applied': NORMALIZED_STATUS.NOT_YET,
  'draft': NORMALIZED_STATUS.NOT_YET,
  'ready to apply': NORMALIZED_STATUS.NOT_YET,
  'eligibility identified': NORMALIZED_STATUS.NOT_YET,

  // REJECTED category
  'rejected': NORMALIZED_STATUS.REJECTED,
  'application rejected': NORMALIZED_STATUS.REJECTED,
  'revoked': NORMALIZED_STATUS.REJECTED,
  'cancelled': NORMALIZED_STATUS.REJECTED,
};

/**
 * Normalizes any raw government status string into one of the 5 core states
 */
export function normalizeGovernmentStatus(rawStatus) {
  if (!rawStatus || typeof rawStatus !== 'string') {
    return NORMALIZED_STATUS.UNDER_PROCESS;
  }
  const clean = rawStatus.toLowerCase().trim();
  return STATUS_MAPPINGS[clean] || NORMALIZED_STATUS.UNDER_PROCESS;
}

/**
 * Sneha AI Plain-Language Status Explanation Generator
 * Translates raw government events into factual, concise advice for the business owner.
 */
export function generateSnehaExplanation(approval) {
  const normStatus = approval.status?.normalized || NORMALIZED_STATUS.UNDER_PROCESS;
  const govStatus = approval.status?.sourceStatus || 'Processing';
  const approvalName = approval.name || 'Clearance';

  switch (normStatus) {
    case NORMALIZED_STATUS.APPROVED:
      return {
        headline: `${approvalName} has been officially approved.`,
        detail: `The issuing authority marked this application as "${govStatus}". Your official statutory certificate is issued and available for download.`,
        actionAdvice: 'Download your certificate and ensure a copy is maintained in your Document Vault.',
        tone: 'success',
      };

    case NORMALIZED_STATUS.ACTION_REQUIRED:
      return {
        headline: `Action required on your ${approvalName} application.`,
        detail: approval.actionRequired?.message || `The department has raised an official query ("${govStatus}").`,
        actionAdvice: approval.actionRequired?.deadline
          ? `Submit the requested clarification before the statutory deadline (${approval.actionRequired.deadline}) to avoid automatic rejection.`
          : 'Review the department notice and furnish the requested information on the official portal.',
        tone: 'warning',
      };

    case NORMALIZED_STATUS.UNDER_PROCESS:
      return {
        headline: `Your ${approvalName} is currently under official review.`,
        detail: `Latest government status: "${govStatus}" (Stage: ${approval.status?.currentStage || 'Department Review'}).`,
        actionAdvice: 'No action is required from your side at this stage. NiveshSetu will notify you if the department issues a query or decision.',
        tone: 'info',
      };

    case NORMALIZED_STATUS.NOT_YET:
      return {
        headline: `Application for ${approvalName} has not been initiated.`,
        detail: 'This clearance was identified as mandatory for your business category, but no government application ID is linked yet.',
        actionAdvice: 'Visit the Apply section to submit your pre-requisites on the verified government portal.',
        tone: 'neutral',
      };

    case NORMALIZED_STATUS.REJECTED:
      return {
        headline: `Application for ${approvalName} was rejected by the department.`,
        detail: approval.rejectionReason || `Official reason: ${govStatus}.`,
        actionAdvice: 'You may file an appeal under the Odisha Right to Public Services Act (ORTPSA) or submit a corrected application.',
        tone: 'danger',
      };

    default:
      return {
        headline: `Status update available for ${approvalName}.`,
        detail: `Recorded government status: "${govStatus}".`,
        actionAdvice: 'Check the official portal if additional information is required.',
        tone: 'neutral',
      };
  }
}

/**
 * Status Diff & Alert Engine:
 * When an approval's government status moves (e.g. from Under Process to Action Required or Approved),
 * this detects the change and dispatches an automated notification to the user's Alerts Center.
 */
export function detectStatusChangeAndNotify(oldApproval, newApproval) {
  if (!oldApproval || !newApproval) return null;

  const oldNorm = oldApproval.status?.normalized;
  const newNorm = newApproval.status?.normalized;
  const oldGov = oldApproval.status?.sourceStatus;
  const newGov = newApproval.status?.sourceStatus;

  // Check if there was an actual meaningful status transition
  if (oldNorm === newNorm && oldGov === newGov) {
    return null;
  }

  let alertPayload = null;

  if (newNorm === NORMALIZED_STATUS.APPROVED) {
    alertPayload = {
      title: `${newApproval.name} Approved`,
      message: `The government authority has approved your application (${newApproval.application?.applicationId || 'Ref'}). Certificate is ready for download.`,
      type: 'APPROVED',
      priority: 'HIGH',
      link: `/approvals/${newApproval.id}`,
      metadata: {
        approvalId: newApproval.id,
        certificateNumber: newApproval.certificate?.number,
      },
    };
  } else if (newNorm === NORMALIZED_STATUS.ACTION_REQUIRED) {
    alertPayload = {
      title: `Action Required: Query on ${newApproval.name}`,
      message: newApproval.actionRequired?.message || `The department raised a query ("${newGov}"). Response deadline: ${newApproval.actionRequired?.deadline || '7 days'}.`,
      type: 'QUERY_RAISED',
      priority: 'CRITICAL',
      link: `/approvals/${newApproval.id}`,
      metadata: {
        approvalId: newApproval.id,
        deadline: newApproval.actionRequired?.deadline,
      },
    };
  } else if (newNorm === NORMALIZED_STATUS.UNDER_PROCESS && oldNorm !== NORMALIZED_STATUS.UNDER_PROCESS) {
    alertPayload = {
      title: `${newApproval.name} Status Updated`,
      message: `Application moved to stage "${newApproval.status?.currentStage || newGov}".`,
      type: 'STATUS_CHANGE',
      priority: 'MEDIUM',
      link: `/approvals/${newApproval.id}`,
      metadata: {
        approvalId: newApproval.id,
      },
    };
  }

  if (alertPayload) {
    try {
      addAlert(alertPayload);
    } catch (e) {
      console.warn('Could not dispatch alert to alertsStorage:', e);
    }
  }

  return alertPayload;
}

/**
 * Connector Interfaces (Architecture Ready for FastAPI / Real APIs):
 * Standardizes external single window responses into the NiveshSetu schema.
 */
export const MonitoringConnectors = {
  NSWS: {
    name: 'National Single Window System (NSWS)',
    type: 'CENTRAL_SINGLE_WINDOW',
    isLiveConnected: false, // Set to true when government API credentials are provided
    async getStatus(_applicationRef) {
      // In production, calls: GET /api/v1/nsws/applications/{applicationRef}
      return {
        source: 'NSWS',
        connectionStatus: 'SIMULATED',
        timestamp: new Date().toISOString(),
      };
    },
  },
  API_SETU: {
    name: 'API Setu / Government Open API',
    type: 'NATIONAL_DATA_EXCHANGE',
    isLiveConnected: false,
    async getStatus(_applicationRef) {
      return {
        source: 'API_SETU',
        connectionStatus: 'SIMULATED',
        timestamp: new Date().toISOString(),
      };
    },
  },
  DEPARTMENT_API: {
    name: 'Odisha State Department Single Window (GO-SWIFT / OCMMS)',
    type: 'STATE_DEPARTMENT_PORTAL',
    isLiveConnected: false,
    async getStatus(_applicationRef) {
      return {
        source: 'ODISHA_DEPT_API',
        connectionStatus: 'SIMULATED',
        timestamp: new Date().toISOString(),
      };
    },
  },
};
