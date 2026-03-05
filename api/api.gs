const SPREADSHEET_ID = "1RxD14YKY3wksLAb0YuOQZuFfNVJF9yIrDFydDMACWHA";

function doGet(e) {
  return routeRequest("GET", e);
}

function doPost(e) {
  return routeRequest("POST", e);
}

function routeRequest(method, e) {
  let resource;
  let action = "";

  if (method === "GET") {
    resource = e.parameter.resource;
  } else {
    const body = JSON.parse(e.postData.contents);
    resource = body.resource;
    action = body.action || "";
  }

  switch (resource) {
    case "alunos":
      if (method === "GET") {
        return getAlunos();
      }

      if (method === "POST") {
        if (action === "create") return createAluno(e);
        if (action === "update") return updateAluno(e);
        if (action === "delete") return deleteAluno(e);
      }
      break;

    default:
      return jsonResponse({
        success: false,
        error: "Resource not found",
      });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function getAlunos() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Alunos");

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const alunos = data.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });

  return jsonResponse({
    success: true,
    data: alunos,
  });
}

function createAluno(e) {
  const data = JSON.parse(e.postData.contents);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Alunos");

  const lastRow = sheet.getLastRow();
  const next = String(lastRow).padStart(4, "0");
  const id = `ALU-${next}`;

  sheet.appendRow([
    id,
    data.nome,
    data.nascimento,
    data.sexo,
    data.turno,
    data.ano,
    data.escola,
    data.responsavel,
    data.celular,
    data.status,
    data.foto_url || "",
  ]);

  return jsonResponse({
    success: true,
    id: id,
  });
}

function routeRequest(method, e) {
  let resource;
  let action;

  if (method === "GET") {
    resource = e.parameter.resource;
  } else {
    const body = JSON.parse(e.postData.contents);
    resource = body.resource;
    action = body.action;
  }

  switch (resource) {
    case "alunos":
      if (method === "GET") {
        return getAlunos();
      }

      if (method === "POST") {
        if (action === "create") return createAluno(e);
        if (action === "update") return updateAluno(e);
        if (action === "delete") return deleteAluno(e);
      }

      break;

    default:
      return jsonResponse({
        success: false,
        error: "Resource not found",
      });
  }
}

function updateAluno(e) {
  const data = JSON.parse(e.postData.contents);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Alunos");

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, 2).setValue(data.nome);
      sheet.getRange(i + 1, 3).setValue(data.nascimento);
      sheet.getRange(i + 1, 4).setValue(data.sexo);
      sheet.getRange(i + 1, 5).setValue(data.turno);
      sheet.getRange(i + 1, 6).setValue(data.ano);
      sheet.getRange(i + 1, 7).setValue(data.escola);
      sheet.getRange(i + 1, 8).setValue(data.responsavel);
      sheet.getRange(i + 1, 9).setValue(data.celular);
      sheet.getRange(i + 1, 10).setValue(data.status);
      sheet.getRange(i + 1, 11).setValue(data.foto_url || "");

      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({
    success: false,
    error: "Aluno not found",
  });
}

function deleteAluno(e) {
  const data = JSON.parse(e.postData.contents);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Alunos");

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.deleteRow(i + 1);

      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({
    success: false,
    error: "Aluno not found",
  });
}
