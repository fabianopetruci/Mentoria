// js/core/router.js

window.Router = {
  currentRoute: null,

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
    // Logo -> Home
    const homeBtn = document.getElementById("btn-home");
    if (homeBtn) {
      homeBtn.style.cursor = "pointer";
      homeBtn.addEventListener("click", () => this.navigate("home"));
    }

    // Theme toggle
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

    // Hamburger
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

    // fechar ao clicar fora
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("menu");
      const menuBtn = document.querySelector(".menu-btn");
      if (!menu || menu.classList.contains("hidden")) return;

      const insideMenu = menu.contains(e.target);
      const insideBtn = menuBtn && menuBtn.contains(e.target);

      if (!insideMenu && !insideBtn) this.closeMenu();
    });

    // ESC fecha
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
    this.currentRoute = route;

    // Logout (ação especial)
    if (route === "logout") {
      this.setConnectionStatus(false);
      this.navigate("home");
      return;
    }

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
