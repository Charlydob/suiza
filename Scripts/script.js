//✅================= VARIABLES GLOBALES 👇 ================= //
// 🌍 Variables principales del mapa
let map;
let userMarker;
let searchCircle;
let currentCoords = null;
let watchId = null;
let seguimientoActivo = false;
let centrarMapaActivo = false;
let marcadorUbicacion = null;
let ubicacionReal = null;         // Última ubicación real detectada
let marcadorUbicacionReal = null; // Marcador azul real

// 📍 Marcadores agrupados por tipo de lugar (para borrarlos fácilmente luego)
const markersPorTipo = {
  camp_site: [],
  fuel: [],
  parking: [],
  hotel: [],
  airbnb: [],
  luggage: [],
  airport: [],
  tourism: [],
  restaurant: [],
  cafe: [],
  hospital: [],

};
// 🖼️ Iconos personalizados por tipo de lugar (para mostrar en el mapa)
const iconos = {
  camp_site: L.icon({
    iconUrl: 'Recursos/img/campingmapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  fuel: L.icon({
    iconUrl: 'Recursos/img/gasolineramapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  parking: L.icon({
    iconUrl: 'Recursos/img/parkingmapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  hotel: L.icon({
    iconUrl: 'Recursos/img/hotelmapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  airbnb: L.icon({
    iconUrl: 'Recursos/img/airbnbmapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  luggage: L.icon({
    iconUrl: 'Recursos/img/maletamapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  // En iconos:
  airport: L.icon({
    iconUrl: 'Recursos/img/aeropuertomapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  tourism: L.icon({
    iconUrl: 'Recursos/img/turismomapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  restaurant: L.icon({
    iconUrl: 'Recursos/img/restaurantemapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  cafe: L.icon({
    iconUrl: 'Recursos/img/cafeteriamapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  hospital: L.icon({
    iconUrl: 'Recursos/img/hospitalmapa.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
  }),
  

};
// 🧭 Icono de la ubicación del usuario
const iconoUbicacion = L.icon({
  iconUrl: 'Recursos/img/yo.png', iconSize: [32, 32], iconAnchor: [14, 28], popupAnchor: [0, -30]
});
// ✅ Estado de activación de cada tipo de marcador
const tipoActivo = {
  camp_site: false,
  fuel: false,
  parking: false,
  hotel: false,
  airbnb: false,
  luggage: false,
  airport: false,
  tourism: false,
  restaurant: false,
  cafe: false,
  hospital: false
};
// ⭐ Favoritos y 🛇 Ignorados guardados en localStorage
// 🟡 Estructura: { id, tipo, lat, lon, datosPersonalizados: {nombre, precio, horario, notas} }
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
const ignorados = JSON.parse(localStorage.getItem("ignorados")) || [];
let marcadoresFavoritos = [];


function guardarListas() {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  localStorage.setItem("ignorados", JSON.stringify(ignorados));
}
//✅================= VARIABLES GLOBALES 👆 ================= //
//✅======== INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👇 ======== //
// 🚀 Inicializa el mapa con la ubicación dada
function initMap(lat, lon) {
  map = L.map("map").setView([lat, lon], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);
  botonUbicacion.addTo(map);

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
//✅======== INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👆 ======== //

//✅======== GESTIÓN DEL CÍRCULO DE BÚSQUEDA 👇 ======== //
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
//✅======== GESTIÓN DEL CÍRCULO DE BÚSQUEDA  👆 ======== // 
// ❌======== ACTUALIZACIÓN EN TIEMPO REAL Y OBTENCIÓN DE UBICACIÓN 👇 ======== //

// 🔁 Re-busca automáticamente lugares activos si cambia la ubicación
function actualizarBusquedaActiva() {
  Object.keys(tipoActivo).forEach(tipo => {
    if (tipoActivo[tipo]) buscar(tipo);
  });
}

// ✅ Obtiene la ubicación GPS real, actualiza currentCoords y muestra marcador azul (no arrastrable)
function actualizarUbicacionReal() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite geolocalización");
    return;
  }

  document.getElementById("status").innerText = "Obteniendo ubicación real...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      currentCoords = [lat, lon];

      // Crea o actualiza el marcador de la ubicación real
      if (!marcadorUbicacionReal) {
        marcadorUbicacionReal = L.marker([lat, lon], {
          icon: L.divIcon({
            className: "marcador-real",
            html: "🔵",
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map);
      } else {
        marcadorUbicacionReal.setLatLng([lat, lon]);
      }

      map.setView([lat, lon], 16);

      actualizarCirculo();
      actualizarBusquedaActiva();
      renderizarFavoritos();

      document.getElementById("status").innerText = "";
    },

    (err) => {
      console.error(err);
      document.getElementById("status").innerText = "No se pudo obtener la ubicación";
    },

    { enableHighAccuracy: true }
  );
}

// 🔘 Botón en la esquina superior derecha para obtener la ubicación GPS real
const botonUbicacion = L.control({ position: 'topright' });
botonUbicacion.onAdd = function () {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  div.innerHTML = '<a href="#" title="Obtener ubicación real">📍</a>';
  div.style.backgroundColor = 'white';
  div.style.padding = '5px';

  div.onclick = function (e) {
    e.preventDefault();
    actualizarUbicacionReal();
  };

  return div;
};

//❌======== ACTUALIZACIÓN EN TIEMPO REAL Y OBTENCIÓN DE UBICACIÓN 👆 ======== //
//❌======== CALCULAR DISTANCIAS 👇 ======== //
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
//❌======== CALCULAR DISTANCIAS 👆 ======== //
//✅======== CONSULTA A OVERPASS API (OpenStreetMap) 👇 ======== //
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
  const idUnico = `${tipo}_${coords[0].toFixed(5)}_${coords[1].toFixed(5)}`;

  if (ignorados.includes(idUnico)) return; // 👈 Saltar si está en ignorados

  const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}&travelmode=driving&dir_action=navigate&avoid=tolls`;
  const searchLink = `https://www.google.com/maps/search/${tipo}/@${coords[0]},${coords[1]},14z`;

  const yaEsFavorito = favoritos.includes(idUnico);
  const userPos = ubicacionReal || currentCoords;

  const distanciaKm = calcularDistancia(userPos.lat, userPos.lng, coords[0], coords[1]);

  const tiempoCocheMin = Math.round((distanciaKm / 60) * 60);
  const tiempoPieMin = Math.round((distanciaKm / 5) * 60);

  const tiempoCoche = tiempoCocheMin >= 60
    ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
    : `${tiempoCocheMin} min en coche`;

  const tiempoPie = tiempoPieMin >= 60
    ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
    : `${tiempoPieMin} min a pie`;

  const popupHTML = `
    <b>${name}</b><br>
    Distancia: ${distanciaKm.toFixed(1)} km<br>
    ${tiempoCoche} | ${tiempoPie}<br>
    <a href='${mapsLink}' target='_blank' style="text-decoration: none">🧭 Cómo llegar</a><br>
    <a href='${searchLink}' target='_blank' style="text-decoration: none">🔎 Buscar en Maps</a><br>
    <button onclick="toggleFavorito('${idUnico}', '${tipo}', [${coords}], '${name.replace(/'/g, "\\'")}', this)">
      ${yaEsFavorito ? "⭐" : "☆"} Favorito
    </button>
    <button onclick="ignorarLugar('${idUnico}')">🗑️ Ignorar</button>
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
//✅======== CONSULTA A OVERPASS API (OpenStreetMap) 👆 ======== //
//======== INTERFAZ: BOTONES DE FILTRADO 👇 ======== //
// 🎚️ Activa o desactiva un tipo de lugar (botones de filtros)
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
//✅======== INTERFAZ: BOTONES DE FILTRADO 👆 ======== // 
//✅======== LIMPIEZA DEL MAPA 👇 ======== //
// 🧼 Limpia todos los marcadores y resetea el estado
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
//✅======== LIMPIEZA DEL MAPA  👆 ======== // 
//✅======== BUSCAR UN LUGAR POR NOMBRE (input de texto) 👇 ======== //
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
//✅======== BUSCAR UN LUGAR POR NOMBRE (input de texto) 👆 ======== // 
//❌======== GESTIÓN DE FAVORITOS 👇 ======== //
// RENDERIZA FAVORITOS EN MAPA
      function renderizarFavoritos() {
        const contenedor = document.getElementById("contenedorFavoritos");
        const listaDiv = document.getElementById("listaFavoritos");

        contenedor.innerHTML = ""; // Limpia antes de renderizar

        if (favoritos.length === 0) {
          listaDiv.style.display = "none";
          return;
        }

        listaDiv.style.display = "block";

        favoritos.forEach(f => {
          const div = document.createElement("div");
          div.className = "favorito-item";
          div.style.marginBottom = "10px";
          div.style.borderBottom = "1px solid #ccc";
          div.style.paddingBottom = "5px";
          div.style.cursor = "pointer";

          // Distancia y duración con API de rutas (simple con Haversine como placeholder)
              const userPos = ubicacionReal || currentCoords;

              const distanciaKm = calcularDistancia(userPos.lat, userPos.lng, f.lat, f.lon);

              // Velocidades estimadas
              const velCoche = 60; // km/h
              const velPie = 5;    // km/h

              const tiempoCocheMin = Math.round((distanciaKm / velCoche) * 60);
              const tiempoPieMin = Math.round((distanciaKm / velPie) * 60);

              const tiempoCoche = tiempoCocheMin >= 60
                ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
                : `${tiempoCocheMin} min en coche`;

              const tiempoPie = tiempoPieMin >= 60
                ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
                : `${tiempoPieMin} min a pie`;
              const nombre = f.datosPersonalizados?.nombre || f.id;



          div.innerHTML = `
              <strong>${nombre}</strong><br>
              Distancia: ${distanciaKm.toFixed(1)} km<br>
              ${tiempoCoche} | ${tiempoPie}<br>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}&travelmode=driving" target="_blank" style="text-decoration: none">🧭 Cómo llegar</a>
            `;


          // Al hacer clic, abre el editor y centra el mapa
          div.onclick = () => {
            setTimeout(() => {
            map.setView([f.lat, f.lon], 16);
          }, 100);

      mostrarEditorFavorito(f.id);
          };

          contenedor.appendChild(div);
        });
      }

// ⭐ Alterna entre marcar o desmarcar un lugar como favorito
function toggleFavorito(id, tipo, coords, name, btn) {
  const index = favoritos.findIndex(f => f.id === id);

  if (index === -1) {
    // Si no está, lo añade como objeto completo
    favoritos.push({
      id,
      tipo,
      lat: coords[0],
      lon: coords[1],
      datosPersonalizados: {
        nombre: name,
        precio: '',
        horario: '',
        notas: ''
      }
    });
    btn.innerText = "⭐ Favorito";
  } else {
    // Si ya está, lo elimina
    favoritos.splice(index, 1);
    btn.innerText = "☆ Favorito";
  }
   // Guarda la lista actualizada en localStorage
  guardarListas();
  renderizarFavoritos();
  mostrarMarcadoresFavoritos();
}
let favoritoEditandoId = null;

function mostrarEditorFavorito(id) {
  const favorito = favoritos.find(f => f.id === id);
  if (!favorito) return;

  favoritoEditandoId = id;

  document.getElementById("editNombre").value = favorito.datosPersonalizados.nombre || "";
  document.getElementById("editPrecio").value = favorito.datosPersonalizados.precio || "";
  document.getElementById("editHorario").value = favorito.datosPersonalizados.horario || "";
  document.getElementById("editNotas").value = favorito.datosPersonalizados.notas || "";

  document.getElementById("sidebarContenido").style.display = "none";
  document.getElementById("editorFavorito").style.display = "block";
}

function guardarEdicionFavorito() {
  const favorito = favoritos.find(f => f.id === favoritoEditandoId);
  if (!favorito) return;

  favorito.datosPersonalizados.nombre = document.getElementById("editNombre").value;
  favorito.datosPersonalizados.precio = document.getElementById("editPrecio").value;
  favorito.datosPersonalizados.horario = document.getElementById("editHorario").value;
  favorito.datosPersonalizados.notas = document.getElementById("editNotas").value;

  guardarListas();
  renderizarFavoritos();
  mostrarMarcadoresFavoritos();
  cerrarEditorFavorito();
}
function borrarFavorito() {
  const index = favoritos.findIndex(f => f.id === favoritoEditandoId);
  if (index !== -1) {
    favoritos.splice(index, 1);
    guardarListas();
    renderizarFavoritos();
    mostrarMarcadoresFavoritos();
    cerrarEditorFavorito();
  }
}

function cerrarEditorFavorito() {
  favoritoEditandoId = null;
  document.getElementById("editorFavorito").style.display = "none";
  document.getElementById("sidebarContenido").style.display = "block";
}
function mostrarMarcadoresFavoritos() {
  // Borra marcadores anteriores
  marcadoresFavoritos.forEach(m => map.removeLayer(m));
  marcadoresFavoritos = [];

  favoritos.forEach(f => {
    const nombre = f.datosPersonalizados?.nombre || f.id;

    // Distancia desde la ubicación real
    const userPos = ubicacionReal || currentCoords;

    const distanciaKm = calcularDistancia(userPos.lat, userPos.lng, f.lat, f.lon);

    // Estimaciones de tiempo
    const velCoche = 60; // km/h
    const velPie = 5;    // km/h

    const tiempoCocheMin = Math.round((distanciaKm / velCoche) * 60);
    const tiempoPieMin = Math.round((distanciaKm / velPie) * 60);

    const tiempoCoche = tiempoCocheMin >= 60
      ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
      : `${tiempoCocheMin} min en coche`;

    const tiempoPie = tiempoPieMin >= 60
      ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
      : `${tiempoPieMin} min a pie`;

    // HTML del popup
    const popupHTML = `
      <b>${nombre}</b><br>
      Distancia: ${distanciaKm.toFixed(1)} km<br>
      ${tiempoCoche} | ${tiempoPie}<br>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}&travelmode=driving" target="_blank"style="text-decoration: none" >🧭 Cómo llegar</a><br>
      ${f.datosPersonalizados?.precio ? `<span>💰 ${f.datosPersonalizados.precio}</span><br>` : ""}
      ${f.datosPersonalizados?.horario ? `<span>🕒 ${f.datosPersonalizados.horario}</span><br>` : ""}
      ${f.datosPersonalizados?.notas ? `<small>📝 ${f.datosPersonalizados.notas}</small>` : ""}
    `;

    // Icono personalizado de estrella
    const iconoEstrella = L.divIcon({
      className: 'icono-favorito',
      html: '⭐',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    // Crear marcador y guardar referencia
    const marcador = L.marker([f.lat, f.lon], { icon: iconoEstrella })
      .addTo(map)
      .bindPopup(popupHTML);

    marcadoresFavoritos.push(marcador);
  });
}



//❌======== GESTION DE FAVORITOS 👆 ======== //
//❌======== GESTION DE IGNORADOS 👇 ======== //
// 🗑️ Añade un lugar a la lista de ignorados y actualiza la vista
function ignorarLugar(id) {
  if (!ignorados.includes(id)) {
    ignorados.push(id);
    guardarListas();
    actualizarBusquedaActiva();
  }
}
//❌======== GESTION DE IGNORADOS 👆 ======== //
function getLocation() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite geolocalización");
    initMap(40.4168, -3.7038); // 🧭 Coordenadas por defecto: Madrid
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      initMap(lat, lon);
    },
    (err) => {
      console.warn("No se pudo obtener la ubicación. Usando ubicación por defecto.");
      initMap(40.4168, -3.7038); // 🧭 Madrid como fallback
    },
    { enableHighAccuracy: true }
  );
}

//✅======== EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👇 ======== //
// 📲 Manejo de eventos una vez el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");

  // ⬇️ AÑADE ESTAS DOS LÍNEAS JUSTO AQUÍ
  const closeBtn = document.getElementById("closeSidebar");
  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    toggleBtn.style.display = "block";
  });

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    toggleBtn.style.display = sidebar.classList.contains("open") ? "none" : "block";
  });

  document.getElementById("radiusSlider").addEventListener("input", () => {
    document.getElementById("radiusValue").innerText = document.getElementById("radiusSlider").value;
    actualizarCirculo();
    actualizarBusquedaActiva();
  });

  sidebar.addEventListener("touchstart", function (e) {
    if (e.touches.length > 1) return;
    e.stopPropagation();
  }, { passive: false });

  sidebar.addEventListener("dblclick", function (e) {
    e.preventDefault();
    e.stopPropagation();
  });

  getLocation();
});
//✅======== EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👆 ======== // 