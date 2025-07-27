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

            // Oculta todas las páginas y elimina clase activa
            paginas.forEach(p => {
              p.style.display = "none";
              p.classList.remove("activa");
              p.style.overflow = "hidden";
            });

            // Muestra la página correspondiente y la marca como activa
            const paginaDestino = document.getElementById("pagina-" + destino);
            if (!paginaDestino) throw new Error(`No se encontró la página: pagina-${destino}`);
            paginaDestino.style.display = "block";
            paginaDestino.classList.add("activa");

            // ⏯️ Ejecutar lógica específica por página
if (destino === "dashboard" && typeof initDashboard === "function") {
  console.log("🚀 Lanzando initDashboard desde menú");
  initDashboard();
}


            // ✅ Solo permitir scroll en el itinerario
            if (destino === "itinerario") {
              paginaDestino.style.overflowY = "auto";
            }

            // 🔄 Ajustar margen del <main> si es mapa u otra
            actualizarMarginMain();
            
            // actualizar gastos al cargarse
            if (destino === "gastos") {
            if (typeof window.cargarGastosFirebase === "function") window.cargarGastosFirebase();
            if (typeof window.renderizarResumenGastos === "function") window.renderizarResumenGastos();
}


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
      defaultPage.classList.add("activa"); // ✅ Clase activa al cargar
      actualizarMarginMain(); // ✅ Ajuste inicial del margen
    } catch (errDefault) {
      reportarError(errDefault);
    }

  } catch (errGlobal) {
    reportarError(errGlobal);
  }
});

function actualizarMarginMain() {
  const main = document.querySelector("main");
  const paginaMapa = document.getElementById("pagina-mapa");

  if (paginaMapa.classList.contains("activa")) {
    main.style.marginBottom = "0";
  } else {
    main.style.marginBottom = "80px";
  }
}
