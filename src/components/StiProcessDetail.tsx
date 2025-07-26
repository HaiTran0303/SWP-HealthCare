import { useState } from "react";
import { StiProcess, TestStatus, STITestingService } from "@/services/sti-testing.service";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { toast } from "@/components/ui/use-toast";

interface StiProcessDetailProps {
  process: StiProcess;
  onUpdateStatusSuccess?: () => void;
}

export default function StiProcessDetail({ process, onUpdateStatusSuccess }: StiProcessDetailProps) {
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

  if (!process) return <div>Đang tải...</div>;

  const handleOpenUpdateStatusDialog = () => {
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
    if (!process || !newStatus) return;

    try {
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

      Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

      await STITestingService.updateTestProcess(process.id, updatePayload);
      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Trạng thái của xét nghiệm ${process.testCode} đã được cập nhật thành ${STITestingService.getStatusText(newStatus)}.`,
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
      <div className="space-y-4">
        <div>
          <b>Bệnh nhân:</b> {process.patient?.fullName || "N/A"}
        </div>
        <div>
          <b>Dịch vụ:</b> {process.service?.name || "N/A"}
        </div>
        <div>
          <b>ID cuộc hẹn lấy mẫu:</b> {process.appointment?.id || "N/A"}
        </div>
        <div>
          <b>ID bác sĩ tư vấn:</b> {process.consultantDoctor?.id || "N/A"}
        </div>
        <div>
          <b>Ngày tạo:</b> {new Date(process.createdAt).toLocaleDateString()}
        </div>
        <div>
          <b>Loại mẫu:</b> {process.sampleType}
        </div>
        <div>
          <b>Độ ưu tiên:</b> {process.priority}
        </div>
        <div>
          <b>Thời gian dự kiến có kết quả:</b> {process.estimatedResultDate ? new Date(process.estimatedResultDate).toLocaleDateString() : "-"}
        </div>
        <div>
          <b>Địa điểm lấy mẫu:</b> {process.sampleCollectionLocation}
        </div>
        <div>
          <b>Ghi chú về quá trình:</b> {process.processNotes}
        </div>
        <div>
          <b>Yêu cầu tư vấn:</b> {process.requiresConsultation ? "Có" : "Không"}
        </div>
        <div>
          <b>Bảo mật:</b> {process.isConfidential ? "Có" : "Không"}
        </div>
        <div>
          <b>Thời gian thực tế có kết quả:</b> {process.actualResultDate ? new Date(process.actualResultDate).toLocaleDateString() : "-"}
        </div>
        <div>
          <b>Thời gian lấy mẫu:</b> {process.sampleCollectionDate ? new Date(process.sampleCollectionDate).toLocaleDateString() : "-"}
        </div>
        <div>
          <b>Ghi chú từ phòng lab:</b> {process.labNotes}
        </div>
        <div>
          <b>Người lấy mẫu:</b> {process.sampleCollectedBy}
        </div>
        <div>
          <b>Phòng lab xử lý:</b> {process.labProcessedBy}
        </div>
        <div>
          <b>Đã thông báo cho bệnh nhân:</b> {process.patientNotified ? "Có" : "Không"}
        </div>
        <div>
          <b>Đã gửi email kết quả:</b> {process.resultEmailSent ? "Có" : "Không"}
        </div>
        <div className="pt-4">
            <Button onClick={handleOpenUpdateStatusDialog}>Cập nhật trạng thái</Button>
        </div>
      </div>

      <AlertDialog
        open={isUpdateStatusDialogOpen}
        onOpenChange={setIsUpdateStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cập nhật trạng thái xét nghiệm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang cập nhật trạng thái cho xét nghiệm{" "}
              <b>{process?.testCode}</b>.
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
