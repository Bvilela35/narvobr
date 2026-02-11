import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fetchProductByHandle, fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";

export default function ProdutoEssss() {
  const handle = "essss";
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [related, setRelated] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    setLoading(true);
    setSelectedImage(0);
    setSelectedVariantIdx(0);
    Promise.all([
      fetchProductByHandle(handle),
      fetchProducts(4),
    ]).then(([prod, prods]) => {
      setProduct(prod);
      setRelated(prods.filter(p => p.node.handle !== handle).slice(0, 4));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin opacity-30" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm opacity-40">Produto não encontrado.</p>
      </div>
    );
  }

  const { title, description, images, variants, options } = product.node;
  const imgs = images.edges;
  const selectedVariant = variants.edges[selectedVariantIdx]?.node;
  const totalImages = imgs.length;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Adicionado ao carrinho", { position: "top-center" });
  };

  const prevImage = () => setSelectedImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  const nextImage = () => setSelectedImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));

  return (
    <>
      <section className="py-8 md:py-12 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-[3fr_2fr] gap-8 md:gap-12 items-start">
          {/* Image — Apple-style 16:9 block */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative bg-card-elevated rounded-2xl overflow-hidden"
          >
            <div className="w-full aspect-video">
              {imgs[selectedImage] ? (
                <img
                  src={imgs[selectedImage].node.url}
                  alt={imgs[selectedImage].node.altText || title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20 text-xs">Sem imagem</div>
              )}
            </div>

            {totalImages > 1 && (
              <div className="absolute bottom-6 left-8 flex items-center gap-4">
                <button
                  onClick={prevImage}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-foreground/40 transition-colors bg-background/50 backdrop-blur-sm"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm tabular-nums opacity-60">
                  {selectedImage + 1} / {totalImages}
                </span>
                <button
                  onClick={nextImage}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-foreground/40 transition-colors bg-background/50 backdrop-blur-sm"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Details — 1/3 of layout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col justify-center px-8 md:px-12 py-12 md:py-16"
          >
            <Link to="/colecao" className="inline-flex items-center gap-2 text-sm opacity-40 hover:opacity-100 transition-opacity mb-10">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>

            <h1 className="text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight mb-4">
              {title}
            </h1>

            <p className="text-2xl font-semibold mb-2">
              R$ {parseFloat(selectedVariant?.price.amount || '0').toFixed(2).replace('.', ',')}
            </p>

            {description && (
              <>
                <div className="border-t border-border my-6" />
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </>
            )}

            {/* Variant selectors */}
            {options.length > 0 && options[0].name !== "Title" && (
              <>
                <div className="border-t border-border my-6" />
                {options.map((option) => (
                  <div key={option.name} className="mb-6">
                    <p className="text-base font-semibold mb-3">{option.name}</p>
                    <div className="flex flex-wrap gap-3">
                      {variants.edges.map((v, i) => {
                        const optVal = v.node.selectedOptions.find(o => o.name === option.name)?.value;
                        const isSelected = i === selectedVariantIdx;
                        return (
                          <button
                            key={v.node.id}
                            onClick={() => setSelectedVariantIdx(i)}
                            className={`px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all min-w-[80px] text-center ${
                              isSelected
                                ? 'border-foreground'
                                : 'border-border hover:border-foreground/30'
                            } ${!v.node.availableForSale ? 'opacity-30 line-through cursor-not-allowed' : ''}`}
                            disabled={!v.node.availableForSale}
                          >
                            {optVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="border-t border-border my-6" />

            <Button
              onClick={handleAddToCart}
              disabled={isCartLoading || !selectedVariant?.availableForSale}
              className="h-14 rounded-lg text-base font-semibold tracking-wide w-full"
            >
              {isCartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar ao carrinho"}
            </Button>

            {!selectedVariant?.availableForSale && (
              <p className="text-sm opacity-40 mt-3">Esgotado</p>
            )}

            <Accordion type="single" collapsible className="mt-10 border-t border-border">
              <AccordionItem value="materials">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">Materiais & Construção</AccordionTrigger>
                <AccordionContent className="text-sm opacity-60 leading-relaxed">
                  Construído com materiais premium selecionados para durabilidade e estética. Acabamento de precisão industrial.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">Envio</AccordionTrigger>
                <AccordionContent className="text-sm opacity-60 leading-relaxed">
                  Transparente. Sem ruído. Envio para todo o Brasil com rastreamento completo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="warranty">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">Garantia</AccordionTrigger>
                <AccordionContent className="text-sm opacity-60 leading-relaxed">
                  Construído para durar. Garantia de 1 ano contra defeitos de fabricação.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">Trocas e Devoluções</AccordionTrigger>
                <AccordionContent className="text-sm opacity-60 leading-relaxed">
                  Troca ou devolução em até 30 dias após o recebimento. Sem complicação.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Cross-sell */}
      {related.length > 0 && (
        <section className="py-24 px-6 md:px-10 border-t border-border">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-xs font-semibold tracking-[0.3em] uppercase opacity-40 mb-12">Compatível com</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => <ProductCard key={p.node.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
