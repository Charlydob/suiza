// Garantiza que la función reportarError exista incluso si logger.js está desactivado👇

if (typeof reportarError !== "function") {
  window.reportarError = function (e) {
    console.warn("Logger desactivado. Error:", e);
  };
}
// Garantiza que la función reportarError exista incluso si logger.js está desactivado👆
document.addEventListener("DOMContentLoaded", () => {
  try {
    const botones = document.querySelectorAll(".nav-btn");
    const paginas = document.querySelectorAll("[id^='pagina-']");

    if (!botones.length || !paginas.length) {
      throw new Error("Botones de navegación o páginas no encontrados");
    }

    botones.forEach(btn => {
      try {
        btn.addEventListener("click", () => {
          try {
            const destino = btn.getAttribute("data-page");
            if (!destino) throw new Error("Botón sin atributo 'data-page'");

            // Oculta todas las páginas
            paginas.forEach(p => {
              p.style.display = "none";
            });

            // Muestra la página correspondiente
            const paginaDestino = document.getElementById("pagina-" + destino);
            if (!paginaDestino) throw new Error(`No se encontró la página: pagina-${destino}`);
            paginaDestino.style.display = "block";

            // Actualiza clases de los botones
            botones.forEach(b => b.classList.remove("activo"));
            btn.classList.add("activo");

          } catch (errClick) {
            reportarError(errClick);
          }
        });
      } catch (errEvent) {
        reportarError(errEvent);
      }
    });

    // Mostrar por defecto la sección de mapa
    try {
      const defaultPage = document.getElementById("pagina-mapa");
      if (!defaultPage) throw new Error("Página por defecto 'pagina-mapa' no encontrada");
      defaultPage.style.display = "block";
    } catch (errDefault) {
      reportarError(errDefault);
    }

  } catch (errGlobal) {
    reportarError(errGlobal);
  }
});
