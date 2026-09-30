import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendMessage, getConversations, getMessages, deleteConversation, uploadFile } from "../services/api";
// Ajoute :
import { useTheme } from "../context/ThemeContext";
const MODES = {
  SOCRATIQUE: { color: "#34d399", icon: "🧠", label: "Socratique" },
  QUIZ:       { color: "#818cf8", icon: "📝", label: "Quiz" },
  RESUME:     { color: "#fb923c", icon: "📋", label: "Résumé" },
  EVALUATION: { color: "#fbbf24", icon: "✅", label: "Évaluation" },
  FALLBACK:   { color: "#6b7280", icon: "⚠️", label: "Erreur" },
};

// ── File type helpers ─────────────────────────────────────────
const FILE_ICONS = {
  pdf:  { icon: "📄", color: "#ef4444", label: "PDF" },
  pptx: { icon: "📊", color: "#f97316", label: "PowerPoint" },
  ppt:  { icon: "📊", color: "#f97316", label: "PowerPoint" },
  docx: { icon: "📝", color: "#3b82f6", label: "Word" },
  doc:  { icon: "📝", color: "#3b82f6", label: "Word" },
  txt:  { icon: "📃", color: "#6b7280", label: "Texte" },
  jpg:  { icon: "🖼️", color: "#8b5cf6", label: "Image" },
  jpeg: { icon: "🖼️", color: "#8b5cf6", label: "Image" },
  png:  { icon: "🖼️", color: "#8b5cf6", label: "Image" },
};

function getFileInfo(name) {
  const ext = name.split(".").pop().toLowerCase();
  return FILE_ICONS[ext] || { icon: "📎", color: "#6b7280", label: ext.toUpperCase() };
}

function isImage(name) {
  return ["jpg","jpeg","png","gif","webp"].includes(name.split(".").pop().toLowerCase());
}

// ── Theme ─────────────────────────────────────────────────────
function getTheme(dark) {
  return dark ? {
    bg:              "#080c10",
    sidebar:         "rgba(255,255,255,0.015)",
    sidebarBorder:   "rgba(255,255,255,0.06)",
    header:          "rgba(8,12,16,0.92)",
    text:            "#e8f4ef",
    textMuted:       "#5d8072",
    textDim:         "#374151",
    inputBg:         "rgba(255,255,255,0.04)",
    inputBorder:     "rgba(255,255,255,0.08)",
    convActive:      "rgba(52,211,153,0.08)",
    convActiveBorder:"rgba(52,211,153,0.18)",
    scrollThumb:     "#1a2e22",
    botBubble:       "rgba(255,255,255,0.05)",
    botBubbleBorder: "rgba(255,255,255,0.07)",
    toggleBg:        "rgba(255,255,255,0.07)",
    toggleBorder:    "rgba(255,255,255,0.12)",
    toggleIcon:      "☀️",
    emptyText:       "#e8f4ef",
    attachBg:        "rgba(255,255,255,0.06)",
    attachBorder:    "rgba(255,255,255,0.1)",
    inputAreaBg:     "rgba(8,12,16,0.95)",
  } : {
    bg:              "#f0fdf8",
    sidebar:         "rgba(255,255,255,0.85)",
    sidebarBorder:   "rgba(0,0,0,0.07)",
    header:          "rgba(240,253,248,0.95)",
    text:            "#0f2018",
    textMuted:       "#4b7a62",
    textDim:         "#9ca3af",
    inputBg:         "rgba(0,0,0,0.04)",
    inputBorder:     "rgba(0,0,0,0.1)",
    convActive:      "rgba(5,150,105,0.08)",
    convActiveBorder:"rgba(5,150,105,0.2)",
    scrollThumb:     "#a7f3d0",
    botBubble:       "rgba(255,255,255,0.97)",
    botBubbleBorder: "rgba(0,0,0,0.07)",
    toggleBg:        "rgba(0,0,0,0.05)",
    toggleBorder:    "rgba(0,0,0,0.1)",
    toggleIcon:      "🌙",
    emptyText:       "#0f2018",
    attachBg:        "rgba(0,0,0,0.04)",
    attachBorder:    "rgba(0,0,0,0.1)",
    inputAreaBg:     "rgba(240,253,248,0.98)",
  };
}

// ── File Attachment Preview (inside message bubble) ───────────
function FileAttachment({ file, dark }) {
  const info = getFileInfo(file.name);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setPreviewOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 12,
          background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
          cursor: "pointer", marginBottom: 8, maxWidth: 260,
          transition: "background 0.2s",
        }}
        title="Cliquer pour aperçu"
      >
        {isImage(file.name) && file.dataUrl ? (
          <img src={file.dataUrl} alt={file.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 8, background: `${info.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            {info.icon}
          </div>
        )}
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#e8f4ef" : "#0f2018", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>
            {file.name}
          </div>
          <div style={{ fontSize: 11, color: info.color, fontWeight: 600, marginTop: 2 }}>{info.label}</div>
        </div>
        <div style={{ fontSize: 16, color: dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)", flexShrink: 0 }}>›</div>
      </div>

      {previewOpen && (
        <div
          onClick={() => setPreviewOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: dark ? "#0f1f17" : "#fff",
              borderRadius: 20, overflow: "hidden",
              maxWidth: 700, width: "100%", maxHeight: "85vh",
              display: "flex", flexDirection: "column",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${info.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{info.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#e8f4ef" : "#0f2018" }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: info.color, fontWeight: 600 }}>{info.label}</div>
                </div>
              </div>
              <button onClick={() => setPreviewOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "none", color: dark ? "#9ca3af" : "#6b7280", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {isImage(file.name) && file.dataUrl ? (
                <img src={file.dataUrl} alt={file.name} style={{ width: "100%", borderRadius: 12, objectFit: "contain" }} />
              ) : file.textContent ? (
                <pre style={{ fontSize: 13, color: dark ? "#9ca3af" : "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "monospace" }}>
                  {file.textContent}
                </pre>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>{info.icon}</div>
                  <div style={{ fontSize: 15, color: dark ? "#9ca3af" : "#6b7280", lineHeight: 1.7 }}>
                    Aperçu non disponible pour <strong style={{ color: info.color }}>{info.label}</strong>.<br />
                    Le fichier a été chargé et analysé par l'IA.
                  </div>
                  <div style={{ marginTop: 16, padding: "10px 16px", borderRadius: 10, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", fontSize: 13, color: "#34d399" }}>
                    ✅ Prêt · Pose ta question sur ce document
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Pending attachment chip (in input area) ───────────────────
function AttachmentChip({ file, onRemove, dark }) {
  const info = getFileInfo(file.name);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 10px 6px 8px", borderRadius: 10,
      background: dark ? "rgba(52,211,153,0.1)" : "rgba(5,150,105,0.08)",
      border: `1px solid ${dark ? "rgba(52,211,153,0.25)" : "rgba(5,150,105,0.2)"}`,
      flexShrink: 0, maxWidth: 220,
    }}>
      {isImage(file.name) && file.dataUrl ? (
        <img src={file.dataUrl} alt="" style={{ width: 28, height: 28, borderRadius: 5, objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: 18 }}>{info.icon}</span>
      )}
      <span style={{ fontSize: 12, fontWeight: 600, color: "#34d399", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
        {file.name}
      </span>
      <button onClick={onRemove} style={{ background: "none", border: "none", color: "#5d8072", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1, flexShrink: 0 }}>✕</button>
    </div>
  );
}

// ── QuizWidget ────────────────────────────────────────────────
function QuizWidget({ questions, dark }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);
  const q = questions[idx];
  const isCorrect = selected === q?.answer;
  const letters = ["A","B","C","D"];
  const colors  = ["#818cf8","#34d399","#fbbf24","#fb923c"];

  const confirm = () => { if (selected===null) return; setConfirmed(true); if(isCorrect) setScore(s=>s+1); };
  const next = () => {
    const ns = score + (isCorrect?1:0);
    if (idx===questions.length-1) { setScore(ns); setDone(true); }
    else { setIdx(i=>i+1); setSelected(null); setConfirmed(false); }
  };

  if (done) {
    const pct = Math.round((score/questions.length)*100);
    return (
      <div style={{textAlign:"center",padding:"8px 0"}}>
        <div style={{fontSize:40,marginBottom:8}}>{pct>=80?"🏆":pct>=60?"👍":"📚"}</div>
        <div style={{fontWeight:700,color:"#e8f4ef",fontSize:16,marginBottom:4}}>{pct>=80?"Excellent !":pct>=60?"Bien joué !":"Continue !"}</div>
        <div style={{color:"#6b8a78",fontSize:13,marginBottom:16}}>Score : <span style={{color:"#34d399",fontWeight:700}}>{score}/{questions.length}</span> ({pct}%)</div>
        <button onClick={()=>{setIdx(0);setSelected(null);setConfirmed(false);setScore(0);setDone(false);setKey(k=>k+1);}} style={{padding:"8px 20px",borderRadius:10,background:"linear-gradient(135deg,#818cf8,#6366f1)",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>Refaire 🔄</button>
      </div>
    );
  }
  return (
    <div key={key}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{flex:1,height:3,background:"rgba(255,255,255,0.08)",borderRadius:2}}>
          <div style={{width:`${((idx+1)/questions.length)*100}%`,height:"100%",background:"linear-gradient(90deg,#818cf8,#34d399)",borderRadius:2,transition:"width 0.4s"}}/>
        </div>
        <span style={{fontSize:11,color:"#6b8a78",fontFamily:"monospace"}}>{idx+1}/{questions.length}</span>
      </div>
      <div style={{fontSize:14,fontWeight:600,color: dark ? "#e8f4ef" : "#0f2018",marginBottom:12,lineHeight:1.5}}>{q.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
        {q.options.map((opt,i)=>{
          let bg="rgba(255,255,255,0.04)",border="rgba(255,255,255,0.08)",color="#9ca3af";
          if(selected===i&&!confirmed){bg=`${colors[i]}22`;border=colors[i];color="#fff";}
          if(confirmed&&i===q.answer){bg="rgba(52,211,153,0.12)";border="#34d399";color="#34d399";}
          if(confirmed&&selected===i&&i!==q.answer){bg="rgba(239,68,68,0.12)";border="#ef4444";color="#ef4444";}
          return (
            <button key={i} onClick={()=>!confirmed&&setSelected(i)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,background:bg,border:`1px solid ${border}`,color,fontSize:13,textAlign:"left",cursor:confirmed?"default":"pointer",transition:"all 0.2s"}}>
              <span style={{width:22,height:22,borderRadius:5,background:`${colors[i]}22`,color:colors[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{letters[i]}</span>
              <span style={{flex:1}}>{opt}</span>
              {confirmed&&i===q.answer&&<span>✅</span>}
              {confirmed&&selected===i&&i!==q.answer&&<span>❌</span>}
            </button>
          );
        })}
      </div>
      {confirmed&&(
        <div style={{padding:"8px 12px",borderRadius:8,marginBottom:10,background:isCorrect?"rgba(52,211,153,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${isCorrect?"rgba(52,211,153,0.2)":"rgba(239,68,68,0.2)"}`,fontSize:12,color:"#9ca3af",lineHeight:1.6}}>
          <span style={{color:isCorrect?"#34d399":"#ef4444",fontWeight:600}}>{isCorrect?"✅ Correct ! ":"❌ Incorrect. "}</span>{q.explanation}
        </div>
      )}
      {!confirmed
        ?<button onClick={confirm} disabled={selected===null} style={{width:"100%",padding:"9px",borderRadius:8,background:selected===null?"rgba(255,255,255,0.04)":"linear-gradient(135deg,#818cf8,#6366f1)",color:selected===null?"#4b5563":"#fff",border:"none",cursor:selected===null?"not-allowed":"pointer",fontSize:13,fontWeight:600,transition:"all 0.2s"}}>Valider</button>
        :<button onClick={next} style={{width:"100%",padding:"9px",borderRadius:8,background:"linear-gradient(135deg,#34d399,#059669)",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>{idx===questions.length-1?"Voir score 🏆":"Suivant →"}</button>
      }
    </div>
  );
}

// ── Message ───────────────────────────────────────────────────
function Message({ msg, t, dark }) {
  const isUser = msg.role === "user";
  const mode   = MODES[msg.mode] || MODES.SOCRATIQUE;

  if (!isUser && msg.mode === "QUIZ") {
    let questions = [];
    try { questions = JSON.parse(msg.content); } catch {}
    if (questions.length) return (
      <div style={{display:"flex",gap:10,animation:"fadeUp 0.3s ease both"}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:"0 4px 12px rgba(129,140,248,0.3)"}}>📝</div>
        <div
  style={{
    flex:1,
    maxWidth: msg.mode === "QUIZ"
      ? (window.innerWidth < 768 ? "100%" : "95%")
      : "85%"
  }}
>
          <div style={{fontSize:10,color:"#818cf8",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:6}}>Quiz Interactif</div>
          <div style={{background:"rgba(129,140,248,0.06)",border:"1px solid rgba(129,140,248,0.15)",borderRadius:"4px 18px 18px 18px",padding:"14px 16px"}}>
            <QuizWidget questions={questions} dark={dark}/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:isUser?"row-reverse":"row",gap:10,alignItems:"flex-start",animation:"fadeUp 0.3s ease both"}}>
      <div style={{width:34,height:34,borderRadius:"50%",background:isUser?"linear-gradient(135deg,#374151,#1f2937)":`linear-gradient(135deg,${mode.color}cc,${mode.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:isUser?"none":`0 4px 12px ${mode.color}33`}}>
        {isUser?"👤":mode.icon}
      </div>
      <div style={{maxWidth:"78%"}}>
        {!isUser && msg.mode && <div style={{fontSize:10,color:mode.color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:5}}>{mode.label}</div>}
        <div style={{
          background: isUser ? "linear-gradient(135deg,#34d399,#059669)" : t.botBubble,
          color: isUser?"#fff":t.text,
          padding:"11px 15px",
          borderRadius:isUser?"18px 18px 4px 18px":"4px 18px 18px 18px",
          fontSize:14, lineHeight:1.75,
          border:isUser?"none":`1px solid ${t.botBubbleBorder}`,
          whiteSpace:"pre-wrap", wordBreak:"break-word",
          boxShadow:isUser?"0 4px 14px rgba(52,211,153,0.2)":"none",
          backdropFilter:"blur(8px)",
        }}>
          {isUser && msg.file && (
            <div style={{marginBottom: msg.content?.replace(/^\[MODE:.*?\]\n?/,"") ? 8 : 0}}>
              <FileAttachment file={msg.file} dark={dark}/>
            </div>
          )}
       {(() => {
  let text = msg.content ?? "";
  // Supprimer [MODE: ...]
  text = text.replace(/^\[MODE:.*?\]\n?/g, "");
  // Supprimer = au début
  text = text.replace(/^=+/, "");
  // Supprimer tool calls - formats précis seulement
  text = text.replace(/\(function=\w+>\{.*?\}<\/function>/gs, "");
  text = text.replace(/fonction=\w+>\{.*?\}<\/function>/gs, "");
  text = text.replace(/\{"name"\s*:\s*"\w+"\s*,\s*"arguments"\s*:\s*\{[^{}]*\}\}/g, "");
  return text.trim() || "...";
})()}
        </div>
        <div style={{fontSize:10,color:t.textDim,marginTop:4,textAlign:isUser?"right":"left"}}>
          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : ""}
        </div>
      </div>
    </div>
  );
}

// ── Chat ──────────────────────────────────────────────────────
export default function Chat() {
  const [conversations, setConversations]   = useState([]);
  const [activeConvId, setActiveConvId]     = useState(null);
  const [messages, setMessages]             = useState([]);
  const [input, setInput]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [uploading, setUploading]           = useState(false);
  const [pendingFile, setPendingFile]       = useState(null);
  const [currentFileName, setCurrentFileName] = useState(null);

  // ── Responsive: detect mobile ──────────────────────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    // Initialize on mount
    if (window.innerWidth < 768) setSidebarOpen(false);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const endRef  = useRef(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { dark, toggleDark } = useTheme();
  const t = getTheme(dark);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const loadConversations = async () => {
    const data = await getConversations();
    if (Array.isArray(data)) setConversations(data);
  };

  const openConversation = async (id) => {
    setActiveConvId(id);
    setPendingFile(null);
    const msgs = await getMessages(id);
    if (Array.isArray(msgs)) setMessages(msgs);

    // ← AJOUTE CES LIGNES : récupère le fichier sauvegardé
    const conv = conversations.find(c => c.id === id);
    if (conv?.file_name) {
        setCurrentFileName(conv.file_name);
        setPendingFile({ 
            name: conv.file_name, 
            dataUrl: null, 
            textContent: null 
        });
    } else {
        setCurrentFileName(null);
    }

    if (isMobile) setSidebarOpen(false);
};

  const newConversation = () => {
    setActiveConvId(null);
    setPendingFile(null);
    setCurrentFileName(null);
    setMessages([{
      role:"bot", mode:"SOCRATIQUE",
      content:`Bonjour ${user.name} ! 👋\nUploade ton cours et pose-moi une question.\nJe suis ton tuteur IA — je te guide sans jamais te donner la réponse directement !`,
    }]);
    // Close sidebar on mobile after creating a new conversation
    if (isMobile) setSidebarOpen(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileObj = { name: file.name, dataUrl: null, textContent: null };

    if (isImage(file.name)) {
      fileObj.dataUrl = await new Promise(res => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(file);
      });
    }

    if (file.name.endsWith(".txt")) {
      fileObj.textContent = await new Promise(res => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsText(file);
      });
    }

    setPendingFile(fileObj);
    setCurrentFileName(fileObj.name);

    setUploading(true);
    try {
      await uploadFile(file);
    } catch {}
    setUploading(false);

    e.target.value = "";
  };

  const send = async () => {
    if ((!input.trim() && !pendingFile) || loading) return;
    const q = input.trim();
    setInput("");

    const fileToSend = pendingFile;
    setPendingFile(null);

    const userMsg = {
      role: "user",
      content: q,
      file: fileToSend || undefined,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const data = await sendMessage(q, activeConvId, fileToSend?.name || currentFileName || null);
    setLoading(false);

    if (data.conversation_id && !activeConvId) {
      setActiveConvId(data.conversation_id);
      loadConversations();
    }

    const botMsg = {
      role:"bot", mode:data.mode,
      content: data.mode==="QUIZ" && data.questions ? JSON.stringify(data.questions) : data.text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, botMsg]);
  };

  const logout = () => { localStorage.clear(); navigate("/"); };

  const delConv = async (id, e) => {
    e.stopPropagation();
    await deleteConversation(id);
    if (activeConvId===id) { setActiveConvId(null); setMessages([]); setPendingFile(null); }
    loadConversations();
  };

  return (
    <div style={{display:"flex",height:"100vh",background:t.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif",color:t.text,overflow:"hidden",transition:"background 0.4s, color 0.3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${t.scrollThumb}; border-radius:4px; }
        textarea { font-family:'DM Sans','Segoe UI',sans-serif !important; }
        textarea:focus { outline:none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink  { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .conv-item:hover   { background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"} !important; }
        .send-btn:hover:not(:disabled) { transform:scale(1.06); box-shadow:0 0 24px rgba(52,211,153,0.4) !important; }
        .send-btn { transition:transform 0.15s, box-shadow 0.15s; }
        .upload-btn:hover:not(:disabled) { background:rgba(52,211,153,0.18) !important; }
        .upload-btn { transition:background 0.2s; }
        .toggle-btn:hover { opacity:0.85; transform:scale(1.08); }
        .toggle-btn { transition:transform 0.2s, opacity 0.2s; }
        .quick-btn:hover { background:rgba(52,211,153,0.15) !important; border-color:rgba(52,211,153,0.3) !important; }
        .quick-btn { transition:background 0.2s, border-color 0.2s; }
        .attach-chip:hover { background:rgba(52,211,153,0.18) !important; }

        /* ── Mobile overlay for sidebar ── */
        .sidebar-overlay {
          display: none;
        }
        @media (max-width: 767px) {
          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 98;
            backdrop-filter: blur(2px);
          }
          .sidebar-panel {
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 99;
            width: 80vw !important;
            max-width: 300px !important;
            box-shadow: 4px 0 32px rgba(0,0,0,0.25);
          }
          .msg-bubble-wrap {
            max-width: 90% !important;
          }
          .messages-area {
            padding: 16px 12px !important;
          }
          .input-row {
            padding: 8px 10px 12px !important;
          }
          .quick-actions {
            gap: 6px !important;
          }
          .quick-btn {
            padding: 7px 12px !important;
            font-size: 12px !important;
          }
          .empty-state {
            margin-top: 10vh !important;
          }
          .empty-title {
            font-size: 17px !important;
          }
          .empty-body {
            font-size: 13px !important;
          }
        }
      `}</style>

      {/* ── SIDEBAR OVERLAY (mobile tap-to-close) ── */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <div
          className="sidebar-panel"
          style={{
            width: 268,
            borderRight:`1px solid ${t.sidebarBorder}`,
            display:"flex",
            flexDirection:"column",
            background:t.sidebar,
            backdropFilter:"blur(16px)",
            WebkitBackdropFilter:"blur(16px)",
            transition:"background 0.4s, border-color 0.4s",
            flexShrink:0,
          }}
        >
          <div style={{padding:"16px",borderBottom:`1px solid ${t.sidebarBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#34d399,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:"0 4px 12px rgba(52,211,153,0.3)"}}>🎓</div>
              <span style={{fontWeight:800,fontSize:16,letterSpacing:"-0.02em",fontFamily:"'DM Serif Display',serif"}}>
                Study<span style={{color:"#34d399"}}>Buddy</span>
              </span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button className="toggle-btn" onClick={toggleDark} style={{width:32,height:32,borderRadius:8,background:t.toggleBg,border:`1px solid ${t.toggleBorder}`,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                {t.toggleIcon}
              </button>
              {/* Close button visible on mobile */}
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} style={{width:32,height:32,borderRadius:8,background:t.toggleBg,border:`1px solid ${t.toggleBorder}`,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:t.textMuted}}>✕</button>
              )}
            </div>
          </div>

          <div style={{padding:"12px 10px"}}>
            <button onClick={newConversation} style={{width:"100%",padding:"10px",borderRadius:12,background:"linear-gradient(135deg,rgba(52,211,153,0.12),rgba(5,150,105,0.08))",border:"1px solid rgba(52,211,153,0.22)",color:"#34d399",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              ✦ Nouvelle conversation
            </button>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"0 8px"}}>
            {conversations.length===0
              ? <div style={{fontSize:12,color:t.textDim,textAlign:"center",padding:"24px 10px",lineHeight:1.7}}>Aucune conversation<br/><span style={{fontSize:20}}>💬</span></div>
              : conversations.map(conv=>(
                <div key={conv.id} className="conv-item" onClick={()=>openConversation(conv.id)} style={{padding:"10px",borderRadius:10,cursor:"pointer",marginBottom:2,background:activeConvId===conv.id?t.convActive:"transparent",border:`1px solid ${activeConvId===conv.id?t.convActiveBorder:"transparent"}`,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.2s"}}>
                  <div style={{flex:1,overflow:"hidden"}}>
                    <div style={{fontSize:13,color:activeConvId===conv.id?"#34d399":t.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontWeight:activeConvId===conv.id?600:400}}>💬 {conv.title}</div>
                    <div style={{fontSize:10,color:t.textDim,marginTop:2}}>{new Date(conv.updated_at).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <button onClick={e=>delConv(conv.id,e)} style={{width:22,height:22,borderRadius:5,background:"transparent",border:"none",color:t.textDim,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.6}}>✕</button>
                </div>
              ))
            }
          </div>

          <div style={{padding:"12px 14px",borderTop:`1px solid ${t.sidebarBorder}`}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10,padding:"8px 10px",borderRadius:10,background:dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)",border:`1px solid ${t.sidebarBorder}`}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#34d399,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{overflow:"hidden"}}>
                <div style={{fontSize:12,color:t.text,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
                <div style={{fontSize:10,color:t.textDim,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.email}</div>
              </div>
            </div>
            <button onClick={logout} style={{width:"100%",padding:"8px",borderRadius:10,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.14)",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer"}}>
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CHAT ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"0 20px",height:58,display:"flex",alignItems:"center",borderBottom:`1px solid ${t.sidebarBorder}`,gap:12,background:t.header,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",flexShrink:0,transition:"background 0.4s, border-color 0.4s"}}>
          <button onClick={()=>setSidebarOpen(p=>!p)} style={{width:34,height:34,borderRadius:9,background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)",border:`1px solid ${t.sidebarBorder}`,color:t.textMuted,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>☰</button>
          <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 8px #34d399",animation:"blink 2s ease infinite",flexShrink:0}}/>
            <span style={{fontSize:13,color:t.textMuted,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {activeConvId ? `💬 Conversation active` : "Nouvelle conversation"}
            </span>
          </div>
          {/* Theme toggle in header on mobile (since sidebar is hidden) */}
          {isMobile && (
            <button className="toggle-btn" onClick={toggleDark} style={{marginLeft:"auto",width:32,height:32,borderRadius:8,background:t.toggleBg,border:`1px solid ${t.toggleBorder}`,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              {t.toggleIcon}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="messages-area" style={{flex:1,overflowY:"auto",padding:"24px 20px",display:"flex",flexDirection:"column",gap:18}}>
          {messages.length===0 && (
            <div className="empty-state" style={{textAlign:"center",marginTop:"18vh",animation:"fadeUp 0.5s ease both"}}>
              <div style={{fontSize:52,marginBottom:14}}>🎓</div>
              <div className="empty-title" style={{fontSize:20,fontWeight:700,color:t.emptyText,marginBottom:8,fontFamily:"'DM Serif Display',serif",letterSpacing:"-0.02em"}}>Bonjour {user.name} !</div>
              <div className="empty-body" style={{fontSize:14,color:t.textMuted,maxWidth:420,margin:"0 auto",lineHeight:1.75}}>
                Upload ton cours, pose une question,<br/>demande un résumé, un quiz ou une évaluation.
              </div>
              <div className="quick-actions" style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginTop:24}}>
                {["📋 Fais moi un résumé","📝 Je veux un quiz","🧠 Explique ce concept"].map(s=>(
                  <button key={s} className="quick-btn" onClick={()=>setInput(s.replace(/^.{2}\s/,""))} style={{padding:"9px 18px",borderRadius:22,background:dark?"rgba(52,211,153,0.07)":"rgba(5,150,105,0.07)",border:`1px solid ${dark?"rgba(52,211,153,0.18)":"rgba(5,150,105,0.2)"}`,color:"#34d399",fontSize:13,cursor:"pointer",fontWeight:500}}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg,i)=>(
  <div
    key={i}
    className="msg-bubble-wrap"
    style={{
      maxWidth:
        msg.mode === "QUIZ"
          ? (isMobile ? "100%" : "95%")
          : "78%",
      alignSelf:msg.role==="user"?"flex-end":"flex-start",
      width:"100%"
    }}
  >
              <Message msg={msg} t={t} dark={dark}/>
            </div>
          ))}
          {loading && (
            <div style={{display:"flex",gap:10,alignItems:"center",animation:"fadeUp 0.3s ease both"}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#34d399,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 4px 12px rgba(52,211,153,0.25)"}}>🤖</div>
              <div style={{background:t.botBubble,border:`1px solid ${t.botBubbleBorder}`,borderRadius:"4px 18px 18px 18px",padding:"14px 18px",display:"flex",gap:5,backdropFilter:"blur(8px)"}}>
                {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#34d399",animation:"blink 1.2s ease infinite",animationDelay:`${i*0.22}s`}}/>)}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* ── INPUT AREA ── */}
        <div style={{borderTop:`1px solid ${t.sidebarBorder}`,background:t.inputAreaBg,backdropFilter:"blur(12px)",transition:"background 0.4s, border-color 0.4s"}}>

          {pendingFile && (
            <div style={{padding:"10px 20px 0",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <AttachmentChip
                file={pendingFile}
                dark={dark}
                onRemove={()=>setPendingFile(null)}
              />
              {uploading && <span style={{fontSize:11,color:t.textMuted,animation:"blink 1s infinite"}}>⏳ Envoi en cours…</span>}
            </div>
          )}

          <div className="input-row" style={{padding:"10px 20px 16px",display:"flex",gap:10,alignItems:"flex-end"}}>
            <input ref={fileRef} type="file" accept=".pdf,.pptx,.docx,.jpg,.jpeg,.png,.txt" style={{display:"none"}} onChange={handleFileUpload}/>

            <button
              className="upload-btn"
              onClick={()=>fileRef.current?.click()}
              disabled={uploading}
              title="Joindre un fichier (PDF, PPTX, DOCX, Image…)"
              style={{
                width:44,height:44,borderRadius:12,flexShrink:0,
                background: pendingFile
                  ? "rgba(52,211,153,0.2)"
                  : dark?"rgba(52,211,153,0.1)":"rgba(5,150,105,0.08)",
                border:`1px solid ${pendingFile?"rgba(52,211,153,0.5)":"rgba(52,211,153,0.25)"}`,
                color:"#34d399",fontSize:19,
                display:"flex",alignItems:"center",justifyContent:"center",
                cursor:uploading?"not-allowed":"pointer",
              }}
            >
              {uploading?"⏳":pendingFile?"📂":"📎"}
            </button>

            <textarea
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder={pendingFile?`Pose ta question sur "${pendingFile.name}"…`:"Pose ta question… (Entrée pour envoyer)"}
              disabled={loading}
              rows={1}
              style={{
                flex:1,background:t.inputBg,border:`1px solid ${t.inputBorder}`,
                borderRadius:13,padding:"12px 15px",color:t.text,fontSize:14,
                resize:"none",lineHeight:1.55,maxHeight:130,
                transition:"border-color 0.2s, background 0.3s",
              }}
              onFocus={e=>e.target.style.borderColor="#34d399"}
              onBlur={e=>e.target.style.borderColor=t.inputBorder}
            />

            <button
              className="send-btn"
              onClick={send}
              disabled={loading||(!input.trim()&&!pendingFile)}
              style={{
                width:44,height:44,borderRadius:12,border:"none",flexShrink:0,
                cursor:loading||(!input.trim()&&!pendingFile)?"not-allowed":"pointer",
                background:loading||(!input.trim()&&!pendingFile)
                  ?(dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)")
                  :"linear-gradient(135deg,#34d399,#059669)",
                color:loading||(!input.trim()&&!pendingFile)?t.textDim:"#fff",
                fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:(!loading&&(input.trim()||pendingFile))?"0 0 18px rgba(52,211,153,0.3)":"none",
              }}
            >➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}