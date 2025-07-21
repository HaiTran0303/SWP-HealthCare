"use client";
import { useEffect, useState } from "react";
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
  CycleData,
  SymptomData,
  Prediction,
  Symptom,
  ContraceptiveReminder,
  CreateContraceptiveReminderDto,
  UpdateContraceptiveReminderDto,
} from "@/services/menstrual.service";
import { ApiResponse, UpdateHealthDataConsentDto } from "@/types/api.d";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import { format } from "date-fns";

export default function MenstrualTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  // Triệu chứng
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [symptomNotes, setSymptomNotes] = useState("");
  const [symptomIntensity, setSymptomIntensity] = useState(3);
  const [savingSymptom, setSavingSymptom] = useState(false);
  const [cycleSymptoms, setCycleSymptoms] = useState<SymptomData[]>([]);
  const [menstrualTrackingConsent, setMenstrualTrackingConsent] = useState(false);
  const [userHealthDataConsent, setUserHealthDataConsent] = useState<boolean | null>(null);

  // Nhắc nhở tránh thai
  const [contraceptiveReminders, setContraceptiveReminders] = useState<ContraceptiveReminder[]>([]);
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
  const [savingReminder, setSavingReminder] = useState(false);

  useEffect(() => {
    if (user) {
      setUserHealthDataConsent(user.healthDataConsent || false);
      if (user.gender === 'F' && (user.healthDataConsent === null || user.healthDataConsent === undefined)) {
        setMenstrualTrackingConsent(true);
      } else {
        setMenstrualTrackingConsent(user.healthDataConsent || false);
      }
      fetchCycles();
      fetchPrediction();
      fetchSymptoms();
      fetchContraceptiveReminders();
    }
  }, [user]);

  // Lấy lịch sử chu kỳ
  const fetchCycles = async () => {
    setLoading(true);
    try {
      const res: ApiResponse<CycleData[]> = await MenstrualService.getAllCycles();
      setCycles(res.data || []);
    } catch (e: any) {
      console.error("Error fetching cycles:", e);
      setCycles([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy dự đoán kỳ tiếp theo
  const fetchPrediction = async () => {
    try {
      const res: Prediction = await MenstrualService.getPredictions();
      setPrediction(res);
    } catch {
      setPrediction(null);
    }
  };

  // Lấy danh sách triệu chứng
  const fetchSymptoms = async () => {
    try {
      const symRes: ApiResponse<Symptom[]> = await MenstrualService.getAllSymptoms();
      setSymptoms(symRes.data || []);
    } catch {
      setSymptoms([]);
    }
  };

  // Lấy triệu chứng của chu kỳ đang chọn
  const fetchCycleSymptoms = async (cycleId: string) => {
    try {
      const symRes: ApiResponse<SymptomData[]> = await MenstrualService.getSymptomsByCycleId(cycleId);
      setCycleSymptoms(symRes.data || []);
    } catch {
      setCycleSymptoms([]);
    }
  };

  // Lấy danh sách nhắc nhở tránh thai
  const fetchContraceptiveReminders = async () => {
    try {
      const res: ApiResponse<ContraceptiveReminder[]> = await MenstrualService.getAllContraceptiveReminders();
      setContraceptiveReminders(res.data || []);
    } catch (e: any) {
      console.error("Error fetching contraceptive reminders:", e);
      setContraceptiveReminders([]);
    }
  };

  // Function to update health data consent
  const handleUpdateHealthDataConsent = async (consent: boolean) => {
    try {
      await apiClient.patch(API_ENDPOINTS.USERS.PROFILE + "/health-data-consent", {
        healthDataConsent: consent,
      } as UpdateHealthDataConsentDto);
      setUserHealthDataConsent(consent);
      toast({
        title: "Thành công",
        description: "Đã cập nhật quyền thu thập dữ liệu sức khỏe.",
      });
    } catch (e: any) {
      toast({
        title: "Lỗi",
        description: e?.message || "Không thể cập nhật quyền thu thập dữ liệu sức khỏe.",
        variant: "destructive",
      });
      throw e;
    }
  };

  // Tạo mới chu kỳ
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để tạo chu kỳ mới.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày bắt đầu và kết thúc.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Lỗi",
        description: "Ngày bắt đầu không thể sau ngày kết thúc.",
        variant: "destructive",
      });
      return;
    }

    if (user?.gender === 'F' && !userHealthDataConsent && !menstrualTrackingConsent) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đồng ý cho phép thu thập dữ liệu sức khỏe để theo dõi chu kỳ kinh nguyệt.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      if (user?.gender === 'F' && !userHealthDataConsent && menstrualTrackingConsent) {
        await handleUpdateHealthDataConsent(true);
      }

      if (user?.gender !== 'F' || userHealthDataConsent || menstrualTrackingConsent) {
        await MenstrualService.createCycle({
          cycleStartDate: startDate,
          cycleEndDate: endDate,
        });
        toast({ title: "Thành công", description: "Đã tạo chu kỳ mới!" });
        setStartDate("");
        setEndDate("");
        if (menstrualTrackingConsent) {
          setMenstrualTrackingConsent(false);
        }
        fetchCycles();
        fetchPrediction();
      } else {
        toast({
          title: "Lỗi",
          description: "Không có sự đồng ý thu thập dữ liệu sức khỏe.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Lỗi",
        description: e?.message || "Không thể tạo chu kỳ",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Filter cycles
  const filteredCycles = cycles.filter((c) => {
    const start = c.cycleStartDate?.slice(0, 10);
    if (filterYear && filterYear !== "all" && !start.startsWith(filterYear))
      return false;
    if (
      filterMonth &&
      filterMonth !== "all" &&
      start.slice(5, 7) !== filterMonth
    )
      return false;
    return true;
  });

  // Xem chi tiết
  const handleRowClick = (cycle: any) => {
    setSelectedCycle(cycle);
    setShowDetail(true);
    setEditMode(false);
    setEditStart(cycle.cycleStartDate?.slice(0, 10) || "");
    setEditEnd(cycle.cycleEndDate?.slice(0, 10) || "");
    fetchCycleSymptoms(cycle.id);
  };

  // Sửa chu kỳ
  const handleEdit = async () => {
    if (!selectedCycle) return;
    setEditLoading(true);
    try {
      await MenstrualService.updateCycle(selectedCycle.id, {
        cycleStartDate: editStart,
        cycleEndDate: editEnd,
      });
      toast({ title: "Thành công", description: "Đã cập nhật chu kỳ!" });
      setShowDetail(false);
      fetchCycles();
      fetchPrediction();
    } catch (e: any) {
      toast({
        title: "Lỗi",
        description: e?.message || "Không thể cập nhật",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Xoá chu kỳ
  const handleDelete = async () => {
    if (!selectedCycle) return;
    setDeleteLoading(true);
    try {
      await MenstrualService.deleteCycle(selectedCycle.id);
      toast({ title: "Thành công", description: "Đã xoá chu kỳ!" });
      setShowDetail(false);
      fetchCycles();
      fetchPrediction();
    } catch (e: any) {
      toast({
        title: "Lỗi",
        description: e?.message || "Không thể xoá",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Lưu triệu chứng cho chu kỳ
  const handleSaveSymptom = async () => {
    if (!selectedCycle || !selectedSymptom) return;
    setSavingSymptom(true);
    try {
      await MenstrualService.addSymptom({
        cycleId: selectedCycle.id,
        symptomId: selectedSymptom,
        intensity: symptomIntensity,
        notes: symptomNotes,
      });
      toast({ title: "Thành công", description: "Đã lưu triệu chứng!" });
      setSelectedSymptom("");
      setSymptomNotes("");
      setSymptomIntensity(3);
      fetchCycleSymptoms(selectedCycle.id);
    } catch (e: any) {
      toast({
        title: "Lỗi",
        description: e?.message || "Không thể lưu triệu chứng",
        variant: "destructive",
      });
    } finally {
      setSavingSymptom(false);
    }
  };

  // Xử lý mở dialog tạo nhắc nhở mới
  const handleOpenCreateReminderDialog = () => {
    setCurrentReminder(null);
    setNewReminderForm({
      contraceptiveType: "",
      reminderTime: "",
      startDate: "",
      frequency: "daily",
      daysOfWeek: [],
      reminderMessage: "",
    });
    setShowContraceptiveReminderDialog(true);
  };

  // Xử lý mở dialog chỉnh sửa nhắc nhở
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

  // Xử lý lưu nhắc nhở (tạo mới hoặc cập nhật)
  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReminder(true);
    try {
      if (currentReminder) {
        await MenstrualService.updateContraceptiveReminder(currentReminder.id, newReminderForm);
        toast({ title: "Thành công", description: "Đã cập nhật nhắc nhở tránh thai!" });
      } else {
        await MenstrualService.createContraceptiveReminder(newReminderForm);
        toast({ title: "Thành công", description: "Đã tạo nhắc nhở tránh thai mới!" });
      }
      setShowContraceptiveReminderDialog(false);
      fetchContraceptiveReminders();
    } catch (e: any) {
      toast({
        title: "Lỗi",
        description: e?.message || "Không thể lưu nhắc nhở tránh thai",
        variant: "destructive",
      });
    } finally {
      setSavingReminder(false);
    }
  };

  // Xử lý xóa nhắc nhở
  const handleDeleteReminder = async (id: string) => {
    try {
      await MenstrualService.deleteContraceptiveReminder(id);
      toast({ title: "Thành công", description: "Đã xóa nhắc nhở tránh thai!" });
      fetchContraceptiveReminders();
    } catch (e: any) {
      toast({
        title: "Lỗi",
        description: e?.message || "Không thể xóa nhắc nhở tránh thai",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Theo dõi chu kỳ kinh nguyệt</h1>
      {/* Block dự đoán */}
      {prediction && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dự đoán kỳ tiếp theo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div>
                <b>Ngày bắt đầu dự đoán:</b>{" "}
                {prediction.predictedCycleStart ? format(new Date(prediction.predictedCycleStart), "dd/MM/yyyy") : "N/A"}
              </div>
              <div>
                <b>Ngày kết thúc dự đoán:</b>{" "}
                {prediction.predictedCycleEnd ? format(new Date(prediction.predictedCycleEnd), "dd/MM/yyyy") : "N/A"}
              </div>
              <div>
                <b>Ngày rụng trứng dự đoán:</b>{" "}
                {prediction.predictedOvulationDate ? format(new Date(prediction.predictedOvulationDate), "dd/MM/yyyy") : "N/A"}
              </div>
              <div>
                <b>Khoảng thụ thai cao:</b>{" "}
                {prediction.predictedFertileStart && prediction.predictedFertileEnd ?
                  `${format(new Date(prediction.predictedFertileStart), "dd/MM/yyyy")} - ${format(new Date(prediction.predictedFertileEnd), "dd/MM/yyyy")}` : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Form tạo mới */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thêm chu kỳ mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Ngày kết thúc</label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            {user?.gender === 'F' && (
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="menstrual-tracking-consent"
                  checked={menstrualTrackingConsent}
                  onCheckedChange={(checked: boolean) => setMenstrualTrackingConsent(checked)}
                />
                <Label
                  htmlFor="menstrual-tracking-consent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Cho phép thu thập thông tin để theo dõi chu kỳ kinh nguyệt
                </Label>
              </div>
            )}
            <Button type="submit" disabled={creating}>
              {creating ? "Đang lưu..." : "Lưu chu kỳ"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Năm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[
              ...Array.from(
                new Set(
                  cycles
                    .map((c) => c.cycleStartDate?.slice(0, 4))
                    .filter(Boolean)
                )
              ),
            ].map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Tháng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[...Array(12)].map((_, i) => (
              <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Danh sách lịch sử chu kỳ */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử chu kỳ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Đang tải...</div>
          ) : filteredCycles.length === 0 ? (
            <div>Không có dữ liệu phù hợp.</div>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-center">Ngày bắt đầu</th>
                  <th className="p-2 border text-center">Ngày kết thúc</th>
                  <th className="p-2 border text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCycles.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedCycle?.id === c.id ? "bg-blue-50" : ""}`}
                    onClick={() => handleRowClick(c)}
                  >
                    <td className="p-2 border text-center align-middle">
                      {c.cycleStartDate ? format(new Date(c.cycleStartDate), "dd/MM/yyyy") : "N/A"}
                    </td>
                    <td className="p-2 border text-center align-middle">
                      {c.cycleEndDate ? format(new Date(c.cycleEndDate), "dd/MM/yyyy") : "N/A"}
                    </td>
                    <td className="p-2 border text-center align-middle">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCycle(c);
                          setShowDetail(true);
                          setEditMode(true);
                          fetchCycleSymptoms(c.id);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCycle(c);
                          setShowDetail(true);
                          setEditMode(false);
                          fetchCycleSymptoms(c.id);
                        }}
                      >
                        Xoá
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {/* Block triệu chứng cho chu kỳ đã chọn */}
      {selectedCycle && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              Ghi chú triệu chứng cho chu kỳ:{" "}
              {selectedCycle.cycleStartDate ? format(new Date(selectedCycle.cycleStartDate), "dd/MM/yyyy") : "N/A"} -{" "}
              {selectedCycle.cycleEndDate ? format(new Date(selectedCycle.cycleEndDate), "dd/MM/yyyy") : "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Ghi chú triệu chứng</h4>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2 border">
                <div className="flex flex-wrap gap-4 items-end justify-center">
                  <div className="flex flex-col w-48">
                    <label className="text-xs text-gray-500 mb-1">
                      Triệu chứng
                    </label>
                    <Select
                      value={selectedSymptom}
                      onValueChange={setSelectedSymptom}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn triệu chứng" />
                      </SelectTrigger>
                      <SelectContent>
                        {symptoms.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col w-24">
                    <label className="text-xs text-gray-500 mb-1">
                      Mức độ (1-5)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={symptomIntensity}
                      onChange={(e) =>
                        setSymptomIntensity(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col w-56">
                    <label className="text-xs text-gray-500 mb-1">
                      Ghi chú
                    </label>
                    <Input
                      value={symptomNotes}
                      onChange={(e) => setSymptomNotes(e.target.value)}
                      placeholder="Ghi chú"
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleSaveSymptom}
                    disabled={savingSymptom || !selectedSymptom}
                    className="bg-primary text-white font-semibold rounded-full h-10 px-6 mt-5"
                  >
                    {savingSymptom ? "Đang lưu..." : "Lưu"}
                  </Button>
                </div>
              </div>
              {/* Danh sách triệu chứng đã ghi */}
              <ul className="list-disc pl-5 text-sm mt-2">
                {cycleSymptoms.map((s) => (
                  <li key={s.symptomId}>
                    <b>
                      {symptoms.find((sym) => sym.id === s.symptomId)?.name ||
                        s.symptomId}
                    </b>
                    {" - "}Mức độ: {s.intensity} {s.notes && `- ${s.notes}`}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block Nhắc nhở tránh thai */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Nhắc nhở tránh thai</CardTitle>
          <Button onClick={handleOpenCreateReminderDialog}>Thêm nhắc nhở</Button>
        </CardHeader>
        <CardContent>
          {contraceptiveReminders.length === 0 ? (
            <div className="text-center text-gray-500">Chưa có nhắc nhở nào.</div>
          ) : (
            <ul className="space-y-4">
              {contraceptiveReminders.map((reminder) => (
                <li key={reminder.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{reminder.contraceptiveType}</h3>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEditReminderDialog(reminder)}>Sửa</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteReminder(reminder.id)}>Xóa</Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Thời gian: {reminder.reminderTime} | Tần suất: {reminder.frequency}
                  </p>
                  <p className="text-sm text-gray-700">
                    Từ ngày: {format(new Date(reminder.startDate), "dd/MM/yyyy")}
                    {reminder.endDate && ` đến ${format(new Date(reminder.endDate), "dd/MM/yyyy")}`}
                  </p>
                  {reminder.frequency === "weekly" && reminder.daysOfWeek && reminder.daysOfWeek.length > 0 && (
                    <p className="text-sm text-gray-700">
                      Các ngày: {reminder.daysOfWeek.map(day => {
                        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
                        return days[day];
                      }).join(", ")}
                    </p>
                  )}
                  {reminder.reminderMessage && (
                    <p className="text-sm text-gray-700 mt-1">
                      Tin nhắn: {reminder.reminderMessage}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Modal chi tiết/sửa/xoá chu kỳ */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Sửa chu kỳ" : "Chi tiết chu kỳ"}
            </DialogTitle>
          </DialogHeader>
          {selectedCycle && (
            <div className="space-y-3">
              <div>
                <b>Ngày bắt đầu:</b>{" "}
                {selectedCycle.cycleStartDate ? format(new Date(selectedCycle.cycleStartDate), "dd/MM/yyyy") : "N/A"}
              </div>
              <div>
                <b>Ngày kết thúc:</b>{" "}
                {selectedCycle.cycleEndDate ? format(new Date(selectedCycle.cycleEndDate), "dd/MM/yyyy") : "N/A"}
              </div>
              {editMode && (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEdit();
                  }}
                >
                  <Input
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    required
                  />
                  <Input
                    type="date"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    required
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={editLoading}>
                      {editLoading ? "Đang lưu..." : "Lưu"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
              {!editMode && (
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Đang xoá..." : "Xoá chu kỳ"}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Thêm/Sửa nhắc nhở tránh thai */}
      <Dialog open={showContraceptiveReminderDialog} onOpenChange={setShowContraceptiveReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentReminder ? "Sửa nhắc nhở tránh thai" : "Thêm nhắc nhở tránh thai mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveReminder} className="space-y-4">
            <div>
              <Label htmlFor="contraceptiveType">Loại thuốc/phương pháp</Label>
              <Input
                id="contraceptiveType"
                value={newReminderForm.contraceptiveType}
                onChange={(e) => setNewReminderForm({ ...newReminderForm, contraceptiveType: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="reminderTime">Thời gian nhắc nhở (HH:mm)</Label>
              <Input
                id="reminderTime"
                type="time"
                value={newReminderForm.reminderTime}
                onChange={(e) => setNewReminderForm({ ...newReminderForm, reminderTime: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={newReminderForm.startDate}
                onChange={(e) => setNewReminderForm({ ...newReminderForm, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">Ngày kết thúc (Không bắt buộc)</Label>
              <Input
                id="endDate"
                type="date"
                value={newReminderForm.endDate || ""}
                onChange={(e) => setNewReminderForm({ ...newReminderForm, endDate: e.target.value || undefined })}
              />
            </div>
            <div>
              <Label htmlFor="frequency">Tần suất</Label>
              <Select
                value={newReminderForm.frequency}
                onValueChange={(value: "daily" | "weekly" | "monthly") => setNewReminderForm({ ...newReminderForm, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tần suất" />
                </SelectTrigger>
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
                      <Checkbox
                        id={`day-${index}`}
                        checked={newReminderForm.daysOfWeek?.includes(index)}
                        onCheckedChange={(checked) => {
                          const updatedDays = checked
                            ? [...(newReminderForm.daysOfWeek || []), index]
                            : (newReminderForm.daysOfWeek || []).filter((d) => d !== index);
                          setNewReminderForm({ ...newReminderForm, daysOfWeek: updatedDays.sort() });
                        }}
                      />
                      <Label htmlFor={`day-${index}`}>{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="reminderMessage">Tin nhắn nhắc nhở (Không bắt buộc)</Label>
              <Input
                id="reminderMessage"
                value={newReminderForm.reminderMessage || ""}
                onChange={(e) => setNewReminderForm({ ...newReminderForm, reminderMessage: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={savingReminder}>
                {savingReminder ? "Đang lưu..." : "Lưu nhắc nhở"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
