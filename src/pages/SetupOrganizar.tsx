import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Truck, Wrench, ArrowRight, Check } from "lucide-react";
import { useProductByHandle } from "@/hooks/useShopify";
import { useCartStore } from "@/stores/cartStore";
import { calcInstallments, formatInstallmentText } from "@/lib/installments";
import { trackAddToCart, trackViewItem } from "@/lib/analytics";
import { BeforeAfter } from "@/components/BeforeAfter";
import { getColorHex } from "@/lib/colorSwatches";
import { ReviewsSection } from "@/components/ReviewsSection";
import { SetupStoriesBar, type SetupStory } from "@/components/SetupStoriesBar";
import { CostOfDistraction } from "@/components/setup/CostOfDistraction";
import { DesignSection } from "@/components/setup/DesignSection";
import { SpecsSection } from "@/components/setup/SpecsSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroImg from "@/assets/setup/setup-hero.jpg";
import materialImg from "@/assets/setup/material-macro.jpg";

const SITE_URL = "https://narvo.com.br";
const PAGE_PATH = "/setup-organizar";
const CANONICAL = `${SITE_URL}${PAGE_PATH}`;

function formatPrice(amount: number): string {
  return amount % 1 === 0
    ? `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const FAQS = [
  {
    q: "Em quanto tempo recebo o setup?",
    a: "Despachamos em até 2 dias úteis. O prazo de entrega varia entre 3 e 9 dias úteis, conforme sua região.",
  },
  {
    q: "Preciso furar a mesa para instalar?",
    a: "Não. O N-Field apoia sobre a mesa e o N-Spine se prende por presilhas — sem furos, sem ferramentas.",
  },
  {
    q: "É compatível com qualquer monitor?",
    a: "Sim. O N-Field eleva monitores de 21\" a 32\". O N-Spine organiza os cabos do monitor, da fonte e do hub independentemente do modelo.",
  },
  {
    q: "Qual a garantia?",
    a: "12 meses contra defeitos de fabricação. Aço carbono com pintura eletrostática fosca, projetado para durar.",
  },
  {
    q: "Posso devolver se não gostar?",
    a: "Sim. Você tem 7 dias corridos após o recebimento para devolver, conforme o Código de Defesa do Consumidor.",
  },
] as const;

/**
 * STORIES da landing — substitua os campos `thumbnail` e `video` pelos arquivos reais.
 * Sugestão: subir em `public/setup-stories/` e referenciar como `/setup-stories/arquivo.mp4`.
 */
const STORIES: SetupStory[] = [
  { label: "Antes & Depois", thumbnail: "", video: "" },
  { label: "Cabos invisíveis", thumbnail: "", video: "" },
  { label: "Material", thumbnail: "", video: "" },
  { label: "Instalação", thumbnail: "", video: "" },
  { label: "No escritório", thumbnail: "", video: "" },
];

export default function SetupOrganizar() {
  const { data: nField, isLoading: loadingField } = useProductByHandle("n-field");
  const { data: nSpine, isLoading: loadingSpine } = useProductByHandle("n-spine");
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  const fieldVariants = nField?.node?.variants?.edges ?? [];
  const spineVariants = nSpine?.node?.variants?.edges ?? [];

  const firstAvailable = (edges: typeof fieldVariants) =>
    edges.find((e) => e.node.availableForSale)?.node ?? edges[0]?.node ?? null;

  const [fieldVariantId, setFieldVariantId] = useState<string | null>(null);
  const [spineVariantId, setSpineVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (!fieldVariantId && fieldVariants.length) setFieldVariantId(firstAvailable(fieldVariants)?.id ?? null);
  }, [fieldVariants, fieldVariantId]);

  useEffect(() => {
    if (!spineVariantId && spineVariants.length) setSpineVariantId(firstAvailable(spineVariants)?.id ?? null);
  }, [spineVariants, spineVariantId]);

  const fieldVariant = fieldVariants.find((e) => e.node.id === fieldVariantId)?.node ?? null;
  const spineVariant = spineVariants.find((e) => e.node.id === spineVariantId)?.node ?? null;

  const fieldPrice = fieldVariant ? parseFloat(fieldVariant.price.amount) : 0;
  const spinePrice = spineVariant ? parseFloat(spineVariant.price.amount) : 0;
  const totalPrice = fieldPrice + spinePrice;
  const { count: instCount, value: instVal } = calcInstallments(totalPrice);
  const installmentText = formatInstallmentText(totalPrice);

  // Variant view tracking
  useEffect(() => {
    if (nField?.node && fieldVariant) {
      trackViewItem({
        productId: nField.node.id,
        productTitle: nField.node.title,
        variantId: fieldVariant.id,
        variantTitle: fieldVariant.title,
        price: parseFloat(fieldVariant.price.amount),
      });
    }
  }, [nField?.node?.id, fieldVariant?.id]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!nField?.node || !nSpine?.node || !fieldVariant || !spineVariant) return;
    setSubmitting(true);
    setError(null);
    try {
      await addItem({
        product: nField,
        variantId: fieldVariant.id,
        variantTitle: fieldVariant.title,
        price: fieldVariant.price,
        quantity: 1,
        selectedOptions: fieldVariant.selectedOptions || [],
      });
      trackAddToCart({
        productId: nField.node.id,
        variantId: fieldVariant.id,
        productTitle: nField.node.title,
        variantTitle: fieldVariant.title,
        price: fieldPrice,
        quantity: 1,
      });

      await addItem({
        product: nSpine,
        variantId: spineVariant.id,
        variantTitle: spineVariant.title,
        price: spineVariant.price,
        quantity: 1,
        selectedOptions: spineVariant.selectedOptions || [],
      });
      trackAddToCart({
        productId: nSpine.node.id,
        variantId: spineVariant.id,
        productTitle: nSpine.node.title,
        variantTitle: spineVariant.title,
        price: spinePrice,
        quantity: 1,
      });

      // Abre o carrinho lateral, mesmo fluxo dos demais produtos
      window.dispatchEvent(new Event("narvo:open-cart"));
    } catch (e) {
      console.error("[SetupOrganizar] add to cart error", e);
      setError("Erro ao adicionar o combo ao carrinho. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToBuy = () => {
    document.getElementById("comprar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loading = loadingField || loadingSpine;
  const ready = !!fieldVariant && !!spineVariant;

  // Hero image swap if Shopify provides one
  const fieldImage = nField?.node?.images?.edges?.[0]?.node?.url;
  const spineImage = nSpine?.node?.images?.edges?.[0]?.node?.url;

  const seoTitle = "Setup Foco Total | Combo N-Field + N-Spine — Narvo";
  const seoDescription =
    "Organize sua estação de trabalho com aço eletrostático. Combo N-Field + N-Spine: superfície elevada e cabos invisíveis para você dominar o digital.";

  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="product.group" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* Minimal header */}
      <header className="absolute top-0 inset-x-0 z-30 px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/optimized/narvo-logo-224.png" alt="Narvo" className="h-8 w-auto" />
        </Link>
        <span className="hidden md:inline text-xs uppercase tracking-[0.2em] text-foreground/60">
          Engenharia do Silêncio
        </span>
      </header>

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <img
          src={heroImg}
          alt="Estação de trabalho organizada com N-Field e N-Spine"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pb-16 md:pb-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-2xl text-white"
          >
            <span className="inline-block text-[11px] uppercase tracking-[0.25em] bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 mb-6">
              Combo · Edição limitada
            </span>
            <h1 className="text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Sua mesa,<br />em silêncio.
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/85 max-w-lg leading-relaxed">
              O combo <span className="font-medium">N-Field + N-Spine</span> organiza o
              físico para você dominar o digital. Aço eletrostático. Cabos invisíveis.
              Foco intacto.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                href="#comprar"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#b6e36d] text-[#0f3d2e] font-semibold text-sm tracking-wide hover:bg-[#c8ec88] transition-colors"
              >
                Montar meu setup
                {instCount > 1 && (
                  <span className="opacity-80">— {instCount}x {formatPrice(instVal)}</span>
                )}
                <ArrowRight className="w-4 h-4" />
              </a>
              {totalPrice > 0 && (
                <span className="text-xs text-white/60 uppercase tracking-[0.16em]">
                  ou {formatPrice(totalPrice)} à vista
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70 uppercase tracking-[0.18em]">
              <span>Aço eletrostático</span>
              <span>·</span>
              <span>2 cores</span>
              <span>·</span>
              <span>Frete Brasil</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STORIES BAR */}
      <SetupStoriesBar stories={STORIES} />

      {/* BEFORE / AFTER */}
      <section className="bg-background">
        <BeforeAfter />
      </section>

      {/* COMBO ANATOMY */}
      <section className="py-20 md:py-28 px-6 md:px-10 bg-[#f8f8f8]">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">O sistema</p>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              Duas peças.{" "}
              <span className="font-light text-muted-foreground">Um único organismo.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-px bg-foreground/20" />

            {[
              {
                title: "N-Field",
                role: "A superfície",
                copy: "Eleva o monitor à altura ergonômica e libera a mesa. Aço carbono dobrado, pintura eletrostática fosca.",
                image: fieldImage,
              },
              {
                title: "N-Spine",
                role: "O esconderijo",
                copy: "Recolhe e esconde todos os cabos do monitor por trás de uma coluna vertical. Zero spaghetti visual.",
                image: spineImage,
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-background rounded-3xl p-8 md:p-10 flex flex-col"
              >
                <div className="aspect-square bg-[#f0f0f0] rounded-2xl mb-6 overflow-hidden flex items-center justify-center">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-contain p-6"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-foreground/5 animate-pulse" />
                  )}
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {card.role}
                </p>
                <h3 className="text-2xl md:text-3xl font-semibold mb-3">{card.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{card.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTO DA DISTRAÇÃO */}
      <CostOfDistraction />

      {/* MATERIAL */}
      <section className="relative py-24 md:py-32 px-6 md:px-10 overflow-hidden bg-[#0f3d2e] text-white">
        <img
          src={materialImg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
          loading="lazy"
          width={1600}
          height={1024}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f3d2e]/80 via-[#0f3d2e]/60 to-[#0f3d2e]/95" />

        <div className="relative z-10 max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#b6e36d] mb-4">O material</p>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              Aço.{" "}
              <span className="font-light text-white/70">Para durar uma carreira.</span>
            </h2>
            <p className="mt-6 text-white/75 leading-relaxed max-w-md">
              Pintura eletrostática fosca em aço carbono. Resiste a riscos, marcas
              de digitais e ao tempo. Atemporal por engenharia, não por moda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              { icon: Wrench, label: "Aço Carbono" },
              { icon: ShieldCheck, label: "Pintura Eletrostática" },
              { icon: Truck, label: "Frete Brasil" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-[#0f3d2e] p-6 flex flex-col items-start gap-3">
                <Icon className="w-5 h-5 text-[#b6e36d]" strokeWidth={1.5} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUY BOX */}
      <section id="comprar" className="py-20 md:py-28 px-6 md:px-10 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Monte seu combo
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Escolha as cores e finalize.
            </h2>
          </div>

          <div className="bg-[#f8f8f8] rounded-3xl p-6 md:p-10">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !ready ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Produto temporariamente indisponível. Tente novamente em instantes.
              </p>
            ) : (
              <>
                <VariantPicker
                  label="Cor do N-Field"
                  variants={fieldVariants}
                  selectedId={fieldVariantId}
                  onSelect={setFieldVariantId}
                />
                <div className="h-px bg-foreground/10 my-6" />
                <VariantPicker
                  label="Cor do N-Spine"
                  variants={spineVariants}
                  selectedId={spineVariantId}
                  onSelect={setSpineVariantId}
                />

                <div className="h-px bg-foreground/10 my-6" />

                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
                      Total do combo
                    </p>
                    {instCount > 1 ? (
                      <>
                        <p className="text-3xl md:text-4xl font-semibold leading-tight">
                          {instCount}x <span className="tabular-nums">{formatPrice(instVal)}</span>
                          <span className="text-base md:text-lg font-medium text-muted-foreground ml-1">sem juros</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ou {formatPrice(totalPrice)} à vista
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl md:text-4xl font-semibold">{formatPrice(totalPrice)}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={submitting || isCartLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-5 rounded-full bg-[#0f3d2e] text-[#b6e36d] font-semibold text-base hover:bg-[#0a2e22] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting || isCartLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Comprar combo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {error && (
                  <p className="mt-4 text-center text-sm text-destructive">{error}</p>
                )}

                <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                  {["Frete para todo Brasil", "Garantia 12 meses", "Devolução em 7 dias"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#0f3d2e]" />
                      {t}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* DESIGN */}
      <DesignSection fieldImage={fieldImage} />

      {/* SPECS & USO */}
      <SpecsSection />

      {/* SOCIAL PROOF (logos) */}
      <section className="py-14 md:py-20 px-6 md:px-10 bg-[#f8f8f8] border-y border-foreground/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">
            Quem confia na Narvo
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 md:gap-x-20 gap-y-6 opacity-60">
            <img src="/optimized/home/netflix-logo-320.png" alt="Netflix" className="h-6 md:h-8 w-auto" />
            <img src="/optimized/home/amazon-logo-320.png" alt="Amazon" className="h-7 md:h-9 w-auto" />
            <img src="/optimized/home/linkedin-logo-320.png" alt="LinkedIn" className="h-5 md:h-6 w-auto" />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <ReviewsSection handle="n-field" />

      {/* FAQ */}
      <section className="py-20 md:py-28 px-6 md:px-10 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Tire suas dúvidas.</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-foreground/10">
                <AccordionTrigger className="text-left text-base md:text-lg font-medium py-5 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-10 py-20 md:py-28 bg-[#0f3d2e] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
            Pronto para silenciar<br />sua estação de trabalho?
          </h2>
          <p className="mt-5 text-white/70 max-w-md mx-auto">
            Em 2 dias úteis o combo sai do nosso galpão. Em uma semana, sua mesa muda.
          </p>
          <a
            href="#comprar"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#b6e36d] text-[#0f3d2e] font-semibold text-sm hover:bg-[#c8ec88] transition-colors"
          >
            Quero meu setup
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="bg-background py-10 px-6 md:px-10 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Narvo · Engenharia do Silêncio</p>
        <div className="mt-3 flex justify-center gap-5">
          <Link to="/trocas" className="hover:text-foreground transition-colors">Trocas</Link>
          <Link to="/envio" className="hover:text-foreground transition-colors">Envio</Link>
          <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
        </div>
      </footer>

      {/* Sticky mobile bar */}
      {ready && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-foreground/10 px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Combo</p>
            <p className="text-base font-semibold truncate">{formatPrice(totalPrice)}</p>
          </div>
          <button
            onClick={scrollToBuy}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0f3d2e] text-[#b6e36d] font-semibold text-sm"
          >
            Comprar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

interface VariantPickerProps {
  label: string;
  variants: Array<{ node: { id: string; title: string; availableForSale: boolean; selectedOptions: Array<{ name: string; value: string }> } }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function VariantPicker({ label, variants, selectedId, onSelect }: VariantPickerProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const node = v.node;
          const isSelected = node.id === selectedId;
          const colorOption =
            node.selectedOptions.find((o) => /cor|color/i.test(o.name))?.value ?? node.title;
          const hex = getColorHex(colorOption);
          return (
            <button
              key={node.id}
              onClick={() => onSelect(node.id)}
              disabled={!node.availableForSale}
              aria-label={colorOption}
              aria-pressed={isSelected}
              className={`group inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full text-sm border transition-all ${
                isSelected
                  ? "border-[#0f3d2e] bg-background shadow-[0_0_0_1px_#0f3d2e_inset]"
                  : "border-foreground/15 bg-background hover:border-foreground/40"
              } disabled:opacity-40 disabled:line-through`}
            >
              <span
                className={`w-7 h-7 rounded-full border ${
                  isSelected ? "border-[#0f3d2e]" : "border-foreground/20"
                }`}
                style={{
                  backgroundColor: hex ?? "transparent",
                  backgroundImage: hex
                    ? undefined
                    : "linear-gradient(135deg,#e5e5e5 0%,#f5f5f5 50%,#cfcfcf 100%)",
                }}
                aria-hidden
              />
              <span className="font-medium">{colorOption}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
