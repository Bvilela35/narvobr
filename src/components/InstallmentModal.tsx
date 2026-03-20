import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { calcInstallments, getPriceTier } from "@/lib/installments";
import { X } from "lucide-react";
import narvoIcon from "@/assets/narvo-icon.svg";

interface InstallmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  price: number;
  productTitle: string;
  onAddToCart?: () => void;
}

const TIER_COPY = {
  friction: {
    hero: "Menos que um café por mês para eliminar a bagunça que rouba sua energia mental.",
    parcelado:
      "Criamos essa facilidade para que nada seja uma distração entre você e seu melhor trabalho.",
  },
  roi: {
    hero: "Sua produtividade se paga. Dividimos para que o tempo que você recupera focado pague o seu setup.",
    parcelado:
      "Cada parcela é um investimento no seu fluxo de trabalho. O retorno é medido em horas de foco.",
  },
  identity: {
    hero: "O setup que separa amadores de profissionais. Invista na sua carreira com parcelas que cabem no seu fluxo mensal.",
    parcelado:
      "Projetamos condições para que a excelência do seu ambiente de trabalho não espere.",
  },
};

function fmt(value: number): string {
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
  const pixPrice = price * 0.9;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[640px] p-0 border-0 rounded-[20px] overflow-hidden bg-[#f5f5f7] shadow-2xl gap-0 [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Opções de pagamento</DialogTitle>

        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors active:scale-95"
          aria-label="Fechar"
        >
          <X size={16} strokeWidth={2.5} color="#1d1d1f" />
        </button>

        <div className="px-8 pt-12 pb-10 sm:px-12 sm:pt-14 sm:pb-12">
          {/* Hero — title left, logo right */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h2
                className="text-[32px] sm:text-[40px] font-bold leading-[1.05] tracking-tight text-[#1d1d1f] max-w-[400px]"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                As opções de pagamento para o seu setup.
              </h2>

              <p className="text-[15px] sm:text-[17px] leading-[1.5] text-[#6e6e73] mt-5 max-w-[400px]">
                {copy.hero} É rápido, fácil e conveniente.
              </p>
            </div>

            <img
              src={narvoIcon}
              alt="Narvo"
              className="w-[80px] h-[80px] sm:w-[110px] sm:h-[110px] object-contain flex-shrink-0 mt-1"
            />
          </div>

          {/* Section: PIX */}
          <div className="mt-12">
            <h3 className="text-[24px] sm:text-[28px] font-bold leading-[1.1] tracking-tight text-[#1d1d1f]">
              Pague à vista e economize 10%
            </h3>
            <p className="text-[15px] leading-[1.5] text-[#6e6e73] mt-2.5">
              Ganhe 10% de desconto no pagamento à vista via PIX.{" "}
              <span className="font-semibold text-[#1d1d1f]">
                R$ {fmt(pixPrice)}
              </span>
            </p>
          </div>

          {/* Section: Installments */}
          <div className="mt-10">
            <h3 className="text-[24px] sm:text-[28px] font-bold leading-[1.1] tracking-tight text-[#1d1d1f]">
              Pague em até {count}x sem juros
            </h3>
            <p className="text-[15px] leading-[1.5] text-[#6e6e73] mt-2.5">
              {copy.parcelado}{" "}
              <span className="font-semibold text-[#1d1d1f]">
                {count}x de R$ {fmt(value)}
              </span>{" "}
              no cartão de crédito Visa, MasterCard ou American Express®.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#d2d2d7] mt-12 mb-8" />

          {/* CTA */}
          <button
            onClick={() => {
              if (onAddToCart) onAddToCart();
              onOpenChange(false);
            }}
            className="h-[44px] px-7 rounded-full bg-[#0f3d2e] text-white text-[15px] font-medium hover:bg-[#0f3d2e]/90 transition-colors active:scale-[0.97]"
          >
            Continue comprando
          </button>

          {/* Footer microcopy */}
          <p className="text-[12px] text-[#86868b] mt-6 max-w-[400px] leading-[1.4]">
            Independente da sua escolha, nosso foco é a sua performance.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
