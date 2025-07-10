"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function ConsultantDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(
        `https://gender-healthcare.org/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header here
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái");
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái cuộc hẹn",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard tư vấn viên</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cuộc hẹn hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 đã hoàn thành</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số giờ tư vấn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5</div>
            <p className="text-xs text-muted-foreground">Trong tuần này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">Từ 124 đánh giá</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thu nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4M</div>
            <p className="text-xs text-muted-foreground">Trong tháng này</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Lịch làm việc</TabsTrigger>
          <TabsTrigger value="appointments">Cuộc hẹn</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý lịch làm việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <div className="space-y-4">
                  <h3 className="font-semibold">Lịch trong ngày</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded-lg">
                      <div>
                        <p className="font-medium">09:00 - 10:00</p>
                        <p className="text-sm text-muted-foreground">Đã đặt</p>
                      </div>
                      <Badge>Đã đặt</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded-lg">
                      <div>
                        <p className="font-medium">10:00 - 11:00</p>
                        <p className="text-sm text-muted-foreground">Trống</p>
                      </div>
                      <Badge variant="outline">Trống</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý cuộc hẹn</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã cuộc hẹn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Loại tư vấn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>APT-001</TableCell>
                    <TableCell>Nguyễn Văn A</TableCell>
                    <TableCell>23/06/2025 09:00</TableCell>
                    <TableCell>Tư vấn trực tuyến</TableCell>
                    <TableCell>
                      <Badge>Chờ xác nhận</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange("APT-001", "confirmed")
                          }
                        >
                          Xác nhận
                        </Button>
                        <Button variant="ghost" size="sm">
                          Chi tiết
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            router.push("/appointments/update-status/APT-001")
                          }
                        >
                          Cập nhật trạng thái
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá từ khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Nguyễn Văn A</p>
                      <p className="text-sm text-muted-foreground">
                        20/06/2025
                      </p>
                    </div>
                    <Badge>5/5 ⭐</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Bác sĩ tư vấn rất tận tình và chuyên nghiệp. Tôi rất hài
                    lòng với buổi tư vấn.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Trần Thị B</p>
                      <p className="text-sm text-muted-foreground">
                        19/06/2025
                      </p>
                    </div>
                    <Badge>4.5/5 ⭐</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Tư vấn viên rất kinh nghiệm và giải đáp mọi thắc mắc của
                    tôi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
