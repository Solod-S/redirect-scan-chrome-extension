import { describe, it, expect, beforeEach } from 'vitest';
import { TabRedirectStore } from '../src/storage/tabRedirectStore.js';
import { createInitialNavigationState } from '../src/tracking/chainBuilder.js';

describe('TabRedirectStore', () => {
  let store;

  beforeEach(() => {
    store = new TabRedirectStore();
  });

  it('isolates state between different tab IDs', async () => {
    const stateA = createInitialNavigationState(101, 'https://site-a.com');
    const stateB = createInitialNavigationState(102, 'https://site-b.com');

    await store.set(101, stateA);
    await store.set(102, stateB);

    const retrievedA = await store.get(101);
    const retrievedB = await store.get(102);

    expect(retrievedA.initialUrl).toBe('https://site-a.com');
    expect(retrievedB.initialUrl).toBe('https://site-b.com');
  });

  it('clears state on tab close / clear', async () => {
    const state = createInitialNavigationState(101, 'https://site-a.com');
    await store.set(101, state);

    await store.remove(101);
    const retrieved = await store.get(101);
    expect(retrieved).toBeNull();
  });

  it('updates state atomically', async () => {
    const state = createInitialNavigationState(101, 'https://site-a.com');
    await store.set(101, state);

    await store.update(101, (current) => {
      current.currentUrl = 'https://site-a.com/updated';
      return current;
    });

    const updated = await store.get(101);
    expect(updated.currentUrl).toBe('https://site-a.com/updated');
  });
});
