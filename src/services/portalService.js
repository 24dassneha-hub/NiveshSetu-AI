/**
 * Portal Service Layer: Pure business logic for official portal lookups,
 * search, filtering, channel resolution, document readiness scoring,
 * and security validation.
 */

import { OFFICIAL_PORTALS } from '../data/portalDirectory.js';
import { LICENSE_CATALOG } from '../data/licenseRequirementsData.js';

/**
 * Retrieve all registered official portals
 */
export function getAllPortals() {
  return OFFICIAL_PORTALS;
}

/**
 * Lookup a portal by its unique identifier
 */
export function getPortalById(id) {
  if (!id) return null;
  return OFFICIAL_PORTALS.find((p) => p.id === id) || null;
}

/**
 * Resolve the authorized application channel based on strict priority:
 * 1. Authorized Direct API (when available in future)
 * 2. National Single Window System (NSWS)
 * 3. Verified Official Government Portal
 * 4. Unavailable
 */
export function resolveApplicationChannel(portal) {
  if (!portal) return 'UNAVAILABLE';

  if (portal.integration?.available === true && portal.integration?.type === 'API') {
    return 'API';
  }

  if (portal.nsws?.available === true && portal.nsws?.url) {
    return 'NSWS';
  }

  if (
    portal.applicationChannel?.type === 'EXTERNAL_PORTAL' &&
    portal.applicationChannel?.verified === true &&
    portal.officialUrl &&
    portal.officialUrl.startsWith('https://')
  ) {
    return 'EXTERNAL_PORTAL';
  }

  return 'UNAVAILABLE';
}

/**
 * Strict security validation before any external redirect is permitted
 */
export function validateOfficialPortal(portal) {
  if (!portal) {
    return { isValid: false, reason: 'Portal record not found' };
  }

  if (!portal.verified) {
    return { isValid: false, reason: 'Portal has not been verified by NiveshSetu administrators' };
  }

  if (portal.sourceType !== 'OFFICIAL_GOVERNMENT_PORTAL') {
    return { isValid: false, reason: 'Portal is not classified as an official government channel' };
  }

  const targetUrl = portal.nsws?.available ? portal.nsws.url : portal.officialUrl;
  if (!targetUrl || !targetUrl.startsWith('https://')) {
    return { isValid: false, reason: 'Target portal does not provide a secure HTTPS endpoint' };
  }

  return { isValid: true, cleanUrl: targetUrl };
}

/**
 * Client-side search across service names, authorities, departments, categories, and aliases
 */
export function searchPortals(query, portalList = OFFICIAL_PORTALS) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return portalList;
  }

  const q = query.toLowerCase().trim();
  const queryTokens = q.split(/\s+/).filter(Boolean);

  return portalList.filter((portal) => {
    const searchable = [
      portal.serviceName,
      portal.authority?.name,
      portal.authority?.department,
      portal.category,
      portal.description,
      portal.acts,
      portal.domain,
      ...(portal.aliases || []),
      ...(portal.approvalTypes || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Check token match
    return queryTokens.every((token) => searchable.includes(token));
  });
}

/**
 * Multi-dimensional filtering for portal directory
 */
export function filterPortals(portalList, filters = {}) {
  const { category = 'All', state = 'All', authority = 'All', channel = 'All' } = filters;

  return portalList.filter((portal) => {
    // Category match
    if (category !== 'All' && portal.category !== category) {
      return false;
    }

    // State match
    if (state !== 'All') {
      const portalState = portal.authority?.state || '';
      if (!portalState.toLowerCase().includes(state.toLowerCase())) {
        return false;
      }
    }

    // Authority match
    if (authority !== 'All' && portal.authority?.name !== authority) {
      return false;
    }

    // Channel match
    if (channel !== 'All') {
      const resolvedChannel = resolveApplicationChannel(portal);
      if (channel === 'NSWS' && resolvedChannel !== 'NSWS') return false;
      if (channel === 'Official Portal' && resolvedChannel !== 'EXTERNAL_PORTAL') return false;
      if (channel === 'Authorized API' && resolvedChannel !== 'API') return false;
      if (channel === 'Unavailable' && resolvedChannel !== 'UNAVAILABLE') return false;
    }

    return true;
  });
}

/**
 * Extract dynamic filter lists from portal data
 */
export function getUniqueCategories(portalList = OFFICIAL_PORTALS) {
  const set = new Set(portalList.map((p) => p.category).filter(Boolean));
  return ['All', ...Array.from(set).sort()];
}

export function getUniqueStates(portalList = OFFICIAL_PORTALS) {
  const set = new Set(portalList.map((p) => p.authority?.state).filter(Boolean));
  return ['All', ...Array.from(set).sort()];
}

export function getUniqueAuthorities(portalList = OFFICIAL_PORTALS) {
  const set = new Set(portalList.map((p) => p.authority?.name).filter(Boolean));
  return ['All', ...Array.from(set).sort()];
}

export function getUniqueChannels() {
  return ['All', 'Official Portal', 'NSWS', 'Authorized API'];
}

/**
 * Calculate Document Readiness for a specific portal by matching against
 * user's uploaded documents in Document Vault
 */
export function calculateDocumentReadiness(portal, userDocuments = []) {
  if (!portal) {
    return {
      totalRequired: 0,
      readyCount: 0,
      verifiedCount: 0,
      missingCount: 0,
      percentage: 0,
      status: 'NO_DOCUMENT_DATA',
      items: [],
    };
  }

  // Find statutory license specification from LICENSE_CATALOG
  const licenseSpec = portal.matchingLicenseId
    ? LICENSE_CATALOG.find((l) => l.id === portal.matchingLicenseId)
    : null;

  const requiredSpecs = licenseSpec?.requiredDocuments || [];

  if (requiredSpecs.length === 0) {
    // If no explicit license spec, match by portal.requiredDocumentTypes
    if (portal.requiredDocumentTypes && portal.requiredDocumentTypes.length > 0) {
      const items = portal.requiredDocumentTypes.map((type) => {
        const found = userDocuments.find(
          (d) => d.type === type && (d.status === 'UPLOADED' || d.status === 'VERIFIED' || Boolean(d.file?.name))
        );
        return {
          name: type.replace(/_/g, ' '),
          type,
          isMandatory: true,
          isReady: Boolean(found),
          isVerified: found?.verification?.status === 'VERIFIED' || found?.status === 'VERIFIED',
          documentName: found?.name || null,
        };
      });

      const totalRequired = items.length;
      const readyCount = items.filter((i) => i.isReady).length;
      const verifiedCount = items.filter((i) => i.isVerified).length;
      const missingCount = totalRequired - readyCount;
      const percentage = totalRequired > 0 ? Math.round((readyCount / totalRequired) * 100) : 100;

      let status = 'READY';
      if (missingCount > 0) {
        status = readyCount > 0 ? 'PARTIALLY_READY' : 'ACTION_REQUIRED';
      }

      return {
        totalRequired,
        readyCount,
        verifiedCount,
        missingCount,
        percentage,
        status,
        items,
      };
    }

    return {
      totalRequired: 0,
      readyCount: 0,
      verifiedCount: 0,
      missingCount: 0,
      percentage: 100,
      status: 'READY',
      items: [],
    };
  }

  // Evaluate against userDocuments
  const items = requiredSpecs.map((req) => {
    // 1. Direct type or name match in user documents
    const matchedDoc = userDocuments.find((doc) => {
      // Name overlap or type match
      const docName = (doc.name || '').toLowerCase();
      const reqName = req.name.toLowerCase();
      const typeMatch = doc.type && doc.type === req.type;
      const nameMatch = docName.includes(reqName) || reqName.includes(docName);
      const isFileUploaded = doc.status === 'UPLOADED' || doc.status === 'VERIFIED' || Boolean(doc.file?.name);

      return isFileUploaded && (typeMatch || nameMatch);
    });

    const isReady = Boolean(matchedDoc);
    const isVerified =
      matchedDoc?.verification?.status === 'VERIFIED' || matchedDoc?.status === 'VERIFIED';

    return {
      name: req.name,
      type: req.type,
      isMandatory: req.isMandatory,
      description: req.description,
      isReady,
      isVerified,
      documentName: matchedDoc?.name || null,
    };
  });

  const mandatoryItems = items.filter((i) => i.isMandatory);
  const totalRequired = mandatoryItems.length;
  const readyCount = mandatoryItems.filter((i) => i.isReady).length;
  const verifiedCount = mandatoryItems.filter((i) => i.isVerified).length;
  const missingCount = totalRequired - readyCount;
  const percentage = totalRequired > 0 ? Math.round((readyCount / totalRequired) * 100) : 100;

  let status = 'READY';
  if (missingCount > 0) {
    status = readyCount > 0 ? 'PARTIALLY_READY' : 'ACTION_REQUIRED';
  }

  return {
    totalRequired,
    readyCount,
    verifiedCount,
    missingCount,
    percentage,
    status,
    items,
  };
}

/**
 * Connects user approvals (from approvalsStorage) and recommendations to trusted portals
 */
export function getRecommendedPortals(userApprovals = [], userDocuments = []) {
  // If user has specific approvals in approvalsStorage, map them
  if (Array.isArray(userApprovals) && userApprovals.length > 0) {
    return userApprovals
      .map((approval) => {
        // 1. Check if approval has explicit portalId
        let portal = approval.portalId ? getPortalById(approval.portalId) : null;

        // 2. Fuzzy match by name or category if portalId is not set
        if (!portal) {
          const appName = (approval.name || '').toLowerCase();
          portal = OFFICIAL_PORTALS.find((p) => {
            if (p.serviceName.toLowerCase().includes(appName) || appName.includes(p.serviceName.toLowerCase())) {
              return true;
            }
            if (p.aliases && p.aliases.some((a) => appName.includes(a.toLowerCase()) || a.toLowerCase().includes(appName))) {
              return true;
            }
            if (p.approvalTypes && p.approvalTypes.some((t) => appName.includes(t.toLowerCase()) || t.toLowerCase().includes(appName))) {
              return true;
            }
            return false;
          });
        }

        const readiness = calculateDocumentReadiness(portal, userDocuments);
        const channelType = resolveApplicationChannel(portal);

        return {
          id: approval.id || portal?.id || `rec-${Math.random()}`,
          name: approval.name || portal?.serviceName || 'Statutory Approval',
          category: approval.category || portal?.category || 'General',
          authority: approval.authority?.name || portal?.authority?.name || 'Concerned Authority',
          approvalRecord: approval,
          portal: portal || null,
          channelType,
          isAvailable: Boolean(portal && channelType !== 'UNAVAILABLE'),
          readiness,
        };
      })
      .filter(Boolean);
  }

  // Default demo recommendations for Food Processing Unit (Omm Enterprises)
  const defaultPortalIds = [
    'odisha-fire-noc',
    'ospcb-cte',
    'nsws-factory-license',
    'fssai-foscos',
  ];

  return defaultPortalIds
    .map((id) => {
      const portal = getPortalById(id);
      if (!portal) return null;

      const readiness = calculateDocumentReadiness(portal, userDocuments);
      const channelType = resolveApplicationChannel(portal);

      return {
        id: portal.id,
        name: portal.serviceName,
        category: portal.category,
        authority: portal.authority.name,
        approvalRecord: null,
        portal,
        channelType,
        isAvailable: channelType !== 'UNAVAILABLE',
        readiness,
      };
    })
    .filter(Boolean);
}
