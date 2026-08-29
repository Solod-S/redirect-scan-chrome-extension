import { describe, it, expect } from 'vitest';
import { evaluateRules } from '../src/rules/redirectRulesEngine.js';
import { createInitialNavigationState, appendRedirectStep, setFinalResponse } from '../src/tracking/chainBuilder.js';
import { SEVERITY } from '../src/shared/constants.js';

describe('redirectRulesEngine', () => {
  it('detects long redirect chains (>= 3 redirects)', () => {
    let state = createInitialNavigationState(1, 'http://a.com');
    state = appendRedirectStep(state, { url: 'http://a.com', redirectUrl: 'http://b.com', statusCode: 301 });
    state = appendRedirectStep(state, { url: 'http://b.com', redirectUrl: 'http://c.com', statusCode: 301 });
    state = appendRedirectStep(state, { url: 'http://c.com', redirectUrl: 'http://d.com', statusCode: 301 });
    state = setFinalResponse(state, { url: 'http://d.com', statusCode: 200 });

    const issues = evaluateRules(state);
    const longChainIssue = issues.find(i => i.id === 'long-redirect-chain');
    expect(longChainIssue).toBeDefined();
    expect(longChainIssue.severity).toBe(SEVERITY.WARNING);
  });

  it('detects redirect loops (A -> B -> A)', () => {
    let state = createInitialNavigationState(1, 'http://a.com');
    state = appendRedirectStep(state, { url: 'http://a.com', redirectUrl: 'http://b.com', statusCode: 302 });
    state = appendRedirectStep(state, { url: 'http://b.com', redirectUrl: 'http://a.com', statusCode: 302 });

    const issues = evaluateRules(state);
    const loopIssue = issues.find(i => i.id.startsWith('redirect-loop'));
    expect(loopIssue).toBeDefined();
    expect(loopIssue.severity).toBe(SEVERITY.ERROR);
  });

  it('flags 404 and 500 final responses as errors', () => {
    let state404 = createInitialNavigationState(1, 'https://example.com/missing');
    state404 = setFinalResponse(state404, { url: 'https://example.com/missing', statusCode: 404 });

    const issues404 = evaluateRules(state404);
    expect(issues404.some(i => i.severity === SEVERITY.ERROR && i.title.includes('404'))).toBe(true);

    let state500 = createInitialNavigationState(1, 'https://example.com/crash');
    state500 = setFinalResponse(state500, { url: 'https://example.com/crash', statusCode: 500 });

    const issues500 = evaluateRules(state500);
    expect(issues500.some(i => i.severity === SEVERITY.ERROR && i.title.includes('500'))).toBe(true);
  });

  it('marks HTTP -> HTTPS as passed and HTTPS -> HTTP as warning', () => {
    // HTTP -> HTTPS
    let stateUpgrade = createInitialNavigationState(1, 'http://example.com');
    stateUpgrade = appendRedirectStep(stateUpgrade, {
      url: 'http://example.com',
      redirectUrl: 'https://example.com',
      statusCode: 301
    });
    stateUpgrade = setFinalResponse(stateUpgrade, { url: 'https://example.com', statusCode: 200 });

    const issuesUpgrade = evaluateRules(stateUpgrade);
    expect(issuesUpgrade.some(i => i.id.startsWith('protocol-upgrade') && i.severity === SEVERITY.PASSED)).toBe(true);

    // HTTPS -> HTTP
    let stateDowngrade = createInitialNavigationState(1, 'https://example.com');
    stateDowngrade = appendRedirectStep(stateDowngrade, {
      url: 'https://example.com',
      redirectUrl: 'http://example.com',
      statusCode: 302
    });
    stateDowngrade = setFinalResponse(stateDowngrade, { url: 'http://example.com', statusCode: 200 });

    const issuesDowngrade = evaluateRules(stateDowngrade);
    expect(issuesDowngrade.some(i => i.id.startsWith('protocol-downgrade') && i.severity === SEVERITY.WARNING)).toBe(true);
  });

  it('flags query parameter loss on redirect', () => {
    let state = createInitialNavigationState(1, 'https://example.com/product?utm_source=promo&id=123');
    state = appendRedirectStep(state, {
      url: 'https://example.com/product?utm_source=promo&id=123',
      redirectUrl: 'https://example.com/product',
      statusCode: 301
    });
    state = setFinalResponse(state, { url: 'https://example.com/product', statusCode: 200 });

    const issues = evaluateRules(state);
    const queryIssue = issues.find(i => i.id.startsWith('query-dropped'));
    expect(queryIssue).toBeDefined();
    expect(queryIssue.severity).toBe(SEVERITY.WARNING);
  });
});
