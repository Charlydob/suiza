// Scripts/circuloBusqueda.js
import { map, searchCircle, currentCoords } from './variablesGlobales.js'; //✅

let circuloBusqueda = null;

// 🔵 Crea el círculo de búsqueda alrededor del usuario
function crearCirculo(mapa, centro) {
  const radius = parseInt(document.getElementById("radiusSlider").value);

  if (circuloBusqueda) circuloBusqueda.setMap(null);

  circuloBusqueda = new google.maps.Circle({
    strokeColor: "#0000ff",
    strokeOpacity: 0.5,
    strokeWeight: 1.5,
    fillColor: "#5fa",
    fillOpacity: 0.2,
    map: mapa,
    center: centro,
    radius: radius
  });

  window.searchCircle = circuloBusqueda; // si sigues usando variables globales
}

// 🔁 Actualiza el círculo cuando cambia la ubicación o el radio
function actualizarCirculo(nuevasCoords) {
  const radius = parseInt(document.getElementById("radiusSlider").value);

  if (!circuloBusqueda) return;

  circuloBusqueda.setCenter({ lat: nuevasCoords[0], lng: nuevasCoords[1] });
  circuloBusqueda.setRadius(radius);
}

export { crearCirculo, actualizarCirculo }; //✅
