// js/modules/recibos.js

window.Recibos = {
  state: {
    selected: null,
    previewPages: [],
    pageIndex: 0,
    formData: {},
  },

  async render() {
    const el = document.getElementById("recibos");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">RECIBOS</h1>
        </div>

        <div class="module-body">

          <div class="recibos-actions-top">
            <button class="btn btn-primary" id="rec-btn-gerar">Gerar</button>
            <button class="btn btn-warning" id="rec-btn-alterar" disabled>Alterar</button>
            <button class="btn btn-secondary" id="rec-btn-gravar" disabled>Gravar</button>
            <button class="btn btn-print" id="rec-btn-imprimir" disabled>Imprimir</button>
            <button class="btn btn-outline" id="rec-btn-ver">Abrir recibos</button>
          </div>

          <div class="recibos-grid">

            <div class="recibos-card">
              <h3 class="recibos-card-title">RESUMO ANUAL</h3>
              <div id="rec-resumo"></div>
            </div>

            <div class="recibos-card">
              <h3 class="recibos-card-title">LAYOUT DE IMPRESSÃO</h3>

              <div class="recibos-preview-wrap">
                <div class="recibos-preview" id="rec-preview">
                  <div class="recibos-preview-empty">
                    Nenhum recibo gerado.
                  </div>
                </div>
              </div>

              <div class="recibos-preview-nav">
                <button class="btn-arrow" id="rec-prev" disabled>◀</button>
                <span id="rec-page-info">0/0</span>
                <button class="btn-arrow" id="rec-next" disabled>▶</button>
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
    document.getElementById("rec-btn-gerar")?.addEventListener("click", () => {
      this.openForm("new");
    });

    document
      .getElementById("rec-btn-alterar")
      ?.addEventListener("click", () => {
        if (!this.state.selected) return;
        this.openForm("edit");
      });

    document
      .getElementById("rec-btn-imprimir")
      ?.addEventListener("click", () => {
        this.printRecibo();
      });

    document.getElementById("rec-btn-ver")?.addEventListener("click", () => {
      alert("Em breve: listagem de recibos.");
    });

    document.getElementById("rec-prev")?.addEventListener("click", () => {
      if (this.state.pageIndex > 0) {
        this.state.pageIndex--;
        this.paintPreview();
      }
    });

    document.getElementById("rec-next")?.addEventListener("click", () => {
      if (this.state.pageIndex < this.state.previewPages.length - 1) {
        this.state.pageIndex++;
        this.paintPreview();
      }
    });
  },

  /* ===========================
     HELPERS
  ============================ */

  escapeHTML(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  },

  digits(value) {
    return String(value ?? "").replace(/\D/g, "");
  },

  sanitizeName(value) {
    return String(value ?? "")
      .replace(/[^A-Za-zÀ-ÿ\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  onlyLettersKeydown(e) {
    const allowedControl = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
    ];
    if (allowedControl.includes(e.key)) return;

    const isLetter = /^[A-Za-zÀ-ÿ]$/.test(e.key);
    const isSpace = e.key === " ";

    if (!isLetter && !isSpace) e.preventDefault();
  },

  maskMoneyBR(value) {
    const d = this.digits(value);
    const cents = d ? parseInt(d, 10) : 0;

    const reais = Math.floor(cents / 100);
    const centavos = String(cents % 100).padStart(2, "0");
    const reaisStr = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${reaisStr},${centavos}`;
  },

  radio(name, value, selectedValue) {
    const id = `${name}-${this.slug(value)}`;
    const checked = String(value) === String(selectedValue) ? "checked" : "";
    return `
      <label for="${id}" style="display:flex;align-items:center;gap:10px;cursor:pointer;">
        <input type="radio" id="${id}" name="${name}" value="${this.escapeHTML(
          value,
        )}" ${checked} />
        <span>${this.escapeHTML(value)}</span>
      </label>
    `;
  },

  slug(s) {
    return String(s ?? "")
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  isoToday() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  },

  parseISO(iso) {
    if (!iso || typeof iso !== "string" || !iso.includes("-")) return null;
    const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  },

  splitDateISO(iso) {
    const dt = this.parseISO(iso);
    if (!dt) return { dia: "", mes: "", ano: "" };
    const dia = String(dt.getDate()).padStart(2, "0");
    const mes = String(dt.getMonth() + 1).padStart(2, "0");
    const ano = String(dt.getFullYear());
    return { dia, mes, ano };
  },

  openForm(mode = "new") {
    const d = mode === "edit" ? { ...this.state.selected } : {};

    const todayISO = this.isoToday();

    const valorInput = document.getElementById("rec-valor");

    if (valorInput) {
      valorInput.addEventListener("input", (e) => {
        e.target.value = this.maskMoneyBR(e.target.value);
      });

      valorInput.value = this.maskMoneyBR(valorInput.value || "0");
    }

    const inPagador = document.getElementById("rec-pagador-nome");
    const inAluno = document.getElementById("rec-aluno-nome");

    inPagador?.addEventListener("keydown", (e) => this.onlyLettersKeydown(e));
    inAluno?.addEventListener("keydown", (e) => this.onlyLettersKeydown(e));

    inPagador?.addEventListener("input", (e) => {
      e.target.value = this.sanitizeName(e.target.value);
    });
    inAluno?.addEventListener("input", (e) => {
      e.target.value = this.sanitizeName(e.target.value);
    });

    const content = `

    <h3 style="margin-bottom:20px;">
      ${mode === "edit" ? "Alterar Recibo" : "Gerar Recibo"}
    </h3>

    <div class="form-group">
      <label>Responsável</label>
      <input type="text" id="rec-pagador-nome" class="input"
      value="${this.escapeHTML(d.pagador_nome || "")}">
    </div>

    <div class="form-group">
      <label>Nome do Aluno</label>
      <input type="text" id="rec-aluno-nome" class="input"
      value="${this.escapeHTML(d.aluno_nome || "")}">
    </div>

    <div class="form-group">
      <label>Valor</label>
      <input type="text" id="rec-valor" class="input" inputmode="numeric"
      value="${this.escapeHTML(d.valor || "R$ 0,00")}">
    </div>

    <div class="form-group">
      <label>Referente a</label>
      <input type="text" id="rec-referente" class="input"
      value="${this.escapeHTML(d.referente_a || "")}">
    </div>

    <div class="form-group">
      <label>Data</label>
      <input type="date" id="rec-data" class="input"
      value="${this.escapeHTML(d.data_iso || todayISO)}">
    </div>

    <div style="text-align:right;margin-top:20px;">
      <button class="btn btn-primary" id="rec-confirm">Confirmar</button>
    </div>

  `;

    Modal.open(content, { width: "980px" });

    setTimeout(() => {
      const btn = document.getElementById("rec-confirm");

      if (!btn) return;

      btn.addEventListener("click", () => {
        const pagador =
          document.getElementById("rec-pagador-nome")?.value || "";
        const aluno = document.getElementById("rec-aluno-nome")?.value || "";
        const valor = document.getElementById("rec-valor")?.value || "";
        const referente = document.getElementById("rec-referente")?.value || "";
        const data = document.getElementById("rec-data")?.value || "";

        this.state.formData = {
          pagador_nome: pagador,
          aluno_nome: aluno,
          valor,
          referente_a: referente,
          data_iso: data,
        };

        Modal.close();

        this.generatePreview();
      });
    }, 0);
  },

  /* ===========================
     PREVIEW (mock aceitável)
  ============================ */

  generatePreview() {
    this.state.previewPages = [
      this.buildPreviewPage(1),
      this.buildPreviewPage(2),
      this.buildPreviewPage(3),
    ];

    this.state.pageIndex = 0;
    this.state.selected = { ...this.state.formData };

    this.paintPreview();
    this.paintResumo();

    const alterar = document.getElementById("rec-btn-alterar");
    const imprimir = document.getElementById("rec-btn-imprimir");
    const gravar = document.getElementById("rec-btn-gravar");
    if (alterar) alterar.disabled = false;
    if (imprimir) imprimir.disabled = false;
    if (gravar) gravar.disabled = false;
  },

  pageBody(n) {
    const d = this.state.formData || {};

    const page1 = `
    <h1 style="text-align:center;margin:0 0 16px 0;font-size:18px;">
      RECIBO DE PAGAMENTO
    </h1>

    <p>Recebemos de <strong>${this.escapeHTML(d.contratante_nome || "")}</strong>,
    CPF ${this.escapeHTML(d.contratante_cpf || "")}, a importância de
    <strong>${this.escapeHTML(d.valor_mensal || "")}</strong>.</p>

    <p>Referente aos serviços educacionais prestados ao aluno
    <strong>${this.escapeHTML(d.aluno_nome || "")}</strong>.</p>

    <p>Frequência das aulas: <strong>${this.escapeHTML(d.frequencia || "")}</strong></p>
    <p>Horário: <strong>${this.escapeHTML(d.turno || "")}</strong></p>
  `;

    const page2 = `
    <p>Este recibo confirma o pagamento referente às atividades de reforço escolar.</p>

    <p style="margin-top:18px;">
      Data: <strong>${this.escapeHTML(d.dia || "")}</strong> /
      <strong>${this.escapeHTML(d.mes || "")}</strong> /
      <strong>${this.escapeHTML(d.ano || "")}</strong>
    </p>
  `;

    const page3 = `
    <h3>ASSINATURA DO RESPONSÁVEL PELO RECEBIMENTO</h3>

    <div style="margin-top:50px;">
      <div style="border-top:1px solid #111; padding-top:10px; width:70%;">
        RESPONSÁVEL PELO RECEBIMENTO
      </div>
    </div>
  `;

    if (n === 1) return page1;
    if (n === 2) return page2;
    return page3;
  },

  buildPreviewPage(n) {
    return `
      <div class="recibos-page">
        <div class="recibos-page-sheet" style="border-radius:0 !important;">
          <div class="recibos-page-body" style="font-size:11px;line-height:1.35;">
            ${this.pageBody(n)}
            <p style="margin-top:18px;color:#6b7280;font-size:11px;">Página ${n} de 3</p>
          </div>
        </div>
      </div>
    `;
  },

  paintPreview() {
    const preview = document.getElementById("rec-preview");
    const info = document.getElementById("rec-page-info");
    const prev = document.getElementById("rec-prev");
    const next = document.getElementById("rec-next");

    if (!preview || !info || !prev || !next) return;

    if (!this.state.previewPages.length) {
      preview.innerHTML = `
        <div class="recibos-preview-empty">
          Nenhum recibos gerado.
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
  },

  paintResumo() {
    const el = document.getElementById("rec-resumo");
    if (!el) return;

    const total = this.state.selected ? 1 : 0;

    el.innerHTML = `
    <div class="recibos-kpi"><span>Total:</span><strong>${total}</strong></div>
    <div class="recibos-kpi"><span>Emitidos:</span><strong>${total}</strong></div>
    <div class="recibos-kpi"><span>Cancelados:</span><strong>0</strong></div>
    <div class="recibos-kpi"><span>Arquivados:</span><strong>0</strong></div>
  `;
  },

  /* ===========================
     IMPRESSÃO (A4 REAL)
     - não usa tamanho do preview
  ============================ */

  printRecibo() {
    if (!this.state.selected) return;

    const d = this.state.selected;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Recibo</title>

<style>

@page {
  size: A4;
  margin: 20mm;
}

body{
  font-family: Arial, Helvetica, sans-serif;
  color:#000;
  margin:0;
}

.page{
  page-break-after:always;
}

.page:last-child{
  page-break-after:auto;
}

h1{
  text-align:center;
  font-size:18pt;
  margin-bottom:20px;
}

h3{
  font-size:12pt;
  margin-top:16px;
}

p{
  font-size:12pt;
  line-height:1.5;
  text-align:justify;
}

.assinatura{
  margin-top:60px;
  border-top:1px solid #000;
  width:70%;
  padding-top:8px;
}

</style>
</head>

<body>

  <div class="page">

    <p>
      Recebemos de <strong>${d.contratante_nome || ""}</strong> a importância de
      <strong>${d.valor_mensal || ""}</strong>, referente ao pagamento
      ${d.referente_a ? `de ${d.referente_a}` : "das mensalidades do serviço prestado"}
      de reforço escolar do aluno <strong>${d.aluno_nome || ""}</strong>.
    </p>

    <p style="margin-top:30px;">
      São Luís, ${d.dia || ""} de ${d.mes || ""} de ${d.ano || ""}.
    </p>

    <div style="margin-top:60px; text-align:center;">
      Professora/proprietária
    </div>

    <p style="margin-top:30px; font-size:11pt;">
      <strong>CNPJ:</strong> 49.095.272/0001-01<br/>
      <strong>Endereço:</strong> Rua Pernambuco, n. 98, RJ Center, sala 07, Chácara Brasil, Turu. CEP: 65066-620<br/>
      <strong>Contato:</strong> (98) 98584-2680 (Whatsapp)<br/>
      <strong>E-mail:</strong> mentoriareforcoescolar@gmail.com.br
    </p>

  </div>


  <div class="page">

    <p>
      Recebemos de <strong>${d.contratante_nome || ""}</strong> a importância de
      <strong>${d.valor_mensal || ""}</strong>, referente ao pagamento
      ${d.referente_a ? `de ${d.referente_a}` : "das mensalidades do serviço prestado"}
      de reforço escolar do aluno <strong>${d.aluno_nome || ""}</strong>.
    </p>

    <p style="margin-top:30px;">
      São Luís, ${d.dia || ""} de ${d.mes || ""} de ${d.ano || ""}.
    </p>

    <div style="margin-top:60px; text-align:center;">
      Professora/proprietária
    </div>

  </div>

</body>
</html>
`;

    const win = window.open("", "_blank");

    win.document.open();
    win.document.write(html);
    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
    }, 300);
  },

  pageBodyPrint(n, d) {
    const esc = (v) => this.escapeHTML(v);

    const p1 = `
      <h1>recibos DE PRESTAÇÃO DE SERVIÇOS<br/>EDUCACIONAIS</h1>

      <p><strong>CONTRATANTE:</strong> ${esc(d.contratante_nome || "")}, RG ${esc(
        d.contratante_rg || "",
      )}, CPF ${esc(d.contratante_cpf || "")}, residente e domiciliado(a) em ${esc(
        d.contratante_endereco || "",
      )}.</p>

      <p><strong>ALUNO(A):</strong> ${esc(d.aluno_nome || "")}.</p>

      <h3>CLÁUSULA 1 — DO OBJETO</h3>
      <p>O presente recibos tem por objeto a prestação de serviços de reforço escolar, conforme condições descritas neste instrumento.</p>

      <h3>CLÁUSULA 2 — DA FREQUÊNCIA E HORÁRIO</h3>
      <p>As aulas ocorrerão com frequência de <strong>${esc(
        d.frequencia || "",
      )}</strong>, no horário <strong>${esc(
        d.turno || "",
      )}</strong>, podendo haver ajustes mediante acordo entre as partes.</p>

      <h3>CLÁUSULA 3 — DO VALOR E FORMA DE PAGAMENTO</h3>
      <p>O valor mensal ajustado é de <strong>${esc(
        d.valor_mensal || "",
      )}</strong>, com vencimento todo dia <strong>${esc(
        d.vencimento || "",
      )}</strong> de cada mês.</p>
    `;

    const p2 = `
      <h3>CLÁUSULA 4 — DO CANCELAMENTO E REPOSIÇÕES</h3>
      <p>Cancelamentos e reposições deverão ser comunicados com antecedência razoável, conforme política interna do reforço escolar.</p>

      <h3>CLÁUSULA 5 — DISPOSIÇÕES GERAIS</h3>
      <p>As partes declaram estar de acordo com as condições do presente instrumento, comprometendo-se a cumpri-lo integralmente.</p>

      <p style="margin-top:18px;">
        Data: <strong>${esc(d.dia || "")}</strong>/<strong>${esc(
          d.mes || "",
        )}</strong>/<strong>${esc(d.ano || "")}</strong>
      </p>
    `;

    const p3 = `
      <h3>ASSINATURAS</h3>

      <div style="margin-top:50px;">
        <div style="border-top:1px solid #111; padding-top:10px; width:70%;">CONTRATANTE</div>
      </div>

      <div style="margin-top:50px;">
        <div style="border-top:1px solid #111; padding-top:10px; width:70%;">CONTRATADO</div>
      </div>
    `;

    if (n === 1) return p1;
    if (n === 2) return p2;
    return p3;
  },
};
