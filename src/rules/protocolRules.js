/**
 * Redirect Scan - Protocol & Security Rules
 */

import { SEVERITY } from '../shared/constants.js';
import { compareRedirectUrls } from '../shared/urlUtils.js';

/**
 * Checks for protocol upgrades (HTTP -> HTTPS) and downgrades (HTTPS -> HTTP)
 * @param {import('../shared/typedefs.js').TabNavigationState} state
 * @returns {import('../shared/typedefs.js').SEOIssue[]}
 */
export function evaluateProtocolRules(state) {
  const issues = [];
  if (!state || !state.steps) return issues;

  state.steps.forEach((step, index) => {
    const diff = compareRedirectUrls(step.url, step.redirectUrl);
    const stepNum = index + 1;

    if (diff.isHttpToHttps) {
      issues.push({
        id: `protocol-upgrade-step-${stepNum}`,
        severity: SEVERITY.PASSED,
        title: `Step ${stepNum}: HTTP upgraded to HTTPS`,
        description: 'Secure connection established via HTTPS redirect.',
        stepId: step.id
      });
    } else if (diff.isHttpsToHttp) {
      issues.push({
        id: `protocol-downgrade-step-${stepNum}`,
        severity: SEVERITY.WARNING,
        title: `Step ${stepNum}: HTTPS downgraded to insecure HTTP`,
        description: 'Redirect sends user from an encrypted HTTPS connection to an unencrypted HTTP URL.',
        stepId: step.id
      });
    }
  });

  return issues;
}
