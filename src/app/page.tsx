"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PackageServiceService } from "@/services/package-service.service";

async function getBlogs() {
  try {
    const res = await fetch(
      "https://gender-healthcare.org/blogs/published?page=1&limit=3",
      { cache: "no-store" }
    );
    if (!res.ok) {
      // Trả về mock data nếu API không hoạt động
      return [
        {
          id: "1",
          title: "Chăm sóc sức khỏe sinh sản toàn diện",
          content: "Tìm hiểu các phương pháp chăm sóc sức khỏe sinh sản hiệu quả và an toàn...",
          summary: "Hướng dẫn chăm sóc sức khỏe sinh sản cơ bản",
          createdAt: new Date().toISOString(),
          // Không sử dụng external image URLs để tránh 404
          images: []
        },
        {
          id: "2", 
          title: "Phòng ngừa các bệnh lây truyền qua đường tình dục",
          content: "Các biện pháp phòng ngừa STI hiệu quả và thông tin cần biết...",
          summary: "Kiến thức cơ bản về phòng ngừa STI",
          createdAt: new Date().toISOString(),
          images: []
        },
        {
          id: "3",
          title: "Sức khỏe tâm lý và giới tính",
          content: "Mối quan hệ giữa sức khỏe tâm lý và sức khỏe giới tính...",
          summary: "Tầm quan trọng của sức khỏe tâm lý",
          createdAt: new Date().toISOString(),
          images: []
        }
      ];
    }
    const data = await res.json();
    
    // Xử lý dữ liệu blog và loại bỏ image URLs có vấn đề
    let blogData = [];
    if (Array.isArray(data)) blogData = data;
    else if (Array.isArray(data?.data)) blogData = data.data;
    else if (Array.isArray(data?.data?.data)) blogData = data.data.data;
    
         // Clean up image URLs để tránh 404
     return blogData.map((blog: any) => ({
       ...blog,
       // Chỉ giữ lại những image URLs hợp lệ và có thể truy cập
       coverImage: null, // Tạm thời loại bỏ để tránh 404
       featuredImage: null, // Tạm thời loại bỏ để tránh 404
       images: [] // Tạm thời loại bỏ để tránh 404
     }));
  } catch {
    // Trả về mock data nếu có lỗi
    return [
      {
        id: "1",
        title: "Chăm sóc sức khỏe sinh sản toàn diện",
        content: "Tìm hiểu các phương pháp chăm sóc sức khỏe sinh sản hiệu quả và an toàn...",
        summary: "Hướng dẫn chăm sóc sức khỏe sinh sản cơ bản",
        createdAt: new Date().toISOString(),
        images: []
      },
      {
        id: "2", 
        title: "Phòng ngừa các bệnh lây truyền qua đường tình dục",
        content: "Các biện pháp phòng ngừa STI hiệu quả và thông tin cần biết...",
        summary: "Kiến thức cơ bản về phòng ngừa STI",
        createdAt: new Date().toISOString(),
        images: []
      },
      {
        id: "3",
        title: "Sức khỏe tâm lý và giới tính",
        content: "Mối quan hệ giữa sức khỏe tâm lý và sức khỏe giới tính...",
        summary: "Tầm quan trọng của sức khỏe tâm lý",
        createdAt: new Date().toISOString(),
        images: []
      }
    ];
  }
}

export default function HomePage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    // Tạm thời sử dụng fallback data thay vì gọi API
    const fallbackServices = [
      {
        id: "1",
        service: {
          name: "Tư vấn sức khỏe sinh sản",
          shortDescription: "Tư vấn trực tuyến về sức khỏe sinh sản với chuyên gia",
          description: "Dịch vụ tư vấn toàn diện về sức khỏe sinh sản",
          price: 300000,
        },
        package: {
          name: "Gói cơ bản",
          maxServicesPerMonth: 2,
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        service: {
          name: "Xét nghiệm STI",
          shortDescription: "Xét nghiệm và tư vấn về các bệnh lây truyền qua đường tình dục",
          description: "Dịch vụ xét nghiệm STI an toàn và bảo mật",
          price: 500000,
        },
        package: {
          name: "Gói tiêu chuẩn",
          maxServicesPerMonth: 1,
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        service: {
          name: "Theo dõi chu kỳ",
          shortDescription: "Theo dõi và phân tích chu kỳ kinh nguyệt",
          description: "Dịch vụ theo dõi chu kỳ kinh nguyệt chuyên nghiệp",
          price: 150000,
        },
        package: {
          name: "Gói theo dõi",
          maxServicesPerMonth: 4,
        },
        createdAt: new Date().toISOString(),
      },
    ];
    
    setServices(fallbackServices);
    
    // Uncomment when API is ready
    // PackageServiceService.getAll()
    //   .then((res: any) => {
    //     const arr = Array.isArray(res?.data)
    //       ? res.data
    //       : Array.isArray(res)
    //         ? res
    //         : [];
    //     arr.sort(
    //       (a: any, b: any) =>
    //         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    //     );
    //     setServices(arr.slice(0, 3));
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching package services:", error);
    //     setServices(fallbackServices);
    //   });
  }, []);

  useEffect(() => {
    getBlogs().then((res) => {
      setBlogs(res);
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
          {services.map((item: any) => (
            <div
              key={item.id}
              className="bg-white dark:bg-card/80 rounded-2xl shadow-xl border border-primary/10 dark:border-primary/20 p-7 flex flex-col gap-4 hover:scale-[1.03] hover:shadow-2xl transition-transform group relative overflow-hidden cursor-pointer"
              onClick={() => (window.location.href = `/services/${item.id}`)}
            >
              <div className="absolute top-0 right-0 m-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                {item.package?.name}
              </div>
              <h3
                className="font-bold text-2xl text-primary mb-2 group-hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/services/${item.id}`;
                }}
              >
                {item.service?.name}
              </h3>
              <p className="text-base text-muted-foreground line-clamp-3 mb-2">
                {item.service?.shortDescription || item.service?.description}
              </p>
              <div className="flex flex-col gap-1 mb-2">
                <span className="inline-block font-semibold text-lg text-green-700">
                  Giá:{" "}
                  <span className="text-2xl text-green-800">
                    {item.service?.price} VNĐ
                  </span>
                </span>
                <span className="inline-block text-sm text-blue-700 font-medium">
                  Số gói hiện có/tháng:{" "}
                  <span className="font-bold">
                    {item.package?.maxServicesPerMonth}
                  </span>
                </span>
              </div>
              <Link
                href={`/services/${item.id}`}
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
            // Cải thiện việc xử lý blog image với validation tốt hơn
            const blogImage = null; // Tạm thời disable để tránh 404
            
            // Nếu muốn sử dụng lại sau này, có thể uncomment:
            // const blogImage = 
            //   (blog.coverImage && isValidImageUrl(blog.coverImage)) ? blog.coverImage :
            //   (blog.featuredImage && blog.featuredImage.startsWith("http") && isValidImageUrl(blog.featuredImage)) ? blog.featuredImage :
            //   (Array.isArray(blog.images) && blog.images.find((img: any) => img.url && isValidImageUrl(img.url))?.url) || null;

            return (
              <div
                key={blog.id}
                className="bg-card/80 dark:bg-card/60 rounded-2xl shadow-xl border border-primary/10 dark:border-primary/20 p-7 flex flex-col gap-4 hover:scale-[1.03] hover:shadow-2xl transition-transform group cursor-pointer"
                onClick={() => (window.location.href = `/blog/${blog.id}`)}
              >
                <div className="h-36 w-full bg-gradient-to-br from-secondary/10 to-primary/10 dark:from-secondary/20 dark:to-primary/20 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
                  {blogImage ? (
                    <Image
                      src={blogImage}
                      alt={blog.title}
                      width={180}
                      height={120}
                      className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        // Fallback khi image load failed
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
              <span className="text-3xl">👩‍🦰</span>
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
