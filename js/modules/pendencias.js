// js/modules/pendencias.js

window.Pendencias = {
  state: {
    pendenciasFinanceiras: [
      {
        descricao: "Internet",
        vencimento: "10/02/2026",
        status: "Vencida",
      },
    ],
    lembretes: [
      {
        texto: "Chamar empresa de película para trocar a película da porta",
        prioridade: "Média",
        done: false,
      },
    ],
    aniversarios: [
      { nome: "Luís Augusto Soares Serrão", data: "05/03/2026" },
      { nome: "Vinicius Marruais", data: "18/03/2026" },
    ],
  },

  render() {
    const el = document.getElementById("pendencias");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">Pendências / Lembretes</h1>
        </div>

        <div class="module-body">

          <div class="pendencias-grid">

            <!-- CARD 1: Pendências Financeiras -->
            <div class="pendencias-card">
              <div class="pendencias-card-header">
                <h2 class="pendencias-card-title">Pendências Financeiras</h2>
              </div>

              <div class="pendencias-card-body">
                <table class="pendencias-table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Vencimento</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.buildPendFinRows()}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CARD 2: Lembretes -->
            <div class="pendencias-card">
              <div class="pendencias-card-header pendencias-card-header-row">
                <h2 class="pendencias-card-title">Lembretes</h2>
                <button class="btn btn-primary pendencias-btn-novo" id="pen-btn-novo">+ Novo</button>
              </div>

              <div class="pendencias-card-body">
                <div class="pendencias-lembretes">
                  ${this.buildLembretes()}
                </div>
              </div>
            </div>

            <!-- CARD 3: Aniversários -->
            <div class="pendencias-card">
              <div class="pendencias-card-header">
                <h2 class="pendencias-card-title">Aniversários (30 dias)</h2>
              </div>

              <div class="pendencias-card-body">
                <div class="pendencias-aniversarios">
                  ${this.buildAniversarios()}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    document
      .getElementById("pen-btn-novo")
      ?.addEventListener("click", () => {});

    // ações lembretes (mock)
    document.querySelectorAll("[data-lembrete-check]").forEach((btn) => {
      btn.addEventListener("click", () => {});
    });

    document.querySelectorAll("[data-lembrete-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {});
    });
  },

  buildPendFinRows() {
    return this.state.pendenciasFinanceiras
      .map((p) => {
        const statusClass =
          p.status === "Vencida"
            ? "pen-badge-vencida"
            : p.status === "A pagar"
              ? "pen-badge-apagar"
              : "pen-badge-ok";

        return `
          <tr>
            <td>${p.descricao}</td>
            <td>${p.vencimento}</td>
            <td><span class="pen-badge ${statusClass}">${p.status}</span></td>
          </tr>
        `;
      })
      .join("");
  },

  buildLembretes() {
    return this.state.lembretes
      .map((l, idx) => {
        const prioClass =
          l.prioridade === "Alta"
            ? "pen-pill-alta"
            : l.prioridade === "Média"
              ? "pen-pill-media"
              : "pen-pill-baixa";

        return `
          <div class="pendencias-lembrete-item">
            <div class="pendencias-lembrete-text">
              ${l.texto}
            </div>

            <div class="pendencias-lembrete-actions">
              <span class="pen-pill ${prioClass}">${l.prioridade}</span>

              <button class="pen-icon-btn" type="button" title="Concluir" data-lembrete-check="${idx}">✓</button>
              <button class="pen-icon-btn" type="button" title="Excluir" data-lembrete-delete="${idx}">✕</button>
            </div>
          </div>
        `;
      })
      .join("");
  },

  buildAniversarios() {
    return this.state.aniversarios
      .map((a) => {
        return `
          <div class="pendencias-aniversario-item">
            <strong>${a.nome}</strong> — ${a.data}
          </div>
        `;
      })
      .join("");
  },
};
