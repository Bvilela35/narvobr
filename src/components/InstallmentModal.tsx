import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { calcInstallments, getPriceTier } from "@/lib/installments";
import { X } from "lucide-react";

interface InstallmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  price: number;
  productTitle: string;
  onAddToCart?: () => void;
}

const TIER_COPY = {
  friction: {
    manifesto:
      "Menos que um café por mês para eliminar a bagunça que rouba sua energia mental.",
    parcelado:
      "Criamos essa facilidade para que nada seja uma distração entre você e seu melhor trabalho.",
  },
  roi: {
    manifesto:
      "Sua produtividade se paga. Dividimos para que o tempo que você recupera focado pague o seu setup.",
    parcelado:
      "Cada parcela é um investimento no seu fluxo de trabalho. O retorno é medido em horas de foco.",
  },
  identity: {
    manifesto:
      "O setup que separa amadores de profissionais. Invista na sua carreira com parcelas que cabem no seu fluxo mensal.",
    parcelado:
      "Projetamos condições para que a excelência do seu ambiente de trabalho não espere.",
  },
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function InstallmentModal({
  open,
  onOpenChange,
  price,
  productTitle,
  onAddToCart,
}: InstallmentModalProps) {
  const { count, value } = calcInstallments(price);
  const tier = getPriceTier(price);
  const copy = TIER_COPY[tier];
  const pixDiscount = price * 0.9;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[520px] p-0 border-0 rounded-[20px] overflow-hidden bg-white shadow-2xl gap-0 [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Detalhes de parcelamento</DialogTitle>

        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-[#e8e8e8] transition-colors active:scale-95"
          aria-label="Fechar"
        >
          <X size={16} strokeWidth={2} color="#1d1d1f" />
        </button>

        <div className="px-8 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
          {/* Hero */}
          <p className="text-[13px] font-medium tracking-wide uppercase text-[#86868b] mb-3">
            Parcelamento
          </p>
          <h2
            className="text-[28px] sm:text-[32px] font-semibold leading-[1.1] tracking-tight text-[#1d1d1f] mb-4"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            O investimento no seu foco.
          </h2>
          <p className="text-[15px] leading-relaxed text-[#6e6e73] mb-8">
            {copy.manifesto}
          </p>

          {/* Divider */}
          <div className="h-px bg-[#e8e8e8] mb-8" />

          {/* Options */}
          <div className="space-y-6">
            {/* PIX */}
            <div className="rounded-2xl border border-[#e8e8e8] p-5 sm:p-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[13px] font-medium uppercase tracking-wide text-[#86868b]">
                  À Vista no PIX
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0f3d2e] bg-[#0f3d2e]/8 px-2.5 py-1 rounded-full">
                  −10%
                </span>
              </div>
              <p className="text-[22px] sm:text-[24px] font-semibold text-[#1d1d1f] tracking-tight tabular-nums">
                R$ {formatCurrency(pixDiscount)}
              </p>
              <p className="text-[13px] text-[#86868b] mt-1.5">
                Economize. Menos custo, mais foco imediato.
              </p>
            </div>

            {/* Parcelado */}
            <div className="rounded-2xl border border-[#e8e8e8] p-5 sm:p-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[13px] font-medium uppercase tracking-wide text-[#86868b]">
                  Parcelado
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#86868b]">
                  Sem juros
                </span>
              </div>
              <p className="text-[22px] sm:text-[24px] font-semibold text-[#1d1d1f] tracking-tight tabular-nums">
                {count}x de R$ {formatCurrency(value)}
              </p>
              <p className="text-[13px] text-[#86868b] mt-1.5">
                {copy.parcelado}
              </p>
            </div>
          </div>

          {/* CTA */}
          {onAddToCart && (
            <button
              onClick={() => {
                onAddToCart();
                onOpenChange(false);
              }}
              className="w-full mt-8 h-[52px] rounded-xl bg-[#0f3d2e] text-white text-[15px] font-medium hover:bg-[#0f3d2e]/90 transition-colors active:scale-[0.98]"
            >
              Adicionar ao Setup
            </button>
          )}

          {/* Footer microcopy */}
          <p className="text-center text-[12px] text-[#86868b] mt-5">
            Independente da sua escolha, nosso foco é a sua performance.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
