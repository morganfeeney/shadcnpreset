"use client";
import React from "react";
import FastMarquee from "react-fast-marquee";
import type { MarqueeProps as FastMarqueeProps } from "react-fast-marquee";

export interface MarqueeProps extends FastMarqueeProps {
  direction?: "left" | "right";
  className?: string;
}

export function LogoMarquee({
  children,
  autoFill = true,
  className,
  ...props
}: MarqueeProps) {
  return (
    <FastMarquee
      {...props}
      gradient
      autoFill={autoFill}
      gradientWidth={80}
      gradientColor="var(--background)"
      className={className}
    >
      {children}
    </FastMarquee>
  );
}
