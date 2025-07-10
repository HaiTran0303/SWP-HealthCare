import { useState, useCallback } from "react";

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useAsync<T = unknown>(options: UseAsyncOptions<T> = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (promise: Promise<T>) => {
      setState({
        ...state,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const data = await promise;
        setState({
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        setState({
          data: null,
          error: error as Error,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });
        options.onError?.(error as Error);
        throw error;
      } finally {
        options.onSettled?.();
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Ví dụ sử dụng:
/*
const MyComponent = () => {
  const { 
    execute, 
    data, 
    error, 
    isLoading, 
    isSuccess, 
    isError 
  } = useAsync<UserData>({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Data fetched successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  useEffect(() => {
    execute(fetchUserData())
  }, [execute])

  if (isLoading) return <LoadingSpinner />
  if (isError) return <div>Error: {error.message}</div>
  if (!data) return null

  return <div>{data.name}</div>
}
*/

// Hook để tự động retry khi gặp lỗi
export function useAsyncWithRetry<T = unknown>(
  options: UseAsyncOptions<T> & {
    maxRetries?: number;
    retryDelay?: number;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, ...asyncOptions } = options;
  const async = useAsync<T>(asyncOptions);

  const executeWithRetry = useCallback(
    async (promise: Promise<T>) => {
      let retries = 0;

      const attempt = async (): Promise<T> => {
        try {
          return await async.execute(promise);
        } catch (error) {
          if (retries < maxRetries) {
            retries++;
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return attempt();
          }
          throw error;
        }
      };

      return attempt();
    },
    [async.execute, maxRetries, retryDelay]
  );

  return {
    ...async,
    execute: executeWithRetry,
  };
}

// Hook để handle infinite loading
export function useInfiniteAsync<T = unknown>(
  options: UseAsyncOptions<T[]> & {
    pageSize?: number;
  } = {}
) {
  const { pageSize = 10, ...asyncOptions } = options;
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const async = useAsync<T[]>(asyncOptions);

  const loadMore = useCallback(
    async (promise: Promise<T[]>) => {
      const newItems = await async.execute(promise);
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === pageSize);
      setPage((p) => p + 1);
      return newItems;
    },
    [async.execute, pageSize]
  );

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setPage(1);
    async.reset();
  }, [async.reset]);

  return {
    ...async,
    items,
    hasMore,
    page,
    loadMore,
    reset,
  };
}
