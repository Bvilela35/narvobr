import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

export default function NossaHistoria() {
  return (
    <>
      <Helmet>
        <title>Nossa História | Narvo</title>
        <meta
          name="description"
          content="Conheça a origem da Narvo — uma obsessão por ordem, materiais sólidos e a Engenharia do Silêncio."
        />
        <link rel="canonical" href="https://narvo.com.br/nossa-historia" />
      </Helmet>

      <section className="pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            {...fade}
            className="text-4xl md:text-5xl font-semibold mb-8 leading-tight"
          >
            Nossa História
          </motion.h1>

          <motion.p
            {...fade}
            className="text-lg text-muted-foreground leading-relaxed mb-10"
          >
            A Narvo nasceu de uma pergunta simples: por que o espaço de trabalho
            — onde passamos a maior parte do dia — ainda é tratado como algo
            secundário?
          </motion.p>

          <motion.div {...fade} className="space-y-8 text-base leading-relaxed text-muted-foreground">
            <p>
              Em 2023, dois engenheiros e um designer industrial se uniram com
              uma convicção: o ambiente físico molda a mente. A desordem no
              escritório não é apenas visual — ela drena foco, energia e
              criatividade.
            </p>
            <p>
              Começamos com um suporte de monitor. Aço carbono 3 mm, pintura
              eletrostática fosca, tolerâncias mínimas. Nada de plástico, nada
              descartável. A resposta do mercado confirmou a tese: profissionais
              sérios queriam ferramentas sérias.
            </p>
            <p>
              Hoje, a Narvo é um ecossistema completo de organização para
              setups de trabalho. Cada peça é projetada como parte de um sistema
              coeso — não como um acessório isolado. Chamamos essa filosofia de
              <strong className="text-foreground"> Engenharia do Silêncio</strong>:
              eliminar o ruído visual para que só reste o essencial.
            </p>
            <p>
              Não vendemos decoração. Vendemos clareza mental.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
