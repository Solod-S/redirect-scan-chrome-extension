import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { SEVERITY } from '../../shared/constants.js';

export function IssueList({ issues, onSelectStep }) {
  const [filter, setFilter] = useState('all');

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.severity === filter;
  });

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case SEVERITY.ERROR:
        return <AlertCircle size={15} color="#DC2626" />;
      case SEVERITY.WARNING:
        return <AlertTriangle size={15} color="#D97706" />;
      case SEVERITY.INFO:
        return <Info size={15} color="#2563EB" />;
      case SEVERITY.PASSED:
        return <CheckCircle2 size={15} color="#059669" />;
      default:
        return <Info size={15} />;
    }
  };

  const counts = {
    all: issues.length,
    [SEVERITY.ERROR]: issues.filter(i => i.severity === SEVERITY.ERROR).length,
    [SEVERITY.WARNING]: issues.filter(i => i.severity === SEVERITY.WARNING).length,
    [SEVERITY.INFO]: issues.filter(i => i.severity === SEVERITY.INFO).length,
    [SEVERITY.PASSED]: issues.filter(i => i.severity === SEVERITY.PASSED).length
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </button>
        {counts[SEVERITY.ERROR] > 0 && (
          <button
            className={`btn btn-sm ${filter === SEVERITY.ERROR ? 'btn-primary' : ''}`}
            onClick={() => setFilter(SEVERITY.ERROR)}
          >
            Errors ({counts[SEVERITY.ERROR]})
          </button>
        )}
        {counts[SEVERITY.WARNING] > 0 && (
          <button
            className={`btn btn-sm ${filter === SEVERITY.WARNING ? 'btn-primary' : ''}`}
            onClick={() => setFilter(SEVERITY.WARNING)}
          >
            Warnings ({counts[SEVERITY.WARNING]})
          </button>
        )}
        {counts[SEVERITY.INFO] > 0 && (
          <button
            className={`btn btn-sm ${filter === SEVERITY.INFO ? 'btn-primary' : ''}`}
            onClick={() => setFilter(SEVERITY.INFO)}
          >
            Info ({counts[SEVERITY.INFO]})
          </button>
        )}
        {counts[SEVERITY.PASSED] > 0 && (
          <button
            className={`btn btn-sm ${filter === SEVERITY.PASSED ? 'btn-primary' : ''}`}
            onClick={() => setFilter(SEVERITY.PASSED)}
          >
            Passed ({counts[SEVERITY.PASSED]})
          </button>
        )}
      </div>

      {filteredIssues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          No issues in this category.
        </div>
      ) : (
        filteredIssues.map((issue) => (
          <div key={issue.id} className={`issue-row sev-${issue.severity}`}>
            <div style={{ marginTop: 1, flexShrink: 0 }}>
              {getSeverityIcon(issue.severity)}
            </div>
            <div className="issue-main-text">
              <div className="issue-heading">{issue.title}</div>
              <div className="issue-details">{issue.description}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
