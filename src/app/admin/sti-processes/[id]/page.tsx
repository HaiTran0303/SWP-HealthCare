"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/services/api";
import StiProcessDetail from "@/components/StiProcessDetail";

export default function StiProcessDetailPage() {
  const { id } = useParams();
  const [process, setProcess] = useState<any>(null);
  useEffect(() => {
    if (id) {
      apiClient.get(`/sti-test-processes/${id}`).then(setProcess);
    }
  }, [id]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Chi tiết quy trình xét nghiệm</h1>
      <StiProcessDetail process={process} />
    </div>
  );
}
