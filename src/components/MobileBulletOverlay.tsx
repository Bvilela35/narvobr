import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABLET_BREAKPOINT = 1024;

function useIsTabletOrMobile() {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const check = () => setIs(window.innerWidth <= TABLET_BREAKPOINT);
    check();
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT}px)`);
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);
  return is;
}

interface Props {
  bulletPoints: string[];
}

export function MobileBulletOverlay({ bulletPoints }: Props) {
  const isSmallScreen = useIsTabletOrMobile();
  const [idx, setIdx] = useState(0);
  const isFirstRound = useRef(true);

  const len = bulletPoints.length;

  useEffect(() => {
    if (!isSmallScreen || len === 0) return;
    isFirstRound.current = true;
    setIdx(0);
  }, [bulletPoints, isSmallScreen, len]);

  useEffect(() => {
    if (!isSmallScreen || len <= 2) return;

    const delay = isFirstRound.current && idx === 0 ? 3000 : 8000;

    const timer = setTimeout(() => {
      setIdx(prev => {
        const next = (prev + 1) % len;
        if (next === 0) isFirstRound.current = false;
        return next;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [idx, isSmallScreen, len]);

  if (!isSmallScreen || len === 0) return null;

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

  const first = bulletPoints[idx % len];
  const second = bulletPoints[(idx + 1) % len];

  return (
    <div className="pdp__mobile-bullets-overlay">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="pdp__mobile-bullets-pair"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="pdp__bullet-tag">{first}</span>
          <span className="pdp__bullet-tag">{second}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
