"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import StiProcessTable from "@/components/StiProcessTable";

export default function StiHistoryPage() {
  const { user } = useAuth();
  const [processes, setProcesses] = useState<any[]>([]);
  useEffect(() => {
    if (user?.id) {
      apiClient
        .post(`/sti-test-processes/patient/${user.id}`, {})
        .then((data: any) => setProcesses(data.data || []));
    }
  }, [user?.id]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6" aria-label="Lịch sử xét nghiệm STI">Lịch sử xét nghiệm STI</h1>
      <StiProcessTable processes={processes} />
    </div>
  );
}
