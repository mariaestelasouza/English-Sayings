import { countRequest, getStats } from './_usage-db.mjs';
import { isAuthorized, unauthorizedResponse } from './_usage-auth.mjs';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default async (request) => {
  await countRequest('GET /admin');

  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const stats = await getStats();
  const today = new Date().toISOString().slice(0, 10);
  const endpointTotals = {};
  for (const entry of stats) {
    for (const [endpoint, count] of Object.entries(entry.endpoints)) {
      endpointTotals[endpoint] = (endpointTotals[endpoint] || 0) + count;
    }
  }
  const endpoints = Object.entries(endpointTotals)
    .sort(([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB))
    .map(([name]) => name);

  const todayVisits = stats.find((entry) => entry.day === today)?.visits || 0;
  const weekVisits = stats.slice(0, 7).reduce((sum, entry) => sum + entry.visits, 0);
  const totalVisits = stats.reduce((sum, entry) => sum + entry.visits, 0);
  const totalRequests = stats.reduce((sum, entry) => sum + entry.total_requests, 0);

  const endpointRows = endpoints.length
    ? endpoints.map((endpoint) =>
        `<tr><td><code>${escapeHtml(endpoint)}</code></td><td class="num">${endpointTotals[endpoint]}</td></tr>`
      ).join('')
    : '<tr><td colspan="2" class="muted">No requests yet.</td></tr>';

  const endpointHeaders = endpoints
    .map((endpoint) => `<th class="num"><code>${escapeHtml(endpoint)}</code></th>`)
    .join('');
  const dayRows = stats.length
    ? stats.map((entry) =>
        `<tr><td>${escapeHtml(entry.day)}</td><td class="num"><b>${entry.visits}</b></td>`
        + endpoints.map((endpoint) => `<td class="num">${entry.endpoints[endpoint] || 0}</td>`).join('')
        + `<td class="num">${entry.total_requests}</td></tr>`
      ).join('')
    : '<tr><td colspan="3" class="muted">No requests yet.</td></tr>';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Usage admin</title>
<style>
body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;padding:0 16px;color:#2a2233;background:#f6f1fb}
h1{margin-bottom:4px}h2{margin-top:32px}.muted{color:#6b6178}
.cards{display:flex;gap:12px;margin:20px 0;flex-wrap:wrap}
.card{background:#fff;border:1px solid #e4d9f0;border-radius:12px;padding:14px 18px;flex:1;min-width:140px}
.card b{display:block;font-size:1.8rem;color:#7c3aed}.scroll{overflow-x:auto}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden}
th,td{text-align:left;padding:10px 14px;border-bottom:1px solid #e4d9f0;white-space:nowrap}
th{background:#ede4fd}.num{text-align:right;font-variant-numeric:tabular-nums}
code{font-size:.9em}
</style>
</head>
<body>
<h1>Usage admin</h1>
<p class="muted">Only counts are stored: no IP addresses, cookies or personal data. A "visit" is one time the app was opened.</p>
<div class="cards">
<div class="card"><span class="muted">Visits today</span><b>${todayVisits}</b></div>
<div class="card"><span class="muted">Visits, last 7 days</span><b>${weekVisits}</b></div>
<div class="card"><span class="muted">Visits, all time</span><b>${totalVisits}</b></div>
<div class="card"><span class="muted">Requests, all time</span><b>${totalRequests}</b></div>
</div>
<h2>Requests per endpoint (all time)</h2>
<div class="scroll"><table><thead><tr><th>Endpoint</th><th class="num">Requests</th></tr></thead><tbody>${endpointRows}</tbody></table></div>
<h2>Per day</h2>
<div class="scroll"><table><thead><tr><th>Day</th><th class="num">Visits</th>${endpointHeaders}<th class="num">All requests</th></tr></thead><tbody>${dayRows}</tbody></table></div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
