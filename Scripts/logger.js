// Crear contenedor visual de errores (oculto al inicio)
const errorBox = document.createElement("div");
errorBox.id = "errorBox";
errorBox.style.position = "fixed";
errorBox.style.bottom = "10px";
errorBox.style.left = "10px";
errorBox.style.padding = "15px";
errorBox.style.backgroundColor = "#00ff40ff";
errorBox.style.color = "white";
errorBox.style.borderRadius = "8px";
errorBox.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
errorBox.style.fontSize = "14px";
errorBox.style.zIndex = "9999";
errorBox.style.display = "none";
document.body.appendChild(errorBox);

// Función para mostrar errores en pantalla
function mostrarErrorVisual(mensaje) {
  errorBox.innerText = mensaje;
  errorBox.style.display = "block";

  // Se oculta después de 10 segundos
  setTimeout(() => {
    errorBox.style.display = "none";
  }, 10000);
}

// Captura errores globales
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error("🛑 Error capturado:");
  console.log("Mensaje:", msg);
  console.log("Archivo:", url);
  console.log("Línea:", lineNo);
  console.log("Columna:", columnNo);
  console.log("Error:", error);
  mostrarErrorVisual("⚠️ Error: " + msg);
  return false;
};

// Reportador manual de errores desde try/catch
function reportarError(error) {
  const msg = error.message || "Error desconocido";
  mostrarErrorVisual("⚠️ " + msg);
  window.onerror(msg, error.fileName || "desconocido", error.lineNumber || 0, 0, error);
}
