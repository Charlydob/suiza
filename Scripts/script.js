let map;
let userMarker;
let firstTime = true;

function initMap(lat, lon) {
  map = L.map("map").setView([lat, lon], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  userMarker = L.marker([lat, lon]).addTo(map).bindPopup("Estás aquí").openPopup();
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
        if (userMarker) userMarker.setLatLng([lat, lon]);
        else userMarker = L.marker([lat, lon]).addTo(map);
      }
    },
    (err) => {
      console.error(err);
      document.getElementById("status").innerText = "Error al obtener ubicación";
      alert("No se pudo obtener tu ubicación. ¿Diste permiso?");
    }
  );
}

function buscar(tipo) {
  if (!map) {
    alert("Primero necesitas obtener tu ubicación");
    return;
  }

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
    .then((r) => r.json())
    .then((data) => {
      data.elements.forEach((e) => {
        const coords = e.type === "node" ? [e.lat, e.lon] : [e.center.lat, e.center.lon];
        const name = e.tags.name || tipo;

        L.marker(coords).addTo(map).bindPopup(name);
      });

      document.getElementById("status").innerText = `Se encontraron ${data.elements.length} resultados`;
    })
    .catch((err) => {
      console.error(err);
      alert("Error al buscar en el mapa");
      document.getElementById("status").innerText = "Error en la búsqueda";
    });
}

(err) => {
  console.error(err);
  let msg = "Error al obtener ubicación.";

  if (err.code === 1) msg += " El usuario denegó el permiso.";
  else if (err.code === 2) msg += " Ubicación no disponible.";
  else if (err.code === 3) msg += " Timeout al intentar obtener ubicación.";

  document.getElementById("status").innerText = msg;
  alert(msg);
}

