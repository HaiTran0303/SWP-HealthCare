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
              <SelectItem value="">Tất cả trạng thái</SelectItem>
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
              <SelectItem value="">Tất cả chuyên môn</SelectItem>
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
              <SelectItem value="">Tất cả hình thức</SelectItem>
              <SelectItem value="online">Trực tuyến</SelectItem>
              <SelectItem value="office">Tại văn phòng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>Thêm tư vấn viên</Button>
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
                      <Button variant="ghost" size="sm">
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
                      <Button variant="outline" size="sm">
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
    </div>
  );
}
