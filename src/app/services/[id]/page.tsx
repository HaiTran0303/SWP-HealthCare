"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { APIService, Service } from "@/services/service.service";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";

export default function ServiceDetailPage() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const id = params.id; // id có thể là string hoặc undefined
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ thực hiện fetch nếu id là một chuỗi không rỗng
    if (typeof id === 'string' && id) {
      setLoading(true);
      APIService.getById(id)
        .then((data: Service) => { // Changed type to Service directly
          console.log("[ServiceDetailPage] Fetched service data:", data);
          setService(data);
          setError(null);
        })
        .catch((err: any) => { // Added type any for error
          console.error("[ServiceDetailPage] Error fetching service:", err);
          setError("Không thể tải chi tiết dịch vụ. Vui lòng thử lại.");
          setService(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Nếu id không phải là string hoặc rỗng, có thể đang trong quá trình tải hoặc lỗi
      setLoading(false);
      if (!id) {
        setError("ID dịch vụ không hợp lệ.");
      }
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 text-center text-red-500">
        <p>{error}</p>
        <Link href="/">
          <button className="mt-4 px-6 py-2 rounded-full font-semibold bg-primary text-white hover:bg-primary/90 transition">
            Quay về trang chủ
          </button>
        </Link>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p>Không tìm thấy dịch vụ.</p>
        <Link href="/">
          <button className="mt-4 px-6 py-2 rounded-full font-semibold bg-primary text-white hover:bg-primary/90 transition">
            Quay về trang chủ
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Service Image */}
          <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
            {service.images && service.images.length > 0 ? (
              <Image
                src={service.images[0].url}
                alt={service.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <span className="text-8xl text-primary/60">⚕️</span>
              </div>
            )}
          </div>

          {/* Service Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
              {service.name}
            </h1>
              <div className="max-h-[400px] overflow-y-auto p-4 border rounded-md text-lg text-muted-foreground mb-6">
                <div
                  dangerouslySetInnerHTML={{
                    __html: service.htmlDescription || service.description || "Không có mô tả.",
                  }}
                />
              </div>
            <div className="flex flex-col gap-3 text-lg mb-8">
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Giá:</span>
                <span className="text-2xl font-bold text-green-700">
                  {service.price !== null && !isNaN(Number(service.price)) ? Number(service.price).toLocaleString() : "N/A"} VNĐ
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Thời lượng:</span>
                <span className="font-semibold">{typeof service.duration === 'number' ? `${service.duration} phút` : "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Yêu cầu tư vấn:</span>
                <span className="font-semibold">
                  {typeof service.requiresConsultant === 'boolean' ? (service.requiresConsultant ? "Có" : "Không") : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Mô tả ngắn:</span>
                <span className="font-semibold">{service.shortDescription || "Không có mô tả ngắn."}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Điều kiện tiên quyết:</span>
                <span className="font-semibold">{service.prerequisites || "Không có."}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Hướng dẫn sau dịch vụ:</span>
                <span className="font-semibold">{service.postInstructions || "Không có."}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Địa điểm:</span>
                <span className="font-semibold">
                  {service.location ? (service.location === "online" ? "Trực tuyến" : "Tại văn phòng") : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <Link href={`/appointments?serviceId=${service.id}`}>
                  <Button className="px-8 py-3 rounded-full font-bold bg-primary text-white shadow-lg hover:bg-primary/90 transition text-lg">
                    Đặt lịch ngay
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col items-start">
                  <p className="text-red-500 mb-2">
                    Vui lòng đăng nhập để đặt lịch.
                  </p>
                  <AuthDialog
                    trigger={
                      <Button className="px-8 py-3 rounded-full font-bold bg-primary text-white shadow-lg hover:bg-primary/90 transition text-lg">
                        Đăng nhập ngay
                      </Button>
                    }
                  />
                </div>
              )}
              <Link href="/services">
                <Button
                  variant="outline"
                  className="px-8 py-3 rounded-full font-bold border-2 border-primary text-primary bg-transparent hover:bg-primary/10 transition text-lg"
                >
                  Xem các dịch vụ khác
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
