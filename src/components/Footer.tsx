import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const columnOne = [
  { label: "Coleção", href: "/colecao" },
  { label: "Sobre", href: "/sobre" },
  { label: "Journal", href: "/journal" },
  { label: "Suporte", href: "/suporte" },
];

const columnTwo = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Serviço", href: "/termos-de-servico" },
  { label: "Trocas e Devoluções", href: "/trocas" },
];

const columnTools = [
  { label: "Calcule o seu foco", href: "/calculadora", external: false },
  { label: "Ferramentas de produtividade", href: "https://narvosfocus.com", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Main grid: left CTA + right nav columns */}
        <div className="grid md:grid-cols-[1fr_1fr_1fr_1fr] gap-16 md:gap-10 mb-20">
          {/* Left — Social + Newsletter */}
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-medium tracking-[0.2em] uppercase mb-5 opacity-50">
                Narvo nas redes
              </h4>
              <a
                href="https://instagram.com/narvobr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-light leading-snug mb-5">
                Uma empresa Sanchz.
              </p>
              <a
                href="https://www.sanchz.store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all duration-300"
                style={{ backgroundColor: "#0f3d2e", border: "2px solid #0f3d2e" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#b6e36d"; e.currentTarget.style.color = "#0f3d2e"; e.currentTarget.style.borderColor = "#b6e36d"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0f3d2e"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#0f3d2e"; }}
              >
                Conheça a Sanchz
              </a>
            </div>
          </div>

          {/* Center column */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase mb-5 opacity-50">
              Navegação
            </h4>
            <ul className="space-y-4">
              {columnOne.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xl md:text-2xl font-black opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase mb-5 opacity-50">
              Políticas
            </h4>
            <ul className="space-y-4">
              {columnTwo.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xl md:text-2xl font-black opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Sub-footer bar */}
      <div className="border-t border-border bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] opacity-80 leading-relaxed text-foreground">
          {/* Left — CNPJ */}
          <p className="text-center md:text-left">
            © 2026, BBS COMPONENTES DE AUTOMACAO, CONTROLE E TRANSPORTADORES LTDA | CNPJ: 23.887.867/0001-06 | Rua Jose Rodrigues Pereira, 32 Filadelfia Betim, MG | CEP: 32670-098
          </p>


          {/* Right — Google Loja Segura */}
          <a
            href="https://transparencyreport.google.com/safe-browsing/search?url=www.narvo.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/google-loja-segura.svg"
              alt="Google Loja Segura"
              width={153}
              height={55}
              className="h-8 w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
