// initApp.js

// 📦 Importaciones completas
import { initMap } from './initMap.js';
import { getLocation } from './centrarFavoritos.js';
import { renderizarFavoritos } from './favoritesManager.js';
import { actualizarBusquedaActiva } from './searchManager.js';
import { crearCirculo, actualizarCirculo } from './circuloBusqueda.js';
import { initSidebar } from './sidebar.js';
import { buscarLugar } from './buscar.js';
import { clearAll } from './limpiarMapa.js';
import {
  guardarEdicionFavorito,
  borrarFavorito,
  cerrarEditorFavorito,
} from './favoritesManager.js';
import { map, iconoUbicacion } from './variablesGlobales.js';

// ✅ Función principal que se ejecuta cuando Google Maps carga
export function initApp() {
  console.log("✅ initApp ejecutada");

  // 🌍 Inicializa el mapa centrado en fallback (Madrid)
  const mapa = initMap(40.4168, -3.7038); // debes asegurarte de que initMap devuelva el mapa creado

  // 🧭 Obtener ubicación real
// Scripts/initApp.js

navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // ✅ Llamamos a initMap y dejamos que se encargue de todo
    const mapa = initMap(lat, lng);
  },
  (err) => {
    console.warn("⚠️ No se pudo obtener la ubicación real:", err);
    // Puedes elegir usar coordenadas por defecto aquí si quieres:
    const lat = 40.4168; // Madrid
    const lng = -3.7038;
    const mapa = initMap(lat, lng);
  }
);


  // 🧩 Inicializa el sidebar y filtros
  initSidebar();

  // 🧠 Restaura estado anterior del filtro
  document.getElementById("buscadorFavoritos").value = localStorage.getItem("filtroTextoFavoritos") || "";
  document.getElementById("filtroTipoFavoritos").value = localStorage.getItem("filtroTipoFavoritos") || "";
  document.getElementById("ordenFavoritos").value = localStorage.getItem("ordenFavoritos") || "distanciaAsc";

  // 🎯 Renderiza favoritos guardados
  renderizarFavoritos();

  // 🔄 Actualiza UI del radio y búsqueda activa
  actualizarBusquedaActiva();

  // 🧠 Listeners de UI
  document.querySelector(".search-group button")?.addEventListener("click", buscarLugar);
  document.querySelector(".clear-button")?.addEventListener("click", clearAll);
  document.getElementById("btnGuardarFavorito")?.addEventListener("click", guardarEdicionFavorito);
  document.getElementById("btnBorrarFavorito")?.addEventListener("click", borrarFavorito);
  document.getElementById("btnCancelarEdicion")?.addEventListener("click", cerrarEditorFavorito);
}
