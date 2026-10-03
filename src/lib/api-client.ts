import { Category, MenuItem } from "./types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Resolves the configured API base URL without trailing slashes or quotes.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/backend-api";
  return envUrl.replace(/^(["'])([\s\S]*)\1$/, "$2").replace(/\/+$/, "");
}

/**
 * Generic fetch wrapper for backend communication.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, params, headers, ...restOptions } = options;
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let url = `${baseUrl}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(restOptions.body ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string>),
  };

  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers: reqHeaders,
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? `Network request failed: ${error.message}` : "Network request failed",
      0
    );
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(
      `Invalid JSON response from server (HTTP ${response.status})`,
      response.status
    );
  }

  if (!response.ok || !json.success) {
    const errorMessage = json.error || `Server responded with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, json);
  }

  if (json.data === undefined) {
    throw new ApiError("API response is missing required data payload", response.status, json);
  }

  return json.data;
}

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  rice: "🍚",
  "short-eats": "🥟",
  beverages: "🥤",
  drinks: "🥤",
  desserts: "🍰",
  burgers: "🍔",
  pizza: "🍕",
  pasta: "🍝",
};

/**
 * Returns an appropriate icon emoji for a given category.
 */
export function getCategoryIcon(categoryId: string, existingIcon?: string): string {
  if (existingIcon && existingIcon.trim().length > 0) {
    return existingIcon;
  }
  return DEFAULT_CATEGORY_ICONS[categoryId.toLowerCase()] || "🍴";
}

/**
 * Fetch all menu categories from the deployed backend.
 */
export async function getCategories(): Promise<Category[]> {
  const categories = await apiRequest<Category[]>("/categories");
  return categories
    .map((cat) => ({
      ...cat,
      icon: getCategoryIcon(cat.id, cat.icon),
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/**
 * Fetch all menu items from the deployed backend.
 * Ensures each item has a unique, deterministic ID even if backend omitted it.
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  const items = await apiRequest<MenuItem[]>("/menu-items");
  return items
    .map((item, index) => {
      const fallbackId = `item-${item.categoryId || "general"}-${index}-${item.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}`;
      return {
        ...item,
        id: item.id || fallbackId,
        variants: item.variants || [],
      };
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
