"use client";

import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

/**
 * Manuscript-inspired shell: opening motion; respects prefers-reduced-motion.
 * Visual language is original (parchment, gold, Celtic-adjacent typography only).
 */
export function CodexShell({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={
        "codex-root flex min-h-dvh flex-col " +
        (mounted ? "codex-reveal codex-reveal--on" : "codex-reveal")
      }
    >
      {children}
    </div>
  );
}
