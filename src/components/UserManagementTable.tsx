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
import { User, UserService, GetUsersQuery, Role } from "@/services/user.service"; // Import Role
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label"; // Ensure Label is imported

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
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isViewUserDetailDialogOpen, setIsViewUserDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]); // State to store roles

  // State for new user form
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    gender: "",
    roleId: "", // Assuming roleId is used for creation
  });

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
    const fetchRoles = async () => {
      try {
        const fetchedRoles = await UserService.getAllRoles();
        setRoles(fetchedRoles);
      } catch (err) {
        console.error("Error fetching roles:", err);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách vai trò.",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
    fetchRoles();
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

  const handleAddUserClick = () => {
    setIsAddUserDialogOpen(true);
  };

  const handleCloseAddUserDialog = () => {
    setIsAddUserDialogOpen(false);
    setNewUserData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      gender: "",
      roleId: "",
    });
  };

  const handleViewUserDetailsClick = (user: User) => {
    setSelectedUser(user);
    setIsViewUserDetailDialogOpen(true);
  };

  const handleCloseViewUserDetailDialog = () => {
    setIsViewUserDetailDialogOpen(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setNewUserData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleCreateUser = async () => {
    // Basic validation for required fields
    if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password || !newUserData.roleId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ các trường bắt buộc (Họ, Tên, Email, Mật khẩu, Vai trò).",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        password: newUserData.password,
        roleId: newUserData.roleId,
        phone: newUserData.phone || undefined,
        gender: newUserData.gender || undefined, // Include gender if it has a value
        address: newUserData.address || undefined, // Include address if it has a value
      };

      console.log("Payload being sent to createUser:", payload); // Add this log

      await UserService.createUser(payload);
      toast({
        title: "Thành công",
        description: "Người dùng mới đã được thêm.",
      });
      handleCloseAddUserDialog(); // Close dialog and reset form
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể thêm người dùng: ${err.message}`,
        variant: "destructive",
      });
    }
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
        <Button onClick={handleAddUserClick}>Thêm người dùng</Button>
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
                      <Button variant="ghost" size="sm" onClick={() => handleViewUserDetailsClick(user)}>
                        Xem chi tiết
                      </Button>
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

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo tài khoản người dùng mới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Họ
              </Label>
              <Input id="firstName" value={newUserData.firstName} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Tên
              </Label>
              <Input id="lastName" value={newUserData.lastName} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" value={newUserData.email} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mật khẩu
              </Label>
              <Input id="password" type="password" value={newUserData.password} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Số điện thoại
              </Label>
              <Input id="phone" value={newUserData.phone} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Địa chỉ
              </Label>
              <Input id="address" value={newUserData.address} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Giới tính
              </Label>
              <Select value={newUserData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Nam</SelectItem>
                  <SelectItem value="F">Nữ</SelectItem>
                  <SelectItem value="Other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleId" className="text-right">
                Vai trò
              </Label>
              <Select value={newUserData.roleId} onValueChange={(value) => handleSelectChange("roleId", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddUserDialog}>Hủy</Button>
            <Button onClick={handleCreateUser}>Thêm người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Detail Dialog */}
      <Dialog open={isViewUserDetailDialogOpen} onOpenChange={setIsViewUserDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của người dùng.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID:</Label>
                <span className="col-span-3">{selectedUser.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Họ tên:</Label>
                <span className="col-span-3">{selectedUser.firstName} {selectedUser.lastName}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email:</Label>
                <span className="col-span-3">{selectedUser.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Số điện thoại:</Label>
                <span className="col-span-3">{selectedUser.phone || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Địa chỉ:</Label>
                <span className="col-span-3">{selectedUser.address || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Giới tính:</Label>
                <span className="col-span-3">{selectedUser.gender || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ngày sinh:</Label>
                <span className="col-span-3">{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Vai trò:</Label>
                <span className="col-span-3">{selectedUser.role?.name || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Trạng thái:</Label>
                <span className="col-span-3">
                  <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                    {selectedUser.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseViewUserDetailDialog}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
