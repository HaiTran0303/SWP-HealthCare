"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser, isLoading } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    gender: user?.gender || "",
  });
  const [avatar, setAvatar] = useState<string | undefined>(
    user?.profilePicture
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      gender: user?.gender || "",
    });
  };

  const handleSave = async () => {
    setLoading(true);
    if (!form.firstName || !form.lastName) {
      toast({
        title: "Vui lòng nhập đầy đủ họ và tên",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    const payload: Partial<typeof form> = { ...form };
    if (!payload.gender) delete payload.gender;
    try {
      const updated = await apiClient.patch<any>("/users/me", payload);
      const freshUser = await apiClient.get<any>("/users/me");
      setUser({ ...user, ...freshUser });
      setEditMode(false);
      toast({ title: "Cập nhật thành công" });
    } catch (err: any) {
      let message = "Có lỗi xảy ra";
      if (err?.data?.message) message = err.data.message;
      else if (err?.message) message = err.message;
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", "user");
    formData.append("entityId", user?.id || "");
    formData.append("altText", user?.fullName || user?.email || "Avatar");
    formData.append("isPublic", "true");
    try {
      setLoading(true);
      const res = await apiClient.post<any>("/files/image", formData);
      if (res && res.id) {
        const updated = await apiClient.get<any>("/users/me");
        setUser(updated);
        toast({ title: "Cập nhật ảnh đại diện thành công" });
      }
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };
  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: "Mật khẩu mới không khớp", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await apiClient.put<any>("/users/me/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast({ title: "Đổi mật khẩu thành công" });
      setShowChangePassword(false);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <img
            src={user?.profilePicture || "/images/avatar-default.svg"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />
          {editMode && (
            <button
              className="absolute bottom-0 right-0 bg-white border rounded-full p-1 shadow"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <span role="img" aria-label="upload">
                📷
              </span>
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <div className="font-semibold text-lg">
            {user?.fullName || user?.firstName + " " + user?.lastName}
          </div>
          <div className="text-muted-foreground">{user?.email}</div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Họ</Label>
          <Input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            disabled={!editMode}
            placeholder="Nhập họ của bạn"
          />
        </div>
        <div>
          <Label>Tên</Label>
          <Input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            disabled={!editMode}
            placeholder="Nhập tên của bạn"
          />
        </div>
        <div>
          <Label>Số điện thoại</Label>
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={!editMode}
            placeholder="Nhập số điện thoại"
          />
        </div>
        <div>
          <Label>Địa chỉ</Label>
          <Input
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={!editMode}
            placeholder="Nhập địa chỉ"
          />
        </div>
        <div>
          <Label>Giới tính</Label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Chọn giới tính</option>
            <option value="M">Nam</option>
            <option value="F">Nữ</option>
          </select>
        </div>
      </div>
      {!editMode &&
        (!user?.firstName ||
          !user?.lastName ||
          !user?.phone ||
          !user?.address ||
          !user?.gender) && (
          <div className="text-sm text-muted-foreground mt-2">
            Bạn chưa cập nhật đầy đủ thông tin cá nhân. Hãy nhấn{" "}
            <b>Chỉnh sửa</b> để bổ sung!
          </div>
        )}
      <div className="flex gap-2 mt-6">
        {editMode ? (
          <>
            <Button onClick={handleSave} disabled={loading}>
              Lưu
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Huỷ
            </Button>
          </>
        ) : (
          <Button onClick={handleEdit}>Chỉnh sửa</Button>
        )}
        <Button
          className="border border-black rounded-md text-black"
          variant="ghost"
          onClick={() => setShowChangePassword((v) => !v)}
        >
          Đổi mật khẩu
        </Button>
      </div>
      {showChangePassword && (
        <div className="mt-6 space-y-2 border-t pt-4">
          <Label>Mật khẩu cũ</Label>
          <div className="relative">
            <Input
              name="currentPassword"
              type={showPassword.old ? "text" : "password"}
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
              tabIndex={-1}
              onClick={() =>
                setShowPassword((prev) => ({ ...prev, old: !prev.old }))
              }
            >
              {showPassword.old ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Label>Mật khẩu mới</Label>
          <div className="relative">
            <Input
              name="newPassword"
              type={showPassword.new ? "text" : "password"}
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
              tabIndex={-1}
              onClick={() =>
                setShowPassword((prev) => ({ ...prev, new: !prev.new }))
              }
            >
              {showPassword.new ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Label>Nhập lại mật khẩu mới</Label>
          <div className="relative">
            <Input
              name="confirmPassword"
              type={showPassword.confirm ? "text" : "password"}
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
              tabIndex={-1}
              onClick={() =>
                setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
              }
            >
              {showPassword.confirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Button
            className="mt-2"
            onClick={handleChangePassword}
            disabled={loading}
          >
            Xác nhận đổi mật khẩu
          </Button>
        </div>
      )}
    </div>
  );
}
