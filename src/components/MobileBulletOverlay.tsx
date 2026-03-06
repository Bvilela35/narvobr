import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  bulletPoints: string[];
}

export function MobileBulletOverlay({ bulletPoints }: Props) {
  const isMobile = useIsMobile();
  const [pairIdx, setPairIdx] = useState(0);
  const isFirstCycle = useRef(true);
  const cycleCount = useRef(0);

  const totalPairs = Math.ceil(bulletPoints.length / 2);

  useEffect(() => {
    if (!isMobile || bulletPoints.length === 0) return;
    isFirstCycle.current = true;
    cycleCount.current = 0;
    setPairIdx(0);
  }, [bulletPoints, isMobile]);

  useEffect(() => {
    if (!isMobile || totalPairs <= 1) return;

    const delay = isFirstCycle.current && cycleCount.current === 0 ? 3000 : 8000;

    const timer = setTimeout(() => {
      setPairIdx(prev => {
        const next = (prev + 1) % totalPairs;
        if (next === 0) {
          isFirstCycle.current = false;
          cycleCount.current += 1;
        }
        return next;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [pairIdx, isMobile, totalPairs]);

  if (!isMobile || bulletPoints.length === 0) return null;

  const start = pairIdx * 2;
  const currentPair = bulletPoints.slice(start, start + 2);

  return (
    <div className="pdp__mobile-bullets-overlay">
      <AnimatePresence mode="wait">
        <motion.div
          key={pairIdx}
          className="pdp__mobile-bullets-pair"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {currentPair.map((bp, i) => (
            <span key={i} className="pdp__bullet-tag">{bp}</span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
