// Scripts/circuloBusqueda.js
import { map, searchCircle, currentCoords, iconoUbicacion } from './variablesGlobales.js'; //✅

let circuloBusqueda = null;

// 🔵 Crea el círculo de búsqueda alrededor del usuario
export function crearCirculo() {
  const radius = parseInt(document.getElementById("radiusSlider").value);
  const mapa = window.map;
  const centro = { lat: window.currentCoords[0], lng: window.currentCoords[1] };

  if (!mapa || !centro.lat || !document.getElementById("radiusSlider")) {
    log("❌ crearCirculo: faltan elementos necesarios");
    return;
  }

  if (window.searchCircle) window.searchCircle.setMap(null);

  window.searchCircle = new google.maps.Circle({
    strokeColor: "#0000ff",
    strokeOpacity: 0.5,
    strokeWeight: 1.5,
    fillColor: "#5fa",
    fillOpacity: 0.2,
    map: mapa,
    center: centro,
    radius: radius,
  });

  log("✅ Círculo creado correctamente");
}


// 🔁 Actualiza el círculo cuando cambia la ubicación o el radio
function actualizarCirculo(nuevasCoords) {
  const radius = parseInt(document.getElementById("radiusSlider").value);

  if (!circuloBusqueda) return;

  circuloBusqueda.setCenter({ lat: nuevasCoords[0], lng: nuevasCoords[1] });
  circuloBusqueda.setRadius(radius);
}

export { crearCirculo, actualizarCirculo }; //✅
