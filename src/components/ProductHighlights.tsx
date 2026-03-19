import type { ShopifyVideoSource } from "@/lib/shopify";

interface Highlight {
  titulo: string;
  descricao: string;
  midiaUrl: string;
  tipoMidia: "image" | "video";
  videoSources?: ShopifyVideoSource[];
}

interface ProductHighlightsProps {
  highlights?: Highlight[];
}

export default function ProductHighlights({ highlights }: ProductHighlightsProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {highlights.map((item, index) => {
        const isEven = index % 2 === 1;

        const media = (
          <div className="w-full">
            {item.tipoMidia === "video" && item.videoSources?.length ? (
              <video
                className="w-full rounded-2xl object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={item.midiaUrl || undefined}
              >
                {item.videoSources.map((src) => (
                  <source key={src.url} src={src.url} type={src.mimeType} />
                ))}
              </video>
            ) : (
              <img
                src={item.midiaUrl}
                alt={item.titulo}
                className="w-full rounded-2xl object-cover"
                loading="lazy"
              />
            )}
          </div>
        );

        const text = (
          <div className="flex flex-col justify-center gap-4 text-center md:text-left">
            <h3 className="text-2xl md:text-[2rem] lg:text-4xl font-bold leading-tight tracking-tight text-foreground">
              {item.titulo}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
              {item.descricao}
            </p>
          </div>
        );

        return (
          <div key={index} className="flex flex-col md:grid md:grid-cols-2 md:gap-12 lg:gap-20 items-center gap-6">
            {/* Mobile: always text then media */}
            <div className="md:hidden flex flex-col gap-6 items-center">
              {text}
              {media}
            </div>

            {/* Desktop: alternate */}
            {isEven ? (
              <>
                <div className="hidden md:flex">{text}</div>
                <div className="hidden md:block">{media}</div>
              </>
            ) : (
              <>
                <div className="hidden md:block">{media}</div>
                <div className="hidden md:flex">{text}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
