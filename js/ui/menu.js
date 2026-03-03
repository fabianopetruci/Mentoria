// js/ui/menu.js

window.Menu = {
  init() {
    this.bindMenuButton();
    this.bindMenuItems();
    this.bindOutsideClick();
    this.bindEsc();
  },

  bindMenuButton() {
    const menuBtn = document.querySelector(".menu-btn");
    if (!menuBtn) return;

    menuBtn.addEventListener("click", () => this.toggle());
  },

  bindMenuItems() {
    document.querySelectorAll("#menu [data-route]").forEach((item) => {
      item.addEventListener("click", () => {
        const route = item.getAttribute("data-route");
        if (!route) return;

        this.close();
        Router.navigate(route);
      });
    });
  },

  bindOutsideClick() {
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("menu");
      const menuBtn = document.querySelector(".menu-btn");
      if (!menu || menu.classList.contains("hidden")) return;

      const insideMenu = menu.contains(e.target);
      const insideBtn = menuBtn && menuBtn.contains(e.target);

      if (!insideMenu && !insideBtn) this.close();
    });
  },

  bindEsc() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  },

  toggle() {
    const menu = document.getElementById("menu");
    if (!menu) return;
    menu.classList.toggle("hidden");
  },

  close() {
    const menu = document.getElementById("menu");
    if (!menu) return;
    menu.classList.add("hidden");
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Menu.init();
});
