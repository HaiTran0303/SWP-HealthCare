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
  StiTestProcess,
  STITestingService,
  TestFilters,
  TestStatus,
  SampleType,
  Priority,
} from "@/services/sti-testing.service";
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function StiTestManagementTable() {
  const { toast } = useToast();
  const [tests, setTests] = useState<StiTestProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalTests, setTotalTests] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // For testCode, patient name/email
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSampleType, setFilterSampleType] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterPatientId, setFilterPatientId] = useState<string>(""); // Need to fetch patient list
  const [filterConsultantId, setFilterConsultantId] = useState<string>(""); // Need to fetch consultant list

  const limit = API_FEATURES.PAGINATION.DEFAULT_LIMIT;

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: TestFilters = {
        page: currentPage,
        limit: limit,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };

      if (searchQuery) {
        filters.testCode = searchQuery;
        // Assuming search by patient name/email would be handled by backend or a separate filter
      }
      if (filterStatus) {
        filters.status = filterStatus as TestStatus;
      }
      if (filterSampleType) {
        filters.sampleType = filterSampleType as SampleType;
      }
      if (filterPriority) {
        filters.priority = filterPriority as Priority;
      }
      if (filterPatientId) {
        filters.patientId = filterPatientId;
      }
      if (filterConsultantId) {
        filters.consultantDoctorId = filterConsultantId;
      }

      const response = await STITestingService.getAllTests(filters);
      setTests(response.data);
      setTotalTests(response.total);
    } catch (err: any) {
      console.error("Error fetching STI tests:", err);
      setError(err?.message || "Lỗi khi tải danh sách xét nghiệm STI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [currentPage, searchQuery, filterStatus, filterSampleType, filterPriority, filterPatientId, filterConsultantId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpdateStatus = async (id: string, newStatus: TestStatus) => {
    try {
      await STITestingService.updateTestStatus(id, newStatus);
      toast({
        title: "Thành công",
        description: `Trạng thái xét nghiệm đã được cập nhật thành ${STITestingService.getStatusText(newStatus)}`,
      });
      fetchTests();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật trạng thái xét nghiệm: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalTests / limit);
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
            placeholder="Tìm kiếm mã xét nghiệm..."
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
              <SelectItem value="ordered">Đã đặt lịch</SelectItem>
              <SelectItem value="sample_collection_scheduled">Lên lịch lấy mẫu</SelectItem>
              <SelectItem value="sample_collected">Đã lấy mẫu</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="result_ready">Có kết quả</SelectItem>
              <SelectItem value="result_delivered">Đã gửi kết quả</SelectItem>
              <SelectItem value="consultation_required">Yêu cầu tư vấn</SelectItem>
              <SelectItem value="follow_up_scheduled">Lên lịch tái khám</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSampleType} onValueChange={setFilterSampleType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo loại mẫu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả loại mẫu</SelectItem>
              <SelectItem value="blood">Máu</SelectItem>
              <SelectItem value="urine">Nước tiểu</SelectItem>
              <SelectItem value="swab">Dịch phết</SelectItem>
              <SelectItem value="saliva">Nước bọt</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo độ ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả ưu tiên</SelectItem>
              <SelectItem value="normal">Bình thường</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
              <SelectItem value="urgent">Khẩn cấp</SelectItem>
            </SelectContent>
          </Select>
          {/* Add Select for Patient and Consultant if you have a list of them */}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải xét nghiệm STI...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : tests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có xét nghiệm STI nào.</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã xét nghiệm</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Loại mẫu</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.testCode}</TableCell>
                  <TableCell>{test.patient?.firstName} {test.patient?.lastName || "N/A"}</TableCell>
                  <TableCell>{test.service?.name || "N/A"}</TableCell>
                  <TableCell>{test.sampleType}</TableCell>
                  <TableCell>{test.priority}</TableCell>
                  <TableCell>
                    <Badge style={{ backgroundColor: STITestingService.getStatusColor(test.status) }}>
                      {STITestingService.getStatusText(test.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(test.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Chi tiết
                      </Button>
                      {test.status !== "completed" && test.status !== "cancelled" && (
                        <Select onValueChange={(value: TestStatus) => handleUpdateStatus(test.id, value)}>
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue placeholder="Cập nhật TT" />
                          </SelectTrigger>
                          <SelectContent>
                            {STITestingService.canTransitionTo(test.status, "sample_collection_scheduled") && (
                              <SelectItem value="sample_collection_scheduled">Lên lịch lấy mẫu</SelectItem>
                            )}
                            {STITestingService.canTransitionTo(test.status, "sample_collected") && (
                              <SelectItem value="sample_collected">Đã lấy mẫu</SelectItem>
                            )}
                            {STITestingService.canTransitionTo(test.status, "processing") && (
                              <SelectItem value="processing">Đang xử lý</SelectItem>
                            )}
                            {STITestingService.canTransitionTo(test.status, "result_ready") && (
                              <SelectItem value="result_ready">Có kết quả</SelectItem>
                            )}
                            {STITestingService.canTransitionTo(test.status, "result_delivered") && (
                              <SelectItem value="result_delivered">Đã gửi kết quả</SelectItem>
                            )}
                            {STITestingService.canTransitionTo(test.status, "consultation_required") && (
                              <SelectItem value="consultation_required">Yêu cầu tư vấn</SelectItem>
                            )}
                            {STITestingService.canTransitionTo(test.status, "follow_up_scheduled") && (
                              <SelectItem value="follow_up_scheduled">Lên lịch tái khám</SelectItem>
                            )}
                            {STITestingService.canTransitionTo(test.status, "completed") && (
                              <SelectItem value="completed">Hoàn thành</SelectItem>
                            )}
                            {STITestingService.canTransitionTo(test.status, "cancelled") && (
                              <SelectItem value="cancelled">Hủy</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
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
