/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import Logo from "./Logo";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LETTERS = "fragmentos city".split("");
const TOTAL_DURATION_MS = 3600;
const UNMOUNT_DELAY_MS = TOTAL_DURATION_MS + 120;

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, UNMOUNT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fragmentos-loading-root fixed inset-0 z-[20000] bg-[#111820] text-white flex items-center justify-center overflow-hidden">
      <style>
        {`
          @keyframes fragmentosLetterIn {
            0% { opacity: 0; transform: translateY(18px); filter: blur(8px); }
            35% { opacity: 1; transform: translateY(0); filter: blur(0); }
            72% { opacity: 1; transform: translateY(0); filter: blur(0); }
            100% { opacity: 0; transform: translateY(-14px); filter: blur(6px); }
          }

          @keyframes fragmentosLogoReveal {
            0%, 58% { opacity: 0; transform: translateY(16px) scale(0.96); filter: blur(8px); }
            76%, 92% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            100% { opacity: 0; transform: translateY(-8px) scale(0.98); filter: blur(4px); }
          }

          @keyframes fragmentosScreenFade {
            0%, 88% { opacity: 1; }
            100% { opacity: 0; }
          }

          .fragmentos-loading-screen {
            animation: fragmentosScreenFade ${TOTAL_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both;
          }

          .fragmentos-loading-root {
            animation: fragmentosScreenFade ${TOTAL_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) both;
          }

          .fragmentos-loading-letter {
            animation: fragmentosLetterIn 2100ms cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .fragmentos-loading-logo {
            animation: fragmentosLogoReveal ${TOTAL_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        `}
      </style>

      <div className="fragmentos-loading-screen absolute inset-0 bg-[#111820]" />

      <div className="relative flex flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="flex items-center justify-center gap-[0.08em] sm:gap-[0.12em] font-sans text-[clamp(2rem,9vw,6rem)] font-semibold lowercase tracking-[0.08em]">
            {LETTERS.map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className="fragmentos-loading-letter inline-block"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {letter === " " ? "\u00a0" : letter}
              </span>
            ))}
          </div>
        </div>

        <div className="fragmentos-loading-logo">
          <Logo
            className="scale-[2.4] sm:scale-[3]"
            symbolClassName="text-white"
            textClassName="text-white"
            needsDarkText={false}
          />
        </div>
      </div>
    </div>
  );
}
