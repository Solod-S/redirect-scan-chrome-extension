/**
 * Redirect Scan - Status Code Rules
 */

import { SEVERITY } from '../shared/constants.js';

/**
 * Analyzes HTTP status codes in redirect chain and final response
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @returns {import('../shared/typedefs.js').SEOIssue[]}
 */
export function evaluateStatusRules(state) {
  const issues = [];
  if (!state) return issues;

  const steps = state.steps || [];
  const finalResponse = state.finalResponse;

  let temporaryRedirectCount = 0;

  // Analyze redirect steps
  steps.forEach((step, index) => {
    const code = step.statusCode;
    const stepNum = index + 1;

    if (code === 301) {
      issues.push({
        id: `status-301-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: 301 Moved Permanently`,
        description: 'Permanent redirect passes link equity and indicates a permanent move.',
        stepId: step.id
      });
    } else if (code === 308) {
      issues.push({
        id: `status-308-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: 308 Permanent Redirect`,
        description: 'Permanent redirect preserving HTTP request method.',
        stepId: step.id
      });
    } else if (code === 302) {
      temporaryRedirectCount++;
      issues.push({
        id: `status-302-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: 302 Found (Temporary Redirect)`,
        description: 'Temporary redirect. Search engines may not pass full link equity.',
        stepId: step.id
      });
    } else if (code === 307) {
      temporaryRedirectCount++;
      issues.push({
        id: `status-307-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: 307 Temporary Redirect`,
        description: 'Temporary redirect preserving HTTP request method.',
        stepId: step.id
      });
    } else if (code === 303) {
      issues.push({
        id: `status-303-step-${stepNum}`,
        severity: SEVERITY.INFO,
        title: `Step ${stepNum}: 303 See Other`,
        description: 'Redirect instructing client to retrieve target via GET.',
        stepId: step.id
      });
    }
  });

  if (temporaryRedirectCount > 1) {
    issues.push({
      id: 'multiple-temp-redirects',
      severity: SEVERITY.WARNING,
      title: 'Multiple temporary redirects in chain',
      description: `${temporaryRedirectCount} temporary redirects (302/307) found. Consider using permanent 301/308 redirects for permanent moves.`
    });
  }

  // Analyze final response
  if (finalResponse) {
    const code = finalResponse.statusCode;

    if (code >= 200 && code < 300) {
      issues.push({
        id: 'final-status-2xx',
        severity: SEVERITY.PASSED,
        title: `Final status is ${code} ${finalResponse.statusLine ? `(${finalResponse.statusLine})` : 'OK'}`,
        description: 'Destination page loaded successfully.'
      });
    } else if (code === 404) {
      issues.push({
        id: 'final-status-404',
        severity: SEVERITY.ERROR,
        title: 'Final destination is 404 Not Found',
        description: 'The requested resource could not be found on the server.'
      });
    } else if (code === 410) {
      issues.push({
        id: 'final-status-410',
        severity: SEVERITY.WARNING,
        title: 'Final destination is 410 Gone',
        description: 'The target resource has been intentionally and permanently removed.'
      });
    } else if (code === 429) {
      issues.push({
        id: 'final-status-429',
        severity: SEVERITY.WARNING,
        title: 'Rate limited: 429 Too Many Requests',
        description: 'The server responded with rate limiting.'
      });
    } else if (code >= 400 && code < 500) {
      issues.push({
        id: `final-status-4xx-${code}`,
        severity: SEVERITY.ERROR,
        title: `Client Error: HTTP ${code}`,
        description: `The destination returned a client error (${code}).`
      });
    } else if (code >= 500 && code < 600) {
      issues.push({
        id: `final-status-5xx-${code}`,
        severity: SEVERITY.ERROR,
        title: `Server Error: HTTP ${code}`,
        description: `The destination returned an internal server error (${code}).`
      });
    }
  }

  return issues;
}
