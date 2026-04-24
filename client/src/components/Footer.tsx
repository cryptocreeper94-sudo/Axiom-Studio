/**
 * Axiom Studio — Footer
 * Full ecosystem footer with legal, company, product, and social links.
 * DarkWave Studios LLC — Copyright 2026
 */
import { Brain, ExternalLink } from "lucide-react";

const ecosystemLinks = [
  { name: "DarkWave Studios", href: "https://darkwavestudios.io" },
  { name: "Trust Layer", href: "https://dwtl.io" },
  { name: "Signal Chat", href: "https://darkwavestudios.io/chat" },
  { name: "TrustGen 3D", href: "https://trustgen.tlid.io" },
  { name: "Lume Language", href: "https://lume-lang.org" },
  { name: "Strata Registry", href: "https://strata.tlid.io" },
];

const productLinks = [
  { name: "Auto-Routing", href: "#" },
  { name: "Snippet Marketplace", href: "https://darkwavestudios.io/developers/marketplace" },
  { name: "Widget Builder", href: "https://darkwavestudios.io/developers/widget-builder" },
  { name: "Developer API", href: "https://darkwavestudios.io/developers/api" },
  { name: "Pricing", href: "/billing" },
];

const legalLinks = [
  { name: "Terms of Service", href: "https://darkwavestudios.io/terms" },
  { name: "Privacy Policy", href: "https://darkwavestudios.io/privacy" },
  { name: "Affiliate Disclosure", href: "https://darkwavestudios.io/affiliate-disclosure" },
  { name: "SMS Terms", href: "/sms-terms" },
];

const s = {
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.04)",
    background: "#060810",
    padding: "48px 24px 24px",
  } as React.CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "32px",
    maxWidth: "1100px",
    margin: "0 auto",
  } as React.CSSProperties,
  heading: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.3)",
    marginBottom: "12px",
  } as React.CSSProperties,
  link: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
    textDecoration: "none",
    padding: "4px 0",
    transition: "color 0.2s",
  } as React.CSSProperties,
  bottom: {
    maxWidth: "1100px",
    margin: "32px auto 0",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: "12px",
  } as React.CSSProperties,
};

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.grid}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #06b6d4, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Brain style={{ width: 14, height: 14, color: "white" }} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
              Axiom Studio
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", lineHeight: 1.6, maxWidth: "200px" }}>
            Multi-agent AI development environment. Part of the DarkWave Studios Trust Layer ecosystem.
          </p>
        </div>

        {/* Ecosystem */}
        <div>
          <h4 style={s.heading}>Ecosystem</h4>
          {ecosystemLinks.map((link) => (
            <a key={link.name} href={link.href} target="_blank" rel="noopener" style={s.link}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#67e8f9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              {link.name}
              <ExternalLink style={{ width: 9, height: 9, opacity: 0.5 }} />
            </a>
          ))}
        </div>

        {/* Product */}
        <div>
          <h4 style={s.heading}>Product</h4>
          {productLinks.map((link) => (
            <a key={link.name} href={link.href} style={s.link}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener" : undefined}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#67e8f9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Legal */}
        <div>
          <h4 style={s.heading}>Legal</h4>
          {legalLinks.map((link) => (
            <a key={link.name} href={link.href} style={s.link}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener" : undefined}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#67e8f9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={s.bottom}>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.12)" }}>
          DarkWave Studios LLC. All rights reserved. 2026
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          <a href="https://github.com/cryptocreeper94-sudo" target="_blank" rel="noopener"
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#67e8f9")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
          >
            GitHub
          </a>
          <a href="https://darkwavestudios.io/contact" target="_blank" rel="noopener"
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#67e8f9")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
          >
            Contact
          </a>
          <a href="mailto:support@darkwavestudios.io"
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#67e8f9")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
          >
            support@darkwavestudios.io
          </a>
        </div>
      </div>
    </footer>
  );
}
