import React from 'react';
import { RotateCw, ShieldAlert, Navigation, Loader2 } from 'lucide-react';

export function EmptyState({ type, onReloadAndTrace, customMessage }) {
  if (type === 'loading') {
    return (
      <div className="empty-view">
        <div className="empty-icon-wrap">
          <Loader2 size={20} className="spin" />
        </div>
        <div className="empty-heading">Analyzing navigation...</div>
        <div className="empty-subheading">Observing HTTP redirect path and response headers</div>
      </div>
    );
  }

  if (type === 'unsupported-scheme') {
    return (
      <div className="empty-view">
        <div className="empty-icon-wrap" style={{ background: '#fef2f2', color: '#dc2626' }}>
          <ShieldAlert size={20} />
        </div>
        <div className="empty-heading">Unsupported Protocol</div>
        <div className="empty-subheading">
          Redirect Scan tracks HTTP and HTTPS pages only.<br />
          {customMessage && <code style={{ fontSize: 10.5, marginTop: 4, display: 'inline-block' }}>{customMessage}</code>}
        </div>
      </div>
    );
  }

  return (
    <div className="empty-view">
      <div className="empty-icon-wrap">
        <Navigation size={20} />
      </div>
      <div className="empty-heading">No redirect data captured</div>
      <div className="empty-subheading">
        This tab was opened before the extension started, or loaded without captured history.
      </div>
      <button className="btn btn-primary btn-sm" onClick={onReloadAndTrace}>
        <RotateCw size={12} />
        Reload & Trace Navigation
      </button>
    </div>
  );
}
