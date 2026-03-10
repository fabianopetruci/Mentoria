// js/modules/financeiro.js

window.Financeiro = {
  state: {
    ano: new Date().getFullYear(),
    dados: [],
  },

  chart: null,

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
            <div id="financeiro-resumo" class="fin-kpis"></div>
          </div>

          <div class="financeiro-card financeiro-card-table">
            <h3>Tabela Mensal</h3>
            <div id="financeiro-list">Carregando...</div>
          </div>

          <div class="financeiro-card">
            <h3>Gráfico</h3>
            <div class="financeiro-chart-wrapper">
              <canvas id="financeiro-chart"></canvas>
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindUI();
    await this.load();
  },

  bindUI() {
    document
      .getElementById("fin-ano-prev")
      ?.addEventListener("click", async () => {
        this.state.ano--;
        this.syncYear();
        await this.load();
      });

    document
      .getElementById("fin-ano-next")
      ?.addEventListener("click", async () => {
        this.state.ano++;
        this.syncYear();
        await this.load();
      });

    document
      .getElementById("fin-btn-gravar")
      ?.addEventListener("click", async () => {
        await this.gravarBalanco();
      });

    document
      .getElementById("fin-btn-imprimir")
      ?.addEventListener("click", () => {
        Print.section("financeiro", `Fluxo de Caixa ${this.state.ano}`);
      });
  },

  syncYear() {
    const label = document.getElementById("fin-ano-label");
    if (label) label.textContent = this.state.ano;
  },

  async load() {
    try {
      const [receitasRows, despesasRows] = await Promise.all([
        API.getReceitas(),
        API.getDespesas(),
      ]);

      this.state.dados = this.buildFromReceitasDespesas(
        receitasRows || [],
        despesasRows || [],
        this.state.ano,
      );

      this.paint();
    } catch (err) {
      console.error("Erro ao carregar financeiro:", err);
      const el = document.getElementById("financeiro-list");
      if (el) el.innerHTML = "Erro ao carregar fluxo de caixa.";
    }
  },

  buildFromReceitasDespesas(receitasRows, despesasRows, ano) {
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

    const receitasPorMes = Array(12).fill(0);
    const despesasPorMes = Array(12).fill(0);

    // RECEITAS: usa "valor pago" (coluna 4 no módulo receitas atual)
    receitasRows.forEach((r) => {
      const data = String(r?.data?.[2] || "").trim();
      const dt = this.parseDate(data);
      if (!dt || dt.getFullYear() !== ano) return;

      const mes = dt.getMonth();
      const pago = Number(r?.data?.[4] || 0);
      receitasPorMes[mes] += Number.isFinite(pago) ? pago : 0;
    });

    // DESPESAS: soma valor apenas quando status = "pago"
    despesasRows.forEach((d) => {
      const data = String(d?.data?.[2] || "").trim(); // vencimento
      const dt = this.parseDate(data);
      if (!dt || dt.getFullYear() !== ano) return;

      const status = String(d?.data?.[3] || "")
        .trim()
        .toLowerCase();
      if (status !== "pago") return;

      const mes = dt.getMonth();
      const valor = Number(d?.data?.[1] || 0);
      despesasPorMes[mes] += Number.isFinite(valor) ? valor : 0;
    });

    return Array.from({ length: 12 }, (_, i) => {
      const receitas = receitasPorMes[i];
      const despesas = despesasPorMes[i];
      const lucro = receitas - despesas;

      return {
        mes: meses[i],
        mesISO: `${ano}-${String(i + 1).padStart(2, "0")}`,
        receitas,
        despesas,
        lucro,
        prolabore: lucro * 0.9,
        capital: lucro * 0.1,
      };
    });
  },

  paint() {
    this.paintResumo();
    this.paintTabela();
    this.paintGrafico();
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

  paintGrafico() {
    const canvas = document.getElementById("financeiro-chart");
    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: this.state.dados.map((x) => x.mes),
        datasets: [
          {
            label: "Receitas",
            data: this.state.dados.map((x) => x.receitas),
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderRadius: 4,
          },
          {
            label: "Despesas",
            data: this.state.dados.map((x) => x.despesas),
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              font: { size: 11 },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
              font: (context) => {
                const width = context.chart.width;
                if (width < 350) return { size: 7 };
                if (width < 450) return { size: 8 };
                return { size: 10 };
              },
            },
            grid: { display: false },
          },
          y: {
            ticks: {
              font: { size: 10 },
              callback: (value) =>
                Number(value).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                }),
            },
          },
        },
      },
    });
  },

  async gravarBalanco() {
    try {
      // grava um snapshot anual no Fluxo_caixa com os valores calculados automaticamente
      const existentes = await API.getFluxoCaixa();
      const mapaPorMes = new Map();

      (existentes || []).forEach((r) => {
        const mes = String(r?.data?.[0] || "").trim(); // yyyy-mm
        if (mes) mapaPorMes.set(mes, r.id);
      });

      for (const row of this.state.dados) {
        const valores = [
          row.mesISO,
          row.receitas,
          row.despesas,
          row.lucro,
          row.prolabore,
          row.capital,
        ];

        const idExistente = mapaPorMes.get(row.mesISO);
        if (idExistente) {
          await API.updateFluxoCaixa(idExistente, valores);
        } else {
          const novoId = this.buildNextIdExistentes(existentes || []);
          await API.insertFluxoCaixa(novoId, valores);
          existentes.push({ id: novoId, data: valores });
        }
      }

      alert("Balanço anual gravado com sucesso.");
    } catch (err) {
      console.error("Erro ao gravar balanço:", err);
      alert("Erro ao gravar balanço.");
    }
  },

  buildNextIdExistentes(rows) {
    const max = rows.reduce((acc, r) => {
      const n = Number(String(r.id || "").replace(/^FIN-/, ""));
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);

    return `FIN-${String(max + 1).padStart(4, "0")}`;
  },

  parseDate(value) {
    const str = String(value || "").trim();
    if (!str) return null;

    // yyyy-mm-dd
    let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

    // dd/mm/yyyy
    m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));

    return null;
  },

  moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },
};
