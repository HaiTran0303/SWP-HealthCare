import { useState, useMemo, useCallback } from "react";
import { usePagination } from "./use-pagination";

export type FilterOperator =
  | "eq" // equals
  | "neq" // not equals
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "contains" // string contains
  | "startsWith" // string starts with
  | "endsWith" // string ends with
  | "in" // value in array
  | "notIn"; // value not in array

interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface UseFilterOptions<T> {
  initialFilters?: FilterCondition[];
  initialSort?: SortConfig;
  initialSearch?: string;
  searchFields?: (keyof T)[];
}

export function useFilter<T extends object>({
  initialFilters = [],
  initialSort,
  initialSearch = "",
  searchFields = [],
}: UseFilterOptions<T> = {}) {
  const [filters, setFilters] = useState<FilterCondition[]>(initialFilters);
  const [sort, setSort] = useState<SortConfig | undefined>(initialSort);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Hàm đánh giá điều kiện lọc
  const evaluateCondition = useCallback(
    (item: T, condition: FilterCondition): boolean => {
      const value = item[condition.field as keyof T];

      switch (condition.operator) {
        case "eq":
          return value === condition.value;
        case "neq":
          return value !== condition.value;
        case "gt":
          return value > condition.value;
        case "gte":
          return value >= condition.value;
        case "lt":
          return value < condition.value;
        case "lte":
          return value <= condition.value;
        case "contains":
          return String(value)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());
        case "startsWith":
          return String(value)
            .toLowerCase()
            .startsWith(String(condition.value).toLowerCase());
        case "endsWith":
          return String(value)
            .toLowerCase()
            .endsWith(String(condition.value).toLowerCase());
        case "in":
          return (
            Array.isArray(condition.value) && condition.value.includes(value)
          );
        case "notIn":
          return (
            Array.isArray(condition.value) && !condition.value.includes(value)
          );
        default:
          return true;
      }
    },
    []
  );

  // Áp dụng bộ lọc vào dữ liệu
  const filterData = useCallback(
    (data: T[]): T[] => {
      return data.filter((item) =>
        filters.every((condition) => evaluateCondition(item, condition))
      );
    },
    [filters, evaluateCondition]
  );

  // Tìm kiếm trong dữ liệu
  const searchData = useCallback(
    (data: T[]): T[] => {
      if (!searchTerm || searchFields.length === 0) return data;

      const searchLower = searchTerm.toLowerCase();
      return data.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return String(value).toLowerCase().includes(searchLower);
        })
      );
    },
    [searchTerm, searchFields]
  );

  // Sắp xếp dữ liệu
  const sortData = useCallback(
    (data: T[]): T[] => {
      if (!sort) return data;

      return [...data].sort((a, b) => {
        const aValue = a[sort.field as keyof T];
        const bValue = b[sort.field as keyof T];

        if (aValue === bValue) return 0;

        const comparison = aValue > bValue ? 1 : -1;
        return sort.direction === "asc" ? comparison : -comparison;
      });
    },
    [sort]
  );

  // Áp dụng tất cả các biến đổi vào dữ liệu
  const transformData = useCallback(
    (data: T[]): T[] => {
      let result = [...data];
      result = filterData(result);
      result = searchData(result);
      result = sortData(result);
      return result;
    },
    [filterData, searchData, sortData]
  );

  // Thêm filter mới
  const addFilter = useCallback((filter: FilterCondition) => {
    setFilters((prev) => [...prev, filter]);
  }, []);

  // Xóa filter
  const removeFilter = useCallback((field: string) => {
    setFilters((prev) => prev.filter((f) => f.field !== field));
  }, []);

  // Cập nhật filter
  const updateFilter = useCallback(
    (field: string, newCondition: Partial<FilterCondition>) => {
      setFilters((prev) =>
        prev.map((f) => (f.field === field ? { ...f, ...newCondition } : f))
      );
    },
    []
  );

  // Reset tất cả filter
  const resetFilters = useCallback(() => {
    setFilters([]);
    setSort(undefined);
    setSearchTerm("");
  }, []);

  return {
    filters,
    sort,
    searchTerm,
    addFilter,
    removeFilter,
    updateFilter,
    setFilters,
    setSort,
    setSearchTerm,
    resetFilters,
    transformData,
  };
}

// Hook kết hợp filter và pagination
export function useFilteredPagination<T extends object>(
  data: T[],
  filterOptions: UseFilterOptions<T> = {},
  paginationOptions = { initialPage: 1, initialPageSize: 10 }
) {
  const { transformData, ...filterUtils } = useFilter<T>(filterOptions);

  const filteredData = useMemo(
    () => transformData(data),
    [data, transformData]
  );

  const { page, pageSize, totalPages, paginatedData, ...paginationUtils } =
    usePagination({
      ...paginationOptions,
      total: filteredData.length,
    });

  const currentPageData = useMemo(
    () => paginatedData(filteredData),
    [filteredData, paginatedData]
  );

  return {
    data: currentPageData,
    totalItems: filteredData.length,
    page,
    pageSize,
    totalPages,
    ...filterUtils,
    ...paginationUtils,
  };
}
