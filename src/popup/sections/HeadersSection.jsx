import React, { useState } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import { groupHeaders } from '../../shared/headerUtils.js';
import { HEADER_GROUPS } from '../../shared/constants.js';
import { HeaderGroup } from '../components/HeaderGroup.jsx';

export function HeadersSection({ state, selectedStepIndex, onSelectStepIndex, onCopy, copiedText }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);

  if (!state) return null;

  const steps = state.steps || [];
  const finalResponse = state.finalResponse;

  const stepOptions = [];
  steps.forEach((step, idx) => {
    stepOptions.push({
      id: idx,
      label: `Step ${idx + 1} (${step.statusCode})`,
      headers: step.responseHeaders,
      ip: step.ip,
      fromCache: step.fromCache,
      url: step.url
    });
  });

  if (finalResponse) {
    stepOptions.push({
      id: 'final',
      label: `Final (${finalResponse.statusCode})`,
      headers: finalResponse.responseHeaders,
      ip: finalResponse.ip,
      fromCache: finalResponse.fromCache,
      url: finalResponse.url
    });
  }

  const currentTarget = stepOptions.find(o => o.id === selectedStepIndex) || stepOptions[stepOptions.length - 1];

  if (!currentTarget) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
        No headers captured for this navigation.
      </div>
    );
  }

  const grouped = groupHeaders(currentTarget.headers || [], {
    includeSensitive: showSensitive,
    ip: currentTarget.ip,
    fromCache: currentTarget.fromCache
  });

  let allHeadersList = grouped[HEADER_GROUPS.ALL] || [];
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    allHeadersList = allHeadersList.filter(
      h => h.name.toLowerCase().includes(term) || h.value.toLowerCase().includes(term)
    );
  }

  return (
    <div>
      {/* 1. Step Selector Pills */}
      {stepOptions.length > 1 && (
        <div className="headers-nav-row">
          {stepOptions.map(opt => (
            <button
              key={opt.id}
              className={`header-step-pill ${currentTarget.id === opt.id ? 'active' : ''}`}
              onClick={() => onSelectStepIndex(opt.id)}
            >
              <span>{opt.label}</span>
              <span style={{ fontSize: 9.5, opacity: 0.75, marginLeft: 4 }}>
                ({opt.headers?.length || 0})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 2. Step Search & Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 6 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 240 }}>
          <Search size={12} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Filter headers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 6px 4px 24px',
              fontSize: 11,
              border: '1px solid var(--border-light)',
              borderRadius: '5px',
              outline: 'none',
              background: 'var(--bg-surface)'
            }}
          />
        </div>

        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setShowSensitive(!showSensitive)}
          title="Toggle sensitive Set-Cookie visibility"
        >
          {showSensitive ? <EyeOff size={11} /> : <Eye size={11} />}
          {showSensitive ? 'Hide Cookie' : 'Show Set-Cookie'}
        </button>
      </div>

      {/* 3. Grouped Headers */}
      {!searchTerm && (
        <>
          <HeaderGroup
            title={HEADER_GROUPS.SEO}
            headers={grouped[HEADER_GROUPS.SEO]}
            onCopy={onCopy}
            copiedText={copiedText}
          />
          <HeaderGroup
            title={HEADER_GROUPS.CACHING}
            headers={grouped[HEADER_GROUPS.CACHING]}
            onCopy={onCopy}
            copiedText={copiedText}
          />
          <HeaderGroup
            title={HEADER_GROUPS.SECURITY}
            headers={grouped[HEADER_GROUPS.SECURITY]}
            onCopy={onCopy}
            copiedText={copiedText}
          />
          <HeaderGroup
            title={HEADER_GROUPS.SERVER}
            headers={grouped[HEADER_GROUPS.SERVER]}
            onCopy={onCopy}
            copiedText={copiedText}
          />
          <HeaderGroup
            title={HEADER_GROUPS.GENERAL}
            headers={grouped[HEADER_GROUPS.GENERAL]}
            onCopy={onCopy}
            copiedText={copiedText}
          />
        </>
      )}

      <HeaderGroup
        title={searchTerm ? `Search Matches (${allHeadersList.length})` : HEADER_GROUPS.ALL}
        headers={allHeadersList}
        onCopy={onCopy}
        copiedText={copiedText}
        defaultOpen={true}
      />
    </div>
  );
}
