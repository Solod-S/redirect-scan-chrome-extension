import React from 'react';
import { evaluateRules } from '../../rules/redirectRulesEngine.js';
import { IssueList } from '../components/IssueList.jsx';

export function IssuesSection({ state, onSelectStep }) {
  if (!state) return null;

  const issues = evaluateRules(state);

  return (
    <div>
      <IssueList issues={issues} onSelectStep={onSelectStep} />
    </div>
  );
}
