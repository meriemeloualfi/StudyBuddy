const API_URL = "http://127.0.0.1:8000";

// ── Helper ────────────────────────────────────────────
const getHeaders = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("token") && {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }),
});

// ── Auth ──────────────────────────────────────────────
export const register = async (name, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders(),
  });
  return res.json();
};

// ── Conversations ─────────────────────────────────────
export const getConversations = async () => {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const getMessages = async (conversationId) => {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const deleteConversation = async (conversationId) => {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.json();
};

// ── Chat ──────────────────────────────────────────────
export const sendMessage = async (question, conversationId = null, fileName = null) => {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ question, conversation_id: conversationId, file_name: fileName }),
  });
  return res.json();
};

// ── Upload Fichier ────────────────────────────────────
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      // ⚠️ PAS de Content-Type ici — le browser le gère automatiquement pour FormData
      ...(localStorage.getItem("token") && {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    },
    body: formData,
  });
  return res.json();
};