// Scripts/initMap.js
import {
  map, userMarker, searchCircle,
  currentCoords, iconoUbicacion
} from './variablesGlobales.js'; //✅

import { crearCirculo, actualizarCirculo } from './circuloBusqueda.js'; //✅
import { actualizarBusquedaActiva } from './searchManager.js';//✅

let infoWindow;

function initMap(lat, lon) {
  // Crear el mapa en el div #map
  const mapa = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng: lon },
    zoom: 14,
    mapId: "Sigueme_Illoo!!" // opcional, para mapas personalizados
  });

  // Guardar referencia global
  window.map = mapa;

  // Guardar coordenadas actuales
  window.currentCoords = [lat, lon];

  // Crear marcador del usuario (arrastrable)
  const marker = new google.maps.Marker({
    position: { lat, lng: lon },
    map: mapa,
    icon: iconoUbicacion,
    draggable: true
  });

  window.userMarker = marker;

  // Crear InfoWindow personalizado
  infoWindow = new google.maps.InfoWindow({
    content: "📍 Aquí estás tú, piloto 🚌💨"
  });
  infoWindow.open(mapa, marker);

  // Crear círculo de búsqueda
  crearCirculo(mapa, { lat, lng: lon });

  // Evento: cuando se arrastra el marcador
  marker.addListener("dragend", () => {
    const pos = marker.getPosition();
    window.currentCoords = [pos.lat(), pos.lng()];
    actualizarCirculo(window.currentCoords);
    actualizarBusquedaActiva();
  });

  // Mostrar estado en UI
  document.getElementById("status").innerText = "Ubicación cargada";
}

export { initMap };
