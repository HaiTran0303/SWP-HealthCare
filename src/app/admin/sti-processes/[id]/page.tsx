"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/services/api";
import StiProcessDetail from "@/components/StiProcessDetail";
import { StiProcess } from "@/types/sti-appointment"; // Assuming this type exists

export default function StiProcessDetailPage() {
  const { id } = useParams();
  const [processDetail, setProcessDetail] = useState<StiProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient
        .get(`/sti-test-processes/${id}`)
        .then((data: any) => {
          setProcessDetail(data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch STI process detail:", err);
          setError("Không thể tải chi tiết quy trình xét nghiệm.");
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">Đang tải...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!processDetail) {
    return (
      <div className="container mx-auto py-8 text-center">
        Không tìm thấy chi tiết quy trình xét nghiệm.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Chi tiết quy trình xét nghiệm STI
      </h1>
      <StiProcessDetail process={processDetail} />
    </div>
  );
}
