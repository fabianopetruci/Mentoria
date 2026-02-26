// js/modules/home.js

window.Home = {
  render() {
    const app = document.getElementById("app");
    if (!app) return;

    const cards = [
      { label: "Agenda", route: "agenda" },
      { label: "Alunos", route: "alunos" },
      { label: "Professores", route: "professores" },
      { label: "Financeiro", route: "financeiro" },
      { label: "Receitas", route: "receitas" },
      { label: "Despesas", route: "despesas" },
      { label: "Pendências", route: "pendencias" },
      { label: "Matrícula", route: "matricula" },
      { label: "Galeria", route: "galeria" },
    ];

    app.innerHTML = `
      <section id="home" class="home">
        <div class="app-canvas">
          <div class="home-grid">
            ${cards
              .map(
                (c) => `
                <div class="home-card" data-route="${c.route}">
                  <span class="home-card__label">${c.label}</span>
                </div>
              `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;

    this.bindNavigation();
  },

  bindNavigation() {
    document.querySelectorAll(".home-card").forEach((card) => {
      card.addEventListener("click", () => {
        const route = card.getAttribute("data-route");
        if (route && window.Router) {
          Router.navigate(route);
        }
      });
    });
  },
};
