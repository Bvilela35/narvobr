import { motion } from "framer-motion";

const logos = [
  { name: "Netflix", img: "/images/netflix-logo.png" },
  { name: "LinkedIn", img: "/images/linkedin-logo.png" },
  { name: "Banco do Brasil", text: "BANCO DO BRASIL" },
  { name: "Bradesco", text: "BRADESCO" },
  { name: "Amazon", svg: (
    <svg viewBox="0 0 100 30" className="h-5 md:h-6 w-auto fill-current"><path d="M61.6 21.8c-5.5 4.1-13.6 6.3-20.5 6.3-9.7 0-18.4-3.6-25-9.6-.5-.5-.1-1.1.6-.7 7.1 4.1 15.9 6.6 25 6.6 6.1 0 12.9-1.3 19.1-3.9.9-.4 1.7.6.8 1.3z"/><path d="M63.9 19.2c-.7-.9-4.6-.4-6.4-.2-.5.1-.6-.4-.1-.7 3.1-2.2 8.2-1.6 8.8-.8.6.8-.2 6.2-3.1 8.7-.4.4-.9.2-.7-.3.7-1.7 2.2-5.5 1.5-6.7z"/><path d="M57.6 3.2V1c0-.3.2-.6.6-.6h10c.3 0 .6.2.6.6v1.9c0 .3-.3.8-.8 1.4l-5.2 7.4c1.9 0 4 .2 5.7 1.2.4.2.5.6.5.9v2.4c0 .4-.4.8-.8.6-3.3-1.7-7.7-1.9-11.3 0-.4.2-.8-.2-.8-.6V13c0-.4 0-1 .4-1.6l6-8.6h-5.2c-.3 0-.6-.2-.6-.6zM21 16.6h-3c-.3 0-.5-.2-.6-.5V1.1c0-.3.3-.6.6-.6h2.8c.3 0 .5.2.6.5v2h.1C22.1.9 23.5 0 25.4 0c1.9 0 3.2.9 4 3 .7-1.8 2.3-3 4.3-3 1.3 0 2.7.5 3.6 1.7 1 1.3.8 3.2.8 4.9v9.5c0 .3-.3.6-.6.6h-3c-.3 0-.6-.3-.6-.6V7.5c0-.7.1-2.3-.1-2.9-.2-1-.9-1.3-1.8-1.3-.7 0-1.5.5-1.8 1.3-.3.8-.3 2.2-.3 2.9v8.6c0 .3-.3.6-.6.6h-3c-.3 0-.6-.3-.6-.6V7.5c0-1.8.3-4.3-1.9-4.3-2.2 0-2.1 2.5-2.1 4.3v8.6c0 .3-.3.6-.6.6zM73 0c4.5 0 7 3.9 7 8.8 0 4.8-2.7 8.5-7 8.5-4.5 0-7-3.9-7-8.7C66 4 68.6 0 73 0zm0 3.2c-2.3 0-2.4 3.1-2.4 5s0 6 2.4 6c2.3 0 2.4-3.3 2.4-5.3 0-1.3-.1-2.9-.4-4.2-.3-1.1-.9-1.5-2-1.5zM84.3 16.6h-3c-.3 0-.6-.3-.6-.6V1c0-.3.3-.5.6-.5h2.8c.3 0 .5.2.5.4v2.3h.1c.8-2.1 2-3.1 4-3.1 1.4 0 2.7.5 3.5 1.9.8 1.3.8 3.4.8 5v9.2c0 .3-.3.5-.6.5h-3c-.3 0-.5-.2-.6-.5V7.3c0-1.8.2-4.3-1.9-4.3-.7 0-1.4.5-1.8 1.3-.4 1-.5 2-.5 3v8.8c0 .3-.3.6-.7.6zM48.3 9.6c0 1.2 0 2.2-.6 3.3-.5.9-1.2 1.4-2.1 1.4-1.2 0-1.8-.9-1.8-2.2 0-2.6 2.3-3 4.5-3v.5zm3.1 7.4c-.2.2-.5.2-.7.1-.9-.8-1.1-1.5-1.7-2.5-1.6 1.6-2.7 2.1-4.7 2.1-2.4 0-4.3-1.5-4.3-4.5 0-2.3 1.3-3.9 3.1-4.7 1.6-.7 3.8-.8 5.5-1V6c0-.7.1-1.6-.4-2.2-.4-.5-1.1-.7-1.8-.7-1.2 0-2.3.6-2.5 1.9-.1.3-.3.5-.5.5l-2.9-.3c-.2-.1-.5-.3-.4-.6C41.7 1.5 44.8 0 47.7 0c1.5 0 3.4.4 4.5 1.5 1.5 1.4 1.4 3.2 1.4 5.2v4.7c0 1.4.6 2 1.1 2.8.2.3.2.6 0 .8-.6.5-1.6 1.4-2.2 1.9l-.1.1z"/><path d="M8.6 9.6c0 1.2 0 2.2-.6 3.3-.5.9-1.2 1.4-2.1 1.4-1.2 0-1.8-.9-1.8-2.2 0-2.6 2.3-3 4.5-3v.5zm3.1 7.4c-.2.2-.5.2-.7.1-.9-.8-1.1-1.5-1.7-2.5-1.6 1.6-2.7 2.1-4.7 2.1C2.2 16.7 0 15.2 0 12.2 0 9.9 1.3 8.3 3.1 7.5c1.6-.7 3.8-.8 5.5-1V6c0-.7.1-1.6-.4-2.2-.4-.5-1.1-.7-1.8-.7-1.2 0-2.3.6-2.5 1.9-.1.3-.3.5-.5.5L.5 5.2C.3 5.1 0 4.9.1 4.6.7 1.5 3.8 0 6.7 0c1.5 0 3.4.4 4.5 1.5 1.5 1.4 1.4 3.2 1.4 5.2v4.7c0 1.4.6 2 1.1 2.8.2.3.2.6 0 .8-.6.5-1.6 1.4-2.2 1.9l-.1.1z"/></svg>
  )},
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
                {l.svg ? l.svg : l.img ? (
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
