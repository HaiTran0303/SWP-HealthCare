import { useState, useMemo, useCallback } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  offset: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  paginatedData: <T>(data: T[]) => T[];
  pageNumbers: number[];
  isCurrentPage: (pageNumber: number) => boolean;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  total = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Tính toán các giá trị pagination
  const totalPages = useMemo(
    () => Math.ceil(total / pageSize),
    [total, pageSize]
  );
  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  // Kiểm tra điều kiện phân trang
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  // Các hàm điều hướng
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((p) => p + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage((p) => p - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  // Hàm phân trang dữ liệu
  const paginatedData = useCallback(
    <T>(data: T[]): T[] => {
      const start = offset;
      const end = start + pageSize;
      return data.slice(start, end);
    },
    [offset, pageSize]
  );

  // Tạo mảng số trang để hiển thị
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Số trang hiển thị tối đa

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả các trang nếu tổng số trang nhỏ hơn maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Hiển thị trang đầu, trang cuối và các trang xung quanh trang hiện tại
      let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push(-1); // Dùng -1 để hiển thị dấu ...
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(-1);
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }, [page, totalPages]);

  // Kiểm tra xem một số trang có phải là trang hiện tại không
  const isCurrentPage = useCallback(
    (pageNumber: number) => {
      return page === pageNumber;
    },
    [page]
  );

  return {
    page,
    pageSize,
    offset,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    paginatedData,
    pageNumbers,
    isCurrentPage,
  };
}

// Hook để tối ưu danh sách dài với memoization
export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T) => string | number
) {
  // Memoize danh sách items để tránh render lại không cần thiết
  const memoizedItems = useMemo(() => items, [items]);

  // Tạo map các keys để tối ưu việc tìm kiếm
  const itemKeys = useMemo(
    () => new Set(items.map(keyExtractor)),
    [items, keyExtractor]
  );

  // Kiểm tra xem một item có tồn tại trong danh sách không
  const hasItem = useCallback(
    (item: T) => itemKeys.has(keyExtractor(item)),
    [itemKeys, keyExtractor]
  );

  // Tìm một item theo key
  const findItem = useCallback(
    (key: string | number) => items.find((item) => keyExtractor(item) === key),
    [items, keyExtractor]
  );

  return {
    items: memoizedItems,
    hasItem,
    findItem,
  };
}
