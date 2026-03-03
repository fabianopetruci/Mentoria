// js/core/router.js

window.Router = {
  currentRoute: null,

  routes: [
    "home",
    "agenda",
    "alunos",
    "professores",
    "receitas",
    "despesas",
    "financeiro",
    "pendencias",
    "matricula",
    "galeria",
  ],

  init() {
    this.navigate("home");
  },

  /* =========================
     ROUTING
  ========================= */
  navigate(route) {
    if (!this.routes.includes(route)) return;

    this.currentRoute = route;

    // logout é ação
    if (route === "logout") {
      this.navigate("home");
      return;
    }

    // esconder todas as sections
    this.routes.forEach((r) => {
      const section = document.getElementById(r);
      if (section) section.classList.add("hidden");
    });

    // mostrar target
    const target = document.getElementById(route);
    if (target) target.classList.remove("hidden");

    // render módulo se existir
    const map = {
      home: window.Home,
      agenda: window.Agenda,
      alunos: window.Alunos,
      professores: window.Professores,
      financeiro: window.Financeiro,
      receitas: window.Receitas,
      despesas: window.Despesas,
      pendencias: window.Pendencias,
      matricula: window.Matricula,
      galeria: window.Galeria,
    };

    const mod = map[route];
    if (mod && typeof mod.render === "function") {
      mod.render();
    }
  },

  getRoute() {
    return this.currentRoute;
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Router.init();
});
