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
  paymentDate: string; // Changed from 'date' to 'paymentDate'
  transactionId?: string;
  user?: User; // Added User interface
  servicePackage?: ServicePackage; // Added ServicePackage interface
  service?: ServicePackage; // Assuming service has similar structure to ServicePackage, or adjust if different
  // Add any other relevant payment fields
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
