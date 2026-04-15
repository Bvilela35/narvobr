import { motion } from "framer-motion";
import { Building2, Users, Palette, MessageCircle } from "lucide-react";

const benefits = [
  {
    icon: Building2,
    title: "Ambientes Corporativos",
    description: "Setups completos para escritórios, estúdios e espaços de trabalho compartilhados.",
  },
  {
    icon: Users,
    title: "Projetos em Escala",
    description: "Condições especiais para pedidos a partir de 10 unidades.",
  },
  {
    icon: Palette,
    title: "Personalização",
    description: "Cores, acabamentos e gravações exclusivas para sua marca.",
  },
];

const logos = [
  { name: "Netflix", img: "/images/netflix-logo.png", className: "h-7 md:h-10" },
  { name: "LinkedIn", img: "/images/linkedin-logo.png", className: "h-5 md:h-7" },
  { name: "Amazon", img: "/images/amazon-logo.png", className: "h-9 md:h-14" },
];

export default function Corporativo() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="px-6 md:px-10 max-w-[1400px] mx-auto text-center mb-20">
        <motion.h1
          className="text-4xl md:text-6xl font-bold tracking-tight leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Vendas Corporativas
        </motion.h1>
        <motion.p
          className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Soluções sob medida para equipar ambientes profissionais com a precisão e durabilidade Narvo.
        </motion.p>
      </section>

      {/* Benefits */}
      <section className="px-6 md:px-10 max-w-[1400px] mx-auto mb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className="bg-card-elevated rounded-2xl p-8 md:p-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <b.icon className="h-6 w-6 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold tracking-tight mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trusted by */}
      <section className="px-6 md:px-10 max-w-[1400px] mx-auto mb-20 text-center">
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-8">
          Empresas que confiam na Narvo
        </p>
        <div className="flex items-center justify-center gap-12 md:gap-16 flex-wrap">
          {logos.map((logo) => (
            <img
              key={logo.name}
              src={logo.img}
              alt={logo.name}
              className={logo.className}
              loading="lazy"
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 max-w-[1400px] mx-auto text-center">
        <motion.div
          className="bg-card-elevated rounded-2xl p-10 md:p-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Fale com nosso time
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Envie uma mensagem e receba uma proposta personalizada para o seu projeto.
          </p>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" />
            Solicitar Proposta
          </a>
        </motion.div>
      </section>
    </div>
  );
}
