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

      this.state.data = alunos.map((a) => ({
        id: a.ID || "",
        data: [
          a.NOME,
          a.NASCIMENTO,
          a.SEXO,
          a.TURNO,
          a.ANO,
          a.ESCOLA,
          a.RESPONSAVEL,
          a.CELULAR,
          a.STATUS,
          a.FOTO_URL || "",
        ],
      }));
    } catch {
      // MOCK TEMPORÁRIO (25 registros)
      this.state.data = [
        {
          id: "ALU-1",
          data: [
            "Júlia Victoria Botentuite Duarte",
            "2013-07-29",
            "Feminino",
            "Vespertino",
            "7º ano",
            "Colégio Vinícius de Moraes",
            "Valdinar Espíndola Duarte",
            "98984210844",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-2",
          data: [
            "Maria Helena de Oliveira Garreto de Souza",
            "2014-06-03",
            "Feminino",
            "Matutino",
            "6º ano",
            "Instituto Divina Pastora",
            "Vanessa de Oliveira Coelho",
            "98991001102",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-3",
          data: [
            "Maria Alice de Oliveira Garreto de Souza",
            "2016-08-01",
            "Feminino",
            "Matutino",
            "4º ano",
            "Instituto Divina Pastora",
            "Vanessa de Oliveira Coelho",
            "98991001102",
            "Ativo",
            "",
          ],
        },

        {
          id: "ALU-4",
          data: [
            "João Miguel Ferreira Lima",
            "2012-03-18",
            "Masculino",
            "Matutino",
            "8º ano",
            "Colégio Modelo",
            "Renata Ferreira Lima",
            "98990010001",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-5",
          data: [
            "Ana Clara Souza Martins",
            "2015-11-09",
            "Feminino",
            "Vespertino",
            "5º ano",
            "Escola Santa Luzia",
            "Paulo Souza Martins",
            "98990010002",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-6",
          data: [
            "Pedro Henrique Alves Rocha",
            "2014-01-22",
            "Masculino",
            "Matutino",
            "6º ano",
            "Instituto Alfa",
            "Carla Alves Rocha",
            "98990010003",
            "Inativo",
            "",
          ],
        },
        {
          id: "ALU-7",
          data: [
            "Beatriz Oliveira Mendes",
            "2016-05-30",
            "Feminino",
            "Vespertino",
            "4º ano",
            "Colégio Horizonte",
            "Marcos Oliveira Mendes",
            "98990010004",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-8",
          data: [
            "Lucas Gabriel Santos",
            "2013-09-14",
            "Masculino",
            "Matutino",
            "7º ano",
            "Colégio Vinícius de Moraes",
            "Aline Santos",
            "98990010005",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-9",
          data: [
            "Fernanda Araújo Ribeiro",
            "2015-02-07",
            "Feminino",
            "Vespertino",
            "5º ano",
            "Instituto Divina Pastora",
            "Joana Araújo Ribeiro",
            "98990010006",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-10",
          data: [
            "Rafael Gomes Cardoso",
            "2012-12-02",
            "Masculino",
            "Matutino",
            "8º ano",
            "Escola Santa Luzia",
            "Rita Gomes Cardoso",
            "98990010007",
            "Inativo",
            "",
          ],
        },
        {
          id: "ALU-11",
          data: [
            "Isabela Barbosa Teixeira",
            "2014-08-25",
            "Feminino",
            "Vespertino",
            "6º ano",
            "Colégio Horizonte",
            "Daniel Barbosa Teixeira",
            "98990010008",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-12",
          data: [
            "Thiago Nunes Vieira",
            "2016-04-16",
            "Masculino",
            "Matutino",
            "4º ano",
            "Colégio Modelo",
            "Camila Nunes Vieira",
            "98990010009",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-13",
          data: [
            "Larissa Melo Costa",
            "2013-10-05",
            "Feminino",
            "Vespertino",
            "7º ano",
            "Instituto Alfa",
            "Patrícia Melo Costa",
            "98990010010",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-14",
          data: [
            "Matheus Castro Pereira",
            "2015-07-11",
            "Masculino",
            "Matutino",
            "5º ano",
            "Colégio Horizonte",
            "Juliana Castro Pereira",
            "98990010011",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-15",
          data: [
            "Camila Andrade Silva",
            "2012-02-28",
            "Feminino",
            "Vespertino",
            "8º ano",
            "Colégio Vinícius de Moraes",
            "Roberto Andrade Silva",
            "98990010012",
            "Inativo",
            "",
          ],
        },
        {
          id: "ALU-16",
          data: [
            "Felipe Ramos Duarte",
            "2014-05-19",
            "Masculino",
            "Matutino",
            "6º ano",
            "Escola Santa Luzia",
            "Vanessa Ramos Duarte",
            "98990010013",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-17",
          data: [
            "Letícia Teixeira Lima",
            "2016-09-03",
            "Feminino",
            "Vespertino",
            "4º ano",
            "Instituto Divina Pastora",
            "Mariana Teixeira Lima",
            "98990010014",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-18",
          data: [
            "Daniel Ferreira Gomes",
            "2013-01-10",
            "Masculino",
            "Matutino",
            "7º ano",
            "Colégio Modelo",
            "Helena Ferreira Gomes",
            "98990010015",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-19",
          data: [
            "Patrícia Martins Rocha",
            "2015-03-27",
            "Feminino",
            "Vespertino",
            "5º ano",
            "Instituto Alfa",
            "Sérgio Martins Rocha",
            "98990010016",
            "Inativo",
            "",
          ],
        },
        {
          id: "ALU-20",
          data: [
            "Eduardo Vieira Souza",
            "2012-06-06",
            "Masculino",
            "Matutino",
            "8º ano",
            "Colégio Horizonte",
            "Cláudia Vieira Souza",
            "98990010017",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-21",
          data: [
            "Vanessa Duarte Melo",
            "2014-10-21",
            "Feminino",
            "Vespertino",
            "6º ano",
            "Escola Santa Luzia",
            "Carlos Duarte Melo",
            "98990010018",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-22",
          data: [
            "Bruno Ribeiro Santos",
            "2016-12-12",
            "Masculino",
            "Matutino",
            "4º ano",
            "Colégio Vinícius de Moraes",
            "Aline Ribeiro Santos",
            "98990010019",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-23",
          data: [
            "Aline Cardoso Oliveira",
            "2013-04-04",
            "Feminino",
            "Vespertino",
            "7º ano",
            "Instituto Divina Pastora",
            "Rafael Cardoso Oliveira",
            "98990010020",
            "Ativo",
            "",
          ],
        },
        {
          id: "ALU-24",
          data: [
            "Gustavo Mendes Araujo",
            "2015-08-08",
            "Masculino",
            "Matutino",
            "5º ano",
            "Colégio Modelo",
            "Fernanda Mendes Araujo",
            "98990010021",
            "Inativo",
            "",
          ],
        },
        {
          id: "ALU-25",
          data: [
            "Juliana Pereira Nunes",
            "2012-09-26",
            "Feminino",
            "Vespertino",
            "8º ano",
            "Instituto Alfa",
            "Thiago Pereira Nunes",
            "98990010022",
            "Ativo",
            "",
          ],
        },
      ];
    }

    this.state.filteredData = [...this.state.data];
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
        console.log("Cadastrar aluno");
      });

    document
      .getElementById("aluno-btn-alterar")
      ?.addEventListener("click", () => {
        console.log("Alterar aluno");
      });

    document
      .getElementById("aluno-btn-excluir")
      ?.addEventListener("click", async () => {
        if (!this.state.selected) return;

        const ok = confirm("Excluir aluno selecionado?");
        if (!ok) return;

        await API.deleteAluno(this.state.selected.id);

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
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    if (!list || !pageInfo || !counter) return;

    const totalFiltered = this.state.filteredData.length;

    if (!totalFiltered) {
      list.innerHTML = "Nenhum aluno encontrado.";
      pageInfo.textContent = "0 / 0";
      counter.textContent = "Exibindo 0 alunos.";
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
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

    counter.textContent = `Exibindo ${slice.length} de ${totalFiltered} alunos.`;
    pageInfo.textContent = `${this.state.page} / ${totalPages}`;

    if (prevBtn) prevBtn.disabled = this.state.page <= 1;
    if (nextBtn) nextBtn.disabled = this.state.page >= totalPages;

    list.querySelectorAll(".aluno-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        this.state.selected =
          this.state.filteredData.find((x) => x.id === id) || null;

        const alterarBtn = document.getElementById("aluno-btn-alterar");
        const excluirBtn = document.getElementById("aluno-btn-excluir");

        if (alterarBtn) alterarBtn.disabled = !this.state.selected;
        if (excluirBtn) excluirBtn.disabled = !this.state.selected;

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
