import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Kết hợp Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function để validate image URLs
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Kiểm tra format URL cơ bản
  try {
    const urlObj = new URL(url);
    // Chỉ chấp nhận http/https
    if (!['http:', 'https:'].includes(urlObj.protocol)) return false;
    
    // Kiểm tra extension hợp lệ
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = validExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    return hasValidExtension;
  } catch {
    return false;
  }
}

// Utility function để get safe image URL với fallback
export function getSafeImageUrl(
  coverImage?: string | null,
  featuredImage?: string | null, 
  images?: Array<{url: string}> | null
): string | null {
  // Tạm thời return null để tránh 404, có thể enable lại sau
  return null;
  
  // Code để enable lại sau này:
  // if (coverImage && isValidImageUrl(coverImage)) return coverImage;
  // if (featuredImage && featuredImage.startsWith("http") && isValidImageUrl(featuredImage)) return featuredImage;
  // if (Array.isArray(images)) {
  //   const validImage = images.find(img => img.url && isValidImageUrl(img.url));
  //   if (validImage) return validImage.url;
  // }
  // return null;
}

// Utility function để handle image loading errors
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  // Ẩn image khi load failed
  e.currentTarget.style.display = 'none';
  
  // Có thể thêm fallback image khác nếu cần
  // e.currentTarget.src = '/images/fallback-image.jpg';
}

// Định dạng ngày tháng
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Định dạng thời gian
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Định dạng tiền tệ VND
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Kiểm tra xem đường dẫn hiện tại có khớp với route không
export function isActiveRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

// Chuyển đổi kích thước file sang định dạng đọc được
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Rút gọn văn bản nếu quá dài
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Tạo slug từ text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Lấy initials từ tên người dùng
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Tính tuổi từ ngày sinh
export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Kiểm tra email hợp lệ
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Kiểm tra số điện thoại hợp lệ (Việt Nam)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone);
}

// Chuyển đổi ngày thành chuỗi ISO mà không có timezone
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Kiểm tra xem một ngày có phải là ngày trong tương lai không
export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

// Tính số ngày giữa hai ngày
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // Số milliseconds trong một ngày
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  // Reset time part để chỉ so sánh ngày
  firstDate.setHours(0, 0, 0, 0);
  secondDate.setHours(0, 0, 0, 0);

  return Math.round(
    Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
  );
}
