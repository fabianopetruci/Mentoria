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
    this.bindHeaderActions();
    this.bindMenuActions();
    this.setConnectionStatus(false);
    this.navigate("home");
  },

  /* =========================
     HEADER
  ========================= */
  bindHeaderActions() {
    const homeBtn = document.getElementById("btn-home");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => this.navigate("home"));
    }

    const toggleBtn = document.getElementById("themeToggle");

    const applyTheme = (isDark) => {
      document.body.classList.toggle("dark", isDark);
      if (toggleBtn) toggleBtn.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    };

    const saved = localStorage.getItem("theme");
    applyTheme(saved === "dark");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const isDark = !document.body.classList.contains("dark");
        applyTheme(isDark);
      });
    }

    const menuBtn = document.querySelector(".menu-btn");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => this.toggleMenu());
    }
  },

  /* =========================
     MENU
  ========================= */
  bindMenuActions() {
    document.querySelectorAll("#menu [data-route]").forEach((item) => {
      item.addEventListener("click", () => {
        const route = item.getAttribute("data-route");
        if (!route) return;
        this.closeMenu();
        this.navigate(route);
      });
    });

    document.addEventListener("click", (e) => {
      const menu = document.getElementById("menu");
      const menuBtn = document.querySelector(".menu-btn");
      if (!menu || menu.classList.contains("hidden")) return;

      const insideMenu = menu.contains(e.target);
      const insideBtn = menuBtn && menuBtn.contains(e.target);

      if (!insideMenu && !insideBtn) this.closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeMenu();
    });
  },

  toggleMenu() {
    const menu = document.getElementById("menu");
    if (!menu) return;
    menu.classList.toggle("hidden");
  },

  closeMenu() {
    const menu = document.getElementById("menu");
    if (!menu) return;
    menu.classList.add("hidden");
  },

  /* =========================
     FOOTER STATUS
  ========================= */
  setConnectionStatus(isConnected) {
    const dot = document.getElementById("connDot");
    const text = document.getElementById("connText");
    if (!dot || !text) return;

    dot.classList.toggle("is-connected", !!isConnected);
    dot.classList.toggle("is-disconnected", !isConnected);
    text.textContent = isConnected ? "Conectado" : "Desconectado";
  },

  /* =========================
     ROUTING
  ========================= */
  navigate(route) {
    if (!this.routes.includes(route)) return;

    this.currentRoute = route;

    // logout é ação
    if (route === "logout") {
      this.setConnectionStatus(false);
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
