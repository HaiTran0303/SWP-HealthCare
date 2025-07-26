export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  method: string;
  status: "completed" | "pending" | "failed";
  date: string; // ISO date string
  transactionId?: string;
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
