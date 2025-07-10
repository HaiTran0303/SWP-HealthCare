import { LoadingSpinner } from "./loading-spinner";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}

// Loading overlay có thể được sử dụng cho một phần cụ thể của UI
interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({
  message = "Đang tải...",
  transparent = false,
}: LoadingOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center ${
        transparent ? "bg-background/50" : "bg-background/80"
      } backdrop-blur-sm`}
    >
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="md" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Skeleton loader cho danh sách items
interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

export function SkeletonLoader({
  count = 3,
  className = "",
}: SkeletonLoaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse space-x-4 rounded-md border p-4"
        >
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 rounded bg-muted"></div>
            <div className="h-4 w-3/4 rounded bg-muted"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton loader cho cards
interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 3, className = "" }: CardSkeletonProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col space-y-4 rounded-md border p-4"
        >
          <div className="h-48 rounded-md bg-muted"></div>
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted"></div>
            <div className="h-4 w-1/2 rounded bg-muted"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-8 w-24 rounded bg-muted"></div>
            <div className="h-8 w-24 rounded bg-muted"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
