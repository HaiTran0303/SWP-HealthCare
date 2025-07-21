"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Blog, BlogService } from "@/services/blog.service";
import BlogReviewModal from "@/components/BlogReviewModal";
import BlogPublishModal from "@/components/BlogPublishModal";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { apiClient } from "@/services/api"; // Import apiClient
import { API_ENDPOINTS } from "@/config/api"; // Import API_ENDPOINTS
import UserManagementTable from "@/components/UserManagementTable"; // Import UserManagementTable
import AppointmentManagementTable from "@/components/AppointmentManagementTable"; // Import AppointmentManagementTable
import StiTestManagementTable from "@/components/StiTestManagementTable"; // Import StiTestManagementTable
import ConsultantManagementTable from "@/components/ConsultantManagementTable"; // Import ConsultantManagementTable
import ServiceManagementTable from "@/components/ServiceManagementTable"; // Import ServiceManagementTable
import StiProcessTable from "@/components/StiProcessTable"; // Import StiProcessTable

interface UserOverviewResponse {
  totalUsers: number;
  // Add other properties if available in the API response
}

interface StiStatsResponse {
  totalTests: number;
  pendingResults: number;
  // Add other properties if available
}

interface RevenueStatsResponse {
  totalRevenue: number;
  percentageChangeFromPreviousMonth: number;
  // Add other properties if available
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [errorBlogs, setErrorBlogs] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    appointmentsToday: 0,
    appointmentsCompletedToday: 0,
    stiTests: 0,
    stiTestsPending: 0,
    monthlyRevenue: 0,
    monthlyRevenueChange: 0,
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      const userRole = typeof user?.role === "object" ? user.role.name : user?.role;
      if (user && userRole === "admin") {
        setIsAdmin(true);
        fetchBlogs();
        fetchDashboardData();
      } else {
        setIsAdmin(false);
      }
    }
  }, [user, isAuthLoading]);

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    setErrorDashboard(null);
    try {
      // Fetch Total Users
      const usersOverview = await apiClient.get<UserOverviewResponse>(API_ENDPOINTS.USER_DASHBOARD.OVERVIEW);
      const totalUsers = usersOverview?.totalUsers || 0; // Assuming API returns totalUsers

      // Fetch Appointments Today (placeholder for now, need specific API)
      const appointmentsToday = 23; // Placeholder
      const appointmentsCompletedToday = 12; // Placeholder

      // Fetch STI Tests
      const stiStats = await apiClient.get<StiStatsResponse>(API_ENDPOINTS.STI_TESTING.STATISTICS.DASHBOARD);
      const stiTests = stiStats?.totalTests || 0;
      const stiTestsPending = stiStats?.pendingResults || 0;

      // Fetch Monthly Revenue
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const revenueStats = await apiClient.get<RevenueStatsResponse>(`${API_ENDPOINTS.REVENUE_STATS.MONTHLY}?year=${currentYear}&month=${currentMonth}`);
      const monthlyRevenue = revenueStats?.totalRevenue || 0;
      const monthlyRevenueChange = revenueStats?.percentageChangeFromPreviousMonth || 0;

      setDashboardData({
        totalUsers,
        appointmentsToday,
        appointmentsCompletedToday,
        stiTests,
        stiTestsPending,
        monthlyRevenue,
        monthlyRevenueChange,
      });
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setErrorDashboard(err?.message || "Lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    setErrorBlogs(null);
    try {
      const response: any = await BlogService.getAll();
      if (response && Array.isArray(response.data)) {
        setBlogs(response.data);
      } else if (Array.isArray(response)) {
        setBlogs(response);
      } else {
        setBlogs([]);
      }
    } catch (err: any) {
      setErrorBlogs(err?.message || "Lỗi khi tải danh sách bài viết");
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleOpenReviewModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedBlog(null);
  };

  const handleOpenPublishModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsPublishModalOpen(true);
  };

  const handleClosePublishModal = () => {
    setIsPublishModalOpen(false);
    setSelectedBlog(null);
  };

  const handleReviewSuccess = () => {
    fetchBlogs(); // Refresh blog list after successful review
  };

  const handlePublishSuccess = () => {
    fetchBlogs(); // Refresh blog list after successful publish
  };

  if (isAuthLoading || isAdmin === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-red-500 text-center mt-10">
        Bạn không có quyền truy cập trang này!
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard quản trị</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-2 border-gray-200" />
            ) : errorDashboard ? (
              <p className="text-red-500 text-sm">Lỗi</p>
            ) : (
              <div className="text-2xl font-bold">{dashboardData.totalUsers.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {/* Placeholder for percentage change if API supports it */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cuộc hẹn trong ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-2 border-gray-200" />
            ) : errorDashboard ? (
              <p className="text-red-500 text-sm">Lỗi</p>
            ) : (
              <div className="text-2xl font-bold">{dashboardData.appointmentsToday}</div>
            )}
            <p className="text-xs text-muted-foreground">{dashboardData.appointmentsCompletedToday} đã hoàn thành</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Xét nghiệm STI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-2 border-gray-200" />
            ) : errorDashboard ? (
              <p className="text-red-500 text-sm">Lỗi</p>
            ) : (
              <div className="text-2xl font-bold">{dashboardData.stiTests}</div>
            )}
            <p className="text-xs text-muted-foreground">{dashboardData.stiTestsPending} đang chờ kết quả</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDashboard ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-2 border-gray-200" />
            ) : errorDashboard ? (
              <p className="text-red-500 text-sm">Lỗi</p>
            ) : (
              <div className="text-2xl font-bold">{dashboardData.monthlyRevenue.toLocaleString()}đ</div>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboardData.monthlyRevenueChange >= 0 ? "+" : ""}
              {dashboardData.monthlyRevenueChange}% so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="appointments">Cuộc hẹn</TabsTrigger>
          <TabsTrigger value="tests">Xét nghiệm</TabsTrigger>
          <TabsTrigger value="consultants">Tư vấn viên</TabsTrigger>
          <TabsTrigger value="services">Dịch vụ</TabsTrigger>
          <TabsTrigger value="feedback">Đánh giá & Phản hồi</TabsTrigger>
          <TabsTrigger value="sti-processes">Quy trình xét nghiệm STI</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý cuộc hẹn</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý xét nghiệm</CardTitle>
            </CardHeader>
            <CardContent>
              <StiTestManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultants">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý tư vấn viên</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsultantManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý dịch vụ</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceManagementTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý Đánh giá & Phản hồi</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/feedback">
                <Button>Đi đến trang quản lý Đánh giá & Phản hồi</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sti-processes">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý Quy trình Xét nghiệm STI</CardTitle>
            </CardHeader>
            <CardContent>
              {/* StiProcessTable requires 'processes' prop. Need to fetch data.
                  For now, I'll put a placeholder or a link to the dedicated page if it exists.
                  Looking at the file structure, there is src/app/admin/sti-processes/page.tsx */}
              <Link href="/admin/sti-processes">
                <Button>Đi đến trang quản lý Quy trình Xét nghiệm STI</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      {isReviewModalOpen && (
        <BlogReviewModal
          blog={selectedBlog}
          onClose={handleCloseReviewModal}
          onReviewSuccess={handleReviewSuccess}
        />
      )}
      {isPublishModalOpen && (
        <BlogPublishModal
          blog={selectedBlog}
          onClose={handleClosePublishModal}
          onPublishSuccess={handlePublishSuccess}
        />
      )}
    </div>
  );
}
