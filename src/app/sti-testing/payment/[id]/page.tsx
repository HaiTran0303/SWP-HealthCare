"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function StiTestingPaymentPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!id || !token) {
      setError("Thiếu thông tin xét nghiệm STI hoặc chưa đăng nhập.");
      setLoading(false);
      return;
    }
    const createPayment = async () => {
      try {
        const res = await fetch(
          "https://gender-healthcare.org/payments/sti-test-processes", // Adjusted API endpoint
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              stiTestProcessId: id, // Adjusted ID parameter
              description: "Thanh toán xét nghiệm STI", // Adjusted description
              frontendReturnUrl: `${window.location.origin}/sti-testing/payment/success`, // Adjusted return URL
              frontendCancelUrl: `${window.location.origin}/sti-testing/payment/cancel?stiTestProcessId=${id}`, // Adjusted cancel URL
            }),
          }
        );
        const data = await res.json();
        if (data?.data?.paymentUrl) {
          window.location.href = data.data.paymentUrl;
        } else if (data?.data?.approvalUrl) {
          window.location.href = data.data.approvalUrl;
        } else if (data?.data?.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
        } else {
          setError(data.message || "Không thể tạo thanh toán.");
        }
      } catch (e) {
        setError("Không thể tạo thanh toán.");
      } finally {
        setLoading(false);
      }
    };
    createPayment();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-10">
        Đang chuyển hướng đến cổng thanh toán...
      </div>
    );
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  return null;
}
