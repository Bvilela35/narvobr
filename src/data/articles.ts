import blogRituaisFoco from "@/assets/blog-rituais-foco.jpg";
import blogPerformanceSilenciosa from "@/assets/blog-performance-silenciosa.jpg";
import blogSetupIntencional from "@/assets/blog-setup-intencional.jpg";

export interface Article {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  author: {
    name: string;
    role: string;
  };
  content: string;
}

export const articles: Article[] = [
  {
    slug: "rituais-de-foco",
    tag: "Foco",
    title: "Rituais de foco: como criar um ambiente que trabalha por você",
    excerpt:
      "O ambiente certo elimina decisões desnecessárias. Descubra como pequenos ajustes no seu setup podem multiplicar sua capacidade de concentração.",
    date: "2026-02-10",
    readTime: "5 min",
    image: blogRituaisFoco,
    featured: true,
    author: {
      name: "Narvo",
      role: "Engenharia do Silêncio",
    },
    content: `O ambiente certo elimina decisões desnecessárias. Quando cada objeto no seu setup tem um propósito claro, a sua mente para de gastar energia organizando o caos e começa a investir em criação.

## O poder do ambiente sobre a mente

Estudos em neurociência cognitiva demonstram que o cérebro humano dedica uma parcela significativa de sua capacidade de processamento à filtragem de estímulos visuais. Cada objeto fora do lugar, cada cabo à vista, cada distração periférica consome recursos que poderiam estar direcionados ao trabalho que importa.

A Engenharia do Silêncio parte de um princípio simples: **subtraia antes de adicionar.** Não se trata de ter mais ferramentas — se trata de ter apenas as certas, posicionadas com intenção.

## O ritual de 5 minutos

Antes de iniciar qualquer sessão de trabalho profundo, dedique cinco minutos a preparar o ambiente:

1. **Limpe a superfície.** Remova tudo que não será utilizado na próxima hora.
2. **Posicione suas ferramentas.** Monitor na altura dos olhos, teclado alinhado, mouse ao alcance natural.
3. **Elimine o ruído visual.** Cabos organizados, nada empilhado, nenhuma notificação visível.
4. **Defina a intenção.** Uma frase sobre o que será produzido nesta sessão.

Este ritual pode parecer simples demais para funcionar. Mas é justamente a simplicidade que o torna poderoso. Rituais complexos criam atrito; rituais simples criam consistência.

## O setup como ferramenta de performance

Atletas de alto rendimento não escolhem seus equipamentos por estética — escolhem pela funcionalidade que cada item oferece ao seu desempenho. O mesmo princípio se aplica ao trabalho intelectual.

Um suporte de monitor não é decoração. É uma ferramenta ergonômica que alinha a linha de visão, reduz tensão cervical e cria espaço útil sob o display. Um deskpad não é um acessório — é uma superfície tátil que define a zona de trabalho e silencia o impacto do teclado.

**Cada elemento do seu setup deve responder a uma pergunta: "Isso me ajuda a produzir melhor?"**

Se a resposta for não, o objeto está ocupando espaço — físico e mental.

## Consistência é o diferencial

O ritual de foco não funciona uma vez. Funciona quando se torna automático. Quando o ato de sentar à mesa já ativa o modo de trabalho profundo, porque o ambiente foi projetado para isso.

Invista no seu espaço como investe em qualquer outra ferramenta de trabalho. O retorno é silencioso, mas profundo.`,
  },
  {
    slug: "performance-silenciosa",
    tag: "Performance",
    title: "Performance silenciosa: o poder de reduzir estímulos",
    excerpt:
      "Menos notificações, menos objetos, menos ruído. A performance real nasce da subtração — não da adição.",
    date: "2026-02-04",
    readTime: "4 min",
    image: blogPerformanceSilenciosa,
    featured: false,
    author: {
      name: "Narvo",
      role: "Engenharia do Silêncio",
    },
    content: `A cultura contemporânea celebra a adição. Mais apps, mais gadgets, mais telas, mais inputs. Mas os profissionais que consistentemente entregam trabalho excepcional operam na direção oposta: eles subtraem.

## O custo invisível do excesso

Cada notificação que pisca no canto da tela interrompe um ciclo de pensamento que levou minutos para ser construído. Pesquisas da Universidade da Califórnia indicam que, após uma interrupção, o cérebro leva em média 23 minutos para retomar o nível anterior de concentração.

Multiplique isso pelo número de interrupções diárias e o resultado é alarmante: horas inteiras de capacidade cognitiva desperdiçadas — não por falta de talento, mas por excesso de ruído.

## A subtração como método

Performance silenciosa é a prática deliberada de remover estímulos até que reste apenas o essencial:

- **Ambiente visual:** superfícies limpas, cores neutras, iluminação controlada.
- **Ambiente sonoro:** silêncio ou som ambiente constante, sem variações que capturem a atenção.
- **Ambiente digital:** notificações desativadas, apps de distração removidos da tela principal.
- **Ambiente físico:** apenas as ferramentas necessárias para a tarefa atual.

## O paradoxo da produtividade

Quem busca produtividade através da adição de ferramentas e sistemas está, paradoxalmente, criando mais trabalho. Cada novo app precisa ser configurado, aprendido e mantido. Cada novo objeto precisa ser limpo, organizado e decidido.

A verdadeira produtividade nasce quando o sistema é tão simples que desaparece. Quando você não precisa pensar no processo — apenas executar.

## Construa para o silêncio

Seu setup deve ser projetado para desaparecer. Os melhores ambientes de trabalho não chamam atenção para si mesmos. Eles criam as condições para que toda a atenção flua para o trabalho.

Isso é performance silenciosa. Não é sobre fazer mais — é sobre remover tudo que impede de fazer o que importa.`,
  },
  {
    slug: "setup-intencional",
    tag: "Sistema",
    title: "O setup intencional: cada objeto tem um propósito",
    excerpt:
      "Um setup bem projetado não é sobre ter mais — é sobre ter apenas o que importa, posicionado com intenção.",
    date: "2026-01-28",
    readTime: "6 min",
    image: blogSetupIntencional,
    featured: false,
    author: {
      name: "Narvo",
      role: "Engenharia do Silêncio",
    },
    content: `O conceito de setup intencional parte de uma pergunta que poucos fazem: "Por que este objeto está aqui?" Se não há uma resposta clara, o objeto não deveria estar ali.

## Intenção versus acúmulo

A maioria dos setups de trabalho são construídos por acúmulo. Um gadget adquirido por impulso aqui, um acessório que "pode ser útil" ali. Com o tempo, a mesa se torna um depósito de decisões não tomadas.

O setup intencional inverte essa lógica. Cada elemento é escolhido, posicionado e mantido com um propósito definido. Não existe espaço para o "talvez" — apenas para o "com certeza".

## Os três princípios do setup intencional

### 1. Funcionalidade primeiro

Cada objeto deve resolver um problema real. Um suporte de monitor eleva a tela à altura ergonômica correta. Um organizador de cabos elimina ruído visual. Um deskpad define a zona de trabalho e protege a superfície.

Se um objeto não resolve um problema, ele está criando um. Mesmo que seja apenas o problema de ocupar espaço visual e demandar uma micro-decisão sobre onde posicioná-lo.

### 2. Materialidade importa

Os materiais com os quais você interage diariamente afetam sua experiência de trabalho de formas sutis mas significativas. A frieza do aço transmite solidez. A textura do feltro absorve impacto. O peso adequado comunica qualidade.

Materiais de qualidade não são luxo — são investimento em durabilidade e na experiência tátil diária. Plástico frágil comunica descartabilidade. Aço carbono comunica permanência.

### 3. Posicionamento com propósito

Não basta ter os objetos certos — eles precisam estar nos lugares certos. A distância do monitor, o ângulo do teclado, a posição do mouse. Cada centímetro importa quando se trata de ergonomia e fluxo de trabalho.

O posicionamento ideal é aquele em que cada ferramenta está ao alcance natural, sem que você precise pensar para encontrá-la. Quando o corpo sabe exatamente onde cada coisa está, a mente fica livre para criar.

## O setup como extensão da mente

Um setup intencional não é uma mesa bonita — é um sistema operacional físico. É a infraestrutura que suporta seu trabalho mais importante.

Assim como um cirurgião organiza seus instrumentos antes de operar, o profissional do conhecimento deve organizar seu ambiente antes de criar. A ordem externa produz clareza interna.

Invista tempo projetando seu setup. Os retornos são diários, cumulativos e silenciosos.`,
  },
];

export function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
