"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { useRouter } from "next/navigation";
import StiProcessTable from "@/components/StiProcessTable";

export default function StiProcessAdminPage() {
  const [processes, setProcesses] = useState<any[]>([]);
  const router = useRouter();
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
        onRowClick={(p: any) => router.push(`/admin/sti-processes/${p.id}`)}
      />
    </div>
  );
}
