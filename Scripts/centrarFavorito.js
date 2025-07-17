// ✅ centrarFavorito.js (módulo ES6)

import { initMap } from "./initMap.js";
import { map, userMarker, currentCoords } from "./variablesGlobales.js";
import { actualizarCirculo } from "./centrarFavorito.js";
import { actualizarBusquedaActiva } from "./searchManager.js";

// 🔁 función mejorada
export function getLocation() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite geolocalización");
    const fallback = { lat: 40.4168, lng: -3.7038 };
    initMap(fallback.lat, fallback.lng);
    crearCirculo(fallback.lat, fallback.lng);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      initMap(lat, lng);
      crearCirculo(lat, lng);
    },
    () => {
      console.warn("No se pudo obtener la ubicación. Usando ubicación por defecto.");
      const fallback = { lat: 40.4168, lng: -3.7038 };
      initMap(fallback.lat, fallback.lng);
      crearCirculo(fallback.lat, fallback.lng);
    },
    { enableHighAccuracy: true }
  );
}

export function crearCirculo(lat, lng) {
  const slider = document.getElementById("radiusSlider");
  if (!slider || !window.map) {
    console.warn("❌ No se puede crear el círculo: falta slider o mapa");
    return;
  }

  const radius = parseInt(slider.value);
  const centro = { lat, lng };

  if (window.searchCircle) {
    window.searchCircle.setMap(null);
  }

  window.searchCircle = new google.maps.Circle({
    strokeColor: "#0000ff",
    strokeOpacity: 0.5,
    strokeWeight: 1.5,
    fillColor: "#5fa",
    fillOpacity: 0.2,
    map: window.map,
    center: centro,
    radius: radius,
  });

  window.currentCoords = [lat, lng]; // asegúrate de mantener actualizado
  console.log("✅ Círculo creado en:", centro);
}

export function actualizarCirculo() {
  const radius = parseInt(document.getElementById("radiusSlider").value);
  if (!window.searchCircle || !window.currentCoords) return;

  window.searchCircle.setCenter({
    lat: window.currentCoords[0],
    lng: window.currentCoords[1],
  });
  window.searchCircle.setRadius(radius);

  console.log("🔄 Círculo actualizado");
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
