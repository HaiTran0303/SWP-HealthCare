"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PackageServiceService } from "@/services/package-service.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    PackageServiceService.getById(id)
      .then((res: any) => {
        setService(res ?? null);
      })
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="container mx-auto py-16 text-center">Đang tải...</div>
    );

  if (!service || !service.service || !service.package)
    return (
      <div className="container mx-auto py-16 text-center text-red-500">
        Không tìm thấy dịch vụ
      </div>
    );

  const serviceData = service.service;
  const pkg = service.package;

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto py-14 max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/services"
            className="text-primary font-semibold hover:underline"
          >
            ← Quay lại danh sách dịch vụ
          </Link>
        </div>
        <div className="bg-white dark:bg-card/80 rounded-2xl shadow-xl border border-primary/10 dark:border-primary/20 p-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary drop-shadow-sm tracking-tight mb-2">
              {serviceData?.name}
            </h1>
            <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
              {pkg?.name}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <p className="text-lg text-muted-foreground mb-4">
                {serviceData?.shortDescription || serviceData?.description}
              </p>
              <div className="mb-4">
                <span className="font-semibold text-green-700 text-lg">
                  Giá:{" "}
                </span>
                <span className="text-2xl text-green-800 font-bold">
                  {serviceData?.price} VNĐ
                </span>
              </div>
              <div className="mb-2 text-blue-700 font-medium">
                Số gói hiện có/tháng:{" "}
                <span className="font-bold">{pkg?.maxServicesPerMonth}</span>
              </div>
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Thời lượng:</span>{" "}
                {serviceData?.duration} phút
              </div>
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Địa điểm:</span>{" "}
                {serviceData?.location === "office"
                  ? "Tại phòng khám"
                  : serviceData?.location}
              </div>
              {serviceData?.prerequisites && (
                <div className="mb-2 text-gray-700">
                  <span className="font-semibold">Điều kiện tham gia:</span>{" "}
                  {serviceData.prerequisites}
                </div>
              )}
              {serviceData?.postInstructions && (
                <div className="mb-2 text-gray-700">
                  <span className="font-semibold">Hướng dẫn sau dịch vụ:</span>{" "}
                  {serviceData.postInstructions}
                </div>
              )}
              <div className="mt-6">
                <Button
                  onClick={() =>
                    router.push(`/appointments?id=${service.service.id}`)
                  }
                  className="w-full mt-6 text-lg font-bold"
                >
                  Đặt lịch tư vấn dịch vụ này
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
