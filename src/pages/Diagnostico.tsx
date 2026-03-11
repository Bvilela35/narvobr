import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SYMPTOMS = [
  {
    id: 1,
    sintoma: "Minha cabeça não para. Tenho medo de esquecer coisas importantes e me sinto ansioso com a quantidade de pendências.",
    diagnostico: "Você está sofrendo com 'loops abertos' (tarefas inacabadas drenando energia). Seu cérebro é ótimo para ter ideias, mas péssimo para armazená-las.",
    framework: "Método GTD (Getting Things Done) de David Allen.",
    acao: "Use o Cartão GTD. Faça um 'Brain Dump' anotando 100% de tudo o que está na sua cabeça. Depois, defina qual é a 'Próxima Ação' física e visível para cada item.",
  },
  {
    id: 2,
    sintoma: "Trabalho o dia inteiro, vivo ocupado, mas sinto que não fiz nada de realmente importante.",
    diagnostico: "Você está preso na 'Síndrome da Ocupação', reagindo às prioridades dos outros. Quando não escolhemos o que é essencial, alguém escolhe por nós.",
    framework: "Make Time & Essencialismo.",
    acao: "Use o Cartão Make Time ou a Burner List. Defina um único 'Destaque' (Highlight) para o dia: uma tarefa de 60 a 90 minutos que traga urgência, satisfação ou alegria.",
  },
  {
    id: 3,
    sintoma: "Qualquer notificação me tira do foco. Não consigo passar 30 minutos concentrado em uma tarefa difícil.",
    diagnostico: "Sua atenção está fragmentada pelas 'Piscinas do Infinito'. Você tem muito resíduo de atenção por alternar rapidamente entre tarefas.",
    framework: "Trabalho Profundo (Deep Work) de Cal Newport.",
    acao: "Use o Cartão Trabalho Profundo. Agende um bloco de 90 a 120 minutos livre de distrações, preencha o objetivo da sessão e crie barreiras físicas contra interrupções.",
  },
  {
    id: 4,
    sintoma: "Tenho um projeto importante, mas fico enrolando e adiando indefinidamente (procrastinação pura).",
    diagnostico: "O atrito para começar a tarefa está muito alto. Seu cérebro está tentando evitar a dor de curto prazo.",
    framework: "Técnica Pomodoro & Regra dos 2 Minutos.",
    acao: "Use o Cartão Pomodoro Defensivo. Reduza a tarefa até que ela leve 2 minutos e foque apenas em começar. Preencha os inventários de interrupções para não desviar a atenção.",
  },
  {
    id: 5,
    sintoma: "Quero criar novos hábitos (ler, treinar), mas faço por três dias e depois desisto.",
    diagnostico: "Você está focando demais na meta final e esquecendo de construir o sistema e a identidade.",
    framework: "Hábitos Atômicos de James Clear.",
    acao: "Use o Cartão Construtor de Hábitos. Preencha a intenção de implementação e marque um 'X' visual no rastreador todos os dias. Aplique a regra: 'Nunca falhe duas vezes'.",
  },
  {
    id: 6,
    sintoma: "Tento me organizar e planejar o que fazer no meio do trabalho e acabo travando por excesso de análise.",
    diagnostico: "Você está tentando 'pilotar' enquanto o avião já está voando, o que gera paralisia.",
    framework: "Piloto, Avião e Engenheiro de Ali Abdaal.",
    acao: "Use o Cartão Revisão: Piloto, Avião e Engenheiro. Separe 10% do dia para ser Piloto (planejar), 85% para ser Avião (apenas executar) e 5% para ser Engenheiro (manutenção do sistema).",
  },
  {
    id: 7,
    sintoma: "Tudo parece urgente. Fico apagando incêndios o dia todo e não sei o que priorizar.",
    diagnostico: "Você está misturando o que é urgente com o que realmente traz resultados a longo prazo.",
    framework: "Matriz de Eisenhower.",
    acao: "Divida as demandas diárias no papel: Faça o Importante/Urgente, Agende o Importante, Delegue o Urgente sem importância, e Elimine o resto.",
  },
  {
    id: 8,
    sintoma: "Sinto que dependo apenas de força de vontade para produzir e acabo exausto rapidamente.",
    diagnostico: "Você está usando força bruta em vez de diminuir o atrito. Está focando apenas na força produtiva e ignorando as forças que o puxam para trás.",
    framework: "As Leis da Produtividade de Newton.",
    acao: "Antes de tentar trabalhar mais rápido, elimine ativamente os gargalos do seu ambiente (ex: deixe a mesa limpa na noite anterior).",
  },
];

type Screen = "landing" | "quiz" | "result";

export default function Diagnostico() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selected, setSelected] = useState<number | null>(null);

  const result = selected !== null ? SYMPTOMS.find((s) => s.id === selected) : null;

  const reset = () => {
    setSelected(null);
    setScreen("landing");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center"
          >
            <div className="max-w-2xl mx-auto">
              <motion.span
                className="inline-block text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Diagnóstico Narvo
              </motion.span>

              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-foreground"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                Qual é o seu gargalo<br />de produtividade?
              </motion.h1>

              <motion.p
                className="text-sm md:text-base text-muted-foreground mt-5 max-w-lg mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Descubra o framework exato e a ferramenta tátil que você precisa
                para focar no que importa.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-10"
              >
                <Button
                  onClick={() => setScreen("quiz")}
                  className="h-12 px-10 rounded-full text-sm font-medium tracking-wide"
                >
                  Iniciar Diagnóstico <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {screen === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto px-6 py-16 md:py-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10"
            >
              <span className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                Etapa 1 de 1
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-2">
                Selecione o sintoma que mais te representa.
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Pense nas últimas semanas. Qual destas frases descreve melhor o
                que você sente?
              </p>
            </motion.div>

            <div className="space-y-3">
              {SYMPTOMS.map((symptom, i) => (
                <motion.button
                  key={symptom.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  onClick={() => {
                    setSelected(symptom.id);
                    setTimeout(() => setScreen("result"), 400);
                  }}
                  className={`w-full text-left p-5 rounded-lg border transition-all duration-200 group
                    ${
                      selected === symptom.id
                        ? "border-foreground bg-foreground/5"
                        : "border-border bg-card hover:border-foreground/30 hover:bg-accent/50"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-medium text-muted-foreground mt-0.5">
                      {symptom.id}
                    </span>
                    <p className="text-sm md:text-base text-foreground leading-relaxed flex-1">
                      {symptom.sintoma}
                    </p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {screen === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto px-6 py-16 md:py-20"
          >
            <motion.span
              className="inline-block text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Seu Diagnóstico
            </motion.span>

            <motion.h2
              className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-[1.15]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {result.framework}
            </motion.h2>

            <div className="mt-10 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  O que você sente
                </h3>
                <p className="text-sm md:text-base text-foreground/80 leading-relaxed border-l-2 border-foreground/15 pl-5">
                  "{result.sintoma}"
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Diagnóstico
                </h3>
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  {result.diagnostico}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Ação Prática
                </h3>
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  {result.acao}
                </p>
              </motion.div>
            </div>

            <motion.div
              className="mt-12 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={reset}
                variant="outline"
                className="h-12 px-8 rounded-full text-sm font-medium tracking-wide"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Refazer Diagnóstico
              </Button>
              <Button
                asChild
                className="h-12 px-8 rounded-full text-sm font-medium tracking-wide"
              >
                <a href="/colecao">
                  Ver Ferramentas <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
