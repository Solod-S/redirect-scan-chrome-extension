import React, { useState } from 'react';
import { useTabRedirectState } from './hooks/useTabRedirectState.js';
import { useClipboard } from './hooks/useClipboard.js';
import { formatRedirectChainText, formatFullReportText } from './utils/reportFormatter.js';
import { evaluateRules } from '../rules/redirectRulesEngine.js';
import { SEVERITY } from '../shared/constants.js';

import { Header } from './components/Header.jsx';
import { Summary } from './components/Summary.jsx';
import { Tabs } from './components/Tabs.jsx';
import { EmptyState } from './components/EmptyState.jsx';

import { PathSection } from './sections/PathSection.jsx';
import { HeadersSection } from './sections/HeadersSection.jsx';
import { IssuesSection } from './sections/IssuesSection.jsx';
import { Check } from 'lucide-react';

export function App() {
  const {
    activeTab,
    state,
    loading,
    unsupportedScheme,
    reloadAndTrace,
    refreshData
  } = useTabRedirectState();

  const { copied, copy } = useClipboard();
  const [copiedLabel, setCopiedLabel] = useState('');
  const [activeNavTab, setActiveNavTab] = useState('path');
  const [selectedHeaderStep, setSelectedHeaderStep] = useState('final');

  const handleCopy = async (text, label = 'Copied to clipboard!') => {
    const success = await copy(text);
    if (success) {
      setCopiedLabel(label);
    }
  };

  const handleCopyChain = () => {
    if (!state) return;
    const text = formatRedirectChainText(state);
    handleCopy(text, 'Redirect chain copied!');
  };

  const handleCopyReport = () => {
    if (!state) return;
    const text = formatFullReportText(state);
    handleCopy(text, 'Full report copied!');
  };

  const handleSelectHeaders = (stepIndex) => {
    setSelectedHeaderStep(stepIndex);
    setActiveNavTab('headers');
  };

  const issues = state ? evaluateRules(state) : [];
  const alertIssuesCount = issues.filter(
    i => i.severity === SEVERITY.ERROR || i.severity === SEVERITY.WARNING
  ).length;

  const totalHops = (state?.steps?.length || 0) + (state?.clientRedirects?.length || 0);

  // 1. Loading State
  if (loading && !state) {
    return (
      <div className="app-container">
        <Header
          state={null}
          activeTab={activeTab}
          onReloadAndTrace={reloadAndTrace}
          onRefreshData={refreshData}
          onCopyChain={() => {}}
          onCopyReport={() => {}}
        />
        <EmptyState type="loading" />
      </div>
    );
  }

  // 2. Unsupported Scheme State
  if (unsupportedScheme) {
    return (
      <div className="app-container">
        <Header
          state={null}
          activeTab={activeTab}
          onReloadAndTrace={reloadAndTrace}
          onRefreshData={refreshData}
          onCopyChain={() => {}}
          onCopyReport={() => {}}
        />
        <EmptyState type="unsupported-scheme" customMessage={unsupportedScheme} />
      </div>
    );
  }

  // 3. No Data Captured State
  const hasCapturedData = state && (
    (state.steps && state.steps.length > 0) ||
    state.finalResponse ||
    (state.clientRedirects && state.clientRedirects.length > 0) ||
    (state.errors && state.errors.length > 0)
  );

  if (!hasCapturedData) {
    return (
      <div className="app-container">
        <Header
          state={null}
          activeTab={activeTab}
          onReloadAndTrace={reloadAndTrace}
          onRefreshData={refreshData}
          onCopyChain={() => {}}
          onCopyReport={() => {}}
        />
        <EmptyState type="no-data" onReloadAndTrace={reloadAndTrace} />
      </div>
    );
  }

  // 4. Main App View
  return (
    <div className="app-container">
      <Header
        state={state}
        activeTab={activeTab}
        onReloadAndTrace={reloadAndTrace}
        onRefreshData={refreshData}
        onCopyChain={handleCopyChain}
        onCopyReport={handleCopyReport}
      />

      <Summary state={state} issuesCount={alertIssuesCount} />

      <Tabs
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        pathCount={totalHops}
        issuesCount={alertIssuesCount}
      />

      <main className="tab-pane">
        {activeNavTab === 'path' && (
          <PathSection
            state={state}
            onCopy={(text) => handleCopy(text, 'URL copied!')}
            copiedText={copied ? copiedLabel : null}
            onSelectHeaders={handleSelectHeaders}
          />
        )}

        {activeNavTab === 'headers' && (
          <HeadersSection
            state={state}
            selectedStepIndex={selectedHeaderStep}
            onSelectStepIndex={setSelectedHeaderStep}
            onCopy={(text) => handleCopy(text, 'Header value copied!')}
            copiedText={copied ? copiedLabel : null}
          />
        )}

        {activeNavTab === 'issues' && (
          <IssuesSection
            state={state}
            onSelectStep={() => {
              setActiveNavTab('path');
            }}
          />
        )}
      </main>

      {copied && (
        <div className="floating-toast">
          <Check size={13} color="#10B981" />
          <span>{copiedLabel || 'Copied to clipboard!'}</span>
        </div>
      )}
    </div>
  );
}
