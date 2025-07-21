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
  Service,
  APIService,
  GetServicesQuery,
} from "@/services/service.service";
import { API_FEATURES } from "@/config/api";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function ServiceManagementTable() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalServices, setTotalServices] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // For service name/description
  const [filterCategory, setFilterCategory] = useState<string>(""); // For categoryId
  const [filterActiveStatus, setFilterActiveStatus] = useState<string>(""); // For isActive
  const [filterRequiresConsultant, setFilterRequiresConsultant] = useState<string>(""); // For requiresConsultant

  const limit = API_FEATURES.PAGINATION.DEFAULT_LIMIT;

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: GetServicesQuery = {
        page: currentPage,
        limit: limit,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };

      if (searchQuery) {
        query.search = searchQuery;
      }
      if (filterCategory) {
        query.categoryId = filterCategory;
      }
      if (filterActiveStatus) {
        query.isActive = filterActiveStatus === "active" ? true : false;
      }
      if (filterRequiresConsultant && filterRequiresConsultant !== "all") {
        query.requiresConsultant = filterRequiresConsultant === "true" ? true : false;
      }

      const response = await APIService.getAll(query);
      setServices(response.data);
      setTotalServices(response.total);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setError(err?.message || "Lỗi khi tải danh sách dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [currentPage, searchQuery, filterCategory, filterActiveStatus, filterRequiresConsultant]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteService = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      try {
        await APIService.deleteService(id);
        toast({
          title: "Thành công",
          description: "Dịch vụ đã được xóa.",
        });
        fetchServices();
      } catch (err: any) {
        toast({
          title: "Lỗi",
          description: `Không thể xóa dịch vụ: ${err.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const totalPages = Math.ceil(totalServices / limit);
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
            placeholder="Tìm kiếm dịch vụ..."
            className="w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* You might need to fetch categories for this select */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {/* Add dynamic categories here */}
            </SelectContent>
          </Select>
          <Select value={filterActiveStatus} onValueChange={setFilterActiveStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRequiresConsultant} onValueChange={setFilterRequiresConsultant}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Yêu cầu tư vấn viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Có</SelectItem>
              <SelectItem value="false">Không</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>Thêm dịch vụ mới</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải dịch vụ...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có dịch vụ nào.</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Thời lượng (phút)</TableHead>
                <TableHead>Yêu cầu TVV</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.price?.toLocaleString() || "N/A"}đ</TableCell>
                  <TableCell>{service.duration}</TableCell>
                  <TableCell>{service.requiresConsultant ? "Có" : "Không"}</TableCell>
                  <TableCell>
                    <Badge variant={service.isActive === true ? "default" : "secondary"}>
                      {service.isActive === true ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(service.createdAt), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Chỉnh sửa
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        Xóa
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
