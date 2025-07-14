let map;
let userMarker;
let firstTime = true;

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
  iconUrl: 'Recursos/img/yo.png', // reemplaza con tu icono
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

      if (firstTime) {
        initMap(lat, lon);
        firstTime = false;
      } else {
        map.setView([lat, lon], 14);
        if (userMarker) {
  userMarker.setLatLng([lat, lon]);
} else {
  userMarker = L.marker([lat, lon], { icon: iconoUbicacion })
    .addTo(map)
    .bindPopup("📍 Aquí estás tú, piloto 🚌💨")
    .openPopup();
}

      }
    },
    (err) => {
      console.error(err);
      let msg = "Error al obtener ubicación.";
      if (err.code === 1) msg += " El usuario denegó el permiso.";
      else if (err.code === 2) msg += " Ubicación no disponible.";
      else if (err.code === 3) msg += " Timeout.";
      document.getElementById("status").innerText = msg;
      alert(msg);
    }
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

      data.elements.forEach(e => {
        const coords = e.type === "node" ? [e.lat, e.lon] : [e.center.lat, e.center.lon];
        const name = e.tags.name || tipo;

        const marker = L.marker(coords, { icon: iconos[tipo] }).addTo(map).bindPopup(name);
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
    boton.classList.remove("activo");
    boton.classList.add("inactivo");
  });

  document.getElementById("status").innerText = "Mapa limpio";
}

