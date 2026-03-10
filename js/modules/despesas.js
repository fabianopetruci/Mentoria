// js/modules/despesas.js

window.Despesas = {
  state: {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    page: 1,
    perPage: 4,
    data: [],
    selected: null,
  },

  async render() {
    const el = document.getElementById("despesas");
    if (!el) return;

    const periodLabel = this.formatPeriod(
      this.state.currentMonth,
      this.state.currentYear,
    );

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">DESPESAS</h1>
        </div>

        <div class="module-body">

          <div class="despesas-actions-top">
            <button class="btn btn-primary" id="des-btn-cadastrar">Cadastrar</button>
            <button class="btn btn-warning" id="des-btn-alterar" disabled>Alterar</button>
            <button class="btn btn-danger" id="des-btn-excluir" disabled>Excluir</button>
            <button class="btn btn-print" id="des-btn-imprimir">Imprimir</button>
            <button class="btn btn-outline" id="des-btn-periodo">Escolher período</button>
          </div>

          <div id="despesas-list">Carregando despesas...</div>

          <div class="despesas-pagination">

            <div class="receitas-page-nav-left">
              <button class="btn-arrow" id="des-prev-page">◀</button>
              <span class="page-label">Anterior</span>
            </div>

            <div class="receitas-month-nav">
              <button class="btn-arrow" id="des-prev-month">◀</button>
              <span class="despesas-page" id="des-period-label">${periodLabel}</span>
              <button class="btn-arrow" id="des-next-month">▶</button>
            </div>

            <div class="receitas-page-nav-right">
              <span class="page-label">Próximo</span>
              <button class="btn-arrow" id="des-next-page">▶</button>
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
      const despesas = await API.getDespesas();

      // Planilha: [DESCRICAO, VALOR, VENCIMENTO, STATUS]
      this.state.data = despesas.map((d) => ({
        id: d.id,
        descricao: d.data[0],
        valor: Number(d.data[1] || 0),
        vencimento: d.data[2],
        status: String(d.data[3] || "a pagar"),
      }));

      this.state.selected = null;
      this.state.page = 1;
    } catch (err) {
      console.error("Erro ao carregar despesas", err);
      this.state.data = [];
    }
  },

  bindEvents() {
    document
      .getElementById("des-btn-cadastrar")
      ?.addEventListener("click", () => {
        this.openForm();
      });

    document
      .getElementById("des-btn-alterar")
      ?.addEventListener("click", () => {
        if (this.state.selected) this.openForm(this.state.selected);
      });

    document
      .getElementById("des-btn-excluir")
      ?.addEventListener("click", async () => {
        if (!this.state.selected) return;

        if (!confirm("Excluir despesa selecionada?")) return;

        await API.deleteDespesa(this.state.selected.id);

        await this.load();
        this.paint();
      });

    document
      .getElementById("des-btn-imprimir")
      ?.addEventListener("click", () => {
        Print.section("despesas-list", "Relatório de despesas");
      });

    document
      .getElementById("des-btn-periodo")
      ?.addEventListener("click", () => {
        const monthValue = `${this.state.currentYear}-${String(this.state.currentMonth + 1).padStart(2, "0")}`;

        Modal.open(`
          <h3>Escolher período</h3>

          <div class="modal-form-grid">
            <div class="form-group full">
              <label>Mês / Ano</label>
              <input type="month" id="des-mes-ano" value="${monthValue}">
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-primary" id="des-aplicar-periodo">Aplicar</button>
          </div>
        `);

        document
          .getElementById("des-aplicar-periodo")
          ?.addEventListener("click", () => {
            const value = document.getElementById("des-mes-ano")?.value;
            if (!value) return;

            const [year, month] = value.split("-").map(Number);

            this.state.currentYear = year;
            this.state.currentMonth = month - 1;
            this.state.page = 1;

            Modal.close();
            this.paint();
          });
      });

    document.getElementById("des-prev-page")?.addEventListener("click", () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.paint();
      }
    });

    document.getElementById("des-next-page")?.addEventListener("click", () => {
      const filtered = this.getFilteredData();
      const maxPage = Math.ceil(filtered.length / this.state.perPage) || 1;

      if (this.state.page < maxPage) {
        this.state.page++;
        this.paint();
      }
    });

    document.getElementById("des-prev-month")?.addEventListener("click", () => {
      this.changeMonth(-1);
    });

    document.getElementById("des-next-month")?.addEventListener("click", () => {
      this.changeMonth(1);
    });
  },

  openForm(selected = null) {
    const isEdit = !!selected;

    Modal.open(`
      <h3>${isEdit ? "Alterar despesa" : "Cadastrar despesa"}</h3>

      <div class="modal-form-grid">

        <div class="form-group full">
          <label>Descrição</label>
          <input id="d-descricao" value="${selected?.descricao || ""}">
        </div>

        <div class="form-group">
          <label>Valor</label>
          <input id="d-valor" value="${selected?.valor || ""}">
        </div>

        <div class="form-group">
          <label>Vencimento</label>
          <input type="date" id="d-vencimento" value="${selected?.vencimento || ""}">
        </div>

        <div class="form-group">
          <label>Status</label>
          <select id="d-status">
            <option value="pago" ${String(selected?.status || "").toLowerCase() === "pago" ? "selected" : ""}>Pago</option>
            <option value="a pagar" ${String(selected?.status || "").toLowerCase() !== "pago" ? "selected" : ""}>A pagar</option>
          </select>
        </div>

      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="d-salvar">
          ${isEdit ? "Salvar alterações" : "Cadastrar"}
        </button>
      </div>
    `);

    document.getElementById("d-salvar")?.addEventListener("click", async () => {
      const descricao = this.v("d-descricao");
      const valor = Number(this.v("d-valor") || 0);
      const vencimento = this.v("d-vencimento");
      const status = this.v("d-status");

      if (!descricao) {
        alert("Preencha a descrição.");
        return;
      }

      if (!vencimento) {
        alert("Preencha o vencimento.");
        return;
      }

      const valores = [descricao, valor, vencimento, status];

      if (isEdit) {
        await API.updateDespesa(selected.id, valores);
      } else {
        const id = this.buildNextId();
        await API.insertDespesa(id, valores);
      }

      Modal.close();
      await this.load();
      this.paint();
    });
  },

  buildNextId() {
    const max = this.state.data.reduce((acc, item) => {
      const n = Number(String(item.id || "").replace(/^DES-/, ""));
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);

    return `DES-${String(max + 1).padStart(4, "0")}`;
  },

  changeMonth(step) {
    let newMonth = this.state.currentMonth + step;

    if (newMonth < 0) {
      newMonth = 11;
      this.state.currentYear--;
    }

    if (newMonth > 11) {
      newMonth = 0;
      this.state.currentYear++;
    }

    this.state.currentMonth = newMonth;
    this.state.page = 1;

    this.paint();
  },

  getFilteredData() {
    return this.state.data.filter((d) => {
      const str = String(d.vencimento || "").trim();

      const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (iso) {
        const year = Number(iso[1]);
        const month = Number(iso[2]) - 1;
        return (
          year === this.state.currentYear && month === this.state.currentMonth
        );
      }

      const br = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (br) {
        const year = Number(br[3]);
        const month = Number(br[2]) - 1;
        return (
          year === this.state.currentYear && month === this.state.currentMonth
        );
      }

      return false;
    });
  },

  paint() {
    const list = document.getElementById("despesas-list");
    if (!list) return;

    const fmt = (n) =>
      Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const filtered = this.getFilteredData();

    const start = (this.state.page - 1) * this.state.perPage;
    const slice = filtered.slice(start, start + this.state.perPage);

    const rows = slice
      .map((d) => {
        const statusClass =
          String(d.status).toLowerCase() === "pago"
            ? "desp-status-pago"
            : "desp-status-pagar";
        const selectedClass =
          String(this.state.selected?.id).trim() === String(d.id).trim()
            ? "despesa-row-selected"
            : "";

        return `
          <tr data-id="${d.id}" class="${selectedClass}">
            <td>${d.descricao}</td>
            <td>${fmt(d.valor)}</td>
            <td>${this.formatDateBR(d.vencimento)}</td>
            <td class="${statusClass}">${String(d.status).toLowerCase() === "pago" ? "Pago" : "A pagar"}</td>
          </tr>
        `;
      })
      .join("");

    const total = filtered.reduce((sum, d) => sum + d.valor, 0);

    list.innerHTML = `
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

          <tbody>${rows}</tbody>
        </table>

        <div class="despesas-total">
          Total: <strong>${fmt(total)}</strong>
        </div>
      </div>
    `;

    const alterarBtn = document.getElementById("des-btn-alterar");
    const excluirBtn = document.getElementById("des-btn-excluir");

    if (alterarBtn) alterarBtn.disabled = !this.state.selected;
    if (excluirBtn) excluirBtn.disabled = !this.state.selected;

    list.querySelectorAll(".despesas-table tbody tr").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.id;
        this.state.selected = filtered.find((x) => x.id === id) || null;

        if (alterarBtn) alterarBtn.disabled = !this.state.selected;
        if (excluirBtn) excluirBtn.disabled = !this.state.selected;

        this.paint();
      });
    });

    const maxPage = Math.ceil(filtered.length / this.state.perPage) || 1;
    const prev = document.getElementById("des-prev-page");
    const next = document.getElementById("des-next-page");

    if (prev) prev.disabled = this.state.page === 1;
    if (next) next.disabled = this.state.page >= maxPage;

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

  formatDateBR(value) {
    if (!value) return "";

    const str = String(value).trim();

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      return str;
    }

    const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (iso) {
      return `${iso[3]}/${iso[2]}/${iso[1]}`;
    }

    return str;
  },

  v(id) {
    return (document.getElementById(id)?.value || "").trim();
  },
};
