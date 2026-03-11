import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PILLS = [
  {
    id: 1,
    label: "Mente cheia",
    sintoma: "Minha cabeça não para. Tenho medo de esquecer coisas importantes e me sinto ansioso com a quantidade de pendências.",
    diagnostico: "Você está sofrendo com 'loops abertos' (tarefas inacabadas drenando energia). Seu cérebro é ótimo para ter ideias, mas péssimo para armazená-las.",
    framework: "Método GTD (Getting Things Done)",
    autor: "David Allen",
    acao: "Use o Cartão GTD. Faça um 'Brain Dump' anotando 100% de tudo o que está na sua cabeça. Depois, defina qual é a 'Próxima Ação' física e visível para cada item.",
  },
  {
    id: 2,
    label: "Ocupado, não produtivo",
    sintoma: "Trabalho o dia inteiro, vivo ocupado, mas sinto que não fiz nada de realmente importante.",
    diagnostico: "Você está preso na 'Síndrome da Ocupação', reagindo às prioridades dos outros. Quando não escolhemos o que é essencial, alguém escolhe por nós.",
    framework: "Make Time & Essencialismo",
    autor: "",
    acao: "Use o Cartão Make Time ou a Burner List. Defina um único 'Destaque' (Highlight) para o dia: uma tarefa de 60 a 90 minutos que traga urgência, satisfação ou alegria.",
  },
  {
    id: 3,
    label: "Zero foco",
    sintoma: "Qualquer notificação me tira do foco. Não consigo passar 30 minutos concentrado em uma tarefa difícil.",
    diagnostico: "Sua atenção está fragmentada pelas 'Piscinas do Infinito'. Você tem muito resíduo de atenção por alternar rapidamente entre tarefas.",
    framework: "Trabalho Profundo (Deep Work)",
    autor: "Cal Newport",
    acao: "Use o Cartão Trabalho Profundo. Agende um bloco de 90 a 120 minutos livre de distrações, preencha o objetivo da sessão e crie barreiras físicas contra interrupções.",
  },
  {
    id: 4,
    label: "Procrastinação",
    sintoma: "Tenho um projeto importante, mas fico enrolando e adiando indefinidamente.",
    diagnostico: "O atrito para começar a tarefa está muito alto. Seu cérebro está tentando evitar a dor de curto prazo.",
    framework: "Pomodoro & Regra dos 2 Min",
    autor: "",
    acao: "Use o Cartão Pomodoro Defensivo. Reduza a tarefa até que ela leve 2 minutos e foque apenas em começar. Preencha os inventários de interrupções para não desviar a atenção.",
  },
  {
    id: 5,
    label: "Hábitos que não colam",
    sintoma: "Quero criar novos hábitos (ler, treinar), mas faço por três dias e depois desisto.",
    diagnostico: "Você está focando demais na meta final e esquecendo de construir o sistema e a identidade.",
    framework: "Hábitos Atômicos",
    autor: "James Clear",
    acao: "Use o Cartão Construtor de Hábitos. Preencha a intenção de implementação e marque um 'X' visual no rastreador todos os dias. Aplique a regra: 'Nunca falhe duas vezes'.",
  },
  {
    id: 6,
    label: "Paralisia por análise",
    sintoma: "Tento me organizar e planejar o que fazer no meio do trabalho e acabo travando por excesso de análise.",
    diagnostico: "Você está tentando 'pilotar' enquanto o avião já está voando, o que gera paralisia.",
    framework: "Piloto, Avião e Engenheiro",
    autor: "Ali Abdaal",
    acao: "Use o Cartão Revisão: Piloto, Avião e Engenheiro. Separe 10% do dia para ser Piloto (planejar), 85% para ser Avião (apenas executar) e 5% para ser Engenheiro (manutenção do sistema).",
  },
  {
    id: 7,
    label: "Tudo é urgente",
    sintoma: "Tudo parece urgente. Fico apagando incêndios o dia todo e não sei o que priorizar.",
    diagnostico: "Você está misturando o que é urgente com o que realmente traz resultados a longo prazo.",
    framework: "Matriz de Eisenhower",
    autor: "",
    acao: "Divida as demandas diárias no papel: Faça o Importante/Urgente, Agende o Importante, Delegue o Urgente sem importância, e Elimine o resto.",
  },
  {
    id: 8,
    label: "Esgotamento rápido",
    sintoma: "Sinto que dependo apenas de força de vontade para produzir e acabo exausto rapidamente.",
    diagnostico: "Você está usando força bruta em vez de diminuir o atrito. Está focando apenas na força produtiva e ignorando as forças que o puxam para trás.",
    framework: "Leis de Newton da Produtividade",
    autor: "",
    acao: "Antes de tentar trabalhar mais rápido, elimine ativamente os gargalos do seu ambiente (ex: deixe a mesa limpa na noite anterior).",
  },
];

export default function Diagnostico() {
  const [selected, setSelected] = useState<number | null>(null);
  const result = selected !== null ? PILLS.find((p) => p.id === selected) : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="pills"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-6xl mx-auto px-5 py-14 md:py-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-center mb-12 md:mb-16"
            >
              <span className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
                Diagnóstico Narvo
              </span>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-3 leading-[1.1]">
                Qual desses é o seu<br className="hidden md:block" /> gargalo agora?
              </h1>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {PILLS.map((pill, i) => (
                <motion.button
                  key={pill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  onClick={() => setSelected(pill.id)}
                  className="group relative flex flex-col justify-between bg-card border border-border rounded-2xl p-5 md:p-6 text-left transition-all duration-200 hover:border-foreground/30 hover:shadow-md aspect-[3/4] cursor-pointer"
                >
                  <div>
                    <span className="inline-block text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">
                      Pílula {pill.id}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mt-3 leading-tight">
                      {pill.label}
                    </h3>
                  </div>

                  <div className="mt-auto pt-4">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {pill.sintoma}
                    </p>
                    <div className="flex items-center gap-1 mt-4 text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver prescrição <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl mx-auto px-6 py-14 md:py-20"
          >
            <motion.span
              className="inline-block text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Sua Prescrição
            </motion.span>

            <motion.h2
              className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-[1.15]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {result.framework}
            </motion.h2>
            {result.autor && (
              <motion.p
                className="text-sm text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                por {result.autor}
              </motion.p>
            )}

            <div className="mt-10 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
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
                transition={{ delay: 0.35 }}
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
                transition={{ delay: 0.45 }}
                className="bg-card border border-border rounded-xl p-6"
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
              transition={{ delay: 0.55 }}
            >
              <Button
                onClick={() => setSelected(null)}
                variant="outline"
                className="h-12 px-8 rounded-full text-sm font-medium tracking-wide"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Voltar às Pílulas
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
