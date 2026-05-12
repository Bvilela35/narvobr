const CLIENTS = [
  { name: "Netflix", domain: "netflix.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "Banco do Brasil", domain: "bb.com.br" },
  { name: "Bradesco", domain: "bradesco.com.br" },
  { name: "Porto Bello", domain: "portobello.com.br" },
];

export function ClientsMarquee() {
  // Duplicate for seamless loop
  const items = [...CLIENTS, ...CLIENTS];

  return (
    <section className="pdp__content-section" style={{ paddingTop: 16, paddingBottom: 4 }} aria-label="Clientes corporativos">
      <div className="pdp__content-section-inner">
        <div className="text-center mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Quem confia na Narvo
          </p>
        </div>
        <div className="clients-marquee">
          <div className="clients-marquee__track">
            {items.map((c, i) => (
              <div key={i} className="clients-marquee__item">
                <img
                  src={`https://logo.clearbit.com/${c.domain}`}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = "none";
                    const next = t.nextElementSibling as HTMLElement | null;
                    if (next) next.style.display = "inline-block";
                  }}
                />
                <span className="clients-marquee__fallback">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .clients-marquee {
          position: relative;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
        .clients-marquee__track {
          display: flex;
          align-items: center;
          gap: 4rem;
          width: max-content;
          animation: clients-marquee-scroll 36s linear infinite;
        }
        .clients-marquee__item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          flex-shrink: 0;
        }
        .clients-marquee__item img {
          height: 100%;
          width: auto;
          max-width: 140px;
          object-fit: contain;
          filter: grayscale(100%);
          opacity: 0.7;
          transition: opacity 0.3s ease, filter 0.3s ease;
        }
        .clients-marquee__item:hover img {
          filter: grayscale(0%);
          opacity: 1;
        }
        .clients-marquee__fallback {
          display: none;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 1.125rem;
          color: hsl(var(--foreground) / 0.65);
          white-space: nowrap;
        }
        @media (min-width: 768px) {
          .clients-marquee__track { gap: 6rem; }
          .clients-marquee__item { height: 44px; }
          .clients-marquee__item img { max-width: 180px; }
          .clients-marquee__fallback { font-size: 1.375rem; }
        }
        @keyframes clients-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .clients-marquee__track { animation-duration: 100s; }
        }
      `}</style>
    </section>
  );
}
