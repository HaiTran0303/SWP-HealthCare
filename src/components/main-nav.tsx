"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { cn } from "@/lib/utils";

const mainNavItems = [
  {
    title: "Trang chủ",
    href: "/",
  },
  {
    title: "Dịch vụ",
    href: "/services",
  },
  {
    title: "Tư vấn trực tuyến",
    href: "/consultant",
  },
  {
    title: "Xét nghiệm STI",
    href: "/sti-testing",
  },
  {
    title: "Theo dõi chu kỳ",
    href: "/menstrual-tracker",
  },
  {
    title: "Blog",
    href: "/blog",
  },
];

export function MainNav() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <div className="w-28 h-12 flex items-center justify-center rounded-lg border-2 border-black bg-white shadow">
          <span className="font-size-12 font-bold text-black italic">
            Healthcare
          </span>
        </div>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === item.href ? "text-foreground" : "text-foreground/60"
            )}
          >
            {item.title}
          </Link>
        ))}

        <div className="flex items-center space-x-4"></div>
      </nav>
    </div>
  );
}
