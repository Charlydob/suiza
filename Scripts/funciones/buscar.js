import { getTipoActivo } from '../map/tipoActivo.js';
import { markersPorTipo } from '../map/markersPorTipo.js';
import { iconos } from '../map/iconos.js';

export function updateSearch(map, userMarker, circle) {
  const tipo = getTipoActivo();
  if (!tipo) return;

  const { lat, lng } = userMarker.getLatLng();
  const radius = circle.getRadius();

  // Limpia marcadores anteriores del tipo
  markersPorTipo[tipo].forEach(m => map.removeLayer(m));
  markersPorTipo[tipo] = [];

  let query;
  switch (tipo) {
    case 'parking':
      query = `[out:json][timeout:25];
        (
          node["amenity"="parking"]["access"!~"private"](around:${radius},${lat},${lng});
          way["amenity"="parking"]["access"!~"private"](around:${radius},${lat},${lng});
        );
        out center;`;
      break;
    case 'hospital':
      query = `[out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
        );
        out center;`;
      break;
    case 'restaurante':
      query = `[out:json][timeout:25];
        (
          node["amenity"="restaurant"](around:${radius},${lat},${lng});
          way["amenity"="restaurant"](around:${radius},${lat},${lng});
        );
        out center;`;
      break;
  }

  if (!query) return;

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
    .then(response => response.json())
    .then(data => {
      data.elements.forEach(el => {
        const coords = el.type === "node" ? [el.lat, el.lon] : [el.center.lat, el.center.lon];
        const marker = L.marker(coords, { icon: iconos[tipo] });
        marker.bindPopup(`<b>${el.tags.name || tipo}</b>`);
        marker.addTo(map);
        markersPorTipo[tipo].push(marker);
      });
    })
    .catch(err => console.error("Error al buscar lugares:", err));
}
