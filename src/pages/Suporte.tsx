import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "Qual o prazo de entrega?", a: "O prazo varia de 5 a 15 dias úteis, dependendo da sua localização. Após o envio, você recebe o rastreamento completo." },
  { q: "Como funciona a garantia?", a: "Construído para durar. Todas as peças têm garantia de 1 ano contra defeitos de fabricação." },
  { q: "Posso trocar ou devolver?", a: "Sim. Troca ou devolução em até 30 dias após o recebimento, sem complicação." },
  { q: "Vocês enviam para todo o Brasil?", a: "Sim. Envio para todas as regiões com rastreamento completo. Transparente. Sem ruído." },
  { q: "As peças são compatíveis entre si?", a: "Sim. O sistema Narvo foi projetado como um conjunto coeso. Todas as peças se complementam." },
];

export default function Suporte() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-light mb-3">Suporte</h1>
          <p className="text-sm opacity-50">Perguntas frequentes e contato.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* FAQ */}
          <div>
            <h2 className="text-xs font-medium tracking-[0.3em] uppercase opacity-40 mb-8">FAQ</h2>
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm opacity-60 leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xs font-medium tracking-[0.3em] uppercase opacity-40 mb-8">Contato</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Nome"
                className="w-full bg-transparent border border-border rounded px-4 py-3 text-sm placeholder:opacity-40 focus:outline-none focus:border-foreground/30 transition-colors"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent border border-border rounded px-4 py-3 text-sm placeholder:opacity-40 focus:outline-none focus:border-foreground/30 transition-colors"
              />
              <textarea
                placeholder="Mensagem"
                rows={5}
                className="w-full bg-transparent border border-border rounded px-4 py-3 text-sm placeholder:opacity-40 focus:outline-none focus:border-foreground/30 transition-colors resize-none"
              />
              <Button type="submit" className="h-12 px-8 rounded text-sm font-medium tracking-wide">
                Enviar
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
