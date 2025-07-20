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
import { User, UserService, GetUsersParams } from "@/services/user.service"; // Import User Service
import { Appointment, AppointmentService, GetAppointmentsParams } from "@/services/appointment.service"; // Import Appointment Service
import { StiTestProcess, StiTestingService, GetStiTestProcessesParams } from "@/services/sti-testing.service"; // Import STI Testing Service
import { Consultant, ConsultantService, GetConsultantsParams } from "@/services/consultant.service"; // Import Consultant Service
import { Service, ServiceService, GetServicesParams } from "@/services/service.service"; // Import Service Service

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

  // User Management States
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<boolean | undefined>(undefined);
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Service Management States
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorServices, setErrorServices] = useState<string | null>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string | undefined>(undefined);
  const [serviceStatusFilter, setServiceStatusFilter] = useState<boolean | undefined>(undefined);
  const [servicePagination, setServicePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Consultant Management States
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loadingConsultants, setLoadingConsultants] = useState(true);
  const [errorConsultants, setErrorConsultants] = useState<string | null>(null);
  const [consultantSearchTerm, setConsultantSearchTerm] = useState("");
  const [consultantStatusFilter, setConsultantStatusFilter] = useState<Consultant['profileStatus'] | undefined>(undefined);
  const [consultantPagination, setConsultantPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Appointment Management States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [errorAppointments, setErrorAppointments] = useState<string | null>(null);
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string | undefined>(undefined);
  const [appointmentPagination, setAppointmentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // STI Test Process Management States
  const [stiProcesses, setStiProcesses] = useState<StiTestProcess[]>([]);
  const [loadingStiProcesses, setLoadingStiProcesses] = useState(true);
  const [errorStiProcesses, setErrorStiProcesses] = useState<string | null>(null);
  const [stiSearchTerm, setStiSearchTerm] = useState("");
  const [stiStatusFilter, setStiStatusFilter] = useState<string | undefined>(undefined);
  const [stiPagination, setStiPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    if (!isAuthLoading) {
      const userRole = typeof user?.role === "object" ? user.role.name : user?.role;
      if (user && userRole === "admin") {
        setIsAdmin(true);
        fetchBlogs();
        fetchDashboardData();
        fetchUsers(); // Fetch users on initial load
        fetchAppointments(); // Fetch appointments on initial load
        fetchStiTestProcesses(); // Fetch STI test processes on initial load
        fetchConsultants(); // Fetch consultants on initial load
        fetchServices(); // Fetch services on initial load
      } else {
        setIsAdmin(false);
      }
    }
  }, [user, isAuthLoading]);

  // Fetch Users Function
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const params: GetUsersParams = {
        page: userPagination.page,
        limit: userPagination.limit,
        // The API supports searching by firstName, lastName, email, phone.
        // For simplicity, we'll map the single search term to email for now.
        email: userSearchTerm || undefined,
        isActive: userStatusFilter,
      };
      const response = await UserService.getAll(params);
      setUsers(response.data);
      setUserPagination((prev) => ({
        ...prev,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }));
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setErrorUsers(err?.message || "Lỗi khi tải danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    // Refetch users whenever search term or filter changes
    const handler = setTimeout(() => {
      if (isAdmin) { // Only fetch if admin
        fetchUsers();
      }
    }, 500); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [userSearchTerm, userStatusFilter, userPagination.page, userPagination.limit, isAdmin]);

  // Fetch Appointments Function
  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setErrorAppointments(null);
    try {
      const params: GetAppointmentsParams = {
        page: appointmentPagination.page,
        limit: appointmentPagination.limit,
        status: appointmentStatusFilter,
        // Assuming appointmentSearchTerm can be mapped to userId or consultantId
        // For a real application, you'd likely have separate search inputs for these
        // userId: appointmentSearchTerm || undefined,
        // consultantId: appointmentSearchTerm || undefined,
      };
      const response = await AppointmentService.getAll(params);
      setAppointments(response.data);
      setAppointmentPagination((prev) => ({
        ...prev,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }));
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setErrorAppointments(err?.message || "Lỗi khi tải danh sách cuộc hẹn");
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    // Refetch appointments whenever search term or filter changes
    const handler = setTimeout(() => {
      if (isAdmin) { // Only fetch if admin
        fetchAppointments();
      }
    }, 500); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [appointmentSearchTerm, appointmentStatusFilter, appointmentPagination.page, appointmentPagination.limit, isAdmin]);

  // Fetch STI Test Processes Function
  const fetchStiTestProcesses = async () => {
    setLoadingStiProcesses(true);
    setErrorStiProcesses(null);
    try {
      const params: GetStiTestProcessesParams = {
        page: stiPagination.page,
        limit: stiPagination.limit,
        testCode: stiSearchTerm || undefined,
        status: stiStatusFilter,
      };
      const response = await StiTestingService.getAll(params);
      setStiProcesses(response.data);
      setStiPagination((prev) => ({
        ...prev,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }));
    } catch (err: any) {
      console.error("Error fetching STI test processes:", err);
      setErrorStiProcesses(err?.message || "Lỗi khi tải danh sách xét nghiệm STI");
    } finally {
      setLoadingStiProcesses(false);
    }
  };

  useEffect(() => {
    // Refetch STI test processes whenever search term or filter changes
    const handler = setTimeout(() => {
      if (isAdmin) { // Only fetch if admin
        fetchStiTestProcesses();
      }
    }, 500); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [stiSearchTerm, stiStatusFilter, stiPagination.page, stiPagination.limit, isAdmin]);

  // Fetch Consultants Function
  const fetchConsultants = async () => {
    setLoadingConsultants(true);
    setErrorConsultants(null);
    try {
      const params: GetConsultantsParams = {
        page: consultantPagination.page,
        limit: consultantPagination.limit,
        search: consultantSearchTerm || undefined,
        status: consultantStatusFilter,
      };
      const response = await ConsultantService.getAll(params);
      setConsultants(response.data);
      setConsultantPagination((prev) => ({
        ...prev,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }));
    } catch (err: any) {
      console.error("Error fetching consultants:", err);
      setErrorConsultants(err?.message || "Lỗi khi tải danh sách tư vấn viên");
    } finally {
      setLoadingConsultants(false);
    }
  };

  useEffect(() => {
    // Refetch consultants whenever search term or filter changes
    const handler = setTimeout(() => {
      if (isAdmin) { // Only fetch if admin
        fetchConsultants();
      }
    }, 500); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [consultantSearchTerm, consultantStatusFilter, consultantPagination.page, consultantPagination.limit, isAdmin]);

  // Fetch Services Function
  const fetchServices = async () => {
    setLoadingServices(true);
    setErrorServices(null);
    try {
      const params: GetServicesParams = {
        page: servicePagination.page,
        limit: servicePagination.limit,
        search: serviceSearchTerm || undefined,
        categoryId: serviceCategoryFilter === "all" ? undefined : serviceCategoryFilter,
        isActive: serviceStatusFilter,
      };
      const response = await ServiceService.getAll(params);
      setServices(response.data);
      setServicePagination((prev) => ({
        ...prev,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }));
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setErrorServices(err?.message || "Lỗi khi tải danh sách dịch vụ");
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    // Refetch services whenever search term or filter changes
    const handler = setTimeout(() => {
      if (isAdmin) { // Only fetch if admin
        fetchServices();
      }
    }, 500); // Debounce search input

    return () => {
      clearTimeout(handler);
    };
  }, [serviceSearchTerm, serviceCategoryFilter, serviceStatusFilter, servicePagination.page, servicePagination.limit, isAdmin]);


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
                    <Input
                      placeholder="Tìm kiếm người dùng..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={userStatusFilter === true ? "active" : userStatusFilter === false ? "inactive" : "all"}
                    onValueChange={(value) =>
                      setUserStatusFilter(
                        value === "active" ? true : value === "inactive" ? false : undefined
                      )
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
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
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Đang tải người dùng...</TableCell>
                    </TableRow>
                  ) : errorUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">{errorUsers}</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Không có người dùng nào.</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.role?.name}</TableCell> {/* Added optional chaining */}
                        <TableCell>
                          <Badge className={user.isActive ? "bg-green-500" : "bg-red-500"}>
                            {user.isActive ? "Đang hoạt động" : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Chỉnh sửa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination controls */}
              <div className="flex justify-end items-center space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={userPagination.page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={userPagination.page * userPagination.limit >= userPagination.total}
                >
                  Tiếp
                </Button>
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
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Tìm kiếm cuộc hẹn..."
                    className="w-[200px]"
                    value={appointmentSearchTerm}
                    onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                  />
                  <Select
                    value={appointmentStatusFilter}
                    onValueChange={(value) => setAppointmentStatusFilter(value === "all" ? undefined : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
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
                  {loadingAppointments ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Đang tải cuộc hẹn...</TableCell>
                    </TableRow>
                  ) : errorAppointments ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">{errorAppointments}</TableCell>
                    </TableRow>
                  ) : appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Không có cuộc hẹn nào.</TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.id.substring(0, 8)}</TableCell>
                        <TableCell>{appointment.user?.firstName} {appointment.user?.lastName}</TableCell>
                        <TableCell>{appointment.consultant?.firstName} {appointment.consultant?.lastName}</TableCell>
                        <TableCell>{new Date(appointment.appointmentDate).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge>{appointment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Chi tiết
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination controls */}
              <div className="flex justify-end items-center space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAppointmentPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={appointmentPagination.page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAppointmentPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={appointmentPagination.page * appointmentPagination.limit >= appointmentPagination.total}
                >
                  Tiếp
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add similar content for other tabs */}

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý xét nghiệm STI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Tìm kiếm mã xét nghiệm..."
                    className="w-[200px]"
                    value={stiSearchTerm}
                    onChange={(e) => setStiSearchTerm(e.target.value)}
                  />
                  <Select
                    value={stiStatusFilter}
                    onValueChange={(value) => setStiStatusFilter(value === "all" ? undefined : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="ordered">Đã đặt</SelectItem>
                      <SelectItem value="sample_collected">Đã lấy mẫu</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="result_ready">Có kết quả</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã xét nghiệm</TableHead>
                    <TableHead>Bệnh nhân</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStiProcesses ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Đang tải xét nghiệm...</TableCell>
                    </TableRow>
                  ) : errorStiProcesses ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">{errorStiProcesses}</TableCell>
                    </TableRow>
                  ) : stiProcesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Không có xét nghiệm nào.</TableCell>
                    </TableRow>
                  ) : (
                    stiProcesses.map((process) => (
                      <TableRow key={process.id}>
                        <TableCell>{process.testCode}</TableCell>
                        <TableCell>{process.patient?.firstName} {process.patient?.lastName}</TableCell>
                        <TableCell>{process.service?.name}</TableCell>
                        <TableCell>
                          <Badge>{process.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(process.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination controls */}
              <div className="flex justify-end items-center space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStiPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={stiPagination.page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStiPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={stiPagination.page * stiPagination.limit >= stiPagination.total}
                >
                  Tiếp
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultants">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý tư vấn viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Tìm kiếm tư vấn viên..."
                    className="w-[200px]"
                    value={consultantSearchTerm}
                    onChange={(e) => setConsultantSearchTerm(e.target.value)}
                  />
                  <Select
                    value={consultantStatusFilter || "all"}
                    onValueChange={(value: string) =>
                      setConsultantStatusFilter(
                        value === "all" ? undefined : (value as Consultant['profileStatus'])
                      )
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
                      <SelectItem value="on_leave">Nghỉ phép</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                      <SelectItem value="training">Đang đào tạo</SelectItem>
                      <SelectItem value="rejected">Đã từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Thêm tư vấn viên</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Chuyên môn</TableHead>
                    <TableHead>Phí tư vấn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingConsultants ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Đang tải tư vấn viên...</TableCell>
                    </TableRow>
                  ) : errorConsultants ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">{errorConsultants}</TableCell>
                    </TableRow>
                  ) : consultants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Không có tư vấn viên nào.</TableCell>
                    </TableRow>
                  ) : (
                    consultants.map((consultant) => (
                      <TableRow key={consultant.id}>
                        <TableCell>{consultant.firstName} {consultant.lastName}</TableCell>
                        <TableCell>{consultant.email}</TableCell>
                        <TableCell>{consultant.specialties.join(", ")}</TableCell>
                        <TableCell>{consultant.consultationFee.toLocaleString()}đ</TableCell>
                        <TableCell>
                          <Badge>{consultant.profileStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Chỉnh sửa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination controls */}
              <div className="flex justify-end items-center space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConsultantPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={consultantPagination.page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConsultantPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={consultantPagination.page * consultantPagination.limit >= consultantPagination.total}
                >
                  Tiếp
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý dịch vụ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Tìm kiếm dịch vụ..."
                    className="w-[200px]"
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                  />
                  <Select
                    value={serviceCategoryFilter || "all"}
                    onValueChange={(value) => setServiceCategoryFilter(value === "all" ? undefined : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {/* You would dynamically load categories here */}
                      <SelectItem value="category1">Danh mục 1</SelectItem>
                      <SelectItem value="category2">Danh mục 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={serviceStatusFilter === true ? "active" : serviceStatusFilter === false ? "inactive" : "all"}
                    onValueChange={(value) =>
                      setServiceStatusFilter(
                        value === "active" ? true : value === "inactive" ? false : undefined
                      )
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Thêm dịch vụ</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên dịch vụ</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Thời lượng</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingServices ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Đang tải dịch vụ...</TableCell>
                    </TableRow>
                  ) : errorServices ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">{errorServices}</TableCell>
                    </TableRow>
                  ) : services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Không có dịch vụ nào.</TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.price.toLocaleString()}đ</TableCell>
                        <TableCell>{service.duration} phút</TableCell>
                        <TableCell>{service.categoryId}</TableCell> {/* This should ideally be category name */}
                        <TableCell>
                          <Badge className={service.isActive ? "bg-green-500" : "bg-red-500"}>
                            {service.isActive ? "Đang hoạt động" : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Chỉnh sửa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination controls */}
              <div className="flex justify-end items-center space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setServicePagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={servicePagination.page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setServicePagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={servicePagination.page * servicePagination.limit >= servicePagination.total}
                >
                  Tiếp
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
