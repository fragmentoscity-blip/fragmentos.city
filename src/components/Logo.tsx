/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LogoProps {
  variant?: "full" | "symbol" | "text";
  className?: string;
  symbolClassName?: string;
  textClassName?: string;
  needsDarkText?: boolean;
}

export default function Logo({
  variant = "full",
  className = "",
  symbolClassName = "",
  textClassName = "",
  needsDarkText = false,
}: LogoProps) {
  // Brand navy color is #243746, brand terracotta is #A57051.
  // When needsDarkText is true, we should default to brand-navy. When false (e.g., transparent on dark background), default to white.
  const baseColorClass = needsDarkText ? "text-brand-navy" : "text-white";

  const renderSymbol = () => (
    <svg
      viewBox="0 0 315 170"
      className={`h-6 w-auto ${baseColorClass} ${symbolClassName}`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bottom-left Ribbon */}
      <path d="M 0 50 L 60 100 L 120 50 L 180 100 L 180 160 L 120 110 L 60 160 L 0 110 Z" />
      {/* Top-right Ribbon with perfect parallel spacing of dx=15, dy=20 */}
      <path d="M 135 10 L 195 60 L 255 10 L 315 60 L 315 120 L 255 70 L 195 120 L 135 70 Z" />
    </svg>
  );

  const renderText = () => (
    <span
      className={`font-sans font-medium tracking-[0.18em] lowercase text-sm sm:text-base leading-none transition-colors ${baseColorClass} ${textClassName}`}
      style={{ fontFamily: "'Fox Grotesque Pro', 'Plus Jakarta Sans', sans-serif" }}
    >
      fragmentos
    </span>
  );

  if (variant === "symbol") {
    return <div className={`flex items-center ${className}`}>{renderSymbol()}</div>;
  }

  if (variant === "text") {
    return <div className={`flex items-center ${className}`}>{renderText()}</div>;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {renderSymbol()}
      <div className="flex flex-col items-start leading-none gap-0.5">
        {renderText()}
        <span
          className={`text-[8px] font-mono tracking-[0.25em] uppercase opacity-75 transition-colors ${
            needsDarkText ? "text-neutral-500" : "text-neutral-300"
          }`}
        >
          relieves 3D
        </span>
      </div>
    </div>
  );
}
