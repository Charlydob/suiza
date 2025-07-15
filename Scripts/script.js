
//======== INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👇 ======== //
// 🚀 Inicializa el mapa con la ubicación dada
function initMap(lat, lon) {
  map = L.map("map").setView([lat, lon], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  currentCoords = [lat, lon];

  userMarker = L.marker(currentCoords, {
    icon: iconoUbicacion,
    draggable: true
  }).addTo(map)
    .bindPopup("📍 Aquí estás tú, piloto 🚌💨")
    .openPopup();

  crearCirculo();

  userMarker.on("dragend", () => {
    const pos = userMarker.getLatLng();
    currentCoords = [pos.lat, pos.lng];
    actualizarCirculo();
    actualizarBusquedaActiva();
  });

  document.getElementById("status").innerText = "Ubicación cargada";
}
//======== INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👆 ======== //✅

//======== GESTIÓN DEL CÍRCULO DE BÚSQUEDA 👇 ======== //
// 🔵 Crea el círculo de búsqueda alrededor del usuario
function crearCirculo() {
  const radius = parseInt(document.getElementById("radiusSlider").value);
  if (searchCircle) map.removeLayer(searchCircle);
  searchCircle = L.circle(currentCoords, {
    radius,
    color: "blue",
    fillColor: "#5fa",
    fillOpacity: 0.2
  }).addTo(map);
}
// 🔁 Actualiza el círculo cuando cambia la ubicación o el radio
function actualizarCirculo() {
  const radius = parseInt(document.getElementById("radiusSlider").value);
  searchCircle.setLatLng(currentCoords);
  searchCircle.setRadius(radius);
}
//======== GESTIÓN DEL CÍRCULO DE BÚSQUEDA  👆 ======== // ✅
//======== ACTUALIZACIÓN EN TIEMPO REAL Y OBTENCIÓN DE UBICACIÓN 👇 ======== //
// 📍 Usa la geolocalización del navegador para obtener la ubicación actual
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
        map.setView([lat, lon], 14);
        currentCoords = [lat, lon];
        actualizarCirculo();
        actualizarBusquedaActiva();
      }
    },
    (err) => {
      console.error(err);
      document.getElementById("status").innerText = "No se pudo obtener la ubicación";
    },
    { enableHighAccuracy: true, maximumAge: 1000 }
  );
}
// 🔁 Re-busca automáticamente lugares activos si cambia la ubicación
function actualizarBusquedaActiva() {
  Object.keys(tipoActivo).forEach(tipo => {
    if (tipoActivo[tipo]) buscar(tipo);
  });
}
//======== ACTUALIZACIÓN EN TIEMPO REAL Y OBTENCIÓN DE UBICACIÓN 👆 ======== //
//======== CONSULTA A OVERPASS API (OpenStreetMap) 👇 ======== //✅
// 🔎 Busca lugares de un tipo concreto cerca del usuario usando Overpass API
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
  }else if (tipo === "restaurant") {
    query = `
      [out:json];
      (
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        way["amenity"="restaurant"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  }else if (tipo === "cafe") {
  query = `
    [out:json];
    (
      node["amenity"="cafe"](around:${radius},${lat},${lon});
      way["amenity"="cafe"](around:${radius},${lat},${lon});
    );
    out center;
  `;
  }else if (tipo === "hospital") {
  query = `
    [out:json];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
    );
    out center;
  `;
  }else {
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
//======== CONSULTA A OVERPASS API (OpenStreetMap) 👆 ======== //✅

//======== BUSCAR UN LUGAR POR NOMBRE (input de texto) 👇 ======== //
// 🧭 Busca una ciudad o dirección por nombre (con Nominatim)
function buscarLugar() {
  const lugar = document.getElementById("locationSearch").value;
  if (!lugar) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        alert("Lugar no encontrado");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      currentCoords = [lat, lon];
      userMarker.setLatLng(currentCoords);
      map.setView(currentCoords, 14);
      actualizarCirculo();
      actualizarBusquedaActiva();
    })
    .catch(err => {
      console.error(err);
      alert("Error al buscar el lugar");
    });
}
//======== BUSCAR UN LUGAR POR NOMBRE (input de texto) 👆 ======== //✅

