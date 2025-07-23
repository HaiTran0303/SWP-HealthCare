export default function StiProcessDetail({ process }: any) {
  if (!process) return <div>Đang tải...</div>;
  return (
    <div className="space-y-4">
      <div>
        <b>Mã:</b> {process.testCode}
      </div>
      <div>
        <b>Bệnh nhân:</b> {process.patient?.fullName}
      </div>
      <div>
        <b>Dịch vụ:</b> {process.service?.name}
      </div>
      <div>
        <b>Trạng thái:</b> {process.status}
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
        <b>ID cuộc hẹn lấy mẫu:</b> {process.appointmentId}
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
        <b>ID bác sĩ tư vấn:</b> {process.consultantDoctorId}
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
    </div>
  );
}
