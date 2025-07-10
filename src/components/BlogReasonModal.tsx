import React from "react";

interface BlogReasonModalProps {
  open: boolean;
  onClose: () => void;
  rejectionReason?: string;
  revisionNotes?: string;
}

export default function BlogReasonModal({
  open,
  onClose,
  rejectionReason,
  revisionNotes,
}: BlogReasonModalProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.35)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "40px 36px 32px 36px",
          minWidth: 420,
          maxWidth: 520,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            marginBottom: 28,
            fontSize: 28,
            fontWeight: 700,
            color: "#222",
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          Lý do từ chối & Ghi chú chỉnh sửa
        </h2>
        <div style={{ marginBottom: 22, width: "100%" }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>
            Lý do từ chối:
          </div>
          <div
            style={{
              background: "#f8d7da",
              color: "#842029",
              borderRadius: 8,
              padding: "10px 14px",
              minHeight: 40,
              fontSize: 16,
            }}
          >
            {rejectionReason || "Không có"}
          </div>
        </div>
        <div style={{ marginBottom: 28, width: "100%" }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>
            Ghi chú chỉnh sửa:
          </div>
          <div
            style={{
              background: "#e7f1fa",
              color: "#0c3c5c",
              borderRadius: 8,
              padding: "10px 14px",
              minHeight: 40,
              fontSize: 16,
            }}
          >
            {revisionNotes || "Không có"}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            padding: "10px 32px",
            borderRadius: 8,
            background: "#222",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
