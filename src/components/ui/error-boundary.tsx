"use client";

import React from "react";
import { Button } from "./button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Bạn có thể log lỗi vào service analytics ở đây
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="mb-4 text-4xl">😕</div>
          <h2 className="mb-2 text-2xl font-semibold">Đã có lỗi xảy ra</h2>
          <p className="mb-4 max-w-md text-muted-foreground">
            {this.state.error?.message ||
              "Chúng tôi đang cố gắng khắc phục sự cố này."}
          </p>
          <Button onClick={this.handleRetry}>Thử lại</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC để dễ dàng wrap components với ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
