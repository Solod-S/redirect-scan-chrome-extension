import React from 'react';
import { Copy, Check, Clock, Compass } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

export function ClientRedirectCard({ clientRedirect, index, onCopy, copiedText }) {
  const isMeta = clientRedirect.mechanism === 'meta-refresh';
  const label = isMeta ? 'Meta Refresh' : 'Client Navigation';

  return (
    <div className="waterfall-card is-client">
      <div className="card-top">
        <div className="step-label-group">
          <span className="step-index-badge">Client {index + 1}</span>
          <StatusBadge isClient={true} customLabel={label} />
        </div>
      </div>

      <div className="url-stream">
        <div className="url-stream-row">
          <span className="url-tag">From</span>
          <span className="url-text" title={clientRedirect.fromUrl}>{clientRedirect.fromUrl}</span>
          <button
            className="url-copy-btn"
            onClick={() => onCopy(clientRedirect.fromUrl)}
            title="Copy URL"
          >
            {copiedText === clientRedirect.fromUrl ? <Check size={11} color="#059669" /> : <Copy size={11} />}
          </button>
        </div>

        <div className="url-stream-row">
          <span className="url-tag">To</span>
          <span className="url-text" title={clientRedirect.toUrl}>{clientRedirect.toUrl}</span>
          <button
            className="url-copy-btn"
            onClick={() => onCopy(clientRedirect.toUrl)}
            title="Copy Destination"
          >
            {copiedText === clientRedirect.toUrl ? <Check size={11} color="#059669" /> : <Copy size={11} />}
          </button>
        </div>
      </div>

      <div className="card-bottom-meta">
        <span className="meta-chip">
          <Compass size={11} />
          <span>Evidence: <strong>{clientRedirect.evidence}</strong></span>
        </span>
        {clientRedirect.delay !== null && (
          <span className="meta-chip">
            <Clock size={11} />
            <span>Delay: <strong>{clientRedirect.delay}s</strong></span>
          </span>
        )}
      </div>
    </div>
  );
}
