// js/modules/agenda.js

window.Agenda = {
  state: {
    currentDate: new Date(),
    page: 0,
    perPage: 5,
    tasks: [
      "09:00 - Maria Clara - fazer tarefa de matemática",
      "09:30 - Paulo Gustavo - estudar para prova de física",
      "10:00 - Ana Beatriz - revisar interpretação de texto",
      "10:30 - João Pedro - exercícios de frações",
      "11:00 - Laura Mendes - estudar para prova de história",
      "11:30 - Miguel Santos - fazer tarefa de geografia",
      "14:00 - Sofia Almeida - revisão de equações",
      "15:00 - Gabriel Rocha - estudar para prova de química",
      "16:00 - Helena Costa - leitura e resumo de português",
      "17:00 - Lucas Ferreira - exercícios de matemática básica",
    ],
  },

  render() {
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

            <button class="btn btn-primary">
              Nova agenda / tarefa
            </button>

            <button class="btn btn-secondary">
              Escolher data
            </button>

            <button class="btn btn-print">
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

    this.renderTasks();
    this.bindEvents();
  },

  renderTasks() {
    const content = document.getElementById("agenda-content");
    if (!content) return;

    const start = this.state.page * this.state.perPage;
    const end = start + this.state.perPage;

    const visible = this.state.tasks.slice(start, end);

    content.innerHTML = visible
      .map((task) => `<div class="agenda-item">${task}</div>`)
      .join("");
  },

  // 🔵 Formato LONGO (quadro lateral)
  formatFullDate(date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  },

  // 🔹 Formato CURTO (navegação)
  formatShortDate(date) {
    return date.toLocaleDateString("pt-BR");
  },

  changeDay(offset) {
    const newDate = new Date(this.state.currentDate);
    newDate.setDate(newDate.getDate() + offset);

    this.state.currentDate = newDate;
    this.state.page = 0;

    this.updateDisplayedDate();
    this.renderTasks();
  },

  updateDisplayedDate() {
    const full = this.formatFullDate(this.state.currentDate);
    const short = this.formatShortDate(this.state.currentDate);

    const sidebarLabel = document.getElementById("agenda-date-label");
    const navLabel = document.querySelector(".agenda-nav-date");

    if (sidebarLabel) sidebarLabel.textContent = full;
    if (navLabel) navLabel.textContent = short;
  },

  bindEvents() {
    document.getElementById("prev-day")?.addEventListener("click", () => {
      this.changeDay(-1);
    });

    document.getElementById("next-day")?.addEventListener("click", () => {
      this.changeDay(1);
    });
  },
};
