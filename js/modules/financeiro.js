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

        <div class="financeiro-topbar">

          <div class="financeiro-year-nav">
            <button class="btn-arrow" id="fin-ano-prev">◀</button>
            <span class="financeiro-year" id="fin-ano-label">${this.state.ano}</span>
            <button class="btn-arrow" id="fin-ano-next">▶</button>
          </div>

          <div class="financeiro-actions">
            <button class="btn btn-primary" id="fin-btn-gravar">Gravar</button>
            <button class="btn btn-print" id="fin-btn-imprimir">Imprimir</button>
          </div>

        </div>

        <h2>Fluxo de Caixa</h2>

        <div class="financeiro-grid">
          <div class="financeiro-card">
            <h3>Resumo Anual</h3>
            <div id="financeiro-resumo"></div>
          </div>

          <div class="financeiro-card financeiro-card-table">
            <h3>Tabela Mensal</h3>
            <div id="financeiro-list"></div>
          </div>

          <div class="financeiro-card">
            <h3>Gráfico</h3>
            <div id="financeiro-grafico">—</div>
          </div>
        </div>

      </div>
    `;

    this.bindUI();
    this.loadMock();
  },

  bindUI() {
    document.getElementById("fin-ano-prev")?.addEventListener("click", () => {
      this.state.ano--;
      this.syncYear();
      this.loadMock();
    });

    document.getElementById("fin-ano-next")?.addEventListener("click", () => {
      this.state.ano++;
      this.syncYear();
      this.loadMock();
    });

    document.getElementById("fin-btn-gravar")?.addEventListener("click", () => {
      this.gravarBalanco();
    });

    document
      .getElementById("fin-btn-imprimir")
      ?.addEventListener("click", () => {
        window.print();
      });
  },

  syncYear() {
    const label = document.getElementById("fin-ano-label");
    if (label) label.textContent = this.state.ano;
  },

  loadMock() {
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

    const base = [
      { mes: 0, receita: 1200, despesa: 300 },
      { mes: 1, receita: 1500, despesa: 800 },
      { mes: 2, receita: 1800, despesa: 450 },
    ];

    const mapa = {};
    base.forEach((x) => (mapa[x.mes] = x));

    this.state.dados = Array.from({ length: 12 }, (_, i) => {
      const r = mapa[i]?.receita || 0;
      const d = mapa[i]?.despesa || 0;
      const lucro = r - d;

      return {
        mes: meses[i],
        receitas: r,
        despesas: d,
        lucro,
        prolabore: lucro * 0.9,
        capital: lucro * 0.1,
      };
    });

    this.paint();
  },

  paint() {
    this.paintResumo();
    this.paintTabela();
  },

  paintResumo() {
    const el = document.getElementById("financeiro-resumo");
    if (!el) return;

    const totalReceitas = this.state.dados.reduce(
      (acc, x) => acc + x.receitas,
      0,
    );
    const totalDespesas = this.state.dados.reduce(
      (acc, x) => acc + x.despesas,
      0,
    );
    const totalLucro = totalReceitas - totalDespesas;

    el.innerHTML = `
        <div class="fin-kpi">
            <span>Receitas</span>
            <strong>${this.moeda(totalReceitas)}</strong>
        </div>

        <div class="fin-kpi">
            <span>Despesas</span>
            <strong>${this.moeda(totalDespesas)}</strong>
        </div>

        <div class="fin-kpi">
            <span>Lucro</span>
            <strong>${this.moeda(totalLucro)}</strong>
        </div>

        <div class="fin-kpi">
            <span>Pró-labore</span>
            <strong>${this.moeda(totalLucro * 0.9)}</strong>
        </div>

        <div class="fin-kpi">
            <span>Capital</span>
            <strong>${this.moeda(totalLucro * 0.1)}</strong>
        </div>
    `;
  },

  paintTabela() {
    const el = document.getElementById("financeiro-list");
    if (!el) return;

    el.innerHTML = `
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

  async gravarBalanco() {
    alert("Balanço anual gravado (mock).");

    // Futuramente:
    // Api.replaceYear("Fluxo_caixa", this.state.ano, this.state.dados);
  },

  moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },
};
