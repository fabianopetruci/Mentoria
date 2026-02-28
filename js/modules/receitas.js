// js/modules/receitas.js

window.Receitas = {
  state: {
    currentMonth: new Date().getMonth(), // 0-11
    currentYear: new Date().getFullYear(),
    page: 1,
    perPage: 8,
    data: [
      {
        aluno: "Júlia Victoria Botentuite Duarte",
        tipo: "PIX",
        data: "25/02/2026",
        devido: 350.0,
        pago: 350.0,
      },
      {
        aluno: "Maria Helena de Oliveira Garreto de Souza",
        tipo: "PIX",
        data: "25/02/2026",
        devido: 310.0,
        pago: 310.0,
      },
      {
        aluno: "Pietro Ravi Costa Garcia",
        tipo: "PIX",
        data: "25/02/2026",
        devido: 350.0,
        pago: 350.0,
      },
      {
        aluno: "Maria Clara Froes Serejo",
        tipo: "PIX",
        data: "25/02/2026",
        devido: 350.0,
        pago: 310.0,
      },
    ],
  },

  render() {
    const el = document.getElementById("receitas");
    if (!el) return;

    const periodLabel = this.formatPeriod(
      this.state.currentMonth,
      this.state.currentYear,
    );

    const { rowsHtml, totalPagoFmt } = this.buildTable();

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

              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div class="receitas-total">
              Total Pago: <strong>${totalPagoFmt}</strong>
            </div>
          </div>

          <div class="receitas-pagination">
            <button class="btn-arrow" id="rec-prev-month" aria-label="Mês anterior">◀</button>
            <span class="receitas-page" id="rec-period-label">${periodLabel}</span>
            <button class="btn-arrow" id="rec-next-month" aria-label="Próximo mês">▶</button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    document.getElementById("rec-prev-month")?.addEventListener("click", () => {
      this.changeMonth(-1);
    });

    document.getElementById("rec-next-month")?.addEventListener("click", () => {
      this.changeMonth(1);
    });

    document
      .getElementById("rec-btn-cadastrar")
      ?.addEventListener("click", () => {});
    document
      .getElementById("rec-btn-alterar")
      ?.addEventListener("click", () => {});
    document
      .getElementById("rec-btn-excluir")
      ?.addEventListener("click", () => {});
    document
      .getElementById("rec-btn-imprimir")
      ?.addEventListener("click", () => {});
    document
      .getElementById("rec-btn-periodo")
      ?.addEventListener("click", () => {});
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

    const rowsHtml = this.state.data
      .map((r) => {
        const saldo = Number(r.devido || 0) - Number(r.pago || 0);
        totalPago += Number(r.pago || 0);

        const saldoFmt = fmtMoney(saldo);
        const saldoClass = saldo === 0 ? "saldo-ok" : "saldo-pendente";

        return `
          <tr>
            <td>${r.aluno}</td>
            <td>${r.tipo}</td>
            <td>${r.data}</td>
            <td>${fmtMoney(Number(r.devido || 0))}</td>
            <td>${fmtMoney(Number(r.pago || 0))}</td>
            <td class="${saldoClass}">${saldoFmt}</td>
          </tr>
        `;
      })
      .join("");

    return {
      rowsHtml,
      totalPagoFmt: fmtMoney(totalPago),
    };
  },
};
