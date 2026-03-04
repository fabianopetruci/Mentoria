function doGet(e) {
  return routeRequest("GET", e);
}

function doPost(e) {
  return routeRequest("POST", e);
}

function routeRequest(method, e) {
  const resource = e.parameter.resource;

  switch (resource) {
    case "alunos":
      if (method === "GET") {
        return getAlunos();
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
  return jsonResponse({
    success: true,
    data: [],
  });
}
