//======== INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👇 ======== //

import L from 'leaflet';
import { iconoUbicacion, setMap, setUserMarker, setCurrentCoords, getMap, getUserMarker } from './globales.js';
import { crearCirculo, actualizarCirculo } from './circuloBusqueda.js';
import { actualizarBusquedaActiva } from './busquedaActiva.js';

// 🚀 Inicializa el mapa con la ubicación dada
export function initMap(lat, lon) {
  const map = L.map("map").setView([lat, lon], 14);
  setMap(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  const coords = [lat, lon];
  setCurrentCoords(coords);

  const marker = L.marker(coords, {
    icon: iconoUbicacion,
    draggable: true
  }).addTo(map)
    .bindPopup("📍 Aquí estás tú, piloto 🚌💨")
    .openPopup();

  setUserMarker(marker);

  crearCirculo();

  marker.on("dragend", () => {
    const pos = marker.getLatLng();
    setCurrentCoords([pos.lat, pos.lng]);
    actualizarCirculo();
    actualizarBusquedaActiva();
  });

  document.getElementById("status").innerText = "Ubicación cargada";
}
//======== INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👆 ======== //
