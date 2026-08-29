import { describe, it, expect } from 'vitest';
import { getHeader, getAllHeaders, groupHeaders } from '../src/shared/headerUtils.js';
import { HEADER_GROUPS } from '../src/shared/constants.js';

describe('headerUtils', () => {
  const sampleHeaders = [
    { name: 'Location', value: 'https://example.com' },
    { name: 'Server', value: 'nginx/1.20' },
    { name: 'Cache-Control', value: 'public, max-age=3600' },
    { name: 'X-Robots-Tag', value: 'noindex' },
    { name: 'Strict-Transport-Security', value: 'max-age=31536000' },
    { name: 'Set-Cookie', value: 'sessionid=abc123secret' },
    { name: 'Vary', value: 'Accept-Encoding' },
    { name: 'Vary', value: 'User-Agent' }
  ];

  it('performs case-insensitive lookup', () => {
    expect(getHeader(sampleHeaders, 'location')).toBe('https://example.com');
    expect(getHeader(sampleHeaders, 'SERVER')).toBe('nginx/1.20');
    expect(getHeader(sampleHeaders, 'non-existent')).toBeNull();
  });

  it('preserves and finds duplicate headers', () => {
    const varyHeaders = getAllHeaders(sampleHeaders, 'Vary');
    expect(varyHeaders.length).toBe(2);
    expect(varyHeaders[0].value).toBe('Accept-Encoding');
    expect(varyHeaders[1].value).toBe('User-Agent');
  });

  it('groups headers correctly and hides sensitive Set-Cookie by default', () => {
    const groups = groupHeaders(sampleHeaders, { ip: '1.2.3.4', fromCache: true });

    expect(groups[HEADER_GROUPS.SEO].some(h => h.name.toLowerCase() === 'x-robots-tag')).toBe(true);
    expect(groups[HEADER_GROUPS.CACHING].some(h => h.name.toLowerCase() === 'cache-control')).toBe(true);
    expect(groups[HEADER_GROUPS.SECURITY].some(h => h.name.toLowerCase() === 'strict-transport-security')).toBe(true);
    expect(groups[HEADER_GROUPS.SERVER].some(h => h.name === 'Server IP' && h.value === '1.2.3.4')).toBe(true);

    // Set-Cookie must NOT be present in All Headers by default
    expect(groups[HEADER_GROUPS.ALL].some(h => h.name.toLowerCase() === 'set-cookie')).toBe(false);
  });

  it('includes sensitive Set-Cookie when includeSensitive is true', () => {
    const groups = groupHeaders(sampleHeaders, { includeSensitive: true });
    expect(groups[HEADER_GROUPS.ALL].some(h => h.name.toLowerCase() === 'set-cookie')).toBe(true);
  });
});
