// js/modules/alunos.js

window.Alunos = {
  state: {
    page: 1,
    perPage: 3,
    selected: null,
    data: [],
    filteredData: [],
    filters: {
      status: "",
      sexo: "",
      ano: "",
      escola: "",
      turno: "",
    },
  },

  async render() {
    const el = document.getElementById("alunos");
    if (!el) return;

    el.innerHTML = `
      <div class="alunos-container">

        <div class="alunos-actions-top">
          <button class="btn btn-primary" id="aluno-btn-cadastrar">Cadastrar</button>
          <button class="btn btn-warning" id="aluno-btn-alterar" disabled>Alterar</button>
          <button class="btn btn-danger" id="aluno-btn-excluir" disabled>Excluir</button>
          <button class="btn btn-secondary" id="aluno-btn-imprimir">Imprimir</button>
          <button class="btn btn-outline" id="aluno-btn-filtros">Filtros</button>
        </div>

        <div id="aluno-filtros-panel" class="aluno-filtros hidden">
          <div class="aluno-filtros-grid">

            <select id="f-status">
              <option value="">Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>

            <select id="f-sexo">
              <option value="">Sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>

            <input id="f-ano" placeholder="Ano escolar">
            <input id="f-escola" placeholder="Escola">
            <select id="f-turno">
              <option value="">Turno</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
            </select>

            <button class="btn btn-primary" id="f-aplicar">Aplicar</button>
            <button class="btn btn-secondary" id="f-limpar">Limpar</button>

          </div>
        </div>

        <div id="alunos-list">Carregando alunos...</div>

        <div class="alunos-counter" id="alunos-counter"></div>

        <div class="alunos-pagination">
          <button id="prev-page">◀</button>
          <span id="page-info">1 / 1</span>
          <button id="next-page">▶</button>
        </div>

      </div>
    `;

    await this.load();
    this.bindUI();
  },

  async load() {
    const list = document.getElementById("alunos-list");
    if (!list) return;

    try {
      const res = await Api.getAll();
      this.state.data = res.Alunos || [];
      this.state.filteredData = [...this.state.data];
      this.state.page = 1;
      this.state.selected = null;
      this.paint();
    } catch {
      list.innerHTML = "Erro ao carregar alunos.";
    }
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
        Math.ceil(this.state.filteredData.length / this.state.perPage),
      );
      if (this.state.page < total) {
        this.state.page++;
        this.paint();
      }
    });

    document
      .getElementById("aluno-btn-filtros")
      ?.addEventListener("click", () => {
        document
          .getElementById("aluno-filtros-panel")
          ?.classList.toggle("hidden");
      });

    document.getElementById("f-aplicar")?.addEventListener("click", () => {
      this.applyFilters();
    });

    document.getElementById("f-limpar")?.addEventListener("click", () => {
      this.clearFilters();
    });
  },

  applyFilters() {
    this.state.filters = {
      status: this.v("f-status"),
      sexo: this.v("f-sexo"),
      ano: this.v("f-ano"),
      escola: this.v("f-escola"),
      turno: this.v("f-turno"),
    };

    this.state.filteredData = this.state.data.filter((item) => {
      const d = item.data;

      return (
        (!this.state.filters.status || d[8] === this.state.filters.status) &&
        (!this.state.filters.sexo || d[2] === this.state.filters.sexo) &&
        (!this.state.filters.ano || d[4]?.includes(this.state.filters.ano)) &&
        (!this.state.filters.escola ||
          d[5]
            ?.toLowerCase()
            .includes(this.state.filters.escola.toLowerCase())) &&
        (!this.state.filters.turno || d[3] === this.state.filters.turno)
      );
    });

    this.state.page = 1;
    this.paint();
  },

  clearFilters() {
    this.state.filters = {
      status: "",
      sexo: "",
      ano: "",
      escola: "",
      turno: "",
    };

    document
      .querySelectorAll(
        "#aluno-filtros-panel input, #aluno-filtros-panel select",
      )
      .forEach((el) => (el.value = ""));

    this.state.filteredData = [...this.state.data];
    this.state.page = 1;
    this.paint();
  },

  paint() {
    const list = document.getElementById("alunos-list");
    const pageInfo = document.getElementById("page-info");
    const counter = document.getElementById("alunos-counter");
    if (!list || !pageInfo || !counter) return;

    const totalFiltered = this.state.filteredData.length;

    if (!totalFiltered) {
      list.innerHTML = "Nenhum aluno encontrado.";
      pageInfo.textContent = "0 / 0";
      counter.textContent = "Exibindo 0 alunos.";
      return;
    }

    const totalPages = Math.max(
      1,
      Math.ceil(totalFiltered / this.state.perPage),
    );

    const start = (this.state.page - 1) * this.state.perPage;
    const slice = this.state.filteredData.slice(
      start,
      start + this.state.perPage,
    );

    list.innerHTML = slice
      .map((item) => {
        const { id, data } = item;
        const selectedClass =
          this.state.selected?.id === id ? " aluno-card-selected" : "";

        const [
          nome,
          nascimento,
          sexo,
          turno,
          ano,
          escola,
          responsavel,
          celular,
          status,
          fotoUrl,
        ] = data;

        const foto = fotoUrl || "assets/img/students.png";

        return `
          <div class="aluno-card${selectedClass}" data-id="${id}">
            <div class="aluno-foto">
              <img src="${foto}" alt="Aluno">
            </div>

            <div class="aluno-info">
              <div class="aluno-row aluno-name">
                <span class="aluno-label">Nome:</span>
                <span class="aluno-value">${nome}</span>
              </div>

              <div class="aluno-row">
                <span class="aluno-label">Nascimento:</span>
                <span class="aluno-value">${this.formatDate(nascimento)}</span>
                <span class="aluno-label">Sexo:</span>
                <span class="aluno-value">${sexo}</span>
              </div>

              <div class="aluno-row">
                <span class="aluno-label">Turno:</span>
                <span class="aluno-value">${turno}</span>
                <span class="aluno-label">Ano:</span>
                <span class="aluno-value">${ano}</span>
                <span class="aluno-label">Escola:</span>
                <span class="aluno-value">${escola}</span>
              </div>

              <div class="aluno-row">
                <span class="aluno-label">Responsável:</span>
                <span class="aluno-value">${responsavel}</span>
                <span class="aluno-label">Celular:</span>
                <span class="aluno-value">${celular}</span>
                <span class="aluno-label">Status:</span>
                <span class="aluno-value ${String(status).toLowerCase() === "ativo" ? "status-ativo" : "status-inativo"}">
                  ${status}
                </span>
              </div>

            </div>
          </div>
        `;
      })
      .join("");

    counter.textContent = `Exibindo ${slice.length} de ${totalFiltered} alunos.`;

    pageInfo.textContent = `${this.state.page} / ${totalPages}`;

    list.querySelectorAll(".aluno-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        this.state.selected =
          this.state.filteredData.find((x) => x.id === id) || null;
        this.paint();
      });
    });
  },

  v(id) {
    return (document.getElementById(id)?.value || "").trim();
  },

  formatDate(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
    }
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? String(value) : dt.toLocaleDateString("pt-BR");
  },
};
