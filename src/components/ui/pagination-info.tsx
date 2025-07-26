import React from "react";
import { cn } from "@/lib/utils";

interface PaginationInfoProps extends React.HTMLAttributes<HTMLDivElement> {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  itemName?: string;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  itemName = "mục",
  className,
  ...props
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      Hiển thị {startIndex} - {endIndex} trên tổng {totalItems} {itemName}
    </div>
  );
};

export { PaginationInfo };
