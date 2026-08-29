/**
 * Redirect Scan - Background Service Worker
 * Top-level registration for Manifest V3 extension.
 */

import { registerWebRequestListeners } from './registerWebRequest.js';
import { registerWebNavigationListeners } from './registerWebNavigation.js';
import { registerTabListeners } from './registerTabs.js';
import { registerRuntimeMessages } from './registerMessages.js';

// Top-level synchronous registration of event listeners (MV3 requirement)
registerWebRequestListeners();
registerWebNavigationListeners();
registerTabListeners();
registerRuntimeMessages();

// Service worker lifecycle log
console.log('[Redirect Scan] Service Worker initialized');
