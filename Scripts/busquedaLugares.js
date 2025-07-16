// ✅ busquedaLugares.js (módulo ES6)

import { currentCoords, ubicacionReal, favoritos, ignorados, iconos, map, markersPorTipo } from "./variablesGlobales.js";// ✅
import { calcularDistancia } from "./calcularDistancia.js";// ✅
import { toggleFavorito } from "./favoritesManager.js";// ✅
import { ignorarLugar } from "./gestionIgnorados.js";// ✅

export async function buscar(tipo) {
  if (!currentCoords) return;

  const centro = window.getCentroBusqueda?.();
  const lat = centro?.lat || currentCoords[0];
  const lon = centro?.lon || currentCoords[1];
  const radius = parseInt(document.getElementById("radiusSlider").value);

  let query = generarQueryPorTipo(tipo, radius, lat, lon);

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });
    const data = await response.json();

    markersPorTipo[tipo].forEach(m => m.setMap(null));
    markersPorTipo[tipo] = [];

    if (data.elements.length === 0 && tipo === "luggage") {
      await manejarSinResultadosLuggage(lat, lon);
      return;
    }

    data.elements.forEach(e => {
      const coords = e.type === "node" ? [e.lat, e.lon] : [e.center.lat, e.center.lon];
      const name = e.tags.name || tipo;
      const idUnico = `${tipo}_${coords[0].toFixed(5)}_${coords[1].toFixed(5)}`;
      if (ignorados.includes(idUnico)) return;

      const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}&travelmode=driving&dir_action=navigate&avoid=tolls`;
      const searchLink = `https://www.google.com/maps/search/${tipo}/@${coords[0]},${coords[1]},14z`;
      const exactSearchLink = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
      const yaEsFavorito = favoritos.find(f => f.id === idUnico);
      const userPos = ubicacionReal || currentCoords;
      const lat1 = Array.isArray(userPos) ? userPos[0] : userPos.lat;
      const lon1 = Array.isArray(userPos) ? userPos[1] : userPos.lng;
      const distanciaKm = calcularDistancia(lat1, lon1, coords[0], coords[1]);

      const tiempoCocheMin = Math.round((distanciaKm / 60) * 60);
      const tiempoPieMin = Math.round((distanciaKm / 5) * 60);

      const tiempoCoche = tiempoCocheMin >= 60
        ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
        : `${tiempoCocheMin} min en coche`;

      const tiempoPie = tiempoPieMin >= 60
        ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
        : `${tiempoPieMin} min a pie`;

      const popupHTML = `
        <div class="popup-personalizado">
          <b>${name}</b><br>
          Distancia: ${distanciaKm.toFixed(1)} km<br>
          ${tiempoCoche} | ${tiempoPie}<br>
          <div class="grupo-botones-arriba">
            <button onclick="window.open('${mapsLink}', '_blank')">🧭 Cómo llegar</button>
            <button onclick="window.open('${searchLink}', '_blank')">🔎 Similares</button>
          </div>
          <div class="boton-medio">
            <button onclick="window.open('${exactSearchLink}', '_blank')">🔍 Ver este sitio</button><br>
          </div>
          <div class="grupo-botones-abajo">
            <button onclick="toggleFavorito('${idUnico}', '${tipo}', [${coords}], '${name.replace(/'/g, "\\'")}', this)">
              ${yaEsFavorito ? "⭐" : "☆"} Favorito
            </button>
            <button onclick="ignorarLugar('${idUnico}')">🗑️ Ignorar</button>
          </div>
        </div>
      `;

      const marker = new google.maps.Marker({
        position: { lat: coords[0], lng: coords[1] },
        map,
        icon: iconos[tipo],
        title: name
      });

      const infoWindow = new google.maps.InfoWindow({ content: popupHTML });
      marker.addListener("click", () => infoWindow.open(map, marker));

      markersPorTipo[tipo].push(marker);
    });

    document.getElementById("status").innerText = `Mostrando ${data.elements.length} resultados para ${tipo}`;
  } catch (err) {
    console.error(err);
    alert("Error buscando " + tipo);
    document.getElementById("status").innerText = "Error de búsqueda";
  }
}

function generarQueryPorTipo(tipo, radius, lat, lon) {
  const q = (filtro) => `node${filtro}(around:${radius},${lat},${lon});way${filtro}(around:${radius},${lat},${lon});relation${filtro}(around:${radius},${lat},${lon});`;
  switch (tipo) {
    case "camping":
      return `
        [out:json];(
          ${q('["tourism"="camp_site"]')}
          ${q('["tourism"="caravan_site"]')}
        );out center;`;
    case "hotel":
      return `[out:json];(${q('["tourism"="hotel"]')});out center;`;
    case "airbnb":
      return `[out:json];(${q('["building"="apartments"]')});out center;`;
    case "luggage":
      return `
        [out:json];(
          ${q('["amenity"="locker"]')}
          ${q('["information"="luggage_storage"]')}
          ${q('["luggage"="yes"]')}
        );out center;`;
    case "parking":
      return `
        [out:json];(
          node["amenity"="parking"]["access"~"yes|public"]["parking"!="bicycle"](around:${radius},${lat},${lon});
          way["amenity"="parking"]["access"~"yes|public"]["parking"!="bicycle"](around:${radius},${lat},${lon});
        );out center;`;
    case "airport":
      return `[out:json];(${q('["aeroway"="aerodrome"]')});out center;`;
    case "tourism":
      return `
        [out:json];(
          ${q('["tourism"~"attraction|viewpoint|museum|artwork|theme_park|zoo|aquarium|gallery"]')}
          ${q('["historic"]')}
        );out center;`;
    case "restaurant":
      return `[out:json];(${q('["amenity"="restaurant"]')});out center;`;
    case "cafe":
      return `
        [out:json];(
          node["amenity"="cafe"]["name"!="Starbucks"]["amenity"!="bar"]["brand"!="Starbucks"](around:${radius},${lat},${lon});
          way["amenity"="cafe"]["name"!="Starbucks"]["amenity"!="bar"]["brand"!="Starbucks"](around:${radius},${lat},${lon});
          relation["amenity"="cafe"]["name"!="Starbucks"]["amenity"!="bar"]["brand"!="Starbucks"](around:${radius},${lat},${lon});
        );out center;`;
    case "hospital":
      return `
        [out:json];(
          ${q('["amenity"="hospital"]')}
          ${q('["healthcare"="hospital"]')}
        );out center;`;
    default:
      return `[out:json];(${q(`["amenity"="${tipo}"]`)});out center;`;
  }
}

async function manejarSinResultadosLuggage(lat, lon) {
  try {
    const geoResp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const geoData = await geoResp.json();
    const ciudad =
      geoData.address.city ||
      geoData.address.town ||
      geoData.address.village ||
      geoData.address.municipality ||
      geoData.address.county ||
      "la zona";

    const link = `https://www.google.com/maps/search/consigna+equipaje+${encodeURIComponent(ciudad)}/@${lat},${lon},14z`;
    document.getElementById("status").innerHTML = `No se encontraron consignas. <a href="${link}" target="_blank">Buscar en Google Maps en ${ciudad}</a>`;
  } catch (error) {
    console.error("Error obteniendo ciudad:", error);
    const fallbackLink = `https://www.google.com/maps/search/consigna+equipaje/@${lat},${lon},14z`;
    document.getElementById("status").innerHTML = `No se encontraron consignas. <a href="${fallbackLink}" target="_blank">Buscar en Google Maps</a>`;
  }
}
