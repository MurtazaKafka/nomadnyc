const PUBLIC_AGENT_SERVICE_URL = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL?.replace(/\/+$/, '') ?? null;

export const buildAgentUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (PUBLIC_AGENT_SERVICE_URL) {
    return `${PUBLIC_AGENT_SERVICE_URL}${normalizedPath}`;
  }
  return `/api/agent${normalizedPath}`;
};
