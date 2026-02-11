import { motion } from "framer-motion";
import beforeDesk from "@/assets/before-desk.jpg";
import afterDesk from "@/assets/after-desk.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

export function BeforeAfter() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 border-t border-border">
      <div className="max-w-[1400px] mx-auto">
        <motion.div {...fadeUp} className="mb-16">
          <h2 className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Transformação
          </h2>
          <p className="text-2xl md:text-3xl font-semibold">
            O poder da organização.{" "}
            <span className="font-light text-muted-foreground">
              Menos caos, mais clareza.
            </span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={beforeDesk}
                alt="Mesa de trabalho desorganizada com cabos e objetos espalhados"
                className="w-full aspect-[16/10] object-cover"
                loading="lazy"
              />
              <span className="absolute top-4 left-4 bg-foreground/80 text-background text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full font-medium">
                Antes
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={afterDesk}
                alt="Mesa de trabalho organizada com acessórios Narvo em alumínio e madeira"
                className="w-full aspect-[16/10] object-cover"
                loading="lazy"
              />
              <span className="absolute top-4 left-4 bg-foreground/80 text-background text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full font-medium">
                Depois
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
