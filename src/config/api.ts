// API Base URL - Use Next.js proxy in development
export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "/api" // Will be proxied through Next.js
    : process.env.NEXT_PUBLIC_API_URL || "https://gender-healthcare.org";

// API Endpoints
export const API_ENDPOINTS = {
  // Feedbacks
  FEEDBACKS: "/feedbacks",

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
    GET_ALL: "/users",
    CREATE: "/users", // Add this line
    TOGGLE_ACTIVE: (id: string) => `/users/${id}/toggle-active`,
    VERIFY_EMAIL: (id: string) => `/users/${id}/verify-email`,
  },

  // Appointments
  APPOINTMENTS: {
    BASE: "/appointments",
    GET_ALL: "/appointments",
    AVAILABLE_SLOTS: "/appointments/available-slots",
    STATUS: (id: string) => `/appointments/${id}/status`,
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
    CHAT_ROOM: (id: string) => `/appointments/${id}/chat-room`,
    CHECK_IN: (id: string) => `/appointments/${id}/check-in`,
    MARK_NO_SHOW: (id: string) => `/appointments/${id}/mark-no-show`,
    LATE_CHECK_IN: (id: string) => `/appointments/${id}/late-check-in`,
    UPDATE_MEETING_LINK: (id: string) => `/appointments/${id}/meeting-link`,
    GET_MEETING_LINK: (id: string) => `/appointments/${id}/meeting-link`,
    REMOVE_MEETING_LINK: (id: string) => `/appointments/${id}/meeting-link`,
  },

  // Consultants
  CONSULTANTS: {
    BASE: "/consultant-profiles",
    GET_ALL: "/consultant-profiles",
    AVAILABILITY: "/consultant-availability",
    REGISTER: "/consultant-profiles/register",
    APPROVE: (id: string) => `/consultant-profiles/${id}/approve`,
    REJECT: (id: string) => `/consultant-profiles/${id}/reject`,
    SCHEDULE: (id: string) => `/consultant-profiles/${id}/working-hours`,
    PENDING_APPROVAL: "/consultant-profiles/pending-approval",
    UPDATE_WORKING_HOURS: (id: string) => `/consultant-profiles/${id}/working-hours`,
    GENERATE_SCHEDULE: (id: string) => `/consultant-profiles/${id}/generate-schedule`,
    ENSURE_UPCOMING_SCHEDULE: (id: string) => `/consultant-profiles/${id}/ensure-upcoming-schedule`,
  },

  // Menstrual Cycles
  CYCLES: {
    BASE: "/menstrual-cycles",
    PREDICTIONS: "/menstrual-predictions/me",
    MOODS: "/cycle-moods",
    SYMPTOMS: "/cycle-symptoms",
  },

  // Contraceptive Reminders
  CONTRACEPTIVE_REMINDERS: {
    BASE: "/contraceptive-reminders",
    BY_ID: (id: string) => `/contraceptive-reminders/${id}`,
  },

  // STI Testing
  STI_TESTING: {
    BASE: "/sti-test-processes",
    CREATE_STI_APPOINTMENT: "/sti-appointments",
    RESULTS: "/test-results",
    TEMPLATES: "/test-results/templates",
    STATISTICS: {
      DASHBOARD: "/sti-test-processes/statistics/dashboard",
      PERIOD: "/sti-test-processes/statistics/period",
      PATIENT: (patientId: string) => `/sti-test-processes/statistics/patient/${patientId}`,
    },
    GET_ALL_PROCESSES: "/sti-test-processes/search",
    GET_PROCESS_BY_CODE: (testCode: string) => `/sti-test-processes/test-code/${testCode}`,
    GET_PROCESS_BY_PATIENT: (patientId: string) => `/sti-test-processes/patient/${patientId}`,
    UPDATE_PROCESS: (id: string) => `/sti-test-processes/${id}`,
    UPDATE_PROCESS_STATUS: (id: string) => `/sti-test-processes/${id}/status`,
    WORKFLOW_STEPS: "/sti-test-processes/workflow/steps",
    NEXT_WORKFLOW_STEPS: (status: string) => `/sti-test-processes/workflow/next-steps/${status}`,
    TRANSITION_STATUS: (id: string) => `/sti-test-processes/${id}/workflow/transition`,
    BOOKING_FROM_SERVICE_SELECTION: "/sti-test-processes/booking/from-service-selection",
    AVAILABLE_STI_SERVICES: "/sti-test-processes/services/available",
    STI_SERVICES_FROM_PACKAGE: (packageId: string) => `/sti-test-processes/services/package/${packageId}`,

    // Test Results specific endpoints
    CREATE_TEST_RESULT: "/test-results",
    GET_ALL_TEST_RESULTS: "/test-results",
    GET_TEST_RESULT_BY_APPOINTMENT: (appointmentId: string) => `/test-results/appointment/${appointmentId}`,
    GET_TEST_RESULT_BY_ID: (id: string) => `/test-results/${id}`,
    UPDATE_TEST_RESULT: (id: string) => `/test-results/${id}`,
    DELETE_TEST_RESULT: (id: string) => `/test-results/${id}`,
    SEND_NOTIFICATION: (id: string) => `/test-results/${id}/send-notification`,
    SEND_NOTIFICATION_BY_APPOINTMENT: (appointmentId: string) => `/test-results/appointment/${appointmentId}/send-notification`,
    MY_TEST_RESULTS: "/test-results/patient/my-results",
    MY_TEST_RESULT_DETAILS: (id: string) => `/test-results/patient/result/${id}`,
    EXPORT_PDF: (id: string) => `/test-results/${id}/export-pdf`,
    EXPORT_CONSULTATION_PDF: (appointmentId: string) => `/test-results/consultation/${appointmentId}/export-pdf`,
    EXPORT_STI_TEST_RESULT_PDF: (stiProcessId: string) => `/test-results/sti/${stiProcessId}/export-pdf`,
    GET_TEST_RESULTS_TEMPLATE: (serviceType: string) => `/test-results/templates/${serviceType}`,
    VALIDATE_TEST_RESULTS: "/test-results/validate",
    GENERATE_RECOMMENDATIONS: "/test-results/recommendations",
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
    GET_ALL: "/services",
    BY_ID: (id: string) => `/services/${id}`,
    BY_SLUG: (slug: string) => `/services/slug/${slug}`,
    STI: "/services/sti",
    ADD_IMAGE: "/services/image",
    REMOVE_IMAGE: "/services/image",
    SYNC_IMAGES: (id: string) => `/services/image/${id}`,
  },

  // Symptoms
  SYMPTOMS: {
    BASE: "/symptoms",
  },

  // User Dashboard
  USER_DASHBOARD: {
    OVERVIEW: "/user-dashboard/overview",
    CUSTOMERS: "/user-dashboard/customers",
    CONSULTANTS: "/user-dashboard/consultants",
    STATS_GENDER: "/user-dashboard/stats/gender",
    REGISTRATION_TREND: "/user-dashboard/stats/registration-trend",
  },

  // Revenue Stats
  REVENUE_STATS: {
    MONTHLY: "/revenue-stats/monthly",
    YEARLY: "/revenue-stats/yearly",
    REPORT: "/revenue-stats/report",
  },

  // Roles
  ROLES: {
    GET_ALL: "/roles",
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
