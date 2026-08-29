/**
 * Redirect Scan - Redirect Rules Engine
 * Evaluates SEO, technical, and security checks across full navigation state.
 */

import { SEVERITY } from '../shared/constants.js';
import { evaluateStatusRules } from './statusRules.js';
import { evaluateChainRules } from './chainRules.js';
import { evaluateProtocolRules } from './protocolRules.js';
import { evaluateUrlRules } from './urlRules.js';

const SEVERITY_WEIGHT = {
  [SEVERITY.ERROR]: 1,
  [SEVERITY.WARNING]: 2,
  [SEVERITY.INFO]: 3,
  [SEVERITY.PASSED]: 4
};

/**
 * Runs all rules on the given navigation state
 * @param {import('../shared/typedefs.js').TabNavigationState|null} state
 * @returns {import('../shared/typedefs.js').SEOIssue[]}
 */
export function evaluateRules(state) {
  if (!state) return [];

  const allIssues = [
    ...evaluateChainRules(state),
    ...evaluateStatusRules(state),
    ...evaluateProtocolRules(state),
    ...evaluateUrlRules(state)
  ];

  // Sort by severity (errors first, then warnings, then info, then passed)
  return allIssues.sort((a, b) => {
    const weightA = SEVERITY_WEIGHT[a.severity] || 99;
    const weightB = SEVERITY_WEIGHT[b.severity] || 99;
    return weightA - weightB;
  });
}
