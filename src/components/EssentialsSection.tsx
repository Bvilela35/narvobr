import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const blocks = [
  {
    title: "Nossa História",
    desc: "De uma obsessão por ordem nasceu um ecossistema. Conheça a origem da Engenharia do Silêncio.",
    to: "/nossa-historia",
  },
  {
    title: "Materiais & Design",
    desc: "Aço, polímero, feltro. Cada material é escolhido por função, não por aparência.",
    to: "/materiais",
  },
];

export function EssentialsSection() {
  return (
    <section className="px-6 md:px-10 py-6 md:py-10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {blocks.map((b, i) => (
          <motion.div
            key={b.to}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="rounded-2xl p-10 md:p-14 flex flex-col items-center justify-center text-center min-h-[280px]"
            style={{ backgroundColor: "#f8f8f8" }}
          >
            <h3 className="text-2xl md:text-3xl font-semibold mb-3">{b.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              {b.desc}
            </p>
            <Link
              to={b.to}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Saiba mais &gt;
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
