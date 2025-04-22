"use client";
import React from "react";
import { MovingBorder } from "./MovingBorder";
import cn from "@/lib/cn";

interface MovingBorderCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  borderRadius?: string;
}

export function MovingBorderCard({
  children,
  className,
  containerClassName,
  borderClassName,
  duration = 3000,
  borderRadius = "1.75rem",
  ...otherProps
}: MovingBorderCardProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-transparent p-[1px]",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              "h-20 w-20 bg-[radial-gradient(#000000_40%,transparent_60%)] opacity-[0.8]",
              borderClassName
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center border border-slate-800 bg-slate-900/[0.8] text-white antialiased backdrop-blur-xl overflow-hidden",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
