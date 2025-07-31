"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MenstrualService,
  Prediction,
  ContraceptiveReminder,
  CreateContraceptiveReminderDto,
  UpdateContraceptiveReminderDto,
  CreateCycleDto,
  CycleData,
} from "@/services/menstrual.service";
import { MenstrualCycleHistory } from "@/components/MenstrualCycleHistory";
import { UpdateHealthDataConsentDto } from "@/types/api.d";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import { format } from "date-fns";

export default function MenstrualTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [menstrualTrackingConsent, setMenstrualTrackingConsent] = useState(false);
  const [userHealthDataConsent, setUserHealthDataConsent] = useState<boolean | null>(null);

  // Queries
  const { data: prediction, isLoading: isLoadingPrediction } = useQuery<Prediction>({
    queryKey: ["predictions"],
    queryFn: MenstrualService.getPredictions,
    enabled: !!user,
  });

  const {
    data: cycles,
    isLoading: isLoadingCycles,
    isError: isErrorCycles,
    error: errorCycles,
  } = useQuery<CycleData[]>({
    queryKey: ["menstrual-cycles"],
    queryFn: MenstrualService.getAllCycles,
    enabled: !!user,
  });

  const { data: contraceptiveReminders, isLoading: isLoadingReminders } = useQuery<ContraceptiveReminder[]>({
    queryKey: ["contraceptive-reminders"],
    queryFn: MenstrualService.getAllContraceptiveReminders,
    enabled: !!user,
  });

  // Mutations
  const { mutate: createCycle, isPending: isCreatingCycle } = useMutation({
    mutationFn: MenstrualService.createCycle,
    onSuccess: () => {
      toast({ title: "Thành công", description: "Đã tạo chu kỳ mới!" });
      setStartDate("");
      setEndDate("");
      queryClient.refetchQueries({ queryKey: ["menstrual-cycles"] }); // Refetch cycles
      queryClient.refetchQueries({ queryKey: ["predictions"] }); // Refetch predictions
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể tạo chu kỳ",
        variant: "destructive",
      });
    },
  });

  const { mutate: saveReminder, isPending: isSavingReminder } = useMutation({
    mutationFn: (reminderData: { id?: string; data: CreateContraceptiveReminderDto | UpdateContraceptiveReminderDto }) => {
      if (reminderData.id) {
        return MenstrualService.updateContraceptiveReminder(reminderData.id, reminderData.data);
      }
      return MenstrualService.createContraceptiveReminder(reminderData.data as CreateContraceptiveReminderDto);
    },
    onSuccess: (_, variables) => {
      toast({ title: "Thành công", description: variables.id ? "Đã cập nhật nhắc nhở!" : "Đã tạo nhắc nhở mới!" });
      setShowContraceptiveReminderDialog(false);
      queryClient.refetchQueries({ queryKey: ["contraceptive-reminders"] }); // Refetch reminders
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể lưu nhắc nhở",
        variant: "destructive",
      });
    },
  });
  
  const { mutate: deleteReminder } = useMutation({
    mutationFn: MenstrualService.deleteContraceptiveReminder,
    onSuccess: () => {
      toast({ title: "Thành công", description: "Đã xóa nhắc nhở!" });
      queryClient.refetchQueries({ queryKey: ["contraceptive-reminders"] }); // Refetch reminders
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể xóa nhắc nhở",
        variant: "destructive",
      });
    },
  });

  // Dialog State
  const [showContraceptiveReminderDialog, setShowContraceptiveReminderDialog] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<ContraceptiveReminder | null>(null);
  const [newReminderForm, setNewReminderForm] = useState<CreateContraceptiveReminderDto>({
    contraceptiveType: "",
    reminderTime: "",
    startDate: "",
    frequency: "daily",
    daysOfWeek: [],
    reminderMessage: "",
  });

  useEffect(() => {
    if (user) {
      setUserHealthDataConsent(user.healthDataConsent || false);
      if (user.gender === 'F' && (user.healthDataConsent === null || user.healthDataConsent === undefined)) {
        setMenstrualTrackingConsent(true);
      } else {
        setMenstrualTrackingConsent(user.healthDataConsent || false);
      }
    }
  }, [user]);

  // Effect to refetch predictions when cycles data changes
  useEffect(() => {
    if (cycles && cycles.length > 0) { // Check if cycles is not undefined
      queryClient.refetchQueries({ queryKey: ["predictions"] });
    }
  }, [cycles, queryClient]); // Depend on cycles directly

  const handleUpdateHealthDataConsent = async (consent: boolean) => {
    try {
      await apiClient.patch(API_ENDPOINTS.USERS.PROFILE + "/health-data-consent", { healthDataConsent: consent });
      setUserHealthDataConsent(consent);
      toast({ title: "Thành công", description: "Đã cập nhật quyền thu thập dữ liệu sức khỏe." });
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể cập nhật quyền.", variant: "destructive" });
      throw e;
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Lỗi", description: "Bạn cần đăng nhập.", variant: "destructive" });
      return;
    }
    if (!startDate || !endDate) {
      toast({ title: "Lỗi", description: "Vui lòng chọn ngày bắt đầu và kết thúc.", variant: "destructive" });
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast({ title: "Lỗi", description: "Ngày bắt đầu không thể sau ngày kết thúc.", variant: "destructive" });
      return;
    }
    if (user?.gender === 'F' && !userHealthDataConsent && !menstrualTrackingConsent) {
      toast({ title: "Lỗi", description: "Bạn cần đồng ý cho phép thu thập dữ liệu.", variant: "destructive" });
      return;
    }
    if (user?.gender === 'F' && !userHealthDataConsent && menstrualTrackingConsent) {
      await handleUpdateHealthDataConsent(true);
    }
    createCycle({ cycleStartDate: startDate, cycleEndDate: endDate });
  };

  const handleOpenCreateReminderDialog = () => {
    setCurrentReminder(null);
    setNewReminderForm({
      contraceptiveType: "", reminderTime: "", startDate: "", frequency: "daily", daysOfWeek: [], reminderMessage: "",
    });
    setShowContraceptiveReminderDialog(true);
  };

  const handleOpenEditReminderDialog = (reminder: ContraceptiveReminder) => {
    setCurrentReminder(reminder);
    setNewReminderForm({
      contraceptiveType: reminder.contraceptiveType,
      reminderTime: reminder.reminderTime,
      startDate: format(new Date(reminder.startDate), "yyyy-MM-dd"),
      endDate: reminder.endDate ? format(new Date(reminder.endDate), "yyyy-MM-dd") : undefined,
      frequency: reminder.frequency,
      daysOfWeek: reminder.daysOfWeek || [],
      reminderMessage: reminder.reminderMessage || "",
    });
    setShowContraceptiveReminderDialog(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    saveReminder({ id: currentReminder?.id, data: newReminderForm });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Theo dõi chu kỳ kinh nguyệt</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>Thêm chu kỳ mới</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCycle} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Ngày bắt đầu</label>
              <input type="date" className="border rounded px-2 py-1 w-full" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="block font-medium mb-1">Ngày kết thúc</label>
              <input type="date" className="border rounded px-2 py-1 w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            {user?.gender === 'F' && (
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox id="menstrual-tracking-consent" checked={menstrualTrackingConsent} onCheckedChange={(checked: boolean) => setMenstrualTrackingConsent(checked)} />
                <Label htmlFor="menstrual-tracking-consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cho phép thu thập thông tin để theo dõi chu kỳ kinh nguyệt</Label>
              </div>
            )}
            <Button type="submit" disabled={isCreatingCycle}>{isCreatingCycle ? "Đang lưu..." : "Lưu chu kỳ"}</Button>
          </form>
        </CardContent>
      </Card>
      <MenstrualCycleHistory cycles={cycles || []} isLoading={isLoadingCycles} isError={isErrorCycles} error={errorCycles as Error | null} />
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Nhắc nhở tránh thai</CardTitle>
          <Button onClick={handleOpenCreateReminderDialog}>Thêm nhắc nhở</Button>
        </CardHeader>
        <CardContent>
          {contraceptiveReminders && contraceptiveReminders.length === 0 ? (
            <div className="text-center text-gray-500">Chưa có nhắc nhở nào.</div>
          ) : (
            <ul className="space-y-4">
              {contraceptiveReminders && contraceptiveReminders.map((reminder: ContraceptiveReminder) => (
                <li key={reminder.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{reminder.contraceptiveType}</h3>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEditReminderDialog(reminder)}>Sửa</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteReminder(reminder.id)}>Xóa</Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">Thời gian: {reminder.reminderTime} | Tần suất: {reminder.frequency}</p>
                  <p className="text-sm text-gray-700">Từ ngày: {format(new Date(reminder.startDate), "dd/MM/yyyy")}{reminder.endDate && ` đến ${format(new Date(reminder.endDate), "dd/MM/yyyy")}`}</p>
                  {reminder.frequency === "weekly" && reminder.daysOfWeek && reminder.daysOfWeek.length > 0 && (<p className="text-sm text-gray-700">Các ngày: {reminder.daysOfWeek.map((day: number) => ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][day]).join(", ")}</p>)}
                  {reminder.reminderMessage && (<p className="text-sm text-gray-700 mt-1">Tin nhắn: {reminder.reminderMessage}</p>)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Dialog open={showContraceptiveReminderDialog} onOpenChange={setShowContraceptiveReminderDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentReminder ? "Sửa nhắc nhở" : "Thêm nhắc nhở mới"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveReminder} className="space-y-4">
            <div>
              <Label htmlFor="contraceptiveType">Loại thuốc/phương pháp</Label>
              <Input id="contraceptiveType" value={newReminderForm.contraceptiveType} onChange={(e) => setNewReminderForm({ ...newReminderForm, contraceptiveType: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="reminderTime">Thời gian nhắc nhở (HH:mm)</Label>
              <Input id="reminderTime" type="time" value={newReminderForm.reminderTime} onChange={(e) => setNewReminderForm({ ...newReminderForm, reminderTime: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input id="startDate" type="date" value={newReminderForm.startDate} onChange={(e) => setNewReminderForm({ ...newReminderForm, startDate: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="endDate">Ngày kết thúc (Không bắt buộc)</Label>
              <Input id="endDate" type="date" value={newReminderForm.endDate || ""} onChange={(e) => setNewReminderForm({ ...newReminderForm, endDate: e.target.value || undefined })} />
            </div>
            <div>
              <Label htmlFor="frequency">Tần suất</Label>
              <Select value={newReminderForm.frequency} onValueChange={(value: "daily" | "weekly" | "monthly") => setNewReminderForm({ ...newReminderForm, frequency: value })}>
                <SelectTrigger><SelectValue placeholder="Chọn tần suất" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hàng ngày</SelectItem>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newReminderForm.frequency === "weekly" && (
              <div>
                <Label>Các ngày trong tuần</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"].map((day, index) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox id={`day-${index}`} checked={newReminderForm.daysOfWeek?.includes(index)} onCheckedChange={(checked) => {
                        const updatedDays = checked ? [...(newReminderForm.daysOfWeek || []), index] : (newReminderForm.daysOfWeek || []).filter((d) => d !== index);
                        setNewReminderForm({ ...newReminderForm, daysOfWeek: updatedDays.sort() });
                      }} />
                      <Label htmlFor={`day-${index}`}>{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="reminderMessage">Tin nhắn nhắc nhở (Không bắt buộc)</Label>
              <Input id="reminderMessage" value={newReminderForm.reminderMessage || ""} onChange={(e) => setNewReminderForm({ ...newReminderForm, reminderMessage: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSavingReminder}>{isSavingReminder ? "Đang lưu..." : "Lưu"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
