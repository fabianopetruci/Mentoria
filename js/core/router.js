// js/core/router.js

window.Router = {
  currentRoute: null,

  init() {
    this.bindHeaderActions();
    this.navigate("home");
  },

  bindHeaderActions() {
    // Logo -> Home
    const homeBtn = document.getElementById("btn-home");
    if (homeBtn) {
      homeBtn.style.cursor = "pointer";
      homeBtn.addEventListener("click", () => this.navigate("home"));
    }

    // Theme toggle (persistência simples)
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
  },

  navigate(route) {
    this.currentRoute = route;
    console.log("[Router] route:", route);

    if (route === "home" && window.Home?.render) {
      Home.render();
    }
  },

  getRoute() {
    return this.currentRoute;
  },
};

// init
document.addEventListener("DOMContentLoaded", () => {
  Router.init();
});
