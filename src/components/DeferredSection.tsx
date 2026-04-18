import { ReactNode, useEffect, useRef, useState } from "react";

interface DeferredSectionProps {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  className?: string;
}

export function DeferredSection({
  children,
  minHeight,
  rootMargin = "240px",
  className,
}: DeferredSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;

    const node = placeholderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  if (isVisible) {
    return <>{children}</>;
  }

  return (
    <div
      ref={placeholderRef}
      aria-hidden="true"
      className={className}
      style={minHeight ? { minHeight } : undefined}
    />
  );
}
