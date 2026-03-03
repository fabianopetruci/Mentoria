// js/ui/modal.js

window.Modal = {
  isOpen: false,

  open(content, options = {}) {
    if (this.isOpen) this.close();

    const { width = "900px", closeOnOverlay = true } = options;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "modal-container";
    modal.style.maxWidth = width;

    modal.innerHTML = `
      <div class="modal-header">
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.body.classList.add("modal-open");
    this.isOpen = true;

    // fechar botão X
    document
      .getElementById("modal-close-btn")
      ?.addEventListener("click", () => this.close());

    // fechar clicando fora
    if (closeOnOverlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.close();
      });
    }
  },

  close() {
    const overlay = document.querySelector(".modal-overlay");
    if (overlay) overlay.remove();

    document.body.classList.remove("modal-open");
    this.isOpen = false;
  },
};
