"use client";

import { logError } from "@/actions/error-logger";
import React from "react";
import { z } from "zod";

// Define schemas for validation
export const errorInfoSchema = z.object({
  componentStack: z.string(),
});

export const errorSchema = z.object({
  message: z.string(),
  name: z.string(),
  stack: z.string().optional(),
});

export const errorBoundaryPropsSchema = z.object({
  children: z.any(),
  fallback: z.any(),
});

export const errorBoundaryStateSchema = z.object({
  hasError: z.boolean(),
  error: errorSchema.optional(),
});

// Infer types from schemas
export type ErrorInfo = z.infer<typeof errorInfoSchema>;
export type ErrorType = z.infer<typeof errorSchema>;
export type ErrorBoundaryProps = z.infer<typeof errorBoundaryPropsSchema>;
export type ErrorBoundaryState = z.infer<typeof errorBoundaryStateSchema>;

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @component
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /**
   * Creates an instance of ErrorBoundary.
   * @param {ErrorBoundaryProps} props - The props for the ErrorBoundary component
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Updates state so the next render will show the fallback UI.
   * @param {Error} error - The error that was thrown
   * @returns {ErrorBoundaryState} The new state
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: errorSchema.parse(error) };
  }

  /**
   * Logs the error to the database.
   * @param {Error} error - The error that was thrown
   * @param {ErrorInfo} errorInfo - Information about the component stack
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Validate and parse the error and error info
    const validatedError = errorSchema.parse(error);
    const validatedErrorInfo = errorInfoSchema.parse({
      componentStack: errorInfo.componentStack,
    });

    // Log the error to our database
    logError({
      message: validatedError.message,
      name: validatedError.name,
      stack: validatedError.stack,
      type: "client-render",
      severity: "error",
      url: window.location.href,
      route: window.location.pathname,
      metadata: {
        componentStack: validatedErrorInfo.componentStack,
      },
    });
  }

  /**
   * Renders either the fallback UI or the children.
   * @returns {React.ReactNode} The rendered component
   */
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
