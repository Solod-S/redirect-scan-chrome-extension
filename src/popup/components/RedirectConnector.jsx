import React from 'react';
import { ArrowDown } from 'lucide-react';
import { compareRedirectUrls } from '../../shared/urlUtils.js';

export function RedirectConnector({ fromUrl, toUrl }) {
  const diff = compareRedirectUrls(fromUrl, toUrl);

  const tags = [];
  if (diff.isHttpToHttps) tags.push('HTTPS Upgrade');
  else if (diff.isHttpsToHttp) tags.push('HTTP Downgrade');
  else if (diff.protocolChanged) tags.push('Protocol Changed');

  if (diff.isCrossDomain) tags.push('Cross-Domain');
  if (diff.wwwChanged) tags.push('www Changed');
  if (diff.queryDropped) tags.push('Query Stripped');
  if (diff.trailingSlashChanged) tags.push('Slash Normalized');

  return (
    <div className="flow-connector">
      <div className="connector-line-vert"></div>
      <div className="connector-pill-badge">
        <ArrowDown size={10} />
        {tags.length > 0 && <span>{tags.join(' • ')}</span>}
      </div>
    </div>
  );
}
