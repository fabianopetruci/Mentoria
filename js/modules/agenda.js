// js/modules/agenda.js

window.Agenda = {
  state: {
    currentDate: new Date(),
    page: 0,
    perPage: 5,
    tasks: [],
  },

  async render() {
    const el = document.getElementById("agenda");
    if (!el) return;

    el.innerHTML = `
      <div class="module-frame">
        <div class="module-header">
          <h1 class="module-title">AGENDA</h1>
        </div>

        <div class="agenda-container">

          <div class="agenda-sidebar">
            <div class="agenda-date" id="agenda-date-label">
              ${this.formatFullDate(this.state.currentDate)}
            </div>

            <button class="btn btn-primary" id="agenda-btn-nova">
              Nova agenda / tarefa
            </button>

            <button class="btn btn-secondary" id="agenda-btn-data">
              Escolher data
            </button>

            <button class="btn btn-print" id="agenda-btn-print">
              Imprimir
            </button>
          </div>

          <div class="agenda-list">

            <div class="agenda-title">
              Agenda do dia
            </div>

            <div id="agenda-content" class="agenda-content"></div>

            <div class="agenda-nav-wrapper">
              <div class="agenda-nav">
                <button id="prev-day" class="btn-arrow">◀</button>
                <span class="pagination-info agenda-nav-date">
                  ${this.formatShortDate(this.state.currentDate)}
                </span>
                <button id="next-day" class="btn-arrow">▶</button>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    await this.loadTasks();
    this.renderTasks();
    this.bindEvents();
  },

  async loadTasks() {
    const res = await apiGet();
    const agenda = res.Agenda || [];

    const y = this.state.currentDate.getFullYear();
    const m = String(this.state.currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(this.state.currentDate.getDate()).padStart(2, "0");

    const current = `${y}-${m}-${d}`;

    this.state.tasks = agenda
      .filter((r) => {
        const data = String(r.data?.[1] || "").slice(0, 10);
        return data === current;
      })
      .sort((a, b) => {
        const h1 = String(a.data?.[2] || "");
        const h2 = String(b.data?.[2] || "");
        return h1.localeCompare(h2);
      });
  },

  renderTasks() {
    const content = document.getElementById("agenda-content");
    if (!content) return;

    const start = this.state.page * this.state.perPage;
    const end = start + this.state.perPage;

    const visible = this.state.tasks.slice(start, end);

    content.innerHTML = visible
      .map((t) => {
        const aluno = String(t.data?.[0] || "");
        const horaRaw = t.data?.[2];
        const desc = String(t.data?.[3] || "");

        let hora = "";

        if (!horaRaw) {
          hora = "";
        } else if (typeof horaRaw === "number") {
          // hora vinda como fração de dia do Sheets
          const totalMinutes = Math.round(horaRaw * 24 * 60);
          const h = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
          const m = String(totalMinutes % 60).padStart(2, "0");
          hora = `${h}:${m}`;
        } else if (typeof horaRaw === "string" && horaRaw.includes("T")) {
          // ISO timestamp (ex: 1899-12-30T17:36:28.000Z)
          const d = new Date(horaRaw);
          hora = d.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        } else {
          // já é "14:30"
          hora = String(horaRaw).slice(0, 5);
        }

        return `<div class="agenda-item">${hora} - ${aluno} - ${desc}</div>`;
      })
      .join("");
  },

  async openNovaAgenda() {
    const alunos = await API.getAlunos();

    const ativos = alunos.filter(
      (a) =>
        String(a.data[8] || "")
          .trim()
          .toLowerCase() === "ativo",
    );

    const options = ativos
      .map((a) => `<option value="${a.data[0]}">${a.data[0]}</option>`)
      .join("");

    const content = `
      <h2>Nova tarefa</h2>

      <div style="margin-top:16px;display:flex;flex-direction:column;gap:12px">

        <select id="agenda-aluno">
          <option value="">Selecionar aluno</option>
          ${options}
        </select>

        <input type="time" id="agenda-hora">

        <textarea id="agenda-desc" placeholder="Descrição da tarefa"></textarea>

        <button class="btn btn-primary" id="agenda-salvar">
          Salvar
        </button>

      </div>
    `;

    Modal.open(content, { width: "420px" });

    document
      .getElementById("agenda-salvar")
      ?.addEventListener("click", async () => {
        const aluno = document.getElementById("agenda-aluno").value;
        const hora = document.getElementById("agenda-hora").value;
        const desc = document.getElementById("agenda-desc").value;

        if (!aluno || !hora || !desc) return;

        const agora = new Date();

        const criado = agora.toISOString();

        const y = this.state.currentDate.getFullYear();
        const m = String(this.state.currentDate.getMonth() + 1).padStart(
          2,
          "0",
        );
        const d = String(this.state.currentDate.getDate()).padStart(2, "0");

        const data = `${y}-${m}-${d}`;

        const id = await this.generateID();

        await apiPost({
          action: "insert",
          aba: "Agenda",
          id,
          valores: [aluno, data, hora, desc],
        });

        Modal.close();
        await this.loadTasks();
        this.renderTasks();
      });
  },

  openEscolherData() {
    const y = this.state.currentDate.getFullYear();
    const m = String(this.state.currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(this.state.currentDate.getDate()).padStart(2, "0");
    const current = `${y}-${m}-${d}`;

    const content = `
      <h2>Escolher data</h2>

      <div style="margin-top:16px;display:flex;flex-direction:column;gap:12px">
        <input type="date" id="agenda-data-picker" value="${current}">
        <button class="btn btn-primary" id="agenda-aplicar-data">Abrir</button>
      </div>
    `;

    Modal.open(content, { width: "320px", closeOnOverlay: false });

    document
      .getElementById("agenda-aplicar-data")
      ?.addEventListener("click", async () => {
        const val = document.getElementById("agenda-data-picker")?.value || "";
        if (!val || val.length !== 10) return;

        const [year, month, day] = val.split("-").map(Number);
        this.state.currentDate = new Date(year, month - 1, day);
        this.state.page = 0;

        this.updateDisplayedDate();
        Modal.close();
        await this.loadTasks();
        this.renderTasks();
      });
  },

  async generateID() {
    const res = await apiGet();
    const agenda = res.Agenda || [];

    let max = 0;

    agenda.forEach((r) => {
      const n = parseInt(String(r.id).replace("AGD-", ""));
      if (n > max) max = n;
    });

    const next = max + 1;

    return "AGD-" + String(next).padStart(4, "0");
  },

  formatFullDate(date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  },

  formatShortDate(date) {
    return date.toLocaleDateString("pt-BR");
  },

  async changeDay(offset) {
    const d = new Date(this.state.currentDate);
    d.setDate(d.getDate() + offset);

    this.state.currentDate = d;
    this.state.page = 0;

    this.updateDisplayedDate();
    await this.loadTasks();
    this.renderTasks();
  },

  updateDisplayedDate() {
    const full = this.formatFullDate(this.state.currentDate);
    const short = this.formatShortDate(this.state.currentDate);

    const sidebar = document.getElementById("agenda-date-label");
    const nav = document.querySelector(".agenda-nav-date");

    if (sidebar) sidebar.textContent = full;
    if (nav) nav.textContent = short;
  },

  bindEvents() {
    document.getElementById("prev-day")?.addEventListener("click", () => {
      this.changeDay(-1);
    });

    document.getElementById("next-day")?.addEventListener("click", () => {
      this.changeDay(1);
    });

    document
      .getElementById("agenda-btn-nova")
      ?.addEventListener("click", () => this.openNovaAgenda());

    document
      .getElementById("agenda-btn-data")
      ?.addEventListener("click", () => this.openEscolherData());

    document
      .getElementById("agenda-btn-print")
      ?.addEventListener("click", () =>
        Print.section("agenda-content", "Agenda do dia"),
      );
  },
};
