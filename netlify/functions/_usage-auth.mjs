import crypto from 'node:crypto';

export function isAuthorized(request) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    return false;
  }

  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Basic ')) {
    return false;
  }

  try {
    const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator === -1) {
      return false;
    }

    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    const userBuffer = Buffer.from(user);
    const passwordBuffer = Buffer.from(password);
    const expectedUserBuffer = Buffer.from(expectedUser);
    const expectedPasswordBuffer = Buffer.from(expectedPassword);
    const safeUser = userBuffer.length === expectedUserBuffer.length
      && crypto.timingSafeEqual(userBuffer, expectedUserBuffer);
    const safePassword = passwordBuffer.length === expectedPasswordBuffer.length
      && crypto.timingSafeEqual(passwordBuffer, expectedPasswordBuffer);
    return safeUser && safePassword;
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return new Response(null, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Usage admin"',
      'Cache-Control': 'no-store',
    },
  });
}
