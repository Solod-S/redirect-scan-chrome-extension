/**
 * Redirect Scan - Chain & Loop Rules
 */

import { SEVERITY, THRESHOLDS } from '../shared/constants.js';

/**
 * Checks for long redirect chains and redirect loops
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @returns {import('../shared/typedefs.js').SEOIssue[]}
 */
export function evaluateChainRules(state) {
  const issues = [];
  if (!state) return issues;

  const steps = state.steps || [];
  const clientRedirects = state.clientRedirects || [];
  const errors = state.errors || [];
  const totalHops = steps.length + clientRedirects.length;

  // 1. Long chain check
  if (totalHops >= THRESHOLDS.LONG_REDIRECT_CHAIN) {
    issues.push({
      id: 'long-redirect-chain',
      severity: SEVERITY.WARNING,
      title: `Long redirect chain: ${totalHops} redirects`,
      description: `Chains with ${THRESHOLDS.LONG_REDIRECT_CHAIN} or more redirects degrade user page load speed, waste crawl budget, and can reduce SEO authority.`
    });
  }

  // 2. Browser redirect loop error (ERR_TOO_MANY_REDIRECTS)
  const loopError = errors.find(e =>
    e.error && (
      e.error.includes('ERR_TOO_MANY_REDIRECTS') ||
      e.error.includes('TOO_MANY_REDIRECTS')
    )
  );

  if (loopError) {
    issues.push({
      id: 'redirect-loop-browser-error',
      severity: SEVERITY.ERROR,
      title: 'Redirect loop detected',
      description: 'Browser stopped navigation due to excessive redirects (ERR_TOO_MANY_REDIRECTS).'
    });
    return issues;
  }

  // 3. Repeating URL loop detection (A -> B -> A)
  const seenUrls = new Set();
  if (state.initialUrl) {
    seenUrls.add(normalizeUrlForLoopCheck(state.initialUrl));
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const targetNorm = normalizeUrlForLoopCheck(step.redirectUrl);

    if (seenUrls.has(targetNorm)) {
      issues.push({
        id: `redirect-loop-step-${i + 1}`,
        severity: SEVERITY.ERROR,
        title: 'Redirect loop / duplicate target detected',
        description: `Step ${i + 1} redirects to a URL already encountered in this chain: ${step.redirectUrl}`,
        stepId: step.id
      });
      break;
    }
    seenUrls.add(targetNorm);
    seenUrls.add(normalizeUrlForLoopCheck(step.url));
  }

  return issues;
}

function normalizeUrlForLoopCheck(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/\/+$/, '')}${u.search}`.toLowerCase();
  } catch {
    return url.replace(/\/+$/, '').toLowerCase();
  }
}
