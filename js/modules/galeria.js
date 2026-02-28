// js/modules/galeria.js

window.Galeria = {
  state: {
    index: 0, // 0-based
    selected: null, // item atual (id + data)
    data: [], // [{id, data:[url, legenda]}]
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
            <span id="gal-page-info">0 / 0</span>
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
      // ainda estamos sem API final -> se Api não existir, usa mock local
      if (typeof Api === "undefined" || !Api.getAll) {
        this.state.data = [
          {
            id: "GAL-1",
            data: [
              "https://images.pexels.com/photos/8613083/pexels-photo-8613083.jpeg",
              "Aula de reforço - terça feira",
            ],
          },
          {
            id: "GAL-2",
            data: [
              "https://images.pexels.com/photos/5905713/pexels-photo-5905713.jpeg",
              "Atividade em grupo",
            ],
          },
        ];
      } else {
        const res = await Api.getAll();
        const lista = res.Galeria || [];
        this.state.data = Array.isArray(lista) ? lista : [];
      }

      this.state.index = 0;
      this.state.selected = this.state.data[0] || null;

      this.paint();
    } catch (err) {
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
      const total = this.state.data.length;
      if (this.state.index < total - 1) {
        this.state.index++;
        this.state.selected = this.state.data[this.state.index] || null;
        this.paint();
      }
    });

    document
      .getElementById("gal-btn-cadastrar")
      ?.addEventListener("click", () => this.openForm(null));

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
          // se não tiver API, remove só local (mock)
          if (typeof Api === "undefined" || !Api.remove) {
            this.state.data = this.state.data.filter(
              (x) => x.id !== this.state.selected.id,
            );
            this.state.index = 0;
            this.state.selected = this.state.data[0] || null;
            this.paint();
            return;
          }

          await Api.remove("Galeria", this.state.selected.id);
          await this.load();
        } catch (err) {
          alert("Erro ao excluir: " + (err?.message || err));
        }
      });

    document
      .getElementById("gal-btn-imprimir")
      ?.addEventListener("click", () => {
        window.print();
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

    const url = item?.data?.[0] || "";
    const legenda = item?.data?.[1] || "";

    const safeUrl = this.escapeAttr(url);
    const safeLegenda = this.escapeHtml(legenda);

    view.innerHTML = `
      <div class="galeria-card" data-id="${this.escapeAttr(item.id)}">
        <div class="galeria-frame">
          ${
            safeUrl
              ? `<img class="galeria-img" src="${safeUrl}" alt="Foto da galeria">`
              : `<div class="galeria-noimg">Sem URL de imagem</div>`
          }
        </div>

        <div class="galeria-caption">
          <div class="galeria-legenda">${
            safeLegenda || "<span class='muted'>Sem legenda</span>"
          }</div>
        </div>
      </div>
    `;

    pageInfo.textContent = `${this.state.index + 1} / ${total}`;
    this.updateButtons();
  },

  updateButtons() {
    const has = !!this.state.selected;
    const bAlt = document.getElementById("gal-btn-alterar");
    const bExc = document.getElementById("gal-btn-excluir");
    if (bAlt) bAlt.disabled = !has;
    if (bExc) bExc.disabled = !has;

    const prev = document.getElementById("gal-prev");
    const next = document.getElementById("gal-next");
    const total = this.state.data.length;

    if (prev) prev.disabled = !total || this.state.index <= 0;
    if (next) next.disabled = !total || this.state.index >= total - 1;
  },

  openForm(item = null) {
    const isEdit = !!item;
    const d = item?.data || [];

    const urlAtual = d[0] || "";
    const legendaAtual = d[1] || "";

    const html = `
      <h3>${isEdit ? "Alterar Foto" : "Cadastrar Foto"}</h3>

      <div class="form-group">
        <label>Foto</label>
        <input type="file" id="g-foto" accept="image/png, image/jpeg">
        ${
          urlAtual
            ? `<small class="muted">Se não escolher uma nova imagem, a foto atual será mantida.</small>`
            : `<small class="muted">Selecione uma imagem para enviar.</small>`
        }
      </div>

      <div class="form-group">
        <label>Legenda</label>
        <input type="text" id="g-legenda" value="${this.escapeAttr(
          legendaAtual,
        )}" placeholder="Ex: Aula de reforço - terça">
      </div>

      <button class="btn btn-primary" id="g-salvar">${
        isEdit ? "Salvar" : "Cadastrar"
      }</button>
    `;

    Modal.open(html);

    document.getElementById("g-salvar")?.addEventListener("click", async () => {
      const legenda = (
        document.getElementById("g-legenda")?.value || ""
      ).trim();
      const file = document.getElementById("g-foto")?.files?.[0];

      try {
        let url = urlAtual;

        if (!isEdit && !file) {
          alert("Selecione uma imagem para cadastrar.");
          return;
        }

        // sem API: mocka usando URL temporária local
        if (!Api || !Api.uploadFoto) {
          if (file) url = URL.createObjectURL(file);

          const payload = [url, legenda];

          if (isEdit) {
            const idx = this.state.data.findIndex((x) => x.id === item.id);
            if (idx >= 0) this.state.data[idx].data = payload;
          } else {
            const id = "GAL-" + Date.now();
            this.state.data.push({ id, data: payload });
            this.state.index = this.state.data.length - 1;
          }

          Modal.close();
          this.paint();
          return;
        }

        // com API (futuro real)
        if (file) {
          const up = await Api.uploadFoto(file);
          url = up.fotoUrl;
        }

        const payload = [url, legenda];

        if (isEdit) {
          await Api.update("Galeria", item.id, payload);
        } else {
          const id = "GAL-" + Date.now();
          await Api.insert("Galeria", id, payload);
        }

        Modal.close();
        await this.load();
      } catch (err) {
        alert("Erro ao salvar: " + (err?.message || err));
      }
    });
  },

  escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  escapeAttr(s) {
    return this.escapeHtml(s).replace(/`/g, "&#096;");
  },
};
