import { getDatabase } from '@netlify/database';

// The "requests" table is defined in db/schema.ts and created by the
// migrations in netlify/database/migrations, applied by Netlify on deploy.
let database;
function sql(strings, ...values) {
  database ??= getDatabase();
  return database.sql(strings, ...values);
}

export async function countRequest(endpoint) {
  const day = new Date().toISOString().slice(0, 10);
  await sql`
    INSERT INTO requests (day, endpoint, count)
    VALUES (${day}, ${endpoint}, 1)
    ON CONFLICT (day, endpoint)
    DO UPDATE SET count = requests.count + 1
  `;
}

export async function getStats(days = 365) {
  const rows = await sql`
    SELECT day, endpoint, count
    FROM requests
    ORDER BY day DESC, endpoint
  `;

  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.day)) {
      grouped.set(row.day, {
        day: row.day,
        visits: 0,
        total_requests: 0,
        endpoints: {},
      });
    }
    const entry = grouped.get(row.day);
    const count = Number(row.count);
    entry.endpoints[row.endpoint] = count;
    entry.total_requests += count;
    if (row.endpoint === 'POST /api/visit') {
      entry.visits = count;
    }
  }

  return [...grouped.values()].slice(0, days);
}
