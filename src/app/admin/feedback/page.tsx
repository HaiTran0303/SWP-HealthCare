"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, StarIcon, Search, Filter, Trash2, Edit, Eye } from "lucide-react"; // Import Eye icon
import { useToast } from "@/components/ui/use-toast";
import { FeedbackService } from "@/services/feedback.service";
import { Feedback, FeedbackQueryParams, UpdateFeedbackDto } from "@/types/feedback";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination"; // Import main Pagination component

const FeedbackManagementTable: React.FC = () => {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [staffResponse, setStaffResponse] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and pagination states
  const [queryParams, setQueryParams] = useState<FeedbackQueryParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "DESC",
    minRating: undefined,
    maxRating: undefined,
    isAnonymous: undefined,
    searchComment: "",
  });
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  useEffect(() => {
    fetchFeedbacks();
  }, [queryParams]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await FeedbackService.getAllFeedbacks(queryParams);
      setFeedbacks(response.data);
      setTotalFeedbacks(response.meta.totalItems);
    } catch (error: any) {
      console.error("Error fetching feedbacks:", error);
      toast({
        title: "Lỗi",
        description: `Không thể tải danh sách phản hồi. Lỗi: ${error.message || error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (key: keyof FeedbackQueryParams, value: any) => {
    setQueryParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setStaffResponse(feedback.staffResponse || "");
    setIsDetailsDialogOpen(true);
    setIsEditingResponse(false);
  };

  const handleEditResponse = () => {
    setIsEditingResponse(true);
  };

  const handleSaveResponse = async () => {
    if (!selectedFeedback) return;
    setIsSubmittingResponse(true);
    try {
      await FeedbackService.updateFeedback(selectedFeedback.id, {
        staffResponse,
      });
      toast({
        title: "Thành công",
        description: "Phản hồi của nhân viên đã được cập nhật.",
      });
      setIsEditingResponse(false);
      setIsSubmittingResponse(false);
      fetchFeedbacks(); // Refresh data
    } catch (error: any) {
      console.error("Error saving staff response:", error);
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật phản hồi. Lỗi: ${error.message || error}`,
        variant: "destructive",
      });
      setIsSubmittingResponse(false);
    }
  };

  const handleDeleteFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFeedback) return;
    setIsDeleting(true);
    try {
      await FeedbackService.deleteFeedback(selectedFeedback.id);
      toast({
        title: "Thành công",
        description: "Phản hồi đã được xóa.",
      });
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
      fetchFeedbacks(); // Refresh data
    } catch (error: any) {
      console.error("Error deleting feedback:", error);
      toast({
        title: "Lỗi",
        description: `Không thể xóa phản hồi. Lỗi: ${error.message || error}`,
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý Phản hồi Khách hàng</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bộ lọc Phản hồi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="searchComment">Tìm kiếm bình luận</Label>
              <Input
                id="searchComment"
                placeholder="Tìm kiếm theo bình luận..."
                value={queryParams.searchComment}
                onChange={(e) => handleFilterChange("searchComment", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minRating">Đánh giá tối thiểu</Label>
              <Select
                value={queryParams.minRating?.toString() || ""}
                onValueChange={(value) => handleFilterChange("minRating", value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} sao
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRating">Đánh giá tối đa</Label>
              <Select
                value={queryParams.maxRating?.toString() || ""}
                onValueChange={(value) => handleFilterChange("maxRating", value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} sao
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAnonymous"
                checked={queryParams.isAnonymous}
                onCheckedChange={(checked) => handleFilterChange("isAnonymous", checked === true ? true : checked === false ? false : undefined)}
              />
              <Label htmlFor="isAnonymous">Chỉ hiển thị ẩn danh</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sắp xếp theo</Label>
              <Select
                value={queryParams.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  <SelectItem value="rating">Đánh giá</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
              <Select
                value={queryParams.sortOrder}
                onValueChange={(value) => handleFilterChange("sortOrder", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Thứ tự" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESC">Giảm dần</SelectItem>
                  <SelectItem value="ASC">Tăng dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Phản hồi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedbacks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Không tìm thấy phản hồi nào.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Tư vấn viên</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Bình luận</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        {feedback.isAnonymous ? (
                          <span className="text-muted-foreground">Ẩn danh</span>
                        ) : (
                          <span>{feedback.userId}</span> // Replace with actual user name if available
                        )}
                      </TableCell>
                      <TableCell>{feedback.consultantId}</TableCell> {/* Replace with actual consultant name if available */}
                      <TableCell>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`w-4 h-4 ${
                                star <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{feedback.comment || "Không có bình luận"}</TableCell>
                      <TableCell>{format(new Date(feedback.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(feedback)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteFeedback(feedback)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={queryParams.page!}
                  totalPages={Math.ceil(totalFeedbacks / queryParams.limit!)}
                  onPageChange={handlePageChange}
                  onNextPage={() => handlePageChange(queryParams.page! + 1)}
                  onPreviousPage={() => handlePageChange(queryParams.page! - 1)}
                  onFirstPage={() => handlePageChange(1)}
                  onLastPage={() => handlePageChange(Math.ceil(totalFeedbacks / queryParams.limit!))}
                  pageNumbers={Array.from({ length: Math.ceil(totalFeedbacks / queryParams.limit!) }, (_, i) => i + 1)} // Dummy pageNumbers, Pagination component will handle
                  hasNextPage={queryParams.page! * queryParams.limit! < totalFeedbacks}
                  hasPreviousPage={queryParams.page! > 1}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Feedback Details Dialog */}
      {selectedFeedback && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết Phản hồi</DialogTitle>
              <DialogDescription>Xem và quản lý chi tiết phản hồi này.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>ID Phản hồi:</Label>
                <p className="text-sm text-muted-foreground">{selectedFeedback.id}</p>
              </div>
              <div>
                <Label>Khách hàng:</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedFeedback.isAnonymous ? "Ẩn danh" : selectedFeedback.userId}
                </p>
              </div>
              <div>
                <Label>Tư vấn viên:</Label>
                <p className="text-sm text-muted-foreground">{selectedFeedback.consultantId}</p>
              </div>
              <div>
                <Label>Đánh giá:</Label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= selectedFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm ml-2">({selectedFeedback.rating}/5)</span>
                </div>
              </div>
              <div>
                <Label>Bình luận:</Label>
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {selectedFeedback.comment || "Không có bình luận."}
                </p>
              </div>
              <div>
                <Label>Ngày gửi:</Label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedFeedback.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              </div>
              <div>
                <Label htmlFor="staffResponse">Phản hồi của nhân viên:</Label>
                {isEditingResponse ? (
                  <Textarea
                    id="staffResponse"
                    value={staffResponse}
                    onChange={(e) => setStaffResponse(e.target.value)}
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                    {selectedFeedback.staffResponse || "Chưa có phản hồi."}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              {isEditingResponse ? (
                <Button onClick={handleSaveResponse} disabled={isSubmittingResponse}>
                  {isSubmittingResponse ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu phản hồi"
                  )}
                </Button>
              ) : (
                <Button variant="outline" onClick={handleEditResponse}>
                  <Edit className="w-4 h-4 mr-2" />
                  Sửa phản hồi
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedFeedback && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa phản hồi</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa phản hồi này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FeedbackManagementTable;
