import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Risk Maps", href: "#risk-maps" },
  { label: "Forecast", href: "#forecast" },
  { label: "Budget", href: "#budget" },
  { label: "Report", href: "#report" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 border-b border-green-200"
      style={{ background: "linear-gradient(180deg, hsl(120 60% 96%) 0%, rgba(245,245,244,0.98) 100%)", backdropFilter: "blur(20px)" }}>
      <nav className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a href="#home" onClick={() => scrollTo("#home")} className="flex items-center gap-2 text-gray-900 font-bold text-lg tracking-tight">
          <Shield className="w-6 h-6 text-green-600" />
          <span>VCOM-TZ</span>
        </a>

        <ul className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <button onClick={() => scrollTo(item.href)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-600 hover:text-gray-900">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-green-200"
          style={{ background: "hsl(120 60% 96%)" }}>
          <ul className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <button onClick={() => scrollTo(item.href)}
                  className="block w-full text-left py-2 px-3 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-green-50 transition-colors">
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
