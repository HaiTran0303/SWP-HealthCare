"use client";
import { useEffect, useState } from "react";
import { APIService, Service } from "@/services/service.service";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const router = useRouter();

  useEffect(() => {
    APIService.getAll().then((res: any) => {
      const arr = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
      arr.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setServices(arr);
    });
  }, []);

  const handleServiceClick = (id: string) => {
    router.push(`/services/${id}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto py-14">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary drop-shadow-sm tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tất cả dịch vụ
            </span>
          </h1>
          <Link href="/appointments">
            <button className="px-6 py-2 rounded-full font-semibold bg-primary text-white hover:bg-primary/90 transition flex items-center group hover:underline">
              Đặt lịch tư vấn
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.length === 0 && (
            <div className="col-span-3 text-center text-muted-foreground">
              Chưa có dịch vụ nào.
            </div>
          )}
          {services.map((item: Service) => (
            <div
              key={item.id}
              className="bg-white dark:bg-card/80 rounded-2xl shadow-xl border border-primary/10 dark:border-primary/20 p-7 flex flex-col gap-4 hover:scale-[1.03] hover:shadow-2xl transition-transform group relative overflow-hidden cursor-pointer"
              onClick={() => handleServiceClick(item.id)}
            >
              {item.featured && (
                <div className="absolute top-0 right-0 m-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  Nổi bật
                </div>
              )}
              <h3 className="font-bold text-2xl text-primary mb-2 group-hover:underline">
                {item.name}
              </h3>
              <p className="text-base text-muted-foreground line-clamp-3 mb-2">
                {item.shortDescription || item.description}
              </p>
              <div className="flex flex-col gap-1 mb-2">
                <span className="inline-block font-semibold text-lg text-green-700">
                  Giá:{" "}
                  <span className="text-2xl text-green-800">
                    {item.price} VNĐ
                  </span>
                </span>
                {/* Removed package specific info as we are fetching services directly */}
              </div>
              {/* The Link component below is now redundant for navigation but kept for styling if needed */}
              <div className="mt-auto text-primary font-semibold hover:underline block text-center py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition">
                Xem chi tiết
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
