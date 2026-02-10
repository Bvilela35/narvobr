import { motion } from "framer-motion";
import { Shield, Truck, Pencil, CreditCard } from "lucide-react";

const items = [
  { icon: Shield, text: "Garantia de 12 meses em todos os produtos." },
  { icon: Truck, text: "Entrega rápida para todo o Brasil." },
  { icon: Pencil, text: "Design autoral. Geometria exclusiva Narvo." },
  { icon: CreditCard, text: "Parcele em até 10x sem juros." },
];

export function BrandDifferentials() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-xl md:text-2xl mb-8 md:mb-10"
        >
          <span className="font-semibold">Na Narvo, é diferente.</span>{" "}
          <span className="font-light text-muted-foreground">
            Ainda mais motivos para escolher a gente.
          </span>
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-card-elevated rounded-2xl p-6 md:p-7 flex flex-col justify-between min-h-[160px]"
            >
              <item.icon
                className="h-8 w-8 text-muted-foreground mb-6"
                strokeWidth={1.4}
              />
              <p className="text-sm md:text-[15px] font-medium leading-snug text-foreground">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
