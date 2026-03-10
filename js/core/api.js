// js/core/api.js

const API_URL =
  "https://script.google.com/macros/s/AKfycbxcG8dzn2nrrVvEBtNMqG9NT6lFvXm82Q_JSxh5VRy3VdGWG9zcXc3maVFg5u_4TEHp/exec";

// ===============================
// CORE
// ===============================
async function apiGet() {
  const res = await fetch(API_URL);

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Resposta inválida: " + text);
  }
}

async function apiPost(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Resposta não é JSON: " + text);
  }
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

  async getReceitas() {
    const res = await apiGet();
    return res.Receitas || [];
  },

  async insertReceita(id, valores) {
    return await apiPost({
      action: "insert",
      aba: "Receitas",
      id,
      valores,
    });
  },

  async updateReceita(id, valores) {
    return await apiPost({
      action: "update",
      aba: "Receitas",
      id,
      valores,
    });
  },

  async deleteReceita(id) {
    return await apiPost({
      action: "delete",
      aba: "Receitas",
      id,
    });
  },

  async getDespesas() {
    const res = await apiGet();
    return res.Despesas || [];
  },

  async insertDespesa(id, valores) {
    return await apiPost({
      action: "insert",
      aba: "Despesas",
      id,
      valores,
    });
  },

  async updateDespesa(id, valores) {
    return await apiPost({
      action: "update",
      aba: "Despesas",
      id,
      valores,
    });
  },

  async deleteDespesa(id) {
    return await apiPost({
      action: "delete",
      aba: "Despesas",
      id,
    });
  },

  async getPendencias() {
    const res = await apiGet();
    return res.Pendencias || [];
  },

  async insertPendencia(id, valores) {
    return await apiPost({
      action: "insert",
      aba: "Pendencias",
      id,
      valores,
    });
  },

  async updatePendencia(id, valores) {
    return await apiPost({
      action: "update",
      aba: "Pendencias",
      id,
      valores,
    });
  },

  async deletePendencia(id) {
    return await apiPost({
      action: "delete",
      aba: "Pendencias",
      id,
    });
  },

  async getGaleria() {
    const res = await apiGet();
    return res.Galeria || [];
  },

  async insertGaleria(id, valores) {
    return await apiPost({
      action: "insert",
      aba: "Galeria",
      id,
      valores,
    });
  },

  async updateGaleria(id, valores) {
    return await apiPost({
      action: "update",
      aba: "Galeria",
      id,
      valores,
    });
  },

  async deleteGaleria(id) {
    return await apiPost({
      action: "delete",
      aba: "Galeria",
      id,
    });
  },
};
