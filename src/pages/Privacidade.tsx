import { motion } from "framer-motion";

export default function Privacidade() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[700px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-light mb-8">Política de Privacidade</h1>
          <div className="space-y-6 text-sm opacity-70 leading-relaxed">

            <p>Esta Política de Privacidade descreve como a Narvo (o "Site", "nós", "nosso") coleta, usa e divulga suas informações pessoais quando você visita, faz uma compra ou interage com o Site.</p>

            <h2 className="text-lg font-medium opacity-100 pt-4">Informações pessoais que coletamos</h2>
            <p>Quando você visita o Site, coletamos certas informações sobre seu dispositivo, sua interação com o Site e as informações necessárias para processar suas compras. Também podemos coletar informações adicionais se você entrar em contato conosco para obter suporte ao cliente. Nesta Política de Privacidade, nos referimos a qualquer informação sobre um indivíduo identificável (incluindo as informações abaixo) como "Informações Pessoais".</p>

            <h3 className="text-base font-medium opacity-90 pt-2">Informações do dispositivo</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Finalidade da coleta:</strong> para carregar o Site com precisão e para realizar análises sobre o uso e tráfego do Site.</li>
              <li><strong>Fonte da coleta:</strong> coletadas automaticamente quando você acessa nosso Site usando cookies, arquivos de log, web beacons, tags ou pixels.</li>
              <li><strong>Informações coletadas:</strong> versão do navegador web, endereço IP, fuso horário, informações de cookies, quais páginas do Site você visualiza, termos de pesquisa e como você interage com o Site.</li>
            </ul>

            <h3 className="text-base font-medium opacity-90 pt-2">Informações do pedido</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Finalidade da coleta:</strong> para fornecer produtos ou serviços a você para cumprir nosso contrato, processar suas informações de pagamento, providenciar o envio e fornecer faturas e/ou confirmações de pedido, comunicar-se com você, rastrear nossos pedidos quanto a possíveis riscos ou fraudes e, quando estiver de acordo com as preferências que você compartilhou conosco, fornecer informações ou publicidade relacionadas aos nossos produtos ou serviços.</li>
              <li><strong>Fonte da coleta:</strong> coletadas de você.</li>
              <li><strong>Informações coletadas:</strong> nome, endereço de cobrança, endereço de envio, informações de pagamento (incluindo números de cartão de crédito, endereço de e-mail e número de telefone).</li>
            </ul>

            <h2 className="text-lg font-medium opacity-100 pt-4">Compartilhamento de informações pessoais</h2>
            <p>Compartilhamos suas Informações Pessoais com provedores de serviços para nos ajudar a fornecer nossos serviços e cumprir nossos contratos com você, conforme descrito acima. Por exemplo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Usamos a Shopify para dar suporte à nossa loja online. Você pode ler mais sobre como a Shopify usa suas Informações Pessoais aqui: <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">https://www.shopify.com/legal/privacy</a>.</li>
              <li>Podemos compartilhar suas Informações Pessoais para cumprir leis e regulamentos aplicáveis, para responder a uma intimação, mandado de busca ou outra solicitação legal de informações que recebermos, ou para proteger nossos direitos de outra forma.</li>
            </ul>

            <h2 className="text-lg font-medium opacity-100 pt-4">Publicidade comportamental</h2>
            <p>Conforme descrito acima, usamos suas Informações Pessoais para fornecer anúncios direcionados ou comunicações de marketing que acreditamos ser de seu interesse. Para mais informações sobre como a publicidade direcionada funciona, você pode visitar a página educativa da Network Advertising Initiative (NAI) em <a href="http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work</a>.</p>
            <p>Você pode desativar a publicidade direcionada usando os links abaixo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Facebook: <a href="https://www.facebook.com/settings/?tab=ads" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">https://www.facebook.com/settings/?tab=ads</a></li>
              <li>Google: <a href="https://www.google.com/settings/ads/anonymous" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">https://www.google.com/settings/ads/anonymous</a></li>
            </ul>

            <h2 className="text-lg font-medium opacity-100 pt-4">Seus direitos</h2>
            <p>Se você é residente no Brasil, de acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de acessar as informações pessoais que mantemos sobre você e de solicitar que suas informações pessoais sejam corrigidas, atualizadas ou excluídas. Se você deseja exercer este direito, entre em contato conosco através das informações de contato abaixo.</p>
            <p>Além disso, se você é residente no Brasil, observe que estamos processando suas informações para cumprir contratos que possamos ter com você (por exemplo, se você fizer um pedido através do Site), ou para buscar nossos interesses comerciais legítimos listados acima. Além disso, observe que suas informações podem ser transferidas para fora do Brasil.</p>

            <h2 className="text-lg font-medium opacity-100 pt-4">Cookies</h2>
            <p>Um cookie é uma pequena quantidade de informação que é colocada no disco rígido do seu computador. São usados para funcionalidade do Site (carrinho de compras, preferências) e para fins analíticos. Você pode desabilitar cookies a qualquer momento nas configurações do seu navegador.</p>

            <h2 className="text-lg font-medium opacity-100 pt-4">Menores de idade</h2>
            <p>O Site não se destina a indivíduos menores de 18 anos.</p>

            <h2 className="text-lg font-medium opacity-100 pt-4">Alterações</h2>
            <p>Podemos atualizar esta política de privacidade periodicamente para refletir, por exemplo, alterações em nossas práticas ou por outros motivos operacionais, legais ou regulatórios.</p>

            <h2 className="text-lg font-medium opacity-100 pt-4">Contato</h2>
            <p>Para mais informações sobre nossas práticas de privacidade, se você tiver dúvidas ou se deseja fazer uma reclamação, entre em contato conosco por e-mail em <strong>contato@narvo.com.br</strong> ou pelo nosso formulário de suporte.</p>

            <p className="opacity-50 italic pt-4">Última atualização: Março de 2026</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
