"use client";

import { MainNav } from "@/components/main-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import AuthDialog from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { LogOut, User, Calendar } from "lucide-react";

export default function Header() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeSwitcher />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full ml-2"
                  >
                    <Avatar className="h-8 w-8">
                      {user?.profilePicture ? (
                        <AvatarImage
                          src={user.profilePicture}
                          alt={user?.firstName || "avatar"}
                        />
                      ) : (
                        <AvatarFallback>
                          {user?.fullName
                            ? user.fullName
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .toUpperCase()
                            : (user?.firstName?.[0] || "") +
                              (user?.lastName?.[0] || "")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Tài khoản
                    </Link>
                  </DropdownMenuItem>
                  {user && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile/appointments" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Lịch tư vấn của tôi
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {((typeof user?.role === "string" && user.role === "admin") ||
                    (typeof user?.role === "object" &&
                      user.role?.name === "admin")) && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Trang Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AuthDialog
                trigger={<Button variant="outline">Đăng nhập</Button>}
              />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
