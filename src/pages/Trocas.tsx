import { motion } from "framer-motion";

export default function Trocas() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[700px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-light mb-8">Trocas e Devoluções</h1>
          <div className="prose-sm space-y-4 text-sm opacity-60 leading-relaxed">
            <p>Aceitamos trocas e devoluções em até 30 dias corridos após o recebimento do produto, desde que esteja em sua embalagem original e sem sinais de uso.</p>
            <p>Para solicitar uma troca ou devolução, entre em contato pelo nosso formulário de suporte informando o número do pedido e o motivo.</p>
            <p>Após a aprovação, enviaremos as instruções de envio. O reembolso será processado em até 10 dias úteis após o recebimento do produto devolvido.</p>
            <p className="opacity-60 italic">Transparente. Sem ruído.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
