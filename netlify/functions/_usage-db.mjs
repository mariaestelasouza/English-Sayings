import { neon } from '@netlify/neon';

const sql = neon();

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS requests (
      day TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      count INTEGER NOT NULL,
      PRIMARY KEY (day, endpoint)
    )
  `;
}

export async function countRequest(endpoint) {
  const day = new Date().toISOString().slice(0, 10);
  await initializeDatabase();
  await sql`
    INSERT INTO requests (day, endpoint, count)
    VALUES (${day}, ${endpoint}, 1)
    ON CONFLICT (day, endpoint)
    DO UPDATE SET count = requests.count + 1
  `;
}

export async function getStats(days = 365) {
  await initializeDatabase();
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
