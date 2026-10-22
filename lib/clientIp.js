import { BlockList, isIP } from 'node:net';
// Official Cloudflare ranges, verified 2026-10-21. Review when proxy settings change.
// https://www.cloudflare.com/ips-v4 · https://www.cloudflare.com/ips-v6
const ranges = ["173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13", "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22", "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32"];
const cloudflare = new BlockList();
for (const range of ranges) {
  const [address, prefix] = range.split('/');
  cloudflare.addSubnet(address, Number(prefix), isIP(address) === 6 ? 'ipv6' : 'ipv4');
}
export function clientIp(request) {
  if (!process.env.VERCEL) return 'local';
  const peer = (request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const family = isIP(peer);
  if (!family) return 'unknown';
  const host = request.headers.get('host')?.split(':')[0] ?? new URL(request.url).hostname;
  const customDomain = ['ratemyhospitalfood.com', 'www.ratemyhospitalfood.com'].includes(host);
  const visitor = request.headers.get('cf-connecting-ip');
  // Never trust CF headers on direct Vercel aliases or non-Cloudflare peers.
  if (customDomain && cloudflare.check(peer, family === 6 ? 'ipv6' : 'ipv4') && visitor && isIP(visitor)) return visitor;
  return peer;
}
