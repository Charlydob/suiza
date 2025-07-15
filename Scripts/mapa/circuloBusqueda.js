//======== GESTIÓN DEL CÍRCULO DE BÚSQUEDA 👇 ======== //

import L from 'leaflet';
import { getMap, getCurrentCoords, setSearchCircle, getSearchCircle } from './globales.js';

// 🔵 Crea el círculo de búsqueda alrededor del usuario
export function crearCirculo() {
  const radius = parseInt(document.getElementById("radiusSlider").value);
  const map = getMap();
  const coords = getCurrentCoords();

  const oldCircle = getSearchCircle();
  if (oldCircle) map.removeLayer(oldCircle);

  const newCircle = L.circle(coords, {
    radius,
    color: "blue",
    fillColor: "#5fa",
    fillOpacity: 0.2
  }).addTo(map);

  setSearchCircle(newCircle);
}

// 🔁 Actualiza el círculo cuando cambia la ubicación o el radio
export function actualizarCirculo() {
  const radius = parseInt(document.getElementById("radiusSlider").value);
  const circle = getSearchCircle();
  const coords = getCurrentCoords();

  if (circle) {
    circle.setLatLng(coords);
    circle.setRadius(radius);
  }
}

//======== GESTIÓN DEL CÍRCULO DE BÚSQUEDA 👆 ======== //
