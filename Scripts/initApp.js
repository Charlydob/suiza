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
window.initMapInterno = initMap; // por si quieres usarlo luego desde fuera

// Primero centra en fallback, luego intenta detectar ubicación
let mapa;
const fallbackLat = 40.4168;
const fallbackLng = -3.7038;
mapa = initMap(fallbackLat, fallbackLng);

// Luego reemplaza con ubicación real si se consigue
navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    mapa = initMap(lat, lng); // ⚠️ esto solo funciona si google.maps ya está definido
  },
  (err) => {
    console.warn("⚠️ No se pudo obtener la ubicación real:", err);
  }
);

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

// Hacer que initApp sea accesible desde el ámbito global
window.initApp = initApp;

}
