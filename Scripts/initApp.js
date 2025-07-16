// initApp.js
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
