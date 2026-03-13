/**
 * Probe the Vedic API to discover valid endpoint paths.
 * Usage: node scripts/probe-vedic-api.mjs
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envFile = resolve(process.cwd(), '.env.local');
try {
  readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=');
    if (k && rest.length) process.env[k.trim()] = rest.join('=').trim();
  });
} catch {
  console.error('.env.local not found — set VEDIC_API_URL and VEDIC_API_KEY manually');
}

const BASE = process.env.VEDIC_API_URL;
const KEY  = process.env.VEDIC_API_KEY;
console.log('BASE :', BASE);
console.log('KEY  :', KEY ? '<set>' : 'MISSING');
console.log('');

const PATHS = [
  'birth-chart', 'birth_chart', 'natal-chart', 'natal_chart',
  'birthchart',  'chart',       'natal',        'horoscope',
  'birth-charts','planets',     'planetary-positions', 'astro',
  'vedic',       'kundali',     'rasi',          'lagna',
];

// Also try GET on root
const BODY = JSON.stringify({
  year: 1990, month: 5, day: 15, hour: 12, minute: 0,
  latitude: 41.9981, longitude: 21.4254,
});

async function probe(method, path) {
  const url = `${BASE}/${path}`;
  try {
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': KEY ?? '' },
      body: method === 'POST' ? BODY : undefined,
      signal: AbortSignal.timeout(5000),
    });
    const text = await r.text();
    const snippet = text.slice(0, 120).replace(/\n/g, ' ');
    console.log(`${method} /${path}  ->  ${r.status}  ${snippet}`);
  } catch (e) {
    console.log(`${method} /${path}  ->  ERR  ${e.message}`);
  }
}

// GET root
await probe('GET', '');
console.log('');

for (const p of PATHS) {
  await probe('POST', p);
}
