// js/modules/professores.js

window.Professores = {
  state: {
    page: 1,
    perPage: 3,
    selected: null,
    data: [],
  },

  async render() {
    const el = document.getElementById("professores");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">

        <div class="module-header">
          <div class="module-title">Professores</div>
        </div>

        <div class="module-body">

          <div class="professores-container">

            <div class="professores-actions-top">
              <button class="btn btn-primary" id="prof-btn-cadastrar">Cadastrar</button>
              <button class="btn btn-warning" id="prof-btn-alterar" disabled>Alterar</button>
              <button class="btn btn-danger" id="prof-btn-excluir" disabled>Excluir</button>
              <button class="btn btn-print" id="prof-btn-imprimir">Imprimir</button>
              <button class="btn btn-outline" id="prof-btn-filtros">Filtros</button>
            </div>

            <div class="prof-filtros hidden" id="prof-filtros">
              <div class="prof-filtros-grid">
                <select>
                  <option value="">Turno</option>
                  <option>Matutino</option>
                  <option>Vespertino</option>
                </select>

                <input type="text" placeholder="Formação">

                <select>
                  <option value="">Status</option>
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>
            </div>

            <div id="professores-list"></div>

            <div class="professores-counter" id="prof-counter"></div>

            <div class="professores-pagination">
              <button id="prev-page">◀</button>
              <span id="page-info">1 / 1</span>
              <button id="next-page">▶</button>
            </div>

          </div>

        </div>
      </div>
    `;

    await this.load();
    this.bindUI();
  },

  async load() {
    const list = document.getElementById("professores-list");
    if (!list) return;

    try {
      const res = await Api.getAll();
      this.state.data = res?.Professores || [];
    } catch {
      this.state.data = [];
    }

    // MOCK VISUAL TEMPORÁRIO
    if (!this.state.data.length) {
      this.state.data = [
        {
          id: "PROF-1",
          data: [
            "João Silva",
            "joao@email.com",
            "(99) 99999-9999",
            "Licenciatura em Matemática",
            "5",
            "R$ 60,00",
            "Seg-Sex 14h-18h",
            "Ativo",
            "",
          ],
        },
        {
          id: "PROF-2",
          data: [
            "Maria Souza",
            "maria@email.com",
            "(99) 98888-8888",
            "Pedagogia",
            "8",
            "R$ 70,00",
            "Seg-Qua 08h-12h",
            "Ativo",
            "",
          ],
        },
        {
          id: "PROF-3",
          data: [
            "Carlos Lima",
            "carlos@email.com",
            "(99) 97777-7777",
            "Física",
            "3",
            "R$ 55,00",
            "Ter-Qui 16h-20h",
            "Inativo",
            "",
          ],
        },
      ];
    }

    this.state.page = 1;
    this.state.selected = null;
    this.paint();
  },

  bindUI() {
    document.getElementById("prev-page")?.addEventListener("click", () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.paint();
      }
    });

    document.getElementById("next-page")?.addEventListener("click", () => {
      const total = Math.max(
        1,
        Math.ceil(this.state.data.length / this.state.perPage),
      );
      if (this.state.page < total) {
        this.state.page++;
        this.paint();
      }
    });

    document
      .getElementById("prof-btn-filtros")
      ?.addEventListener("click", () => {
        document.getElementById("prof-filtros")?.classList.toggle("hidden");
      });

    document
      .getElementById("prof-btn-imprimir")
      ?.addEventListener("click", () => window.print());
  },

  paint() {
    const list = document.getElementById("professores-list");
    const pageInfo = document.getElementById("page-info");
    const counter = document.getElementById("prof-counter");
    if (!list || !pageInfo || !counter) return;

    const totalPages = Math.max(
      1,
      Math.ceil(this.state.data.length / this.state.perPage),
    );

    const start = (this.state.page - 1) * this.state.perPage;
    const slice = this.state.data.slice(start, start + this.state.perPage);

    list.innerHTML = slice
      .map((item) => {
        const { id, data } = item;

        const [
          nome,
          email,
          celular,
          formacao,
          experiencia,
          valor,
          disponibilidade,
          status,
          fotoUrl,
        ] = data;

        const foto = fotoUrl || "assets/img/teachers.png";

        return `
          <div class="prof-card" data-id="${id}">
            <div class="prof-foto">
              <img src="${foto}" alt="Professor">
            </div>

            <div class="prof-info">
              <div class="prof-name">${nome}</div>
              <div>${email}</div>
              <div>${celular}</div>
              <div>${formacao}</div>
              <div>${experiencia} anos</div>
              <div>${valor}</div>
              <div>${disponibilidade}</div>
              <div class="${String(status).toLowerCase() === "ativo" ? "status-ativo" : "status-inativo"}">${status}</div>
            </div>
          </div>
        `;
      })
      .join("");

    pageInfo.textContent = `${this.state.page} / ${totalPages}`;
    counter.textContent = `Exibindo ${slice.length} de ${this.state.data.length} professores`;
  },
};
