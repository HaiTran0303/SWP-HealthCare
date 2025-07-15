"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";

export default function ConfirmInfoPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    // Show AuthDialog if user is not authenticated
    return <AuthDialog trigger={<div className="sr-only"></div>} defaultTab="signin" />;
  }

  const handleBack = () => {
    router.back(); // Go back to the previous page
  };

  const handleContinue = () => {
    // Logic for continuing, e.g., navigate to the next step in a flow
    // For now, redirect to the home page or a placeholder
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Xác nhận thông tin cá nhân</h1>

        <div className="mb-4">
          <p className="text-lg">
            <span className="font-semibold">Họ tên:</span> {user.fullName}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            onClick={handleBack}
            className="rounded-md border border-black bg-white px-6 py-2 text-black shadow-sm hover:bg-gray-100"
            type="button"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleContinue}
            className="rounded-md bg-black px-6 py-2 text-white shadow-sm hover:bg-gray-800"
            type="button"
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
}
