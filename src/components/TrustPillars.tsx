import { Truck, Shield, RotateCcw, CreditCard } from "lucide-react";

const pillars = [
  {
    icon: Truck,
    title: "Envio Ultra Rápido",
    description: "Grátis acima de R$499.",
  },
  {
    icon: Shield,
    title: "Garantia de 6 Meses",
    description: "Cobertura total contra defeitos.",
  },
  {
    icon: RotateCcw,
    title: "7 Dias para Testar",
    description: "Troque ou devolva grátis.",
  },
  {
    icon: CreditCard,
    title: "10x Sem Juros",
    description: "Parcele sem acréscimo.",
  },
];

export function TrustPillars() {
  return (
    <section className="px-6 md:px-10 py-12 md:py-16 bg-background">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
        {pillars.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center md:items-start md:text-left gap-3">
            <item.icon className="h-7 w-7 text-foreground" strokeWidth={1.3} />
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-snug mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
