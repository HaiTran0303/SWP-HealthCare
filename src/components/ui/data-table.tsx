"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Input } from "./input";
import { Button } from "./button";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  X,
} from "lucide-react";
import { Pagination } from "./pagination";
import { useFilteredPagination } from "@/hooks/use-filter";
import { SkeletonLoader } from "./page-loader";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  initialPage?: number;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  pageSize = 10,
  initialPage = 1,
  isLoading,
  className,
  emptyMessage = "Không có dữ liệu",
}: DataTableProps<T>) {
  const [searchableFields] = useState(
    columns.filter((col) => col.searchable).map((col) => col.key)
  );

  const {
    data: paginatedData,
    totalItems,
    page,
    pageSize: currentPageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    pageNumbers,
    setSearchTerm,
    sort,
    setSort,
  } = useFilteredPagination(
    data,
    {
      searchFields: searchableFields,
      initialSort: { field: columns[0].key as string, direction: "asc" },
    },
    {
      initialPage,
      initialPageSize: pageSize,
    }
  );

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const field = column.key as string;
    const newDirection =
      sort?.field === field && sort.direction === "asc" ? "desc" : "asc";
    setSort({ field, direction: newDirection });
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    if (sort?.field !== column.key) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />;
    }

    return sort.direction === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (isLoading) {
    return <SkeletonLoader count={pageSize} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      {searchableFields.length > 0 && (
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key as string}
                  className={cn(
                    column.sortable && "cursor-pointer select-none",
                    column.width
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.title}</span>
                    {getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.key as string}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={setPage}
          onNextPage={nextPage}
          onPreviousPage={previousPage}
          onFirstPage={firstPage}
          onLastPage={lastPage}
        />
        <div className="text-sm text-muted-foreground">
          Hiển thị {paginatedData.length} trên tổng số {totalItems} kết quả
        </div>
      </div>
    </div>
  );
}
