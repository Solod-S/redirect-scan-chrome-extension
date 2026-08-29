import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBadge } from '../src/popup/components/StatusBadge.jsx';
import { RedirectCard } from '../src/popup/components/RedirectCard.jsx';
import { Summary } from '../src/popup/components/Summary.jsx';
import { IssueList } from '../src/popup/components/IssueList.jsx';
import { SEVERITY } from '../src/shared/constants.js';

describe('Popup React Components', () => {
  it('renders StatusBadge with correct label and class', () => {
    const { container } = render(<StatusBadge statusCode={301} />);
    expect(screen.getByText('301 Moved Permanently')).toBeDefined();
    expect(container.querySelector('.chip-3xx')).not.toBeNull();
  });

  it('renders RedirectCard with from and to URLs and handles copy', () => {
    const step = {
      id: 'step-1',
      statusCode: 301,
      statusLine: 'HTTP/1.1 301 Moved Permanently',
      url: 'http://example.com/old',
      redirectUrl: 'https://example.com/new',
      responseHeaders: [{ name: 'Server', value: 'nginx' }],
      ip: '1.2.3.4',
      fromCache: false
    };

    const onCopy = vi.fn();
    const onSelectStepHeaders = vi.fn();

    render(
      <RedirectCard
        step={step}
        index={0}
        onCopy={onCopy}
        copiedText={null}
        onSelectStepHeaders={onSelectStepHeaders}
      />
    );

    expect(screen.getByText('Step 1')).toBeDefined();
    expect(screen.getByText('http://example.com/old')).toBeDefined();
    expect(screen.getByText('https://example.com/new')).toBeDefined();
    expect(screen.getByText('nginx')).toBeDefined();
  });

  it('renders Summary bar with counts and hops info', () => {
    const mockState = {
      steps: [{ id: 's1', statusCode: 301 }, { id: 's2', statusCode: 302 }],
      clientRedirects: [{ id: 'c1' }],
      finalResponse: {
        statusCode: 200,
        responseHeaders: [{ name: 'Server', value: 'cloudflare' }],
        ip: '104.18.18.199'
      }
    };

    render(<Summary state={mockState} issuesCount={5} />);

    expect(screen.getByText(/3 hops/)).toBeDefined();
    expect(screen.getByText('cloudflare')).toBeDefined();
    expect(screen.getByText('104.18.18.199')).toBeDefined();
    expect(screen.getByText(/5 issues/)).toBeDefined();
  });

  it('renders IssueList and filters by severity', () => {
    const mockIssues = [
      { id: '1', severity: SEVERITY.ERROR, title: 'Loop detected', description: 'Loop desc' },
      { id: '2', severity: SEVERITY.WARNING, title: 'Long chain', description: 'Chain desc' },
      { id: '3', severity: SEVERITY.PASSED, title: 'Final 200', description: 'OK desc' }
    ];

    render(<IssueList issues={mockIssues} onSelectStep={vi.fn()} />);

    expect(screen.getByText('Loop detected')).toBeDefined();
    expect(screen.getByText('Long chain')).toBeDefined();
    expect(screen.getByText('Final 200')).toBeDefined();

    // Click Errors filter button
    const errorBtn = screen.getByText(/Errors/);
    fireEvent.click(errorBtn);

    expect(screen.getByText('Loop detected')).toBeDefined();
    expect(screen.queryByText('Long chain')).toBeNull();
  });
});
