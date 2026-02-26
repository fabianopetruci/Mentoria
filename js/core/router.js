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
