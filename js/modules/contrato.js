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
      this.openStep1("new");
    });

    document
      .getElementById("con-btn-alterar")
      ?.addEventListener("click", () => {
        if (!this.state.selected) return;
        this.openStep1("edit");
      });

    document
      .getElementById("con-btn-imprimir")
      ?.addEventListener("click", () => {
        this.printContrato();
      });

    document.getElementById("con-btn-ver")?.addEventListener("click", () => {
      alert("Em breve: listagem de contratos.");
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

  maskCPF(value) {
    const d = this.digits(value).slice(0, 11);
    const p1 = d.slice(0, 3);
    const p2 = d.slice(3, 6);
    const p3 = d.slice(6, 9);
    const p4 = d.slice(9, 11);

    let out = p1;
    if (p2) out += "." + p2;
    if (p3) out += "." + p3;
    if (p4) out += "-" + p4;
    return out;
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

  /* ===========================
     MODAL ETAPA 1
  ============================ */

  openStep1(mode = "new") {
    const d = mode === "edit" ? { ...this.state.selected } : {};

    const content = `
      <h3 style="margin-bottom:20px;">${
        mode === "edit" ? "Alterar Contrato" : "Gerar Contrato"
      } — Etapa 1</h3>

      <div class="form-group">
        <label>Nome do Responsável</label>
        <input type="text" id="con-contratante-nome" class="input" value="${this.escapeHTML(
          d.contratante_nome || "",
        )}" />
      </div>

      <div class="form-group">
        <label>RG</label>
        <input type="text" id="con-contratante-rg" class="input" inputmode="numeric" value="${this.escapeHTML(
          d.contratante_rg || "",
        )}" />
      </div>

      <div class="form-group">
        <label>CPF</label>
        <input type="text" id="con-contratante-cpf" class="input" inputmode="numeric" placeholder="000.000.000-00" value="${this.escapeHTML(
          d.contratante_cpf || "",
        )}" />
      </div>

      <div class="form-group">
        <label>Endereço</label>
        <input type="text" id="con-contratante-endereco" class="input" value="${this.escapeHTML(
          d.contratante_endereco || "",
        )}" />
      </div>

      <div class="form-group">
        <label>Nome do Aluno</label>
        <input type="text" id="con-aluno-nome" class="input" value="${this.escapeHTML(
          d.aluno_nome || "",
        )}" />
      </div>

      <div style="text-align:right;margin-top:20px;">
        <button class="btn btn-primary" id="con-next-step">Próximo</button>
      </div>
    `;

    Modal.open(content, { width: "980px" });

    setTimeout(() => {
      const inResp = document.getElementById("con-contratante-nome");
      const inAluno = document.getElementById("con-aluno-nome");
      const inCPF = document.getElementById("con-contratante-cpf");
      const inRG = document.getElementById("con-contratante-rg");

      // nomes: só letras
      inResp?.addEventListener("keydown", (e) => this.onlyLettersKeydown(e));
      inAluno?.addEventListener("keydown", (e) => this.onlyLettersKeydown(e));
      inResp?.addEventListener("input", (e) => {
        e.target.value = this.sanitizeName(e.target.value);
      });
      inAluno?.addEventListener("input", (e) => {
        e.target.value = this.sanitizeName(e.target.value);
      });

      // RG: numérico livre (sem máscara rígida)
      inRG?.addEventListener("input", (e) => {
        e.target.value = this.digits(e.target.value);
      });

      // CPF: máscara
      inCPF?.addEventListener("input", (e) => {
        e.target.value = this.maskCPF(e.target.value);
      });

      document
        .getElementById("con-next-step")
        ?.addEventListener("click", () => {
          this.state.formData = {
            ...(mode === "edit" ? { ...this.state.selected } : {}),
            contratante_nome: this.sanitizeName(inResp?.value || ""),
            contratante_rg: this.digits(inRG?.value || ""),
            contratante_cpf: this.maskCPF(inCPF?.value || ""),
            contratante_endereco: (
              document.getElementById("con-contratante-endereco")?.value || ""
            ).trim(),
            aluno_nome: this.sanitizeName(inAluno?.value || ""),
          };

          Modal.close();
          this.openStep2(mode);
        });
    }, 0);
  },

  /* ===========================
     MODAL ETAPA 2
  ============================ */

  openStep2(mode = "new") {
    const d = this.state.formData || {};

    const freq = d.frequencia || "2x por semana";
    const turno = d.turno || "Matutino — 09h30 às 11h30";
    const venc = d.vencimento || "5";
    const valor = d.valor_mensal || "R$ 0,00";

    const todayISO = this.isoToday();
    const initialISO = d.data_iso || todayISO;

    const content = `
      <h3 style="margin-bottom:20px;">${
        mode === "edit" ? "Alterar Contrato" : "Gerar Contrato"
      } — Etapa 2</h3>

      <div class="form-group">
        <label>Frequência</label>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          ${this.radio("con-frequencia", "2x por semana", freq)}
          ${this.radio("con-frequencia", "3x por semana", freq)}
          ${this.radio("con-frequencia", "5x por semana", freq)}
        </div>
      </div>

      <div class="form-group">
        <label>Horário</label>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${this.radio("con-turno", "Matutino — 09h30 às 11h30", turno)}
          ${this.radio("con-turno", "Vespertino — 14h00 às 16h00", turno)}
          ${this.radio("con-turno", "Vespertino — 16h00 às 18h00", turno)}
        </div>
      </div>

      <div class="form-group">
        <label>Dia do vencimento</label>
        <select id="con-vencimento" class="input">
          ${["5", "8", "10"]
            .map(
              (v) =>
                `<option value="${v}" ${
                  String(venc) === String(v) ? "selected" : ""
                }>${v}</option>`,
            )
            .join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Valor mensal</label>
        <input type="text" id="con-valor" class="input" inputmode="numeric" value="${this.escapeHTML(
          valor,
        )}" />
      </div>

      <div class="form-group">
        <label>Data do contrato</label>
        <input type="date" id="con-data" class="input" value="${this.escapeHTML(
          initialISO,
        )}" />
      </div>

      <div style="text-align:right;margin-top:20px;">
        <button class="btn btn-primary" id="con-confirm">Confirmar</button>
      </div>
    `;

    Modal.open(content, { width: "980px" });

    setTimeout(() => {
      const inValor = document.getElementById("con-valor");
      const inData = document.getElementById("con-data");

      // valor: moeda BR
      inValor?.addEventListener("input", (e) => {
        e.target.value = this.maskMoneyBR(e.target.value);
      });
      if (inValor && inValor.value)
        inValor.value = this.maskMoneyBR(inValor.value);

      // data: não permitir retroativa
      if (inData) {
        inData.min = todayISO;
        if (!inData.value) inData.value = todayISO;
        if (inData.value < todayISO) inData.value = todayISO;
      }

      document.getElementById("con-confirm")?.addEventListener("click", () => {
        const frequencia =
          document.querySelector('input[name="con-frequencia"]:checked')
            ?.value || "2x por semana";

        const turno =
          document.querySelector('input[name="con-turno"]:checked')?.value ||
          "Matutino — 09h30 às 11h30";

        const dataISO = inData?.value || todayISO;
        if (dataISO < todayISO) {
          alert("A data do contrato não pode ser anterior à data atual.");
          return;
        }

        const { dia, mes, ano } = this.splitDateISO(dataISO);

        this.state.formData = {
          ...this.state.formData,
          frequencia,
          turno,
          vencimento: document.getElementById("con-vencimento")?.value || "5",
          valor_mensal: this.maskMoneyBR(inValor?.value || "0"),
          data_iso: dataISO,
          dia,
          mes,
          ano,
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

    const alterar = document.getElementById("con-btn-alterar");
    const imprimir = document.getElementById("con-btn-imprimir");
    const gravar = document.getElementById("con-btn-gravar");
    if (alterar) alterar.disabled = false;
    if (imprimir) imprimir.disabled = false;
    if (gravar) gravar.disabled = false;
  },

  pageBody(n) {
    const d = this.state.formData || {};
    const page1 = `
      <h1 style="text-align:center;margin:0 0 16px 0;font-size:18px;">
        CONTRATO DE PRESTAÇÃO DE SERVIÇOS<br/>EDUCACIONAIS
      </h1>

      <p><strong>CONTRATANTE:</strong> ${this.escapeHTML(
        d.contratante_nome || "",
      )}, RG ${this.escapeHTML(d.contratante_rg || "")}, CPF ${this.escapeHTML(
        d.contratante_cpf || "",
      )}, residente e domiciliado(a) em ${this.escapeHTML(
        d.contratante_endereco || "",
      )}.</p>

      <p><strong>ALUNO(A):</strong> ${this.escapeHTML(d.aluno_nome || "")}.</p>

      <h3 style="margin:12px 0 6px 0;font-size:13px;">CLÁUSULA 1 — DO OBJETO</h3>
      <p>O presente contrato tem por objeto a prestação de serviços de reforço escolar, conforme condições descritas neste instrumento.</p>

      <h3 style="margin:12px 0 6px 0;font-size:13px;">CLÁUSULA 2 — DA FREQUÊNCIA E HORÁRIO</h3>
      <p>As aulas ocorrerão com frequência de <strong>${this.escapeHTML(
        d.frequencia || "",
      )}</strong>, no horário <strong>${this.escapeHTML(
        d.turno || "",
      )}</strong>, podendo haver ajustes mediante acordo entre as partes.</p>

      <h3 style="margin:12px 0 6px 0;font-size:13px;">CLÁUSULA 3 — DO VALOR E FORMA DE PAGAMENTO</h3>
      <p>O valor mensal ajustado é de <strong>${this.escapeHTML(
        d.valor_mensal || "",
      )}</strong>, com vencimento todo dia <strong>${this.escapeHTML(
        d.vencimento || "",
      )}</strong> de cada mês.</p>
    `;

    const page2 = `
      <h3 style="margin:0 0 6px 0;font-size:13px;">CLÁUSULA 4 — DO CANCELAMENTO E REPOSIÇÕES</h3>
      <p>Cancelamentos e reposições deverão ser comunicados com antecedência razoável, conforme política interna do reforço escolar.</p>

      <h3 style="margin:12px 0 6px 0;font-size:13px;">CLÁUSULA 5 — DISPOSIÇÕES GERAIS</h3>
      <p>As partes declaram estar de acordo com as condições do presente instrumento, comprometendo-se a cumpri-lo integralmente.</p>

      <p style="margin-top:18px;">
        Data: <strong>${this.escapeHTML(d.dia || "")}</strong>/<strong>${this.escapeHTML(
          d.mes || "",
        )}</strong>/<strong>${this.escapeHTML(d.ano || "")}</strong>
      </p>
    `;

    const page3 = `
      <h3 style="margin:0 0 10px 0;font-size:13px;">ASSINATURAS</h3>

      <div style="margin-top:40px;">
        <div style="border-top:1px solid #111; padding-top:8px; width:70%;">CONTRATANTE</div>
      </div>

      <div style="margin-top:40px;">
        <div style="border-top:1px solid #111; padding-top:8px; width:70%;">CONTRATADO</div>
      </div>
    `;

    if (n === 1) return page1;
    if (n === 2) return page2;
    return page3;
  },

  buildPreviewPage(n) {
    return `
      <div class="contrato-page">
        <div class="contrato-page-sheet" style="border-radius:0 !important;">
          <div class="contrato-page-body" style="font-size:11px;line-height:1.35;">
            ${this.pageBody(n)}
            <p style="margin-top:18px;color:#6b7280;font-size:11px;">Página ${n} de 3</p>
          </div>
        </div>
      </div>
    `;
  },

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

  /* ===========================
     IMPRESSÃO (A4 REAL)
     - não usa tamanho do preview
  ============================ */

  printContrato() {
    if (!this.state.selected) return;

    const d = this.state.selected;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Contrato</title>

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

<h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h1>

<p><strong>CONTRATANTE:</strong> ${d.contratante_nome}, RG ${d.contratante_rg}, CPF ${d.contratante_cpf}, residente em ${d.contratante_endereco}.</p>

<p><strong>ALUNO(A):</strong> ${d.aluno_nome}</p>

<h3>CLÁUSULA 1 — DO OBJETO</h3>
<p>O presente contrato tem por objeto a prestação de serviços de reforço escolar.</p>

<h3>CLÁUSULA 2 — DA FREQUÊNCIA E HORÁRIO</h3>
<p>As aulas ocorrerão com frequência de <strong>${d.frequencia}</strong>, no horário <strong>${d.turno}</strong>.</p>

<h3>CLÁUSULA 3 — DO VALOR</h3>
<p>O valor mensal ajustado é de <strong>${d.valor_mensal}</strong>, com vencimento no dia <strong>${d.vencimento}</strong> de cada mês.</p>

</div>


<div class="page">

<h3>CLÁUSULA 4 — CANCELAMENTO</h3>
<p>Cancelamentos e reposições deverão ser comunicados previamente.</p>

<h3>CLÁUSULA 5 — DISPOSIÇÕES GERAIS</h3>
<p>As partes concordam com todos os termos descritos neste instrumento.</p>

<p style="margin-top:30px;">
Data: ${d.dia}/${d.mes}/${d.ano}
</p>

</div>


<div class="page">

<h3>ASSINATURAS</h3>

<div class="assinatura">CONTRATANTE</div>

<div class="assinatura">CONTRATADO</div>

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
      <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS<br/>EDUCACIONAIS</h1>

      <p><strong>CONTRATANTE:</strong> ${esc(d.contratante_nome || "")}, RG ${esc(
        d.contratante_rg || "",
      )}, CPF ${esc(d.contratante_cpf || "")}, residente e domiciliado(a) em ${esc(
        d.contratante_endereco || "",
      )}.</p>

      <p><strong>ALUNO(A):</strong> ${esc(d.aluno_nome || "")}.</p>

      <h3>CLÁUSULA 1 — DO OBJETO</h3>
      <p>O presente contrato tem por objeto a prestação de serviços de reforço escolar, conforme condições descritas neste instrumento.</p>

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
