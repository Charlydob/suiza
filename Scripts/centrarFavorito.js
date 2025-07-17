// ✅ centrarFavorito.js (módulo ES6)

import { initMap } from "./initMap.js"; // ✅
import { map, userMarker, currentCoords } from "./variablesGlobales.js"; // ✅
import { actualizarCirculo } from "./circuloBusqueda.js"; // ✅
import { actualizarBusquedaActiva } from "./searchManager.js"; // ✅


export function getLocation() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite geolocalización");
    initMap(40.4168, -3.7038); // 🧭 Coordenadas por defecto: Madrid
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      initMap(lat, lng);
    },
    () => {
      console.warn("No se pudo obtener la ubicación. Usando ubicación por defecto.");
      initMap(40.4168, -3.7038); // 🧭 Madrid como fallback
    },
    { enableHighAccuracy: true }
  );
}

export function establecerCentroDesdeFavorito(lat, lon) {
  const nuevaPosicion = { lat, lng: lon };

  if (userMarker) {
    userMarker.setPosition(nuevaPosicion);
    currentCoords.lat = lat;
    currentCoords.lng = lon;
    map.setCenter(nuevaPosicion);
    map.setZoom(16);
    actualizarCirculo();
    actualizarBusquedaActiva();
  } 
}

// 👉 Asigna el listener al botón una vez el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  const btnUbicacion = document.querySelector("#location-controls button");
  if (btnUbicacion) {
    btnUbicacion.addEventListener("click", getLocation);
  }
});
