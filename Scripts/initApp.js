// initApp.js

import { initMap } from './initMap.js';
import { getLocation } from './centrarFavoritos.js';
import { renderizarFavoritos } from './favoritesManager.js';
import { actualizarBusquedaActiva } from './searchManager.js';
import { initSidebar } from './sidebar.js';
import { buscarLugar } from './buscar.js';
import { clearAll } from './limpiarMapa.js';
import {
  guardarEdicionFavorito,
  borrarFavorito,
  cerrarEditorFavorito,
} from './favoritesManager.js';

// ✅ Función principal que se ejecuta cuando Google Maps carga
export function initApp() {
  console.log("✅ initApp ejecutada");

  // 🗺️ Inicializa mapa con fallback (Madrid)
  let mapa = initMap(40.4168, -3.7038);

  // 🧭 Intentar obtener ubicación real
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      // ⚠️ Reinvoca initMap con ubicación real
      mapa = initMap(lat, lng);
    },
    (err) => {
      console.warn("⚠️ No se pudo obtener la ubicación real:", err);
      // Se queda en Madrid (fallback)
    }
  );

  // 🧩 Inicializa el sidebar y filtros
  initSidebar();

  document.getElementById("buscadorFavoritos").value = localStorage.getItem("filtroTextoFavoritos") || "";
  document.getElementById("filtroTipoFavoritos").value = localStorage.getItem("filtroTipoFavoritos") || "";
  document.getElementById("ordenFavoritos").value = localStorage.getItem("ordenFavoritos") || "distanciaAsc";

  renderizarFavoritos();
  actualizarBusquedaActiva();

  document.querySelector(".search-group button")?.addEventListener("click", buscarLugar);
  document.querySelector(".clear-button")?.addEventListener("click", clearAll);
  document.getElementById("btnGuardarFavorito")?.addEventListener("click", guardarEdicionFavorito);
  document.getElementById("btnBorrarFavorito")?.addEventListener("click", borrarFavorito);
  document.getElementById("btnCancelarEdicion")?.addEventListener("click", cerrarEditorFavorito);
}
