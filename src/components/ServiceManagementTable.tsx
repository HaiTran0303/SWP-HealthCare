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
import { Label } from "@/components/ui/label"; // Ensure Label is imported
import { Textarea } from "@/components/ui/textarea"; // For description
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

export default function ServiceManagementTable() {
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from AuthContext
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(API_FEATURES.PAGINATION.DEFAULT_PAGE);
  const [totalServices, setTotalServices] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // For service name/description
  const [filterCategory, setFilterCategory] = useState<string>(""); // For categoryId
  const [filterActiveStatus, setFilterActiveStatus] = useState<string>(""); // For isActive
  const [filterRequiresConsultant, setFilterRequiresConsultant] = useState<string>(""); // For requiresConsultant
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isViewServiceDetailDialogOpen, setIsViewServiceDetailDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState(false); // New state for image upload dialog
  const [selectedServiceForImage, setSelectedServiceForImage] = useState<Service | null>(null); // New state for selected service for image upload


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

  const handleAddServiceClick = () => {
    setIsAddServiceDialogOpen(true);
  };

  const handleViewServiceDetailsClick = (service: Service) => {
    setSelectedService(service);
    setIsViewServiceDetailDialogOpen(true);
  };

  const handleCloseAddServiceDialog = () => {
    setIsAddServiceDialogOpen(false);
  };

  const handleCloseViewServiceDetailDialog = () => {
    setIsViewServiceDetailDialogOpen(false);
    setSelectedService(null);
  };

  const handleServiceAdded = () => {
    setIsAddServiceDialogOpen(false);
    fetchServices(); // Refresh service list
    toast({
      title: "Thành công",
      description: "Dịch vụ mới đã được thêm.",
    });
  };

  const handleUploadImageClick = (service: Service) => {
    setSelectedServiceForImage(service);
    setIsUploadImageDialogOpen(true);
  };

  const handleCloseUploadImageDialog = () => {
    setIsUploadImageDialogOpen(false);
    setSelectedServiceForImage(null);
  };

  const handleImageUploaded = () => {
    setIsUploadImageDialogOpen(false);
    fetchServices(); // Refresh service list to show new image if applicable
    toast({
      title: "Thành công",
      description: "Ảnh đã được thêm vào dịch vụ.",
    });
  };

  const userRoleName = typeof user?.role === "object" ? user.role.name : user?.role;
  const isAdminOrManager = userRoleName === "admin" || userRoleName === "manager";
  const isConsultant = userRoleName === "consultant";
  const isStaff = userRoleName === "staff";
  const isCustomer = userRoleName === "customer";

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
        {isAdminOrManager && (
          <Button onClick={handleAddServiceClick}>Thêm dịch vụ mới</Button>
        )}
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
                      <Button variant="ghost" size="sm" onClick={() => handleViewServiceDetailsClick(service)}>
                        Chi tiết
                      </Button>
                      {isAdminOrManager && (
                        <>
                          <Button variant="ghost" size="sm">
                            Chỉnh sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUploadImageClick(service)}
                          >
                            Thêm ảnh
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            Xóa
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <PaginationInfo
              totalItems={totalServices}
              itemsPerPage={limit}
              currentPage={currentPage}
              itemName="dịch vụ"
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

      {/* Add Service Dialog */}
      <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm dịch vụ mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo dịch vụ mới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên dịch vụ
              </Label>
              <Input id="name" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Mô tả chi tiết
              </Label>
              <Textarea id="description" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shortDescription" className="text-right">
                Mô tả ngắn
              </Label>
              <Input id="shortDescription" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Giá (VND)
              </Label>
              <Input id="price" type="number" defaultValue={0} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Thời lượng (phút)
              </Label>
              <Input id="duration" type="number" defaultValue={30} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">
                ID Danh mục
              </Label>
              <Input id="categoryId" defaultValue="" className="col-span-3" placeholder="ID của danh mục dịch vụ" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Địa điểm
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Trực tuyến</SelectItem>
                  <SelectItem value="office">Tại phòng khám</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requiresConsultant" className="text-right">
                Yêu cầu TVV
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có</SelectItem>
                  <SelectItem value="false">Không</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Hoạt động
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có</SelectItem>
                  <SelectItem value="false">Không</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="featured" className="text-right">
                Nổi bật
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có</SelectItem>
                  <SelectItem value="false">Không</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prerequisites" className="text-right">
                Điều kiện tiên quyết
              </Label>
              <Textarea id="prerequisites" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postInstructions" className="text-right">
                Hướng dẫn sau dịch vụ
              </Label>
              <Textarea id="postInstructions" defaultValue="" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddServiceDialog}>Hủy</Button>
            <Button onClick={handleServiceAdded}>Thêm dịch vụ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Service Detail Dialog */}
      <Dialog open={isViewServiceDetailDialogOpen} onOpenChange={setIsViewServiceDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết dịch vụ</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của dịch vụ.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="grid gap-4 py-4">
              {selectedService.images && selectedService.images.length > 0 ? (
                <div className="col-span-4 flex justify-center">
                  <img
                    src={selectedService.images[0].url}
                    alt={selectedService.name}
                    className="w-48 h-48 object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="col-span-4 flex justify-center items-center w-48 h-48 bg-gray-200 rounded-md text-gray-500">
                  Không có ảnh
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID:</Label>
                <span className="col-span-3">{selectedService.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tên dịch vụ:</Label>
                <span className="col-span-3">{selectedService.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Mô tả chi tiết:</Label>
                <span className="col-span-3">{selectedService.description}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Mô tả ngắn:</Label>
                <span className="col-span-3">{selectedService.shortDescription || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Giá:</Label>
                <span className="col-span-3">{selectedService.price?.toLocaleString() || "N/A"}đ</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Thời lượng:</Label>
                <span className="col-span-3">{selectedService.duration} phút</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Danh mục ID:</Label>
                <span className="col-span-3">{selectedService.categoryId || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Địa điểm:</Label>
                <span className="col-span-3">{selectedService.location || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Yêu cầu TVV:</Label>
                <span className="col-span-3">{selectedService.requiresConsultant ? "Có" : "Không"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Trạng thái:</Label>
                <span className="col-span-3">
                  <Badge variant={selectedService.isActive === true ? "default" : "secondary"}>
                    {selectedService.isActive === true ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nổi bật:</Label>
                <span className="col-span-3">{selectedService.featured ? "Có" : "Không"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Điều kiện tiên quyết:</Label>
                <span className="col-span-3">{selectedService.prerequisites || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Hướng dẫn sau dịch vụ:</Label>
                <span className="col-span-3">{selectedService.postInstructions || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ngày tạo:</Label>
                <span className="col-span-3">{format(new Date(selectedService.createdAt), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Cập nhật cuối:</Label>
                <span className="col-span-3">{format(new Date(selectedService.updatedAt), "dd/MM/yyyy HH:mm")}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseViewServiceDetailDialog}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Image Dialog */}
      {selectedServiceForImage && (
        <UploadImageDialog
          service={selectedServiceForImage}
          isOpen={isUploadImageDialogOpen}
          onClose={handleCloseUploadImageDialog}
          onImageUploaded={handleImageUploaded}
        />
      )}
    </div>
  );
}

interface UploadImageDialogProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: () => void;
}

function UploadImageDialog({ service, isOpen, onClose, onImageUploaded }: UploadImageDialogProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadAndAssociate = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một ảnh để tải lên.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload the image
      const uploadResponse = await APIService.uploadServiceImage(selectedFile, service.id);
      const imageId = uploadResponse.id;

      // 2. Associate the image with the service
      await APIService.addImageToService(service.id, imageId);

      toast({
        title: "Thành công",
        description: "Ảnh đã được tải lên và liên kết với dịch vụ.",
      });
      onImageUploaded();
    } catch (error: any) {
      console.error("Error uploading or associating image:", error);
      toast({
        title: "Lỗi",
        description: `Không thể thêm ảnh: ${error.message || "Lỗi không xác định"}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null); // Clear selected file
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm ảnh cho dịch vụ</DialogTitle>
          <DialogDescription>
            Tải lên một ảnh mới cho dịch vụ "{service.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Chọn ảnh
            </Label>
            <Input
              id="image"
              type="file"
              className="col-span-3"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {selectedFile && (
            <div className="col-span-4 text-center text-sm text-gray-500">
              Đã chọn: {selectedFile.name}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Hủy
          </Button>
          <Button onClick={handleUploadAndAssociate} disabled={isUploading || !selectedFile}>
            {isUploading ? "Đang tải lên..." : "Tải lên và thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
