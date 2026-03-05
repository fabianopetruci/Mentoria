// js/core/api.js

const API_URL =
  "https://script.google.com/macros/s/AKfycbxcG8dzn2nrrVvEBtNMqG9NT6lFvXm82Q_JSxh5VRy3VdGWG9zcXc3maVFg5u_4TEHp/exec";

window.API = {
  async getAlunos() {
    const res = await fetch(`${API_URL}?resource=alunos`);
    const json = await res.json();

    return json.data || [];
  },

  async createAluno(aluno) {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        resource: "alunos",
        action: "create",
        ...aluno,
      }),
    });

    return res.json();
  },

  async updateAluno(aluno) {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        resource: "alunos",
        action: "update",
        ...aluno,
      }),
    });

    return res.json();
  },

  async deleteAluno(id) {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        resource: "alunos",
        action: "delete",
        id: id,
      }),
    });

    return res.json();
  },
};
