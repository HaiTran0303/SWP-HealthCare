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
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
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
import { Label } from "@/components/ui/label"; // Ensure Label is imported
import { Textarea } from "@/components/ui/textarea"; // For bio/experience

export default function ConsultantManagementTable() {
  const { toast } = useToast();
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalConsultants, setTotalConsultants] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // For consultant name
  const [filterStatus, setFilterStatus] = useState<string>(""); // For profileStatus
  const [filterSpecialty, setFilterSpecialty] = useState<string>(""); // For specialties
  const [filterConsultationType, setFilterConsultationType] = useState<string>(""); // For consultationTypes
  const [isAddConsultantDialogOpen, setIsAddConsultantDialogOpen] = useState(false);
  const [isViewConsultantDetailDialogOpen, setIsViewConsultantDetailDialogOpen] = useState(false);
  const [isUpdateWorkingHoursDialogOpen, setIsUpdateWorkingHoursDialogOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantProfile | null>(null);


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
        query.search = searchQuery; // Assuming backend search includes name
      }
      if (filterStatus) {
        query.status = filterStatus as GetConsultantsQuery["status"];
      }
      if (filterSpecialty) {
        query.specialties = filterSpecialty; // Assuming backend accepts single specialty string
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

  const handleAddConsultantClick = () => {
    setIsAddConsultantDialogOpen(true);
  };

  const handleViewConsultantDetailsClick = (consultant: ConsultantProfile) => {
    setSelectedConsultant(consultant);
    setIsViewConsultantDetailDialogOpen(true);
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

  const handleCloseUpdateWorkingHoursDialog = () => {
    setIsUpdateWorkingHoursDialogOpen(false);
    setSelectedConsultant(null);
  };

  const handleConsultantAdded = () => {
    setIsAddConsultantDialogOpen(false);
    fetchConsultants(); // Refresh consultant list
    toast({
      title: "Thành công",
      description: "Tư vấn viên mới đã được thêm.",
    });
  };

  const handleWorkingHoursUpdated = () => {
    setIsUpdateWorkingHoursDialogOpen(false);
    fetchConsultants(); // Refresh consultant list
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
              {/* Add more specialties as needed from your data */}
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
                <TableHead>Phí tư vấn</TableHead>
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
                  <TableCell>{consultant.consultationFee.toLocaleString()}đ</TableCell>
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

      {/* Add Consultant Dialog */}
      <Dialog open={isAddConsultantDialogOpen} onOpenChange={setIsAddConsultantDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm tư vấn viên mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo hồ sơ tư vấn viên mới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userId" className="text-right">
                ID Người dùng
              </Label>
              <Input id="userId" defaultValue="" className="col-span-3" placeholder="ID của người dùng hiện có" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialties" className="text-right">
                Chuyên môn
              </Label>
              <Input id="specialties" defaultValue="" className="col-span-3" placeholder="Ví dụ: STIs, Dinh dưỡng (phân cách bằng dấu phẩy)" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="qualification" className="text-right">
                Bằng cấp
              </Label>
              <Input id="qualification" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right">
                Kinh nghiệm
              </Label>
              <Textarea id="experience" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Tiểu sử
              </Label>
              <Textarea id="bio" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="consultationFee" className="text-right">
                Phí tư vấn
              </Label>
              <Input id="consultationFee" type="number" defaultValue={0} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="consultationFeeType" className="text-right">
                Loại phí
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn loại phí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Theo giờ</SelectItem>
                  <SelectItem value="per_session">Theo phiên</SelectItem>
                  <SelectItem value="per_service">Theo dịch vụ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionDurationMinutes" className="text-right">
                Thời lượng phiên (phút)
              </Label>
              <Input id="sessionDurationMinutes" type="number" defaultValue={60} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profileStatus" className="text-right">
                Trạng thái hồ sơ
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="on_leave">Nghỉ phép</SelectItem>
                  <SelectItem value="training">Đang đào tạo</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="pending_approval">Chờ phê duyệt</SelectItem>
                  <SelectItem value="rejected">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="languages" className="text-right">
                Ngôn ngữ
              </Label>
              <Input id="languages" defaultValue="tiếng Việt" className="col-span-3" placeholder="Ví dụ: tiếng Việt, English (phân cách bằng dấu phẩy)" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="consultationTypes" className="text-right">
                Hình thức tư vấn
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Trực tuyến</SelectItem>
                  <SelectItem value="office">Tại văn phòng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddConsultantDialog}>Hủy</Button>
            <Button onClick={handleConsultantAdded}>Thêm tư vấn viên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Consultant Detail Dialog */}
      <Dialog open={isViewConsultantDetailDialogOpen} onOpenChange={setIsViewConsultantDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết tư vấn viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của tư vấn viên.
            </DialogDescription>
          </DialogHeader>
          {selectedConsultant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID:</Label>
                <span className="col-span-3">{selectedConsultant.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Họ tên:</Label>
                <span className="col-span-3">{selectedConsultant.user?.firstName} {selectedConsultant.user?.lastName}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email:</Label>
                <span className="col-span-3">{selectedConsultant.user?.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Chuyên môn:</Label>
                <span className="col-span-3">{selectedConsultant.specialties.join(", ")}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Bằng cấp:</Label>
                <span className="col-span-3">{selectedConsultant.qualification}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Kinh nghiệm:</Label>
                <span className="col-span-3">{selectedConsultant.experience}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tiểu sử:</Label>
                <span className="col-span-3">{selectedConsultant.bio}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phí tư vấn:</Label>
                <span className="col-span-3">{selectedConsultant.consultationFee.toLocaleString()}đ ({selectedConsultant.consultationFeeType})</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Thời lượng phiên:</Label>
                <span className="col-span-3">{selectedConsultant.sessionDurationMinutes} phút</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Trạng thái hồ sơ:</Label>
                <span className="col-span-3">
                  <Badge variant={selectedConsultant.profileStatus === "active" ? "default" : "secondary"}>
                    {selectedConsultant.profileStatus}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ngôn ngữ:</Label>
                <span className="col-span-3">{selectedConsultant.languages.join(", ")}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Hình thức tư vấn:</Label>
                <span className="col-span-3">{selectedConsultant.consultationTypes.join(", ")}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ngày tạo:</Label>
                <span className="col-span-3">{format(new Date(selectedConsultant.createdAt), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Cập nhật cuối:</Label>
                <span className="col-span-3">{format(new Date(selectedConsultant.updatedAt), "dd/MM/yyyy HH:mm")}</span>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cập nhật giờ làm</DialogTitle>
            <DialogDescription>
              Cập nhật giờ làm việc cho tư vấn viên {selectedConsultant?.user?.lastName}.
            </DialogDescription>
          </DialogHeader>
          {selectedConsultant && (
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground col-span-4">
                Vui lòng nhập giờ làm việc cho mỗi ngày trong tuần.
              </p>
              {/* Example for Monday, repeat for other days */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mondayStartTime" className="text-right">
                  Thứ Hai (Bắt đầu)
                </Label>
                <Input id="mondayStartTime" type="time" defaultValue="09:00" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mondayEndTime" className="text-right">
                  Thứ Hai (Kết thúc)
                </Label>
                <Input id="mondayEndTime" type="time" defaultValue="17:00" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mondayMaxAppointments" className="text-right">
                  Số cuộc hẹn tối đa (Thứ Hai)
                </Label>
                <Input id="mondayMaxAppointments" type="number" defaultValue={1} className="col-span-3" />
              </div>
              {/* Add similar inputs for Tuesday, Wednesday, etc. */}
              <p className="text-sm text-muted-foreground col-span-4 mt-4">
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
    </div>
  );
}
