// js/modules/galeria.js

window.Galeria = {
  state: {
    index: 0,
    selected: null,
    data: [],
  },

  async render() {
    const el = document.getElementById("galeria");
    if (!el) return;

    el.innerHTML = `
      <div class="galeria-container">

        <div class="galeria-actions-top">
          <button class="btn btn-primary" id="gal-btn-cadastrar">Cadastrar</button>
          <button class="btn btn-warning" id="gal-btn-alterar" disabled>Alterar</button>
          <button class="btn btn-danger" id="gal-btn-excluir" disabled>Excluir</button>
          <button class="btn btn-print" id="gal-btn-imprimir">Imprimir</button>
        </div>

        <div id="galeria-view"></div>

        <div class="galeria-pagination">
          <button id="gal-prev" class="btn-arrow">◀</button>
          <span id="gal-page-info">0 / 0</span>
          <button id="gal-next" class="btn-arrow">▶</button>
        </div>

      </div>
    `;

    this.loadMock();
    this.bindUI();
  },

  loadMock() {
    // MOCK INTERNO
    this.state.data = [
      {
        id: "GAL-1",
        data: [
          "https://images.unsplash.com/photo-1588072432836-e10032774350",
          "Aula de reforço - terça feira",
        ],
      },
      {
        id: "GAL-2",
        data: [
          "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b",
          "Atividade em grupo",
        ],
      },
    ];

    this.state.index = 0;
    this.state.selected = this.state.data[0];
    this.paint();
  },

  bindUI() {
    document.getElementById("gal-prev")?.addEventListener("click", () => {
      if (this.state.index > 0) {
        this.state.index--;
        this.paint();
      }
    });

    document.getElementById("gal-next")?.addEventListener("click", () => {
      if (this.state.index < this.state.data.length - 1) {
        this.state.index++;
        this.paint();
      }
    });

    document
      .getElementById("gal-btn-imprimir")
      ?.addEventListener("click", () => window.print());
  },

  paint() {
    const view = document.getElementById("galeria-view");
    const pageInfo = document.getElementById("gal-page-info");

    const total = this.state.data.length;

    if (!total) {
      view.innerHTML = `<div class="galeria-empty">Nenhuma foto cadastrada.</div>`;
      pageInfo.textContent = "0 / 0";
      return;
    }

    const item = this.state.data[this.state.index];
    this.state.selected = item;

    const url = item.data[0];
    const legenda = item.data[1];

    view.innerHTML = `
      <div class="galeria-card">
        <div class="galeria-frame">
          <img class="galeria-img" src="${url}" alt="Foto">
        </div>
        <div class="galeria-caption">${legenda}</div>
      </div>
    `;

    pageInfo.textContent = `${this.state.index + 1} / ${total}`;
  },
};
