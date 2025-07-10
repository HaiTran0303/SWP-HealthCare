export default function StiProcessTable({ processes, onRowClick }: any) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Mã</th>
          <th>Bệnh nhân</th>
          <th>Dịch vụ</th>
          <th>Trạng thái</th>
          <th>Ngày tạo</th>
          {onRowClick && <th></th>}
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
            {onRowClick && (
              <td>
                <button
                  onClick={() => onRowClick(p)}
                  className="text-blue-600 underline"
                >
                  Chi tiết
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
