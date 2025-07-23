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

export default function StiProcessTable({ processes, onViewDetail }: any) {
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetail = (process: any) => {
    setSelectedProcess(process);
    setIsDialogOpen(true);
    if (onViewDetail) {
      onViewDetail(process);
    }
  };

  return (
    <>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Bệnh nhân</th>
            <th>Dịch vụ</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            {onViewDetail && <th></th>}
          </tr>
        </thead>
        <tbody>
          {processes.map((p: any) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td>{p.testCode}</td>
              <td>{p.patient?.fullName || "-"}</td>
              <td>{p.service?.name}</td>
              <td>{p.status}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              {onViewDetail && (
                <td>
                  <Button
                    variant="link"
                    onClick={() => handleViewDetail(p)}
                    className="p-0"
                  >
                    Chi tiết
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết quy trình xét nghiệm</DialogTitle>
            <DialogDescription>
              Mã: {selectedProcess?.testCode}
            </DialogDescription>
          </DialogHeader>
          {selectedProcess && <StiProcessDetail process={selectedProcess} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
