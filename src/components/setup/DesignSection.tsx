import { motion } from "framer-motion";
import designDetail from "@/assets/setup/design-detail.jpg";
import designContext from "@/assets/setup/design-context.jpg";

interface Props {
  fieldImage?: string;
}

export function DesignSection({ fieldImage }: Props) {
  return (
    <section className="bg-[#f8f8f8] py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Design
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
            Forma reduzida ao essencial.{" "}
            <span className="font-light text-muted-foreground">
              Atemporal por engenharia, não por moda.
            </span>
          </h2>
        </div>

        {/* Bloco A — Linhas que somem */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden bg-background mb-6 md:mb-8 aspect-[16/10]"
        >
          <img
            src={fieldImage || designDetail}
            alt="Detalhe de aço dobrado do N-Field"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            width={1920}
            height={1200}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-14 max-w-md text-white">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/70 mb-3">
              01 · Estrutura
            </p>
            <p className="text-xl md:text-3xl font-medium leading-tight">
              Linhas retas. <br />
              <span className="font-light text-white/80">
                Zero parafusos à vista.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Bloco B — Cores em contexto */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="grid md:grid-cols-[1fr,auto] gap-6 md:gap-8 items-end mb-6 md:mb-8"
        >
          <div className="rounded-3xl overflow-hidden bg-background aspect-[16/9]">
            <img
              src={designContext}
              alt="N-Field e N-Spine nas duas cores: preto e verde"
              className="w-full h-full object-cover"
              loading="lazy"
              width={1920}
              height={1080}
            />
          </div>
          <div className="md:max-w-xs md:pb-4">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              02 · Cores
            </p>
            <p className="text-xl md:text-2xl font-medium leading-tight mb-5">
              Duas cores.{" "}
              <span className="font-light text-muted-foreground">
                Nenhuma para chamar atenção.
              </span>
            </p>
            <div className="flex gap-4">
              {[
                { name: "Preto Fosco", hex: "#1a1a1a" },
                { name: "Verde Narvo", hex: "#0f3d2e" },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-full border border-foreground/15"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs text-foreground/80">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bloco C — Detalhe que não aparece */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid md:grid-cols-2 gap-6 md:gap-10 items-center"
        >
          <div className="rounded-3xl overflow-hidden bg-background aspect-square">
            <img
              src={designDetail}
              alt="Macro do acabamento eletrostático fosco"
              className="w-full h-full object-cover"
              loading="lazy"
              width={1200}
              height={1200}
            />
          </div>
          <div className="md:pl-6">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              03 · Acabamento
            </p>
            <p className="text-2xl md:text-4xl font-medium leading-tight mb-5">
              Os detalhes que ninguém vê <br />
              <span className="font-light text-muted-foreground">
                são os que mais importam.
              </span>
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
              Pintura eletrostática fosca aplicada em cabine industrial. Resiste a
              riscos, marcas de digitais e ao tempo — sem reflexo, sem brilho que
              cansa o olhar.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
