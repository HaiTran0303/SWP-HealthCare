"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api"; // Import API_ENDPOINTS
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { PaymentService } from "@/services/payment.service"; // Assuming a payment service exists
import { Payment, PaymentGetAllParams } from "@/types/payment"; // Assuming a payment type definition exists
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Import Dialog components
import { Label } from "@/components/ui/label"; // Import Label

type PaymentStatusFilter = "completed" | "pending" | "failed" | "all";

const paymentStatusMap: Record<PaymentStatusFilter, string> = {
  completed: "Hoàn thành",
  pending: "Đang chờ",
  failed: "Thất bại",
  all: "Tất cả",
};

const appointmentStatusMap: Record<string, string> = {
  pending: "Đang chờ",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Đã hoàn thành",
  "checked_in": "Đã check-in",
  "no_show": "Không đến",
};

const appointmentLocationMap: Record<string, string> = {
  online: "Trực tuyến",
  office: "Tại phòng khám",
};

export default function PaymentManagementTable() {
  const { toast } = useToast(); // Initialize useToast
  const [allPayments, setAllPayments] = useState<Payment[]>([]); // Store all fetched payments
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]); // Payments after client-side filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<PaymentStatusFilter>("all");
  const [isViewPaymentDetailDialogOpen, setIsViewPaymentDetailDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Effect to fetch all payments initially
  useEffect(() => {
    const fetchAllPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all payments without filters for client-side processing
        const response = await PaymentService.getAll({ page: 1, pageSize: 1000 }); // Fetch a large enough set or implement infinite scroll/proper backend pagination
        setAllPayments(Array.isArray(response) ? response : []);
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Lỗi khi tải danh sách thanh toán");
        setLoading(false);
      }
    };
    fetchAllPayments();
  }, []); // Empty dependency array to run only once on mount

  // Effect to apply client-side filtering and pagination
  useEffect(() => {
    let currentFiltered = allPayments;

    // Apply search term filter
    if (searchTerm) {
      currentFiltered = currentFiltered.filter(
        (payment) =>
          payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      currentFiltered = currentFiltered.filter(
        (payment) => payment.status === filterStatus
      );
    }

    // Apply pagination
    const totalFilteredItems = currentFiltered.length;
    const newTotalPages = Math.ceil(totalFilteredItems / pageSize);
    setTotalPages(newTotalPages > 0 ? newTotalPages : 1);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredPayments(currentFiltered.slice(startIndex, endIndex));

  }, [allPayments, searchTerm, filterStatus, currentPage, pageSize]);


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value as PaymentStatusFilter);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset to first page on page size change
  };

  const handleViewPaymentDetailsClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewPaymentDetailDialogOpen(true);
  };

  const handleCloseViewPaymentDetailDialog = () => {
    setIsViewPaymentDetailDialogOpen(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return <div className="text-center">Đang tải thanh toán...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Lỗi: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          placeholder="Tìm kiếm theo ID hoặc tên người dùng..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Select value={filterStatus || "all"} onValueChange={(value) => handleStatusFilterChange(value as PaymentStatusFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{paymentStatusMap.all}</SelectItem>
            <SelectItem value="completed">{paymentStatusMap.completed}</SelectItem>
            <SelectItem value="pending">{paymentStatusMap.pending}</SelectItem>
            <SelectItem value="failed">{paymentStatusMap.failed}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Thanh toán</TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Dịch vụ</TableHead> {/* Changed from Phương thức */}
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPayments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Không tìm thấy thanh toán nào.
              </TableCell>
            </TableRow>
          ) : (
            filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{`${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`}</TableCell> {/* Display full user name */}
                <TableCell>{parseFloat(payment.amount).toLocaleString()}đ</TableCell> {/* Parsed amount */}
                <TableCell>{payment.servicePackage?.name || payment.service?.name || 'Tư vấn trực tuyến'}</TableCell> {/* Display service name, default to 'Tư vấn trực tuyến' */}
                <TableCell>{paymentStatusMap[payment.status] || payment.status}</TableCell>
                <TableCell>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Không có'}</TableCell> {/* Used paymentDate */}
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewPaymentDetailsClick(payment)}>
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={Array.from({ length: totalPages }, (_, i) => i + 1)} // Simple page numbers for now
        hasNextPage={currentPage < totalPages}
        hasPreviousPage={currentPage > 1}
        onPageChange={handlePageChange}
        onNextPage={() => handlePageChange(currentPage + 1)}
        onPreviousPage={() => handlePageChange(currentPage - 1)}
        onFirstPage={() => handlePageChange(1)}
        onLastPage={() => handlePageChange(totalPages)}
      />

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Hiển thị {filteredPayments.length} trên tổng số {allPayments.length} thanh toán.
        </div>
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Kích thước trang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Payment Detail Dialog */}
      <Dialog open={isViewPaymentDetailDialogOpen} onOpenChange={setIsViewPaymentDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Thanh toán</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của giao dịch thanh toán.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="max-h-[700px] overflow-y-auto p-4 border rounded-md grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID Thanh toán:</Label>
                <span className="col-span-3">{selectedPayment.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Người dùng:</Label>
                <span className="col-span-3">{`${selectedPayment.user?.firstName || ''} ${selectedPayment.user?.lastName || ''}`}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email người dùng:</Label>
                <span className="col-span-3">{selectedPayment.user?.email || 'Không có'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Số tiền:</Label>
                <span className="col-span-3">{parseFloat(selectedPayment.amount).toLocaleString()}đ {selectedPayment.currency}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phương thức thanh toán:</Label>
                <span className="col-span-3">{selectedPayment.paymentMethod || 'Không có'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Trạng thái:</Label>
                <span className="col-span-3">{paymentStatusMap[selectedPayment.status] || selectedPayment.status}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ngày thanh toán:</Label>
                <span className="col-span-3">{selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleString() : 'Không có'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID Giao dịch:</Label>
                <span className="col-span-3">{selectedPayment.transactionId || 'Không có'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Gói dịch vụ:</Label>
                <span className="col-span-3">{selectedPayment.servicePackage?.name || 'Không có'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Dịch vụ:</Label>
                <span className="col-span-3">{selectedPayment.service?.name || 'Không có'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Số hóa đơn:</Label>
                <span className="col-span-3">{selectedPayment.invoiceNumber || 'Không có'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Đã hoàn tiền:</Label>
                <span className="col-span-3">{selectedPayment.refunded ? 'Có' : 'Không'}</span>
              </div>
              {selectedPayment.refunded && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Số tiền hoàn:</Label>
                    <span className="col-span-3">{parseFloat(selectedPayment.refundAmount || '0').toLocaleString()}đ</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Lý do hoàn tiền:</Label>
                    <span className="col-span-3">{selectedPayment.refundReason || 'Không có'}</span>
                  </div>
                </>
              )}
              {selectedPayment.gatewayResponse && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Trạng thái cổng TT:</Label>
                    <span className="col-span-3">{selectedPayment.gatewayResponse.status || 'Không có'}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Mã QR:</Label>
                    <span className="col-span-3 break-all text-xs">{selectedPayment.gatewayResponse.qrCode || 'Không có'}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">URL Thanh toán:</Label>
                    <a href={selectedPayment.gatewayResponse.checkoutUrl} target="_blank" rel="noopener noreferrer" className="col-span-3 text-blue-600 hover:underline break-all text-xs">
                      {selectedPayment.gatewayResponse.checkoutUrl || 'Không có'}
                    </a>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tên tài khoản:</Label>
                    <span className="col-span-3">{selectedPayment.gatewayResponse.accountName || 'Không có'}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Số tài khoản:</Label>
                    <span className="col-span-3">{selectedPayment.gatewayResponse.accountNumber || 'Không có'}</span>
                  </div>
                </>
              )}
              {selectedPayment.appointment && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ID Cuộc hẹn:</Label>
                    <span className="col-span-3">{selectedPayment.appointment.id || 'Không có'}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Ngày cuộc hẹn:</Label>
                    <span className="col-span-3">{selectedPayment.appointment.appointmentDate ? new Date(selectedPayment.appointment.appointmentDate).toLocaleString() : 'Không có'}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Trạng thái cuộc hẹn:</Label>
                    <span className="col-span-3">{appointmentStatusMap[selectedPayment.appointment.status] || selectedPayment.appointment.status || 'Không có'}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Địa điểm cuộc hẹn:</Label>
                    <span className="col-span-3">{appointmentLocationMap[selectedPayment.appointment.appointmentLocation] || selectedPayment.appointment.appointmentLocation || 'Không có'}</span>
                  </div>
                </>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ngày tạo:</Label>
                <span className="col-span-3">{selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'Không có'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Cập nhật cuối:</Label>
                <span className="col-span-3">{selectedPayment.updatedAt ? new Date(selectedPayment.updatedAt).toLocaleString() : 'Không có'}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseViewPaymentDetailDialog}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
