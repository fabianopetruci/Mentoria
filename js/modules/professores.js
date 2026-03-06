// js/modules/professores.js

window.Professores = {
  state: {
    page: 1,
    perPage: 3,
    selected: null,
    data: [],
    filteredData: [],
  },

  async render() {
    const el = document.getElementById("professores");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">PROFESSORES</h1>
        </div>

        <div class="module-body">

          <div class="professores-container">

            <div class="professores-actions-top">
              <button class="btn btn-primary" id="prof-btn-cadastrar">Cadastrar</button>
              <button class="btn btn-warning" id="prof-btn-alterar" disabled>Alterar</button>
              <button class="btn btn-danger" id="prof-btn-excluir" disabled>Excluir</button>
              <button class="btn btn-print" id="prof-btn-imprimir">Imprimir</button>
            </div>

            <div id="professores-list">Carregando professores...</div>

            <div class="professores-counter" id="professores-counter"></div>

            <div class="professores-pagination">
              <button class="btn-arrow" id="prev-page">◀</button>
              <span id="page-info">1 / 1</span>
              <button class="btn-arrow" id="next-page">▶</button>
            </div>

          </div>

        </div>
      </div>
    `;

    await this.load();
    this.bindUI();
  },

  async load() {
    const list = document.getElementById("professores-list");
    if (!list) return;

    try {
      const res = await fetch(API_URL);
      const json = await res.json();

      this.state.data = json.Professores || [];
      this.state.filteredData = [...this.state.data];
      this.state.page = 1;
      this.state.selected = null;

      this.paint();
    } catch (err) {
      list.innerHTML = "Erro ao carregar professores.";
    }
  },

  bindUI() {
    document.getElementById("prev-page")?.addEventListener("click", () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.paint();
      }
    });

    document.getElementById("next-page")?.addEventListener("click", () => {
      const total = Math.max(
        1,
        Math.ceil(this.state.filteredData.length / this.state.perPage),
      );

      if (this.state.page < total) {
        this.state.page++;
        this.paint();
      }
    });

    document
      .getElementById("prof-btn-cadastrar")
      ?.addEventListener("click", () => this.openForm());

    document
      .getElementById("prof-btn-alterar")
      ?.addEventListener("click", () => {
        if (this.state.selected) this.openForm(this.state.selected);
      });

    document
      .getElementById("prof-btn-excluir")
      ?.addEventListener("click", async () => {
        if (!this.state.selected) return;

        if (!confirm("Excluir professor selecionado?")) return;

        await apiPost({
          action: "delete",
          aba: "Professores",
          id: this.state.selected.id,
        });
        await this.load();
      });

    document
      .getElementById("prof-btn-imprimir")
      ?.addEventListener("click", () => window.print());
  },

  openForm(selected = null) {
    const isEdit = !!selected;
    const d = selected ? selected.data : [];

    const fotoAtual = d?.[9] || "";

    Modal.open(`
      <h3>${isEdit ? "Alterar professor" : "Cadastrar professor"}</h3>

      <div class="modal-form-grid">

        <div class="form-group full">
          <label>Nome</label>
          <input id="p-nome" value="${d?.[0] || ""}">
        </div>

        <div class="form-group">
          <label>Email</label>
          <input id="p-email" value="${d?.[1] || ""}">
        </div>

        <div class="form-group">
          <label>Celular</label>
          <input id="p-celular" value="${d?.[2] || ""}">
        </div>

        <div class="form-group">
          <label>Formação</label>
          <input id="p-formacao" value="${d?.[3] || ""}">
        </div>

        <div class="form-group">
          <label>Experiência</label>
          <input id="p-experiencia" value="${d?.[4] || ""}">
        </div>

        <div class="form-group">
          <label>Valor Hora</label>
          <input id="p-valorHora" value="${d?.[5] || ""}">
        </div>

        <div class="form-group">
          <label>Disponibilidade</label>
          <input id="p-disponibilidade" value="${d?.[6] || ""}">
        </div>

        <div class="form-group">
          <label>Horário</label>
          <select id="p-horario">

            <option value="09:00h às 12:00h" ${d?.[7] === "09:00h às 12:00h" ? "selected" : ""}>
              09:00h às 12:00h
            </option>

            <option value="14:00h às 18:00h" ${d?.[7] === "14:00h às 18:00h" ? "selected" : ""}>
              14:00h às 18:00h
            </option>

          </select>
        </div>

        <div class="form-group">
          <label>Status</label>
          <select id="p-status">
            <option value="ativo" ${d?.[8] === "ativo" ? "selected" : ""}>Ativo</option>
            <option value="inativo" ${d?.[8] === "inativo" ? "selected" : ""}>Inativo</option>
          </select>
        </div>

        <div class="form-group full">
          <label>Foto (caminho da imagem)</label>
          <input id="p-foto" value="${fotoAtual}">
        </div>

      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="p-salvar">
          ${isEdit ? "Salvar alterações" : "Cadastrar"}
        </button>
      </div>
    `);

    const nomeInput = document.getElementById("p-nome");

    nomeInput?.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    });

    document.getElementById("p-salvar")?.addEventListener("click", async () => {
      const valores = [
        this.v("p-nome"),
        this.v("p-email"),
        this.v("p-celular"),
        this.v("p-formacao"),
        this.v("p-experiencia"),
        this.v("p-valorHora"),
        this.v("p-disponibilidade"),
        this.v("p-horario"),
        this.v("p-status"),
        this.v("p-foto"),
      ];

      if (!valores[0]) {
        alert("Preencha o nome.");
        return;
      }

      if (isEdit) {
        await apiPost({
          action: "update",
          aba: "Professores",
          id: selected.id,
          valores,
        });
      } else {
        const total = this.state.data.length + 1;
        const id = "PRO-" + String(total).padStart(4, "0");

        await apiPost({
          action: "insert",
          aba: "Professores",
          id,
          valores,
        });
      }

      Modal.close();
      await this.load();
    });
  },

  paint() {
    const list = document.getElementById("professores-list");
    const pageInfo = document.getElementById("page-info");
    const counter = document.getElementById("professores-counter");

    if (!list) return;

    const total = this.state.filteredData.length;

    if (!total) {
      list.innerHTML = "Nenhum professor encontrado.";
      return;
    }

    const totalPages = Math.ceil(total / this.state.perPage);

    const start = (this.state.page - 1) * this.state.perPage;
    const slice = this.state.filteredData.slice(
      start,
      start + this.state.perPage,
    );

    list.innerHTML = slice
      .map((item) => {
        const { id, data } = item;

        const [
          nome,
          email,
          celular,
          formacao,
          experiencia,
          valorHora,
          disponibilidade,
          horario,
          status,
          fotoUrl,
        ] = data;

        const foto = fotoUrl || "assets/img/teachers.png";

        const selectedClass =
          this.state.selected?.id === id ? " prof-card-selected" : "";

        return `
          <div class="prof-card${selectedClass}" data-id="${id}">
            <div class="prof-foto">
              <img src="${foto}">
            </div>

            <div class="prof-info">

              <div class="prof-row prof-name">
                <span class="prof-label">Nome:</span>
                <span class="prof-value">${nome}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Email:</span>
                <span class="prof-value">${email}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Celular:</span>
                <span class="prof-value">${celular}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Formação:</span>
                <span class="prof-value">${formacao}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Experiência:</span>
                <span class="prof-value">${experiencia} anos</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Valor Hora:</span>
                <span class="prof-value">${Number(valorHora).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  },
                )}</span>
              </div>

              <div class="prof-row">
                <span class="prof-label">Disponibilidade:</span>
                <span class="prof-value">${disponibilidade} x por semana</span>
                <span class="prof-label">Horário:</span>
                <span class="prof-value">${horario}</span>
                <span class="prof-label">Status:</span>
                <span class="prof-value ${
                  String(status).toLowerCase() === "ativo"
                    ? "status-ativo"
                    : "status-inativo"
                }">
                  ${status}
                </span>
              </div>

            </div>
          </div>
        `;
      })
      .join("");

    counter.textContent = `Exibindo ${slice.length} de ${total} professores.`;
    pageInfo.textContent = `${this.state.page} / ${totalPages}`;

    list.querySelectorAll(".prof-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;

        this.state.selected =
          this.state.filteredData.find((x) => x.id === id) || null;

        document.getElementById("prof-btn-alterar").disabled =
          !this.state.selected;
        document.getElementById("prof-btn-excluir").disabled =
          !this.state.selected;

        this.paint();
      });
    });
  },

  v(id) {
    return (document.getElementById(id)?.value || "").trim();
  },
};
