import L from "leaflet";
import { iconoUbicacion } from "./iconos.js";
import { crearCirculo, actualizarCirculo } from "./searchCircle.js";
import { actualizarBusquedaActiva } from "../funciones/buscar.js";
import { setMapInstance, setUserMarker, setCurrentCoords } from "./mapState.js";

export function initMap(lat, lon) {
  const map = L.map("map").setView([lat, lon], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  setCurrentCoords([lat, lon]);

  const marker = L.marker([lat, lon], {
    icon: iconoUbicacion,
    draggable: true
  }).addTo(map)
    .bindPopup("📍 Aquí estás tú, piloto 🚌💨")
    .openPopup();

  setUserMarker(marker);
  setMapInstance(map);

  crearCirculo();

  marker.on("dragend", () => {
    const pos = marker.getLatLng();
    setCurrentCoords([pos.lat, pos.lng]);
    actualizarCirculo();
    actualizarBusquedaActiva();
  });

  const status = document.getElementById("status");
  if (status) status.innerText = "Ubicación cargada";
}
