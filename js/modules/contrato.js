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
      this.openStep1(false);
    });

    document
      .getElementById("con-btn-alterar")
      ?.addEventListener("click", () => {
        if (!this.state.selected) return;
        this.openStep1(true);
      });

    document
      .getElementById("con-btn-imprimir")
      ?.addEventListener("click", () => {
        if (!this.state.previewPages.length) return;
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

    document
      .getElementById("con-btn-imprimir")
      ?.addEventListener("click", () => {
        this.printContrato();
      });
  },

  /* ===========================
     MODAL ETAPA 1
  ============================ */

  openStep1(isEdit) {
    const d = isEdit ? this.state.formData || this.state.selected || {} : {};

    const content = `
      <h3 style="margin-bottom:20px;">${isEdit ? "Alterar Contrato" : "Gerar Contrato"} — Etapa 1</h3>

      <div class="form-group">
        <label>Nome do Responsável ({{contratante_nome}})</label>
        <input type="text" id="con-contratante-nome" class="input" value="${this.esc(d.contratante_nome)}" />
      </div>

      <div class="form-group">
        <label>RG ({{contratante_rg}})</label>
        <input type="text" id="con-contratante-rg" class="input" value="${this.esc(d.contratante_rg)}" />
      </div>

      <div class="form-group">
        <label>CPF ({{contratante_cpf}})</label>
        <input type="text" id="con-contratante-cpf" class="input" value="${this.esc(d.contratante_cpf)}" />
      </div>

      <div class="form-group">
        <label>Endereço ({{contratante_endereco}})</label>
        <input type="text" id="con-contratante-endereco" class="input" value="${this.esc(d.contratante_endereco)}" />
      </div>

      <div class="form-group">
        <label>Nome do Aluno ({{aluno_nome}})</label>
        <input type="text" id="con-aluno-nome" class="input" value="${this.esc(d.aluno_nome)}" />
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
            ...(this.state.formData || {}),
            contratante_nome:
              document.getElementById("con-contratante-nome")?.value.trim() ||
              "",
            contratante_rg:
              document.getElementById("con-contratante-rg")?.value.trim() || "",
            contratante_cpf:
              document.getElementById("con-contratante-cpf")?.value.trim() ||
              "",
            contratante_endereco:
              document
                .getElementById("con-contratante-endereco")
                ?.value.trim() || "",
            aluno_nome:
              document.getElementById("con-aluno-nome")?.value.trim() || "",
          };

          Modal.close();
          this.openStep2(isEdit);
        });
    }, 0);
  },

  /* ===========================
     MODAL ETAPA 2
  ============================ */

  openStep2(isEdit) {
    const d = this.state.formData || {};

    const content = `
      <h3 style="margin-bottom:20px;">${isEdit ? "Alterar Contrato" : "Gerar Contrato"} — Etapa 2</h3>

      <div class="form-group">
        <label>Frequência ({{frequencia}})</label>
        <input type="text" id="con-frequencia" class="input" placeholder="Ex: 2x por semana" value="${this.esc(d.frequencia)}" />
      </div>

      <div class="form-group">
        <label>Horário ({{horario}})</label>
        <input type="text" id="con-horario" class="input" placeholder="Ex: 08:00 às 10:00" value="${this.esc(d.horario)}" />
      </div>

      <div class="form-group">
        <label>Valor Mensal ({{valor_mensal}})</label>
        <input type="text" id="con-valor-mensal" class="input" placeholder="Ex: 350" value="${this.esc(d.valor_mensal)}" />
      </div>

      <div class="form-group">
        <label>Dia do Vencimento ({{vencimento}})</label>
        <select id="con-vencimento" class="input">
          ${this.buildOptions(["5", "8", "10", "15"], d.vencimento)}
        </select>
      </div>

      <div class="form-group">
        <label>Autorização de uso de imagem ({{uso_imagem}})</label>
        <select id="con-uso-imagem" class="input">
          ${this.buildOptions(["Sim", "Não"], d.uso_imagem)}
        </select>
      </div>

      <div class="form-group">
        <label>Data da Assinatura</label>
        <input type="date" id="con-data" class="input" value="${this.esc(d.data_iso)}" />
      </div>

      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
        <button class="btn btn-outline" id="con-back-step">Voltar</button>
        <button class="btn btn-primary" id="con-confirm">Confirmar</button>
      </div>
    `;

    Modal.open(content);

    setTimeout(() => {
      document
        .getElementById("con-back-step")
        ?.addEventListener("click", () => {
          Modal.close();
          this.openStep1(true);
        });

      document.getElementById("con-confirm")?.addEventListener("click", () => {
        const vencimento =
          document.getElementById("con-vencimento")?.value || "";
        const uso_imagem =
          document.getElementById("con-uso-imagem")?.value || "";
        const dataISO = document.getElementById("con-data")?.value || "";

        const { dia, mes, ano } = this.splitDateISO(dataISO);

        this.state.formData = {
          ...(this.state.formData || {}),
          frequencia:
            document.getElementById("con-frequencia")?.value.trim() || "",
          horario: document.getElementById("con-horario")?.value.trim() || "",
          valor_mensal: (
            document.getElementById("con-valor-mensal")?.value || ""
          ).trim(),
          vencimento,
          uso_imagem,
          dia,
          mes,
          ano,
          data_iso: dataISO,
        };

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
    ];

    this.state.pageIndex = 0;
    this.state.selected = { ...(this.state.formData || {}) };

    this.paintPreview();
    this.paintResumo();

    const btnAlterar = document.getElementById("con-btn-alterar");
    if (btnAlterar) btnAlterar.disabled = false;
  },

  buildPage(n) {
    const d = this.state.formData || {};

    const map = {
      "{{contratante_nome}}": d.contratante_nome || "",
      "{{contratante_rg}}": d.contratante_rg || "",
      "{{contratante_cpf}}": d.contratante_cpf || "",
      "{{contratante_endereco}}": d.contratante_endereco || "",
      "{{aluno_nome}}": d.aluno_nome || "",
      "{{frequencia}}": d.frequencia || "",
      "{{horario}}": d.horario || "",
      "{{valor_mensal}}": d.valor_mensal || "",
      "{{vencimento}}": d.vencimento || "",
      "{{uso_imagem}}": d.uso_imagem || "",
      "{{dia}}": d.dia || "",
      "{{mes}}": d.mes || "",
      "{{ano}}": d.ano || "",
    };

    const page1 = `
      <div class="contrato-page">
        <div class="contrato-page-sheet" style="border-radius:0 !important;">
          <div class="contrato-page-body">
            <h2 style="text-align:center; margin:0 0 16px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h2>

            <p><strong>CONTRATANTE:</strong> {{contratante_nome}}, RG {{contratante_rg}}, CPF {{contratante_cpf}}, residente e domiciliado(a) em {{contratante_endereco}}.</p>
            <p><strong>ALUNO(A):</strong> {{aluno_nome}}.</p>

            <p><strong>CLÁUSULA 1 — DO OBJETO</strong><br/>
            O presente contrato tem por objeto a prestação de serviços de reforço escolar, conforme condições descritas neste instrumento.</p>

            <p><strong>CLÁUSULA 2 — DA FREQUÊNCIA E HORÁRIO</strong><br/>
            As aulas ocorrerão com frequência de <strong>{{frequencia}}</strong>, no horário <strong>{{horario}}</strong>, podendo haver ajustes mediante acordo entre as partes.</p>

            <p><strong>CLÁUSULA 3 — DO VALOR E FORMA DE PAGAMENTO</strong><br/>
            O valor mensal ajustado é de <strong>R$ {{valor_mensal}}</strong>, com vencimento todo dia <strong>{{vencimento}}</strong> de cada mês.</p>

            <p><strong>CLÁUSULA 4 — DO CANCELAMENTO E REPOSIÇÕES</strong><br/>
            Cancelamentos e reposições deverão ser comunicados com antecedência razoável, conforme política interna do reforço escolar.</p>

            <p style="margin-top:22px; font-size:12px; color:var(--text-muted, #6b7280);">
              Página 1 de 3
            </p>
          </div>
        </div>
      </div>
    `;

    const page2 = `
      <div class="contrato-page">
        <div class="contrato-page-sheet" style="border-radius:0 !important;">
          <div class="contrato-page-body">
            <h3 style="margin:0 0 12px;">CONDIÇÕES GERAIS</h3>

            <p><strong>CLÁUSULA 5 — RESPONSABILIDADES</strong><br/>
            A CONTRATADA compromete-se a prestar os serviços com diligência e a CONTRATANTE compromete-se a cumprir com as obrigações financeiras e de acompanhamento do(a) aluno(a).</p>

            <p><strong>CLÁUSULA 6 — USO DE IMAGEM</strong><br/>
            A CONTRATANTE declara <strong>{{uso_imagem}}</strong> para uso de imagem do(a) aluno(a) em registros internos e/ou materiais institucionais, quando aplicável.</p>

            <p><strong>CLÁUSULA 7 — DISPOSIÇÕES FINAIS</strong><br/>
            Este instrumento constitui acordo entre as partes, obrigando-as por si e seus sucessores, sendo aplicáveis as normas legais vigentes.</p>

            <p><strong>CLÁUSULA 8 — FORO</strong><br/>
            Fica eleito o foro da comarca competente para dirimir quaisquer dúvidas oriundas do presente contrato.</p>

            <p style="margin-top:22px; font-size:12px; color:var(--text-muted, #6b7280);">
              Página 2 de 3
            </p>
          </div>
        </div>
      </div>
    `;

    const page3 = `
      <div class="contrato-page">
        <div class="contrato-page-sheet" style="border-radius:0 !important;">
          <div class="contrato-page-body">
            <p>Por estarem de acordo, assinam o presente instrumento.</p>

            <p><strong>Data:</strong> {{dia}}/{{mes}}/{{ano}}</p>

            <div style="margin-top:40px; display:grid; grid-template-columns:1fr 1fr; gap:28px;">
              <div style="text-align:center;">
                <div style="border-top:1px solid #111; padding-top:8px;">
                  CONTRATANTE<br/>
                  {{contratante_nome}}
                </div>
              </div>
              <div style="text-align:center;">
                <div style="border-top:1px solid #111; padding-top:8px;">
                  CONTRATADA<br/>
                  Mentoria Reforço Escolar
                </div>
              </div>
            </div>

            <p style="margin-top:22px; font-size:12px; color:var(--text-muted, #6b7280);">
              Página 3 de 3
            </p>
          </div>
        </div>
      </div>
    `;

    const raw = n === 1 ? page1 : n === 2 ? page2 : page3;
    return this.applyTemplate(raw, map);
  },

  applyTemplate(html, map) {
    let out = html;
    Object.keys(map).forEach((k) => {
      const safe = this.esc(map[k]);
      out = out.split(k).join(safe);
    });
    return out;
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

    const btnImprimir = document.getElementById("con-btn-imprimir");
    const btnGravar = document.getElementById("con-btn-gravar");
    const btnAlterar = document.getElementById("con-btn-alterar");

    if (btnImprimir) btnImprimir.disabled = false;
    if (btnGravar) btnGravar.disabled = false;
    if (btnAlterar) btnAlterar.disabled = false;
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
     IMPRIMIR
  ============================ */

  printContrato() {
    const pages = this.state.previewPages.join("");

    const html = `
      <!doctype html>
      <html lang="pt_BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Contrato</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; color: #111; }
            .contrato-page { display: flex; justify-content: center; margin: 0 0 18px; }
            .contrato-page-sheet {
              width: 210mm;
              min-height: 297mm;
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 0 !important;
              padding: 18mm 16mm;
            }
            .contrato-page-body h2, .contrato-page-body h3 { page-break-after: avoid; }
            .contrato-page-body p { line-height: 1.45; margin: 0 0 10px; }
            @media print {
              body { padding: 0; }
              .contrato-page { margin: 0; }
              .contrato-page-sheet { border: none; }
              .contrato-page { page-break-after: always; }
              .contrato-page:last-child { page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          ${pages}
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank");
    if (!w) return;

    w.document.open();
    w.document.write(html);
    w.document.close();
  },

  /* ===========================
     HELPERS
  ============================ */

  esc(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  buildOptions(list, selected) {
    const s = String(selected ?? "");
    return list
      .map((v) => {
        const vv = String(v);
        const sel = vv === s ? "selected" : "";
        return `<option value="${this.esc(vv)}" ${sel}>${this.esc(vv)}</option>`;
      })
      .join("");
  },

  splitDateISO(iso) {
    if (!iso || typeof iso !== "string" || !iso.includes("-")) {
      return { dia: "", mes: "", ano: "" };
    }
    const [ano, mes, dia] = iso.split("-");
    return { dia: dia || "", mes: mes || "", ano: ano || "" };
  },

  printContrato() {
    if (!this.state.previewPages.length) return;

    // cria/atualiza um container dedicado para print
    let root = document.getElementById("print-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "print-root";
      root.style.display = "none";
      document.body.appendChild(root);
    }

    root.innerHTML = this.state.previewPages.join("");

    // imprime
    window.print();

    // limpa depois (evita acúmulo)
    setTimeout(() => {
      const el = document.getElementById("print-root");
      if (el) el.innerHTML = "";
    }, 300);
  },
};
