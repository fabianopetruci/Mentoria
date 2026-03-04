const SPREADSHEET_ID = "1RxD14YKY3wksLAb0YuOQZuFfNVJF9yIrDFydDMACWHA";

function doGet(e) {
  return routeRequest("GET", e);
}

function doPost(e) {
  return routeRequest("POST", e);
}

function routeRequest(method, e) {
  let resource;

  if (method === "GET") {
    resource = e.parameter.resource;
  } else {
    const body = JSON.parse(e.postData.contents);
    resource = body.resource;
  }

  switch (resource) {
    case "alunos":
      if (method === "GET") {
        return getAlunos();
      }

      if (method === "POST") {
        return createAluno(e);
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

  const id = "ALU" + Utilities.getUuid().slice(0, 6);

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
