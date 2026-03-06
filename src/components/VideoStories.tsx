import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { ShopifyVideo } from "@/lib/shopify";

interface VideoStoriesProps {
  videos: ShopifyVideo[];
  open: boolean;
  onClose: () => void;
}

export function VideoStories({ videos, open, onClose }: VideoStoriesProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrame = useRef<number>(0);
  const swipeStartX = useRef(0);

  const total = videos.length;
  const current = videos[currentIdx];

  const goNext = useCallback(() => {
    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIdx, total, onClose]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setProgress(0);
    }
  }, [currentIdx]);

  // Update progress bar from video time
  useEffect(() => {
    if (!open) return;
    const vid = videoRef.current;
    if (!vid) return;

    const updateProgress = () => {
      if (vid.duration && vid.duration > 0) {
        setProgress((vid.currentTime / vid.duration) * 100);
      }
      animFrame.current = requestAnimationFrame(updateProgress);
    };
    animFrame.current = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animFrame.current);
  }, [open, currentIdx]);

  // Auto-advance when video ends
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleEnd = () => goNext();
    vid.addEventListener("ended", handleEnd);
    return () => vid.removeEventListener("ended", handleEnd);
  }, [goNext, currentIdx]);

  // Play/pause sync
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (paused) vid.pause();
    else vid.play().catch(() => {});
  }, [paused, currentIdx]);

  // Keyboard controls
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goNext, goPrev, onClose]);

  // Reset on open
  useEffect(() => {
    if (open) { setCurrentIdx(0); setProgress(0); setPaused(false); }
  }, [open]);

  if (!open || !current) return null;

  const videoSrc = current.sources.find((s) => s.mimeType === "video/mp4")?.url || current.sources[0]?.url;

  return (
    <div
      className="stories-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { if (e.touches.length === 1) swipeStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (e.changedTouches.length === 1) {
          const delta = e.changedTouches[0].clientX - swipeStartX.current;
          if (Math.abs(delta) > 60) {
            if (delta < 0) goNext(); else goPrev();
          }
        }
      }}
    >
      <style>{`
        .stories-overlay {
          position: fixed;
          inset: 0;
          z-index: 300;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stories-container {
          position: relative;
          width: 100%;
          max-width: 420px;
          height: 100vh;
          max-height: 100dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .stories-progress-bar {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          z-index: 10;
          display: flex;
          gap: 4px;
        }

        .stories-progress-track {
          flex: 1;
          height: 3px;
          background: rgba(255,255,255,0.25);
          border-radius: 2px;
          overflow: hidden;
        }

        .stories-progress-fill {
          height: 100%;
          background: #fff;
          border-radius: 2px;
          transition: width 0.1s linear;
        }

        .stories-close {
          position: absolute;
          top: 28px;
          right: 12px;
          z-index: 10;
          background: rgba(255,255,255,0.15);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
        }
        .stories-close:hover { background: rgba(255,255,255,0.25); }

        .stories-controls {
          position: absolute;
          bottom: 32px;
          left: 12px;
          right: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .stories-ctrl-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          transition: background 0.15s;
        }
        .stories-ctrl-btn:hover { background: rgba(255,255,255,0.25); }

        .stories-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stories-tap-left,
        .stories-tap-right {
          position: absolute;
          top: 60px;
          bottom: 80px;
          z-index: 5;
          background: none;
          border: none;
          cursor: pointer;
        }
        .stories-tap-left { left: 0; width: 30%; }
        .stories-tap-right { right: 0; width: 70%; }

        .stories-counter {
          position: absolute;
          top: 30px;
          left: 12px;
          z-index: 10;
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          font-variant-numeric: tabular-nums;
        }
      `}</style>

      <div className="stories-container">
        {/* Progress bars */}
        <div className="stories-progress-bar">
          {videos.map((_, i) => (
            <div key={i} className="stories-progress-track">
              <div
                className="stories-progress-fill"
                style={{
                  width: i < currentIdx ? "100%" : i === currentIdx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {total > 1 && (
          <span className="stories-counter">{currentIdx + 1}/{total}</span>
        )}

        <button className="stories-close" onClick={onClose} aria-label="Fechar">
          <X size={18} />
        </button>

        {/* Tap zones */}
        <button className="stories-tap-left" onClick={goPrev} aria-label="Anterior" />
        <button className="stories-tap-right" onClick={goNext} aria-label="Próximo" />

        {/* Video */}
        <video
          ref={videoRef}
          key={currentIdx}
          className="stories-video"
          src={videoSrc}
          autoPlay
          playsInline
          muted={muted}
          poster={current.previewImage?.url}
        />

        {/* Controls */}
        <div className="stories-controls">
          {total > 1 && (
            <button className="stories-ctrl-btn" onClick={goPrev} aria-label="Anterior" disabled={currentIdx === 0} style={{ opacity: currentIdx === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <button className="stories-ctrl-btn" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play" : "Pausar"}>
            {paused ? <Play size={20} /> : <Pause size={20} />}
          </button>
          <button className="stories-ctrl-btn" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Ativar som" : "Silenciar"}>
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          {total > 1 && (
            <button className="stories-ctrl-btn" onClick={goNext} aria-label="Próximo" disabled={currentIdx === total - 1} style={{ opacity: currentIdx === total - 1 ? 0.3 : 1 }}>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
