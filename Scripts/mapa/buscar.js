//======== CONSULTA A OVERPASS API (OpenStreetMap) 👇 ======== //

import { currentCoords, map, iconos, markersPorTipo } from './globales.js';

function buscar(tipo) {
  if (!currentCoords) return;

  const [lat, lon] = currentCoords;
  const radius = parseInt(document.getElementById("radiusSlider").value);

  let query = "";

  if (tipo === "hotel") {
    query = `
      [out:json];
      (
        node["tourism"="hotel"](around:${radius},${lat},${lon});
        way["tourism"="hotel"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "airbnb") {
    query = `
      [out:json];
      (
        node["building"="apartments"](around:${radius},${lat},${lon});
        way["building"="apartments"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "luggage") {
    query = `
      [out:json];
      (
        node["amenity"="locker"](around:${radius},${lat},${lon});
        way["amenity"="locker"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "parking") {
    query = `
      [out:json];
      (
        node["amenity"="parking"]["access"~"yes|public"]["parking"!="bicycle"](around:${radius},${lat},${lon});
        way["amenity"="parking"]["access"~"yes|public"]["parking"!="bicycle"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "airport") {
    query = `
      [out:json];
      (
        node["aeroway"="aerodrome"](around:${radius},${lat},${lon});
        node["aeroway"="airport"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "tourism") {
    query = `
      [out:json];
      (
        node["tourism"="attraction"](around:${radius},${lat},${lon});
        node["tourism"="viewpoint"](around:${radius},${lat},${lon});
        node["historic"](around:${radius},${lat},${lon});
        node["tourism"="museum"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "restaurant") {
    query = `
      [out:json];
      (
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        way["amenity"="restaurant"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "cafe") {
    query = `
      [out:json];
      (
        node["amenity"="cafe"](around:${radius},${lat},${lon});
        way["amenity"="cafe"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "hospital") {
    query = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else {
    query = `
      [out:json];
      (
        node["amenity"="${tipo}"](around:${radius},${lat},${lon});
        way["amenity"="${tipo}"](around:${radius},${lat},${lon});
        relation["amenity"="${tipo}"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  }

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
    .then(r => r.json())
    .then(data => {
      markersPorTipo[tipo].forEach(m => map.removeLayer(m));
      markersPorTipo[tipo] = [];

      if (data.elements.length === 0 && tipo === "luggage") {
        const [lat, lon] = currentCoords;
        const link = `https://www.google.com/maps/search/consigna+equipaje/@${lat},${lon},14z`;
        document.getElementById("status").innerHTML = `No se encontraron consignas. <a href="${link}" target="_blank">Buscar en Google Maps</a>`;
        return;
      }

      data.elements.forEach(e => {
        const coords = e.type === "node" ? [e.lat, e.lon] : [e.center.lat, e.center.lon];
        const name = e.tags.name || tipo;

        const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}&travelmode=driving&dir_action=navigate&avoid=tolls`;
        const searchLink = `https://www.google.com/maps/search/${tipo}/@${coords[0]},${coords[1]},14z`;

        const popupHTML = `
          <b>${name}</b><br>
          <a href='${mapsLink}' target='_blank'>🧭 Cómo llegar</a><br>
          <a href='${searchLink}' target='_blank'>🔎 Buscar en Maps</a>
        `;

        const marker = L.marker(coords, { icon: iconos[tipo] }).addTo(map).bindPopup(popupHTML);
        markersPorTipo[tipo].push(marker);
      });

      document.getElementById("status").innerText = `Mostrando ${data.elements.length} resultados para ${tipo}`;
    })
    .catch(err => {
      console.error(err);
      alert("Error buscando " + tipo);
      document.getElementById("status").innerText = "Error de búsqueda";
    });
}

export default buscar;
//======== CONSULTA A OVERPASS API (OpenStreetMap) 👆 ======== //
