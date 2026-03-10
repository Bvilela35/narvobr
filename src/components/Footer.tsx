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
                Seja o primeiro a saber<br />sobre novidades.
              </p>
              <a
                href="https://instagram.com/narvobr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-foreground px-5 py-2.5 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                Siga no Instagram
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
                    className="text-lg md:text-xl font-light opacity-80 hover:opacity-100 transition-opacity"
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
                    className="text-lg md:text-xl font-light opacity-80 hover:opacity-100 transition-opacity"
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
    </footer>
  );
}
