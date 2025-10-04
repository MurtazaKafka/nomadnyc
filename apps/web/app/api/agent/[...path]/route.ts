import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

const DEFAULT_AGENT_SERVICE_URL = 'http://localhost:8081';
const DEFAULT_AGENT_SERVICE_API_PREFIX = '/api';

function normalizeBaseUrl(value: string | undefined | null): string {
  if (!value) {
    return DEFAULT_AGENT_SERVICE_URL;
  }
  return value.replace(/\/+$/, '');
}

const AGENT_SERVICE_BASE_URL = normalizeBaseUrl(
  process.env.AGENT_SERVICE_INTERNAL_URL ??
    process.env.AGENT_SERVICE_URL ??
    process.env.NEXT_PUBLIC_AGENT_SERVICE_URL
);
const AGENT_SERVICE_API_PREFIX = (process.env.AGENT_SERVICE_API_PREFIX ?? DEFAULT_AGENT_SERVICE_API_PREFIX)
  .replace(/\/+$/, '') || '/api';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function filterRequestHeaders(headers: Headers): Headers {
  const filtered = new Headers();
  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lowerKey) || lowerKey === 'host' || lowerKey === 'content-length') {
      return;
    }
    filtered.set(key, value);
  });
  return filtered;
}

function filterResponseHeaders(headers: Headers): Headers {
  const filtered = new Headers();
  headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      return;
    }
    filtered.set(key, value);
  });
  return filtered;
}

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const params = await context.params;
  const pathSegments = params.path ?? [];
  const normalizedPath = pathSegments.join('/');
  const trimmedPath = normalizedPath.replace(/^\/+/, '');
  const normalizedPrefix = AGENT_SERVICE_API_PREFIX.replace(/^\/+/, '');
  const upstreamPath = trimmedPath.length === 0
    ? normalizedPrefix
    : trimmedPath.startsWith(`${normalizedPrefix}/`) || trimmedPath === normalizedPrefix
      ? trimmedPath
      : `${normalizedPrefix}/${trimmedPath}`;
  const upstreamUrl = new URL(upstreamPath, `${AGENT_SERVICE_BASE_URL}/`);
  const search = request.nextUrl.search;
  if (search) {
    upstreamUrl.search = search;
  }

  const init: RequestInit = {
    method: request.method,
    headers: filterRequestHeaders(request.headers),
    redirect: 'manual',
    cache: 'no-store',
  };

  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const bodyBuffer = await request.arrayBuffer();
    if (bodyBuffer.byteLength > 0) {
      init.body = bodyBuffer;
    }
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, init);
    const responseHeaders = filterResponseHeaders(upstreamResponse.headers);

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Agent proxy request failed', error);
    return NextResponse.json(
      { error: 'Agent service is unavailable' },
      { status: 503 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
