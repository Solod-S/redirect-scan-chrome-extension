import { describe, it, expect } from 'vitest';
import { compareRedirectUrls, getDomain, formatUrlDisplay } from '../src/shared/urlUtils.js';

describe('urlUtils', () => {
  it('detects HTTP to HTTPS protocol upgrade', () => {
    const diff = compareRedirectUrls('http://example.com', 'https://example.com');
    expect(diff.protocolChanged).toBe(true);
    expect(diff.isHttpToHttps).toBe(true);
    expect(diff.isHttpsToHttp).toBe(false);
  });

  it('detects HTTPS to HTTP protocol downgrade', () => {
    const diff = compareRedirectUrls('https://example.com', 'http://example.com');
    expect(diff.protocolChanged).toBe(true);
    expect(diff.isHttpsToHttp).toBe(true);
  });

  it('detects cross-domain redirects', () => {
    const diff = compareRedirectUrls('https://example.com', 'https://example.org');
    expect(diff.hostChanged).toBe(true);
    expect(diff.isCrossDomain).toBe(true);
  });

  it('detects www canonical changes', () => {
    const diff = compareRedirectUrls('https://example.com', 'https://www.example.com');
    expect(diff.hostChanged).toBe(true);
    expect(diff.wwwChanged).toBe(true);
    expect(diff.isCrossDomain).toBe(false);
  });

  it('detects trailing slash normalization', () => {
    const diff = compareRedirectUrls('https://example.com/docs', 'https://example.com/docs/');
    expect(diff.pathChanged).toBe(true);
    expect(diff.trailingSlashChanged).toBe(true);
  });

  it('detects dropped and changed query parameters', () => {
    const diff = compareRedirectUrls(
      'https://example.com/page?utm_source=fb&gclid=123',
      'https://example.com/page?gclid=123'
    );
    expect(diff.queryChanged).toBe(true);
    expect(diff.queryDropped).toBe(false);
    expect(diff.queryParamsRemoved).toEqual(['utm_source']);

    const droppedDiff = compareRedirectUrls('https://example.com/page?test=1', 'https://example.com/page');
    expect(droppedDiff.queryDropped).toBe(true);
  });

  it('extracts domain correctly', () => {
    expect(getDomain('https://sub.domain.com/path?q=1')).toBe('sub.domain.com');
  });

  it('formats long URLs cleanly', () => {
    const shortUrl = 'https://example.com/a';
    expect(formatUrlDisplay(shortUrl, 50)).toBe(shortUrl);

    const longUrl = 'https://example.com/' + 'a'.repeat(200);
    const formatted = formatUrlDisplay(longUrl, 40);
    expect(formatted.length).toBeLessThanOrEqual(40);
    expect(formatted.endsWith('...')).toBe(true);
  });
});
