import { motion } from "framer-motion";

export default function Envio() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[700px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-light mb-8">Envio</h1>
          <div className="space-y-4 text-sm opacity-60 leading-relaxed">
            <p>Enviamos para todo o Brasil com rastreamento completo. Os prazos variam de acordo com a região:</p>
            <ul className="list-none space-y-2 pl-0">
              <li>Sudeste: 5–7 dias úteis</li>
              <li>Sul e Centro-Oeste: 7–10 dias úteis</li>
              <li>Norte e Nordeste: 10–15 dias úteis</li>
            </ul>
            <p>Após a confirmação do pagamento, o pedido é preparado em até 2 dias úteis. Você receberá o código de rastreamento por email.</p>
            <p className="opacity-60 italic">Transparente. Sem ruído.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
