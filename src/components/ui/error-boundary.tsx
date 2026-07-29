"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-rose-500/30 bg-rose-500/5 p-8 text-center backdrop-blur-md">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4 border border-rose-500/20">
            <AlertTriangle className="size-8" />
          </div>

          <h3 className="font-display text-xl font-bold text-foreground">
            Đã Xảy Ra Lỗi Giao Diện Runtime
          </h3>

          <p className="mt-2 max-w-md text-xs text-muted-foreground font-mono leading-relaxed bg-background/80 p-3 rounded-xl border border-border">
            {this.state.error?.message || "Không thể tải thành phần giao diện này."}
          </p>

          <Button
            onClick={this.handleReset}
            className="mt-6 gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-md"
          >
            <RotateCcw className="size-4" /> Thử Khôi Phục Giao Diện
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
