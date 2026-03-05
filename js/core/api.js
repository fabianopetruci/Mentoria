// js/core/api.js

const API_URL =
  "https://script.google.com/macros/s/AKfycbxcG8dzn2nrrVvEBtNMqG9NT6lFvXm82Q_JSxh5VRy3VdGWG9zcXc3maVFg5u_4TEHp/exec";

// ===============================
// CORE
// ===============================
async function apiGet() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Falha no GET");
  return await res.json();
}

async function apiPost(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload), // SEM headers (Apps Script exige assim)
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Resposta não é JSON: " + text);
  }
}

// ===============================
// FILE → DATAURL
// ===============================
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

// ===============================
// API PUBLICA
// ===============================
window.API = {
  async getAlunos() {
    const res = await apiGet();
    return res.Alunos || [];
  },

  async insertAluno(id, valores) {
    return await apiPost({
      action: "insert",
      aba: "Alunos",
      id,
      valores,
    });
  },

  async updateAluno(id, valores) {
    return await apiPost({
      action: "update",
      aba: "Alunos",
      id,
      valores,
    });
  },

  async deleteAluno(id) {
    return await apiPost({
      action: "delete",
      aba: "Alunos",
      id,
    });
  },

  async uploadAlunoFoto(file, alunoId) {
    const dataUrl = await fileToDataUrl(file);

    const res = await apiPost({
      action: "uploadFoto",
      dataUrl,
      alunoId,
    });

    if (res.status !== "ok") {
      throw new Error(res.message || "Falha no upload");
    }

    return res;
  },
};
