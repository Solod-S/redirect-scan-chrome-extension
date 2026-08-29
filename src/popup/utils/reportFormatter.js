/**
 * Redirect Scan - Report Formatter
 * Generates human-readable text for clipboard export.
 */

import { getStatusLabel } from '../../shared/statusCodes.js';
import { getHeader } from '../../shared/headerUtils.js';
import { evaluateRules } from '../../rules/redirectRulesEngine.js';

/**
 * Formats a clean redirect chain summary
 * @param {import('../../shared/typedefs.js').TabNavigationState} state
 * @returns {string}
 */
export function formatRedirectChainText(state) {
  if (!state) return 'No redirect data available.';

  const lines = ['Redirect Scan — Redirect Chain', ''];
  const steps = state.steps || [];
  const clientRedirects = state.clientRedirects || [];
  let stepIndex = 1;

  // HTTP Redirect steps
  for (const step of steps) {
    const label = getStatusLabel(step.statusCode);
    lines.push(`${stepIndex}. ${step.statusCode} ${label}`);
    lines.push(step.url);
    lines.push(`→ ${step.redirectUrl}`);
    lines.push('');
    stepIndex++;
  }

  // Client Redirects
  for (const cr of clientRedirects) {
    const mech = cr.mechanism === 'meta-refresh' ? 'Meta Refresh' : 'Client-side redirect';
    const delayInfo = cr.delay !== null ? ` (${cr.delay}s)` : '';
    lines.push(`${stepIndex}. [${mech}${delayInfo}]`);
    lines.push(cr.fromUrl);
    lines.push(`→ ${cr.toUrl}`);
    lines.push('');
    stepIndex++;
  }

  // Final Response or Error
  if (state.finalResponse) {
    const resp = state.finalResponse;
    const label = getStatusLabel(resp.statusCode);
    lines.push(`${stepIndex}. ${resp.statusCode} ${label}`);
    lines.push(resp.url);
  } else if (state.errors && state.errors.length > 0) {
    const err = state.errors[state.errors.length - 1];
    lines.push(`${stepIndex}. Error: ${err.error || 'Network error'}`);
    if (err.url) lines.push(err.url);
  }

  return lines.join('\n');
}

/**
 * Formats a comprehensive technical audit report
 * @param {import('../../shared/typedefs.js').TabNavigationState} state
 * @returns {string}
 */
export function formatFullReportText(state) {
  if (!state) return 'No redirect data available.';

  const lines = [
    '========================================',
    'Redirect Scan — Full Technical Report',
    '========================================',
    `Generated: ${new Date().toISOString()}`,
    `Initial URL: ${state.initialUrl || 'N/A'}`,
    `Final URL:   ${state.currentUrl || (state.finalResponse ? state.finalResponse.url : 'N/A')}`,
    `Total HTTP Redirects: ${state.steps ? state.steps.length : 0}`,
    `Client Redirects:     ${state.clientRedirects ? state.clientRedirects.length : 0}`,
    `Final Status:         ${state.finalResponse ? `${state.finalResponse.statusCode} ${getStatusLabel(state.finalResponse.statusCode)}` : 'Incomplete'}`,
    '----------------------------------------',
    'REDIRECT PATH DETAILS:',
    '----------------------------------------'
  ];

  const steps = state.steps || [];
  steps.forEach((step, idx) => {
    const label = getStatusLabel(step.statusCode);
    lines.push(`Step ${idx + 1}: ${step.statusCode} ${label}`);
    lines.push(`  URL:         ${step.url}`);
    lines.push(`  Destination: ${step.redirectUrl}`);
    if (step.ip) lines.push(`  Server IP:   ${step.ip}`);
    const server = getHeader(step.responseHeaders, 'server');
    if (server) lines.push(`  Server:      ${server}`);
    const cacheControl = getHeader(step.responseHeaders, 'cache-control');
    if (cacheControl) lines.push(`  Cache:       ${cacheControl}`);
    if (step.fromCache) lines.push(`  From Cache:  Yes`);
    lines.push('');
  });

  const clientRedirects = state.clientRedirects || [];
  clientRedirects.forEach((cr, idx) => {
    lines.push(`Client Redirect ${idx + 1}: [${cr.mechanism}]`);
    lines.push(`  From:     ${cr.fromUrl}`);
    lines.push(`  To:       ${cr.toUrl}`);
    if (cr.delay !== null) lines.push(`  Delay:    ${cr.delay}s`);
    lines.push(`  Evidence: ${cr.evidence}`);
    lines.push('');
  });

  if (state.finalResponse) {
    const resp = state.finalResponse;
    const label = getStatusLabel(resp.statusCode);
    lines.push('FINAL DESTINATION RESPONSE:');
    lines.push(`  Status:    ${resp.statusCode} ${label} (${resp.statusLine || ''})`);
    lines.push(`  URL:       ${resp.url}`);
    if (resp.ip) lines.push(`  Server IP: ${resp.ip}`);
    const server = getHeader(resp.responseHeaders, 'server');
    if (server) lines.push(`  Server:    ${server}`);
    const contentType = getHeader(resp.responseHeaders, 'content-type');
    if (contentType) lines.push(`  Type:      ${contentType}`);
    const cacheControl = getHeader(resp.responseHeaders, 'cache-control');
    if (cacheControl) lines.push(`  Cache:     ${cacheControl}`);
    const xRobots = getHeader(resp.responseHeaders, 'x-robots-tag');
    if (xRobots) lines.push(`  Robots:    ${xRobots}`);
    lines.push('');
  }

  // Issues and rules
  const issues = evaluateRules(state);
  if (issues.length > 0) {
    lines.push('----------------------------------------');
    lines.push('TECHNICAL & SEO CHECKS:');
    lines.push('----------------------------------------');
    issues.forEach(issue => {
      lines.push(`[${issue.severity.toUpperCase()}] ${issue.title}`);
      lines.push(`  ${issue.description}`);
    });
    lines.push('');
  }

  lines.push('========================================');
  lines.push('Processed locally by Redirect Scan Extension');

  return lines.join('\n');
}
