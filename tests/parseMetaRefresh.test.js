import { describe, it, expect } from 'vitest';
import { parseMetaRefreshContent, extractMetaRefresh } from '../src/content/parseMetaRefresh.js';

describe('parseMetaRefresh', () => {
  it('parses standard 0; url=... content', () => {
    const res = parseMetaRefreshContent('0; url=https://example.com/target', 'https://example.com/source');
    expect(res).toEqual({
      delay: 0,
      targetUrl: 'https://example.com/target'
    });
  });

  it('parses delay with quotes and uppercase URL', () => {
    const res = parseMetaRefreshContent("5; URL='https://example.com/new'", 'https://example.com');
    expect(res).toEqual({
      delay: 5,
      targetUrl: 'https://example.com/new'
    });
  });

  it('parses relative URLs correctly', () => {
    const res = parseMetaRefreshContent('0; url=/new-path', 'https://example.com/old-path');
    expect(res).toEqual({
      delay: 0,
      targetUrl: 'https://example.com/new-path'
    });
  });

  it('handles spaces without url prefix as reload', () => {
    const res = parseMetaRefreshContent('10', 'https://example.com');
    expect(res).toEqual({
      delay: 10,
      targetUrl: 'https://example.com'
    });
  });

  it('returns null for invalid content', () => {
    expect(parseMetaRefreshContent('')).toBeNull();
    expect(parseMetaRefreshContent(null)).toBeNull();
    expect(parseMetaRefreshContent('invalid')).toBeNull();
  });

  it('extractMetaRefresh checks http-equiv case-insensitively', () => {
    const el = {
      getAttribute: (name) => {
        if (name === 'http-equiv') return 'REFRESH';
        if (name === 'content') return '0; URL=https://target.com/page';
        return null;
      }
    };
    const res = extractMetaRefresh(el, 'https://source.com');
    expect(res).toEqual({
      delay: 0,
      targetUrl: 'https://target.com/page'
    });
  });
});
