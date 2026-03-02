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
                <button id="prev-page" class="btn-arrow">◀</button>
                <span class="agenda-nav-date">
                  Página ${this.state.page + 1}
                </span>
                <button id="next-page" class="btn-arrow">▶</button>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    this.renderTasks();
    this.bindEvents();
    this.updatePaginationState();
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

  formatFullDate(date) {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  },

  bindEvents() {
    document.getElementById("prev-page")?.addEventListener("click", () => {
      if (this.state.page > 0) {
        this.state.page--;
        this.renderTasks();
        this.updatePageLabel();
        this.updatePaginationState();
      }
    });

    document.getElementById("next-page")?.addEventListener("click", () => {
      const maxPage =
        Math.ceil(this.state.tasks.length / this.state.perPage) - 1;

      if (this.state.page < maxPage) {
        this.state.page++;
        this.renderTasks();
        this.updatePageLabel();
        this.updatePaginationState();
      }
    });
  },

  updatePageLabel() {
    const label = document.querySelector(".agenda-nav-date");
    if (label) {
      label.textContent = `Página ${this.state.page + 1}`;
    }
  },

  updatePaginationState() {
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");

    const maxPage = Math.ceil(this.state.tasks.length / this.state.perPage) - 1;

    if (prevBtn) {
      prevBtn.disabled = this.state.page === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.state.page === maxPage;
    }
  },
};
