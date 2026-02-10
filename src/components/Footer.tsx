import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Coleção",
    links: [
      { label: "Todos os produtos", href: "/colecao" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { label: "A marca", href: "/sobre" },
      { label: "Sistema", href: "/sobre" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "FAQ", href: "/suporte" },
      { label: "Contato", href: "/suporte" },
    ],
  },
  {
    title: "Políticas",
    links: [
      { label: "Trocas e Devoluções", href: "/trocas" },
      { label: "Envio", href: "/envio" },
      { label: "Privacidade", href: "/privacidade" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 mb-16">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-medium tracking-[0.2em] uppercase mb-4 opacity-50">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-sm opacity-50 italic">
            Clareza mental começa na mesa.
          </p>
          <p className="text-xs opacity-30">
            © {new Date().getFullYear()} Narvo
          </p>
        </div>
      </div>
    </footer>
  );
}
