// script.js
// ✅ Punto de entrada principal de la app

// 📦 Importaciones de módulos
import { initMap } from "./initMap.js";
import { initSidebar } from "./sidebar.js";
import { getLocation } from "./centrarFavorito.js";
import { toggleTipo } from "./tipoActivo.js";
import { buscarLugar } from "./buscar.js";
import { clearAll } from "./limpiarMapa.js";
import {
  guardarEdicionFavorito,
  borrarFavorito,
  cerrarEditorFavorito,
} from "./favoritesManager.js";

// 🗺️ Callback para Google Maps (definido como global)
window.initApp = function () {
  console.log("✅ initApp ejecutada");

  // 🌍 Inicializa el mapa centrado (fallback Madrid si no hay ubicación)
  initMap(40.4168, -3.7038);

  // 🧭 Intenta centrar en la ubicación actual
  getLocation();

  // 🧩 Inicializa el sidebar con filtros, sliders, favoritos, etc.
  initSidebar();
};

// 🧠 Lógica que no depende de Google Maps
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM listo");

  // 🔍 Buscar lugar
  const btnBuscar = document.querySelector(".search-group button");
  btnBuscar?.addEventListener("click", buscarLugar);

  // 🧹 Limpiar resultados
  const btnLimpiar = document.querySelector(".clear-button");
  btnLimpiar?.addEventListener("click", clearAll);

  // 💾 Guardar edición de favorito
  document
    .getElementById("btnGuardarFavorito")
    ?.addEventListener("click", guardarEdicionFavorito);

  // 🗑️ Eliminar favorito
  document
    .getElementById("btnBorrarFavorito")
    ?.addEventListener("click", borrarFavorito);

  // ❌ Cancelar edición
  document
    .getElementById("btnCancelarEdicion")
    ?.addEventListener("click", cerrarEditorFavorito);
});
