import { Grant } from "../data/grants";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Get API key from session storage (set by auth context) or fall back to env var
const getApiKey = (): string => {
  return sessionStorage.getItem('admin_api_key') || import.meta.env.VITE_ADMIN_API_KEY || "admin-secret-key-12345";
};

interface CreateGrantData {
  chain: string;
  category: string;
  title: string;
  tag: string;
  amount: string;
  status: "Open" | "Upcoming" | "Closed";
  deadline: string;
  summary: string;
  focus: string;
  link: string;
  source_url: string;
}

export const grantsApi = {
  // Get all grants with optional filters
  async getAll(filters?: {
    chain?: string;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Grant[]> {
    const params = new URLSearchParams();
    if (filters?.chain) params.append("chain", filters.chain);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);

    const url = `${API_BASE_URL}/grants${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch grants: ${response.statusText}`);
    }

    return response.json();
  },

  // Get single grant
  async getOne(id: number): Promise<Grant> {
    const response = await fetch(`${API_BASE_URL}/grants/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch grant: ${response.statusText}`);
    }

    return response.json();
  },

  // Create new grant (admin only)
  async create(data: CreateGrantData): Promise<Grant> {
    const response = await fetch(`${API_BASE_URL}/grants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-api-key": getApiKey(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to create grant");
    }

    return response.json();
  },

  // Update grant (admin only)
  async update(id: number, data: Partial<CreateGrantData>): Promise<Grant> {
    const response = await fetch(`${API_BASE_URL}/grants/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-api-key": getApiKey(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to update grant");
    }

    return response.json();
  },

  // Delete grant (admin only)
  async delete(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/grants/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-api-key": getApiKey(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to delete grant");
    }

    return response.json();
  },

  // Subscribe to grant updates
  async subscribe(email: string, grantId: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/grants/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, grant_id: grantId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || "Failed to subscribe");
    }

    return response.json();
  },
};
