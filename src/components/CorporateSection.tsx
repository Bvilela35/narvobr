import { motion } from "framer-motion";

const logos = [
  { name: "Netflix", img: "/images/netflix-logo.png" },
  { name: "LinkedIn", img: "/images/linkedin-logo.png" },
  { name: "Amazon", img: "/images/amazon-logo.png" },
];

export function CorporateSection() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-card-elevated rounded-2xl p-10 md:p-14 flex flex-col md:flex-row md:items-center gap-10 md:gap-16">
          {/* Left */}
          <motion.div
            className="md:w-2/5 flex-shrink-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Vendas<br />Corporativas
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed">
              Soluções personalizadas para diferentes ambientes.
            </p>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-6 py-2.5 rounded border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Veja mais
            </a>
          </motion.div>

          {/* Right – logos grid */}
          <motion.div
            className="flex-1 grid grid-cols-3 md:grid-cols-5 gap-8 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {logos.map((l) => (
              <div key={l.name} className="flex items-center justify-center hover:opacity-70 transition-opacity">
                {l.img ? (
                  <img src={l.img} alt={l.name} className="h-5 md:h-6 w-auto object-contain" />
                ) : (
                  <span className="text-[11px] md:text-xs font-bold tracking-[0.15em] text-foreground whitespace-nowrap">
                    {l.text}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
