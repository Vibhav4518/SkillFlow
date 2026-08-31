"use client";

let accessToken: string | null = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
let refreshPromise: Promise<string | null> | null = null;

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export function getAccessToken() {
  if (accessToken === null && typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }
  listeners.forEach((l) => l(token));
}

export function subscribeToken(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://skillflow-5ses.onrender.com/api/v1";
const API_BASE = RAW_API_URL.replace(/\/+$/, "");

function normalizeUrl(endpoint: string): string {
  const clean = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  // Already absolute
  if (clean.startsWith("http")) return clean;
  // Already has /api/v1
  if (clean.startsWith("/api/v1")) return `${API_BASE.replace(/\/api\/v1$/, "")}${clean}`;
  // Auth endpoints at root level
  if (clean.startsWith("/auth") || clean.startsWith("/health")) {
    return `${API_BASE.replace(/\/api\/v1$/, "")}${clean}`;
  }
  return `${API_BASE}${clean}`;
}

async function parseResponse(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") ?? "";
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return { success: true, data: null };
  }
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return { success: false, message: "Invalid JSON response from server" };
    }
  }
  const text = await res.text();
  // If the text looks like HTML (error page)
  if (text.trimStart().startsWith("<")) {
    if (res.status >= 500) {
      return { success: false, message: "Server error. Please try again later." };
    }
    if (res.status === 404) {
      return { success: false, message: "Endpoint not found." };
    }
    return { success: false, message: `Unexpected response (HTTP ${res.status})` };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text || `HTTP ${res.status}` };
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const baseUrl = API_BASE.replace(/\/api\/v1$/, "");
      const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setAccessToken(null);
        return null;
      }

      const json = await parseResponse(res);
      if (!json?.success || !json?.data?.accessToken) {
        setAccessToken(null);
        return null;
      }

      setAccessToken(json.data.accessToken);
      return json.data.accessToken as string;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  skipAuth?: boolean;
  skipRefreshRetry?: boolean;
  body?: any;
}

export async function apiFetch(endpoint: string, options: ApiFetchOptions = {}): Promise<any> {
  const { skipAuth, skipRefreshRetry, headers = {}, body, ...rest } = options;
  const url = normalizeUrl(endpoint);

  const isFormData = body instanceof FormData;
  const serializedBody = body === undefined ? undefined : isFormData ? body : JSON.stringify(body);

  const buildHeaders = (token: string | null): HeadersInit => ({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers as Record<string, string>),
    ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const doFetch = (token: string | null) =>
    fetch(url, {
      ...rest,
      credentials: "include",
      headers: buildHeaders(token),
      body: serializedBody,
    });

  let res = await doFetch(accessToken);

  if (res.status === 401 && !skipAuth && !skipRefreshRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  return parseResponse(res);
}
