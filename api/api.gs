// ===== CONFIG =====
const SPREADSHEET_ID = "1RxD14YKY3wksLAb0YuOQZuFfNVJF9yIrDFydDMACWHA";
const ABAS = [
  "Alunos",
  "Professores",
  "Agenda",
  "Receitas",
  "Despesas",
  "Pendencias",
  "Fluxo_caixa",
  "Contrato",
  "Rebibos",
  "Galeria",
];

// ===== GET =====
function doGet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const retorno = {};

    ABAS.forEach((nome) => {
      const sheet = ss.getSheetByName(nome);

      if (!sheet) {
        retorno[nome] = [];
        return;
      }

      const values = sheet.getDataRange().getValues();

      if (values.length <= 1) {
        retorno[nome] = [];
        return;
      }

      values.shift();

      retorno[nome] = values
        .filter((r) => String(r[0] || "").trim() !== "")
        .map((row) => ({
          id: String(row[0]),
          data: row.slice(1),
        }));
    });

    return json({ status: "ok", ...retorno });
  } catch (err) {
    return json({ status: "erro", message: String(err.message || err) });
  }
}

// ===== POST =====
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");

    const { action, aba, id, valores } = payload;

    if (!action || !aba) {
      throw new Error("Ação ou aba não informada");
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(aba);

    if (!sheet) throw new Error("Aba não encontrada: " + aba);

    const rows = sheet.getDataRange().getValues().slice(1);

    switch (action) {
      case "insert":
        if (!id) throw new Error("ID não informado");

        sheet.appendRow([id, ...(valores || [])]);

        return json({ status: "ok" });

      case "update": {
        if (!id) throw new Error("ID não informado");

        const idx = rows.findIndex((r) => String(r[0]) === String(id));

        if (idx === -1) throw new Error("ID não encontrado");

        sheet
          .getRange(idx + 2, 1, 1, (valores || []).length + 1)
          .setValues([[id, ...(valores || [])]]);

        return json({ status: "ok" });
      }

      case "delete": {
        if (!id) throw new Error("ID não informado");

        const idx = rows.findIndex((r) => String(r[0]) === String(id));

        if (idx === -1) throw new Error("ID não encontrado");

        sheet.deleteRow(idx + 2);

        return json({ status: "ok" });
      }

      default:
        throw new Error("Ação inválida: " + action);
    }
  } catch (err) {
    return json({ status: "erro", message: String(err.message || err) });
  }
}

// ===== JSON HELPER =====
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
