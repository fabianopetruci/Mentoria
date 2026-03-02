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
              <button id="prof-prev-page">◀</button>
              <span id="prof-page-info">1 / 1</span>
              <button id="prof-next-page">▶</button>
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

    // MOCK VISUAL TEMPORÁRIO (mantido)
    if (!this.state.data.length) {
      this.state.data = [
        {
          id: "PROF-1",
          data: [
            "João Silva",
            "joao@email.com",
            "(99) 99999-1111",
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
            "(99) 98888-2222",
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
            "(99) 97777-3333",
            "Física",
            "3",
            "R$ 55,00",
            "Ter-Qui 16h-20h",
            "Inativo",
            "",
          ],
        },
        {
          id: "PROF-4",
          data: [
            "Ana Rocha",
            "ana@email.com",
            "(99) 96666-4444",
            "Letras",
            "6",
            "R$ 65,00",
            "Seg-Qua 14h-18h",
            "Ativo",
            "",
          ],
        },
        {
          id: "PROF-5",
          data: [
            "Pedro Alves",
            "pedro@email.com",
            "(99) 95555-5555",
            "Química",
            "4",
            "R$ 58,00",
            "Ter-Qui 08h-12h",
            "Ativo",
            "",
          ],
        },
        {
          id: "PROF-6",
          data: [
            "Fernanda Gomes",
            "fernanda@email.com",
            "(99) 94444-6666",
            "História",
            "7",
            "R$ 72,00",
            "Seg-Sex 10h-14h",
            "Ativo",
            "",
          ],
        },
        {
          id: "PROF-7",
          data: [
            "Rafael Mendes",
            "rafael@email.com",
            "(99) 93333-7777",
            "Biologia",
            "2",
            "R$ 50,00",
            "Qua-Sex 16h-20h",
            "Inativo",
            "",
          ],
        },
        {
          id: "PROF-8",
          data: [
            "Beatriz Costa",
            "beatriz@email.com",
            "(99) 92222-8888",
            "Geografia",
            "9",
            "R$ 75,00",
            "Seg-Qua 14h-18h",
            "Ativo",
            "",
          ],
        },
        {
          id: "PROF-9",
          data: [
            "Lucas Ribeiro",
            "lucas@email.com",
            "(99) 91111-9999",
            "Inglês",
            "5",
            "R$ 68,00",
            "Ter-Qui 14h-18h",
            "Ativo",
            "",
          ],
        },
        {
          id: "PROF-10",
          data: [
            "Juliana Martins",
            "juliana@email.com",
            "(99) 90000-0000",
            "Artes",
            "3",
            "R$ 52,00",
            "Seg-Qua 08h-12h",
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
    document.getElementById("prof-prev-page")?.addEventListener("click", () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.paint();
      }
    });

    document.getElementById("prof-next-page")?.addEventListener("click", () => {
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
    const pageInfo = document.getElementById("prof-page-info");
    const counter = document.getElementById("prof-counter");
    const prevBtn = document.getElementById("prof-prev-page");
    const nextBtn = document.getElementById("prof-next-page");

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

              <div class="prof-row prof-name">
                <span class="prof-label">Nome:</span>
                <span class="prof-value">${nome}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Email:</span>
                <span class="prof-value">${email}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Celular:</span>
                <span class="prof-value">${celular}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Formação:</span>
                <span class="prof-value">${formacao}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Experiência:</span>
                <span class="prof-value">${experiencia} anos</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Valor:</span>
                <span class="prof-value">${valor}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Disponibilidade:</span>
                <span class="prof-value">${disponibilidade}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Status:</span>
                <span class="prof-value ${
                  String(status).toLowerCase() === "ativo"
                    ? "status-ativo"
                    : "status-inativo"
                }">${status}</span>
              </div>

            </div>
          </div>
        `;
      })
      .join("");

    pageInfo.textContent = `${this.state.page} / ${totalPages}`;
    counter.textContent = `Exibindo ${slice.length} de ${this.state.data.length} professores`;

    if (prevBtn) prevBtn.disabled = this.state.page <= 1;
    if (nextBtn) nextBtn.disabled = this.state.page >= totalPages;
  },
};
