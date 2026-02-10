import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fetchProductByHandle, fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";

export default function Produto() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [related, setRelated] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    if (!handle) return;
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
  }, [handle]);

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

  return (
    <>
      <section className="py-8 md:py-16 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <Link to="/colecao" className="inline-flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity mb-8">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square bg-accent rounded overflow-hidden mb-3">
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
              {imgs.length > 1 && (
                <div className="flex gap-2">
                  {imgs.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                        i === selectedImage ? 'border-foreground' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col"
            >
              <h1 className="text-2xl md:text-3xl font-medium mb-2">{title}</h1>
              <p className="text-lg font-medium mb-6">
                {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || '0').toFixed(2)}
              </p>

              {description && (
                <p className="text-sm opacity-60 leading-relaxed mb-8 max-w-md">{description}</p>
              )}

              {/* Variant selector */}
              {options.length > 0 && options[0].name !== "Title" && (
                <div className="mb-8">
                  {options.map((option) => (
                    <div key={option.name} className="mb-4">
                      <p className="text-xs tracking-widest uppercase opacity-40 mb-2">{option.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {variants.edges.map((v, i) => {
                          const optVal = v.node.selectedOptions.find(o => o.name === option.name)?.value;
                          return (
                            <button
                              key={v.node.id}
                              onClick={() => setSelectedVariantIdx(i)}
                              className={`px-4 py-2 text-sm rounded border transition-all ${
                                i === selectedVariantIdx
                                  ? 'border-foreground bg-foreground text-background'
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
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={isCartLoading || !selectedVariant?.availableForSale}
                className="h-12 rounded text-sm font-medium tracking-wide w-full md:w-auto md:px-16"
              >
                {isCartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar ao carrinho"}
              </Button>

              {!selectedVariant?.availableForSale && (
                <p className="text-sm opacity-40 mt-3">Esgotado</p>
              )}

              {/* Info accordions */}
              <Accordion type="single" collapsible className="mt-12 border-t border-border">
                <AccordionItem value="materials">
                  <AccordionTrigger className="text-sm hover:no-underline">Materiais & Construção</AccordionTrigger>
                  <AccordionContent className="text-sm opacity-60 leading-relaxed">
                    Construído com materiais premium selecionados para durabilidade e estética. Acabamento de precisão industrial.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-sm hover:no-underline">Envio</AccordionTrigger>
                  <AccordionContent className="text-sm opacity-60 leading-relaxed">
                    Transparente. Sem ruído. Envio para todo o Brasil com rastreamento completo.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="warranty">
                  <AccordionTrigger className="text-sm hover:no-underline">Garantia</AccordionTrigger>
                  <AccordionContent className="text-sm opacity-60 leading-relaxed">
                    Construído para durar. Garantia de 1 ano contra defeitos de fabricação.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="returns">
                  <AccordionTrigger className="text-sm hover:no-underline">Trocas e Devoluções</AccordionTrigger>
                  <AccordionContent className="text-sm opacity-60 leading-relaxed">
                    Troca ou devolução em até 30 dias após o recebimento. Sem complicação.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      {related.length > 0 && (
        <section className="py-24 px-6 md:px-10 border-t border-border">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-xs font-medium tracking-[0.3em] uppercase opacity-40 mb-12">Compatível com</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => <ProductCard key={p.node.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
