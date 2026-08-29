import React from 'react';
import { Copy, FileText, Check, Server, Globe } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { getHeader } from '../../shared/headerUtils.js';

export function RedirectCard({ step, index, onCopy, copiedText, onSelectStepHeaders }) {
  const server = getHeader(step.responseHeaders, 'server');
  const cacheControl = getHeader(step.responseHeaders, 'cache-control');

  return (
    <div className="waterfall-card is-redirect" id={`step-card-${step.id}`}>
      <div className="card-top">
        <div className="step-label-group">
          <span className="step-index-badge">Step {index + 1}</span>
          <StatusBadge statusCode={step.statusCode} statusLine={step.statusLine} />
          {step.fromCache && (
            <span className="pill-chip chip-2xx" style={{ fontSize: 10 }}>From Cache</span>
          )}
        </div>

        <button
          className="btn btn-sm btn-ghost"
          onClick={() => onSelectStepHeaders(index)}
          title="View Response Headers"
        >
          <FileText size={11} />
          Headers ({step.responseHeaders ? step.responseHeaders.length : 0})
        </button>
      </div>

      <div className="url-stream">
        <div className="url-stream-row">
          <span className="url-tag">From</span>
          <span className="url-text" title={step.url}>{step.url}</span>
          <button
            className="url-copy-btn"
            onClick={() => onCopy(step.url)}
            title="Copy URL"
          >
            {copiedText === step.url ? <Check size={11} color="#059669" /> : <Copy size={11} />}
          </button>
        </div>

        <div className="url-stream-row">
          <span className="url-tag">To</span>
          <span className="url-text" title={step.redirectUrl}>{step.redirectUrl}</span>
          <button
            className="url-copy-btn"
            onClick={() => onCopy(step.redirectUrl)}
            title="Copy Destination"
          >
            {copiedText === step.redirectUrl ? <Check size={11} color="#059669" /> : <Copy size={11} />}
          </button>
        </div>
      </div>

      <div className="card-bottom-meta">
        {server && (
          <span className="meta-chip">
            <Server size={11} />
            <span>Server: <strong>{server}</strong></span>
          </span>
        )}
        {step.ip && (
          <span className="meta-chip">
            <Globe size={11} />
            <span>IP: <strong>{step.ip}</strong></span>
          </span>
        )}
        {cacheControl && (
          <span className="meta-chip">
            <span>Cache: <strong>{cacheControl}</strong></span>
          </span>
        )}
      </div>
    </div>
  );
}
