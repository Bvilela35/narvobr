import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppBanner() {
  return (
    <section className="px-6 md:px-10 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-card-elevated rounded-2xl px-8 py-6 flex min-h-[172px] flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            {/* Avatar stack */}
            <div className="flex -space-x-3 flex-shrink-0 justify-center">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full border-2 border-card-elevated object-cover"
                  loading="lazy"
                />
              ))}
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold">Compre pelo WhatsApp</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fale com um de nossos especialistas e tire as suas dúvidas sobre acabamentos, medidas especiais, sugestões de peças e muito mais.
              </p>
              
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 px-6 rounded-lg text-sm font-medium flex-shrink-0 w-full md:w-auto"
          >
            <a
              href="https://wa.me/5531993940473"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
