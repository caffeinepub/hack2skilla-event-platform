import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Menu, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { isAdminSessionActive } from "../utils/auth";

const NAV_LINKS = [
  { label: "Events", href: "#events" },
  { label: "About", href: "#about" },
  { label: "Team", href: "#team" },
  { label: "Sponsors", href: "#sponsors" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = isAdminSessionActive();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    setMobileOpen(false);
    const el = document.querySelector(id);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(5,10,24,0.9)] backdrop-blur-xl shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Hack2Skilla</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <button
              type="button"
              key={l.label}
              onClick={() => scrollTo(l.href)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              data-ocid="nav.link"
            >
              {l.label}
            </button>
          ))}
          {isAdmin ? (
            <Link to="/admin">
              <Button
                size="sm"
                variant="outline"
                className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                data-ocid="nav.admin.link"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/admin/login">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                data-ocid="nav.login.link"
              >
                Login
              </Button>
            </Link>
          )}
          <button
            type="button"
            onClick={() => scrollTo("#events")}
            className="btn-gradient text-white text-sm font-semibold px-5 py-2 rounded-full"
            data-ocid="nav.host_event.button"
          >
            Host Event
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[rgba(5,10,24,0.98)] backdrop-blur-xl border-b border-border/30 px-4 pb-4">
          {NAV_LINKS.map((l) => (
            <button
              type="button"
              key={l.label}
              onClick={() => scrollTo(l.href)}
              className="block w-full text-left py-3 text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-border/20"
            >
              {l.label}
            </button>
          ))}
          <div className="flex gap-3 mt-4">
            {isAdmin ? (
              <Link to="/admin" className="flex-1">
                <Button className="w-full" size="sm" variant="outline">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/admin/login" className="flex-1">
                <Button className="w-full" size="sm" variant="ghost">
                  Login
                </Button>
              </Link>
            )}
            <button
              type="button"
              onClick={() => scrollTo("#events")}
              className="flex-1 btn-gradient text-white text-sm font-semibold px-4 py-2 rounded-full"
            >
              Host Event
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
