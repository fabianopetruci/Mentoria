// js/modules/pendencias.js

window.Pendencias = {
  state: {
    pendenciasFinanceiras: [],
    lembretes: [],
    aniversarios: [],
  },

  async render() {
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
                  <tbody id="pen-fin-body">
                    <tr><td colspan="3">Carregando...</td></tr>
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
                <div class="pendencias-lembretes" id="pen-lembretes-list">
                  Carregando...
                </div>
              </div>
            </div>

            <!-- CARD 3: Aniversários -->
            <div class="pendencias-card">
              <div class="pendencias-card-header">
                <h2 class="pendencias-card-title">Aniversários (30 dias)</h2>
              </div>

              <div class="pendencias-card-body">
                <div class="pendencias-aniversarios" id="pen-aniversarios-list">
                  Carregando...
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    await this.load();
    this.paint();
    this.bindEvents();
  },

  async load() {
    try {
      const [despesas, lembretes, alunos] = await Promise.all([
        API.getDespesas(),
        API.getPendencias(),
        API.getAlunos(),
      ]);

      this.state.pendenciasFinanceiras =
        this.mapPendenciasFinanceiras(despesas);
      this.state.lembretes = this.mapLembretes(lembretes);
      this.state.aniversarios = this.mapAniversarios(alunos);
    } catch (err) {
      console.error("Erro ao carregar pendências", err);
      this.state.pendenciasFinanceiras = [];
      this.state.lembretes = [];
      this.state.aniversarios = [];
    }
  },

  bindEvents() {
    document.getElementById("pen-btn-novo")?.addEventListener("click", () => {
      this.openLembreteForm();
    });

    document.querySelectorAll("[data-lembrete-check]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-lembrete-check");
        if (!id) return;

        const item = this.state.lembretes.find((l) => l.id === id);
        if (!item) return;

        const novoStatus =
          item.status === "concluido" ? "pendente" : "concluido";
        const valores = [
          item.descricao,
          item.data,
          item.prioridade,
          novoStatus,
        ];

        await API.updatePendencia(id, valores);
        await this.load();
        this.paint();
      });
    });

    document.querySelectorAll("[data-lembrete-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-lembrete-delete");
        if (!id) return;

        if (!confirm("Excluir lembrete?")) return;

        await API.deletePendencia(id);
        await this.load();
        this.paint();
      });
    });
  },

  openLembreteForm(selected = null) {
    const isEdit = !!selected;
    const hoje = new Date();
    const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    Modal.open(`
      <h3>${isEdit ? "Alterar lembrete" : "Novo lembrete"}</h3>

      <div class="modal-form-grid">
        <div class="form-group full">
          <label>Descrição</label>
          <input id="pen-desc" value="${selected?.descricao || ""}">
        </div>

        <div class="form-group">
          <label>Data</label>
          <input type="date" id="pen-data" value="${selected?.data || hojeIso}">
        </div>

        <div class="form-group">
          <label>Prioridade</label>
          <select id="pen-prio">
            <option value="baixa" ${selected?.prioridade === "baixa" ? "selected" : ""}>Baixa</option>
            <option value="media" ${selected?.prioridade === "media" ? "selected" : ""}>Média</option>
            <option value="alta" ${selected?.prioridade === "alta" ? "selected" : ""}>Alta</option>
          </select>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="pen-salvar">${isEdit ? "Salvar" : "Cadastrar"}</button>
      </div>
    `);

    document
      .getElementById("pen-salvar")
      ?.addEventListener("click", async () => {
        const descricao = this.v("pen-desc");
        const data = this.v("pen-data");
        const prioridade = this.v("pen-prio");

        if (!descricao) {
          alert("Preencha a descrição.");
          return;
        }

        if (!data) {
          alert("Preencha a data.");
          return;
        }

        const status = selected?.status || "pendente";
        const valores = [descricao, data, prioridade, status];

        if (isEdit) {
          await API.updatePendencia(selected.id, valores);
        } else {
          const id = this.buildNextId();
          await API.insertPendencia(id, valores);
        }

        Modal.close();
        await this.load();
        this.paint();
      });
  },

  buildNextId() {
    const max = this.state.lembretes.reduce((acc, item) => {
      const n = Number(String(item.id || "").replace(/^PEN-/, ""));
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);

    return `PEN-${String(max + 1).padStart(4, "0")}`;
  },

  mapPendenciasFinanceiras(despesas) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return despesas
      .map((d) => {
        const descricao = d.data?.[0] || "";
        const vencimentoRaw = d.data?.[2] || "";
        const statusRaw = String(d.data?.[3] || "").toLowerCase();

        if (statusRaw !== "a pagar") return null;

        const dataObj = this.parseDate(vencimentoRaw);
        const vencida = dataObj ? dataObj < hoje : false;

        return {
          descricao,
          vencimento: this.formatDateBR(vencimentoRaw),
          status: vencida ? "Vencida" : "A pagar",
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const da = this.parseDate(a.vencimento) || new Date("2999-12-31");
        const db = this.parseDate(b.vencimento) || new Date("2999-12-31");
        return da - db;
      });
  },

  mapLembretes(rows) {
    return rows
      .map((r) => ({
        id: r.id,
        descricao: r.data?.[0] || "",
        data: r.data?.[1] || "",
        prioridade: String(r.data?.[2] || "media").toLowerCase(),
        status: String(r.data?.[3] || "pendente").toLowerCase(),
      }))
      .sort((a, b) => {
        const da = this.parseDate(a.data) || new Date("2999-12-31");
        const db = this.parseDate(b.data) || new Date("2999-12-31");
        return da - db;
      });
  },

  mapAniversarios(alunos) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + 30);

    const res = alunos
      .map((a) => {
        const nome = a.data?.[0] || "";
        const nasc = a.data?.[1] || "";
        if (!nome || !nasc) return null;

        const nascimento = this.parseDate(nasc);
        if (!nascimento) return null;

        const prox = new Date(
          hoje.getFullYear(),
          nascimento.getMonth(),
          nascimento.getDate(),
        );

        if (prox < hoje) prox.setFullYear(hoje.getFullYear() + 1);

        if (prox > limite) return null;

        return {
          nome,
          data: this.toIsoDate(prox),
          dataLabel: this.formatDateBR(this.toIsoDate(prox)),
          daysTo: Math.floor((prox - hoje) / (1000 * 60 * 60 * 24)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.daysTo - b.daysTo);

    return res;
  },

  paint() {
    const finBody = document.getElementById("pen-fin-body");
    const lembretesList = document.getElementById("pen-lembretes-list");
    const aniversariosList = document.getElementById("pen-aniversarios-list");

    if (finBody) finBody.innerHTML = this.buildPendFinRows();
    if (lembretesList) lembretesList.innerHTML = this.buildLembretes();
    if (aniversariosList) aniversariosList.innerHTML = this.buildAniversarios();

    this.bindEvents();
  },

  buildPendFinRows() {
    if (!this.state.pendenciasFinanceiras.length) {
      return `<tr><td colspan="3">Nenhuma pendência financeira.</td></tr>`;
    }

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
    if (!this.state.lembretes.length) {
      return `<div class="pendencias-lembrete-item">Sem lembretes.</div>`;
    }

    return this.state.lembretes
      .map((l) => {
        const prioClass =
          l.prioridade === "alta"
            ? "pen-pill-alta"
            : l.prioridade === "media"
              ? "pen-pill-media"
              : "pen-pill-baixa";

        const prioLabel =
          l.prioridade === "alta"
            ? "Alta"
            : l.prioridade === "media"
              ? "Média"
              : "Baixa";

        const doneClass = l.status === "concluido" ? "pen-lembrete-done" : "";
        const checkTitle =
          l.status === "concluido" ? "Marcar como pendente" : "Concluir";

        return `
          <div class="pendencias-lembrete-item ${doneClass}">
            <div class="pendencias-lembrete-text">
              ${l.descricao}
              <div class="pendencias-lembrete-date">${this.formatDateBR(l.data)}</div>
            </div>

            <div class="pendencias-lembrete-actions">
              <span class="pen-pill ${prioClass}">${prioLabel}</span>
              <button class="pen-icon-btn" type="button" title="${checkTitle}" data-lembrete-check="${l.id}">✓</button>
              <button class="pen-icon-btn" type="button" title="Excluir" data-lembrete-delete="${l.id}">✕</button>
            </div>
          </div>
        `;
      })
      .join("");
  },

  buildAniversarios() {
    if (!this.state.aniversarios.length) {
      return `<div class="pendencias-aniversario-item">Nenhum aniversário nos próximos 30 dias.</div>`;
    }

    return this.state.aniversarios
      .map((a) => {
        return `
          <div class="pendencias-aniversario-item">
            <strong>${a.nome}</strong> — ${a.dataLabel}
          </div>
        `;
      })
      .join("");
  },

  parseDate(value) {
    if (!value) return null;
    const str = String(value).trim();

    const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) {
      const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const br = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (br) {
      const d = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
      d.setHours(0, 0, 0, 0);
      return d;
    }

    return null;
  },

  toIsoDate(dateObj) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
  },

  formatDateBR(value) {
    const d = this.parseDate(value);
    if (!d) return String(value || "");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  },

  v(id) {
    return (document.getElementById(id)?.value || "").trim();
  },
};
