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
import {
  ConsultantProfile,
  ConsultantService,
  GetConsultantsQuery,
} from "@/services/consultant.service";
import { API_ENDPOINTS } from "@/config/api";
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { PaginationInfo } from "@/components/ui/pagination-info";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ConsultantManagementTable() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalConsultants, setTotalConsultants] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("");
  const [filterConsultationType, setFilterConsultationType] = useState<string>("");
  const [isAddConsultantDialogOpen, setIsAddConsultantDialogOpen] = useState(false);
  const [isViewConsultantDetailDialogOpen, setIsViewConsultantDetailDialogOpen] = useState(false);
  const [isUpdateWorkingHoursDialogOpen, setIsUpdateWorkingHoursDialogOpen] = useState(false);
  const [isEditConsultantDialogOpen, setIsEditConsultantDialogOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantProfile | null>(null);
  const [editConsultantData, setEditConsultantData] = useState<Partial<ConsultantProfile>>({});
  const [newConsultantData, setNewConsultantData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialties: "",
    qualification: "",
    experience: "",
    bio: "",
    cv: null as File | null,
    certificates: [] as File[],
  });

  const limit = API_FEATURES.PAGINATION.DEFAULT_LIMIT;

  const fetchConsultants = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: GetConsultantsQuery = {
        page: currentPage,
        limit: limit,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };

      if (searchQuery) {
        query.search = searchQuery;
      }
      if (filterStatus) {
        query.status = filterStatus as GetConsultantsQuery["status"];
      }
      if (filterSpecialty) {
        query.specialties = filterSpecialty;
      }
      if (filterConsultationType) {
        query.consultationTypes = filterConsultationType as GetConsultantsQuery["consultationTypes"];
      }

      const response = await ConsultantService.getAll(query);
      setConsultants(response.data);
      setTotalConsultants(response.total);
    } catch (err: any) {
      console.error("Error fetching consultants:", err);
      setError(err?.message || "Lỗi khi tải danh sách tư vấn viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, [currentPage, searchQuery, filterStatus, filterSpecialty, filterConsultationType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleApproveConsultant = async (id: string) => {
    try {
      await ConsultantService.approveConsultant(id);
      toast({
        title: "Thành công",
        description: "Hồ sơ tư vấn viên đã được phê duyệt.",
      });
      fetchConsultants();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể phê duyệt tư vấn viên: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleRejectConsultant = async (id: string, reason: string = "Không đủ tiêu chuẩn") => {
    try {
      await ConsultantService.rejectConsultant(id, reason);
      toast({
        title: "Thành công",
        description: "Hồ sơ tư vấn viên đã bị từ chối.",
      });
      fetchConsultants();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể từ chối tư vấn viên: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalConsultants / limit);

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

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push(-1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(-1);
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const handleAddConsultantClick = () => {
    setIsAddConsultantDialogOpen(true);
  };

  const handleViewConsultantDetailsClick = (consultant: ConsultantProfile) => {
    setSelectedConsultant(consultant);
    setIsViewConsultantDetailDialogOpen(true);
  };

  const handleEditConsultantClick = (consultant: ConsultantProfile) => {
    setSelectedConsultant(consultant);
    setEditConsultantData({
      specialties: consultant.specialties,
      qualification: consultant.qualification,
      experience: consultant.experience,
      bio: consultant.bio,
    });
    setIsEditConsultantDialogOpen(true);
  };

  const handleUpdateWorkingHoursClick = (consultant: ConsultantProfile) => {
    setSelectedConsultant(consultant);
    setIsUpdateWorkingHoursDialogOpen(true);
  };

  const handleCloseAddConsultantDialog = () => {
    setIsAddConsultantDialogOpen(false);
  };

  const handleCloseViewConsultantDetailDialog = () => {
    setIsViewConsultantDetailDialogOpen(false);
    setSelectedConsultant(null);
  };

  const handleCloseEditConsultantDialog = () => {
    setIsEditConsultantDialogOpen(false);
    setSelectedConsultant(null);
    setEditConsultantData({});
  };

  const handleCloseUpdateWorkingHoursDialog = () => {
    setIsUpdateWorkingHoursDialogOpen(false);
    setSelectedConsultant(null);
  };

  const handleConsultantAdded = () => {
    setIsAddConsultantDialogOpen(false);
    fetchConsultants();
    toast({
      title: "Thành công",
      description: "Tư vấn viên mới đã được thêm.",
    });
  };

  const handleUpdateConsultant = async () => {
    if (!selectedConsultant?.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID tư vấn viên để cập nhật.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: Partial<ConsultantProfile> = {};
      
      if (editConsultantData.specialties !== undefined) {
        payload.specialties = editConsultantData.specialties;
      }
      if (editConsultantData.qualification !== undefined) {
        payload.qualification = editConsultantData.qualification;
      }
      if (editConsultantData.experience !== undefined) {
        payload.experience = editConsultantData.experience;
      }
      if (editConsultantData.bio !== undefined) {
        payload.bio = editConsultantData.bio;
      }

      const response = await apiClient.patch<ConsultantProfile>(`/consultant-profiles/${selectedConsultant.id}`, payload);
      
      toast({
        title: "Thành công",
        description: "Hồ sơ tư vấn viên đã được cập nhật.",
      });
      handleCloseEditConsultantDialog();
      fetchConsultants();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật hồ sơ tư vấn viên: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddConsultant = async () => {
    try {
      // Basic validation
      if (
        !newConsultantData.firstName ||
        !newConsultantData.lastName ||
        !newConsultantData.email ||
        !newConsultantData.password
      ) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ Họ, Tên, Email và Mật khẩu.",
          variant: "destructive",
        });
        return;
      }
      if (!newConsultantData.specialties) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập chuyên môn.",
          variant: "destructive",
        });
        return;
      }
      if (!newConsultantData.qualification) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập bằng cấp.",
          variant: "destructive",
        });
        return;
      }
      if (!newConsultantData.experience) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập kinh nghiệm.",
          variant: "destructive",
        });
        return;
      }
      if (!newConsultantData.cv) {
        toast({
          title: "Lỗi",
          description: "Vui lòng tải lên CV.",
          variant: "destructive",
        });
        return;
      }
      if (newConsultantData.certificates.length === 0) {
        toast({
          title: "Lỗi",
          description: "Vui lòng tải lên ít nhất một chứng chỉ.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();

      // Append text data
      formData.append("firstName", newConsultantData.firstName);
      formData.append("lastName", newConsultantData.lastName);
      formData.append("email", newConsultantData.email);
      formData.append("password", newConsultantData.password);
      formData.append("qualification", newConsultantData.qualification);
      formData.append("experience", newConsultantData.experience);
      formData.append("bio", newConsultantData.bio);

      // Append specialties array
      const specialtiesArray = newConsultantData.specialties.split(',').map(s => s.trim());
      specialtiesArray.forEach(specialty => {
        formData.append('specialties', specialty);
      });


      // Append files
      if (newConsultantData.cv) {
        formData.append("cv", newConsultantData.cv);
      }
      newConsultantData.certificates.forEach((file) => {
        formData.append("certificates", file);
      });

      await apiClient.post(API_ENDPOINTS.CONSULTANTS.REGISTER, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Thành công",
        description: "Tư vấn viên mới đã được thêm.",
      });
      handleCloseAddConsultantDialog();
      fetchConsultants();
    } catch (err: any) {
      console.error("Lỗi khi thêm tư vấn viên:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        console.error("Error response headers:", err.response.headers);
      } else if (err.request) {
        console.error("Error request:", err.request);
      } else {
        console.error("Error message:", err.message);
      }
      toast({
        title: "Lỗi",
        description: `Không thể thêm tư vấn viên: ${
          err.response?.data?.message || err.message
        }`,
        variant: "destructive",
      });
    }
  };

  const handleWorkingHoursUpdated = () => {
    setIsUpdateWorkingHoursDialogOpen(false);
    fetchConsultants();
    toast({
      title: "Thành công",
      description: "Giờ làm việc của tư vấn viên đã được cập nhật.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Input
            placeholder="Tìm kiếm tư vấn viên..."
            className="w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="on_leave">Nghỉ phép</SelectItem>
              <SelectItem value="training">Đang đào tạo</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
              <SelectItem value="pending_approval">Chờ phê duyệt</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo chuyên môn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuyên môn</SelectItem>
              <SelectItem value="STIs">STIs</SelectItem>
              <SelectItem value="Nutrition">Dinh dưỡng</SelectItem>
              <SelectItem value="Mental Health">Sức khỏe tâm thần</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterConsultationType} onValueChange={setFilterConsultationType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo hình thức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hình thức</SelectItem>
              <SelectItem value="online">Trực tuyến</SelectItem>
              <SelectItem value="office">Tại văn phòng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddConsultantClick}>Thêm tư vấn viên</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải tư vấn viên...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : consultants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có tư vấn viên nào.</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Chuyên môn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultants.map((consultant) => (
                <TableRow key={consultant.id}>
                  <TableCell>{consultant.user?.firstName} {consultant.user?.lastName}</TableCell>
                  <TableCell>{consultant.user?.email}</TableCell>
                  <TableCell>
                    {consultant.specialties.slice(0, 2).join(", ")}
                    {consultant.specialties.length > 2 && ` +${consultant.specialties.length - 2}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={consultant.profileStatus === "active" ? "default" : "secondary"}>
                      {consultant.profileStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(consultant.createdAt), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewConsultantDetailsClick(consultant)}>
                        Chi tiết
                      </Button>
                      {consultant.profileStatus === "pending_approval" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleApproveConsultant(consultant.id)}>
                            Phê duyệt
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleRejectConsultant(consultant.id)}>
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleUpdateWorkingHoursClick(consultant)}>
                        Cập nhật giờ làm
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditConsultantClick(consultant)}>
                        Chỉnh sửa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <PaginationInfo
              totalItems={totalConsultants}
              itemsPerPage={limit}
              currentPage={currentPage}
              itemName="tư vấn viên"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={getPageNumbers()}
              hasNextPage={currentPage < totalPages}
              hasPreviousPage={currentPage > 1}
              onPageChange={handlePageChange}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
              onFirstPage={handleFirstPage}
              onLastPage={handleLastPage}
            />
          </div>
        </>
      )}

      {/* Add Consultant Dialog */}
      <Dialog open={isAddConsultantDialogOpen} onOpenChange={setIsAddConsultantDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm tư vấn viên mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo hồ sơ tư vấn viên mới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Họ
              </Label>
              <Input
                id="firstName"
                value={newConsultantData.firstName}
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, firstName: e.target.value }))}
                className="col-span-3"
                placeholder="Họ của tư vấn viên"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Tên
              </Label>
              <Input
                id="lastName"
                value={newConsultantData.lastName}
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, lastName: e.target.value }))}
                className="col-span-3"
                placeholder="Tên của tư vấn viên"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newConsultantData.email}
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
                placeholder="Email của tư vấn viên"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                value={newConsultantData.password}
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, password: e.target.value }))}
                className="col-span-3"
                placeholder="Mật khẩu"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 lg:col-span-2">
              <Label htmlFor="specialties" className="text-right">
                Chuyên môn
              </Label>
              <Input
                id="specialties"
                value={newConsultantData.specialties}
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, specialties: e.target.value }))}
                className="col-span-3"
                placeholder="Ví dụ: STIs, Dinh dưỡng (phân cách bằng dấu phẩy)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 lg:col-span-2">
              <Label htmlFor="qualification" className="text-right">
                Bằng cấp
              </Label>
              <Input
                id="qualification"
                value={newConsultantData.qualification}
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, qualification: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4 lg:col-span-2">
              <Label htmlFor="experience" className="text-right pt-2">
                Kinh nghiệm
              </Label>
              <Textarea
                id="experience"
                value={newConsultantData.experience}
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, experience: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4 lg:col-span-2">
              <Label htmlFor="bio" className="text-right pt-2">
                Tiểu sử
              </Label>
              <Textarea
                id="bio"
                value={newConsultantData.bio}
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, bio: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cv" className="text-right">
                CV (PDF, DOCX)
              </Label>
              <Input
                id="cv"
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, cv: e.target.files ? e.target.files[0] : null }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="certificates" className="text-right">
                Chứng chỉ (tối đa 5)
              </Label>
              <Input
                id="certificates"
                type="file"
                multiple
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setNewConsultantData((prev) => ({ ...prev, certificates: Array.from(e.target.files || []) }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddConsultantDialog}>Hủy</Button>
            <Button onClick={handleAddConsultant}>Thêm tư vấn viên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Consultant Detail Dialog */}
      <Dialog open={isViewConsultantDetailDialogOpen} onOpenChange={setIsViewConsultantDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết tư vấn viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của tư vấn viên.
            </DialogDescription>
          </DialogHeader>
          {selectedConsultant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">ID:</Label>
                <span className="md:col-span-3">{selectedConsultant.id}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Họ tên:</Label>
                <span className="md:col-span-3">{selectedConsultant.user?.firstName} {selectedConsultant.user?.lastName}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Email:</Label>
                <span className="md:col-span-3">{selectedConsultant.user?.email}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Chuyên môn:</Label>
                <span className="md:col-span-3">{selectedConsultant.specialties.join(", ")}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Bằng cấp:</Label>
                <span className="md:col-span-3">{selectedConsultant.qualification}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Kinh nghiệm:</Label>
                <span className="md:col-span-3">{selectedConsultant.experience}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Tiểu sử:</Label>
                <span className="md:col-span-3">{selectedConsultant.bio}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Trạng thái hồ sơ:</Label>
                <span className="md:col-span-3">
                  <Badge variant={selectedConsultant.profileStatus === "active" ? "default" : "secondary"}>
                    {selectedConsultant.profileStatus}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Ngày tạo:</Label>
                <span className="md:col-span-3">{format(new Date(selectedConsultant.createdAt), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="md:text-right">Cập nhật cuối:</Label>
                <span className="md:col-span-3">{format(new Date(selectedConsultant.updatedAt), "dd/MM/yyyy HH:mm")}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseViewConsultantDetailDialog}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Working Hours Dialog */}
      <Dialog open={isUpdateWorkingHoursDialogOpen} onOpenChange={setIsUpdateWorkingHoursDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật giờ làm</DialogTitle>
            <DialogDescription>
              Cập nhật giờ làm việc cho tư vấn viên {selectedConsultant?.user?.lastName}.
            </DialogDescription>
          </DialogHeader>
          {selectedConsultant && (
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground md:col-span-4">
                Vui lòng nhập giờ làm việc cho mỗi ngày trong tuần.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="mondayStartTime" className="md:text-right">
                  Thứ Hai (Bắt đầu)
                </Label>
                <Input id="mondayStartTime" type="time" defaultValue="09:00" className="md:col-span-3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="mondayEndTime" className="md:text-right">
                  Thứ Hai (Kết thúc)
                </Label>
                <Input id="mondayEndTime" type="time" defaultValue="17:00" className="md:col-span-3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="mondayMaxAppointments" className="md:text-right">
                  Số cuộc hẹn tối đa (Thứ Hai)
                </Label>
                <Input id="mondayMaxAppointments" type="number" defaultValue={1} className="md:col-span-3" />
              </div>
              <p className="text-sm text-muted-foreground md:col-span-4 mt-4">
                Lưu ý: Chức năng này sẽ tự động tạo lịch khả dụng cho 4 tuần tới.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseUpdateWorkingHoursDialog}>Hủy</Button>
            <Button onClick={handleWorkingHoursUpdated}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Consultant Dialog */}
      <Dialog open={isEditConsultantDialogOpen} onOpenChange={setIsEditConsultantDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hồ sơ tư vấn viên</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin hồ sơ tư vấn viên.
            </DialogDescription>
          </DialogHeader>
          {selectedConsultant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="specialties" className="md:text-right">
                  Chuyên môn
                </Label>
                <Input
                  id="specialties"
                  value={editConsultantData.specialties?.join(", ") || ""}
                  onChange={(e) => setEditConsultantData(prev => ({
                    ...prev,
                    specialties: e.target.value.split(",").map(s => s.trim()) as string[]
                  }))}
                  className="md:col-span-3"
                  placeholder="Ví dụ: STIs, Dinh dưỡng (phân cách bằng dấu phẩy)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="qualification" className="md:text-right">
                  Bằng cấp
                </Label>
                <Input
                  id="qualification"
                  value={editConsultantData.qualification || ""}
                  onChange={(e) => setEditConsultantData(prev => ({ ...prev, qualification: e.target.value }))}
                  className="md:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="experience" className="md:text-right">
                  Kinh nghiệm
                </Label>
                <Textarea
                  id="experience"
                  value={editConsultantData.experience || ""}
                  onChange={(e) => setEditConsultantData(prev => ({ ...prev, experience: e.target.value }))}
                  className="md:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="md:text-right">
                  Tiểu sử
                </Label>
                <Textarea
                  id="bio"
                  value={editConsultantData.bio || ""}
                  onChange={(e) => setEditConsultantData(prev => ({ ...prev, bio: e.target.value }))}
                  className="md:col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditConsultantDialog}>Hủy</Button>
            <Button onClick={handleUpdateConsultant}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
