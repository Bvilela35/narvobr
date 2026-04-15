import { Link } from "react-router-dom";
import { usePrefetchCollection } from "@/hooks/useShopify";

const cards = [
  {
    title: "InSight™",
    copy: "Ferramentas sobre a mesa para organizar o fluxo de trabalho.",
    link: "/colecao/narvo-insight",
    handle: "narvo-insight",
    image: "/optimized/home/insight-card-960.jpg"
  },
  {
    title: "OutSight™",
    copy: "Engenharia invisível para eliminar o ruído técnico.",
    link: "/colecao/narvo-outsight",
    handle: "narvo-outsight",
    image: "/optimized/home/outsight-card-960.jpg"
  }
];

export function TheSystemSection() {
  const prefetchCollection = usePrefetchCollection();

  return (
    <section className="py-12 px-6 md:px-10 md:py-[79px]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl leading-tight mb-2">
            <span className="font-bold text-foreground text-3xl">Organize o que você toca.</span>{" "}
            <span className="font-light text-muted-foreground text-3xl">Silencie o que você vê.</span>
          </h2>
          <p className="text-sm text-muted-foreground">Dois planos. Um único objetivo: o silêncio visual absoluto.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
          {cards.map((card, i) => (
            <div key={card.title}>
              <Link
                to={card.link}
                className="group relative block rounded-2xl overflow-hidden aspect-[16/10] md:aspect-[4/3]"
                onMouseEnter={() => prefetchCollection(card.handle)}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  width={1024}
                  height={1536}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                <div className="relative z-10 p-5 md:p-7">
                  <h3 className="font-semibold leading-tight mb-1 text-white md:text-5xl text-4xl">{card.title}</h3>
                  <p className="text-white/80 leading-snug text-lg">{card.copy}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
