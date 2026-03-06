import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  bulletPoints: string[];
  title: string;
}

export function BulletPointsRotator({ bulletPoints, title }: Props) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<'rotating' | 'collapsed' | 'expanded'>('rotating');
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (isMobile || phase !== 'rotating' || bulletPoints.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIdx(prev => {
        const next = prev + 1;
        if (next >= bulletPoints.length) {
          setPhase('collapsed');
          return 0;
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [phase, bulletPoints.length, isMobile]);

  useEffect(() => {
    setPhase('rotating');
    setCurrentIdx(0);
  }, [title]);

  if (bulletPoints.length === 0) {
    return <h1 className="pdp__title">{title}</h1>;
  }

  // Mobile: always show all tags statically
  if (isMobile) {
    return (
      <>
        <div className="pdp__bullets">
          {bulletPoints.map((bp, i) => (
            <span key={i} className="pdp__bullet-tag">{bp}</span>
          ))}
        </div>
        <h1 className="pdp__title">{title}</h1>
      </>
    );
  }

  return (
    <>
      {phase === 'rotating' && (
        <div className="pdp__bullets">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIdx}
              className="pdp__bullet-tag"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {bulletPoints[currentIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {phase === 'expanded' && (
        <div className="pdp__bullets">
          {bulletPoints.map((bp, i) => (
            <motion.span
              key={i}
              className="pdp__bullet-tag"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              {bp}
            </motion.span>
          ))}
          <button
            className="pdp__bullet-close"
            onClick={() => setPhase('collapsed')}
            aria-label="Fechar diferenciais"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      <h1 className="pdp__title">
        {title}
        {phase === 'collapsed' && (
          <button
            className="pdp__bullet-expand"
            onClick={() => setPhase('expanded')}
            aria-label="Ver diferenciais"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        )}
      </h1>
    </>
  );
}
