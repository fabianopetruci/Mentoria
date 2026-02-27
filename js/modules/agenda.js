window.Agenda = {
  state: {
    currentDate: new Date(),
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

          <!-- SIDEBAR -->
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
          </div>

          <!-- MAIN -->
          <div class="agenda-list">

            <div class="agenda-title">
              Agenda do dia
            </div>

            <div id="agenda-content" class="agenda-content">
              Nenhuma tarefa cadastrada para este dia.
            </div>

            <!-- NAV ABAIXO DO CONTEÚDO -->
            <div class="agenda-nav-wrapper">
              <div class="agenda-nav">
                <button id="prev-day" class="btn btn-secondary btn-icon">◀</button>
                <span 
                  id="current-date-display" 
                  class="agenda-nav-date">
                  ${this.formatShortDate(this.state.currentDate)}
                </span>
                <button id="next-day" class="btn btn-secondary btn-icon">▶</button>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    this.bindEvents();
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

  bindEvents() {
    document.getElementById("prev-day")?.addEventListener("click", () => {
      this.changeDay(-1);
    });

    document.getElementById("next-day")?.addEventListener("click", () => {
      this.changeDay(1);
    });
  },

  changeDay(step) {
    const current = this.state.currentDate;
    const newDate = new Date(current);

    newDate.setDate(newDate.getDate() + step);

    if (newDate.getMonth() !== current.getMonth()) {
      return;
    }

    this.state.currentDate = newDate;
    this.updateDateUI();
  },

  updateDateUI() {
    const fullLabel = document.getElementById("agenda-date-label");
    const shortLabel = document.getElementById("current-date-display");

    if (fullLabel) {
      fullLabel.textContent = this.formatFullDate(this.state.currentDate);
    }

    if (shortLabel) {
      shortLabel.textContent = this.formatShortDate(this.state.currentDate);
    }
  },
};
