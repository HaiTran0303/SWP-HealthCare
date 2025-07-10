"use client";

import React, { Suspense } from "react";
import { PageLoader } from "./ui/page-loader";
import { ErrorBoundary } from "./ui/error-boundary";

interface PageWrapperBaseProps {
  isLoading?: boolean;
  error?: Error | null;
  fullHeight?: boolean;
}

interface PageWrapperProps extends PageWrapperBaseProps {
  children: React.ReactNode;
}

interface AsyncPageWrapperProps extends PageWrapperBaseProps {
  /**
   * Promise trả về dữ liệu cần thiết cho page
   */
  dataPromise?: Promise<any>;
  /**
   * Render function nhận data làm tham số
   */
  children: (data: any) => React.ReactNode;
}

export function PageWrapper({
  children,
  isLoading,
  error,
  fullHeight = true,
}: PageWrapperProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <div className={fullHeight ? "min-h-[calc(100vh-4rem)]" : ""}>
          {isLoading ? (
            <PageLoader />
          ) : error ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-4xl">😕</div>
              <h2 className="mb-2 text-2xl font-semibold">Đã có lỗi xảy ra</h2>
              <p className="mb-4 max-w-md text-muted-foreground">
                {error.message || "Vui lòng thử lại sau."}
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

// HOC để wrap các pages với PageWrapper
export function withPageWrapper<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PageWrapperProps, "children"> = {}
) {
  return function WrappedPage(props: P) {
    return (
      <PageWrapper {...options}>
        <Component {...props} />
      </PageWrapper>
    );
  };
}

export function AsyncPageWrapper({
  dataPromise,
  children,
  isLoading,
  error,
  fullHeight = true,
}: AsyncPageWrapperProps) {
  return (
    <PageWrapper isLoading={isLoading} error={error} fullHeight={fullHeight}>
      <Suspense fallback={<PageLoader />}>
        <AsyncPageContent promise={dataPromise}>{children}</AsyncPageContent>
      </Suspense>
    </PageWrapper>
  );
}

interface AsyncPageContentProps {
  promise?: Promise<any>;
  children: (data: any) => React.ReactNode;
}

function AsyncPageContent({ promise, children }: AsyncPageContentProps) {
  if (!promise) {
    return <>{children(null)}</>;
  }

  const data = use(promise);
  return <>{children(data)}</>;
}

// Custom hook để sử dụng với Suspense
function use<T>(promise: Promise<T>): T {
  if (promise.status === "fulfilled") {
    return promise.value as T;
  } else if (promise.status === "rejected") {
    throw promise.reason;
  } else if (promise.status === "pending") {
    throw promise;
  } else {
    promise.status = "pending";
    promise.then(
      (result) => {
        promise.status = "fulfilled";
        promise.value = result;
      },
      (error) => {
        promise.status = "rejected";
        promise.reason = error;
      }
    );
    throw promise;
  }
}

// Thêm các thuộc tính vào Promise để tracking status
declare global {
  interface Promise<T> {
    status?: "pending" | "fulfilled" | "rejected";
    value?: T;
    reason?: any;
  }
}
