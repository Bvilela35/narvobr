import { motion } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import beforeDesk from "@/assets/before-desk.jpg";
import afterDesk from "@/assets/after-desk.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" as const }
};

export function BeforeAfter() {
  const [position, setPosition] = useState(60);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition(x / rect.width * 100);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <section className="py-24 px-6 md:px-10 border-t border-border md:py-[29px]">
      <div className="max-w-[1400px] mx-auto">
        <motion.div {...fadeUp} className="mb-16">
          


          <p className="md:text-3xl font-semibold text-3xl">
            O poder da organização.{" "}
            <span className="font-light text-muted-foreground">
              Menos caos, mais clareza.
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}>

          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden select-none touch-none cursor-ew-resize aspect-[16/10]"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}>

            {/* After (background - full) */}
            <img
              src={afterDesk}
              alt="Mesa organizada com acessórios Narvo"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false} />


            {/* Before (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${position}%` }}>

              <img
                src={beforeDesk}
                alt="Mesa desorganizada"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: `${containerWidth || 9999}px`, maxWidth: "none" }}
                draggable={false} />

            </div>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-background/80 z-10"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }} />


            {/* Handle */}
            <div
              className="absolute top-1/2 z-20 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background shadow-lg flex items-center justify-center"
              style={{ left: `${position}%` }}>

              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-foreground">
                <path d="M5 3L2 8L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 3L14 8L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Labels */}
            <span className="absolute top-4 left-4 bg-foreground/80 text-background text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full font-medium z-10">
              Antes
            </span>
            <span className="absolute top-4 right-4 bg-foreground/80 text-background text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full font-medium z-10">
              Depois
            </span>
          </div>
        </motion.div>
      </div>
    </section>);

}