import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Landing() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const { dark, toggleDark } = useTheme();

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    if (localStorage.getItem("token")) navigate("/chat");
  }, [navigate]);

  const t = dark ? {
    bg:          "#080c10",
    bgGrad:      "linear-gradient(140deg,#080c10 0%,#071410 60%,#0b1520 100%)",
    nav:         "rgba(8,12,16,0.85)",
    navBorder:   "rgba(255,255,255,0.06)",
    text:        "#f0faf5",
    textMuted:   "#5d8072",
    textSub:     "#9ca3af",
    cardBg:      "rgba(255,255,255,0.03)",
    cardBorder:  "rgba(255,255,255,0.07)",
    badge:       "rgba(52,211,153,0.1)",
    badgeBorder: "rgba(52,211,153,0.25)",
    badgeText:   "#34d399",
    btnGhost:    "rgba(255,255,255,0.06)",
    btnGhostBorder: "rgba(255,255,255,0.12)",
    btnGhostText: "#9ca3af",
    toggleBg:    "rgba(255,255,255,0.07)",
    toggleBorder:"rgba(255,255,255,0.12)",
    toggleIcon:  "☀️",
    gridLine:    "rgba(52,211,153,0.04)",
    glowA:       "rgba(52,211,153,0.12)",
    glowB:       "rgba(99,102,241,0.08)",
  } : {
    bg:          "#f5faf7",
    bgGrad:      "linear-gradient(140deg,#f0fdf8 0%,#eff6ff 60%,#f5f3ff 100%)",
    nav:         "rgba(245,250,247,0.9)",
    navBorder:   "rgba(0,0,0,0.07)",
    text:        "#0f1f18",
    textMuted:   "#4b7a62",
    textSub:     "#6b7280",
    cardBg:      "rgba(255,255,255,0.7)",
    cardBorder:  "rgba(0,0,0,0.07)",
    badge:       "rgba(5,150,105,0.08)",
    badgeBorder: "rgba(5,150,105,0.2)",
    badgeText:   "#047857",
    btnGhost:    "rgba(0,0,0,0.04)",
    btnGhostBorder: "rgba(0,0,0,0.1)",
    btnGhostText: "#4b7a62",
    toggleBg:    "rgba(0,0,0,0.05)",
    toggleBorder:"rgba(0,0,0,0.1)",
    toggleIcon:  "🌙",
    gridLine:    "rgba(5,150,105,0.06)",
    glowA:       "rgba(52,211,153,0.18)",
    glowB:       "rgba(99,102,241,0.1)",
  };

  const features = [
    { icon: "🧠", title: "Méthode Socratique",  desc: "Guidage progressif par questions pour ancrer la compréhension.", color: "#34d399", accent: "rgba(52,211,153,0.12)" },
    { icon: "📝", title: "Quiz Adaptatif",       desc: "QCM générés depuis tes fichiers avec correction instantanée.",   color: "#818cf8", accent: "rgba(129,140,248,0.12)" },
    { icon: "📋", title: "Fiches Mémo",          desc: "Résumés structurés et points-clés extraits en un clic.",         color: "#fb923c", accent: "rgba(251,146,60,0.12)" },
    { icon: "✅", title: "Évaluation IA",        desc: "Soumets une réponse — reçois note, feedback et conseils.",       color: "#fbbf24", accent: "rgba(251,191,36,0.12)" },
  ];

  const formats = [
    { icon: "📄", label: "PDF" },
    { icon: "📊", label: "PPTX" },
    { icon: "📝", label: "DOCX" },
    { icon: "🖼️", label: "Image" },
    { icon: "📃", label: "TXT" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bgGrad, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", transition: "background 0.5s, color 0.4s", color: t.text, position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;900&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes float  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-8px)} }
        @keyframes shimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn{ from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(52,211,153,0.35) !important; }
        .btn-main { transition: transform 0.2s, box-shadow 0.2s; white-space: nowrap; }
        .card-feat:hover { transform: translateY(-4px) scale(1.01); }
        .card-feat { transition: transform 0.25s, box-shadow 0.25s; }
        .nav-btn:hover { opacity: 0.8; }
        .toggle-btn:hover { opacity: 0.9; transform: scale(1.05); }
        .toggle-btn { transition: transform 0.2s, opacity 0.2s; flex-shrink: 0; }
        .format-chip { transition: transform 0.2s; white-space: nowrap; }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .nav-container { padding: 0 16px !important; height: 70px !important; }
          .nav-logo-text { display: none; } /* On cache le texte du logo si trop petit, ou on réduit */
          .hero-section { padding: 40px 20px !important; }
          .cta-group { flex-direction: column; width: 100%; max-width: 320px; }
          .cta-group button { width: 100%; }
          .features-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .format-list { justify-content: center; gap: 6px !important; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", top: -120, left: "10%", width: "40vw", height: "40vw", borderRadius: "50%", background: t.glowA, filter: "blur(90px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -80, right: "5%", width: "30vw", height: "30vw", borderRadius: "50%", background: t.glowB, filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Grid overlay */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(${t.gridLine} 1px, transparent 1px), linear-gradient(90deg,${t.gridLine} 1px, transparent 1px)`, backgroundSize: "48px 48px", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav className="nav-container" style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(20px,5vw,80px)", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", background: t.nav, borderBottom: `1px solid ${t.navBorder}`, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", transition: "background 0.4s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: "0 4px 14px rgba(52,211,153,0.35)" }}>🎓</div>
          <span className="nav-logo-text" style={{ fontWeight: 800, fontSize: 18, color: t.text, letterSpacing: "-0.02em", fontFamily: "'DM Serif Display', serif" }}>
            Study<span style={{ color: "#34d399" }}>Buddy</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="toggle-btn"
            onClick={toggleDark}
            style={{ width: 38, height: 38, borderRadius: 10, background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            {t.toggleIcon}
          </button>
          <button className="nav-btn" onClick={() => navigate("/login")} style={{ padding: "7px 14px", borderRadius: 20, background: t.btnGhost, border: `1px solid ${t.btnGhostBorder}`, color: t.btnGhostText, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Login
          </button>
          <button className="nav-btn btn-main" onClick={() => navigate("/register")} style={{ padding: "7px 16px", borderRadius: 20, background: "linear-gradient(135deg,#34d399,#059669)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            S'inscrire
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero-section" style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 24px", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 16px", borderRadius: 30, background: t.badge, border: `1px solid ${t.badgeBorder}`, fontSize: 12, color: t.badgeText, marginBottom: 24, fontWeight: 600, animation: "scaleIn 0.6s ease both" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "pulse 2s ease infinite" }} />
          Tuteur IA Multiformat
        </div>

        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(38px, 8vw, 84px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", color: t.text, marginBottom: 20, maxWidth: 900 }}>
          Apprends{" "}
          <em style={{ fontStyle: "italic", background: "linear-gradient(135deg,#34d399 0%,#818cf8 50%,#34d399 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s linear infinite" }}>vraiment</em>
          <br />ce que tu lis.
        </h1>

        <p style={{ fontSize: "clamp(16px, 1.2vw, 19px)", color: t.textMuted, maxWidth: 580, lineHeight: 1.6, marginBottom: 40, fontWeight: 400 }}>
          Upload tes cours et pose tes questions. Reçois un accompagnement socratique, des quiz et des résumés intelligents.
        </p>

        <div className="cta-group" style={{ display: "flex", gap: 12, marginBottom: 48 }}>
          <button className="btn-main" onClick={() => navigate("/register")} style={{ padding: "16px 32px", borderRadius: 50, fontSize: 16, fontWeight: 700, background: "linear-gradient(135deg,#34d399,#059669)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 8px 28px rgba(52,211,153,0.3)" }}>
            Commencer gratuitement
          </button>
          <button className="nav-btn" onClick={() => navigate("/login")} style={{ padding: "16px 32px", borderRadius: 50, fontSize: 16, fontWeight: 500, background: t.btnGhost, color: t.textMuted, border: `1px solid ${t.btnGhostBorder}`, cursor: "pointer" }}>
            Se connecter
          </button>
        </div>

        <div className="format-list" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
          <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 500, width: "100%", marginBottom: 8, display: "block" }}>Formats supportés :</span>
          {formats.map((f, i) => (
            <div key={i} className="format-chip" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: t.cardBg, border: `1px solid ${t.cardBorder}`, fontSize: 13, color: t.textSub, fontWeight: 600, backdropFilter: "blur(8px)" }}>
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, maxWidth: 1000, width: "100%" }}>
          {features.map((f, i) => (
            <div key={i} className="card-feat" style={{
              padding: "32px 24px", borderRadius: 24,
              background: t.cardBg, border: `1px solid ${t.cardBorder}`,
              textAlign: "left",
              animation: `float ${5.5 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.35}s`,
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              boxShadow: dark ? "0 4px 30px rgba(0,0,0,0.3)" : "0 4px 30px rgba(0,0,0,0.05)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: f.accent, filter: "blur(20px)" }} />
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: f.color, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: 80, paddingBottom: 40, width: "100%" }}>
           <p style={{ fontSize: 13, color: t.textMuted, opacity: 0.7 }}>
            © 2026 StudyBuddy · Conçu pour apprendre, pas pour copier.
          </p>
        </footer>
      </div>
    </div>
  );
}