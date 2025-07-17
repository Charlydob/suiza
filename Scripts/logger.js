// Crear contenedor visual de errores (oculto al inicio)
const errorBox = document.createElement("div");
errorBox.id = "errorBox";
errorBox.style.position = "fixed";
errorBox.style.bottom = "10px";
errorBox.style.left = "10px";
errorBox.style.maxWidth = "400px";
errorBox.style.maxHeight = "300px";
errorBox.style.overflowY = "auto";
errorBox.style.padding = "10px";
errorBox.style.backgroundColor = "#000000ee";
errorBox.style.color = "white";
errorBox.style.borderRadius = "8px";
errorBox.style.boxShadow = "0 0 10px rgba(0,0,0,0.6)";
errorBox.style.fontSize = "13px";
errorBox.style.zIndex = "9999";
errorBox.style.display = "none";
document.body.appendChild(errorBox);

// Botón de cerrar
const closeButton = document.createElement("button");
closeButton.innerText = "✖";
closeButton.style.position = "absolute";
closeButton.style.top = "5px";
closeButton.style.right = "10px";
closeButton.style.background = "transparent";
closeButton.style.border = "none";
closeButton.style.color = "white";
closeButton.style.cursor = "pointer";
closeButton.style.fontSize = "16px";
closeButton.onclick = () => errorBox.style.display = "none";
errorBox.appendChild(closeButton);

// Contenedor interno de mensajes
const errorList = document.createElement("div");
errorList.id = "errorList";
errorBox.appendChild(errorList);

// Función para mostrar errores en pantalla (acumulativo y persistente)
function mostrarErrorVisual(mensaje) {
  const entry = document.createElement("div");
  entry.innerText = mensaje;
  entry.style.marginBottom = "8px";
  entry.style.borderBottom = "1px solid #555";
  entry.style.paddingBottom = "4px";
  errorList.appendChild(entry);
  errorBox.style.display = "block";
}

// Captura errores globales
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error("🛑 Error capturado:");
  console.log("Mensaje:", msg);
  console.log("Archivo:", url);
  console.log("Línea:", lineNo);
  console.log("Columna:", columnNo);
  console.log("Error:", error);
  mostrarErrorVisual(`⚠️ ${msg} [${url}:${lineNo}]`);
  return false;
};

// Reportador manual de errores desde try/catch
function reportarError(error) {
  const msg = error.message || "Error desconocido";
  mostrarErrorVisual(`⚠️ ${msg}`);
  window.onerror(msg, error.fileName || "desconocido", error.lineNumber || 0, 0, error);
}
