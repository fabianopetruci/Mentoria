// js/ui/header.js

window.Header = {
  init() {
    this.bindHomeButton();
  },

  bindHomeButton() {
    const homeBtn = document.getElementById("btn-home");
    if (!homeBtn) return;

    homeBtn.addEventListener("click", () => {
      Router.navigate("home");
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Header.init();
});
