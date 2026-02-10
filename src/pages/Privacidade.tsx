import { motion } from "framer-motion";

export default function Privacidade() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[700px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-light mb-8">Privacidade</h1>
          <div className="space-y-4 text-sm opacity-60 leading-relaxed">
            <p>A Narvo respeita sua privacidade. Coletamos apenas os dados necessários para processar seus pedidos: nome, email, endereço de entrega e informações de pagamento.</p>
            <p>Seus dados nunca são vendidos ou compartilhados com terceiros para fins de marketing. Utilizamos criptografia padrão para proteger todas as transações.</p>
            <p>Cookies são usados exclusivamente para funcionalidade do site (carrinho de compras e preferências). Você pode desabilitá-los a qualquer momento nas configurações do navegador.</p>
            <p>Para solicitar a exclusão de seus dados, entre em contato pelo nosso formulário de suporte.</p>
            <p className="opacity-60 italic">Transparente. Sem ruído.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
