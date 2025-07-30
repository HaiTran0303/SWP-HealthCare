import React, { useEffect, useState } from "react";
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
import { TestResultResponseDto, TestResultItem } from "@/types/api.d"; // Import TestResultResponseDto and TestResultItem
import { FileText } from "lucide-react"; // Import FileText icon

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
  const [testResult, setTestResult] = useState<TestResultResponseDto | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  useEffect(() => {
    const fetchTestResult = async () => {
      if (process.testResult?.id) {
        setIsLoadingResult(true);
        try {
          const result = await STITestingService.getMyTestResultDetails(process.testResult.id);
          setTestResult(result);
        } catch (error) {
          console.error("Failed to fetch test result details:", error);
          toast({
            title: "Lỗi",
            description: "Không thể tải chi tiết kết quả xét nghiệm.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingResult(false);
        }
      }
    };

    fetchTestResult();
  }, [process.testResult?.id]);

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

      await STITestingService.updateTestStatus(process.id, newStatus);
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

  const handleExportPdf = async () => {
    if (!process.id) return;
    try {
      const pdfBlob = await STITestingService.exportStiTestResultPdf(process.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ket_qua_xet_nghiem_STI_${process.testCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Tải PDF thành công",
        description: "Kết quả xét nghiệm đã được tải về.",
      });
    } catch (error) {
      console.error("Failed to export STI test result PDF:", error);
      toast({
        title: "Tải PDF thất bại",
        description: "Đã có lỗi xảy ra khi tải file PDF kết quả xét nghiệm.",
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
          <b>Bệnh nhân:</b> {process.patient?.firstName} {process.patient?.lastName || "Không có"}
        </div>
        <div>
          <b>Dịch vụ:</b> {process.service?.name || "Không có"}
        </div>
        {process.appointment && (
          <>
            <div>
              <b>ID Cuộc hẹn:</b> {process.appointment.id || "Không có"}
            </div>
            <div>
              <b>Ngày cuộc hẹn:</b> {process.appointment.appointmentDate ? new Date(process.appointment.appointmentDate).toLocaleString() : "Không có"}
            </div>
            <div>
              <b>Trạng thái cuộc hẹn:</b> {process.appointment.status || "Không có"}
            </div>
            <div>
              <b>Địa điểm cuộc hẹn:</b> {process.appointment.appointmentLocation || "Không có"}
            </div>
            <div>
              <b>Ghi chú cuộc hẹn:</b> {process.appointment.notes || "Không có"}
            </div>
            <div>
              <b>Link cuộc hẹn:</b> {process.appointment.meetingLink || "Không có"}
            </div>
            <div>
              <b>Giá cố định:</b> {process.appointment.fixedPrice ? parseFloat(process.appointment.fixedPrice).toLocaleString() + "đ" : "Không có"}
            </div>
            <div>
              <b>Loại chọn TVV:</b> {process.appointment.consultantSelectionType || "Không có"}
            </div>
            <div>
              <b>Lý do hủy:</b> {process.appointment.cancellationReason || "Không có"}
            </div>
            <div>
              <b>Thời gian check-in:</b> {process.appointment.checkInTime ? new Date(process.appointment.checkInTime).toLocaleString() : "Không có"}
            </div>
            <div>
              <b>Thời gian check-out:</b> {process.appointment.checkOutTime ? new Date(process.appointment.checkOutTime).toLocaleString() : "Không có"}
            </div>
            <div>
              <b>Người dùng cuộc hẹn:</b> {process.appointment.user?.firstName} {process.appointment.user?.lastName || "Không có"}
            </div>
            <div>
              <b>TVV cuộc hẹn:</b> {process.appointment.consultant?.firstName} {process.appointment.consultant?.lastName || "Không có"}
            </div>
          </>
        )}
        <div>
          <b>Bác sĩ tư vấn:</b> {process.consultantDoctor?.firstName} {process.consultantDoctor?.lastName || "Không có"}
        </div>
        <div>
          <b>Ngày tạo:</b> {process.createdAt ? new Date(process.createdAt).toLocaleDateString() : "Không có"}
        </div>
        <div>
          <b>Loại mẫu:</b> {process.sampleType || "Không có"}
        </div>
        <div>
          <b>Độ ưu tiên:</b> {process.priority || "Không có"}
        </div>
        <div>
          <b>Thời gian dự kiến có kết quả:</b> {process.estimatedResultDate ? new Date(process.estimatedResultDate).toLocaleDateString() : "Không có"}
        </div>
        <div>
          <b>Địa điểm lấy mẫu:</b> {process.sampleCollectionLocation || "Không có"}
        </div>
        <div>
          <b>Ghi chú về quá trình:</b> {process.processNotes || "Không có"}
        </div>
        <div>
          <b>Yêu cầu tư vấn:</b> {process.requiresConsultation ? "Có" : "Không"}
        </div>
        <div>
          <b>Bảo mật:</b> {process.isConfidential ? "Có" : "Không"}
        </div>
        <div>
          <b>Thời gian thực tế có kết quả:</b> {process.actualResultDate ? new Date(process.actualResultDate).toLocaleDateString() : "Không có"}
        </div>
        <div>
          <b>Thời gian lấy mẫu:</b> {process.sampleCollectionDate ? new Date(process.sampleCollectionDate).toLocaleDateString() : "Không có"}
        </div>
        <div>
          <b>Ghi chú từ phòng lab:</b> {process.labNotes || "Không có"}
        </div>
        <div>
          <b>Người lấy mẫu:</b> {process.sampleCollectedBy || "Không có"}
        </div>
        <div>
          <b>Phòng lab xử lý:</b> {process.labProcessedBy || "Không có"}
        </div>
        <div>
          <b>Đã thông báo cho bệnh nhân:</b> {process.patientNotified ? "Có" : "Không"}
        </div>
        <div>
          <b>Đã gửi email kết quả:</b> {process.resultEmailSent ? "Có" : "Không"}
        </div>

        {/* Display Test Result Details */}
        {isLoadingResult ? (
          <div>Đang tải kết quả xét nghiệm...</div>
        ) : testResult ? (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold">Kết quả xét nghiệm chi tiết:</h3>
            <div>
              <b>Tên xét nghiệm:</b> {testResult.resultData.testName}
            </div>
            <div>
              <b>Mã xét nghiệm:</b> {testResult.resultData.testCode || "Không có"}
            </div>
            <div>
              <b>Trạng thái tổng quan:</b> {testResult.resultData.overallStatus}
            </div>
            {testResult.resultData.summary && (
              <div>
                <b>Tóm tắt:</b> {testResult.resultData.summary}
              </div>
            )}
            {testResult.resultData.clinicalInterpretation && (
              <div>
                <b>Giải thích lâm sàng:</b> {testResult.resultData.clinicalInterpretation}
              </div>
            )}
            {testResult.resultData.recommendations && testResult.resultData.recommendations.length > 0 && (
              <div>
                <b>Khuyến nghị:</b>
                <ul className="list-disc pl-5">
                  {testResult.resultData.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {testResult.resultData.results && testResult.resultData.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Các chỉ số:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Chỉ số</th>
                        <th className="border p-2 text-left">Giá trị</th>
                        <th className="border p-2 text-left">Đơn vị</th>
                        <th className="border p-2 text-left">Khoảng tham chiếu</th>
                        <th className="border p-2 text-left">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResult.resultData.results.map((item: TestResultItem, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border p-2">{item.displayName}</td>
                          <td className="border p-2">{item.value}</td>
                          <td className="border p-2">{item.unit}</td>
                          <td className="border p-2">
                            {item.referenceRange?.description ||
                              (item.referenceRange?.normalValues?.join(", ") ||
                                (item.referenceRange?.min !== undefined && item.referenceRange?.max !== undefined
                                  ? `${item.referenceRange.min} - ${item.referenceRange.max}`
                                  : "Không có"))}
                          </td>
                          <td className="border p-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.status === "normal"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "abnormal"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {item.status === "normal" ? "Bình thường" : item.status === "abnormal" ? "Bất thường" : item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {testResult.resultData.laboratoryInfo && (
              <div className="space-y-2">
                <h4 className="font-medium">Thông tin phòng Lab:</h4>
                <div>
                  <b>Tên:</b> {testResult.resultData.laboratoryInfo.name}
                </div>
                {testResult.resultData.laboratoryInfo.address && (
                  <div>
                    <b>Địa chỉ:</b> {testResult.resultData.laboratoryInfo.address}
                  </div>
                )}
                {testResult.resultData.laboratoryInfo.contactInfo && (
                  <div>
                    <b>Liên hệ:</b> {testResult.resultData.laboratoryInfo.contactInfo}
                  </div>
                )}
              </div>
            )}

            {testResult.documents && testResult.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Tài liệu đính kèm:</h4>
                <ul className="list-disc pl-5">
                  {testResult.documents.map((docId, index) => (
                    <li key={index}>
                      <a href={`/api/files/document/${docId}/access`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Tài liệu {index + 1} (ID: {docId})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={handleExportPdf} className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tải PDF kết quả
              </Button>
            </div>
          </div>
        ) : (
          process.status === "result_ready" || process.status === "result_delivered" ? (
            <div>Không có kết quả xét nghiệm chi tiết nào được tìm thấy.</div>
          ) : null
        )}

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
