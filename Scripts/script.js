// script.js
// ✅ Punto de entrada principal de la app
import { initApp } from "./initApp.js";
window.initApp = initApp;

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
