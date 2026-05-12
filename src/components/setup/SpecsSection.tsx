import { motion } from "framer-motion";

const SPECS: Array<{ key: string; value: string }> = [
  { key: "Material", value: "Aço carbono 1,5mm" },
  { key: "Acabamento", value: "Pintura eletrostática fosca" },
  { key: "Dimensões N-Field", value: "60 × 22 × 11 cm" },
  { key: "Dimensões N-Spine", value: "45 × 6 × 4 cm" },
  { key: "Peso do combo", value: "~3,8 kg" },
  { key: "Capacidade", value: "Até 25 kg · monitor 32\"" },
  { key: "Garantia", value: "12 meses" },
  { key: "Origem", value: "Brasil 🇧🇷" },
];

const STEPS = [
  {
    n: "01",
    title: "Apoie o N-Field sobre a mesa.",
    detail: "Sem furos, sem ferramentas. Pés de borracha antideslizante.",
  },
  {
    n: "02",
    title: "Prenda o N-Spine atrás do monitor.",
    detail: "Presilhas inclusas. Compatível com qualquer suporte VESA.",
  },
  {
    n: "03",
    title: "Recolha os cabos pela coluna.",
    detail: "Tudo invisível em menos de dois minutos. Pronto.",
  },
];

export function SpecsSection() {
  return (
    <section className="bg-background py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Engenharia
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
            Feito para durar uma carreira.{" "}
            <span className="font-light text-muted-foreground">
              Instalado em minutos.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-20">
          {/* Especificações */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
              Especificações
            </p>
            <dl className="divide-y divide-foreground/10">
              {SPECS.map((s) => (
                <div
                  key={s.key}
                  className="flex items-baseline justify-between gap-4 py-4"
                >
                  <dt className="text-sm md:text-base text-muted-foreground">
                    {s.key}
                  </dt>
                  <dd className="text-sm md:text-base font-medium text-foreground text-right">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Como usar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
              Instalação
            </p>
            <ol className="space-y-3">
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className="bg-[#f8f8f8] rounded-2xl p-6 md:p-7 flex gap-5"
                >
                  <span className="text-xl md:text-2xl font-semibold text-[#0f3d2e] tabular-nums leading-none pt-1">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-base md:text-lg font-medium leading-snug">
                      {s.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {s.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
