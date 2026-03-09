window.Receitas = {
  state: {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    page: 1,
    perPage: 4,
    data: [],
    selected: null,
  },

  async render() {
    const el = document.getElementById("receitas");
    if (!el) return;

    const periodLabel = this.formatPeriod(
      this.state.currentMonth,
      this.state.currentYear,
    );

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">RECEITAS</h1>
        </div>

        <div class="module-body">

          <div class="receitas-actions-top">
            <button class="btn btn-primary" id="rec-btn-cadastrar">Cadastrar</button>
            <button class="btn btn-warning" id="rec-btn-alterar" disabled>Alterar</button>
            <button class="btn btn-danger" id="rec-btn-excluir" disabled>Excluir</button>
            <button class="btn btn-print" id="rec-btn-imprimir">Imprimir</button>
            <button class="btn btn-outline" id="rec-btn-periodo">Escolher período</button>
          </div>

          <div id="receitas-list">Carregando receitas...</div>

          <div class="receitas-pagination">

            <div class="receitas-page-nav-left">
              <button class="btn-arrow" id="rec-prev-page">◀</button>
              <span class="page-label">Anterior</span>
            </div>

            <div class="receitas-month-nav">
              <button class="btn-arrow" id="rec-prev-month">◀</button>
              <span class="receitas-page" id="rec-period-label">${periodLabel}</span>
              <button class="btn-arrow" id="rec-next-month">▶</button>
            </div>

            <div class="receitas-page-nav-right">
              <span class="page-label">Próximo</span>
              <button class="btn-arrow" id="rec-next-page">▶</button>
            </div>

          </div>

        </div>
      </div>
    `;

    await this.load();
    this.paint();
    this.bindEvents();
  },

  async load() {
    try {
      const receitas = await API.getReceitas();

      this.state.data = receitas.map((r) => ({
        id: r.id,
        aluno: r.data[0],
        tipo: r.data[1],
        data: r.data[2],
        devido: Number(r.data[3] || 0),
        pago: Number(r.data[4] || 0),
        saldo: Number(r.data[5] || 0),
      }));

      this.state.selected = null;
      this.state.page = 1;
    } catch (err) {
      console.error("Erro ao carregar receitas", err);
      this.state.data = [];
    }
  },

  bindEvents() {
    document
      .getElementById("rec-btn-cadastrar")
      ?.addEventListener("click", () => {
        this.openForm();
      });

    document
      .getElementById("rec-btn-alterar")
      ?.addEventListener("click", () => {
        if (this.state.selected) this.openForm(this.state.selected);
      });

    document
      .getElementById("rec-btn-excluir")
      ?.addEventListener("click", async () => {
        if (!this.state.selected) return;

        if (!confirm("Excluir receita selecionada?")) return;

        await API.deleteReceita(this.state.selected.id);

        await this.load();
        this.paint();
      });

    document
      .getElementById("rec-btn-imprimir")
      ?.addEventListener("click", () => {
        Print.section("receitas-list", "Relatório de receitas");
      });

    document.getElementById("rec-prev-page")?.addEventListener("click", () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.paint();
      }
    });

    document.getElementById("rec-next-page")?.addEventListener("click", () => {
      const maxPage = Math.ceil(this.state.data.length / this.state.perPage);

      if (this.state.page < maxPage) {
        this.state.page++;
        this.paint();
      }
    });

    document.getElementById("rec-prev-month")?.addEventListener("click", () => {
      this.changeMonth(-1);
    });

    document.getElementById("rec-next-month")?.addEventListener("click", () => {
      this.changeMonth(1);
    });
  },

  async openForm(selected = null) {
    const isEdit = !!selected;
    const alunos = await API.getAlunos();

    const options = alunos
      .map(
        (a) => `
        <option value="${a.data[0]}"
        ${selected?.aluno === a.data[0] ? "selected" : ""}>
        ${a.data[0]}
        </option>
      `,
      )
      .join("");

    Modal.open(`
      <h3>${isEdit ? "Alterar receita" : "Cadastrar receita"}</h3>

      <div class="modal-form-grid">

        <div class="form-group full">
          <label>Aluno</label>
          <select id="r-aluno">
            ${options}
          </select>
        </div>

        <div class="form-group">
          <label>Tipo</label>
          <select id="r-tipo">
            <option value="PIX">PIX</option>
            <option value="DINHEIRO">Dinheiro</option>
          </select>
        </div>

        <div class="form-group">
          <label>Data</label>
          <input type="date" id="r-data" value="${selected?.data || ""}">
        </div>

        <div class="form-group">
          <label>Valor devido</label>
          <input id="r-devido" value="${selected?.devido || ""}">
        </div>

        <div class="form-group">
          <label>Valor pago</label>
          <input id="r-pago" value="${selected?.pago || ""}">
        </div>

      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="r-salvar">
          ${isEdit ? "Salvar alterações" : "Cadastrar"}
        </button>
      </div>
    `);

    document.getElementById("r-salvar")?.addEventListener("click", async () => {
      const aluno = this.v("r-aluno");
      const tipo = this.v("r-tipo");
      const data = this.v("r-data");
      const devido = Number(this.v("r-devido") || 0);
      const pago = Number(this.v("r-pago") || 0);
      const saldo = devido - pago;

      const valores = [aluno, tipo, data, devido, pago, saldo];

      if (isEdit) {
        await API.updateReceita(selected.id, valores);
      } else {
        const id = "REC-" + Date.now();
        await API.insertReceita(id, valores);
      }

      Modal.close();

      await this.load();
      this.paint();
    });
  },

  paint() {
    const list = document.getElementById("receitas-list");
    if (!list) return;

    const fmt = (n) =>
      Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const start = (this.state.page - 1) * this.state.perPage;
    const slice = this.state.data.slice(start, start + this.state.perPage);

    const rows = slice
      .map((r) => {
        const saldoClass = r.saldo === 0 ? "saldo-ok" : "saldo-pendente";
        const selectedClass =
          String(this.state.selected?.id).trim() === String(r.id).trim()
            ? "receita-row-selected"
            : "";

        return `
          <tr data-id="${r.id}" class="${selectedClass}">
            <td>${r.aluno}</td>
            <td>${r.tipo}</td>
            <td>${r.data}</td>
            <td>${fmt(r.devido)}</td>
            <td>${fmt(r.pago)}</td>
            <td class="${saldoClass}">${fmt(r.saldo)}</td>
          </tr>
        `;
      })
      .join("");

    const totalPago = this.state.data.reduce((s, r) => s + r.pago, 0);

    list.innerHTML = `
      <div class="receitas-card">
        <table class="receitas-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Devido</th>
              <th>Pago</th>
              <th>Saldo</th>
            </tr>
          </thead>

          <tbody>${rows}</tbody>
        </table>

        <div class="receitas-total">
          Total Pago: <strong>${fmt(totalPago)}</strong>
        </div>
      </div>
    `;

    const alterarBtn = document.getElementById("rec-btn-alterar");
    const excluirBtn = document.getElementById("rec-btn-excluir");

    if (alterarBtn) alterarBtn.disabled = !this.state.selected;
    if (excluirBtn) excluirBtn.disabled = !this.state.selected;

    list.querySelectorAll(".receitas-table tbody tr").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.id;
        this.state.selected = this.state.data.find((x) => x.id === id) || null;

        if (alterarBtn) alterarBtn.disabled = !this.state.selected;
        if (excluirBtn) excluirBtn.disabled = !this.state.selected;

        this.paint();
      });
    });

    const maxPage = Math.ceil(this.state.data.length / this.state.perPage) || 1;
    const prev = document.getElementById("rec-prev-page");
    const next = document.getElementById("rec-next-page");

    if (prev) prev.disabled = this.state.page === 1;
    if (next) next.disabled = this.state.page >= maxPage;
  },

  formatPeriod(monthIndex, year) {
    const meses = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];
    return `${meses[monthIndex]}/${year}`;
  },

  v(id) {
    return (document.getElementById(id)?.value || "").trim();
  },
};
