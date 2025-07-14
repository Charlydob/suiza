let map;
let userMarker;

const GOOGLE_API_KEY = "AIzaSyA8KhfGc61uBT3DHS1hiCEl7HgnFYaWySI"; // <-- Pega aquí tu clave

const markersPorTipo = {
  camp_site: [],
  fuel: [],
  parking: []
};

const iconos = {
  camp_site: L.icon({
    iconUrl: 'Recursos/img/camping.png',
    iconSize: [32, 32],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30]
  }),
  fuel: L.icon({
    iconUrl: 'Recursos/img/gasolinera.png',
    iconSize: [32, 32],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30]
  }),
  parking: L.icon({
    iconUrl: 'Recursos/img/parking.png',
    iconSize: [32, 32],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30]
  })
};

const iconoUbicacion = L.icon({
  iconUrl: 'Recursos/img/yo.png',
  iconSize: [32, 32],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30]
});

const tipoActivo = {
  camp_site: false,
  fuel: false,
  parking: false
};

function initMap(lat, lon) {
  map = L.map("map").setView([lat, lon], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  userMarker = L.marker([lat, lon], { icon: iconoUbicacion })
    .addTo(map)
    .bindPopup("📍 Aquí estás tú, piloto 🚌💨")
    .openPopup();

  document.getElementById("status").innerText = "Ubicación cargada";
}

function getLocation() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite geolocalización");
    return;
  }

  document.getElementById("status").innerText = "Obteniendo ubicación...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      if (!map) {
        initMap(lat, lon);
      } else {
        userMarker.setLatLng([lat, lon]);
        map.setView([lat, lon]);
        document.getElementById("status").innerText = "Ubicación actualizada";
      }
    },
    (err) => {
      console.error(err);
      document.getElementById("status").innerText = "No se pudo obtener la ubicación";
    },
    { enableHighAccuracy: true }
  );
}

function toggleTipo(tipo) {
  tipoActivo[tipo] = !tipoActivo[tipo];
  const boton = document.getElementById(`btn-${tipo}`);

  if (tipoActivo[tipo]) {
    boton.classList.add("activo");
    boton.classList.remove("inactivo");
    buscar(tipo);
  } else {
    boton.classList.remove("activo");
    boton.classList.add("inactivo");
    markersPorTipo[tipo].forEach(m => map.removeLayer(m));
    markersPorTipo[tipo] = [];
    document.getElementById("status").innerText = `Ocultando ${tipo}`;
  }
}

function buscar(tipo) {
  const lat = map.getCenter().lat;
  const lon = map.getCenter().lng;

  const query = `
    [out:json];
    (
      node["amenity"="${tipo}"](around:5000,${lat},${lon});
      way["amenity"="${tipo}"](around:5000,${lat},${lon});
      relation["amenity"="${tipo}"](around:5000,${lat},${lon});
    );
    out center;
  `;

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
    .then(r => r.json())
    .then(data => {
      markersPorTipo[tipo].forEach(m => map.removeLayer(m));
      markersPorTipo[tipo] = [];

      data.elements.forEach(async e => {
        const coords = e.type === "node" ? [e.lat, e.lon] : [e.center.lat, e.center.lon];
        const marker = L.marker(coords, { icon: iconos[tipo] }).addTo(map);
        marker.bindPopup("Cargando...");
        markersPorTipo[tipo].push(marker);

        marker.on("click", async () => {
          const userPos = userMarker.getLatLng();

          // DISTANCIA Y DURACIÓN
          const directionsURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${userPos.lat},${userPos.lng}&destination=${coords[0]},${coords[1]}&mode=driving&avoid=tolls&key=${GOOGLE_API_KEY}`;
          const directionsResp = await fetch(`https://corsproxy.io/?${encodeURIComponent(directionsURL)}`);
          const directionsData = await directionsResp.json();

          const route = directionsData.routes?.[0]?.legs?.[0];
          const distancia = route?.distance?.text || "–";
          const duracion = route?.duration?.text || "–";

          // INFO DEL LUGAR
          const googleTipo = tipo === 'camp_site' ? 'rv_park' : tipo === 'fuel' ? 'gas_station' : 'parking';
          const placesURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords[0]},${coords[1]}&radius=50&type=${googleTipo}&key=${GOOGLE_API_KEY}`;
          const placesResp = await fetch(`https://corsproxy.io/?${encodeURIComponent(placesURL)}`);
          const placesData = await placesResp.json();

          const place = placesData.results?.[0];
          const name = place?.name || tipo;
          const rating = place?.rating ? `⭐ ${place.rating}` : "";
          const mapsLink = place?.place_id
            ? `<br>🌐 <a href="https://www.google.com/maps/place/?q=place_id=${place.place_id}" target="_blank">Ver en Google Maps</a>`
            : "";

          const comoLlegarURL = `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${coords[0]},${coords[1]}&travelmode=driving&avoid=tolls`;

          const contenidoPopup = `
            <b>${name}</b><br>
            ${rating}<br>
            📍 ${distancia} (${duracion})<br>
            💰 Precio estimado: ${tipo === 'fuel' ? '1.95 CHF/L' : tipo === 'camp_site' ? '20 CHF/noche' : 'Gratis'}<br>
            ${mapsLink}
            <br>🚗 <a href="${comoLlegarURL}" target="_blank">Cómo llegar</a>
          `;

          marker.setPopupContent(contenidoPopup);
        });
      });

      document.getElementById("status").innerText = `Mostrando ${data.elements.length} resultados para ${tipo}`;
    })
    .catch(err => {
      console.error(err);
      alert("Error buscando " + tipo);
      document.getElementById("status").innerText = "Error de búsqueda";
    });
}

function clearAll() {
  Object.keys(markersPorTipo).forEach(tipo => {
    markersPorTipo[tipo].forEach(m => map.removeLayer(m));
    markersPorTipo[tipo] = [];
    tipoActivo[tipo] = false;

    const boton = document.getElementById(`btn-${tipo}`);
    boton.classList.remove("activo");
    boton.classList.add("inactivo");
  });

  document.getElementById("status").innerText = "Mapa limpio";
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
});

// Evita zoom por doble tap en el sidebar
const sidebar = document.getElementById("sidebar");

sidebar.addEventListener("touchstart", function (e) {
  if (e.touches.length > 1) return;
  e.stopPropagation();
}, { passive: false });

sidebar.addEventListener("dblclick", function (e) {
  e.preventDefault();
  e.stopPropagation();
});
