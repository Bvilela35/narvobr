import { motion } from "framer-motion";
import { optimizeShopifyImage } from "@/lib/shopify";

interface Block {
  eyebrow: string;
  title: string;
  body: string;
  source?: string;
}

const BLOCKS: Block[] = [
  {
    eyebrow: "Material",
    title: "Aço que silencia o ambiente.",
    body: "Estrutura em aço carbono com pintura eletrostática fosca. Densidade industrial, toque tátil, sem brilho. Projetado para durar décadas, não temporadas.",
  },
  {
    eyebrow: "Ergonomia",
    title: "A altura correta do olhar.",
    body: "O monitor à altura dos olhos elimina a tensão cervical e mantém a coluna neutra. Postura corrigida sem esforço — o corpo deixa de competir pela atenção.",
  },
  {
    eyebrow: "Organização",
    title: "A mesa volta a ser mesa.",
    body: "O espaço sob o monitor retorna como área útil. Teclado, caderno, cabos: tudo encontra seu lugar. A superfície deixa de ser depósito e volta a ser estação de trabalho.",
  },
  {
    eyebrow: "Ambiente",
    title: "Menos ruído visual, mais foco.",
    body: "Linhas retas, acabamento fosco, presença discreta. O setup deixa de gritar e o trabalho ganha o primeiro plano. Engenharia do silêncio em forma física.",
  },
  {
    eyebrow: "Tempo recuperado",
    title: "23 minutos por interrupção.",
    body: "Cada distração custa em média 23 minutos para o foco voltar. Um ambiente em ordem reduz interrupções visuais em até 47%. O tempo recuperado é o verdadeiro retorno.",
    source: "University of California, Irvine · Princeton Neuroscience Institute",
  },
];

export function NFieldStory({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  return (
    <section className="bg-background py-16 md:py-28 px-6 md:px-10">
      <div className="max-w-[1240px] mx-auto space-y-20 md:space-y-32">
        {BLOCKS.map((block, i) => {
          const imageUrl = images[i % images.length];
          const reverse = i % 2 === 1;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={`grid md:grid-cols-2 gap-10 md:gap-20 items-center ${
                reverse ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="w-full overflow-hidden rounded-2xl" style={{ backgroundColor: "#f8f8f8" }}>
                <img
                  src={optimizeShopifyImage(imageUrl, 1200)}
                  alt={block.title}
                  loading="lazy"
                  className="w-full h-auto aspect-[4/3] object-cover"
                />
              </div>

              <div className="max-w-md">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                  {block.eyebrow}
                </p>
                <h3 className="text-[28px] md:text-[40px] font-semibold leading-tight text-foreground mb-5">
                  {block.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {block.body}
                </p>
                {block.source && (
                  <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    Fonte · {block.source}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
