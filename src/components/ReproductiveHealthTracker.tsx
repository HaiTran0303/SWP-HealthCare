"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Calendar as CalendarIcon, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CycleDay {
  date: Date;
  type: "period" | "fertile" | "ovulation" | "normal";
  notes?: string;
  symptoms?: string[];
  moods?: string[];
}

interface Reminder {
  id: string;
  contraceptiveType: string;
  reminderTime: string;
  startDate: Date;
  endDate?: Date;
  frequency: "daily" | "weekly";
  daysOfWeek?: number[];
  reminderMessage?: string;
}

const ReproductiveHealthTracker = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodLength, setPeriodLength] = useState<number>(5);
  const [lastPeriodStart, setLastPeriodStart] = useState<Date | undefined>(
    new Date()
  );
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDay, setSelectedDay] = useState<CycleDay | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cycle data
  useEffect(() => {
    const fetchCycleData = async () => {
      try {
        const response = await fetch(
          "https://gender-healthcare.org/api/menstrual-cycles"
        );
        if (!response.ok) throw new Error("Failed to fetch cycle data");
        const data = await response.json();
        // Transform API data to CycleDay format
        // ...
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu chu kỳ",
          variant: "destructive",
        });
      }
    };

    fetchCycleData();
  }, []);

  // Fetch reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch(
          "https://gender-healthcare.org/api/contraceptive-reminders"
        );
        if (!response.ok) throw new Error("Failed to fetch reminders");
        const data = await response.json();
        setReminders(data);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải nhắc nhở",
          variant: "destructive",
        });
      }
    };

    fetchReminders();
  }, []);

  const getDayClass = (day: Date) => {
    const found = cycleDays.find(
      (cycleDay) => cycleDay.date.toDateString() === day.toDateString()
    );

    if (!found) return "";

    switch (found.type) {
      case "period":
        return "bg-red-100 text-red-800 rounded-full";
      case "fertile":
        return "bg-green-100 text-green-800 rounded-full";
      case "ovulation":
        return "bg-purple-100 text-purple-800 rounded-full";
      default:
        return "";
    }
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;

    setDate(day);
    const selected = cycleDays.find(
      (cycleDay) => cycleDay.date.toDateString() === day.toDateString()
    );

    setSelectedDay(selected || null);
    setNotes(selected?.notes || "");
  };

  const saveNotes = async () => {
    if (!selectedDay) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://gender-healthcare.org/api/menstrual-cycles/${selectedDay.date.toISOString()}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save notes");

      toast({
        title: "Thành công",
        description: "Đã lưu ghi chú",
      });

      const updatedDays = cycleDays.map((day) => {
        if (day.date.toDateString() === selectedDay.date.toDateString()) {
          return { ...day, notes };
        }
        return day;
      });

      setCycleDays(updatedDays);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu ghi chú",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addReminder = async (data: Omit<Reminder, "id">) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://gender-healthcare.org/api/contraceptive-reminders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Failed to add reminder");

      const newReminder = await response.json();
      setReminders([...reminders, newReminder]);

      toast({
        title: "Thành công",
        description: "Đã thêm nhắc nhở mới",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm nhắc nhở",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-white">
      <h2 className="text-3xl font-bold text-center mb-8">
        Theo dõi sức khỏe sinh sản
      </h2>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="calendar">Lịch theo dõi</TabsTrigger>
          <TabsTrigger value="cycle">Cài đặt chu kỳ</TabsTrigger>
          <TabsTrigger value="reminders">Nhắc nhở</TabsTrigger>
          <TabsTrigger value="insights">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Lịch chu kỳ
                </CardTitle>
                <CardDescription>
                  Theo dõi chu kỳ kinh nguyệt, giai đoạn rụng trứng và thụ thai.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDaySelect}
                    className="rounded-md border shadow"
                    modifiers={{
                      period: (date) =>
                        cycleDays.some(
                          (day) =>
                            day.date.toDateString() === date.toDateString() &&
                            day.type === "period"
                        ),
                      fertile: (date) =>
                        cycleDays.some(
                          (day) =>
                            day.date.toDateString() === date.toDateString() &&
                            day.type === "fertile"
                        ),
                      ovulation: (date) =>
                        cycleDays.some(
                          (day) =>
                            day.date.toDateString() === date.toDateString() &&
                            day.type === "ovulation"
                        ),
                    }}
                    modifiersClassNames={{
                      period: "bg-red-100 text-red-800 rounded-full",
                      fertile: "bg-green-100 text-green-800 rounded-full",
                      ovulation: "bg-purple-100 text-purple-800 rounded-full",
                    }}
                  />
                </div>

                <div className="flex justify-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-100 mr-2"></div>
                    <span className="text-sm">Kỳ kinh</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-100 mr-2"></div>
                    <span className="text-sm">Thời kỳ dễ thụ thai</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-purple-100 mr-2"></div>
                    <span className="text-sm">Ngày rụng trứng</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chi tiết ngày</CardTitle>
                <CardDescription>
                  {date ? date.toLocaleDateString("vi-VN") : "Chọn một ngày"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDay ? (
                  <div className="space-y-4">
                    <div>
                      <Badge
                        className={`
                        ${selectedDay.type === "period" ? "bg-red-100 text-red-800" : ""}
                        ${selectedDay.type === "fertile" ? "bg-green-100 text-green-800" : ""}
                        ${selectedDay.type === "ovulation" ? "bg-purple-100 text-purple-800" : ""}
                      `}
                      >
                        {selectedDay.type === "period"
                          ? "Kỳ kinh"
                          : selectedDay.type === "fertile"
                            ? "Dễ thụ thai"
                            : selectedDay.type === "ovulation"
                              ? "Rụng trứng"
                              : "Bình thường"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Ghi chú</Label>
                      <textarea
                        id="notes"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Thêm ghi chú cho ngày này..."
                      />
                      <Button
                        onClick={saveNotes}
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Đang lưu..." : "Lưu ghi chú"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Chọn một ngày để xem hoặc thêm chi tiết
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Sắp tới</AlertTitle>
            <AlertDescription>
              {lastPeriodStart && (
                <div className="mt-2">
                  <span className="font-medium">Kỳ kinh tiếp theo:</span>{" "}
                  {new Date(
                    lastPeriodStart.getTime() +
                      cycleLength * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("vi-VN")}
                </div>
              )}
              {cycleDays.find((day) => day.type === "ovulation") && (
                <div className="mt-1">
                  <span className="font-medium">Ngày rụng trứng:</span>{" "}
                  {cycleDays
                    .find((day) => day.type === "ovulation")
                    ?.date.toLocaleDateString("vi-VN")}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Các tab khác giữ nguyên, chỉ thay đổi text sang tiếng Việt */}
        {/* ... */}
      </Tabs>
    </div>
  );
};

export default ReproductiveHealthTracker;
