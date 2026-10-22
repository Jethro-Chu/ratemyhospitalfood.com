import assert from 'node:assert/strict';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { PGlite } from '@electric-sql/pglite';

// Entire suite uses an in-memory PostgreSQL instance and a fake Blob provider.
// Never load .env files or connect to live services from this test.
process.env.APP_SECURITY_SECRET = 'local-test-signing-secret-not-a-production-credential';
process.env.NODE_ENV = 'test';
delete process.env.VERCEL;
const db = new PGlite();
globalThis.__securityDb = db;
globalThis.__securityBlobWrites = [];
await db.exec(`
  CREATE TABLE hospitals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(255) NOT NULL, location varchar(255) NOT NULL, website text);
  CREATE TABLE reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), hospital_id uuid REFERENCES hospitals(id), rating int NOT NULL, comment text, name varchar(255), image_url text, created_at timestamp DEFAULT now());
  CREATE TABLE private_notes (secret text);
  INSERT INTO hospitals (id,name,location) VALUES ('11111111-1111-4111-8111-111111111111','Test Hospital','Test City');
  INSERT INTO reviews (id,hospital_id,rating) VALUES ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111',5);
`);
await db.exec(await readFile('migrations/20261021_security.sql', 'utf8'));
await db.exec('SET ROLE food_runtime');
for (const query of ["SELECT * FROM private_notes", "DELETE FROM reviews", "UPDATE reviews SET comment = 'tampered'", "ALTER TABLE reviews ADD COLUMN injected text", "CREATE TABLE injected (id int)"]) {
  await assert.rejects(() => db.exec(query), /permission denied|must be owner/);
}

const dir = resolve('node_modules/.cache/security-tests');
await mkdir(dir, { recursive: true });
const file = resolve(dir, 'routes.mjs');
await build({
  stdin: { contents: `export * as client from './lib/clientIp.js'; export * as security from './lib/security.js'; export * as review from './app/api/review/route.js'; export * as upload from './app/api/upload/route.js'; export * as react from './app/api/react/route.js'; export * as actions from './lib/actions.js';`, resolveDir: process.cwd() },
  bundle: true, platform: 'node', format: 'esm', outfile: file,
  external: ['sharp'],
  plugins: [{ name: 'isolated-services', setup(builder) {
    builder.onResolve({ filter: /^next\/server$/ }, () => ({ path: resolve('node_modules/next/server.js'), external: true }));
    builder.onResolve({ filter: /^@\// }, args => ({ path: resolve(args.path.slice(2) + (args.path.endsWith('.js') ? '' : '.js')) }));
    builder.onResolve({ filter: /^(@vercel\/postgres|@vercel\/blob|next\/(headers|cache|navigation))$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'js', contents: {
      '@vercel/postgres': `export async function sql(parts,...values) { const query=parts.reduce((s,p,i)=>s+p+(i<values.length?'$'+(i+1):''),''); return globalThis.__securityDb.query(query,values); }`,
      '@vercel/blob': `export async function put(path,body,options) { globalThis.__securityBlobWrites.push({path,body,options}); return {url:'https://zzpawzswkmo8mdxz.public.blob.vercel-storage.com/'+path}; }`,
      'next/headers': `export async function headers(){ return globalThis.__securityRequest.headers; } export async function cookies(){ return {get(name){ const value=globalThis.__securityRequest.headers.get('cookie')?.split('; ').find(x=>x.startsWith(name+'='))?.slice(name.length+1); return value ? {value:decodeURIComponent(value)} : undefined; }}; }`,
      'next/cache': `export function revalidatePath(){}`,
      'next/navigation': `export function redirect(){ throw new Error('test redirect'); }`,
    }[args.path] }));
  } }],
});
const { client, security, review, upload, react, actions } = await import(pathToFileURL(file));
let checks = 5;
process.env.VERCEL = '1';
function ipRequest(host, peer, visitor) { return new Request('https://' + host, { headers: { host, 'x-vercel-forwarded-for': peer, 'cf-connecting-ip': visitor } }); }
assert.equal(client.clientIp(ipRequest('www.ratemyhospitalfood.com', '104.16.1.1', '192.0.2.1')), '192.0.2.1');
assert.equal(client.clientIp(ipRequest('www.ratemyhospitalfood.com', '192.0.2.2', '198.51.100.3')), '192.0.2.2');
assert.equal(client.clientIp(ipRequest('direct.vercel.app', '104.16.1.1', '198.51.100.3')), '104.16.1.1');
assert.equal(client.clientIp(ipRequest('www.ratemyhospitalfood.com', '2606:4700::1', '2001:db8::1')), '2001:db8::1');
checks += 4; delete process.env.VERCEL;

const hospitalId = '11111111-1111-4111-8111-111111111111';
const reviewId = '22222222-2222-4222-8222-222222222222';
function request(path, data, { origin = 'http://localhost:3001', cookie, form = false } = {}) {
  const headers = { origin };
  if (!form) headers['content-type'] = 'application/json';
  if (cookie) headers.cookie = cookie;
  const req = new Request('http://localhost:3001' + path, { method: 'POST', headers, body: form ? data : JSON.stringify(data) });
  globalThis.__securityRequest = req;
  return req;
}
async function expectStatus(handler, req, status) { const response = await handler(req); assert.equal(response.status, status, await response.clone().text()); checks++; return response; }
function cookie(response, key) { const match = response.headers.get('set-cookie')?.match(new RegExp(key + '=([^;]+)')); assert.ok(match); return key + '=' + match[1]; }

await expectStatus(review.POST, request('/api/review', { hospitalId, rating: 5 }, { origin: 'https://attacker.example' }), 403);
for (const rating of ['5junk', 0, 6, null, {}, 1.5]) await expectStatus(review.POST, request('/api/review', { hospitalId, rating }), 400);
await expectStatus(review.POST, request('/api/review', { hospitalId, rating: 5, name: 'a'.repeat(101) }), 400);
await expectStatus(review.POST, request('/api/review', { hospitalId, rating: 5, imageUrl: 'https://attacker.example/tracker.jpg' }), 400);
await expectStatus(review.POST, request('/api/review', { hospitalId, rating: 5, comment: 'a'.repeat(20_000) }), 413);
// Check actual streaming bytes without trusting a missing Content-Length.
await assert.rejects(() => security.readBody(new Request('http://localhost', { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(5000) }), 100), error => error.status === 413); checks++;
const injection = "'); DROP TABLE hospitals; -- <script>alert(1)</script>";
await expectStatus(review.POST, request('/api/review', { hospitalId, rating: 4, comment: injection }), 200);
assert.equal((await db.query('SELECT comment FROM reviews WHERE comment=$1', [injection])).rows.length, 1); checks++;
assert.equal((await db.query('SELECT count(*) AS n FROM hospitals')).rows[0].n, 1); checks++;

const fake = new FormData(); fake.set('file', new File(['<html><script>alert(1)</script></html>'], 'photo.html', { type: 'image/png' }));
await expectStatus(upload.POST, request('/api/upload', fake, { form: true }), 400);
assert.equal(globalThis.__securityBlobWrites.length, 0); checks++;
const sharp = (await import('sharp')).default;
const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#ff9900' } }).png().toBuffer();
const valid = new FormData(); valid.set('file', new File([png], '../../payload.svg', { type: 'text/html' }));
const uploaded = await expectStatus(upload.POST, request('/api/upload', valid, { form: true }), 200);
const photo = globalThis.__securityBlobWrites[0];
assert.match(photo.path, /^review-photos\/[a-f0-9-]+\.jpg$/); assert.equal((await sharp(photo.body).metadata()).format, 'jpeg'); checks += 2;
const photoUrl = (await uploaded.json()).url;
await expectStatus(review.POST, request('/api/review', { hospitalId, rating: 5, imageUrl: photoUrl }), 400);
await expectStatus(review.POST, request('/api/review', { hospitalId, rating: 5, imageUrl: photoUrl }, { cookie: cookie(uploaded, 'food_photo') }), 200);
assert.equal(security.verified(security.sign('actor') + 'tampered'), null); checks++;

const first = await expectStatus(react.POST, request('/api/react', { reviewId, type: 'helpful', delta: 1 }), 200);
const actor = cookie(first, 'food_actor');
assert.equal((await first.json()).helpfulCount, 1); checks++;
const repeated = await expectStatus(react.POST, request('/api/react', { reviewId, type: 'helpful', delta: 1 }, { cookie: actor }), 200);
assert.equal((await repeated.json()).helpfulCount, 1); checks++;
const other = await expectStatus(react.POST, request('/api/react', { reviewId, type: 'helpful', delta: -1 }), 200);
assert.equal((await other.json()).helpfulCount, 1); checks++;
const removed = await expectStatus(react.POST, request('/api/react', { reviewId, type: 'helpful', delta: -1 }, { cookie: actor }), 200);
assert.equal((await removed.json()).helpfulCount, 0); checks++;
await expectStatus(react.POST, request('/api/react', { reviewId: 'not-a-uuid', type: 'helpful', delta: 1 }), 400);
globalThis.__securityRequest = request('/', {});
assert.equal(await actions.createHospitalClient({ name: 'x'.repeat(201), location: 'Test' }), null); checks++;
const bypass = new FormData(); bypass.set('hospitalId', hospitalId); bypass.set('rating', '500');
assert.ok((await actions.createReview(bypass)).message); checks++;
for (let i = 0; i < 3; i++) await security.checkBudget(request('/', {}), 'fixture', 3, 20);
await assert.rejects(() => security.checkBudget(request('/', {}), 'fixture', 3, 20), error => error.status === 429); checks++;
await assert.rejects(() => readFile('app/seed/route.js'), /ENOENT/); checks++;
await assert.rejects(() => db.exec("INSERT INTO reviews(hospital_id,rating) VALUES ('11111111-1111-4111-8111-111111111111',9)"), /check constraint/); checks++;
await db.close();
await rm(dir, { recursive: true, force: true });
console.log(`PASS: ${checks} security assertions with isolated PostgreSQL, restricted runtime role, and fake Blob storage.`);
