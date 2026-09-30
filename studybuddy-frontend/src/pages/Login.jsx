import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/chat");
      } else {
        setError(data.detail || "Email ou mot de passe incorrect");
      }
    } catch {
      setError("Erreur de connexion. Vérifie que le serveur tourne.");
    }
    setLoading(false);
  };

  const t = dark ? {
    bg:           "linear-gradient(140deg,#080c10 0%,#071410 60%,#0b1520 100%)",
    cardBg:       "rgba(255,255,255,0.04)",
    cardBorder:   "rgba(255,255,255,0.08)",
    text:         "#e8f4ef",
    textMuted:    "#5d8072",
    inputBg:      "rgba(255,255,255,0.05)",
    inputBorder:  "rgba(255,255,255,0.1)",
    inputColor:   "#e8f4ef",
    glowA:        "rgba(52,211,153,0.12)",
    glowB:        "rgba(99,102,241,0.08)",
    gridLine:     "rgba(52,211,153,0.04)",
    toggleBg:     "rgba(255,255,255,0.07)",
    toggleBorder: "rgba(255,255,255,0.12)",
    toggleIcon:   "☀️",
    linkColor:    "#6b8a78",
    navBg:        "rgba(8,12,16,0.85)",
    navBorder:    "rgba(255,255,255,0.06)",
  } : {
    bg:           "linear-gradient(140deg,#f0fdf8 0%,#eff6ff 60%,#f5f3ff 100%)",
    cardBg:       "rgba(255,255,255,0.85)",
    cardBorder:   "rgba(0,0,0,0.07)",
    text:         "#0f2018",
    textMuted:    "#4b7a62",
    inputBg:      "rgba(0,0,0,0.04)",
    inputBorder:  "rgba(0,0,0,0.1)",
    inputColor:   "#0f2018",
    glowA:        "rgba(52,211,153,0.18)",
    glowB:        "rgba(99,102,241,0.1)",
    gridLine:     "rgba(5,150,105,0.06)",
    toggleBg:     "rgba(0,0,0,0.05)",
    toggleBorder: "rgba(0,0,0,0.1)",
    toggleIcon:   "🌙",
    linkColor:    "#4b7a62",
    navBg:        "rgba(245,250,247,0.9)",
    navBorder:    "rgba(0,0,0,0.06)",
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      display: "flex", flexDirection: "column",
      background: t.bg,
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      position: "relative", overflowX: "hidden",
      transition: "background 0.5s", boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: ${t.inputColor};
          -webkit-box-shadow: 0 0 0px 1000px ${dark ? "#0d1f17" : "#f0fdf8"} inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(52,211,153,0.4) !important; }
        .login-btn { transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s; }
        .toggle-btn:hover { opacity: 0.85; transform: scale(1.08); }
        .toggle-btn { transition: transform 0.2s, opacity 0.2s; flex-shrink: 0; }
        .field-input:focus { border-color: #34d399 !important; background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,1)'} !important; }
        .logo-btn:hover { opacity: 0.8; }
        .logo-btn { transition: opacity 0.2s; }

        /* Mobile Adjustments */
        @media (max-width: 480px) {
          .nav-container { padding: 0 16px !important; }
          .login-card { 
            padding: 32px 24px !important; 
            margin: 16px !important;
            border-radius: 20px !important;
          }
          .nav-logo-text { font-size: 16px !important; }
          .glow-1 { width: 250px !important; height: 250px !important; }
          .glow-2 { width: 200px !important; height: 200px !important; }
        }
      `}</style>

      {/* Ambient glows */}
      <div className="glow-1" style={{ position: "fixed", top: -100, left: "15%", width: 400, height: 400, borderRadius: "50%", background: t.glowA, filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div className="glow-2" style={{ position: "fixed", bottom: -80, right: "10%", width: 350, height: 350, borderRadius: "50%", background: t.glowB, filter: "blur(70px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`, backgroundSize: "48px 48px", pointerEvents: "none", zIndex: 0 }} />

      {/* NAVBAR */}
      <nav className="nav-container" style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 clamp(20px, 5vw, 80px)", height: 62,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: t.navBg, borderBottom: `1px solid ${t.navBorder}`,
        backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
      }}>
        <button className="logo-btn" onClick={() => navigate("/")} style={{
          display: "flex", alignItems: "center", gap: 9,
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 14px rgba(52,211,153,0.35)" }}>🎓</div>
          <span className="nav-logo-text" style={{ fontWeight: 800, fontSize: 18, color: t.text, letterSpacing: "-0.02em", fontFamily: "'DM Serif Display',serif" }}>
            Study<span style={{ color: "#34d399" }}>Buddy</span>
          </span>
        </button>

        <button className="toggle-btn" onClick={toggleDark} style={{
          width: 38, height: 38, borderRadius: 10,
          background: t.toggleBg, border: `1px solid ${t.toggleBorder}`,
          fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          {t.toggleIcon}
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", position: "relative", zIndex: 1 }}>
        <div className="login-card" style={{
          background: t.cardBg, border: `1px solid ${t.cardBorder}`,
          borderRadius: 24, padding: "44px 40px",
          width: "100%", maxWidth: 420, textAlign: "center",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.4)" : "0 24px 64px rgba(0,0,0,0.1)",
          transition: "all 0.4s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 6px 20px rgba(52,211,153,0.35)" }}>🎓</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: t.text, letterSpacing: "-0.03em", fontFamily: "'DM Serif Display',serif" }}>
              Study<span style={{ color: "#34d399" }}>Buddy</span>
            </h1>
          </div>

          <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 32, fontWeight: 400 }}>
            Connecte-toi à ton espace d'apprentissage
          </p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px", color: "#ef4444", fontSize: 13, marginBottom: 20, textAlign: "left", fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 7, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Email</label>
              <input
                className="field-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com" required
                style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, padding: "14px 16px", color: t.inputColor, fontSize: 15, outline: "none", transition: "all 0.2s", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", fontSize: 11, color: t.textMuted, marginBottom: 7, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Mot de passe</label>
              <input
                className="field-input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, padding: "14px 16px", color: t.inputColor, fontSize: 15, outline: "none", transition: "all 0.2s", fontFamily: "inherit" }}
              />
            </div>

            <button
              type="submit"
              className="login-btn" disabled={loading}
              style={{ background: "linear-gradient(135deg,#34d399,#059669)", color: "#fff", border: "none", borderRadius: 13, padding: "15px", fontSize: 15, fontWeight: 700, marginTop: 10, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.72 : 1, boxShadow: "0 6px 22px rgba(52,211,153,0.3)" }}
            >
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0 20px" }}>
            <div style={{ flex: 1, height: 1, background: t.cardBorder }} />
            <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 500 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: t.cardBorder }} />
          </div>

          <p style={{ fontSize: 14, color: t.textMuted }}>
            Pas encore de compte ?{" "}
            <Link to="/register" style={{ color: "#34d399", textDecoration: "none", fontWeight: 700 }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}