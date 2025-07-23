"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MenstrualService, CycleData } from "@/services/menstrual.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface MenstrualCycleDetailProps {
  cycleId: string;
}

export const MenstrualCycleDetail: React.FC<MenstrualCycleDetailProps> = ({
  cycleId,
}) => {
  const {
    data: cycleData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["menstrual-cycle", cycleId],
    queryFn: () => MenstrualService.getCycle(cycleId),
    enabled: !!cycleId, // Only run query if cycleId is available
  });

  const cycle = cycleData?.data;

  if (isLoading) {
    return <div className="text-center py-4">Đang tải chi tiết chu kỳ...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">
        Lỗi: {error?.message || "Không thể tải chi tiết chu kỳ."}
      </div>
    );
  }

  if (!cycle) {
    return <div className="text-center py-4">Không tìm thấy chi tiết chu kỳ.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiết chu kỳ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <p>
            <strong>ID chu kỳ:</strong> {cycle.id}
          </p>
          <p>
            <strong>Ngày bắt đầu:</strong>{" "}
            {format(new Date(cycle.cycleStartDate), "dd/MM/yyyy")}
          </p>
          <p>
            <strong>Ngày kết thúc:</strong>{" "}
            {cycle.cycleEndDate
              ? format(new Date(cycle.cycleEndDate), "dd/MM/yyyy")
              : "N/A"}
          </p>
          <p>
            <strong>Ghi chú:</strong> {cycle.notes || "Không có"}
          </p>
        </div>
        <Separator className="my-4" />
        <h4 className="text-lg font-semibold mb-2">Thông tin bổ sung</h4>
        <p className="text-sm text-gray-500">
          (Các thông tin khác như triệu chứng, dự đoán, v.v. sẽ được hiển thị ở đây nếu có.)
        </p>
      </CardContent>
    </Card>
  );
};
