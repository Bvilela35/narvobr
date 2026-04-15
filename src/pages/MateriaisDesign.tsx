import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const materials = [
  {
    name: "Aço Carbono",
    detail: "Chapas de 3 mm com pintura eletrostática fosca. Resistência estrutural sem peso visual.",
  },
  {
    name: "Polímero de Alta Densidade",
    detail: "Superfícies táteis e atemporais. Resistente a riscos, manchas e desgaste diário.",
  },
  {
    name: "Feltro Industrial",
    detail: "Lã prensada de alta densidade. Absorve impacto, silencia objetos e protege superfícies.",
  },
  {
    name: "Alumínio Anodizado",
    detail: "Leveza estrutural com acabamento cirúrgico. Resistente à corrosão e ao tempo.",
  },
];

export default function MateriaisDesign() {
  return (
    <>
      <Helmet>
        <title>Materiais & Design | Narvo</title>
        <meta
          name="description"
          content="Aço, polímero, feltro. Conheça os materiais e o processo de design por trás de cada peça Narvo."
        />
        <link rel="canonical" href="https://narvobr.lovable.app/materiais" />
      </Helmet>

      <section className="pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            {...fade}
            className="text-4xl md:text-5xl font-semibold mb-8 leading-tight"
          >
            Materiais & Design
          </motion.h1>

          <motion.p
            {...fade}
            className="text-lg text-muted-foreground leading-relaxed mb-14"
          >
            Cada material é selecionado por função, durabilidade e coerência
            com o ecossistema. Nada é decorativo — tudo tem propósito.
          </motion.p>

          <div className="space-y-10">
            {materials.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border-t border-border pt-8"
              >
                <h2 className="text-xl font-medium mb-2">{m.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                  {m.detail}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fade} className="mt-16 text-base text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Processo</h2>
            <p>
              O design Narvo segue um princípio: a forma serve a função. Antes
              de definir a estética, mapeamos o problema — cabos soltos, objetos
              sem lugar, superfícies desperdiçadas. Só então projetamos a
              solução com tolerâncias mínimas e acabamento fosco industrial.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
