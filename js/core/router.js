// js/core/router.js

window.Router = {
  currentRoute: null,

  init() {
    // rota inicial
    this.navigate("home");
  },

  navigate(route) {
    this.currentRoute = route;
    console.log("[Router] route:", route);
  },

  getRoute() {
    return this.currentRoute;
  },
};

// init
document.addEventListener("DOMContentLoaded", () => {
  Router.init();
});
