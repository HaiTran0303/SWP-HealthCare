"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ConsultantService, ConsultantProfile } from "@/services/consultant.service";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "./ui/textarea";

export default function PendingConsultantTable() {
  const [pendingConsultants, setPendingConsultants] = useState<ConsultantProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPendingConsultants = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ConsultantService.getPendingConsultants();
      console.log("Pending Consultants API Response:", response); // Add log here
      setPendingConsultants(response || []); // Use response directly as it is the array
    } catch (err) {
      setError("Không thể tải danh sách tư vấn viên chờ duyệt.");
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tư vấn viên chờ duyệt.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingConsultants();
  }, [fetchPendingConsultants]);

  const handleApprove = async (id: string) => {
    try {
      await ConsultantService.approveConsultant(id);
      toast({
        title: "Thành công",
        description: "Đã duyệt tư vấn viên.",
      });
      fetchPendingConsultants(); // Refresh the list
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể duyệt tư vấn viên.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do từ chối.",
        variant: "destructive",
      });
      return;
    }
    try {
      await ConsultantService.rejectConsultant(id, rejectionReason);
      toast({
        title: "Thành công",
        description: "Đã từ chối tư vấn viên.",
      });
      fetchPendingConsultants(); // Refresh the list
      setRejectionReason("");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối tư vấn viên.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Chuyên môn</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingConsultants.length > 0 ? (
          pendingConsultants.map((consultant) => (
            <TableRow key={consultant.id}>
              <TableCell>{consultant.user.firstName} {consultant.user.lastName}</TableCell>
              <TableCell>{consultant.user.email}</TableCell>
              <TableCell>{consultant.specialties.join(", ")}</TableCell>
              <TableCell>
                <Badge variant="secondary">{consultant.profileStatus}</Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" onClick={() => handleApprove(consultant.id)}>
                  Duyệt
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      Từ chối
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn muốn từ chối?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể được hoàn tác. Vui lòng nhập lý do từ chối.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                      placeholder="Nhập lý do từ chối..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setRejectionReason("")}>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleReject(consultant.id)}>
                        Xác nhận
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              Không có tư vấn viên nào đang chờ duyệt.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
