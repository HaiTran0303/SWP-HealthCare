"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { APIService, Service } from "@/services/service.service";

async function getBlogs() {
  try {
    const res = await fetch(
      "https://gender-healthcare.org/blogs/published?page=1&limit=3",
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.error("Failed to fetch blogs:", res.status, res.statusText);
      return [];
    }
    const result = await res.json();
    
    const blogData = result.data?.data || result.data || [];
    
    if (!Array.isArray(blogData)) {
        console.error("Expected blogData to be an array but got:", blogData);
        return [];
    }

     return blogData.map((blog: any) => {
        const image = blog.images?.[0];
        return {
          ...blog,
          imageUrl: image?.url || null,
        }
     });
  } catch(e) {
    console.error("Failed to fetch or process blogs:", e);
    return [];
  }
}

export default function HomePage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    APIService.getAll({ limit: 3, page: 1 })
      .then((res: any) => {
        const arr = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setServices(arr);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        setServices([]); // Set to empty array on error
      });

    getBlogs().then((res) => {
      setBlogs(res);
    }).catch((error) => {
        console.error("Error in getBlogs promise chain:", error);
        setBlogs([]); // Set to empty array on error
    });
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="relative container mx-auto flex flex-col md:flex-row items-center gap-8 py-16 md:py-20">
        {/* Overlay gradient */}
        <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-primary/10 via-background/80 to-secondary/10 dark:from-primary/30 dark:to-background pointer-events-none" />
        <div className="flex-1 space-y-7 z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-primary drop-shadow-lg">
            Chăm sóc sức khỏe giới tính toàn diện
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl">
            Chúng tôi cung cấp dịch vụ chăm sóc sức khỏe sinh sản, tư vấn chuyên
            nghiệp, xét nghiệm an toàn và blog kiến thức hữu ích giúp bạn tự tin
            về sức khỏe giới tính của mình.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/consultant">
              <button className="px-8 py-3 rounded-full font-bold bg-primary shadow-lg hover:bg-primary/90 transition text-lg border-2 border-primary text-white dark:bg-white dark:border-primary dark:hover:bg-primary/10 dark:!text-primary">
                Đặt lịch tư vấn
              </button>
            </Link>
            <Link href="#services">
              <button className="px-8 py-3 rounded-full font-bold border-2 border-primary text-primary bg-white dark:bg-background hover:bg-primary/10 dark:hover:bg-primary/20 shadow transition text-lg">
                Khám phá dịch vụ
              </button>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center z-10">
          <div className="relative w-[420px] h-[320px] max-w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20 dark:border-primary/40">
            <Image
              src="/images/hero-image.jpg"
              alt="Chăm sóc sức khỏe giới tính"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* Dịch vụ nổi bật */}
      <section id="services" className="container mx-auto py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary drop-shadow-sm tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dịch vụ nổi bật
            </span>
          </h2>
          <Link href="/services">
            <button className="px-6 py-2 rounded-full font-semibold bg-primary text-white hover:bg-primary/90 transition flex items-center group hover:underline">
              Xem tất cả dịch vụ
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
          {services.map((service: Service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-card/80 rounded-2xl shadow-xl border border-primary/10 dark:border-primary/20 p-7 flex flex-col gap-4 hover:scale-[1.03] hover:shadow-2xl transition-transform group relative overflow-hidden cursor-pointer"
              onClick={() => (window.location.href = `/services/${service.id}`)}
            >
              <div className="h-40 w-full bg-gradient-to-br from-secondary/10 to-primary/10 dark:from-secondary/20 dark:to-primary/20 rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform"
                    onError={(e:any) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-5xl text-primary/60">⚕️</span>
                )}
              </div>
              <h3
                className="font-bold text-2xl text-primary mb-2 group-hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/services/${service.id}`;
                }}
              >
                {service.name}
              </h3>
              <p className="text-base text-muted-foreground line-clamp-3 mb-2">
                {service.description}
              </p>
              <div className="flex flex-col gap-1 mb-2">
                <span className="inline-block font-semibold text-lg text-green-700">
                  Giá:{" "}
                  <span className="text-2xl text-green-800">
                    {service.price.toLocaleString()} VNĐ
                  </span>
                </span>
                 <span className="inline-block text-sm text-blue-700 font-medium">
                  Thời lượng: <span className="font-bold">{service.duration} phút</span>
                </span>
              </div>
              <Link
                href={`/services/${service.id}`}
                className="mt-auto text-primary font-semibold hover:underline block text-center py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition"
                onClick={(e) => e.stopPropagation()}
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Blog mới nhất */}
      <section className="container mx-auto py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary drop-shadow-sm tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bài viết mới nhất
            </span>
          </h2>
          <Link href="/blog">
            <button className="px-6 py-2 rounded-full font-semibold bg-primary text-white hover:bg-primary/90 transition flex items-center group hover:underline">
              Xem tất cả
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.length === 0 && (
            <div className="col-span-3 text-center text-muted-foreground">
              Chưa có bài viết nào.
            </div>
          )}
          {blogs.map((blog: any) => {
            return (
              <div
                key={blog.id}
                className="bg-card/80 dark:bg-card/60 rounded-2xl shadow-xl border border-primary/10 dark:border-primary/20 p-7 flex flex-col gap-4 hover:scale-[1.03] hover:shadow-2xl transition-transform group cursor-pointer"
                onClick={() => (window.location.href = `/blog/${blog.id}`)}
              >
                <div className="h-36 w-full bg-gradient-to-br from-secondary/10 to-primary/10 dark:from-secondary/20 dark:to-primary/20 rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
                  {blog.imageUrl ? (
                    <Image
                      src={blog.imageUrl}
                      alt={blog.title}
                      fill
                      className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform"
                      onError={(e:any) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-5xl text-primary/60">📰</span>
                  )}
                </div>
                <h3
                  className="font-semibold text-xl text-primary group-hover:underline line-clamp-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/blog/${blog.id}`;
                  }}
                >
                  {blog.title}
                </h3>
                <p className="text-base text-muted-foreground line-clamp-3">
                  {blog.summary || blog.content?.slice(0, 100) + "..."}
                </p>
                <Link
                  href={`/blog/${blog.id}`}
                  className="mt-auto text-primary font-semibold hover:underline block"
                  onClick={(e) => e.stopPropagation()}
                >
                  Đọc tiếp
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feedback khách hàng */}
      <section className="container mx-auto py-14">
        <h2 className="text-4xl md:text-5xl font-extrabold text-primary drop-shadow-sm tracking-tight mb-8 text-center">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Phản hồi từ khách hàng
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card/80 dark:bg-card/60 rounded-2xl border border-primary/10 dark:border-primary/20 shadow-lg p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="text-3xl">👩‍-🦰</span>
            </div>
            <blockquote className="italic text-muted-foreground text-center">
              "Dịch vụ tư vấn rất tận tâm, mình cảm thấy an tâm khi sử dụng dịch
              vụ ở đây."
            </blockquote>
            <span className="font-semibold text-primary">Nguyễn Thị A</span>
          </div>
          <div className="bg-card/80 dark:bg-card/60 rounded-2xl border border-primary/10 dark:border-primary/20 shadow-lg p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="text-3xl">👨‍⚕️</span>
            </div>
            <blockquote className="italic text-muted-foreground text-center">
              "Bác sĩ chuyên môn cao, giải đáp mọi thắc mắc về sức khỏe giới
              tính."
            </blockquote>
            <span className="font-semibold text-primary">Trần Văn B</span>
          </div>
          <div className="bg-card/80 dark:bg-card/60 rounded-2xl border border-primary/10 dark:border-primary/20 shadow-lg p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="text-3xl">👩‍💼</span>
            </div>
            <blockquote className="italic text-muted-foreground text-center">
              "Giao diện web dễ dùng, đặt lịch nhanh chóng, nhiều bài blog hữu
              ích."
            </blockquote>
            <span className="font-semibold text-primary">Lê Cẩm C</span>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="container mx-auto py-16 text-center">
        <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-primary/10 via-background/80 to-secondary/10 dark:from-primary/30 dark:to-background shadow-2xl p-12">
          <h2 className="text-3xl font-extrabold mb-4 text-primary">
            Bạn cần tư vấn sức khỏe giới tính?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-medium">
            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn. Đặt lịch
            tư vấn ngay để được giải đáp mọi thắc mắc!
          </p>
          <Link href="/consultant">
            <button className="px-10 py-4 rounded-full font-bold bg-primary text-white shadow-lg hover:bg-primary/90 transition text-xl">
              Đặt lịch tư vấn ngay
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
