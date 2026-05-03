import { clearAccessToken, getAccessToken } from './auth';
import { clearVendorSession } from './session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  baseUrl?: string;
}

function buildUrl(path: string, params?: ApiRequestOptions['params'], baseUrl?: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const root = baseUrl ?? API_BASE_URL;
  const normalizedBase = root.endsWith('/') ? root.slice(0, -1) : root;
  const url = new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  if (url.origin !== window.location.origin) {
    return url.toString();
  }

  return `${url.pathname}${url.search}`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers();

  if (!options.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path, options.params, options.baseUrl), {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const detail = typeof payload === 'object' && payload && 'detail' in payload ? String((payload as { detail: unknown }).detail) : `Request failed (${response.status})`;

    if (response.status === 401) {
      clearAccessToken();
      clearVendorSession();
    }

    throw new ApiError(response.status, detail);
  }

  return payload as T;
}

export function extractList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const wrappedPayload = payload as Record<string, unknown>;
  const candidateKeys = ['results', 'data', 'items', 'products', 'rows', 'records'];

  for (const key of candidateKeys) {
    if (Array.isArray(wrappedPayload[key])) {
      return wrappedPayload[key] as T[];
    }
  }

  const firstArrayValue = Object.values(wrappedPayload).find((value) => Array.isArray(value));
  if (Array.isArray(firstArrayValue)) {
    return firstArrayValue as T[];
  }

  return [];
}
