// js/modules/financeiro.js

window.Financeiro = {
  state: {
    ano: new Date().getFullYear(),
    dadosCalculados: null,
  },

  async render() {
    const el = document.getElementById("financeiro");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <div class="financeiro-header">
            <button class="btn btn-secondary" id="ano-prev">◀</button>
            <h2 class="module-title">Fluxo de Caixa – ${this.state.ano}</h2>
            <button class="btn btn-secondary" id="ano-next">▶</button>
          </div>
        </div>

        <div class="module-body">
          <div class="financeiro-grid">

            <div class="card resumo-card">
              <h3>Resumo Anual</h3>
              <div id="financeiro-resumo"></div>
            </div>

            <div class="card tabela-card">
              <h3>Tabela Mensal</h3>
              <div id="financeiro-tabela"></div>
            </div>

            <div class="card grafico-card">
              <h3>Gráfico</h3>
              <div id="financeiro-grafico"></div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.bindUI();
    await this.load();
  },

  bindUI() {
    document.getElementById("ano-prev")?.addEventListener("click", () => {
      this.state.ano--;
      this.render();
    });

    document.getElementById("ano-next")?.addEventListener("click", () => {
      this.state.ano++;
      this.render();
    });
  },

  async load() {
    try {
      // ===== MOCK TEMPORÁRIO =====
      const receitas = [
        { data: ["", "", "2026-01-10", "", 1200] },
        { data: ["", "", "2026-02-10", "", 1500] },
        { data: ["", "", "2026-03-10", "", 1800] },
      ];

      const despesas = [
        { data: ["Internet", 300, "2026-01-15"] },
        { data: ["Aluguel", 800, "2026-02-05"] },
        { data: ["Material", 450, "2026-03-12"] },
      ];
      // ===========================

      this.state.dadosCalculados = this.calcularFluxoAno(
        this.state.ano,
        receitas,
        despesas,
      );

      this.paintTabela();
    } catch (err) {
      document.getElementById("financeiro-tabela").innerHTML =
        "Erro ao carregar fluxo de caixa.";
    }
  },

  calcularFluxoAno(ano, receitas, despesas) {
    const meses = Array.from({ length: 12 }, (_, i) => ({
      mes: i,
      receita: 0,
      despesa: 0,
    }));

    receitas.forEach(({ data }) => {
      const dataRef = new Date(data[2]);
      if (dataRef.getFullYear() !== ano) return;
      const mes = dataRef.getMonth();
      const valor = Number(data[4] || 0);
      meses[mes].receita += valor;
    });

    despesas.forEach(({ data }) => {
      const venc = new Date(data[2]);
      if (venc.getFullYear() !== ano) return;
      const mes = venc.getMonth();
      const valor = Number(data[1] || 0);
      meses[mes].despesa += valor;
    });

    let totalReceita = 0;
    let totalDespesa = 0;

    const resultado = meses.map((m) => {
      const lucro = m.receita - m.despesa;
      const prolabore = lucro * 0.9;
      const capital = lucro * 0.1;

      totalReceita += m.receita;
      totalDespesa += m.despesa;

      return {
        mes: m.mes,
        receita: m.receita,
        despesa: m.despesa,
        lucro,
        prolabore,
        capital,
      };
    });

    return {
      meses: resultado,
      totalReceita,
      totalDespesa,
      totalLucro: totalReceita - totalDespesa,
    };
  },

  paintTabela() {
    const container = document.getElementById("financeiro-tabela");
    if (!container || !this.state.dadosCalculados) return;

    const mesesNomes = [
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

    container.innerHTML = `
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
          ${this.state.dadosCalculados.meses
            .map(
              (m) => `
              <tr>
                <td>${mesesNomes[m.mes]}</td>
                <td>${this.moeda(m.receita)}</td>
                <td>${this.moeda(m.despesa)}</td>
                <td>${this.moeda(m.lucro)}</td>
                <td>${this.moeda(m.prolabore)}</td>
                <td>${this.moeda(m.capital)}</td>
              </tr>
            `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  },

  moeda(v) {
    return Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },
};
