/**
 * Redirect Scan - URL Transformation & Client Redirect Rules
 */

import { SEVERITY } from '../shared/constants.js';
import { compareRedirectUrls, getDomain } from '../shared/urlUtils.js';

/**
 * Checks URL transformations (cross-domain, www, trailing slash, query parameters)
 * and client-side redirects (Meta Refresh, client_redirect)
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @returns {import('../shared/typedefs.js').SEOIssue[]}
 */
export function evaluateUrlRules(state) {
  const issues = [];
  if (!state) return issues;

  // 1. Analyze server redirect steps
  const steps = state.steps || [];
  steps.forEach((step, index) => {
    const diff = compareRedirectUrls(step.url, step.redirectUrl);
    const stepNum = index + 1;

    if (diff.isCrossDomain) {
      const fromDom = getDomain(step.url);
      const toDom = getDomain(step.redirectUrl);
      issues.push({
        id: `cross-domain-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: Cross-domain redirect`,
        description: `Redirect across domains: ${fromDom} → ${toDom}`,
        stepId: step.id
      });
    }

    if (diff.wwwChanged) {
      issues.push({
        id: `www-changed-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: Canonical hostname adjusted (www)`,
        description: 'www prefix was added or removed during redirection.',
        stepId: step.id
      });
    }

    if (diff.trailingSlashChanged) {
      issues.push({
        id: `trailing-slash-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: Trailing slash normalized`,
        description: 'Trailing slash added or removed in path.',
        stepId: step.id
      });
    }

    if (diff.queryDropped) {
      issues.push({
        id: `query-dropped-step-${stepNum}`,
        severity: SEVERITY.WARNING,
        title: `Step ${stepNum}: Query parameters stripped`,
        description: `All URL query parameters were dropped during redirect to ${step.redirectUrl}. Marketing tags or tracking parameters might be lost.`,
        stepId: step.id
      });
    } else if (diff.queryParamsRemoved.length > 0) {
      issues.push({
        id: `query-removed-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: Query parameter(s) removed`,
        description: `Parameters removed: ${diff.queryParamsRemoved.join(', ')}`,
        stepId: step.id
      });
    }
  });

  // 2. Analyze client-side redirects
  const clientRedirects = state.clientRedirects || [];
  clientRedirects.forEach((cr, index) => {
    const num = index + 1;
    if (cr.mechanism === 'meta-refresh') {
      const delayText = cr.delay !== null ? ` (delay: ${cr.delay}s)` : '';
      issues.push({
        id: `meta-refresh-${num}`,
        severity: SEVERITY.WARNING,
        title: `Meta Refresh redirect detected${delayText}`,
        description: 'Meta Refresh tags are slower than HTTP redirects and are not recommended for permanent SEO canonicalization.'
      });
    } else {
      issues.push({
        id: `client-nav-${num}`,
        severity: SEVERITY.INFO,
        title: 'Client-side redirect detected',
        description: 'Browser navigated via client-side transition (webNavigation client_redirect).'
      });
    }
  });

  return issues;
}
