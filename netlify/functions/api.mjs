import { countRequest, getStats } from './_usage-db.mjs';
import { isAuthorized, unauthorizedResponse } from './_usage-auth.mjs';

const knownEndpoints = new Set([
  'POST /api/visit',
  'GET /api/stats',
]);

export default async (request) => {
  const url = new URL(request.url);
  let path = url.pathname;
  const functionIndex = path.indexOf('/.netlify/functions/api');
  if (functionIndex !== -1) {
    path = `/api${path.slice(functionIndex + '/.netlify/functions/api'.length)}`;
  }
  path = path.replace(/\/+$/, '') || '/';

  const method = request.method.toUpperCase();
  const endpoint = `${method} ${path}`;
  await countRequest(knownEndpoints.has(endpoint) ? endpoint : 'other (not found)');

  if (method === 'POST' && path === '/api/visit') {
    return new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  if (method === 'GET' && path === '/api/stats') {
    if (!isAuthorized(request)) {
      return unauthorizedResponse();
    }
    return Response.json(await getStats(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  return new Response('Not found', {
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  });
};
