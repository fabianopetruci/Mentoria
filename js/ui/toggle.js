// js/ui/toggle.js

window.Theme = {
  init() {
    const toggleBtn = document.getElementById("themeToggle");
    if (!toggleBtn) return;

    const applyTheme = (isDark) => {
      document.body.classList.toggle("dark", isDark);
      toggleBtn.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    };

    const saved = localStorage.getItem("theme");
    applyTheme(saved === "dark");

    toggleBtn.addEventListener("click", () => {
      const isDark = !document.body.classList.contains("dark");
      applyTheme(isDark);
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Theme.init();
});
