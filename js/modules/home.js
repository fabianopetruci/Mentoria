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
        <h1>Mentoria</h1>
        <p>Sistema de reforço escolar</p>

        <div class="home-grid">
          ${cards
            .map(
              (c) => `
              <div class="home-card" data-route="${c.route}">
                ${c.label}
              </div>
            `,
            )
            .join("")}
        </div>
      </section>
    `;

    this.bindNavigation();
  },

  bindNavigation() {
    document.querySelectorAll("[data-route]").forEach((el) => {
      el.addEventListener("click", () => {
        const route = el.getAttribute("data-route");
        if (route && window.Router) {
          Router.navigate(route);
        }
      });
    });
  },
};
