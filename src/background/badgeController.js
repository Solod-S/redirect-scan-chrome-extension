/**
 * Redirect Scan - Badge Controller
 * Manages extension action badge text, background color, and tooltip title.
 */

import { BADGE_COLORS } from '../shared/constants.js';
import { getStatusLabel, getStatusBadgeColor } from '../shared/statusCodes.js';

export class BadgeController {
  /**
   * Updates badge for a given tab state
   * @param {number} tabId
   * @param {import('../shared/typedefs.js').TabNavigationState|null} state
   */
  async updateBadge(tabId, state) {
    if (!tabId || tabId < 0 || typeof chrome === 'undefined' || !chrome.action) {
      return;
    }

    if (!state) {
      await this.clearBadge(tabId);
      return;
    }

    // 1. Check network errors
    if (state.errors && state.errors.length > 0) {
      const lastError = state.errors[state.errors.length - 1];
      await chrome.action.setBadgeText({ tabId, text: 'ERR' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.NETWORK_ERROR });
      await chrome.action.setTitle({
        tabId,
        title: `Redirect Scan: Error (${lastError.error || 'Network error'})`
      });
      return;
    }

    const redirectCount = state.steps ? state.steps.length : 0;
    const clientRedirectCount = state.clientRedirects ? state.clientRedirects.length : 0;
    const finalStatus = state.finalResponse ? state.finalResponse.statusCode : null;

    // 2. HTTP redirects in chain (3xx)
    if (redirectCount > 0) {
      const firstStep = state.steps[0];
      const badgeText = String(firstStep.statusCode || 301);
      const color = getStatusBadgeColor(firstStep.statusCode);

      const totalHops = redirectCount + clientRedirectCount;
      const finalLabel = finalStatus ? `${finalStatus}` : 'In progress';
      const hopWord = totalHops === 1 ? 'redirect' : 'redirects';

      await chrome.action.setBadgeText({ tabId, text: badgeText });
      await chrome.action.setBadgeBackgroundColor({ tabId, color });
      await chrome.action.setTitle({
        tabId,
        title: `Redirect Scan: ${totalHops} ${hopWord} → ${finalLabel}`
      });
      return;
    }

    // 3. Client redirects only (no HTTP 3xx)
    if (clientRedirectCount > 0) {
      const finalLabel = finalStatus ? ` → ${finalStatus}` : '';
      await chrome.action.setBadgeText({ tabId, text: 'CR' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.CLIENT_REDIRECT });
      await chrome.action.setTitle({
        tabId,
        title: `Redirect Scan: Client redirect${finalLabel}`
      });
      return;
    }

    // 4. Direct 4xx Client Error
    if (finalStatus && finalStatus >= 400 && finalStatus < 500) {
      await chrome.action.setBadgeText({ tabId, text: String(finalStatus) });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.CLIENT_ERROR_4XX });
      await chrome.action.setTitle({
        tabId,
        title: `Redirect Scan: ${finalStatus} ${getStatusLabel(finalStatus)}`
      });
      return;
    }

    // 5. Direct 5xx Server Error
    if (finalStatus && finalStatus >= 500 && finalStatus < 600) {
      await chrome.action.setBadgeText({ tabId, text: String(finalStatus) });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.SERVER_ERROR_5XX });
      await chrome.action.setTitle({
        tabId,
        title: `Redirect Scan: ${finalStatus} ${getStatusLabel(finalStatus)}`
      });
      return;
    }

    // 6. Clean 200 / 2xx with no redirects
    if (finalStatus && finalStatus >= 200 && finalStatus < 300) {
      await chrome.action.setBadgeText({ tabId, text: '' });
      await chrome.action.setTitle({
        tabId,
        title: `Redirect Scan: ${finalStatus} ${getStatusLabel(finalStatus)}`
      });
      return;
    }

    // Default: clear badge
    await this.clearBadge(tabId);
  }

  /**
   * Clears badge for tab
   * @param {number} tabId
   */
  async clearBadge(tabId) {
    if (typeof chrome !== 'undefined' && chrome.action) {
      try {
        await chrome.action.setBadgeText({ tabId, text: '' });
        await chrome.action.setTitle({ tabId, title: 'Redirect Scan' });
      } catch {
        // Tab may have been closed
      }
    }
  }
}

export const badgeController = new BadgeController();
