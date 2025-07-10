"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  User,
  Calendar,
  FileText,
  Settings,
  Bell,
  Shield,
  Edit,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatar: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo: {
    allergies: string;
    medications: string;
    conditions: string;
  };
}

interface TestHistory {
  id: string;
  testName: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
  results: string;
  cost: number;
  type: "in-person" | "home-kit";
}

interface ConsultationHistory {
  id: string;
  advisorName: string;
  date: string;
  time: string;
  type: string;
  status: "completed" | "upcoming" | "cancelled";
  notes: string;
  cost: number;
}

interface UserProfileManagementProps {
  userProfile?: UserProfile;
  testHistory?: TestHistory[];
  consultationHistory?: ConsultationHistory[];
}

export default function UserProfileManagement({
  userProfile = defaultUserProfile,
  testHistory = defaultTestHistory,
  consultationHistory = defaultConsultationHistory,
}: UserProfileManagementProps) {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestHistory | null>(null);
  const [selectedConsultation, setSelectedConsultation] =
    useState<ConsultationHistory | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSaveProfile = () => {
    // Here you would typically save to backend
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setProfile(userProfile);
    setIsEditing(false);
  };

  if (!isClient) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-background">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">User Profile Management</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-background">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">User Profile Management</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your personal information, view your test and consultation
          history, and update your preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="test-history">Test History</TabsTrigger>
          <TabsTrigger value="consultation-history">Consultations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>
                      {profile.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription>{profile.email}</CardDescription>
                  </div>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            dateOfBirth: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Emergency Contact
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="emergency-name">Contact Name</Label>
                      <Input
                        id="emergency-name"
                        value={profile.emergencyContact.name}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            emergencyContact: {
                              ...profile.emergencyContact,
                              name: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-phone">Contact Phone</Label>
                      <Input
                        id="emergency-phone"
                        value={profile.emergencyContact.phone}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            emergencyContact: {
                              ...profile.emergencyContact,
                              phone: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-relationship">
                        Relationship
                      </Label>
                      <Input
                        id="emergency-relationship"
                        value={profile.emergencyContact.relationship}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            emergencyContact: {
                              ...profile.emergencyContact,
                              relationship: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={profile.medicalInfo.allergies}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          medicalInfo: {
                            ...profile.medicalInfo,
                            allergies: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      value={profile.medicalInfo.medications}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          medicalInfo: {
                            ...profile.medicalInfo,
                            medications: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conditions">Medical Conditions</Label>
                    <Textarea
                      id="conditions"
                      value={profile.medicalInfo.conditions}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          medicalInfo: {
                            ...profile.medicalInfo,
                            conditions: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="test-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Test History
              </CardTitle>
              <CardDescription>
                View your complete STI testing history and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testHistory.map((test) => (
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
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {test.date}
                        </span>
                        <span>${test.cost}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {test.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTest(test)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Results
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultation-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Consultation History
              </CardTitle>
              <CardDescription>
                View your past and upcoming consultations with healthcare
                advisors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultationHistory.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">
                          Dr. {consultation.advisorName}
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
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {consultation.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {consultation.time}
                        </span>
                        <span>{consultation.type}</span>
                        <span>${consultation.cost}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConsultation(consultation)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      {consultation.status === "upcoming" && (
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via text message
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Appointment Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming appointments
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Test Results</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when results are ready
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Manage your privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <Button variant="outline" className="w-full">
                    Update Password
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <Button variant="outline" className="w-full">
                    Enable 2FA
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Data Export</Label>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export My Data
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Account Deletion</Label>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Results Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Results - {selectedTest?.testName}</DialogTitle>
            <DialogDescription>
              Test completed on {selectedTest?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">
                  All Results Normal
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Detailed Results:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedTest?.results}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTest(null)}>
              Close
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consultation Details Dialog */}
      <Dialog
        open={!!selectedConsultation}
        onOpenChange={() => setSelectedConsultation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Consultation with Dr. {selectedConsultation?.advisorName}
            </DialogTitle>
            <DialogDescription>
              {selectedConsultation?.date} at {selectedConsultation?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Consultation Type:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedConsultation?.type}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Notes:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedConsultation?.notes}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status:</h4>
              <Badge
                variant={
                  selectedConsultation?.status === "completed"
                    ? "default"
                    : selectedConsultation?.status === "upcoming"
                      ? "secondary"
                      : "destructive"
                }
              >
                {selectedConsultation?.status}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedConsultation(null)}
            >
              Close
            </Button>
            {selectedConsultation?.status === "upcoming" && (
              <Button>Reschedule</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default mock data
const defaultUserProfile: UserProfile = {
  id: "user-1",
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1990-05-15",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-user",
  emergencyContact: {
    name: "John Johnson",
    phone: "+1 (555) 987-6543",
    relationship: "Spouse",
  },
  medicalInfo: {
    allergies: "Penicillin, Shellfish",
    medications: "Birth control pill (daily)",
    conditions: "None",
  },
};

const defaultTestHistory: TestHistory[] = [
  {
    id: "test-1",
    testName: "Comprehensive STI Panel",
    date: "2023-10-15",
    status: "completed",
    results: "All tests negative. No infections detected.",
    cost: 250,
    type: "in-person",
  },
  {
    id: "test-2",
    testName: "HIV & Hepatitis Screening",
    date: "2023-08-20",
    status: "completed",
    results: "HIV: Negative, Hepatitis B: Negative, Hepatitis C: Negative",
    cost: 150,
    type: "home-kit",
  },
  {
    id: "test-3",
    testName: "Chlamydia & Gonorrhea Test",
    date: "2023-12-01",
    status: "pending",
    results: "Results pending",
    cost: 120,
    type: "home-kit",
  },
];

const defaultConsultationHistory: ConsultationHistory[] = [
  {
    id: "consult-1",
    advisorName: "Sarah Johnson",
    date: "2023-11-15",
    time: "2:00 PM",
    type: "General Sexual Health",
    status: "completed",
    notes:
      "Discussed contraceptive options and reproductive health. Recommended regular testing schedule.",
    cost: 100,
  },
  {
    id: "consult-2",
    advisorName: "Michael Chen",
    date: "2023-12-20",
    time: "10:00 AM",
    type: "STI Concerns",
    status: "upcoming",
    notes: "Follow-up consultation to discuss recent test results.",
    cost: 100,
  },
  {
    id: "consult-3",
    advisorName: "Elena Rodriguez",
    date: "2023-09-10",
    time: "3:30 PM",
    type: "Contraception Advice",
    status: "completed",
    notes:
      "Discussed different contraceptive methods and their effectiveness. Patient chose to continue with current method.",
    cost: 100,
  },
];
