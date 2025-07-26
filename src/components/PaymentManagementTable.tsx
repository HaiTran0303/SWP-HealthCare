"use client";

import { useState, useEffect } from "react";
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

type PaymentStatusFilter = "completed" | "pending" | "failed" | "all";

export default function PaymentManagementTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<PaymentStatusFilter>("all");

  useEffect(() => {
    fetchPayments();
  }, [currentPage, pageSize, searchTerm, filterStatus]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      // This is a placeholder. You'll need to implement PaymentService.getAll
      // with pagination, search, and filter capabilities.
      const response = await PaymentService.getAll({
        page: currentPage,
        pageSize,
        searchTerm,
        status: filterStatus === "all" ? undefined : filterStatus,
      });
      setPayments(response.data);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

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
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Thanh toán</TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Không tìm thấy thanh toán nào.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{payment.userName}</TableCell>
                <TableCell>{payment.amount.toLocaleString()}đ</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
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
          Hiển thị {payments.length} trên tổng số {payments.length} thanh toán.
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
    </div>
  );
}
