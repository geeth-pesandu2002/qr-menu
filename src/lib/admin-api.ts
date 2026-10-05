import { auth } from "@/src/lib/firebase";

/**
 * Standard error class for Admin API client calls.
 */
export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export interface AdminFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Retrieves the current user's real Firebase ID token.
 * Optionally forces a refresh to guarantee validity and capture latest claims.
 * Returns null if no user is signed in.
 */
export async function getAdminIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return await user.getIdToken(forceRefresh);
}

/**
 * Executes an authenticated fetch against the backend API.
 * Automatically attaches Authorization: Bearer <real Firebase ID token>.
 * Strictly rejects mock/dummy tokens and throws on non-ok responses.
 */
export async function adminFetch<T = any>(
  endpoint: string,
  options: AdminFetchOptions = {}
): Promise<T> {
  const token = await getAdminIdToken();

  if (!token) {
    throw new AdminApiError(
      "Unauthorized: No active Firebase owner session found. Please sign in.",
      401
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/backend-api";
  const { headers = {}, params, ...fetchInit } = options;

  let url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...headers,
  };

  if (fetchInit.body && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...fetchInit,
    headers: requestHeaders,
  });

  let parsedData: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      parsedData = await response.json();
    } catch {
      parsedData = null;
    }
  } else {
    try {
      parsedData = await response.text();
    } catch {
      parsedData = null;
    }
  }

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    if (parsedData && typeof parsedData === "object") {
      if (parsedData.error) {
        errorMessage = String(parsedData.error);
      } else if (parsedData.message) {
        errorMessage = String(parsedData.message);
      }
    } else if (typeof parsedData === "string" && parsedData.trim().length > 0) {
      errorMessage = parsedData.slice(0, 200);
    }

    throw new AdminApiError(errorMessage, response.status, parsedData);
  }

  return parsedData as T;
}
