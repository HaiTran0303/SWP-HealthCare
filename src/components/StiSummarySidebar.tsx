export default function StiSummarySidebar({
  selectedServices,
  user,
  selectedDate,
  selectedTime,
  estimatedCost,
  estimatedDuration,
}: any) {
  return (
    <aside className="sticky top-8 bg-white rounded-2xl shadow-2xl p-8 w-full md:w-96 mb-8 md:mb-0 border border-gray-100">
      <h3 className="font-bold text-xl mb-6 text-primary">Tóm tắt</h3>
      <div className="mb-4">
        <div className="font-medium text-gray-700">Dịch vụ đã chọn:</div>
        {selectedServices.length === 0 ? (
          <div className="text-gray-300 italic">Chưa chọn</div>
        ) : (
          <ul className="list-disc ml-5 mt-1 space-y-1">
            {selectedServices.map((s: any) => (
              <li
                key={s.id}
                className="flex justify-between items-center text-base"
              >
                <span>{s.name}</span>
                <span className="text-sm text-gray-500">
                  {s.price?.toLocaleString()}đ
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-3">
        <div className="font-medium text-gray-700">Ngày xét nghiệm:</div>
        <div className="text-base">
          {selectedDate ? (
            selectedDate.toLocaleDateString()
          ) : (
            <span className="text-gray-300 italic">Chưa chọn</span>
          )}
        </div>
      </div>
      <div className="mb-3">
        <div className="font-medium text-gray-700">Giờ xét nghiệm:</div>
        <div className="text-base">
          {selectedTime || (
            <span className="text-gray-300 italic">Chưa chọn</span>
          )}
        </div>
      </div>
      <div className="mb-3">
        <div className="font-medium text-gray-700">Khách hàng:</div>
        <div className="text-base">
          {user?.fullName || user?.email || (
            <span className="text-gray-300 italic">Chưa đăng nhập</span>
          )}
        </div>
      </div>
      {estimatedCost && (
        <div className="mb-3">
          <div className="font-medium text-gray-700">Tổng chi phí dự kiến:</div>
          <div className="text-primary font-bold text-lg">
            {estimatedCost.toLocaleString()}đ
          </div>
        </div>
      )}
      {estimatedDuration && (
        <div className="mb-3">
          <div className="font-medium text-gray-700">Thời gian dự kiến:</div>
          <div className="text-base">{estimatedDuration}</div>
        </div>
      )}
    </aside>
  );
}
