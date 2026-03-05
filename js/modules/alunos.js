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
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">ALUNOS</h1>
        </div>

        <div class="module-body">

          <div class="alunos-container">

            <div class="alunos-actions-top">
              <button class="btn btn-primary" id="aluno-btn-cadastrar">Cadastrar</button>
              <button class="btn btn-warning" id="aluno-btn-alterar" disabled>Alterar</button>
              <button class="btn btn-danger" id="aluno-btn-excluir" disabled>Excluir</button>
              <button class="btn btn-print" id="aluno-btn-imprimir">Imprimir</button>
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
              <button class="btn-arrow" id="prev-page">◀</button>
              <span class="page-label" id="page-info">1 / 1</span>
              <button class="btn-arrow" id="next-page">▶</button>
            </div>

          </div>

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
      const alunos = await API.getAlunos();

      this.state.data = alunos;
      this.state.filteredData = [...this.state.data];
      this.state.page = 1;
      this.state.selected = null;

      this.paint();
    } catch (err) {
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

    document
      .getElementById("aluno-btn-cadastrar")
      ?.addEventListener("click", () => {
        this.openForm();
      });

    document
      .getElementById("aluno-btn-alterar")
      ?.addEventListener("click", () => {
        if (this.state.selected) {
          this.openForm(this.state.selected);
        }
      });

    document
      .getElementById("aluno-btn-excluir")
      ?.addEventListener("click", async () => {
        if (!this.state.selected) return;

        if (!confirm("Excluir aluno selecionado?")) return;

        await API.deleteAluno(this.state.selected.id);

        await this.load();
      });

    document
      .getElementById("aluno-btn-imprimir")
      ?.addEventListener("click", () => {
        window.print();
      });
  },

  openForm(selected = null) {
    const isEdit = !!selected;
    const d = selected ? selected.data : [];

    const fotoAtual = d?.[9] || "";

    Modal.open(`
      <h3>${isEdit ? "Alterar aluno" : "Cadastrar aluno"}</h3>

      <div class="form-group">
        <label>Nome</label>
        <input id="a-nome" value="${d?.[0] || ""}">
      </div>

      <div class="form-group">
        <label>Foto</label>
        <input type="file" id="a-foto" accept="image/*">
      </div>

      <div class="form-group">
        <label>Nascimento</label>
        <input type="date" id="a-nasc" value="${d?.[1] || ""}">
      </div>

      <div class="form-group">
        <label>Sexo</label>
        <select id="a-sexo">
          <option value="Masculino" ${d?.[2] === "Masculino" ? "selected" : ""}>Masculino</option>
          <option value="Feminino" ${d?.[2] === "Feminino" ? "selected" : ""}>Feminino</option>
        </select>
      </div>

      <div class="form-group">
        <label>Turno</label>
        <select id="a-turno">
          <option value="Matutino" ${d?.[3] === "Matutino" ? "selected" : ""}>Matutino</option>
          <option value="Vespertino" ${d?.[3] === "Vespertino" ? "selected" : ""}>Vespertino</option>
        </select>
      </div>

      <div class="form-group">
        <label>Ano</label>
        <input id="a-ano" value="${d?.[4] || ""}">
      </div>

      <div class="form-group">
        <label>Escola</label>
        <input id="a-escola" value="${d?.[5] || ""}">
      </div>

      <div class="form-group">
        <label>Responsável</label>
        <input id="a-resp" value="${d?.[6] || ""}">
      </div>

      <div class="form-group">
        <label>Celular</label>
        <input id="a-cel" value="${d?.[7] || ""}">
      </div>

      <div class="form-group">
        <label>Status</label>
        <select id="a-status">
          <option value="Ativo" ${d?.[8] === "Ativo" ? "selected" : ""}>Ativo</option>
          <option value="Inativo" ${d?.[8] === "Inativo" ? "selected" : ""}>Inativo</option>
        </select>
      </div>

      <button class="btn btn-primary" id="a-salvar">
        ${isEdit ? "Salvar alterações" : "Cadastrar"}
      </button>
    `);

    document.getElementById("a-salvar")?.addEventListener("click", async () => {
      const nome = this.v("a-nome");
      const nasc = this.v("a-nasc");
      const sexo = this.v("a-sexo");
      const turno = this.v("a-turno");
      const ano = this.v("a-ano");
      const escola = this.v("a-escola");
      const resp = this.v("a-resp");
      const cel = this.v("a-cel");
      const status = this.v("a-status");

      if (!nome) {
        alert("Preencha o nome.");
        return;
      }

      let fotoUrl = fotoAtual;

      const file = document.getElementById("a-foto")?.files?.[0];

      if (file) {
        const up = await API.uploadAlunoFoto(file, selected?.id);
        fotoUrl = up.fotoUrl;
      }

      const valores = [
        nome,
        nasc,
        sexo,
        turno,
        ano,
        escola,
        resp,
        cel,
        status,
        fotoUrl,
      ];

      if (isEdit) {
        await API.updateAluno(selected.id, valores);
      } else {
        const id = "ALU-" + Date.now();
        await API.insertAluno(id, valores);
      }

      Modal.close();

      await this.load();
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

    const total = this.state.filteredData.length;

    if (!total) {
      list.innerHTML = "Nenhum aluno encontrado.";
      pageInfo.textContent = "0 / 0";
      counter.textContent = "Exibindo 0 alunos.";
      return;
    }

    const totalPages = Math.ceil(total / this.state.perPage);

    const start = (this.state.page - 1) * this.state.perPage;
    const slice = this.state.filteredData.slice(
      start,
      start + this.state.perPage,
    );

    list.innerHTML = slice
      .map((item) => {
        const { id, data } = item;

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

        const selectedClass =
          this.state.selected?.id === id ? " aluno-card-selected" : "";

        return `
          <div class="aluno-card${selectedClass}" data-id="${id}">
            <div class="aluno-foto">
              <img src="${foto}">
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
                <span class="aluno-value ${
                  String(status).toLowerCase() === "ativo"
                    ? "status-ativo"
                    : "status-inativo"
                }">
                  ${status}
                </span>
              </div>

            </div>
          </div>
        `;
      })
      .join("");

    counter.textContent = `Exibindo ${slice.length} de ${total} alunos.`;
    pageInfo.textContent = `${this.state.page} / ${totalPages}`;

    list.querySelectorAll(".aluno-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        this.state.selected =
          this.state.filteredData.find((x) => x.id === id) || null;

        document.getElementById("aluno-btn-alterar").disabled =
          !this.state.selected;
        document.getElementById("aluno-btn-excluir").disabled =
          !this.state.selected;

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
