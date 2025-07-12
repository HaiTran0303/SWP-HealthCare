import { API_CONFIG, API_ERROR_MESSAGES, buildApiUrl } from "@/config/api";

interface RequestConfig extends RequestInit {
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface DefaultHeaders {
  [key: string]: string;
}

const defaultHeaders: DefaultHeaders = {
  ...API_CONFIG.DEFAULT_HEADERS,
  Accept: "application/json",
};

async function fetchWithTimeout(resource: string, config: RequestConfig = {}) {
  const { timeout = API_CONFIG.TIMEOUT } = config;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...config,
      credentials: "include", // Needed for cookies
      headers: {
        ...apiClient.defaultHeaders,
        ...config.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  let data;
  try {
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (error) {
    throw new ApiError(response.status, "Invalid response format from server");
  }

  if (!response.ok) {
    // Đảm bảo data luôn là object
    const safeData = data && typeof data === "object" ? data : {};

    switch (response.status) {
      case 400:
        throw new ApiError(
          response.status,
          safeData.message || "Dữ liệu không hợp lệ",
          safeData
        );
      case 401:
        throw new ApiError(
          response.status,
          safeData.message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          safeData
        );
      case 403:
        throw new ApiError(
          response.status,
          safeData.message || "Bạn không có quyền truy cập tài nguyên này.",
          safeData
        );
      case 404:
        throw new ApiError(
          response.status,
          safeData.message || "Không tìm thấy tài nguyên yêu cầu.",
          safeData
        );
      default:
        throw new ApiError(
          response.status,
          safeData.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
          safeData
        );
    }
  }

  return data.data || data;
}

export const apiClient = {
  defaultHeaders: { ...defaultHeaders },

  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };
  },

  removeDefaultHeader(headerName: string) {
    delete this.defaultHeaders[headerName];
  },

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    try {
      const url = buildApiUrl(endpoint);

      const response = await fetchWithTimeout(url, config);
      return handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError(408, "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.");
        }
        // Check for specific network errors
        if (error.message.includes("Failed to fetch")) {
          throw new ApiError(
            0,
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau."
          );
        }
        throw new ApiError(0, "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      }

      throw new ApiError(0, "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  },

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request(endpoint, {
      method: "GET",
      ...config,
    });
  },

  async post<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...config,
    });
  },

  async put<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...config,
    });
  },

  async patch<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...config,
    });
  },

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request(endpoint, {
      method: "DELETE",
      ...config,
    });
  },

  async upload<T>(
    endpoint: string,
    file: File,
    config: RequestConfig = {}
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request(endpoint, {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set correct content type for FormData
      ...config,
    });
  },
};

// Retry mechanism for failed requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = API_CONFIG.RETRY_ATTEMPTS,
  delay = API_CONFIG.RETRY_DELAY
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function fetchAllUsers() {
  // API only allows limit <= 100
  return apiClient.get<any>(
    `/users?limit=100&page=1&sortBy=createdAt&sortOrder=DESC`
  );
}
