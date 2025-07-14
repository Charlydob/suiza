let map;
let userMarker;
let firstTime = true;

const markersPorTipo = {
  camp_site: [],
  fuel: [],
  parking: [],
  hotel: [],
  airbnb: [],
  luggage: []
};

const iconos = {
  camp_site: L.icon({ iconUrl: 'Recursos/img/camping.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30] }),
  fuel: L.icon({ iconUrl: 'Recursos/img/gasolinera.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30] }),
  parking: L.icon({ iconUrl: 'Recursos/img/parking.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30] }),
  hotel: L.icon({ iconUrl: 'Recursos/img/hotel.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30] }),
  airbnb: L.icon({ iconUrl: 'Recursos/img/airbnb.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30] }),
  luggage: L.icon({ iconUrl: 'Recursos/img/maleta.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30] })
};

const iconoUbicacion = L.icon({
  iconUrl: 'Recursos/img/yo.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
});

const tipoActivo = {
  camp_site: false,
  fuel: false,
  parking: false,
  hotel: false,
  airbnb: false,
  luggage: false
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

  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      if (!map) {
        initMap(lat, lon);
      } else {
        userMarker.setLatLng([lat, lon]);
      }
      document.getElementById("status").innerText = "Ubicación actualizada";
    },
    (err) => {
      console.error(err);
      document.getElementById("status").innerText = "No se pudo obtener la ubicación";
    },
    { enableHighAccuracy: true, maximumAge: 1000 }
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

  let filtro;

  if (tipo === "hotel") {
    filtro = `node["tourism"="hotel"](around:5000,${lat},${lon});`;
    filtro += `way["tourism"="hotel"](around:5000,${lat},${lon});`;
  } else if (tipo === "airbnb") {
    filtro = `
      node["tourism"="guest_house"](around:5000,${lat},${lon});
      node["tourism"="apartment"](around:5000,${lat},${lon});
    `;
  } else if (tipo === "luggage") {
    filtro = `node["amenity"="locker"](around:5000,${lat},${lon});`;
    filtro += `way["amenity"="locker"](around:5000,${lat},${lon});`;
  } else {
    filtro = `
      node["amenity"="${tipo}"](around:5000,${lat},${lon});
      way["amenity"="${tipo}"](around:5000,${lat},${lon});
    `;
  }

  const query = `[out:json];(${filtro});out center;`;

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
    .then(r => r.json())
    .then(data => {
      markersPorTipo[tipo].forEach(m => map.removeLayer(m));
      markersPorTipo[tipo] = [];

      if (!data.elements.length) {
        const searchLink = `https://www.google.com/maps/search/${tipo}/@${lat},${lon},14z`;
        document.getElementById("status").innerHTML =
          `No se encontraron resultados para ${tipo}.<br><a href="${searchLink}" target="_blank">🔍 Buscar ${tipo} en Google Maps</a>`;
        return;
      }

      data.elements.forEach(e => {
        const coords = e.type === "node" ? [e.lat, e.lon] : [e.center.lat, e.center.lon];
        const name = e.tags?.name || tipo;

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

function clearAll() {
  Object.keys(markersPorTipo).forEach(tipo => {
    markersPorTipo[tipo].forEach(m => map.removeLayer(m));
    markersPorTipo[tipo] = [];
    tipoActivo[tipo] = false;
    const boton = document.getElementById(`btn-${tipo}`);
    if (boton) {
      boton.classList.remove("activo");
      boton.classList.add("inactivo");
    }
  });
  document.getElementById("status").innerText = "Mapa limpio";
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  sidebar.addEventListener("touchstart", function (e) {
    if (e.touches.length > 1) return;
    e.stopPropagation();
  }, { passive: false });

  sidebar.addEventListener("dblclick", function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
});
