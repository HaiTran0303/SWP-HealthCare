"use client";

import {
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface DashboardStats {
  totalUsers: number;
  totalTests: number;
  totalConsultations: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    tests: number;
    consultations: number;
    revenue: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  lastActive: string;
  status: "active" | "inactive";
  testsCount: number;
  consultationsCount: number;
}

interface TestRecord {
  id: string;
  userId: string;
  userName: string;
  testName: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
  type: "in-person" | "home-kit";
  cost: number;
}

interface ConsultationRecord {
  id: string;
  userId: string;
  userName: string;
  advisorName: string;
  date: string;
  time: string;
  type: string;
  status: "completed" | "upcoming" | "cancelled";
  cost: number;
}

interface AdminDashboardProps {
  stats?: DashboardStats;
  users?: User[];
  tests?: TestRecord[];
  consultations?: ConsultationRecord[];
}

export default function AdminDashboard({
  stats = defaultStats,
  users = defaultUsers,
  tests = defaultTests,
  consultations = defaultConsultations,
}: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.advisorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (!isClient) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-background">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-background">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor platform performance, manage users, and view comprehensive
          reports.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+
                  {stats.monthlyGrowth.users}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tests
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTests}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+
                  {stats.monthlyGrowth.tests}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Consultations
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalConsultations}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+
                  {stats.monthlyGrowth.consultations}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+
                  {stats.monthlyGrowth.revenue}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.slice(0, 5).map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{test.testName}</p>
                        <p className="text-sm text-muted-foreground">
                          {test.userName} • {test.date}
                        </p>
                      </div>
                      <Badge
                        variant={
                          test.status === "completed"
                            ? "default"
                            : test.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultations
                    .filter((c) => c.status === "upcoming")
                    .slice(0, 5)
                    .map((consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {consultation.userName} with Dr.{" "}
                            {consultation.advisorName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {consultation.date} at {consultation.time}
                          </p>
                        </div>
                        <Badge variant="secondary">{consultation.type}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage registered users and their activities
                  </CardDescription>
                </div>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export Users
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>Joined: {user.joinDate}</span>
                          <span>Last active: {user.lastActive}</span>
                          <span>Tests: {user.testsCount}</span>
                          <span>Consultations: {user.consultationsCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "secondary"
                        }
                      >
                        {user.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Management</CardTitle>
                  <CardDescription>
                    Monitor and manage all STI tests
                  </CardDescription>
                </div>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export Tests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{test.testName}</h4>
                        <Badge
                          variant={
                            test.status === "completed"
                              ? "default"
                              : test.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {test.status}
                        </Badge>
                        <Badge variant="outline">{test.type}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>Patient: {test.userName}</span>
                        <span>Date: {test.date}</span>
                        <span>Cost: ${test.cost}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Consultation Management</CardTitle>
                  <CardDescription>
                    Monitor and manage all consultations
                  </CardDescription>
                </div>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export Consultations
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search consultations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4">
                {filteredConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">
                          {consultation.userName} with Dr.{" "}
                          {consultation.advisorName}
                        </h4>
                        <Badge
                          variant={
                            consultation.status === "completed"
                              ? "default"
                              : consultation.status === "upcoming"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {consultation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          {consultation.date} at {consultation.time}
                        </span>
                        <span>Type: {consultation.type}</span>
                        <span>Cost: ${consultation.cost}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analytics Reports
                </CardTitle>
                <CardDescription>
                  Generate comprehensive analytics reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user-activity">
                        User Activity
                      </SelectItem>
                      <SelectItem value="test-statistics">
                        Test Statistics
                      </SelectItem>
                      <SelectItem value="consultation-metrics">
                        Consultation Metrics
                      </SelectItem>
                      <SelectItem value="revenue-analysis">
                        Revenue Analysis
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 3 months</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Key metrics for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Users</span>
                    <span className="text-2xl font-bold">
                      {users.filter((u) => u.status === "active").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed Tests</span>
                    <span className="text-2xl font-bold">
                      {tests.filter((t) => t.status === "completed").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Upcoming Consultations
                    </span>
                    <span className="text-2xl font-bold">
                      {
                        consultations.filter((c) => c.status === "upcoming")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-2xl font-bold">
                      $
                      {(
                        tests.reduce((sum, t) => sum + t.cost, 0) +
                        consultations.reduce((sum, c) => sum + c.cost, 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details - {selectedUser?.name}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Join Date</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedUser?.joinDate}
                </p>
              </div>
              <div>
                <Label>Last Active</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedUser?.lastActive}
                </p>
              </div>
              <div>
                <Label>Total Tests</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedUser?.testsCount}
                </p>
              </div>
              <div>
                <Label>Total Consultations</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedUser?.consultationsCount}
                </p>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    selectedUser?.status === "active" ? "default" : "secondary"
                  }
                >
                  {selectedUser?.status}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
            <Button>Edit User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default mock data
const defaultStats: DashboardStats = {
  totalUsers: 1247,
  totalTests: 3456,
  totalConsultations: 892,
  totalRevenue: 125000,
  monthlyGrowth: {
    users: 12,
    tests: 18,
    consultations: 15,
    revenue: 22,
  },
};

const defaultUsers: User[] = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    joinDate: "2023-01-15",
    lastActive: "2023-12-01",
    status: "active",
    testsCount: 3,
    consultationsCount: 2,
  },
  {
    id: "user-2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    joinDate: "2023-03-22",
    lastActive: "2023-11-28",
    status: "active",
    testsCount: 2,
    consultationsCount: 1,
  },
  {
    id: "user-3",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    joinDate: "2023-02-10",
    lastActive: "2023-10-15",
    status: "inactive",
    testsCount: 1,
    consultationsCount: 3,
  },
];

const defaultTests: TestRecord[] = [
  {
    id: "test-1",
    userId: "user-1",
    userName: "Sarah Johnson",
    testName: "Comprehensive STI Panel",
    date: "2023-11-15",
    status: "completed",
    type: "in-person",
    cost: 250,
  },
  {
    id: "test-2",
    userId: "user-2",
    userName: "Michael Chen",
    testName: "HIV & Hepatitis Screening",
    date: "2023-11-20",
    status: "pending",
    type: "home-kit",
    cost: 150,
  },
  {
    id: "test-3",
    userId: "user-3",
    userName: "Emily Davis",
    testName: "Chlamydia & Gonorrhea Test",
    date: "2023-11-25",
    status: "completed",
    type: "home-kit",
    cost: 120,
  },
];

const defaultConsultations: ConsultationRecord[] = [
  {
    id: "consult-1",
    userId: "user-1",
    userName: "Sarah Johnson",
    advisorName: "Sarah Johnson",
    date: "2023-12-15",
    time: "2:00 PM",
    type: "General Sexual Health",
    status: "upcoming",
    cost: 100,
  },
  {
    id: "consult-2",
    userId: "user-2",
    userName: "Michael Chen",
    advisorName: "Michael Chen",
    date: "2023-11-10",
    time: "10:00 AM",
    type: "STI Concerns",
    status: "completed",
    cost: 100,
  },
  {
    id: "consult-3",
    userId: "user-3",
    userName: "Emily Davis",
    advisorName: "Elena Rodriguez",
    date: "2023-12-20",
    time: "3:30 PM",
    type: "Contraception Advice",
    status: "upcoming",
    cost: 100,
  },
];
