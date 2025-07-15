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
      const fetchedBlogs = await BlogService.getAll();
      setBlogs(fetchedBlogs);
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
          <TabsTrigger value="blogs">Bài viết</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <div className="w-[200px]">
                    <Input placeholder="Tìm kiếm người dùng..." />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Thêm người dùng</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Nguyễn Văn A</TableCell>
                    <TableCell>nguyenvana@example.com</TableCell>
                    <TableCell>0123456789</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>
                      <Badge>Đang hoạt động</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Chỉnh sửa
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý cuộc hẹn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Tìm kiếm cuộc hẹn..."
                    className="w-[200px]"
                  />
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã cuộc hẹn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Tư vấn viên</TableHead>
                    <TableHead>Ngày giờ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>APT-001</TableCell>
                    <TableCell>Nguyễn Văn A</TableCell>
                    <TableCell>Dr. Nguyễn Văn B</TableCell>
                    <TableCell>23/06/2025 09:00</TableCell>
                    <TableCell>
                      <Badge>Chờ xác nhận</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Xác nhận
                        </Button>
                        <Button variant="ghost" size="sm">
                          Chi tiết
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add similar content for other tabs */}

        <TabsContent value="blogs">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý bài viết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Tìm kiếm bài viết..."
                    className="w-[200px]"
                  />
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="rejected">Đã từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Link href="/blog/new">
                  <Button>Thêm bài viết</Button>
                </Link>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(blogs) && blogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>{blog.title}</TableCell>
                      <TableCell>{blog.author}</TableCell>
                      <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge>{blog.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {blog.status === "pending" && (
                            <Button variant="outline" size="sm" onClick={() => handleOpenReviewModal(blog)}>
                              Duyệt
                            </Button>
                          )}
                          {(blog.status === "approved" || blog.status === "rejected") && (
                            <Button variant="outline" size="sm" onClick={() => handleOpenPublishModal(blog)}>
                              Xuất bản
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            Chi tiết
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {loadingBlogs && <div className="text-center py-4">Đang tải bài viết...</div>}
              {errorBlogs && <div className="text-red-500 text-center py-4">{errorBlogs}</div>}
              {!loadingBlogs && blogs.length === 0 && <div className="text-center py-4">Không có bài viết nào.</div>}
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
