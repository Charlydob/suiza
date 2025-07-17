// Logger global para capturar errores
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error("🛑 Error capturado:");
  console.log("Mensaje:", msg);
  console.log("Archivo:", url);
  console.log("Línea:", lineNo);
  console.log("Columna:", columnNo);
  console.log("Error:", error);
  alert("Se ha producido un error. Revisa la consola para más detalles.");
  return false;
};

// Función para reportar errores desde try/catch
function reportarError(error) {
  window.onerror(
    error.message,
    error.fileName || "desconocido",
    error.lineNumber || 0,
    0,
    error
  );
}
