import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StiProcessDetail from "@/components/StiProcessDetail";
import { STITestingService, StiProcess } from "@/services/sti-testing.service";

interface StiProcessTableProps {
  processes: StiProcess[];
  onViewDetail?: (process: StiProcess) => void;
  onUpdateStatusSuccess?: () => void;
}

export default function StiProcessTable({
  processes,
  onViewDetail,
  onUpdateStatusSuccess,
}: StiProcessTableProps) {
  const [selectedProcess, setSelectedProcess] = useState<StiProcess | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleViewDetail = (process: StiProcess) => {
    setSelectedProcess(process);
    setIsDetailDialogOpen(true);
    if (onViewDetail) {
      onViewDetail(process);
    }
  };

  return (
    <>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Mã</th>
            <th className="px-4 py-2 text-left">Bệnh nhân</th>
            <th className="px-4 py-2 text-left">Dịch vụ</th>
            <th className="px-4 py-2 text-left">Trạng thái</th>
            <th className="px-4 py-2 text-left">Ngày tạo</th>
            <th className="px-4 py-2 text-left">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 border-t">
              <td className="px-4 py-2">{p.testCode}</td>
              <td className="px-4 py-2">{p.patient?.fullName || "-"}</td>
              <td className="px-4 py-2">{p.service?.name}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STITestingService.getStatusColor(p.status) === "green"
                      ? "bg-green-100 text-green-800"
                      : STITestingService.getStatusColor(p.status) === "blue"
                      ? "bg-blue-100 text-blue-800"
                      : STITestingService.getStatusColor(p.status) === "yellow"
                      ? "bg-yellow-100 text-yellow-800"
                      : STITestingService.getStatusColor(p.status) === "orange"
                      ? "bg-orange-100 text-orange-800"
                      : STITestingService.getStatusColor(p.status) === "purple"
                      ? "bg-purple-100 text-purple-800"
                      : STITestingService.getStatusColor(p.status) === "red"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {STITestingService.getStatusText(p.status)}
                </span>
              </td>
              <td className="px-4 py-2">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetail(p)}
                >
                  Chi tiết
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết quy trình xét nghiệm</DialogTitle>
            <DialogDescription>
              Mã: {selectedProcess?.testCode}
            </DialogDescription>
          </DialogHeader>
          {selectedProcess && (
            <StiProcessDetail
              process={selectedProcess}
              onUpdateStatusSuccess={() => {
                setIsDetailDialogOpen(false);
                onUpdateStatusSuccess?.();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
