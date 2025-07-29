"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { registerConsultant } from "@/services/consultant.service";
import { Eye, EyeOff } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_CERT_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ALLOWED_CV_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const formSchema = z.object({
  firstName: z.string().min(1, "Họ không được để trống"),
  lastName: z.string().min(1, "Tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  specialties: z.string().min(1, "Chuyên môn không được để trống"),
  qualification: z.string().min(1, "Bằng cấp không được để trống"),
  experience: z.string().min(1, "Kinh nghiệm không được để trống"),
  bio: z.string().min(1, "Giới thiệu không được để trống"),
  cv: z.instanceof(FileList)
    .refine((files) => files?.length === 1, "CV là bắt buộc.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Kích thước file tối đa là 5MB.`)
    .refine(
      (files) => ALLOWED_CV_TYPES.includes(files?.[0]?.type),
      "Chỉ hỗ trợ file .pdf và .docx"
    ),
  certificates: z.instanceof(FileList)
    .refine((files) => files?.length > 0, "Cần ít nhất một chứng chỉ.")
    .refine((files) => files?.length <= 5, "Tối đa 5 chứng chỉ.")
    .refine((files) => Array.from(files).every((file: any) => file.size <= MAX_FILE_SIZE), `Kích thước file tối đa là 5MB.`)
    .refine((files) => Array.from(files).every((file: any) => ALLOWED_CERT_TYPES.includes(file.type)), "Chỉ hỗ trợ file .jpg, .png, .pdf"),
});

export default function ConsultantRegistrationForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      specialties: "",
      qualification: "",
      experience: "",
      bio: "",
      cv: undefined,
      certificates: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log("Consultant registration form values:", values);
    const formData = new FormData();

    try {
      // Handle all fields
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'specialties') {
          const specialtiesArray = (value as string).split(',').map(s => s.trim()).filter(s => s);
          // Backend might expect array format with indices
          specialtiesArray.forEach((specialty, index) => {
            formData.append(`specialties[${index}]`, specialty);
          });
        } else if (key === 'certificates') {
          Array.from(value as FileList).forEach((file: File) => {
            formData.append('certificates', file);
          });
        } else if (key === 'cv') {
          formData.append('cv', (value as FileList)[0]);
        } else {
          formData.append(key, value as string);
        }
      });

      // For debugging: log FormData entries
      console.log("FormData to be sent:");
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      await registerConsultant(formData);
      toast({
        title: "Đăng ký thành công",
        description: "Hồ sơ của bạn đã được gửi đi để xét duyệt.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Consultant registration error:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng ký",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ</FormLabel>
                <FormControl>
                  <Input placeholder="Họ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder="Tên" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Nhập email của bạn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tạo mật khẩu"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chuyên môn</FormLabel>
              <FormControl>
                <Input placeholder="VD: Tâm lý học, Sức khỏe sinh sản" {...field} />
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
              <FormLabel>Bằng cấp</FormLabel>
              <FormControl>
                <Input placeholder="VD: Cử nhân Tâm lý học" {...field} />
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
              <FormLabel>Kinh nghiệm</FormLabel>
              <FormControl>
                <Input placeholder="VD: 5 năm kinh nghiệm tư vấn" {...field} />
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
              <FormLabel>Giới thiệu bản thân</FormLabel>
              <FormControl>
                <Textarea placeholder="Viết một vài dòng giới thiệu về bạn..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CV (PDF, DOCX)</FormLabel>
              <FormControl>
                <Input type="file" accept=".pdf,.docx" {...form.register("cv")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="certificates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chứng chỉ (tối đa 5 file PDF)</FormLabel>
              <FormControl>
                <Input type="file" multiple accept="image/jpeg,image/png,application/pdf" {...form.register("certificates")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang gửi..." : "Gửi đơn đăng ký"}
        </Button>
      </form>
    </Form>
  );
}
