import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StiProcessDetail from "@/components/StiProcessDetail";
import { STITestingService, TestStatus, StiProcess, UpdateStiTestProcessDto } from "@/services/sti-testing.service";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TestStatus | null>(null);
  const [updateNotes, setUpdateNotes] = useState<string>("");
  const [actualResultDate, setActualResultDate] = useState<Date | undefined>(undefined);
  const [sampleCollectionDate, setSampleCollectionDate] = useState<Date | undefined>(undefined);
  const [labNotes, setLabNotes] = useState<string>("");
  const [sampleCollectedBy, setSampleCollectedBy] = useState<string>("");
  const [labProcessedBy, setLabProcessedBy] = useState<string>("");
  const [patientNotified, setPatientNotified] = useState<boolean>(false);
  const [resultEmailSent, setResultEmailSent] = useState<boolean>(false);
  const [requiresConsultation, setRequiresConsultation] = useState<boolean>(false);
  const [isConfidential, setIsConfidential] = useState<boolean>(false);
  const router = useRouter();

  const handleViewDetail = (process: StiProcess) => {
    setSelectedProcess(process);
    setIsDetailDialogOpen(true);
    if (onViewDetail) {
      onViewDetail(process);
    }
  };

  const handleOpenUpdateStatusDialog = (process: StiProcess) => {
    setSelectedProcess(process);
    setNewStatus(process.status);
    setUpdateNotes(process.processNotes || "");
    setActualResultDate(process.actualResultDate ? new Date(process.actualResultDate) : undefined);
    setSampleCollectionDate(process.sampleCollectionDate ? new Date(process.sampleCollectionDate) : undefined);
    setLabNotes(process.labNotes || "");
    setSampleCollectedBy(process.sampleCollectedBy || "");
    setLabProcessedBy(process.labProcessedBy || "");
    setPatientNotified(process.patientNotified);
    setResultEmailSent(process.resultEmailSent);
    setRequiresConsultation(process.requiresConsultation);
    setIsConfidential(process.isConfidential);
    setIsUpdateStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedProcess || !newStatus) return;

    try {
      // Prepare the update payload based on the new status and other fields
      const updatePayload: any = {
        status: newStatus,
        processNotes: updateNotes,
        actualResultDate: actualResultDate?.toISOString(),
        sampleCollectionDate: sampleCollectionDate?.toISOString(),
        labNotes: labNotes,
        sampleCollectedBy: sampleCollectedBy,
        labProcessedBy: labProcessedBy,
        patientNotified: patientNotified,
        resultEmailSent: resultEmailSent,
        requiresConsultation: requiresConsultation,
        isConfidential: isConfidential,
      };

      // Remove undefined values
      Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

      await STITestingService.updateTestProcess(selectedProcess.id, updatePayload);
      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Trạng thái của xét nghiệm ${selectedProcess.testCode} đã được cập nhật thành ${STITestingService.getStatusText(newStatus)}.`,
      });
      setIsUpdateStatusDialogOpen(false);
      if (onUpdateStatusSuccess) {
        onUpdateStatusSuccess();
      }
    } catch (error) {
      console.error("Failed to update STI process status:", error);
      toast({
        title: "Cập nhật trạng thái thất bại",
        description: "Đã có lỗi xảy ra khi cập nhật trạng thái xét nghiệm.",
        variant: "destructive",
      });
    }
  };

  const availableStatuses: TestStatus[] = [
    "ordered",
    "sample_collection_scheduled",
    "sample_collected",
    "processing",
    "result_ready",
    "result_delivered",
    "consultation_required",
    "follow_up_scheduled",
    "completed",
    "cancelled",
  ];

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
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(p)}
                  >
                    Chi tiết
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Cập nhật TT
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availableStatuses.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => {
                            setSelectedProcess(p);
                            setNewStatus(status);
                            handleOpenUpdateStatusDialog(p);
                          }}
                        >
                          {STITestingService.getStatusText(status)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
          {selectedProcess && <StiProcessDetail process={selectedProcess} />}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <AlertDialog
        open={isUpdateStatusDialogOpen}
        onOpenChange={setIsUpdateStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cập nhật trạng thái xét nghiệm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang cập nhật trạng thái cho xét nghiệm{" "}
              <b>{selectedProcess?.testCode}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Trạng thái mới
              </Label>
              <Select
                onValueChange={(value: TestStatus) => setNewStatus(value)}
                value={newStatus || ""}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STITestingService.getStatusText(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional fields based on status */}
            {newStatus === "sample_collected" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sampleCollectionDate" className="text-right">
                    Ngày lấy mẫu
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !sampleCollectionDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {sampleCollectionDate ? (
                          format(sampleCollectionDate, "PPP")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={sampleCollectionDate}
                        onSelect={setSampleCollectionDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sampleCollectedBy" className="text-right">
                    Người lấy mẫu
                  </Label>
                  <Input
                    id="sampleCollectedBy"
                    value={sampleCollectedBy}
                    onChange={(e) => setSampleCollectedBy(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </>
            )}

            {newStatus === "result_ready" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="actualResultDate" className="text-right">
                    Ngày có kết quả
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !actualResultDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {actualResultDate ? (
                          format(actualResultDate, "PPP")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={actualResultDate}
                        onSelect={setActualResultDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="labNotes" className="text-right">
                    Ghi chú Lab
                  </Label>
                  <Textarea
                    id="labNotes"
                    value={labNotes}
                    onChange={(e) => setLabNotes(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="labProcessedBy" className="text-right">
                    Lab xử lý
                  </Label>
                  <Input
                    id="labProcessedBy"
                    value={labProcessedBy}
                    onChange={(e) => setLabProcessedBy(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="flex items-center space-x-2 col-start-2 col-span-3">
                  <Checkbox
                    id="requiresConsultation"
                    checked={requiresConsultation}
                    onCheckedChange={(checked: boolean) => setRequiresConsultation(checked)}
                  />
                  <Label htmlFor="requiresConsultation">Yêu cầu tư vấn</Label>
                </div>
                <div className="flex items-center space-x-2 col-start-2 col-span-3">
                  <Checkbox
                    id="isConfidential"
                    checked={isConfidential}
                    onCheckedChange={(checked: boolean) => setIsConfidential(checked)}
                  />
                  <Label htmlFor="isConfidential">Bảo mật</Label>
                </div>
              </>
            )}

            {newStatus === "result_delivered" && (
              <>
                <div className="flex items-center space-x-2 col-start-2 col-span-3">
                  <Checkbox
                    id="patientNotified"
                    checked={patientNotified}
                    onCheckedChange={(checked: boolean) => setPatientNotified(checked)}
                  />
                  <Label htmlFor="patientNotified">Đã thông báo cho bệnh nhân</Label>
                </div>
                <div className="flex items-center space-x-2 col-start-2 col-span-3">
                  <Checkbox
                    id="resultEmailSent"
                    checked={resultEmailSent}
                    onCheckedChange={(checked: boolean) => setResultEmailSent(checked)}
                  />
                  <Label htmlFor="resultEmailSent">Đã gửi email kết quả</Label>
                </div>
              </>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="updateNotes" className="text-right">
                Ghi chú quá trình
              </Label>
              <Textarea
                id="updateNotes"
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus}>
              Cập nhật
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
