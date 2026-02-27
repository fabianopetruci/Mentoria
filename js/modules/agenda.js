window.Agenda = {
  render() {
    const body = document.querySelector("#agenda .module-body");
    if (!body) return;

    body.innerHTML = `
      <div class="agenda-container">
        <div class="agenda-sidebar">
          <div class="agenda-date">Data atual aqui</div>
          <button class="btn btn-primary">Nova agenda / tarefa</button>
          <button class="btn btn-secondary">Acessar agendas</button>
        </div>

        <div class="agenda-list">
          <div class="agenda-title">Agenda do dia</div>
          <div class="agenda-content">
            Nenhuma tarefa cadastrada para este dia.
          </div>
        </div>
      </div>
    `;
  },
};
