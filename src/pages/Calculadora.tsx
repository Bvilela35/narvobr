import { useState, useMemo, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { calcFocus, getCollectionByScore, type FocusInputs } from "@/lib/focusCalculator";
import { ArrowRight, RotateCcw, Download } from "lucide-react";

const DEFAULTS: FocusInputs = {
  rendaMensal: 1500,
  horasDia: 9,
  pctBaixoValor: 30,
  interrupcoes: 5,
};

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function ScoreIndicator({ score, label }: { score: number; label: string }) {
  const color =
    score < 4 ? "bg-red-500" :
    score <= 6 ? "bg-amber-500" :
    score <= 8 ? "bg-emerald-500" :
    "bg-emerald-400";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Score de Foco</div>
      <div className="flex items-center gap-3">
        <span className="text-4xl md:text-5xl font-black text-foreground">{score}</span>
        <span className="text-lg text-muted-foreground">/10</span>
      </div>
      <span className={`${color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>{label}</span>
    </div>
  );
}

function BreakdownBar({ label, hours, total, color }: { label: string; hours: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((hours / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{hours.toFixed(1)}h ({pct}%)</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function AnimatedCurrency({ value }: { value: number }) {
  return (
    <motion.span
      key={Math.round(value)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-5xl md:text-7xl font-black text-foreground tracking-tight"
    >
      {formatCurrency(value)}
    </motion.span>
  );
}

export default function Calculadora() {
  const [inputs, setInputs] = useState<FocusInputs>(DEFAULTS);
  const [showResults, setShowResults] = useState(false);
  const [customRenda, setCustomRenda] = useState(false);
  const [customRendaValue, setCustomRendaValue] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => calcFocus(inputs), [inputs]);

  const update = useCallback(<K extends keyof FocusInputs>(key: K, val: FocusInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#1a1a1a", scale: 2 });
      const link = document.createElement("a");
      link.download = "meu-foco-narvo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Error generating share card:", e);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setShowResults(false);
  };

  const focoPct = result.horasFocoProfundo > 0 ? Math.round((result.horasFocoProfundo / inputs.horasDia) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>Calculadora de Foco | Narvo</title>
        <meta name="description" content="Descubra quantas horas de produtividade você perde por dia e o impacto financeiro da distração no seu trabalho." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Quanto foco você realmente tem?
            </motion.h1>
            <motion.p
              className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              Descubra quantas horas de produtividade você perde por dia — e o impacto real disso no seu resultado.
            </motion.p>
          </div>
        </section>

        {/* Main content — side by side on desktop */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
            {/* Left — Sliders */}
            <motion.div
              className="md:w-1/2 md:sticky md:top-32 md:self-start space-y-8 rounded-2xl p-6 md:p-10"
              style={{ backgroundColor: "#f8f8f8" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {/* Renda */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-semibold text-foreground">Renda mensal</label>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(inputs.rendaMensal)}</span>
                </div>
                {!customRenda ? (
                  <>
                    <Slider
                      value={[Math.min(inputs.rendaMensal, 20000)]}
                      onValueChange={([v]) => update("rendaMensal", v)}
                      min={1500} max={20000} step={500}
                      className="[&_[role=slider]]:bg-foreground [&_[role=slider]]:border-foreground [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:bg-foreground"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 1.500</span>
                      <button
                        onClick={() => { setCustomRenda(true); setCustomRendaValue(String(inputs.rendaMensal)); }}
                        className="text-foreground font-semibold underline underline-offset-2"
                      >
                        +R$ 20.000
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customRendaValue}
                      onChange={(e) => {
                        setCustomRendaValue(e.target.value);
                        const v = Number(e.target.value);
                        if (v >= 1500) update("rendaMensal", v);
                      }}
                      placeholder="Ex: 35000"
                      min={1500}
                      className="flex-1 bg-secondary text-foreground rounded-lg px-4 py-2.5 text-sm font-medium border border-border focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                    <button
                      onClick={() => {
                        setCustomRenda(false);
                        if (inputs.rendaMensal > 20000) update("rendaMensal", 20000);
                      }}
                      className="px-3 py-2.5 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
                    >
                      Slider
                    </button>
                  </div>
                )}
              </div>

              {/* Horas */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-semibold text-foreground">Horas de trabalho / dia</label>
                  <span className="text-sm font-bold text-foreground">{inputs.horasDia}h</span>
                </div>
                <Slider
                  value={[inputs.horasDia]}
                  onValueChange={([v]) => update("horasDia", v)}
                  min={4} max={14} step={1}
                  className="[&_[role=slider]]:bg-foreground [&_[role=slider]]:border-foreground [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:bg-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>4h</span><span>14h</span>
                </div>
              </div>


              {/* Interrupções */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-semibold text-foreground">Interrupções por dia</label>
                  <span className="text-sm font-bold text-foreground">{inputs.interrupcoes}</span>
                </div>
                <Slider
                  value={[inputs.interrupcoes]}
                  onValueChange={([v]) => update("interrupcoes", v)}
                  min={0} max={30} step={1}
                  className="[&_[role=slider]]:bg-foreground [&_[role=slider]]:border-foreground [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:bg-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span><span>30</span>
                </div>
              </div>

              {/* CTA calcular */}
              <button
                onClick={() => setShowResults(true)}
                className="w-full py-4 bg-foreground text-background font-bold text-base rounded-xl hover:opacity-90 transition-opacity"
              >
                Calcular meu foco
              </button>
            </motion.div>

            {/* Right — Results */}
            <div className="md:w-1/2">
              <AnimatePresence>
                {showResults ? (
                  <motion.div
                    className="space-y-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.5 }}
                  >
                {/* Horas perdidas — destaque principal */}
                <div className="text-center space-y-2 py-8">
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                    Você perde por dia
                  </p>
                  <motion.span
                    key={result.horasPerdidasDia.toFixed(1)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="block text-5xl md:text-7xl font-black text-foreground tracking-tight"
                  >
                    {result.horasPerdidasDia.toFixed(1)}h
                  </motion.span>
                  <p className="text-sm text-muted-foreground mt-2">de produtividade real</p>
                  <p className="text-xs text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
                    Cada interrupção consome em média <span className="font-bold text-foreground">23 minutos</span> para retomar o foco profundo. Com {inputs.interrupcoes} interrupções por dia, são <span className="font-bold text-foreground">{Math.round(inputs.interrupcoes * 23)} minutos</span> perdidos antes mesmo de começar a produzir de verdade.
                  </p>
                </div>

                {/* Métricas de produtividade */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card rounded-2xl p-5 text-center space-y-1">
                    <p className="text-2xl md:text-3xl font-black text-foreground">{Math.round(result.horasPerdidasMes)}h</p>
                    <p className="text-xs text-muted-foreground">perdidas/mês</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 text-center space-y-1">
                    <p className="text-2xl md:text-3xl font-black text-foreground">{result.diasPerdidasAno}</p>
                    <p className="text-xs text-muted-foreground">dias/ano</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 text-center space-y-1">
                    <p className="text-2xl md:text-3xl font-black text-emerald-600">+{result.horasRecuperaveisMes.toFixed(0)}h</p>
                    <p className="text-xs text-muted-foreground">recuperáveis/mês</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="bg-card rounded-2xl p-6 md:p-8 space-y-5">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Distribuição do seu dia</h3>
                  <BreakdownBar
                    label="Distrações"
                    hours={result.horasDistracoes}
                    total={inputs.horasDia}
                    color="bg-red-500"
                  />
                  <BreakdownBar
                    label="Tarefas de baixo valor"
                    hours={result.horasOverhead}
                    total={inputs.horasDia}
                    color="bg-amber-500"
                  />
                  <BreakdownBar
                    label="Foco profundo"
                    hours={result.horasFocoProfundo}
                    total={inputs.horasDia}
                    color="bg-emerald-500"
                  />
                </div>

                {/* Impacto financeiro + Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Impacto financeiro</h3>
                    <p className="text-3xl font-black text-red-500">{formatCurrency(result.custoAnual)}<span className="text-base font-medium text-muted-foreground">/ano</span></p>
                    <p className="text-xs text-muted-foreground">Com +20% de foco, você recupera <span className="font-bold text-emerald-600">{formatCurrency(result.ganho20)}/ano</span></p>
                  </div>
                  <div className="bg-card rounded-2xl p-6 flex items-center justify-center">
                    <ScoreIndicator score={result.score} label={result.scoreLabel} />
                  </div>
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    to="/colecao"
                    className="flex items-center justify-center gap-2 py-3.5 bg-foreground text-background font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Ver produtos <ArrowRight size={16} />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 py-3.5 border border-border text-foreground font-semibold text-sm rounded-xl hover:bg-secondary transition-colors"
                  >
                    <RotateCcw size={14} /> Recalcular
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-3.5 border border-border text-foreground font-semibold text-sm rounded-xl hover:bg-secondary transition-colors"
                  >
                    <Download size={14} /> Compartilhar
                  </button>
                </div>

                {/* Footnote */}
                <p className="text-xs text-muted-foreground text-center pt-4">
                  Baseado em pesquisa da UC Irvine (Gloria Mark, 2008). Coeficiente de recuperação conservador de 30%.
                </p>

                {/* Share card (hidden, for html2canvas) */}
                <div className="overflow-hidden h-0">
                  <div
                    ref={cardRef}
                    className="w-[600px] h-[400px] flex flex-col items-center justify-center gap-6 p-10"
                    style={{ backgroundColor: "#1a1a1a", color: "#fff", fontFamily: "Inter, sans-serif" }}
                  >
                    <p style={{ fontSize: 14, letterSpacing: 3, textTransform: "uppercase", opacity: 0.6 }}>
                      Calculadora de Foco
                    </p>
                    <p style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
                      {result.horasPerdidasDia.toFixed(1)}h/dia
                    </p>
                    <p style={{ fontSize: 16, opacity: 0.7 }}>de produtividade perdida — {formatCurrency(result.custoAnual)}/ano</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 32, fontWeight: 900 }}>{result.score}/10</span>
                      <span style={{ fontSize: 14, opacity: 0.5 }}>Score de Foco</span>
                    </div>
                    <p style={{ fontSize: 14, opacity: 0.4 }}>
                      Meu foco profundo representa apenas {focoPct}% do dia. Quanto é o seu?
                    </p>
                    <p style={{ fontSize: 12, opacity: 0.3 }}>narvo.com.br/calculadora</p>
                  </div>
                </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <p className="text-muted-foreground text-sm text-center">Ajuste os valores e clique em <span className="font-bold text-foreground">Calcular meu foco</span></p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
