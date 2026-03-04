// js/core/api.js

const API_URL =
  "https://script.google.com/macros/s/AKfycbxcG8dzn2nrrVvEBtNMqG9NT6lFvXm82Q_JSxh5VRy3VdGWG9zcXc3maVFg5u_4TEHp/exec";

window.API = {
  async getAlunos() {
    const res = await fetch(`${API_URL}?resource=alunos`);
    const data = await res.json();
    return data.data || [];
  },

  async createAluno(aluno) {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        resource: "alunos",
        ...aluno,
      }),
    });

    return res.json();
  },
};
