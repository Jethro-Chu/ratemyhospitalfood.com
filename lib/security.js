import { clientIp } from './clientIp';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { sql } from '@vercel/postgres';

export class SecurityError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function assertOrigin(request) {
  const origin = request.headers.get('origin');
  const allowed = new Set(['https://ratemyhospitalfood.com', 'https://www.ratemyhospitalfood.com']);
  if (process.env.NODE_ENV !== 'production') allowed.add(new URL(request.url).origin);
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && !allowed.has(origin))) {
    throw new SecurityError(403, 'Origin not allowed');
  }
}

export async function readBody(request, maxBytes, type = 'application/json') {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith(type)) throw new SecurityError(415, 'Unsupported content type');
  if (Number(request.headers.get('content-length')) > maxBytes) throw new SecurityError(413, 'Request too large');
  const reader = request.body?.getReader();
  let length = 0;
  const chunks = [];
  if (reader) while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) { void reader.cancel(); throw new SecurityError(413, 'Request too large'); }
    chunks.push(Buffer.from(value));
  }
  const body = Buffer.concat(chunks);
  if (type === 'application/json') {
    try { return JSON.parse(body.toString('utf8')); }
    catch { throw new SecurityError(400, 'Invalid JSON'); }
  }
  try { return await new Response(body, { headers: { 'content-type': request.headers.get('content-type') } }).formData(); }
  catch { throw new SecurityError(400, 'Invalid form data'); }
}

export async function checkBudget(request, scope, perHour, globalPerHour) {
  const ip = clientIp(request);
  const ipHash = createHash('sha256').update(ip).digest('hex');
  // A single atomic query protects across instances. No runtime DDL or fail-open fallback.
  const result = await sql`
    INSERT INTO security_rate_limits (key, window_start, count)
    VALUES (${scope + ':' + ipHash}, date_trunc('hour', NOW()), 1),
           (${scope + ':global'}, date_trunc('hour', NOW()), 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN security_rate_limits.window_start = date_trunc('hour', NOW()) THEN security_rate_limits.count + 1 ELSE 1 END,
      window_start = date_trunc('hour', NOW())
    RETURNING key, count
  `;
  if (result.rows.some(row => Number(row.count) > (row.key.endsWith(':global') ? globalPerHour : perHour))) {
    throw new SecurityError(429, 'Too many submissions. Please try again later.');
  }
}

function secret() {
  const value = process.env.APP_SECURITY_SECRET;
  if (!value || value.length < 32) throw new SecurityError(503, 'Submissions are temporarily unavailable');
  return value;
}
function signature(value) { return createHmac('sha256', secret()).update(value).digest('hex'); }
function equal(a, b) { return a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b)); }
export function sign(value) { return `${value}.${signature(value)}`; }
export function verified(value) {
  if (typeof value !== 'string' || value.length > 2200) return null;
  const i = value.lastIndexOf('.');
  if (i < 1 || !/^[a-f0-9]{64}$/.test(value.slice(i + 1))) return null;
  const content = value.slice(0, i);
  return equal(value.slice(i + 1), signature(content)) ? content : null;
}
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 30 };
export function actorFromCookie(cookie) { return verified(cookie) ?? randomUUID(); }
export function photoReceipt(url) { return sign(url); }
export function assertPhoto(url, receipt) {
  if (!url) return;
  if (!isPhotoUrl(url) || verified(receipt) !== url) throw new SecurityError(400, 'Please upload your photo before submitting');
}
export function isPhotoUrl(value) {
  try {
    const url = new URL(value);
    const host = process.env.REVIEW_PHOTO_HOST ?? 'zzpawzswkmo8mdxz.public.blob.vercel-storage.com';
    return url.protocol === 'https:' && url.hostname === host && !url.username && !url.password && !url.port && !url.search && !url.hash &&
      /^\/review-photos\/[a-zA-Z0-9_-]+\.jpg$/.test(url.pathname);
  } catch { return false; }
}
export function uuid(value) { return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
export function text(value, max, required = false) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new SecurityError(400, 'Required field missing');
    return null;
  }
  if (typeof value !== 'string' || value.trim().length > max || (required && value.trim().length < 2)) throw new SecurityError(400, 'Invalid field');
  return value.trim() || null;
}
export function validateReview(body) {
  if (!body || typeof body !== 'object' || !uuid(body.hospitalId)) throw new SecurityError(400, 'Invalid hospital');
  const rating = typeof body.rating === 'string' && /^[1-5]$/.test(body.rating) ? Number(body.rating) : body.rating;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new SecurityError(400, 'Rating must be between 1 and 5');
  return { hospitalId: body.hospitalId, rating, comment: text(body.comment, 4000), name: text(body.name, 100), imageUrl: text(body.imageUrl, 2048) };
}
export function failure(error) {
  const status = error instanceof SecurityError ? error.status : 503;
  // Never return database/provider errors or log bodies/credentials.
  if (status === 503) console.error('[submissions] service unavailable');
  return Response.json({ error: status === 503 ? 'Submissions are temporarily unavailable' : error.message }, {
    status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '3600' } : {}) },
  });
}
