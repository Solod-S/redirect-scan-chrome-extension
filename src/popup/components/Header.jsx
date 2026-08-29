import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, RefreshCw, Copy, ChevronDown, FileText, List } from 'lucide-react';
import { Logo } from './Logo.jsx';
import { getDomain } from '../../shared/urlUtils.js';

export function Header({
  state,
  activeTab,
  onReloadAndTrace,
  onRefreshData,
  onCopyChain,
  onCopyReport
}) {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayUrl = state?.currentUrl || activeTab?.url || '';
  const domain = getDomain(displayUrl);

  const totalHops = (state?.steps?.length || 0) + (state?.clientRedirects?.length || 0);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setCopyMenuOpen(false);
      }
    }
    if (copyMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [copyMenuOpen]);

  return (
    <header className="app-header">
      <div className="header-left">
        <Logo size={24} />
        <div className="brand-meta">
          <div className="brand-row">
            <span className="brand-name">Redirect Scan</span>
            {totalHops > 0 && (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--status-3xx)' }}>
                ({totalHops} {totalHops === 1 ? 'hop' : 'hops'})
              </span>
            )}
          </div>
          <span className="brand-domain" title={displayUrl}>
            {domain || 'No active page'}
          </span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="btn btn-sm"
          onClick={onReloadAndTrace}
          title="Bypass cache & trace navigation from beginning"
        >
          <RotateCw size={12} />
          Trace
        </button>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="btn btn-sm"
            onClick={() => setCopyMenuOpen(!copyMenuOpen)}
            title="Export Options"
          >
            <Copy size={12} />
            Copy
            <ChevronDown size={10} />
          </button>

          {copyMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 4,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                boxShadow: 'var(--shadow-popover)',
                padding: '3px 0',
                zIndex: 50,
                minWidth: 150
              }}
            >
              <button
                className="btn btn-sm btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '5px 10px', fontSize: 11 }}
                onClick={() => {
                  onCopyChain();
                  setCopyMenuOpen(false);
                }}
              >
                <List size={12} />
                Copy Chain
              </button>
              <button
                className="btn btn-sm btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '5px 10px', fontSize: 11 }}
                onClick={() => {
                  onCopyReport();
                  setCopyMenuOpen(false);
                }}
              >
                <FileText size={12} />
                Copy Full Report
              </button>
            </div>
          )}
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={onRefreshData}
          title="Refresh Data"
        >
          <RefreshCw size={12} />
        </button>
      </div>
    </header>
  );
}
