/**
 * Python API client for communicating with the BOM Agent Service.
 *
 * All core application logic (providers, agents, knowledge) lives in Python.
 * Next.js uses this client to communicate with the Python backend.
 */

const PYTHON_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";
const SERVICE_API_KEY = process.env.SERVICE_API_KEY || "";

if (!SERVICE_API_KEY && process.env.NODE_ENV === "production") {
  console.error(
    "WARNING: SERVICE_API_KEY not configured. Python API calls will fail."
  );
}

/**
 * Provider result from Python API - matches Python ProviderResult model
 */
export interface ProviderResult {
  mpn: string;
  manufacturer: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  min_quantity: number;
  provider: string;
  distributor: string;
  url: string;
}

/**
 * Request body for part search
 */
interface SearchPartsRequest {
  query: string;
  manufacturer?: string;
  providers?: string[];
}

/**
 * Response from part search
 */
interface SearchPartsResponse {
  query: string;
  results: ProviderResult[];
  providers_searched: string[];
  results_by_provider: Record<string, number>;
}

/**
 * Response from providers list
 */
interface ProvidersResponse {
  configured: string[];
  available: string[];
}

/**
 * Python API client class
 */
class PythonApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = PYTHON_API_URL;
    this.apiKey = SERVICE_API_KEY;
  }

  /**
   * Make an authenticated request to the Python API
   */
  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Check if the Python API is healthy (unauthenticated)
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Verify the API key is valid by calling an authenticated endpoint
   */
  async verifyApiKey(): Promise<void> {
    await this.fetch<ProvidersResponse>("/search/providers");
  }

  /**
   * Search for parts across all configured providers
   */
  async searchParts(request: SearchPartsRequest): Promise<SearchPartsResponse> {
    return this.fetch<SearchPartsResponse>("/search/parts", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Get list of configured and available providers
   */
  async getProviders(): Promise<ProvidersResponse> {
    return this.fetch<ProvidersResponse>("/search/providers");
  }
}

// Singleton client instance
export const pythonClient = new PythonApiClient();

/**
 * Helper function for searching parts - returns just the results array
 */
export async function searchPartsViaPython(
  query: string,
  manufacturer?: string,
  providers?: string[]
): Promise<ProviderResult[]> {
  const response = await pythonClient.searchParts({
    query,
    manufacturer,
    providers,
  });
  return response.results;
}

/**
 * Helper function to get configured providers
 */
export async function getConfiguredProviders(): Promise<string[]> {
  const response = await pythonClient.getProviders();
  return response.configured;
}
