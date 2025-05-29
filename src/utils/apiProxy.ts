
// Proxy utility to handle API requests and bypass CORS
const PROXY_BASE_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:8080/api/proxy';

export const proxyApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const proxyUrl = `${PROXY_BASE_URL}?target=${encodeURIComponent(endpoint)}`;
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
};
