"use client";
import { useEffect, useState, useCallback } from "react";
import { STITestingService, StiProcess } from "@/services/sti-testing.service";
import StiProcessTable from "@/components/StiProcessTable";
import { useRouter } from "next/navigation";

export default function StiProcessAdminPage() {
  const [processes, setProcesses] = useState<StiProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await STITestingService.getAllTests({});
      setProcesses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch STI processes:", error);
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const handleViewDetail = (process: StiProcess) => {
    router.push(`/admin/sti-processes/${process.id}`);
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Quản lý quy trình xét nghiệm STI
      </h1>
      <StiProcessTable
        processes={processes}
        onViewDetail={handleViewDetail}
        onUpdateStatusSuccess={fetchProcesses}
      />
    </div>
  );
}
