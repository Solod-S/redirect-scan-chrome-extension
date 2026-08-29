import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

export function HeaderGroup({ title, headers, onCopy, copiedText, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!headers || headers.length === 0) return null;

  return (
    <div className="header-box">
      <div
        className="header-box-title"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <span>{title}</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontWeight: 600 }}>
          {headers.length}
        </span>
      </div>

      {isOpen && (
        <table className="header-grid-table">
          <tbody>
            {headers.map((h, idx) => (
              <tr key={`${h.name}-${idx}`}>
                <td className="header-key">{h.name}</td>
                <td className="header-val">
                  <span>{h.value}</span>
                  <button
                    className="btn btn-ghost btn-sm header-row-btn"
                    onClick={() => onCopy(h.value)}
                    title="Copy Header Value"
                  >
                    {copiedText === h.value ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
