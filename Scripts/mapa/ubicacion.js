import { getMap, setCurrentCoords, getCurrentCoords, getUserMarker } from './globales.js';
import { initMap } from './mapa.js';
import { actualizarCirculo } from './circuloBusqueda.js';
import { tipoActivo } from './globales.js';
import { buscar } from './buscar.js';

//======== ACTUALIZACIÓN EN TIEMPO REAL Y OBTENCIÓN DE UBICACIÓN 👇 ======== //

// 📍 Usa la geolocalización del navegador para obtener la ubicación actual
export function getLocation() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite geolocalización");
    return;
  }

  document.getElementById("status").innerText = "Obteniendo ubicación...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const map = getMap();

      if (!map) {
        initMap(lat, lon);
      } else {
        const marker = getUserMarker();
        if (marker) marker.setLatLng([lat, lon]);
        map.setView([lat, lon], 14);
        setCurrentCoords([lat, lon]);
        actualizarCirculo();
        actualizarBusquedaActiva();
      }
    },
    (err) => {
      console.error(err);
      document.getElementById("status").innerText = "No se pudo obtener la ubicación";
    },
    { enableHighAccuracy: true, maximumAge: 1000 }
  );
}

// 🔁 Re-busca automáticamente lugares activos si cambia la ubicación
export function actualizarBusquedaActiva() {
  Object.keys(tipoActivo).forEach(tipo => {
    if (tipoActivo[tipo]) buscar(tipo);
  });
}

//======== ACTUALIZACIÓN EN TIEMPO REAL Y OBTENCIÓN DE UBICACIÓN 👆 ======== //
