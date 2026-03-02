// js/modules/despesas.js

window.Despesas = {
  state: {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    page: 1,
    perPage: 4,
    data: [
      {
        descricao: "Aluguel",
        valor: 1500,
        vencimento: "22/02/2026",
        status: "Pago",
      },
      {
        descricao: "Internet",
        valor: 105,
        vencimento: "09/02/2026",
        status: "A pagar",
      },
      {
        descricao: "Galão de água potável",
        valor: 60,
        vencimento: "10/02/2026",
        status: "Pago",
      },
      {
        descricao: "Energia elétrica (Equatorial)",
        valor: 420,
        vencimento: "15/02/2026",
        status: "A pagar",
      },
      {
        descricao: "Professora 1",
        valor: 1200,
        vencimento: "05/02/2026",
        status: "Pago",
      },
      {
        descricao: "Professora 2",
        valor: 1200,
        vencimento: "05/02/2026",
        status: "Pago",
      },
      {
        descricao: "Professora 3",
        valor: 1200,
        vencimento: "05/02/2026",
        status: "A pagar",
      },
      {
        descricao: "Materiais de escritório",
        valor: 350,
        vencimento: "18/02/2026",
        status: "Pago",
      },
      {
        descricao: "Despesas de manutenção",
        valor: 780,
        vencimento: "20/02/2026",
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

    const maxPage = Math.ceil(this.state.data.length / this.state.perPage);

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">DESPESAS</h1>
        </div>

        <div class="module-body">

          <div class="despesas-actions-top">
            <button class="btn btn-primary">Cadastrar</button>
            <button class="btn btn-warning">Alterar</button>
            <button class="btn btn-danger">Excluir</button>
            <button class="btn btn-print">Imprimir</button>
            <button class="btn btn-outline">Escolher período</button>
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

            <div class="receitas-page-nav-left">
              <button class="btn-arrow" id="des-prev-page" ${this.state.page === 1 ? "disabled" : ""}>◀</button>
              <span class="page-label">Anterior</span>
            </div>

            <div class="receitas-month-nav">
              <button class="btn-arrow" id="des-prev-month">◀</button>
              <span class="despesas-page" id="des-period-label">${periodLabel}</span>
              <button class="btn-arrow" id="des-next-month">▶</button>
            </div>

            <div class="receitas-page-nav-right">
              <span class="page-label">Próximo</span>
              <button class="btn-arrow" id="des-next-page" ${this.state.page >= maxPage ? "disabled" : ""}>▶</button>
            </div>

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

    document.getElementById("des-prev-page")?.addEventListener("click", () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.render();
      }
    });

    document.getElementById("des-next-page")?.addEventListener("click", () => {
      const maxPage = Math.ceil(this.state.data.length / this.state.perPage);
      if (this.state.page < maxPage) {
        this.state.page++;
        this.render();
      }
    });
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

    const start = (this.state.page - 1) * this.state.perPage;
    const end = start + this.state.perPage;
    const pageData = this.state.data.slice(start, end);

    let total = 0;

    const rowsHtml = pageData
      .map((r) => {
        total += r.valor;

        const statusClass =
          r.status === "Pago" ? "desp-status-pago" : "desp-status-pagar";

        return `
          <tr>
            <td>${r.descricao}</td>
            <td>${fmtMoney(r.valor)}</td>
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
