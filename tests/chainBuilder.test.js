import { describe, it, expect } from 'vitest';
import {
  createInitialNavigationState,
  appendRedirectStep,
  setFinalResponse,
  appendClientRedirect,
  recordNetworkError
} from '../src/tracking/chainBuilder.js';

describe('chainBuilder', () => {
  it('creates initial navigation state', () => {
    const state = createInitialNavigationState(10, 'http://example.com');
    expect(state.tabId).toBe(10);
    expect(state.initialUrl).toBe('http://example.com');
    expect(state.steps).toEqual([]);
    expect(state.completed).toBe(false);
    expect(state.navigationId).toBeDefined();
  });

  it('builds 200 OK single step state', () => {
    let state = createInitialNavigationState(10, 'https://example.com');
    state = setFinalResponse(state, {
      requestId: 'req-1',
      url: 'https://example.com',
      statusCode: 200,
      statusLine: 'HTTP/2 200',
      responseHeaders: [{ name: 'Content-Type', value: 'text/html' }],
      ip: '93.184.216.34',
      fromCache: false
    });

    expect(state.steps.length).toBe(0);
    expect(state.finalResponse).toBeDefined();
    expect(state.finalResponse.statusCode).toBe(200);
    expect(state.finalResponse.ip).toBe('93.184.216.34');
    expect(state.completed).toBe(true);
  });

  it('builds 301 -> 302 -> 200 multi-hop redirect chain', () => {
    let state = createInitialNavigationState(10, 'http://example.com');

    // Step 1: 301
    state = appendRedirectStep(state, {
      requestId: 'req-1',
      url: 'http://example.com',
      statusCode: 301,
      redirectUrl: 'https://example.com',
      responseHeaders: [{ name: 'Location', value: 'https://example.com' }]
    });

    // Step 2: 302
    state = appendRedirectStep(state, {
      requestId: 'req-1',
      url: 'https://example.com',
      statusCode: 302,
      redirectUrl: 'https://www.example.com',
      responseHeaders: [{ name: 'Location', value: 'https://www.example.com' }]
    });

    // Final: 200
    state = setFinalResponse(state, {
      requestId: 'req-1',
      url: 'https://www.example.com',
      statusCode: 200
    });

    expect(state.steps.length).toBe(2);
    expect(state.steps[0].statusCode).toBe(301);
    expect(state.steps[0].redirectUrl).toBe('https://example.com');
    expect(state.steps[1].statusCode).toBe(302);
    expect(state.steps[1].redirectUrl).toBe('https://www.example.com');
    expect(state.finalResponse.statusCode).toBe(200);
    expect(state.completed).toBe(true);
  });

  it('records client redirects (Meta Refresh)', () => {
    let state = createInitialNavigationState(10, 'https://example.com/landing');
    state = appendClientRedirect(state, {
      mechanism: 'meta-refresh',
      fromUrl: 'https://example.com/landing',
      toUrl: 'https://example.com/home',
      delay: 0,
      evidence: 'meta-tag'
    });

    expect(state.clientRedirects.length).toBe(1);
    expect(state.clientRedirects[0].mechanism).toBe('meta-refresh');
    expect(state.clientRedirects[0].delay).toBe(0);
  });

  it('records network errors', () => {
    let state = createInitialNavigationState(10, 'https://broken.example.com');
    state = recordNetworkError(state, {
      error: 'net::ERR_NAME_NOT_RESOLVED',
      url: 'https://broken.example.com'
    });

    expect(state.errors.length).toBe(1);
    expect(state.errors[0].error).toBe('net::ERR_NAME_NOT_RESOLVED');
    expect(state.completed).toBe(true);
  });
});
