import { motion } from "framer-motion";
import { Shield, Timer, Compass, Percent } from "lucide-react";

const differentials = [
  {
    icon: Shield,
    title: "Garantia de 12 meses.",
    desc: "Projetado para a permanência. Cobertura total contra defeitos em cada componente da estrutura.",
  },
  {
    icon: Timer,
    title: "Logística Prioritária.",
    desc: "Fluxo de entrega otimizado para todo o Brasil. Sua ferramenta entregue com precisão e rapidez.",
  },
  {
    icon: Compass,
    title: "Design Autoral.",
    desc: "Geometria exclusiva. Cada ângulo foi projetado para eliminar distrações visuais.",
  },
  {
    icon: Percent,
    title: "Em até 10x sem juros.",
    desc: "Viabilize seu setup de alta performance com parcelamento fixo. Investimento direto, sem excessos.",
  },
];

export function BrandDifferentials() {
  return (
    <section
      className="relative py-24 md:py-32 px-6 md:px-10 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a1a1e 0%, #141417 100%)",
      }}
    >
      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 md:mb-20 max-w-2xl"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#f0efe9] leading-tight">
            Na Narvo, a engenharia é silenciosa.{" "}
            <span className="font-light text-[#7a7a80]">O foco é seu.</span>
          </h2>
          <p className="text-sm md:text-base text-[#5a5a60] mt-4 font-light leading-relaxed">
            Estruturas projetadas para elevar sua estação de trabalho e jogo.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {differentials.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="group relative rounded-3xl p-7 md:p-8 transition-all duration-500"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Hover glow effect — steel reflection */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(180,180,190,0.15), 0 0 30px -10px rgba(180,180,190,0.08)",
                }}
              />

              <d.icon
                className="h-6 w-6 mb-6 text-[#8a8a90]"
                strokeWidth={1.2}
              />
              <h3 className="text-base font-semibold text-[#e8e7e1] mb-2">
                {d.title}
              </h3>
              <p className="text-sm font-light text-[#6a6a70] leading-relaxed">
                {d.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
