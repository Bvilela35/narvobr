import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const columnOne = [
  { label: "Coleção", href: "/colecao" },
  { label: "Sobre", href: "/sobre" },
  { label: "Journal", href: "/journal" },
  { label: "Suporte", href: "/suporte" },
];

const columnTwo = [
  { label: "Trocas e Devoluções", href: "/trocas" },
  { label: "Envio", href: "/envio" },
  { label: "Privacidade", href: "/privacidade" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Main grid: left CTA + right nav columns */}
        <div className="grid md:grid-cols-[1fr_1fr_1fr] gap-16 md:gap-10 mb-20">
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
                Uma empresa do grupo BBS.
              </p>
              <a
                href="https://www.sanchz.store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all duration-300"
                style={{ backgroundColor: "#0f3d2e", border: "2px solid #b6e36d" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#b6e36d"; e.currentTarget.style.color = "#0f3d2e"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0f3d2e"; e.currentTarget.style.color = "white"; }}
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
                    className="text-lg md:text-xl font-black opacity-80 hover:opacity-100 transition-opacity"
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
                    className="text-lg md:text-xl font-black opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs opacity-30">
            © {new Date().getFullYear()} Narvo — Engenharia do Silêncio
          </p>
          <div className="flex gap-6 text-xs opacity-40">
            <Link to="/privacidade" className="hover:opacity-70 transition-opacity">Privacidade</Link>
            <Link to="/trocas" className="hover:opacity-70 transition-opacity">Termos</Link>
          </div>
        </div>
      </div>

      {/* Sub-footer bar */}
      <div className="border-t border-border" style={{ backgroundColor: "#0f3d2e" }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] opacity-80 leading-relaxed text-white">
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
              className="h-8"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
