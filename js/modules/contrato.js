// js/modules/contrato.js

window.Contrato = {
  state: {
    selected: null,
    previewPages: [],
    pageIndex: 0,
    formData: {},
  },

  async render() {
    const el = document.getElementById("contrato");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">CONTRATOS</h1>
        </div>

        <div class="module-body">

          <div class="contrato-actions-top">
            <button class="btn btn-primary" id="con-btn-gerar">Gerar</button>
            <button class="btn btn-warning" id="con-btn-alterar" disabled>Alterar</button>
            <button class="btn btn-secondary" id="con-btn-gravar" disabled>Gravar</button>
            <button class="btn btn-print" id="con-btn-imprimir" disabled>Imprimir</button>
            <button class="btn btn-outline" id="con-btn-ver">Ver contratos</button>
          </div>

          <div class="contrato-grid">

            <div class="contrato-card">
              <h3 class="contrato-card-title">RESUMO ANUAL</h3>
              <div id="con-resumo"></div>
            </div>

            <div class="contrato-card">
              <h3 class="contrato-card-title">LAYOUT DE IMPRESSÃO</h3>

              <div class="contrato-preview-wrap">
                <div class="contrato-preview" id="con-preview">
                  <div class="contrato-preview-empty">
                    Nenhum contrato gerado.
                  </div>
                </div>
              </div>

              <div class="contrato-preview-nav">
                <button class="btn-arrow" id="con-prev" disabled>◀</button>
                <span id="con-page-info">0/0</span>
                <button class="btn-arrow" id="con-next" disabled>▶</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.paintResumo();
    this.bindUI();
  },

  bindUI() {
    document.getElementById("con-btn-gerar")?.addEventListener("click", () => {
      this.openStep1();
    });

    document.getElementById("con-prev")?.addEventListener("click", () => {
      if (this.state.pageIndex > 0) {
        this.state.pageIndex--;
        this.paintPreview();
      }
    });

    document.getElementById("con-next")?.addEventListener("click", () => {
      if (this.state.pageIndex < this.state.previewPages.length - 1) {
        this.state.pageIndex++;
        this.paintPreview();
      }
    });
  },

  /* ===========================
     MODAL ETAPA 1
  ============================ */

  openStep1() {
    const content = `
      <h3 style="margin-bottom:20px;">Gerar Contrato - Etapa 1</h3>

      <div class="form-group">
        <label>Nome do Responsável</label>
        <input type="text" id="con-responsavel" class="input" />
      </div>

      <div class="form-group">
        <label>CPF</label>
        <input type="text" id="con-cpf" class="input" />
      </div>

      <div class="form-group">
        <label>Valor (R$)</label>
        <input type="number" id="con-valor" class="input" />
      </div>

      <div class="form-group">
        <label>Data da Assinatura</label>
        <input type="date" id="con-data" class="input" />
      </div>

      <div style="text-align:right;margin-top:20px;">
        <button class="btn btn-primary" id="con-next-step">Próximo</button>
      </div>
    `;

    Modal.open(content);

    setTimeout(() => {
      document
        .getElementById("con-next-step")
        ?.addEventListener("click", () => {
          this.state.formData = {
            responsavel: document
              .getElementById("con-responsavel")
              ?.value.trim(),
            cpf: document.getElementById("con-cpf")?.value.trim(),
            valor: document.getElementById("con-valor")?.value.trim(),
            data: document.getElementById("con-data")?.value.trim(),
          };

          Modal.close();
          this.openStep2();
        });
    }, 0);
  },

  /* ===========================
     MODAL ETAPA 2
  ============================ */

  openStep2() {
    const content = `
      <h3 style="margin-bottom:20px;">Gerar Contrato - Etapa 2</h3>

      <div class="form-group">
        <label>Turno</label>
        <select id="con-turno" class="input">
          <option value="Matutino">Matutino</option>
          <option value="Vespertino">Vespertino</option>
        </select>
      </div>

      <div class="form-group">
        <label>Dia do Vencimento</label>
        <select id="con-vencimento" class="input">
          <option value="5">5</option>
          <option value="8">8</option>
          <option value="10">10</option>
        </select>
      </div>

      <div style="text-align:right;margin-top:20px;">
        <button class="btn btn-primary" id="con-confirm">Confirmar</button>
      </div>
    `;

    Modal.open(content);

    setTimeout(() => {
      document.getElementById("con-confirm")?.addEventListener("click", () => {
        this.state.formData.turno = document.getElementById("con-turno")?.value;

        this.state.formData.vencimento =
          document.getElementById("con-vencimento")?.value;

        Modal.close();
        this.generatePreview();
      });
    }, 0);
  },

  /* ===========================
     GERA PREVIEW APÓS CONFIRMAÇÃO
  ============================ */

  generatePreview() {
    this.state.previewPages = [
      this.buildPage(1),
      this.buildPage(2),
      this.buildPage(3),
      this.buildPage(4),
    ];

    this.state.pageIndex = 0;
    this.state.selected = { ...this.state.formData };

    this.paintPreview();
    this.paintResumo();
  },

  buildPage(n) {
    const d = this.state.formData;

    return `
      <div class="contrato-page">
        <div class="contrato-page-sheet">
          <div class="contrato-page-watermark">
            CONTRATO — PÁGINA ${n}
          </div>
          <div class="contrato-page-body">
            <p><strong>Responsável:</strong> ${d.responsavel || ""}</p>
            <p><strong>CPF:</strong> ${d.cpf || ""}</p>
            <p><strong>Valor:</strong> R$ ${d.valor || ""}</p>
            <p><strong>Turno:</strong> ${d.turno || ""}</p>
            <p><strong>Vencimento:</strong> Dia ${d.vencimento || ""}</p>
            <p><strong>Data:</strong> ${d.data || ""}</p>
          </div>
        </div>
      </div>
    `;
  },

  /* ===========================
     RENDERIZAÇÃO
  ============================ */

  paintPreview() {
    const preview = document.getElementById("con-preview");
    const info = document.getElementById("con-page-info");
    const prev = document.getElementById("con-prev");
    const next = document.getElementById("con-next");

    if (!preview || !info || !prev || !next) return;

    if (!this.state.previewPages.length) {
      preview.innerHTML = `
        <div class="contrato-preview-empty">
          Nenhum contrato gerado.
        </div>
      `;
      info.textContent = "0/0";
      prev.disabled = true;
      next.disabled = true;
      return;
    }

    preview.innerHTML = this.state.previewPages[this.state.pageIndex];

    info.textContent = `${this.state.pageIndex + 1}/${this.state.previewPages.length}`;

    prev.disabled = this.state.pageIndex === 0;
    next.disabled = this.state.pageIndex === this.state.previewPages.length - 1;

    document.getElementById("con-btn-imprimir").disabled = false;
    document.getElementById("con-btn-gravar").disabled = false;
  },

  paintResumo() {
    const el = document.getElementById("con-resumo");
    if (!el) return;

    const total = this.state.selected ? 1 : 0;

    el.innerHTML = `
      <div class="contrato-kpi"><span>Total:</span><strong>${total}</strong></div>
      <div class="contrato-kpi"><span>Gerados:</span><strong>${total}</strong></div>
      <div class="contrato-kpi"><span>Assinados:</span><strong>0</strong></div>
      <div class="contrato-kpi"><span>Não assinados:</span><strong>0</strong></div>
      <div class="contrato-kpi"><span>Arquivados:</span><strong>0</strong></div>
    `;
  },
};
