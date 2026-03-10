// js/modules/galeria.js

window.Galeria = {
  state: {
    index: 0,
    selected: null, // { id, url, legenda }
    data: [], // [{ id, url, legenda }]
  },

  async render() {
    const el = document.getElementById("galeria");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <div class="module-title">Galeria</div>
        </div>

        <div class="module-body">

          <div class="galeria-actions-top">
            <button class="btn btn-primary" id="gal-btn-cadastrar">Cadastrar</button>
            <button class="btn btn-warning" id="gal-btn-alterar" disabled>Alterar</button>
            <button class="btn btn-danger" id="gal-btn-excluir" disabled>Excluir</button>
            <button class="btn btn-secondary" id="gal-btn-imprimir">Imprimir</button>
          </div>

          <div id="galeria-view">Carregando fotos...</div>

          <div class="galeria-pagination">
            <button class="btn-arrow" id="gal-prev">◀</button>
            <span class="pagination-info" id="gal-page-info">0 / 0</span>
            <button class="btn-arrow" id="gal-next">▶</button>
          </div>

        </div>
      </div>
    `;

    await this.load();
    this.bindUI();
  },

  async load() {
    const view = document.getElementById("galeria-view");
    if (!view) return;

    try {
      const rows = await API.getGaleria();

      this.state.data = rows.map((r) => ({
        id: r.id,
        url: String(r.data?.[0] || "").trim(),
        legenda: String(r.data?.[1] || "").trim(),
      }));

      this.state.index = 0;
      this.state.selected = this.state.data[0] || null;

      this.paint();
    } catch (err) {
      console.error("Erro ao carregar galeria", err);
      view.innerHTML = "Erro ao carregar galeria.";
    }
  },

  bindUI() {
    document.getElementById("gal-prev")?.addEventListener("click", () => {
      if (!this.state.data.length) return;
      if (this.state.index > 0) {
        this.state.index--;
        this.state.selected = this.state.data[this.state.index] || null;
        this.paint();
      }
    });

    document.getElementById("gal-next")?.addEventListener("click", () => {
      if (!this.state.data.length) return;
      if (this.state.index < this.state.data.length - 1) {
        this.state.index++;
        this.state.selected = this.state.data[this.state.index] || null;
        this.paint();
      }
    });

    document
      .getElementById("gal-btn-cadastrar")
      ?.addEventListener("click", () => this.openForm());

    document
      .getElementById("gal-btn-alterar")
      ?.addEventListener("click", () => {
        if (this.state.selected) this.openForm(this.state.selected);
      });

    document
      .getElementById("gal-btn-excluir")
      ?.addEventListener("click", async () => {
        if (!this.state.selected) return;
        if (!confirm("Excluir esta foto da galeria?")) return;

        try {
          await API.deleteGaleria(this.state.selected.id);
          await this.load();
        } catch (err) {
          alert("Erro ao excluir: " + (err?.message || err));
        }
      });

    document
      .getElementById("gal-btn-imprimir")
      ?.addEventListener("click", () => {
        Print.section("galeria-view", "Galeria");
      });
  },

  paint() {
    const view = document.getElementById("galeria-view");
    const pageInfo = document.getElementById("gal-page-info");
    if (!view || !pageInfo) return;

    const total = this.state.data.length;

    if (!total) {
      view.innerHTML = `<div class="galeria-empty">Nenhuma foto cadastrada.</div>`;
      pageInfo.textContent = "0 / 0";
      this.updateButtons();
      return;
    }

    if (this.state.index < 0) this.state.index = 0;
    if (this.state.index > total - 1) this.state.index = total - 1;

    const item = this.state.data[this.state.index];
    this.state.selected = item || null;

    const srcList = this.toImageSources(item?.url || "");
    const src1 = srcList[0] || "";
    const src2 = srcList[1] || "";
    const src3 = srcList[2] || "";
    const legenda = this.escapeHtml(item?.legenda || "");

    view.innerHTML = `
      <div class="galeria-card" data-id="${this.escapeAttr(item.id)}">
        <div class="galeria-frame">
          ${
            src1
              ? `<img
                  class="galeria-img"
                  src="${this.escapeAttr(src1)}"
                  data-src2="${this.escapeAttr(src2)}"
                  data-src3="${this.escapeAttr(src3)}"
                  alt="Foto da galeria"
                >`
              : `<div class="galeria-noimg">Sem URL de imagem</div>`
          }
        </div>

        <div class="galeria-caption">
          <div class="galeria-legenda">${legenda || "<span class='muted'>Sem legenda</span>"}</div>
        </div>
      </div>
    `;

    const img = view.querySelector(".galeria-img");
    if (img) {
      img.addEventListener("error", () => this.handleImgError(img), {
        once: false,
      });
    }

    pageInfo.textContent = `${this.state.index + 1} / ${total}`;
    this.updateButtons();
  },

  updateButtons() {
    const has = !!this.state.selected;
    const bAlt = document.getElementById("gal-btn-alterar");
    const bExc = document.getElementById("gal-btn-excluir");
    if (bAlt) bAlt.disabled = !has;
    if (bExc) bExc.disabled = !has;

    const bPrev = document.getElementById("gal-prev");
    const bNext = document.getElementById("gal-next");
    const total = this.state.data.length;

    if (bPrev) bPrev.disabled = !total || this.state.index <= 0;
    if (bNext) bNext.disabled = !total || this.state.index >= total - 1;
  },

  openForm(item = null) {
    const isEdit = !!item;
    const urlAtual = item?.url || "";
    const legendaAtual = item?.legenda || "";

    Modal.open(`
      <h3>${isEdit ? "Alterar foto" : "Cadastrar foto"}</h3>

      <div class="modal-form-grid">
        <div class="form-group full">
          <label>URL da foto</label>
          <input type="text" id="g-url" value="${this.escapeAttr(urlAtual)}" placeholder="https://...">
          <small class="muted">Cole o link manualmente da planilha/Drive.</small>
        </div>

        <div class="form-group full">
          <label>Legenda</label>
          <input type="text" id="g-legenda" value="${this.escapeAttr(legendaAtual)}" placeholder="Ex: Um dia de aula normal">
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="g-salvar">${isEdit ? "Salvar" : "Cadastrar"}</button>
      </div>
    `);

    document.getElementById("g-salvar")?.addEventListener("click", async () => {
      const url = this.v("g-url");
      const legenda = this.v("g-legenda");

      if (!url) {
        alert("Informe a URL da foto.");
        return;
      }

      const valores = [url, legenda];

      try {
        if (isEdit) {
          await API.updateGaleria(item.id, valores);
        } else {
          const id = this.buildNextId();
          await API.insertGaleria(id, valores);
        }

        Modal.close();
        await this.load();

        if (!isEdit) {
          this.state.index = Math.max(0, this.state.data.length - 1);
          this.state.selected = this.state.data[this.state.index] || null;
          this.paint();
        }
      } catch (err) {
        alert("Erro ao salvar: " + (err?.message || err));
      }
    });
  },

  buildNextId() {
    const max = this.state.data.reduce((acc, item) => {
      const n = Number(String(item.id || "").replace(/^GAL-/, ""));
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);

    return `GAL-${String(max + 1).padStart(4, "0")}`;
  },

  handleImgError(imgEl) {
    const next2 = imgEl.dataset.src2 || "";
    const next3 = imgEl.dataset.src3 || "";

    if (next2) {
      imgEl.src = next2;
      imgEl.dataset.src2 = "";
      return;
    }

    if (next3) {
      imgEl.src = next3;
      imgEl.dataset.src3 = "";
      return;
    }

    imgEl.outerHTML = `<div class="galeria-noimg">Não foi possível carregar a imagem</div>`;
  },

  extractDriveId(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";

    let m = raw.match(/\/file\/d\/([^/]+)/);
    if (m?.[1]) return m[1];

    m = raw.match(/[?&]id=([^&]+)/);
    if (m?.[1]) return m[1];

    return "";
  },

  toImageSources(url) {
    const raw = String(url || "").trim();
    if (!raw) return [];

    const driveId = this.extractDriveId(raw);

    if (!driveId) return [raw];

    return [
      `https://drive.google.com/uc?export=view&id=${driveId}`,
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`,
      `https://lh3.googleusercontent.com/d/${driveId}=w2000`,
    ];
  },

  v(id) {
    return (document.getElementById(id)?.value || "").trim();
  },

  escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  },

  escapeAttr(str = "") {
    return this.escapeHtml(str);
  },
};
