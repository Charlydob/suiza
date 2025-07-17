// initApp.js
/*
import { initMap } from './initMap.js';
import { getLocation } from './centrarFavorito.js';
import { renderizarFavoritos } from './favoritesManager.js';
import { actualizarBusquedaActiva } from './searchManager.js';
import { actualizarCirculo } from './circuloBusqueda.js';

export function initApp() {
    console.log("✅ initApp ejecutada");
  // 🌍 Inicia el mapa con la ubicación actual o fallback
  getLocation();

  // 🧠 Restaura filtros guardados
  document.getElementById("buscadorFavoritos").value = localStorage.getItem("filtroTextoFavoritos") || "";
  document.getElementById("filtroTipoFavoritos").value = localStorage.getItem("filtroTipoFavoritos") || "";
  document.getElementById("ordenFavoritos").value = localStorage.getItem("ordenFavoritos") || "distanciaAsc";

  // 🎯 Renderiza favoritos filtrados
  renderizarFavoritos();

  // 🔄 Actualiza radio de búsqueda
  actualizarCirculo();
  actualizarBusquedaActiva();
}
*/

// initApp.js

// 🧩 Importaciones de módulos
import { initMap } from './initMap.js';
import { getLocation } from './centrarFavorito.js';
import { renderizarFavoritos } from './favoritesManager.js';
import { actualizarBusquedaActiva } from './searchManager.js';
import { crearCirculo, actualizarCirculo } from './centrarFavorito.js';
import { initSidebar } from './sidebar.js';
import { buscarLugar } from './buscar.js';
import { clearAll } from './limpiarMapa.js';
import {
  guardarEdicionFavorito,
  borrarFavorito,
  cerrarEditorFavorito,
} from './favoritesManager.js';

// ✅ Función principal que se ejecuta cuando Google Maps carga (callback)
export function initApp() {
  log("✅ initApp ejecutada");

  // 🌍 Inicializa el mapa con fallback a Madrid

  // 🧭 Intenta centrar en la ubicación actual
  getLocation();

  // 🧩 Inicializa sidebar y filtros
  try {
    initSidebar();
    log("initSidebar ejecutado correctamente ")
  } catch (e) {
    log("❌INITSIDEBAR❌", e.message);
  }
    // crea el circulo
try {
    crearCirculo();
    log("crearCirculo ejecutado correctamente ")
  } catch (e) {
    log("❌❌CREARCIRCULO❌❌", e.message);
  }
  // 🧠 Restaura filtros guardados
  document.getElementById("buscadorFavoritos").value = localStorage.getItem("filtroTextoFavoritos") || "";
  document.getElementById("filtroTipoFavoritos").value = localStorage.getItem("filtroTipoFavoritos") || "";
  document.getElementById("ordenFavoritos").value = localStorage.getItem("ordenFavoritos") || "distanciaAsc";

  // 🎯 Renderiza favoritos filtrados
try {
    renderizarFavoritos();
    log("renderizarFavoritos ejecutado correctamente ")
  } catch (e) {
    log("❌❌❌FAVORITOS❌❌❌", e.message);
  }
  // 🔄 Actualiza radio de búsqueda
  actualizarCirculo();
  actualizarBusquedaActiva();

  // 🧠 Listeners que dependen del DOM


  const btnBuscar = document.querySelector(".search-group button");
  btnBuscar?.addEventListener("click", buscarLugar);

  const btnLimpiar = document.querySelector(".clear-button");
  btnLimpiar?.addEventListener("click", clearAll);

  document
    .getElementById("btnGuardarFavorito")
    ?.addEventListener("click", guardarEdicionFavorito);

  document
    .getElementById("btnBorrarFavorito")
    ?.addEventListener("click", borrarFavorito);

  document
    .getElementById("btnCancelarEdicion")
    ?.addEventListener("click", cerrarEditorFavorito);
}
