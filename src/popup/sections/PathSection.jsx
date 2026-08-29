import React from 'react';
import { RedirectCard } from '../components/RedirectCard.jsx';
import { ClientRedirectCard } from '../components/ClientRedirectCard.jsx';
import { FinalResponseCard } from '../components/FinalResponseCard.jsx';
import { RedirectConnector } from '../components/RedirectConnector.jsx';
import { AlertOctagon } from 'lucide-react';

export function PathSection({ state, onCopy, copiedText, onSelectHeaders }) {
  if (!state) return null;

  const steps = state.steps || [];
  const clientRedirects = state.clientRedirects || [];
  const errors = state.errors || [];
  const finalResponse = state.finalResponse;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. HTTP Redirect Steps */}
      {steps.map((step, idx) => (
        <React.Fragment key={step.id || idx}>
          <RedirectCard
            step={step}
            index={idx}
            onCopy={onCopy}
            copiedText={copiedText}
            onSelectStepHeaders={() => onSelectHeaders(idx)}
          />
          <RedirectConnector fromUrl={step.url} toUrl={step.redirectUrl} />
        </React.Fragment>
      ))}

      {/* 2. Client-Side Redirects */}
      {clientRedirects.map((cr, idx) => (
        <React.Fragment key={`client-${idx}`}>
          <ClientRedirectCard
            clientRedirect={cr}
            index={idx}
            onCopy={onCopy}
            copiedText={copiedText}
          />
          <RedirectConnector fromUrl={cr.fromUrl} toUrl={cr.toUrl} />
        </React.Fragment>
      ))}

      {/* 3. Final Response */}
      {finalResponse && (
        <FinalResponseCard
          finalResponse={finalResponse}
          onCopy={onCopy}
          copiedText={copiedText}
          onSelectFinalHeaders={() => onSelectHeaders('final')}
        />
      )}

      {/* 4. Network Errors */}
      {errors.length > 0 && (
        <div className="waterfall-card is-final-error" style={{ marginTop: 8 }}>
          <div className="card-top">
            <div className="step-label-group">
              <AlertOctagon size={15} color="#DC2626" />
              <span style={{ fontWeight: 700, fontSize: 12 }}>Network Error</span>
            </div>
            <span className="pill-chip chip-5xx">Failed</span>
          </div>
          {errors.map((err, idx) => (
            <div key={idx} style={{ marginTop: 3 }}>
              <div style={{ fontWeight: 600, color: 'var(--status-5xx)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {err.error}
              </div>
              {err.url && (
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>
                  URL: {err.url}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
