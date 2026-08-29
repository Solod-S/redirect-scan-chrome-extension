import { describe, it, expect, beforeEach } from 'vitest';
import { BadgeController } from '../src/background/badgeController.js';
import { BADGE_COLORS } from '../src/shared/constants.js';
import { createInitialNavigationState, appendRedirectStep, setFinalResponse, appendClientRedirect, recordNetworkError } from '../src/tracking/chainBuilder.js';

describe('BadgeController', () => {
  let badgeCtrl;

  beforeEach(() => {
    badgeCtrl = new BadgeController();
    chrome.action.setBadgeText.mockClear();
    chrome.action.setBadgeBackgroundColor.mockClear();
    chrome.action.setTitle.mockClear();
  });

  it('sets empty badge on direct 200 OK navigation', async () => {
    let state = createInitialNavigationState(1, 'https://example.com');
    state = setFinalResponse(state, { url: 'https://example.com', statusCode: 200 });

    await badgeCtrl.updateBadge(1, state);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: '' });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({
      tabId: 1,
      title: 'Redirect Scan: 200 OK'
    });
  });

  it('sets redirect badge on 301 redirect chain', async () => {
    let state = createInitialNavigationState(1, 'http://example.com');
    state = appendRedirectStep(state, { url: 'http://example.com', redirectUrl: 'https://example.com', statusCode: 301 });
    state = setFinalResponse(state, { url: 'https://example.com', statusCode: 200 });

    await badgeCtrl.updateBadge(1, state);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: '301' });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ tabId: 1, color: BADGE_COLORS.REDIRECT_3XX });
    expect(chrome.action.setTitle).toHaveBeenCalledWith({
      tabId: 1,
      title: 'Redirect Scan: 1 redirect → 200'
    });
  });

  it('sets red 404 badge on 404 Not Found', async () => {
    let state = createInitialNavigationState(1, 'https://example.com/notfound');
    state = setFinalResponse(state, { url: 'https://example.com/notfound', statusCode: 404 });

    await badgeCtrl.updateBadge(1, state);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: '404' });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ tabId: 1, color: BADGE_COLORS.CLIENT_ERROR_4XX });
  });

  it('sets purple CR badge for client-side redirects only', async () => {
    let state = createInitialNavigationState(1, 'https://example.com/landing');
    state = appendClientRedirect(state, {
      mechanism: 'meta-refresh',
      fromUrl: 'https://example.com/landing',
      toUrl: 'https://example.com/home',
      delay: 0
    });
    state = setFinalResponse(state, { url: 'https://example.com/home', statusCode: 200 });

    await badgeCtrl.updateBadge(1, state);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: 'CR' });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ tabId: 1, color: BADGE_COLORS.CLIENT_REDIRECT });
  });

  it('sets ERR badge on network error', async () => {
    let state = createInitialNavigationState(1, 'https://broken.com');
    state = recordNetworkError(state, { error: 'net::ERR_CONNECTION_REFUSED', url: 'https://broken.com' });

    await badgeCtrl.updateBadge(1, state);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: 'ERR' });
  });
});
