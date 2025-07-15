import { map, currentCoords, userMarker } from "../globales.js";
import { actualizarCirculo } from "./circuloBusqueda.js";
import { actualizarBusquedaActiva } from "./ubicacion.js";

// 🧭 Busca una ciudad o dirección por nombre (con Nominatim)
export function buscarLugar() {
  const lugar = document.getElementById("locationSearch").value;
  if (!lugar) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        alert("Lugar no encontrado");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      currentCoords[0] = lat;
      currentCoords[1] = lon;
      userMarker.setLatLng(currentCoords);
      map.setView(currentCoords, 14);
      actualizarCirculo();
      actualizarBusquedaActiva();
    })
    .catch(err => {
      console.error(err);
      alert("Error al buscar el lugar");
    });
}