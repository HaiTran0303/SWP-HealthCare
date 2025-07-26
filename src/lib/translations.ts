export const appointmentStatusMap: { [key: string]: string } = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Đã hoàn thành",
  no_show: "Không đến",
  checked_in: "Đã check-in",
};

export const translatedAppointmentStatus = (status: string) => {
  return appointmentStatusMap[status] || status;
};
