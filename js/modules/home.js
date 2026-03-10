// js/modules/home.js

window.Home = {
  async render() {
    const homeSection = document.getElementById("home");
    if (!homeSection) return;

    const pendenciasBadge = await this.getPendenciasFinanceirasCount();

    const tiles = [
      { label: "AGENDA", route: "agenda", img: "agenda.png" },
      { label: "RECEITAS", route: "receitas", img: "cash_inflow.png" },
      { label: "DESPESAS", route: "despesas", img: "cash_outflow.png" },
      {
        label: "PENDÊNCIAS / LEMBRETES",
        route: "pendencias",
        img: "tasks.png",
        badge: pendenciasBadge,
      },
      { label: "ALUNOS", route: "alunos", img: "students.png" },
      { label: "PROFESSORES", route: "professores", img: "teachers.png" },
      { label: "CONTRATO", route: "contrato", img: "contract.png" },
      { label: "FLUXO DE CAIXA", route: "financeiro", img: "cash_flow.png" },
      { label: "MURAL DE FOTOS", route: "galeria", img: "gallery.png" },
      { label: "RECIBOS", route: "recibos", img: "receipt.png" },
    ];

    homeSection.innerHTML = `
      <div class="home-grid">
        ${tiles
          .map(
            (t) => `
            <div class="home-tile" data-route="${t.route}">
              ${t.badge ? `<span class="home-badge">${t.badge}</span>` : ""}
              <img class="home-img" src="./assets/img/${t.img}" alt="${t.label}">
              <span class="home-label">${t.label}</span>
            </div>
          `,
          )
          .join("")}
      </div>
    `;

    this.bindActions();
  },

  async getPendenciasFinanceirasCount() {
    try {
      const despesas = await API.getDespesas();

      return despesas.filter((d) => {
        const status = String(d?.data?.[3] || "")
          .trim()
          .toLowerCase();
        return status === "a pagar";
      }).length;
    } catch (err) {
      console.error("Erro ao carregar badge de pendências:", err);
      return 0;
    }
  },

  bindActions() {
    document.querySelectorAll(".home-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        const route = tile.getAttribute("data-route");
        if (route) Router.navigate(route);
      });
    });
  },
};
