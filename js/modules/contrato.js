// js/modules/contrato.js

window.Contrato = {
  state: {
    ano: new Date().getFullYear(),
    contratos: [], // mock inicial
    selected: null,
    previewHtml: "",
    previewPage: 1,
  },

  render() {
    const el = document.getElementById("contrato");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">

        <div class="contrato-topbar">

          <div class="contrato-year-nav">
            <button class="btn-arrow" id="con-ano-prev">◀</button>
            <span class="contrato-year" id="con-ano-label">${this.state.ano}</span>
            <button class="btn-arrow" id="con-ano-next">▶</button>
          </div>

          <div class="contrato-actions">
            <button class="btn btn-primary" id="con-btn-gerar">Gerar</button>
            <button class="btn btn-warning" id="con-btn-alterar" disabled>Alterar</button>
            <button class="btn btn-success" id="con-btn-gravar" disabled>Gravar</button>
            <button class="btn btn-print" id="con-btn-imprimir" disabled>Imprimir</button>
          </div>

        </div>

        <h2>Contratos</h2>

        <div class="contrato-grid">

          <!-- CARD RESUMO -->
          <div class="contrato-card">
            <h3>Resumo Anual</h3>
            <div id="contrato-resumo" class="con-kpis"></div>
          </div>

          <!-- CARD PREVIEW -->
          <div class="contrato-card contrato-preview-card">
            <h3>Pré-visualização</h3>

            <div class="contrato-preview-wrapper">

              <button class="btn-arrow" id="con-prev-page">◀</button>

              <div class="contrato-preview" id="contrato-preview">
                <div class="contrato-empty">
                  Nenhum contrato gerado.
                </div>
              </div>

              <button class="btn-arrow" id="con-next-page">▶</button>

            </div>

            <div class="contrato-page-info" id="con-page-info">
              Página 0 / 0
            </div>

          </div>

        </div>

      </div>
    `;

    this.bindUI();
    this.paintResumo();
  },

  bindUI() {
    document.getElementById("con-ano-prev")?.addEventListener("click", () => {
      this.state.ano--;
      this.syncYear();
      this.paintResumo();
    });

    document.getElementById("con-ano-next")?.addEventListener("click", () => {
      this.state.ano++;
      this.syncYear();
      this.paintResumo();
    });

    document.getElementById("con-btn-gerar")?.addEventListener("click", () => {
      this.openGerarModal();
    });

    document.getElementById("con-prev-page")?.addEventListener("click", () => {
      if (this.state.previewPage > 1) {
        this.state.previewPage--;
        this.updatePreviewPage();
      }
    });

    document.getElementById("con-next-page")?.addEventListener("click", () => {
      const total = this.getPreviewTotalPages();
      if (this.state.previewPage < total) {
        this.state.previewPage++;
        this.updatePreviewPage();
      }
    });
  },

  syncYear() {
    const label = document.getElementById("con-ano-label");
    if (label) label.textContent = this.state.ano;
  },

  paintResumo() {
    const el = document.getElementById("contrato-resumo");
    if (!el) return;

    const total = this.state.contratos.length;
    const assinados = this.state.contratos.filter(
      (c) => c.status === "assinado",
    ).length;
    const gerados = this.state.contratos.filter(
      (c) => c.status === "gerado",
    ).length;
    const arquivados = this.state.contratos.filter(
      (c) => c.status === "arquivado",
    ).length;

    el.innerHTML = `
      <div class="con-kpi">
        <span>Total</span>
        <strong>${total}</strong>
      </div>
      <div class="con-kpi">
        <span>Assinados</span>
        <strong>${assinados}</strong>
      </div>
      <div class="con-kpi">
        <span>Gerados</span>
        <strong>${gerados}</strong>
      </div>
      <div class="con-kpi">
        <span>Arquivados</span>
        <strong>${arquivados}</strong>
      </div>
    `;
  },

  openGerarModal() {
    Modal.open(`
      <h2>Gerar Contrato</h2>
      <p>Etapa 1 - Dados do Contrato (em construção)</p>
      <button class="btn btn-primary" id="teste-gerar">Simular geração</button>
    `);

    document.getElementById("teste-gerar")?.addEventListener("click", () => {
      this.simularContrato();
      Modal.close();
    });
  },

  simularContrato() {
    const html = `
      <div class="contrato-a4-page">
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
        <p>Contrato gerado para teste.</p>
      </div>
    `;

    this.state.previewHtml = html;
    this.state.previewPage = 1;

    this.renderPreview();
  },

  renderPreview() {
    const el = document.getElementById("contrato-preview");
    if (!el) return;

    el.innerHTML = this.state.previewHtml;

    this.updatePreviewPage();
  },

  updatePreviewPage() {
    const info = document.getElementById("con-page-info");
    const total = this.getPreviewTotalPages();

    if (info) {
      info.textContent = `Página ${this.state.previewPage} / ${total}`;
    }
  },

  getPreviewTotalPages() {
    return this.state.previewHtml ? 1 : 0;
  },
};
