"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Activity } from "lucide-react";

interface DeferredSectionProps {
  id: string;
  label: string;
  minHeight: number;
  children: ReactNode;
}

/** Mounts below-the-fold sections only when they approach the viewport. */
export function DeferredSection({ id, label, minHeight, children }: DeferredSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(() =>
    typeof window !== "undefined" && !("IntersectionObserver" in window)
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "560px 0px", threshold: 0.01 }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      id={id}
      className="deferred-section"
      style={{ minHeight: shouldRender ? undefined : minHeight }}
    >
      {shouldRender ? children : (
        <div className="deferred-skeleton" role="status" aria-label={`Carregando ${label}`} aria-busy="true">
          <div className="deferred-skeleton-heading">
            <span><Activity size={14} /> {label.toUpperCase()}</span>
            <i />
          </div>
          <div className="deferred-skeleton-title" />
          <div className="deferred-skeleton-copy" />
          <div className="deferred-skeleton-body">
            <i /><i /><i />
          </div>
          <span className="sr-only">A seção será carregada quando estiver próxima da tela.</span>
        </div>
      )}
    </div>
  );
}
