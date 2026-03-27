import { Zap } from "lucide-react";
import { SiGithub, SiInstagram, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="border-t border-border/30 bg-[rgba(5,10,24,0.8)]">
      {/* Subtle animated top line */}
      <div className="h-px w-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-marquee w-[200%]" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">
                Hack2Skilla
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Hyderabad&apos;s premier tech event platform. Empowering
              developers, innovators, and entrepreneurs to build the future.
            </p>
            <div className="flex gap-4 mt-5">
              {[
                { icon: SiX, href: "https://x.com", label: "X / Twitter" },
                {
                  icon: SiLinkedin,
                  href: "https://linkedin.com",
                  label: "LinkedIn",
                },
                { icon: SiGithub, href: "https://github.com", label: "GitHub" },
                {
                  icon: SiInstagram,
                  href: "https://instagram.com",
                  label: "Instagram",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                "Events",
                "Hackathons",
                "Workshops",
                "AI Conferences",
                "Summits",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#events"
                    className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">
              Community
            </h4>
            <ul className="space-y-2">
              {["About Us", "Team", "Partners", "Blog", "Newsletter"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {year} Hack2Skilla. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ♥ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
