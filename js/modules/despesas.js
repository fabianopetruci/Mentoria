// js/modules/despesas.js

window.Despesas = {
  state: {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    data: [
      {
        descricao: "Aluguel",
        valor: 1500.0,
        vencimento: "22/02/2026",
        status: "Pago",
      },
      {
        descricao: "Internet",
        valor: 105.0,
        vencimento: "09/02/2026",
        status: "A pagar",
      },
    ],
  },

  render() {
    const el = document.getElementById("despesas");
    if (!el) return;

    const periodLabel = this.formatPeriod(
      this.state.currentMonth,
      this.state.currentYear,
    );

    const { rowsHtml, totalFmt } = this.buildTable();

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">DESPESAS</h1>
        </div>

        <div class="module-body">

          <div class="despesas-actions-top">
            <button class="btn btn-primary" id="des-btn-cadastrar">Cadastrar</button>
            <button class="btn btn-warning" id="des-btn-alterar">Alterar</button>
            <button class="btn btn-danger" id="des-btn-excluir">Excluir</button>
            <button class="btn btn-print" id="des-btn-imprimir">Imprimir</button>
            <button class="btn btn-outline" id="des-btn-periodo">Escolher período</button>
          </div>

          <div class="despesas-card">
            <table class="despesas-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div class="despesas-total">
              Total: <strong>${totalFmt}</strong>
            </div>
          </div>

          <div class="despesas-pagination">
            <button class="btn-arrow" id="des-prev-month">◀</button>
            <span class="despesas-page" id="des-period-label">${periodLabel}</span>
            <button class="btn-arrow" id="des-next-month">▶</button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    document.getElementById("des-prev-month")?.addEventListener("click", () => {
      this.changeMonth(-1);
    });

    document.getElementById("des-next-month")?.addEventListener("click", () => {
      this.changeMonth(1);
    });

    document
      .getElementById("des-btn-cadastrar")
      ?.addEventListener("click", () => {});
    document
      .getElementById("des-btn-alterar")
      ?.addEventListener("click", () => {});
    document
      .getElementById("des-btn-excluir")
      ?.addEventListener("click", () => {});
    document
      .getElementById("des-btn-imprimir")
      ?.addEventListener("click", () => {});
    document
      .getElementById("des-btn-periodo")
      ?.addEventListener("click", () => {});
  },

  changeMonth(step) {
    let m = this.state.currentMonth + step;

    if (m < 0) m = 11;
    if (m > 11) m = 0;

    this.state.currentMonth = m;

    const label = document.getElementById("des-period-label");
    if (label) {
      label.textContent = this.formatPeriod(
        this.state.currentMonth,
        this.state.currentYear,
      );
    }
  },

  formatPeriod(monthIndex, year) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    return `${mm}/${year}`;
  },

  buildTable() {
    const fmtMoney = (n) =>
      n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    let total = 0;

    const rowsHtml = this.state.data
      .map((r) => {
        total += Number(r.valor || 0);

        const statusClass =
          r.status === "Pago" ? "desp-status-pago" : "desp-status-pagar";

        return `
          <tr>
            <td>${r.descricao}</td>
            <td>${fmtMoney(Number(r.valor || 0))}</td>
            <td>${r.vencimento}</td>
            <td class="${statusClass}">${r.status}</td>
          </tr>
        `;
      })
      .join("");

    return {
      rowsHtml,
      totalFmt: fmtMoney(total),
    };
  },
};
