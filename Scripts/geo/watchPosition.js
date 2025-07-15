import { getMapInstance, setUserMarker, setCurrentCoords } from '../map/mapState.js';
import { iconoUbicacion } from '../map/iconos.js';
import { actualizarCirculo } from '../map/searchCircle.js';
import { actualizarBusquedaActiva } from '../funciones/buscar.js';

export function iniciarSeguimiento() {
  if (!navigator.geolocation) {
    console.error("La geolocalización no está disponible.");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const coords = [lat, lon];
      const map = getMapInstance();

      setCurrentCoords(coords);

      // Si ya hay un marcador, se mueve; si no, se crea
      let marker = setUserMarker(marker => {
        if (marker) {
          marker.setLatLng(coords);
        } else {
          const newMarker = L.marker(coords, {
            icon: iconoUbicacion,
            draggable: true
          }).addTo(map)
            .bindPopup("📍 Aquí estás tú, piloto 🚌💨")
            .openPopup();

          newMarker.on("dragend", () => {
            const pos = newMarker.getLatLng();
            setCurrentCoords([pos.lat, pos.lng]);
            actualizarCirculo();
            actualizarBusquedaActiva();
          });

          return newMarker;
        }
        return marker;
      });

      if (map) {
        map.setView(coords, map.getZoom() || 14);
      }

      actualizarCirculo();
      actualizarBusquedaActiva();
      document.getElementById("status").innerText = "📍 Ubicación actualizada";
    },
    (error) => {
      console.error("Error obteniendo ubicación:", error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
}
