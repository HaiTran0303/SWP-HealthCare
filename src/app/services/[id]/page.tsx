"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { APIService, Service } from "@/services/service.service";
import Image from "next/image";
import Link from "next/link";

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      APIService.getById(id)
        .then((data:any) => {
          setService(data.data);
          setError(null);
        })
        .catch(() => {
          setError("Không thể tải chi tiết dịch vụ. Vui lòng thử lại.");
          setService(null);
        })
        .finally(() => {
          setLoading(false);
        });
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
            {service.imageUrl ? (
              <Image
                src={service.imageUrl}
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
            <p className="text-lg text-muted-foreground mb-6">
              {service.description}
            </p>
            <div className="flex flex-col gap-3 text-lg mb-8">
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Giá:</span>
                <span className="text-2xl font-bold text-green-700">
                  {service.price.toLocaleString()} VNĐ
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Thời lượng:</span>
                <span className="font-semibold">{service.duration} phút</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Yêu cầu tư vấn:</span>
                <span className="font-semibold">
                  {service.requiresConsultant ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Mô tả ngắn:</span>
                <span className="font-semibold">{service.shortDescription}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Điều kiện tiên quyết:</span>
                <span className="font-semibold">{service.prerequisites}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Hướng dẫn sau dịch vụ:</span>
                <span className="font-semibold">{service.postInstructions}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">Địa điểm:</span>
                <span className="font-semibold">
                  {service.location === "online" ? "Trực tuyến" : "Tại văn phòng"}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href={`/appointments?serviceId=${service.id}`}>
                <button className="px-8 py-3 rounded-full font-bold bg-primary text-white shadow-lg hover:bg-primary/90 transition text-lg">
                  Đặt lịch ngay
                </button>
              </Link>
              <Link href="/services">
                <button className="px-8 py-3 rounded-full font-bold border-2 border-primary text-primary bg-transparent hover:bg-primary/10 transition text-lg">
                  Xem các dịch vụ khác
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
