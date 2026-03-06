import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface Props {
  bulletPoints: string[];
  title: string;
}

export function BulletPointsRotator({ bulletPoints, title }: Props) {
  const [phase, setPhase] = useState<'rotating' | 'collapsed' | 'expanded'>('rotating');
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (phase !== 'rotating' || bulletPoints.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIdx(prev => {
        const next = prev + 1;
        if (next >= bulletPoints.length) {
          setPhase('collapsed');
          return 0;
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [phase, bulletPoints.length]);

  useEffect(() => {
    setPhase('rotating');
    setCurrentIdx(0);
  }, [title]);

  if (bulletPoints.length === 0) {
    return <h1 className="pdp__title">{title}</h1>;
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
        <div className="pdp__bullets pdp__bullets--list">
          {bulletPoints.map((bp, i) => (
            <motion.span
              key={i}
              className="pdp__bullet-tag"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {bp}
            </motion.span>
          ))}
        </div>
      )}

      <h1 className="pdp__title">
        {phase === 'collapsed' && (
          <button
            className="pdp__bullet-expand"
            onClick={() => setPhase('expanded')}
            aria-label="Ver diferenciais"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        )}
        {title}
      </h1>
    </>
  );
}
