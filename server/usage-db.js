import pg from 'pg';

export function createUsageStore(connectionString) {
  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
  });
  pool.on('error', (error) => console.error('Usage database connection failed:', error.code));
  let initialization;

  async function initialize() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(287930564)');
      await client.query(`
        CREATE TABLE IF NOT EXISTS requests (
          day date NOT NULL,
          endpoint text NOT NULL,
          count bigint NOT NULL,
          PRIMARY KEY (day, endpoint)
        )
      `);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function query(statement, parameters) {
    initialization ??= initialize().catch((error) => {
      initialization = undefined;
      throw error;
    });
    await initialization;
    return pool.query(statement, parameters);
  }

  async function countRequest(endpoint) {
    const day = new Date().toISOString().slice(0, 10);
    await query(`
      INSERT INTO requests (day, endpoint, count)
      VALUES ($1, $2, 1)
      ON CONFLICT (day, endpoint)
      DO UPDATE SET count = requests.count + 1
    `, [day, endpoint]);
  }

  async function getStats() {
    const { rows } = await query(`
      SELECT day::text AS day, endpoint, count
      FROM requests
      WHERE day >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 364
      ORDER BY day DESC, endpoint
    `);

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

    return [...grouped.values()];
  }

  return { countRequest, getStats };
}
