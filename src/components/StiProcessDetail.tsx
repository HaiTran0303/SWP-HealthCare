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
      {/* Thêm các trường khác nếu cần */}
    </div>
  );
}
