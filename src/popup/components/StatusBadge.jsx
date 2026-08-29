import React from 'react';
import { getStatusCategory, getStatusLabel } from '../../shared/statusCodes.js';

export function StatusBadge({ statusCode, statusLine, customLabel, isClient = false }) {
  if (isClient) {
    return (
      <span className="pill-chip chip-client">
        {customLabel || 'Client Redirect'}
      </span>
    );
  }

  const category = getStatusCategory(statusCode);
  const label = customLabel || getStatusLabel(statusCode);

  let chipClass = 'pill-chip ';
  switch (category) {
    case '2xx':
      chipClass += 'chip-2xx';
      break;
    case '3xx':
      chipClass += 'chip-3xx';
      break;
    case '4xx':
      chipClass += 'chip-4xx';
      break;
    case '5xx':
      chipClass += 'chip-5xx';
      break;
    default:
      chipClass += 'chip-4xx';
      break;
  }

  return (
    <span className={chipClass} title={statusLine || `${statusCode} ${label}`}>
      {statusCode} {label}
    </span>
  );
}
