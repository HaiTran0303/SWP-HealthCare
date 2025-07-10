"use client";

import { Button } from "./button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  className?: string;
  variant?: "default" | "simple" | "compact";
  showControls?: boolean;
  showEdges?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  pageNumbers,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  onLastPage,
  className,
  variant = "default",
  showControls = true,
  showEdges = true,
}: PaginationProps) {
  // Render phiên bản đơn giản chỉ với nút Next/Previous
  if (variant === "simple") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-2">Trước</span>
        </Button>
        <div className="text-sm text-muted-foreground">
          Trang {currentPage} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage}
        >
          <span className="mr-2">Sau</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Render phiên bản compact chỉ với số trang
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="text-sm text-muted-foreground">
          Trang {currentPage} / {totalPages}
        </div>
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Render phiên bản mặc định đầy đủ
  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      {showEdges && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFirstPage}
          disabled={!hasPreviousPage}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {showControls && (
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-center space-x-2">
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === -1 ? (
            <div
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-muted-foreground"
            >
              ...
            </div>
          ) : (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageNumber)}
              className="h-8 w-8"
            >
              {pageNumber}
            </Button>
          )
        )}
      </div>

      {showControls && (
        <Button
          variant="outline"
          size="icon"
          onClick={onNextPage}
          disabled={!hasNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {showEdges && (
        <Button
          variant="outline"
          size="icon"
          onClick={onLastPage}
          disabled={!hasNextPage}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}

      <div className="text-sm text-muted-foreground">
        Trang {currentPage} / {totalPages}
      </div>
    </div>
  );
}

// Component để hiển thị thông tin về số items trên trang
interface PaginationInfoProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  itemName?: string;
}

export function PaginationInfo({
  totalItems,
  itemsPerPage,
  currentPage,
  itemName = "kết quả",
}: PaginationInfoProps) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="text-sm text-muted-foreground">
      Hiển thị {start}-{end} trên tổng số {totalItems} {itemName}
    </div>
  );
}
