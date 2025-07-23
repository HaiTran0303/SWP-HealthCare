"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import StiProcessTable from "@/components/StiProcessTable";

export default function StiProcessAdminPage() {
  const [processes, setProcesses] = useState<any[]>([]);
  
  useEffect(() => {
    apiClient
      .post("/sti-test-processes/search", {})
      .then((data: any) => setProcesses(data.data || []));
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Quản lý quy trình xét nghiệm STI
      </h1>
      <StiProcessTable
        processes={processes}
        onViewDetail={(process: any) => {
          // Có thể thêm logic xử lý khi xem chi tiết nếu cần
          console.log("Viewing detail of process:", process);
        }}
      />
    </div>
  );
}
