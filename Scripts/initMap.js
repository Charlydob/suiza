// Scripts/initMap.js
import {
  map, userMarker, searchCircle,
  currentCoords, iconoUbicacion, setUbicacionReal, ubicacionReal
} from './variablesGlobales.js'; //✅
window.ubicacionReal = { lat, lng: lon };
import { crearCirculo, actualizarCirculo } from './circuloBusqueda.js'; //✅
import { actualizarBusquedaActiva } from './searchManager.js'; //✅

let infoWindow;

function initMap(lat, lon) {
  const centro = { lat, lng: lon };

  // Crear el mapa en el div #map
  const mapa = new google.maps.Map(document.getElementById("map"), {
    center: centro,
    zoom: 14,
    mapId: "Sigueme_Illoo!!" // opcional, para mapas personalizados
  });
  // ✅ Actualiza la ubicación real correctamente
  setUbicacionReal(centro);
  // Guardar referencia global
  window.map = mapa;
  window.currentCoords = [lat, lon];

  // 📍 Crear marcador arrastrable en la ubicación real
  const marker = new google.maps.Marker({
    position: centro,
    map: mapa,
    draggable: true,
    icon: {
      url: iconoUbicacion,
      scaledSize: new google.maps.Size(40, 40),
    },
  });

  window.userMarker = marker;

  // Crear InfoWindow personalizado
  infoWindow = new google.maps.InfoWindow({
    content: "📍 Aquí estás tú, piloto 🚌💨"
  });
  infoWindow.open(mapa, marker);

  // Crear círculo de búsqueda
  crearCirculo(mapa, centro);

  // Evento: cuando se arrastra el marcador
  marker.addListener("dragend", () => {
    const pos = marker.getPosition();
    window.currentCoords = [pos.lat(), pos.lng()];
    actualizarCirculo(window.currentCoords);
    actualizarBusquedaActiva();
  });

  // Mostrar estado en UI
  document.getElementById("status").innerText = "Ubicación cargada";

  return mapa;
}

export { initMap };
