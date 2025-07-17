// Scripts/buscar.js
import { currentCoords, map, userMarker } from "./variablesGlobales.js";//✅
import { actualizarBusquedaActiva } from "./searchManager.js";//✅
import { actualizarCirculo } from "./centrarFavorito.js";//✅

// 🧭 Busca una ciudad o dirección por nombre (con Nominatim)
function buscarLugar() {
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
      currentCoords.lat = lat;
      currentCoords.lng = lon;

      userMarker.setPosition(currentCoords);
      map.setCenter(currentCoords);
      map.setZoom(14);

      actualizarCirculo();
      actualizarBusquedaActiva();
    })
    .catch(err => {
      console.error(err);
      alert("Error al buscar el lugar");
    });
}

export { buscarLugar };
