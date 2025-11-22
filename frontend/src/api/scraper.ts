const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || "admin-secret-key-12345";

export interface ScrapeResult {
  sources_scraped: number;
  grants_added: number;
  grants_updated: number;
  errors: string[];
}

export interface GrantSource {
  id: number;
  name: string;
  url: string;
  chain_name: string;
  scrape_strategy: string;
  is_active: boolean;
  last_scraped_at: string | null;
  last_success_at: string | null;
  consecutive_failures: number;
  last_error: string | null;
}

export interface ScraperLog {
  id: number;
  source_id: number | null;
  source_name: string;
  status: string;
  grants_found: number;
  grants_added: number;
  grants_updated: number;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export const scraperApi = {
  // Trigger manual scrape of all sources
  async runScraper(): Promise<ScrapeResult> {
    const response = await fetch(`${API_BASE_URL}/scraper/run`, {
      method: "POST",
      headers: {
        "x-admin-api-key": ADMIN_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to run scraper");
    }

    return response.json();
  },

  // Scrape a single source by ID
  async scrapeSource(sourceId: number): Promise<{ grants_added: number; grants_updated: number }> {
    const response = await fetch(`${API_BASE_URL}/scraper/sources/${sourceId}/scrape`, {
      method: "POST",
      headers: {
        "x-admin-api-key": ADMIN_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to scrape source");
    }

    return response.json();
  },

  // Get all grant sources
  async getSources(): Promise<GrantSource[]> {
    const response = await fetch(`${API_BASE_URL}/scraper/sources`, {
      headers: {
        "x-admin-api-key": ADMIN_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to fetch sources");
    }

    return response.json();
  },

  // Get recent scraper logs
  async getLogs(): Promise<ScraperLog[]> {
    const response = await fetch(`${API_BASE_URL}/scraper/logs`, {
      headers: {
        "x-admin-api-key": ADMIN_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to fetch logs");
    }

    return response.json();
  },
};
