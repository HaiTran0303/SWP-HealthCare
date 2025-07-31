"use client";

import React, { useState } from "react";
import { CycleData } from "@/services/menstrual.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { MenstrualCycleDetail } from "@/components/MenstrualCycleDetail";

interface MenstrualCycleHistoryProps {
  cycles: CycleData[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const MenstrualCycleHistory: React.FC<MenstrualCycleHistoryProps> = ({
  cycles,
  isLoading,
  isError,
  error,
}) => {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  console.log("MenstrualCycleHistory received cycles:", cycles);

  const handleBackToList = () => {
    setSelectedCycleId(null);
  };

  if (isLoading) {
    return <div className="text-center py-4">Đang tải lịch sử chu kỳ...</div>;
  }

  if (isError) {
    return <div className="text-center py-4 text-red-500">Lỗi: {error?.message || "Không thể tải lịch sử chu kỳ."}</div>;
  }

  if (selectedCycleId) {
    return (
      <div>
        <Button onClick={handleBackToList} className="mb-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <MenstrualCycleDetail cycleId={selectedCycleId} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử chu kỳ</CardTitle>
      </CardHeader>
      <CardContent>
        {cycles.length === 0 ? (
          <p>Không có dữ liệu lịch sử chu kỳ nào.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle: any) => ( // Cast to any to access 'id' for now, will refine types later
                <TableRow key={cycle.id}>
                  <TableCell>{format(new Date(cycle.cycleStartDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {cycle.cycleEndDate
                      ? format(new Date(cycle.cycleEndDate), "dd/MM/yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{cycle.notes || "Không có"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
