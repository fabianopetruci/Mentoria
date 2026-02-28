// js/modules/financeiro.js

window.Financeiro = {
  state: {
    ano: new Date().getFullYear(),
    dados: [],
  },

  async render() {
    const el = document.getElementById("financeiro");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <div class="financeiro-topbar">
            <div class="financeiro-year-nav">
              <button class="btn-arrow" id="fin-ano-prev" aria-label="Ano anterior">◀</button>
              <span class="financeiro-year" id="fin-ano-label">${this.state.ano}</span>
              <button class="btn-arrow" id="fin-ano-next" aria-label="Próximo ano">▶</button>
            </div>

            <div class="financeiro-actions">
              <button class="btn btn-primary" id="fin-btn-atualizar">Atualizar</button>
              <button class="btn btn-print" id="fin-btn-imprimir">Imprimir</button>
            </div>
          </div>

          <div class="module-title">Fluxo de Caixa</div>
        </div>

        <div class="module-body">
          <div class="financeiro-grid">
            <div class="financeiro-card" id="fin-card-resumo">
              <h3>Resumo Anual</h3>
              <div id="financeiro-resumo">—</div>
            </div>

            <div class="financeiro-card financeiro-card-table">
              <h3>Tabela Mensal</h3>
              <div id="financeiro-list">Carregando…</div>
            </div>

            <div class="financeiro-card" id="fin-card-grafico">
              <h3>Gráfico</h3>
              <div id="financeiro-grafico">—</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindUI();
    await this.loadMock(); // mock local por enquanto
  },

  bindUI() {
    document.getElementById("fin-ano-prev")?.addEventListener("click", () => {
      this.state.ano--;
      this.syncYearUI();
      this.loadMock();
    });

    document.getElementById("fin-ano-next")?.addEventListener("click", () => {
      this.state.ano++;
      this.syncYearUI();
      this.loadMock();
    });

    document
      .getElementById("fin-btn-atualizar")
      ?.addEventListener("click", () => {
        this.loadMock();
      });

    document
      .getElementById("fin-btn-imprimir")
      ?.addEventListener("click", () => {
        window.print();
      });
  },

  syncYearUI() {
    const label = document.getElementById("fin-ano-label");
    if (label) label.textContent = this.state.ano;
  },

  async loadMock() {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // MOCK (substituir pela API depois)
    const base = [
      { m: 0, r: 1200, d: 300 },
      { m: 1, r: 1500, d: 800 },
      { m: 2, r: 1800, d: 450 },
      { m: 3, r: 0, d: 0 },
    ];

    const mapa = {};
    base.forEach((x) => (mapa[x.m] = x));

    this.state.dados = Array.from({ length: 12 }, (_, i) => {
      const r = mapa[i]?.r || 0;
      const d = mapa[i]?.d || 0;
      const lucro = r - d;
      const prolabore = lucro * 0.9;
      const capital = lucro * 0.1;

      return {
        mesIdx: i,
        mes: meses[i],
        receitas: r,
        despesas: d,
        lucro,
        prolabore,
        capital,
      };
    });

    this.paint();
  },

  paint() {
    this.paintTable();
    this.paintResumo();
  },

  paintTable() {
    const list = document.getElementById("financeiro-list");
    if (!list) return;

    list.innerHTML = `
      <table class="financeiro-table">
        <thead>
          <tr>
            <th>Mês</th>
            <th>Receitas</th>
            <th>Despesas</th>
            <th>Lucro</th>
            <th>Pró-labore</th>
            <th>Capital</th>
          </tr>
        </thead>
        <tbody>
          ${this.state.dados
            .map(
              (x) => `
                <tr>
                  <td>${x.mes}</td>
                  <td>${this.moeda(x.receitas)}</td>
                  <td>${this.moeda(x.despesas)}</td>
                  <td>${this.moeda(x.lucro)}</td>
                  <td>${this.moeda(x.prolabore)}</td>
                  <td>${this.moeda(x.capital)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  },

  paintResumo() {
    const el = document.getElementById("financeiro-resumo");
    if (!el) return;

    const totR = this.state.dados.reduce((acc, x) => acc + x.receitas, 0);
    const totD = this.state.dados.reduce((acc, x) => acc + x.despesas, 0);
    const lucro = totR - totD;

    el.innerHTML = `
      <div class="fin-kpis">
        <div class="fin-kpi">
          <div class="fin-kpi-label">Receitas</div>
          <div class="fin-kpi-value">${this.moeda(totR)}</div>
        </div>
        <div class="fin-kpi">
          <div class="fin-kpi-label">Despesas</div>
          <div class="fin-kpi-value">${this.moeda(totD)}</div>
        </div>
        <div class="fin-kpi">
          <div class="fin-kpi-label">Lucro</div>
          <div class="fin-kpi-value">${this.moeda(lucro)}</div>
        </div>
      </div>
    `;
  },

  moeda(v) {
    return Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },
};
