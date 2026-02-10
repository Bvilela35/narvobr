import { motion } from "framer-motion";
import { Layers, Target, Zap } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const principles = [
  { icon: Target, title: "Precisão industrial", desc: "Cada peça segue tolerâncias mínimas de fabricação. Detalhes que você sente, mas não precisa ver." },
  { icon: Layers, title: "Conforto humano", desc: "Ergonomia sem marketing. Superfícies pensadas para horas de uso contínuo sem fadiga." },
  { icon: Zap, title: "Foco", desc: "Eliminar ruído visual é liberar atenção. Menos decisões estéticas, mais espaço para o que importa." },
];

export default function Sobre() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div {...fadeUp} className="max-w-2xl mb-24">
          <h1 className="text-3xl md:text-4xl font-light mb-6">Sobre a Narvo</h1>
          <p className="text-base opacity-60 leading-relaxed mb-4">
            Narvo nasce da ideia de que o espaço de trabalho é infraestrutura, não decoração.
          </p>
          <p className="text-base opacity-60 leading-relaxed mb-4">
            Projetamos acessórios para setup com a mesma mentalidade de quem projeta ferramentas profissionais:
            cada material tem um propósito, cada ângulo é intencional, cada peça elimina uma distração.
          </p>
          <p className="text-base opacity-60 leading-relaxed">
            Sem excesso. Sem ruído. Apenas engenharia silenciosa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {principles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <p.icon className="h-5 w-5 mb-4 opacity-40" strokeWidth={1.5} />
              <h3 className="text-lg font-medium mb-3">{p.title}</h3>
              <p className="text-sm opacity-50 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
