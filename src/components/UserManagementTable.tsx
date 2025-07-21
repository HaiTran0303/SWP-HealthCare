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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserService, GetUsersQuery } from "@/services/user.service";
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";

export default function UserManagementTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // "active", "inactive", ""

  const limit = API_FEATURES.PAGINATION.DEFAULT_LIMIT;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: GetUsersQuery = {
        page: currentPage,
        limit: limit,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };

      if (searchQuery) {
        // Assuming backend supports searching by email or name for simplicity
        // In a real app, you might need separate fields or a more robust search API
        query.email = searchQuery;
        query.firstName = searchQuery;
        query.lastName = searchQuery;
      }
      if (filterRole && filterRole !== "all") {
        query.roleId = filterRole;
      }
      if (filterStatus && filterStatus !== "all") {
        query.isActive = filterStatus === "active" ? true : false;
      }

      const response = await UserService.getAllUsers(query);
      setUsers(response.data);
      setTotalUsers(response.total);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err?.message || "Lỗi khi tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, filterRole, filterStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      await UserService.toggleUserActiveStatus(id);
      toast({
        title: "Thành công",
        description: `Người dùng đã được ${currentStatus ? "vô hiệu hóa" : "kích hoạt"}`,
      });
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể thay đổi trạng thái người dùng: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleVerifyEmail = async (id: string) => {
    try {
      await UserService.verifyUserEmail(id);
      toast({
        title: "Thành công",
        description: "Email người dùng đã được xác minh.",
      });
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể xác minh email: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalUsers / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Input
            placeholder="Tìm kiếm người dùng..."
            className="w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="customer">Khách hàng</SelectItem>
              <SelectItem value="consultant">Tư vấn viên</SelectItem>
              <SelectItem value="staff">Nhân viên</SelectItem>
              <SelectItem value="manager">Quản lý</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>Thêm người dùng</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải người dùng...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có người dùng nào.</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>{user.role?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Chỉnh sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActiveStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      </Button>
                      {/* Assuming API has emailVerified status or similar to show this button */}
                      {/* {!user.emailVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyEmail(user.id)}
                        >
                          Xác minh Email
                        </Button>
                      )} */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onFirstPage={handleFirstPage}
            onLastPage={handleLastPage}
          />
        </>
      )}
    </div>
  );
}
