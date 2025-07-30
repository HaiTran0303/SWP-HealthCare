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
import { RefreshCcw, Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import DatePickerWithRange from "@/components/ui/date-picker-with-range";
import {
  StiProcess as StiTestProcess,
  STITestingService,
  TestFilters,
  TestStatus,
  SampleType,
  Priority,
} from "@/services/sti-testing.service";
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { PaginationInfo } from "@/components/ui/pagination-info";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StiProcessDetail from "@/components/StiProcessDetail";

export default function StiTestManagementTable() {
  const { toast } = useToast();
  const [tests, setTests] = useState<StiTestProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<StiTestProcess | null>(null);
  const [totalTests, setTotalTests] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // For testCode, patient name/email
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSampleType, setFilterSampleType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterPatientId, setFilterPatientId] = useState<string>(""); // Need to fetch patient list
  const [filterConsultantId, setFilterConsultantId] = useState<string>(""); // Need to fetch consultant list
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined); // New state for date range filter
  const [filterRequiresConsultation, setFilterRequiresConsultation] = useState<string>("all");
  const [filterPatientNotified, setFilterPatientNotified] = useState<string>("all");
  const [filterHasResults, setFilterHasResults] = useState<string>("all");

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
      if (filterStatus && filterStatus !== "all") {
        filters.status = filterStatus as TestStatus;
      }
      if (filterSampleType && filterSampleType !== "all") {
        filters.sampleType = filterSampleType as SampleType;
      }
      if (filterPriority && filterPriority !== "all") {
        filters.priority = filterPriority as Priority;
      }
      if (filterPatientId && filterPatientId !== "all") {
        filters.patientId = filterPatientId;
      }
      if (filterConsultantId && filterConsultantId !== "all") {
        filters.consultantDoctorId = filterConsultantId;
      }
      if (dateRange?.from) {
        filters.startDate = format(dateRange.from, "yyyy-MM-dd");
      }
      if (dateRange?.to) {
        filters.endDate = format(dateRange.to, "yyyy-MM-dd");
      }
      if (filterRequiresConsultation !== "all") {
        filters.requiresConsultation = filterRequiresConsultation === "true";
      }
      if (filterPatientNotified !== "all") {
        filters.patientNotified = filterPatientNotified === "true";
      }
      if (filterHasResults !== "all") {
        filters.hasResults = filterHasResults === "true";
      }

      const response = await STITestingService.getAllTests(filters);
      setTests(response.data);
      setTotalTests(response.meta.totalItems);
    } catch (err: any) {
      console.error("Error fetching STI tests:", err);
      setError(err.message || "Lỗi khi tải danh sách xét nghiệm STI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [currentPage, searchQuery, filterStatus, filterSampleType, filterPriority, filterPatientId, filterConsultantId, dateRange, filterRequiresConsultation, filterPatientNotified, filterHasResults]);

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

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Tìm kiếm mã xét nghiệm..."
            className="w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={fetchTests}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Tải lại
          </Button>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <div className="flex flex-wrap gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
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
                <SelectItem value="all">Tất cả loại mẫu</SelectItem>
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
                <SelectItem value="all">Tất cả ưu tiên</SelectItem>
                <SelectItem value="normal">Bình thường</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
                <SelectItem value="urgent">Khẩn cấp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRequiresConsultation} onValueChange={setFilterRequiresConsultation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Yêu cầu tư vấn?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Yêu cầu tư vấn</SelectItem>
                <SelectItem value="false">Không yêu cầu tư vấn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPatientNotified} onValueChange={setFilterPatientNotified}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Đã thông báo BN?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đã thông báo</SelectItem>
                <SelectItem value="false">Chưa thông báo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterHasResults} onValueChange={setFilterHasResults}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Có kết quả?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Có kết quả</SelectItem>
                <SelectItem value="false">Chưa có kết quả</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Add Select for Patient and Consultant if you have a list of them */}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải xét nghiệm STI...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p className="font-bold">Lỗi:</p>
          <p>{error}</p>
          <p className="mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên nếu lỗi tiếp diễn.</p>
        </div>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTest(test)}
                          >
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        {selectedTest && (
                          <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                              <DialogTitle>Chi tiết quy trình xét nghiệm</DialogTitle>
                              <DialogDescription>
                                Xem chi tiết và cập nhật trạng thái cho mã xét nghiệm {selectedTest.testCode}.
                              </DialogDescription>
                            </DialogHeader>
                            <StiProcessDetail
                              process={selectedTest}
                              onUpdateStatusSuccess={() => {
                                fetchTests();
                                setIsDetailDialogOpen(false);
                              }}
                            />
                          </DialogContent>
                        )}
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <PaginationInfo
              totalItems={totalTests}
              itemsPerPage={limit}
              currentPage={currentPage}
              itemName="xét nghiệm"
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
    </div>
  );
}
