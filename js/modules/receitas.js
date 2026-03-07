// js/modules/receitas.js

window.Receitas = {
  state: {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    page: 1,
    perPage: 4,
    data: [],
  },

  async render() {
    const el = document.getElementById("receitas");
    if (!el) return;

    // primeiro renderiza layout com loading
    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">RECEITAS</h1>
        </div>

        <div class="module-body">

          <div class="receitas-actions-top">
            <button class="btn btn-primary" id="rec-btn-cadastrar">Cadastrar</button>
            <button class="btn btn-warning" id="rec-btn-alterar">Alterar</button>
            <button class="btn btn-danger" id="rec-btn-excluir">Excluir</button>
            <button class="btn btn-print" id="rec-btn-imprimir">Imprimir</button>
            <button class="btn btn-outline" id="rec-btn-periodo">Escolher período</button>
          </div>

          <p>Carregando receitas...</p>

        </div>
      </div>
    `;

    // agora carrega dados
    await this.load();

    const periodLabel = this.formatPeriod(
      this.state.currentMonth,
      this.state.currentYear,
    );

    const { rowsHtml, totalPagoFmt } = this.buildTable();

    const maxPage = Math.ceil(this.state.data.length / this.state.perPage);

    // render final com dados
    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">RECEITAS</h1>
        </div>

        <div class="module-body">

          <div class="receitas-actions-top">
            <button class="btn btn-primary" id="rec-btn-cadastrar">Cadastrar</button>
            <button class="btn btn-warning" id="rec-btn-alterar">Alterar</button>
            <button class="btn btn-danger" id="rec-btn-excluir">Excluir</button>
            <button class="btn btn-print" id="rec-btn-imprimir">Imprimir</button>
            <button class="btn btn-outline" id="rec-btn-periodo">Escolher período</button>
          </div>

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
              <tbody>${rowsHtml}</tbody>
            </table>

            <div class="receitas-total">
              Total Pago: <strong>${totalPagoFmt}</strong>
            </div>
          </div>

          <div class="receitas-pagination">

            <div class="receitas-page-nav-left">
              <button class="btn-arrow" id="rec-prev-page" ${this.state.page === 1 ? "disabled" : ""}>◀</button>
              <span class="page-label">Anterior</span>
            </div>

            <div class="receitas-month-nav">
              <button class="btn-arrow" id="rec-prev-month">◀</button>
              <span class="receitas-page" id="rec-period-label">${periodLabel}</span>
              <button class="btn-arrow" id="rec-next-month">▶</button>
            </div>

            <div class="receitas-page-nav-right">
              <span class="page-label">Próximo</span>
              <button class="btn-arrow" id="rec-next-page" ${this.state.page >= maxPage ? "disabled" : ""}>▶</button>
            </div>

          </div>

        </div>
      </div>
    `;

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
    } catch (err) {
      console.error("Erro ao carregar receitas", err);
      this.state.data = [];
    }
  },

  bindEvents() {
    document
      .getElementById("rec-prev-month")
      ?.addEventListener("click", () => this.changeMonth(-1));
    document
      .getElementById("rec-next-month")
      ?.addEventListener("click", () => this.changeMonth(1));

    document.getElementById("rec-prev-page")?.addEventListener("click", () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.render();
      }
    });

    document.getElementById("rec-next-page")?.addEventListener("click", () => {
      const maxPage = Math.ceil(this.state.data.length / this.state.perPage);
      if (this.state.page < maxPage) {
        this.state.page++;
        this.render();
      }
    });

    document
      .getElementById("rec-btn-imprimir")
      ?.addEventListener("click", () =>
        Print.section("receitas", "Relatório de Receitas"),
      );
  },

  changeMonth(step) {
    let m = this.state.currentMonth + step;
    if (m < 0) m = 11;
    if (m > 11) m = 0;
    this.state.currentMonth = m;

    const label = document.getElementById("rec-period-label");
    if (label) {
      label.textContent = this.formatPeriod(
        this.state.currentMonth,
        this.state.currentYear,
      );
    }
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

  buildTable() {
    const fmtMoney = (n) =>
      n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    let totalPago = 0;
    this.state.data.forEach((r) => (totalPago += r.pago));

    const start = (this.state.page - 1) * this.state.perPage;
    const end = start + this.state.perPage;
    const pageData = this.state.data.slice(start, end);

    const rowsHtml = pageData
      .map((r) => {
        const saldo = r.devido - r.pago;
        const saldoClass = saldo === 0 ? "saldo-ok" : "saldo-pendente";

        return `
        <tr>
          <td>${r.aluno}</td>
          <td>${r.tipo}</td>
          <td>${r.data}</td>
          <td>${fmtMoney(r.devido)}</td>
          <td>${fmtMoney(r.pago)}</td>
          <td class="${saldoClass}">${fmtMoney(saldo)}</td>
        </tr>
      `;
      })
      .join("");

    return { rowsHtml, totalPagoFmt: fmtMoney(totalPago) };
  },
};
