const CLIENTS = [
  "Netflix",
  "Amazon",
  "LinkedIn",
  "Banco do Brasil",
  "Bradesco",
  "Porto Bello",
];

export function ClientsMarquee() {
  // Duplicate for seamless loop
  const items = [...CLIENTS, ...CLIENTS];

  return (
    <section className="pdp__content-section" style={{ paddingTop: 16, paddingBottom: 4 }} aria-label="Clientes corporativos">
      <div className="pdp__content-section-inner">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Quem confia na Narvo
          </p>
        </div>
        <div className="clients-marquee">
          <div className="clients-marquee__track">
            {items.map((name, i) => (
              <span key={i} className="clients-marquee__item">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .clients-marquee {
          position: relative;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .clients-marquee__track {
          display: flex;
          gap: 4rem;
          width: max-content;
          animation: clients-marquee-scroll 32s linear infinite;
        }
        .clients-marquee__item {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 1.125rem;
          letter-spacing: 0.02em;
          color: hsl(var(--foreground) / 0.65);
          white-space: nowrap;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .clients-marquee__track { gap: 6rem; }
          .clients-marquee__item { font-size: 1.375rem; }
        }
        @keyframes clients-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .clients-marquee__track { animation-duration: 90s; }
        }
      `}</style>
    </section>
  );
}
