import React from 'react';
import { GitCommit, FileText, AlertTriangle } from 'lucide-react';

export function Tabs({ activeTab, onTabChange, pathCount = 0, issuesCount = 0 }) {
  return (
    <nav className="tabs-header">
      <button
        className={`tab-item ${activeTab === 'path' ? 'active' : ''}`}
        onClick={() => onTabChange('path')}
      >
        <GitCommit size={13} />
        <span>Path</span>
        {pathCount > 0 && <span className="tab-badge">{pathCount}</span>}
      </button>

      <button
        className={`tab-item ${activeTab === 'headers' ? 'active' : ''}`}
        onClick={() => onTabChange('headers')}
      >
        <FileText size={13} />
        <span>Headers</span>
      </button>

      <button
        className={`tab-item ${activeTab === 'issues' ? 'active' : ''}`}
        onClick={() => onTabChange('issues')}
      >
        <AlertTriangle size={13} />
        <span>Issues</span>
        {issuesCount > 0 && (
          <span className="tab-badge badge-danger">{issuesCount}</span>
        )}
      </button>
    </nav>
  );
}
