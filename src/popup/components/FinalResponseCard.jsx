import React from 'react';
import { Copy, FileText, Check, Server, Globe, CheckCircle2, AlertOctagon } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { getHeader } from '../../shared/headerUtils.js';

export function FinalResponseCard({ finalResponse, onCopy, copiedText, onSelectFinalHeaders }) {
  if (!finalResponse) return null;

  const isSuccess = finalResponse.statusCode >= 200 && finalResponse.statusCode < 300;
  const server = getHeader(finalResponse.responseHeaders, 'server');
  const contentType = getHeader(finalResponse.responseHeaders, 'content-type');
  const cacheControl = getHeader(finalResponse.responseHeaders, 'cache-control');

  return (
    <div className={`waterfall-card ${isSuccess ? 'is-final-ok' : 'is-final-error'}`}>
      <div className="card-top">
        <div className="step-label-group">
          {isSuccess ? (
            <CheckCircle2 size={15} color="#059669" />
          ) : (
            <AlertOctagon size={15} color="#DC2626" />
          )}
          <span style={{ fontWeight: 700, fontSize: 12 }}>
            {isSuccess ? 'Final Destination' : 'Final Response (Error)'}
          </span>
          <StatusBadge statusCode={finalResponse.statusCode} statusLine={finalResponse.statusLine} />
          {finalResponse.fromCache && (
            <span className="pill-chip chip-2xx" style={{ fontSize: 10 }}>From Cache</span>
          )}
        </div>

        <button
          className="btn btn-sm btn-ghost"
          onClick={onSelectFinalHeaders}
          title="View Response Headers"
        >
          <FileText size={11} />
          Headers ({finalResponse.responseHeaders ? finalResponse.responseHeaders.length : 0})
        </button>
      </div>

      <div className="url-stream">
        <div className="url-stream-row">
          <span className="url-tag">URL</span>
          <span className="url-text" title={finalResponse.url}>{finalResponse.url}</span>
          <button
            className="url-copy-btn"
            onClick={() => onCopy(finalResponse.url)}
            title="Copy Final URL"
          >
            {copiedText === finalResponse.url ? <Check size={11} color="#059669" /> : <Copy size={11} />}
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
        {finalResponse.ip && (
          <span className="meta-chip">
            <Globe size={11} />
            <span>IP: <strong>{finalResponse.ip}</strong></span>
          </span>
        )}
        {contentType && (
          <span className="meta-chip">
            <span>Type: <strong>{contentType.split(';')[0]}</strong></span>
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
