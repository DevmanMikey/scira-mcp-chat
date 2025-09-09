import { NextRequest } from 'next/server';

// Base origin we forward to, e.g. https://your-vercel-deployment.vercel.app or another service
// Must NOT have a trailing slash
const TARGET = process.env.PROXY_TARGET_ORIGIN || '';
const DEBUG = process.env.PROXY_DEBUG === '1';

if (!TARGET) {
  // Intentionally warn at module load so it's visible on first request
  console.warn('[proxy] PROXY_TARGET_ORIGIN is not set; proxy route will reject requests');
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

async function handle(method: Method, request: NextRequest, slug: string[]) {
  if (!TARGET) {
    return new Response(JSON.stringify({ error: 'Proxy not configured', detail: 'Set PROXY_TARGET_ORIGIN env var' }), { status: 500, headers: json });
  }

  const url = new URL(request.url);
  const qs = url.search;
  const pathSegment = slug.join('/');
  // Build upstream URL; avoid collapsing the '//' after protocol (e.g. https://)
  let upstreamURL = `${TARGET}/${pathSegment}${qs}`;
  const parts = upstreamURL.split('://');
  if (parts.length === 2) {
    parts[1] = parts[1].replace(/\/+/g, '/');
    upstreamURL = parts.join('://');
  }

  // CORS/preflight quick path (optional; adjust or remove based on deployment needs)
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const headers: Record<string, string> = {};
  // Forward selected headers (avoid Host, Connection, etc.)
  for (const [k, v] of request.headers.entries()) {
    const lk = k.toLowerCase();
    if (hopByHop.has(lk)) continue;
    headers[k] = v;
  }

  // Add a marker header so upstream can detect proxied origin if desired
  headers['x-proxied-by'] = 'internal-next-proxy';

  // Body passthrough only for relevant methods
  let body: BodyInit | undefined = undefined;
  if (!noBodyMethods.has(method)) {
    // If content-type indicates JSON/form, we can forward raw stream; NextRequest provides a ReadableStream
    body = request.body as any || undefined;
  }

  const init: RequestInit = { method, headers, body, redirect: 'manual' };

  const started = Date.now();
  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(upstreamURL, init);
  } catch (err: any) {
    if (DEBUG) console.error('[proxy] upstream fetch failed', upstreamURL, err);
    return new Response(JSON.stringify({ error: 'Upstream fetch failed', upstreamURL, message: err?.message || String(err) }), { status: 502, headers: json });
  }

  // Clone headers, filtering disallowed ones
  const respHeaders = new Headers();
  for (const [k, v] of upstreamResp.headers.entries()) {
    const lk = k.toLowerCase();
    if (blockedResponseHeaders.has(lk)) continue;
    respHeaders.set(k, v);
  }
  // CORS headers (optional; comment out if not needed)
  corsHeaders(respHeaders);
  respHeaders.set('x-proxy-duration-ms', String(Date.now() - started));

  if (DEBUG) {
    respHeaders.set('x-proxy-debug', JSON.stringify({ upstreamURL, status: upstreamResp.status }));
  }

  // Stream body directly
  return new Response(upstreamResp.body, { status: upstreamResp.status, statusText: upstreamResp.statusText, headers: respHeaders });
}

// Shared header helpers
const json = { 'Content-Type': 'application/json' };
const noBodyMethods = new Set(['GET', 'HEAD']);
const hopByHop = new Set(['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade']);
const blockedResponseHeaders = new Set(['content-encoding','content-length']);

function corsHeaders(existing?: Headers) {
  const h = existing || new Headers();
  h.set('access-control-allow-origin', '*');
  h.set('access-control-allow-headers', '*');
  h.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  h.set('access-control-max-age', '86400');
  return existing ? existing : h;
}

// Export handlers for each method we care about
export async function GET(request: NextRequest, ctx: { params: { slug: string[] } }) { return handle('GET', request, ctx.params.slug); }
export async function POST(request: NextRequest, ctx: { params: { slug: string[] } }) { return handle('POST', request, ctx.params.slug); }
export async function PUT(request: NextRequest, ctx: { params: { slug: string[] } }) { return handle('PUT', request, ctx.params.slug); }
export async function PATCH(request: NextRequest, ctx: { params: { slug: string[] } }) { return handle('PATCH', request, ctx.params.slug); }
export async function DELETE(request: NextRequest, ctx: { params: { slug: string[] } }) { return handle('DELETE', request, ctx.params.slug); }
export async function HEAD(request: NextRequest, ctx: { params: { slug: string[] } }) { return handle('HEAD', request, ctx.params.slug); }
export async function OPTIONS(request: NextRequest, ctx: { params: { slug: string[] } }) { return handle('OPTIONS', request, ctx.params.slug); }
