// API Base URL - Use Next.js proxy in development
export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "/api" // Will be proxied through Next.js
    : process.env.NEXT_PUBLIC_API_URL || "https://gender-healthcare.org";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh-token",
    ME: "/auth/me",
  },

  // Users
  USERS: {
    BASE: "/users",
    PROFILE: "/users/me",
    CHANGE_PASSWORD: "/users/me/change-password",
  },

  // Appointments
  APPOINTMENTS: {
    BASE: "/appointments",
    STATUS: (id: string) => `/appointments/${id}/status`,
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
    CHAT_ROOM: (id: string) => `/appointments/${id}/chat-room`,
  },

  // Consultants
  CONSULTANTS: {
    BASE: "/consultant-profiles",
    AVAILABILITY: "/consultant-availability",
    REGISTER: "/consultant-profiles/register",
    APPROVE: (id: string) => `/consultant-profiles/${id}/approve`,
    REJECT: (id: string) => `/consultant-profiles/${id}/reject`,
    SCHEDULE: (id: string) => `/consultant-profiles/${id}/working-hours`,
  },

  // Menstrual Cycles
  CYCLES: {
    BASE: "/menstrual-cycles",
    PREDICTIONS: "/menstrual-predictions/me",
    MOODS: "/cycle-moods",
    SYMPTOMS: "/cycle-symptoms",
  },

  // STI Testing
  STI_TESTING: {
    BASE: "/sti-test-processes",
    RESULTS: "/test-results",
    TEMPLATES: "/test-results/templates",
  },

  // Files
  FILES: {
    UPLOAD_IMAGE: "/files/image",
    UPLOAD_DOCUMENT: "/files/document",
    GET_IMAGE: (id: string) => `/files/image/${id}/access`,
    GET_DOCUMENT: (id: string) => `/files/document/${id}/access`,
  },

  // Blog
  BLOG: {
    BASE: "/blogs",
    BY_SLUG: (slug: string) => `/blogs/slug/${slug}`,
  },

  // Services
  SERVICES: {
    BASE: "/services",
    BY_ID: (id: string) => `/services/${id}`,
    STI: "/services/sti", // Add STI services endpoint
  },
};

// API Request Config
export const API_CONFIG = {
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
  TIMEOUT: "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền truy cập tài nguyên này.",
  NOT_FOUND: "Không tìm thấy tài nguyên yêu cầu.",
  SERVER_ERROR: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
};

// Response Status Codes
export const API_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// API Features Config
export const API_FEATURES = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  CACHE: {
    ENABLED: true,
    TTL: 300, // 5 minutes
  },
};

// Utility function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
