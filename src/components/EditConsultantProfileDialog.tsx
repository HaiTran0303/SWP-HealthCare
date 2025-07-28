"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConsultantProfile, ConsultantService, UpdateConsultantProfileDto } from "@/services/consultant.service";
import { MultiSelect } from "@/components/ui/multi-select"; // Assuming you have a MultiSelect component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  specialties: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một chuyên môn."),
  qualification: z.string().min(1, "Vui lòng nhập trình độ học vấn."),
  experience: z.string().min(1, "Vui lòng nhập kinh nghiệm làm việc."),
  bio: z.string().optional(),
  consultationFee: z.number().min(0, "Phí tư vấn phải là số dương."),
  consultationFeeType: z.enum(["hourly", "per_session", "per_service"]),
  sessionDurationMinutes: z.number().min(1, "Thời lượng phiên phải là số dương."),
  languages: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một ngôn ngữ."),
  consultationTypes: z.array(z.enum(["online", "office"])).min(1, "Vui lòng chọn ít nhất một loại hình tư vấn."),
});

interface EditConsultantProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: ConsultantProfile | null;
  onSave: (updatedProfile: ConsultantProfile) => void;
}

const MOCK_SPECIALTIES = [
  "Tư vấn tâm lý",
  "Sức khỏe sinh sản",
  "Dinh dưỡng",
  "Sức khỏe tình dục",
  "Tâm thần học",
  "Nội tiết",
];

const MOCK_LANGUAGES = [
  "Tiếng Việt",
  "Tiếng Anh",
  "Tiếng Pháp",
  "Tiếng Trung",
];

export function EditConsultantProfileDialog({
  isOpen,
  onClose,
  currentProfile,
  onSave,
}: EditConsultantProfileDialogProps) {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialties: currentProfile?.specialties ?? [],
      qualification: currentProfile?.qualification ?? "",
      experience: currentProfile?.experience ?? "",
      bio: currentProfile?.bio ?? "",
      consultationFee: currentProfile?.consultationFee ?? 0,
      consultationFeeType: currentProfile?.consultationFeeType ?? "per_session",
      sessionDurationMinutes: currentProfile?.sessionDurationMinutes ?? 60,
      languages: currentProfile?.languages ?? ["Tiếng Việt"],
      consultationTypes: currentProfile?.consultationTypes ?? ["online"],
    } as z.infer<typeof formSchema>,
  });

  useEffect(() => {
    if (currentProfile) {
      form.reset({
        specialties: currentProfile.specialties || [],
        qualification: currentProfile.qualification || "",
        experience: currentProfile.experience || "",
        bio: currentProfile.bio || "",
        consultationFee: currentProfile.consultationFee || 0,
        consultationFeeType: currentProfile.consultationFeeType || "per_session",
        sessionDurationMinutes: currentProfile.sessionDurationMinutes || 60,
        languages: currentProfile.languages || ["Tiếng Việt"],
        consultationTypes: currentProfile.consultationTypes || ["online"],
      });
    }
  }, [currentProfile, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID người dùng.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let updatedProfile: ConsultantProfile;
      const payload: UpdateConsultantProfileDto = {
        ...values,
        userId: user.id, // Ensure userId is included for new profile creation if needed, though updateMyProfile doesn't strictly need it in path
      };

      if (currentProfile) {
        // Update existing profile
        updatedProfile = await ConsultantService.updateMyProfile(payload);
      } else {
        // Create new profile (this path should ideally be handled by CreateConsultantProfile, but included for completeness if logic changes)
        // Note: The RegisterConsultantDto in swagger requires more fields (email, password, etc.)
        // This `createConsultant` call might need adjustment based on actual backend implementation for creating profile for existing user.
        updatedProfile = await ConsultantService.createConsultant(payload);
      }

      // Update user context with the new/updated consultant profile
      setUser((prevUser) => {
        if (prevUser) {
          return { ...prevUser, consultantProfile: updatedProfile };
        }
        return prevUser;
      });

      toast({
        title: "Thành công",
        description: currentProfile ? "Đã cập nhật hồ sơ tư vấn viên." : "Đã tạo hồ sơ tư vấn viên. Hồ sơ đang chờ duyệt.",
      });
      onSave(updatedProfile);
      onClose();
    } catch (err: any) {
      console.error("Error saving consultant profile:", err);
      toast({
        title: "Lỗi",
        description: err?.data?.message || "Không thể lưu hồ sơ tư vấn viên. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{currentProfile ? "Chỉnh sửa hồ sơ tư vấn viên" : "Tạo hồ sơ tư vấn viên"}</DialogTitle>
          <DialogDescription>
            {currentProfile ? "Cập nhật thông tin hồ sơ của bạn." : "Điền thông tin để tạo hồ sơ tư vấn viên."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chuyên môn</FormLabel>
                  <FormControl>
                    <MultiSelect
                      selected={field.value}
                      options={MOCK_SPECIALTIES.map((s) => ({ label: s, value: s }))}
                      onSelectedChange={field.onChange}
                      placeholder="Chọn chuyên môn..."
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trình độ học vấn</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Thạc sĩ Tâm lý học" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kinh nghiệm làm việc</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: 5 năm kinh nghiệm tư vấn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiểu sử</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Giới thiệu về bản thân và phong cách tư vấn của bạn..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consultationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phí tư vấn (VND)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ví dụ: 500000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consultationFeeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại phí tư vấn</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phí" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hourly">Theo giờ</SelectItem>
                      <SelectItem value="per_session">Theo phiên</SelectItem>
                      <SelectItem value="per_service">Theo dịch vụ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sessionDurationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời lượng phiên (phút)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ví dụ: 60"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngôn ngữ</FormLabel>
                  <FormControl>
                    <MultiSelect
                      selected={field.value}
                      options={MOCK_LANGUAGES.map((l) => ({ label: l, value: l }))}
                      onSelectedChange={field.onChange}
                      placeholder="Chọn ngôn ngữ..."
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consultationTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình thức tư vấn</FormLabel>
                  <FormControl>
                    <MultiSelect
                      selected={field.value}
                      options={[
                        { label: "Trực tuyến", value: "online" },
                        { label: "Tại văn phòng", value: "office" },
                      ]}
                      onSelectedChange={field.onChange}
                      placeholder="Chọn hình thức tư vấn..."
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu hồ sơ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
