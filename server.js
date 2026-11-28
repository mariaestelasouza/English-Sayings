import express from 'express';
import { accessSync, constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderAdmin } from './server/usage-admin.js';
import { isAuthorized } from './server/usage-auth.js';
import { createUsageStore } from './server/usage-db.js';

const dist = fileURLToPath(new URL('./dist/', import.meta.url));
accessSync(new URL('./dist/index.html', import.meta.url), constants.R_OK);

const app = express();
app.disable('x-powered-by');

const { DATABASE_URL: databaseUrl } = process.env;
const usage = databaseUrl ? createUsageStore(databaseUrl) : undefined;

function requireAdmin(request, response, next) {
  response.set('Cache-Control', 'no-store');
  if (!isAuthorized(request)) {
    return response.set('WWW-Authenticate', 'Basic realm="Usage admin"').sendStatus(401);
  }
  next();
}

app.post('/api/visit', async (_request, response) => {
  response.set('Cache-Control', 'no-store');
  if (!usage) return response.sendStatus(503);
  await usage.countRequest('POST /api/visit');
  response.sendStatus(204);
});

app.get('/admin', requireAdmin, async (_request, response) => {
  if (!usage) return response.status(503).send('Usage database is not configured.');
  await usage.countRequest('GET /admin');
  response.type('html').send(renderAdmin(await usage.getStats()));
});

app.get('/api/stats', requireAdmin, async (_request, response) => {
  if (!usage) return response.status(503).send('Usage database is not configured.');
  await usage.countRequest('GET /api/stats');
  response.json(await usage.getStats());
});

app.use(express.static(dist));
app.use((error, _request, response, _next) => {
  console.error('Request failed:', error.code ?? error.name);
  response.set('Cache-Control', 'no-store').sendStatus(500);
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`English Sayings is listening on port ${port}`);
});
