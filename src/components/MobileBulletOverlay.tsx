import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  bulletPoints: string[];
}

export function MobileBulletOverlay({ bulletPoints }: Props) {
  const isMobile = useIsMobile();
  const [idx, setIdx] = useState(0);
  const isFirstRound = useRef(true);

  const len = bulletPoints.length;

  useEffect(() => {
    if (!isMobile || len === 0) return;
    isFirstRound.current = true;
    setIdx(0);
  }, [bulletPoints, isMobile, len]);

  useEffect(() => {
    if (!isMobile || len <= 2) return;

    const delay = isFirstRound.current && idx === 0 ? 3000 : 8000;

    const timer = setTimeout(() => {
      setIdx(prev => {
        const next = (prev + 1) % len;
        if (next === 0) isFirstRound.current = false;
        return next;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [idx, isMobile, len]);

  if (!isMobile || len === 0) return null;

  // If 2 or fewer, just show them all statically
  if (len <= 2) {
    return (
      <div className="pdp__mobile-bullets-overlay">
        <div className="pdp__mobile-bullets-pair">
          {bulletPoints.map((bp, i) => (
            <span key={i} className="pdp__bullet-tag">{bp}</span>
          ))}
        </div>
      </div>
    );
  }

  // Sliding window: show item at idx and idx+1 (wrapping)
  const first = bulletPoints[idx % len];
  const second = bulletPoints[(idx + 1) % len];

  return (
    <div className="pdp__mobile-bullets-overlay">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={idx}
          className="pdp__mobile-bullets-pair"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <span className="pdp__bullet-tag">{first}</span>
          <span className="pdp__bullet-tag">{second}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
