import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";

/**
 * Edite este array para adicionar/remover stories.
 * - `label`: texto curto exibido abaixo da bolinha
 * - `thumbnail`: imagem da capa (1:1, ideal 400x400)
 * - `video`: URL do vídeo .mp4 (vertical 9:16, idealmente <15s)
 *
 * Você pode subir os arquivos em `public/setup-stories/` e referenciar como
 * `/setup-stories/nome.mp4` ou usar URLs externas (CDN, Shopify, etc).
 */
export type SetupStory = {
  label: string;
  thumbnail: string;
  video: string;
};

interface Props {
  stories: SetupStory[];
}

export function SetupStoriesBar({ stories }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!stories.length) return null;

  return (
    <section className="bg-background border-y border-foreground/5">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-8">
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none -mx-1 px-1 snap-x snap-mandatory">
          {stories.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIdx(i)}
              className="flex-shrink-0 flex flex-col items-center gap-2 snap-start group"
              aria-label={`Ver story: ${s.label}`}
            >
              <span className="block p-[2px] rounded-full bg-gradient-to-tr from-[#0f3d2e] to-[#b6e36d] transition-transform group-hover:scale-105 group-active:scale-95">
                <span className="block p-[2px] rounded-full bg-background">
                  <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-[#f0f0f0]">
                    {s.thumbnail ? (
                      <img
                        src={s.thumbnail}
                        alt={s.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={80}
                        height={80}
                      />
                    ) : (
                      <span className="block w-full h-full" />
                    )}
                  </span>
                </span>
              </span>
              <span className="text-[11px] md:text-xs text-foreground/70 max-w-[80px] text-center leading-tight truncate">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {openIdx !== null && (
        <StoriesViewer
          stories={stories}
          startIdx={openIdx}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </section>
  );
}

function StoriesViewer({
  stories,
  startIdx,
  onClose,
}: {
  stories: SetupStory[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animRef = useRef<number>(0);
  const swipeX = useRef(0);

  const total = stories.length;
  const current = stories[idx];

  const next = useCallback(() => {
    setProgress(0);
    if (idx < total - 1) setIdx((i) => i + 1);
    else onClose();
  }, [idx, total, onClose]);

  const prev = useCallback(() => {
    setProgress(0);
    if (idx > 0) setIdx((i) => i - 1);
  }, [idx]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tick = () => {
      if (v.duration > 0) setProgress((v.currentTime / v.duration) * 100);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [idx]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnd = () => next();
    v.addEventListener("ended", onEnd);
    return () => v.removeEventListener("ended", onEnd);
  }, [next]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, idx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev, onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        if (e.touches.length === 1) swipeX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (e.changedTouches.length === 1) {
          const d = e.changedTouches[0].clientX - swipeX.current;
          if (Math.abs(d) > 60) {
            if (d < 0) next();
            else prev();
          }
        }
      }}
    >
      <div className="relative w-full max-w-[420px] h-[100dvh] flex flex-col overflow-hidden">
        {/* Progress */}
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white transition-[width] duration-100 ease-linear"
                style={{
                  width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <span className="absolute top-7 left-3 z-10 text-white/60 text-xs tabular-nums">
          {idx + 1}/{total}
        </span>

        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-7 right-3 z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
        >
          <X size={18} />
        </button>

        {/* Tap zones */}
        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute top-16 bottom-20 left-0 w-[30%] z-[5]"
        />
        <button
          onClick={next}
          aria-label="Próximo"
          className="absolute top-16 bottom-20 right-0 w-[70%] z-[5]"
        />

        {current.video ? (
          <video
            ref={videoRef}
            key={idx}
            src={current.video}
            poster={current.thumbnail}
            autoPlay
            playsInline
            muted={muted}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/60 text-sm gap-2 px-6 text-center">
            <span className="text-xs uppercase tracking-[0.2em]">{current.label}</span>
            <span>Vídeo em breve.</span>
          </div>
        )}

        <div className="absolute bottom-8 left-3 right-3 z-10 flex items-center justify-center gap-5">
          {total > 1 && (
            <button
              onClick={prev}
              disabled={idx === 0}
              aria-label="Anterior"
              className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play" : "Pausar"}
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
          >
            {paused ? <Play size={20} /> : <Pause size={20} />}
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Ativar som" : "Silenciar"}
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          {total > 1 && (
            <button
              onClick={next}
              disabled={idx === total - 1}
              aria-label="Próximo"
              className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
