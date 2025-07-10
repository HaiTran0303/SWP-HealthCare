"use client";

import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Service, ServiceService } from "@/services/service.service";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams, useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
// import { AuthContext } from "@/contexts/AuthContext"; // Uncomment if you have AuthContext

type PackageService = {
  id: string;
  service: any;
  package: any;
  [key: string]: any;
};

// API: Get available slots (for consultant-required services)
async function getAvailableSlots({
  serviceIds,
  startDate,
  endDate,
  startTime,
  endTime,
  token,
}: {
  serviceIds: string[];
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  token: string;
}) {
  const body = {
    serviceIds,
    startDate,
    ...(endDate ? { endDate } : {}),
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
  };
  const res = await fetch(
    "https://gender-healthcare.org/appointments/available-slots",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error("Không thể lấy slot khả dụng");
  return res.json();
}

// API: Book appointment
async function bookAppointmentApi({
  serviceIds,
  consultantId,
  appointmentDate,
  appointmentLocation,
  notes,
  token,
}: {
  serviceIds: string[];
  consultantId?: string;
  appointmentDate: string;
  appointmentLocation: string;
  notes?: string;
  token: string;
}) {
  const res = await fetch("https://gender-healthcare.org/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      serviceIds,
      ...(consultantId ? { consultantId } : {}),
      appointmentDate,
      appointmentLocation,
      ...(notes ? { notes } : {}),
    }),
  });
  if (!res.ok) throw new Error("Không thể đặt lịch");
  return res.json();
}

export default function AppointmentsPage() {
  // const { user } = useContext(AuthContext); // Uncomment if you have AuthContext
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<PackageService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoadingServices(true);
    ServiceService.getAll()
      .then((data) => {
        // Robustly extract the array from possible response shapes
        if (Array.isArray(data)) {
          setServices(data);
        } else if (Array.isArray(data?.data)) {
          setServices(data.data);
        } else if (Array.isArray(data?.services)) {
          setServices(data.services);
        } else {
          setServices([]);
        }
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    if (!loadingServices && services.length > 0) {
      const id = searchParams.get("id");
      if (id) {
        const found = services.find((s) => s.service?.id === id);
        if (found) {
          setSelectedServiceIds((prev) =>
            prev.includes(found.id) ? prev : [...prev, found.id]
          );
        }
      }
    }
  }, [loadingServices, services, searchParams]);

  const selectedServices = services
    .filter((s) => selectedServiceIds.includes(s.id))
    .map((s) => s.service);
  const needsConsultant = selectedServices.some((s) => s.requiresConsultant);

  // Lấy slot nếu cần tư vấn viên
  useEffect(() => {
    if (needsConsultant && selectedServiceIds.length && selectedDate) {
      setLoadingSlots(true);
      const startDate = selectedDate.toISOString().slice(0, 10);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (!token) {
        setLoadingSlots(false);
        toast({
          title: "Lỗi xác thực",
          description: "Bạn cần đăng nhập để xem slot tư vấn.",
          variant: "destructive",
        });
        return;
      }
      const mappedServiceIds = selectedServiceIds
        .map((id) => {
          const found = services.find((s) => s.id === id);
          return found?.service?.id;
        })
        .filter(Boolean);

      console.log("serviceIds gửi lên:", mappedServiceIds);

      getAvailableSlots({
        serviceIds: mappedServiceIds,
        startDate,
        token,
      })
        .then((data) => {
          if (data?.data?.availableSlots) {
            setAvailableSlots(data.data.availableSlots);
          } else if (data?.data?.message) {
            toast({ title: "Thông báo", description: data.data.message });
            setAvailableSlots([]);
          } else {
            setAvailableSlots([]);
          }
        })
        .catch(() => {
          toast({ title: "Lỗi", description: "Không thể lấy slot tư vấn." });
          setAvailableSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    } else {
      setAvailableSlots([]);
    }
  }, [needsConsultant, selectedServiceIds, selectedDate, services.length]);

  // Reset selectedSlot khi đổi ngày hoặc dịch vụ
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate, selectedServiceIds]);

  // Reset selectedTime khi đổi ngày hoặc dịch vụ
  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate, selectedServiceIds]);

  const handleBookAppointment = async () => {
    if (!selectedDate || selectedServiceIds.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn dịch vụ và ngày.",
        variant: "destructive",
      });
      return;
    }
    if (needsConsultant && !selectedSlot) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn khung giờ và tư vấn viên.",
        variant: "destructive",
      });
      return;
    }
    if (!needsConsultant && !selectedTime) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn giờ.",
        variant: "destructive",
      });
      return;
    }
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) {
      toast({
        title: "Lỗi xác thực",
        description: "Bạn cần đăng nhập để đặt lịch.",
        variant: "destructive",
      });
      return;
    }
    try {
      let appointmentDate = "";
      let consultantId: string | undefined = undefined;
      let appointmentLocation = needsConsultant ? "online" : "office";
      if (needsConsultant) {
        appointmentDate = selectedSlot.dateTime;
        consultantId = selectedSlot.consultant?.id;
      } else {
        if (!selectedDate || !selectedTime) {
          toast({
            title: "Lỗi",
            description: "Vui lòng chọn ngày và giờ.",
            variant: "destructive",
          });
          return;
        }
        const date = new Date(selectedDate);
        const [hour, minute] = selectedTime.split(":");
        date.setHours(Number(hour), Number(minute), 0, 0);
        appointmentDate = date.toISOString();
      }
      console.log(
        "appointmentDate gửi lên:",
        appointmentDate,
        typeof appointmentDate
      );
      const body = {
        serviceIds: selectedServiceIds.map((id) => {
          const found = services.find((s) => s.id === id);
          return found?.service?.id || id;
        }),
        consultantId,
        appointmentDate,
        appointmentLocation,
        notes,
        token,
      };
      console.log("Body gửi lên:", body);
      const result = await bookAppointmentApi(body);
      setBooking({ success: result.success, message: result.message });
      toast({
        title: result.success ? "Thành công" : "Lỗi",
        description: result.message,
        variant: result.success ? undefined : "destructive",
      });
      if (result.success) {
        setStep(4);
        setSelectedServiceIds([]);
        setSelectedDate(undefined);
        setSelectedTime("");
        setSelectedSlot(null);
        setNotes("");
        setTimeout(() => {
          router.push("/profile/appointments");
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể đặt lịch. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Phân quyền: chỉ Customer mới đặt được lịch (giả sử user?.role === 'customer')
  // const canBook = user?.role === 'customer';
  const canBook = true; // TODO: thay bằng kiểm tra role thực tế

  // Tóm tắt thông tin đã chọn
  const summary = (
    <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6 border w-full max-w-md mx-auto mb-8">
      <h3 className="text-xl font-bold mb-4 text-primary">Tóm tắt đặt lịch</h3>
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Dịch vụ:</span>
          <ul className="list-disc ml-6 mt-1">
            {selectedServices.map((service) => (
              <li key={service.id} className="mb-1">
                <span className="text-primary font-medium">{service.name}</span>
                {service.price && (
                  <span className="ml-2 text-green-700">
                    ({service.price} VNĐ)
                  </span>
                )}
                {service.requiresConsultant && (
                  <span className="ml-2 text-xs text-blue-600">
                    [Cần tư vấn viên]
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-semibold">Ngày:</span>{" "}
          {selectedDate ? selectedDate.toLocaleDateString() : "-"}
        </div>
        <div>
          <span className="font-semibold">Giờ:</span>{" "}
          {needsConsultant
            ? selectedSlot?.dateTime
              ? new Date(selectedSlot.dateTime).toLocaleTimeString()
              : "-"
            : selectedTime}
        </div>
        {needsConsultant && (
          <div>
            <span className="font-semibold">Tư vấn viên:</span>{" "}
            {selectedSlot?.consultant
              ? `${selectedSlot.consultant.lastName} ${selectedSlot.consultant.firstName}`
              : "-"}
          </div>
        )}
        <div>
          <span className="font-semibold">Nơi chốn:</span>{" "}
          {needsConsultant ? "Online" : "Tại cơ sở"}
        </div>
        {notes && (
          <div>
            <span className="font-semibold">Ghi chú:</span> {notes}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl md:text-5xl font-extrabold text-primary drop-shadow-sm tracking-tight mb-10">
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Đặt lịch hẹn
        </span>
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Bước {step} / 4</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Bước 1: Chọn dịch vụ */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">1. Chọn dịch vụ</h2>
                  {loadingServices ? (
                    <div className="text-center py-8">Đang tải dịch vụ...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-4 flex flex-col gap-2 shadow-sm transition cursor-pointer hover:border-primary ${selectedServiceIds.includes(item.id) ? "border-primary bg-primary/5" : ""}`}
                          onClick={() => {
                            setSelectedServiceIds((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            );
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedServiceIds.includes(item.id)}
                            />
                            <span className="font-semibold text-lg text-primary">
                              {item.service?.name}
                            </span>
                            {item.service?.requiresConsultant && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs text-blue-600 border-blue-300"
                              >
                                Cần tư vấn viên
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.service?.description}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs mt-1">
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Giá:{" "}
                              {item.service?.price
                                ? `${item.service.price} VNĐ`
                                : "Miễn phí"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-8 flex justify-end">
                    <Button
                      size="lg"
                      onClick={() => setStep(2)}
                      disabled={selectedServiceIds.length === 0}
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              )}
              {/* Bước 2: Chọn ngày */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">2. Chọn ngày</h2>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div>
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        fromDate={new Date()}
                        modifiers={{
                          available: (date) => {
                            if (needsConsultant && availableSlots.length > 0) {
                              // Chỉ enable ngày có slot khả dụng
                              return availableSlots.some((slot) => {
                                const slotDate = new Date(slot.dateTime);
                                return (
                                  slotDate.getFullYear() ===
                                    date.getFullYear() &&
                                  slotDate.getMonth() === date.getMonth() &&
                                  slotDate.getDate() === date.getDate()
                                );
                              });
                            }
                            // Nếu không cần tư vấn viên, enable mọi ngày từ hôm nay
                            return true;
                          },
                        }}
                        modifiersClassNames={{
                          available:
                            "bg-primary/10 border-primary text-primary font-bold rounded-full shadow-md",
                          selected:
                            "bg-primary text-white rounded-full shadow-lg",
                          today: "border border-primary",
                        }}
                        disabled={(date) => {
                          // Disable ngày trong quá khứ
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          if (needsConsultant && availableSlots.length > 0) {
                            // Disable ngày không có slot khả dụng
                            return !availableSlots.some((slot) => {
                              const slotDate = new Date(slot.dateTime);
                              return (
                                slotDate.getFullYear() === date.getFullYear() &&
                                slotDate.getMonth() === date.getMonth() &&
                                slotDate.getDate() === date.getDate()
                              );
                            });
                          }
                          return false;
                        }}
                        className="rounded-2xl border shadow-lg p-4 bg-white"
                        showOutsideDays
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-4 justify-center">
                      <div className="text-lg">
                        Ngày đã chọn:{" "}
                        <span className="font-semibold text-primary">
                          {selectedDate
                            ? selectedDate.toLocaleDateString()
                            : "Chưa chọn"}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setStep(1)}
                        >
                          Quay lại
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => setStep(3)}
                          disabled={!selectedDate}
                        >
                          Tiếp tục
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Bước 3: Chọn giờ & tư vấn viên */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    3. Chọn khung giờ & tư vấn viên
                  </h2>
                  {needsConsultant ? (
                    <div>
                      {loadingSlots ? (
                        <div className="text-center py-8">Đang tải slot...</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableSlots
                            .filter((slot) => {
                              if (!selectedDate) return false;
                              const slotDateLocal = new Date(
                                slot.dateTime
                              ).toLocaleDateString();
                              const selectedDateLocal =
                                selectedDate.toLocaleDateString();
                              return slotDateLocal === selectedDateLocal;
                            })
                            .map((slot, idx) => (
                              <label
                                key={
                                  slot.dateTime +
                                  "-" +
                                  (slot.consultant?.id || "") +
                                  "-" +
                                  idx
                                }
                                className={`flex items-center gap-4 p-4 border rounded-xl shadow-sm cursor-pointer transition hover:border-primary ${
                                  selectedSlot &&
                                  selectedSlot.dateTime === slot.dateTime &&
                                  (selectedSlot.consultant?.id || "") ===
                                    (slot.consultant?.id || "")
                                    ? "border-primary bg-primary/5"
                                    : ""
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="slot"
                                  checked={Boolean(
                                    selectedSlot &&
                                      selectedSlot.dateTime === slot.dateTime &&
                                      (selectedSlot.consultant?.id || "") ===
                                        (slot.consultant?.id || "")
                                  )}
                                  onChange={() => setSelectedSlot(slot)}
                                  className="accent-primary w-5 h-5"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-lg text-primary">
                                    {new Date(slot.dateTime).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {slot.consultant
                                      ? `${slot.consultant.lastName} ${slot.consultant.firstName}`
                                      : "-"}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Còn {slot.remainingSlots} slot
                                </div>
                              </label>
                            ))}
                        </div>
                      )}
                      <div className="flex gap-4 mt-8">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setStep(2)}
                        >
                          Quay lại
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => setStep(4)}
                          disabled={!selectedSlot}
                        >
                          Tiếp tục
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <label className="font-medium">Chọn giờ</label>
                        <Select
                          value={selectedTime}
                          onValueChange={setSelectedTime}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giờ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="15:00">15:00</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setStep(2)}
                        >
                          Quay lại
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => setStep(4)}
                          disabled={!selectedTime}
                        >
                          Tiếp tục
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Bước 4: Xác nhận */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    4. Xác nhận thông tin đặt lịch
                  </h2>
                  <div className="mb-6">{summary}</div>
                  <div className="mb-4">
                    <label className="font-medium">Ghi chú</label>
                    <Textarea
                      placeholder="Nhập ghi chú cho buổi hẹn..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(3)}
                    >
                      Quay lại
                    </Button>
                    <Button size="lg" onClick={handleBookAppointment}>
                      Xác nhận đặt lịch
                    </Button>
                  </div>
                </div>
              )}
              {/* Thông báo kết quả */}
              {step === 5 && booking && (
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-bold text-green-600">
                    {booking.success
                      ? "Đặt lịch thành công!"
                      : "Đặt lịch thất bại"}
                  </h2>
                  <p>{booking.message}</p>
                  <Button size="lg" onClick={() => setStep(1)}>
                    Đặt lịch mới
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Cột phải: tóm tắt thông tin */}
        <div className="w-full md:w-96 flex-shrink-0">{summary}</div>
      </div>
    </div>
  );
}
