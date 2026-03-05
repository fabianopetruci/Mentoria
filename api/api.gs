const SPREADSHEET_ID = "1RxD14YKY3wksLAb0YuOQZuFfNVJF9yIrDFydDMACWHA";
const PASTA_FOTOS_ID = "135vdzduv1b0Jk5sz07TdUs-2vhVefpwp";

const ABAS = ["Alunos"]; // por enquanto só alunos

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

function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");

    if (payload.action === "uploadFoto") {
      return uploadFoto(payload);
    }

    const { action, aba, id, valores } = payload;

    if (!action || !aba) throw new Error("Ação ou aba não informada");

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

function uploadFoto(payload) {
  try {
    const folder = DriveApp.getFolderById(PASTA_FOTOS_ID);
    if (!folder) throw new Error("Pasta não encontrada no Drive");

    const dataUrl = String(payload.dataUrl || "");
    const alunoId = payload.alunoId || "ALU-" + Date.now();

    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) throw new Error("DataURL inválida");

    const mimeType = match[1];
    const base64 = match[2];
    const bytes = Utilities.base64Decode(base64);

    const ext = mimeType.includes("png") ? "png" : "jpg";
    const blob = Utilities.newBlob(
      bytes,
      mimeType,
      `aluno_${alunoId}_${Date.now()}.${ext}`,
    );

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fotoUrl = `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w300`;

    return json({ status: "ok", fotoUrl, fileId: file.getId() });
  } catch (err) {
    return json({ status: "erro", message: String(err.message || err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
