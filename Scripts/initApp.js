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
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const centro = { lat, lng };

      // 📍 Crear marcador arrastrable en la ubicación real
      const marcador = new google.maps.Marker({
        position: centro,
        map: mapa,
        draggable: true,
        icon: {
          url: iconoUbicacion,
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      // Centrar el mapa en la ubicación real
      mapa.setCenter(centro);

      // 🔵 Crear círculo inicial alrededor del marcador
      crearCirculo(mapa, centro);

      // 🔁 Actualizar círculo si el usuario arrastra el marcador
      marcador.addListener('dragend', () => {
        const nuevaPos = marcador.getPosition();
        const nuevasCoords = [nuevaPos.lat(), nuevaPos.lng()];
        actualizarCirculo(nuevasCoords);
        mapa.setCenter(nuevaPos);
      });
    },
    (err) => {
      console.warn("⚠️ No se pudo obtener la ubicación real:", err);
      // El mapa ya estará centrado en Madrid por defecto
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
