import React from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import { Server, Globe, AlertTriangle } from 'lucide-react';
import { getHeader } from '../../shared/headerUtils.js';

export function Summary({ state, issuesCount = 0 }) {
  if (!state) return null;

  const steps = state.steps || [];
  const clientCount = state.clientRedirects ? state.clientRedirects.length : 0;
  const redirectCount = steps.length;
  const totalHops = redirectCount + clientCount;
  const finalResponse = state.finalResponse;

  const server = finalResponse
    ? getHeader(finalResponse.responseHeaders, 'server')
    : (steps.length > 0 ? getHeader(steps[steps.length - 1].responseHeaders, 'server') : null);

  const ip = finalResponse?.ip || (steps.length > 0 ? steps[steps.length - 1].ip : null);

  let hopsSummary = 'Direct (0 redirects)';
  if (totalHops > 0) {
    const chainCodes = steps.map(s => s.statusCode);
    if (clientCount > 0) chainCodes.push('CR');
    hopsSummary = `${totalHops} ${totalHops === 1 ? 'hop' : 'hops'} (${chainCodes.join(' → ')})`;
  }

  return (
    <div className="metrics-strip">
      <div className="metrics-left">
        {finalResponse ? (
          <StatusBadge statusCode={finalResponse.statusCode} statusLine={finalResponse.statusLine} />
        ) : (
          <span className="pill-chip chip-3xx">In progress...</span>
        )}

        <span className="pill-chip">
          {hopsSummary}
        </span>
      </div>

      <div className="metrics-right">
        {server && (
          <span className="meta-chip" title="Server header">
            <Server size={11} />
            <span>{server}</span>
          </span>
        )}
        {ip && (
          <span className="meta-chip" title="Server IP">
            <Globe size={11} />
            <span>{ip}</span>
          </span>
        )}
        {issuesCount > 0 && (
          <span className="pill-chip chip-4xx" style={{ padding: '1px 5px' }}>
            <AlertTriangle size={10} />
            <span>{issuesCount} issues</span>
          </span>
        )}
      </div>
    </div>
  );
}
