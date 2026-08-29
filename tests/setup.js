import { vi } from 'vitest';

// Setup minimal Chrome API mocks for testing
const mockSessionStorage = new Map();

globalThis.chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn()
    },
    lastError: null
  },
  storage: {
    session: {
      get: vi.fn(async (key) => {
        if (typeof key === 'string') {
          return mockSessionStorage.has(key) ? { [key]: mockSessionStorage.get(key) } : {};
        }
        return {};
      }),
      set: vi.fn(async (items) => {
        for (const [k, v] of Object.entries(items)) {
          mockSessionStorage.set(k, v);
        }
      }),
      remove: vi.fn(async (key) => {
        if (typeof key === 'string') {
          mockSessionStorage.delete(key);
        }
      }),
      clear: vi.fn(async () => {
        mockSessionStorage.clear();
      })
    }
  },
  tabs: {
    query: vi.fn(),
    reload: vi.fn(),
    onRemoved: { addListener: vi.fn() },
    onReplaced: { addListener: vi.fn() },
    onActivated: { addListener: vi.fn() }
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
    setTitle: vi.fn()
  },
  webRequest: {
    onBeforeRequest: { addListener: vi.fn() },
    onBeforeRedirect: { addListener: vi.fn() },
    onResponseStarted: { addListener: vi.fn() },
    onCompleted: { addListener: vi.fn() },
    onErrorOccurred: { addListener: vi.fn() }
  },
  webNavigation: {
    onCommitted: { addListener: vi.fn() },
    onHistoryStateUpdated: { addListener: vi.fn() }
  }
};
