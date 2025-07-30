export interface User { // Define User interface based on sample
  id: string;
  email: string;
  googleId: string | null;
  firstName: string;
  lastName: string;
  slug: string;
  dateOfBirth: string | null;
  gender: string;
  phone: string;
  address: string | null;
  profilePicture: string | null;
  isActive: boolean;
  accountLockedUntil: string | null;
  loginAttempts: number;
  emailVerified: boolean;
  emailVerificationExpires: string;
  phoneVerified: boolean;
  passwordResetExpires: string | null;
  lastLogin: string | null;
  locale: string;
  notificationPreferences: {
    sms: boolean;
    push: boolean;
    email: boolean;
  };
  healthDataConsent: boolean;
  deletedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: { // Assuming role is an object
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

export interface ServicePackage { // Define ServicePackage interface
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: string;
  durationMonths: number;
  isActive: boolean;
  maxServicesPerMonth: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string; // This might be redundant if user object is available
  amount: string; // Changed to string to match API response
  currency: string;
  paymentMethod: string; // Changed from 'method' to 'paymentMethod'
  status: "completed" | "pending" | "failed";
  paymentDate: string | null; // Changed to string | null based on sample
  transactionId?: string;
  gatewayResponse?: { // Added gatewayResponse based on sample
    bin?: string;
    amount?: number;
    qrCode?: string;
    status?: string;
    currency?: string;
    orderCode?: number;
    accountName?: string;
    checkoutUrl?: string;
    description?: string;
    accountNumber?: string;
    paymentLinkId?: string;
    frontendCancelUrl?: string;
    frontendReturnUrl?: string;
  };
  refunded: boolean; // Added based on sample
  refundAmount: string; // Added based on sample
  refundReason: string | null; // Added based on sample
  invoiceNumber: string; // Added based on sample
  createdAt: string; // Added based on sample
  updatedAt: string; // Added based on sample
  deletedAt: string | null; // Added based on sample
  user?: User; // Added User interface
  servicePackage?: ServicePackage; // Added ServicePackage interface
  service?: ServicePackage; // Assuming service has similar structure to ServicePackage, or adjust if different
  appointment?: Appointment; // Added Appointment interface based on sample
}

export interface PaymentListResponse {
  data: Payment[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaymentGetAllParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: "completed" | "pending" | "failed";
}
