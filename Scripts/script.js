// Scripts/script.js

import { db, rutaFavoritos } from "./firebase.js";



// ✅ script.js
// Este archivo es el punto de entrada de tu app web.
// Se ejecuta automáticamente porque se carga con type="module" en el HTML.
// Aquí conectamos todas las piezas y asignamos los eventos del DOM.

// 📦 IMPORTACIONES DE MÓDULOS
import { initMap } from "./initMap.js";//✅
import { initSidebar } from "./sidebar.js"; //✅ // carga listeners y filtros de favoritos
import { getLocation } from "./centrarFavorito.js";//✅
import { toggleTipo } from "./tipoActivo.js";//✅
import { buscarLugar } from "./buscar.js";//✅
import { clearAll } from "./limpiarMapa.js";//✅
import {
  guardarEdicionFavorito,//✅
  borrarFavorito,//✅
  cerrarEditorFavorito,//✅
} from "./favoritesManager.js";

// ✅ Esta función se ejecuta cuando Google Maps termina de cargarse (callback en HTML)
window.initApp = function () {
  // Coordenadas iniciales: se usan si no hay geolocalización disponible
  initMap(40.4168, -3.7038); // Madrid como fallback

  // Carga el sidebar, listeners de filtros, sliders, favoritos, etc.
  initSidebar();
};

// ✅ Este bloque se ejecuta cuando el DOM ha terminado de cargarse (independiente de Maps)
document.addEventListener("DOMContentLoaded", () => {
  // 🔍 Botón para buscar texto en el input de lugar
  const btnBuscar = document.querySelector(".search-group button");
  btnBuscar?.addEventListener("click", buscarLugar);

  // 🧹 Botón para limpiar resultados
  const btnLimpiar = document.querySelector(".clear-button");
  btnLimpiar?.addEventListener("click", clearAll);

  // 💾 Botón para guardar la edición de un favorito
  document
    .getElementById("btnGuardarFavorito")
    ?.addEventListener("click", guardarEdicionFavorito);

  // 🗑️ Botón para eliminar un favorito
  document
    .getElementById("btnBorrarFavorito")
    ?.addEventListener("click", borrarFavorito);

  // ❌ Botón para cancelar la edición
  document
    .getElementById("btnCancelarEdicion")
    ?.addEventListener("click", cerrarEditorFavorito);
});





/*//✅================= VARIABLES GLOBALES 👇 ================= //
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
  camping: [],
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
  favoritos: []
};
// 🖼️ Iconos personalizados por tipo de lugar (para mostrar en el mapa)
const iconos = {
  camping: L.icon({
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
  camping: false,
  fuel: false,
  parking: false,
  hotel: false,
  airbnb: false,
  luggage: false,
  airport: false,
  tourism: false,
  restaurant: false,
  cafe: false,
  hospital: false,
  favoritos: false
};
// ⭐ Favoritos y 🛇 Ignorados guardados en localStorage
// 🟡 Estructura: { id, tipo, lat, lon, datosPersonalizados: {nombre, precio, horario, notas} }
let favoritos = [];

// 🔄 Carga en tiempo real desde Firebase
db.ref(rutaFavoritos).on("value", snapshot => {
const data = snapshot.val();
favoritos = data || JSON.parse(localStorage.getItem("favoritos")) || [];
if (data) localStorage.setItem("favoritos", JSON.stringify(data));
  renderizarFavoritos();
  mostrarMarcadoresFavoritos();
});
const ignorados = JSON.parse(localStorage.getItem("ignorados")) || [];
let marcadoresFavoritos = [];


function guardarListas() {
  // Guardar favoritos en Firebase
  db.ref(rutaFavoritos).set(favoritos);

  // Guardar ignorados en localStorage
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
*/
/*
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
*/
/*
// ======== ACTUALIZACIÓN EN TIEMPO REAL Y OBTENCIÓN DE UBICACIÓN 👇 ======== //

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

        // 🔧 Normaliza y guarda
        ubicacionReal = { lat, lng: lon };

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
*/
/*//❌======== CALCULAR DISTANCIAS 👇 ======== //
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
*/
/*
//✅======== CONSULTA A OVERPASS API (OpenStreetMap) 👇 ======== //
// 🔎 Busca lugares de un tipo concreto cerca del usuario usando Overpass API
async function buscar(tipo) {
  if (!currentCoords) return;

  const centro = window.getCentroBusqueda?.();
  const lat = centro?.lat || currentCoords[0];
  const lon = centro?.lon || currentCoords[1];
  const radius = parseInt(document.getElementById("radiusSlider").value);

  let query = "";

  if (tipo === "camping") {
    query = `
      [out:json];
      (
        node["tourism"="camp_site"](around:${radius},${lat},${lon});
        way["tourism"="camp_site"](around:${radius},${lat},${lon});
        node["tourism"="caravan_site"](around:${radius},${lat},${lon});
        way["tourism"="caravan_site"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "hotel") {
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
        node["information"="luggage_storage"](around:${radius},${lat},${lon});
        way["information"="luggage_storage"](around:${radius},${lat},${lon});
        node["luggage"="yes"](around:${radius},${lat},${lon});
        way["luggage"="yes"](around:${radius},${lat},${lon});
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
        way["aeroway"="aerodrome"](around:${radius},${lat},${lon});
        relation["aeroway"="aerodrome"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "tourism") {
    query = `
      [out:json];
      (
        node["tourism"~"attraction|viewpoint|museum|artwork|theme_park|zoo|aquarium|gallery"](around:${radius},${lat},${lon});
        way["tourism"~"attraction|viewpoint|museum|artwork|theme_park|zoo|aquarium|gallery"](around:${radius},${lat},${lon});
        relation["tourism"~"attraction|viewpoint|museum|artwork|theme_park|zoo|aquarium|gallery"](around:${radius},${lat},${lon});
        node["historic"](around:${radius},${lat},${lon});
        way["historic"](around:${radius},${lat},${lon});
        relation["historic"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "restaurant") {
    query = `
      [out:json];
      (
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        way["amenity"="restaurant"](around:${radius},${lat},${lon});
        relation["amenity"="restaurant"](around:${radius},${lat},${lon});
      );
      out center;
    `;
  } else if (tipo === "cafe") {
    query = `
      [out:json];
      (
        node["amenity"="cafe"](around:${radius},${lat},${lon})["name"!="Starbucks"]["amenity"!="bar"]["brand"!="Starbucks"];
        way["amenity"="cafe"](around:${radius},${lat},${lon})["name"!="Starbucks"]["amenity"!="bar"]["brand"!="Starbucks"];
        relation["amenity"="cafe"](around:${radius},${lat},${lon})["name"!="Starbucks"]["amenity"!="bar"]["brand"!="Starbucks"];
      );
      out center;
    `;
  } else if (tipo === "hospital") {
    query = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        relation["amenity"="hospital"](around:${radius},${lat},${lon});
        node["healthcare"="hospital"](around:${radius},${lat},${lon});
        way["healthcare"="hospital"](around:${radius},${lat},${lon});
        relation["healthcare"="hospital"](around:${radius},${lat},${lon});
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

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });
    const data = await response.json();

    markersPorTipo[tipo].forEach(m => map.removeLayer(m));
    markersPorTipo[tipo] = [];

    if (data.elements.length === 0 && tipo === "luggage") {
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
        return;
      } catch (error) {
        console.error("Error obteniendo ciudad:", error);
        const fallbackLink = `https://www.google.com/maps/search/consigna+equipaje/@${lat},${lon},14z`;
        document.getElementById("status").innerHTML = `No se encontraron consignas. <a href="${fallbackLink}" target="_blank">Buscar en Google Maps</a>`;
        return;
      }
    }

    data.elements.forEach(e => {
      const coords = e.type === "node" ? [e.lat, e.lon] : [e.center.lat, e.center.lon];
      const name = e.tags.name || tipo;
      const idUnico = `${tipo}_${coords[0].toFixed(5)}_${coords[1].toFixed(5)}`;

      if (ignorados.includes(idUnico)) return;

      const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}&travelmode=driving&dir_action=navigate&avoid=tolls`;
      const searchLink = `https://www.google.com/maps/search/${tipo}/@${coords[0]},${coords[1]},14z`;
      const exactSearchLink = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;

      const yaEsFavorito = favoritos.includes(idUnico);
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

      const marker = L.marker(coords, { icon: iconos[tipo] }).addTo(map).bindPopup(popupHTML);
      markersPorTipo[tipo].push(marker);
    });

    document.getElementById("status").innerText = `Mostrando ${data.elements.length} resultados para ${tipo}`;
  } catch (err) {
    console.error(err);
    alert("Error buscando " + tipo);
    document.getElementById("status").innerText = "Error de búsqueda";
  }
}

//✅======== CONSULTA A OVERPASS API (OpenStreetMap) 👆 ======== //
*/
/*
//======== INTERFAZ: BOTONES DE FILTRADO 👇 ======== //
// 🎚️ Activa o desactiva un tipo de lugar (botones de filtros)
function toggleTipo(tipo) {
  tipoActivo[tipo] = !tipoActivo[tipo];
  const boton = document.getElementById(`btn-${tipo}`);

  if (tipoActivo[tipo]) {
    boton.classList.add("activo");
    boton.classList.remove("inactivo");

    if (tipo === "favoritos") {
      mostrarMarcadoresFavoritos();
    } else {
      buscar(tipo);
    }
  } else {
    boton.classList.remove("activo");
    boton.classList.add("inactivo");

    if (tipo === "favoritos") {
      marcadoresFavoritos.forEach(m => map.removeLayer(m));
      marcadoresFavoritos = [];
    } else {
      markersPorTipo[tipo].forEach(m => map.removeLayer(m));
      markersPorTipo[tipo] = [];
    }

    document.getElementById("status").innerText = `Ocultando ${tipo}`;
  }
}

//✅======== INTERFAZ: BOTONES DE FILTRADO 👆 ======== // 
*/
//✅======== LIMPIEZA DEL MAPA 👇 ======== //
/*
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
*/
/*//✅======== BUSCAR UN LUGAR POR NOMBRE (input de texto) 👇 ======== //
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
*/
/*
//❌======== GESTIÓN DE FAVORITOS 👇 ======== //
// RENDERIZA FAVORITOS EN MAPA
function renderizarFavoritos() {
  const listaDiv = document.getElementById("listaFavoritos");
  const contenedor = document.getElementById("contenedorFavoritos");
  const filtroTexto = document.getElementById("buscadorFavoritos")?.value.toLowerCase() || "";
  const filtroTipo = document.getElementById("filtroTipoFavoritos")?.value || "";
  const orden = document.getElementById("ordenFavoritos")?.value || "distanciaAsc";

  contenedor.innerHTML = "";

  if (favoritos.length === 0) {
    listaDiv.style.display = "none";
    return;
  }

  listaDiv.style.display = "block";

  const userPos = ubicacionReal || currentCoords;
  const lat1 = Array.isArray(userPos) ? userPos[0] : userPos.lat;
  const lon1 = Array.isArray(userPos) ? userPos[1] : userPos.lng;

  // 🧠 Procesar favoritos con filtro, distancia y orden
  let favoritosFiltrados = favoritos
    .map(f => {
      const distanciaKm = calcularDistancia(lat1, lon1, f.lat, f.lon);
      return { ...f, distanciaKm };
    })
    .filter(f => {
      const texto = `${f.datosPersonalizados?.nombre || ""} ${f.datosPersonalizados?.notas || ""}`.toLowerCase();
      const coincideTexto = texto.includes(filtroTexto);
      const coincideTipo = filtroTipo === "" || f.tipo === filtroTipo;
      return coincideTexto && coincideTipo;
    });

  if (orden === "distanciaAsc") {
    favoritosFiltrados.sort((a, b) => a.distanciaKm - b.distanciaKm);
  } else if (orden === "distanciaDesc") {
    favoritosFiltrados.sort((a, b) => b.distanciaKm - a.distanciaKm);
  }

  favoritosFiltrados.forEach(f => {
    const div = document.createElement("div");
    div.className = "favorito-item";
    div.style.marginBottom = "10px";
    div.style.borderBottom = "1px solid #ccc";
    div.style.paddingBottom = "5px";
    div.style.cursor = "pointer";

    const tiempoCocheMin = Math.round((f.distanciaKm / 60) * 60);
    const tiempoPieMin = Math.round((f.distanciaKm / 5) * 60);

    const tiempoCoche = tiempoCocheMin >= 60
      ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
      : `${tiempoCocheMin} min en coche`;

    const tiempoPie = tiempoPieMin >= 60
      ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
      : `${tiempoPieMin} min a pie`;

    const nombre = f.datosPersonalizados?.nombre || f.id;

    div.innerHTML = `
      <strong>${nombre}</strong><br>
      Distancia: ${f.distanciaKm.toFixed(1)} km<br>
      ${tiempoCoche} | ${tiempoPie}<br>
      <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}&travelmode=driving', '_blank')">🧭 Cómo llegar</button>
    `;

    div.onclick = () => {
      setTimeout(() => map.setView([f.lat, f.lon], 16), 100);
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

  // 🔄 Guardar cambios también en Firebase si hay conexión
  if (navigator.onLine && typeof db !== "undefined") {
    const ref = db.ref(`${rutaFavoritos}/${favorito.id}`);
    ref.set(favorito)
      .then(() => console.log("✅ Favorito actualizado en Firebase"))
      .catch(err => console.error("Error actualizando en Firebase:", err));
  }
}

function borrarFavorito() {
  const index = favoritos.findIndex(f => f.id === favoritoEditandoId);
  if (index !== -1) {
    const id = favoritos[index].id;

    // 1. Eliminar de local
    favoritos.splice(index, 1);
    guardarListas();
    renderizarFavoritos();
    mostrarMarcadoresFavoritos();
    cerrarEditorFavorito();

    // 2. Eliminar de Firebase si hay conexión
    if (navigator.onLine && typeof db !== "undefined") {
      const ref = db.ref(`${rutaFavoritos}/${id}`);
      ref.remove()
        .then(() => console.log("🗑️ Favorito eliminado de Firebase"))
        .catch(err => console.error("Error eliminando de Firebase:", err));
    }
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
  const tipo = f.tipo;
  const coords = [f.lat, f.lon];
  const idUnico = f.id;

  const userPos = ubicacionReal || currentCoords;
  const lat1 = Array.isArray(userPos) ? userPos[0] : userPos.lat;
  const lon1 = Array.isArray(userPos) ? userPos[1] : userPos.lng;
  const distanciaKm = calcularDistancia(lat1, lon1, f.lat, f.lon);

  const tiempoCocheMin = Math.round((distanciaKm / 60) * 60);
  const tiempoPieMin = Math.round((distanciaKm / 5) * 60);

  const tiempoCoche = tiempoCocheMin >= 60
    ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
    : `${tiempoCocheMin} min en coche`;

  const tiempoPie = tiempoPieMin >= 60
    ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
    : `${tiempoPieMin} min a pie`;

const exactSearchLink = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;

  const popupHTML = `
  <div class="popup-personalizado">
    <b>${nombre}</b><br>
    Distancia: ${distanciaKm.toFixed(1)} km<br>
    ${tiempoCoche} | ${tiempoPie}<br>

    <div class="grupo-botones-arriba">
      <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}&travelmode=driving', '_blank')">🧭 Cómo llegar</button>
      <button onclick="window.open('${exactSearchLink}', '_blank')">🔍 Ver este sitio</button>
    </div>

    <div class="boton-medio">
      ${f.datosPersonalizados?.precio ? `💰 ${f.datosPersonalizados.precio}<br>` : ""}
      ${f.datosPersonalizados?.horario ? `🕒 ${f.datosPersonalizados.horario}<br>` : ""}
      ${f.datosPersonalizados?.notas ? `📝 <small>${f.datosPersonalizados.notas}</small><br>` : ""}
    </div>

    <div class="grupo-botones-abajo">
      <button onclick="editarFavoritoDesdeMapa('${idUnico}')">✏️ Editar favorito</button>
      <button onclick="establecerCentroDesdeFavorito(${f.lat}, ${f.lon})">📌 Establecer como centro</button>
      <button onclick="toggleFavorito('${idUnico}', '${tipo}', [${coords}], '${nombre.replace(/'/g, "\\'")}', this)">🗑️ Eliminar</button>
    </div>

  </div>
`;


  const iconoEstrella = L.divIcon({
    className: 'icono-favorito',
    html: '⭐',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });

  const marcador = L.marker([f.lat, f.lon], { icon: iconoEstrella })
    .addTo(map)
    .bindPopup(popupHTML);

  marcadoresFavoritos.push(marcador);
});

}

function editarFavoritoDesdeMapa(id) {
  const favorito = favoritos.find(f => f.id === id);
  if (!favorito) return;

  // Abre el sidebar si está cerrado
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("open");
  document.getElementById("toggleMenu").style.display = "none";

  // Abre el editor del favorito
  mostrarEditorFavorito(id); // asegúrate de tener esta función
}


//❌======== GESTION DE FAVORITOS 👆 ======== //
*/
/*
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
*/
/*
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
function establecerCentroDesdeFavorito(lat, lon) {
  const nuevaPosicion = [lat, lon];

  // Mueve el marcador del usuario
  if (userMarker) {
    userMarker.setLatLng(nuevaPosicion);
    currentCoords = nuevaPosicion;
    map.setView(nuevaPosicion, 16); // Opcional: centra el mapa
    actualizarCirculo();
    actualizarBusquedaActiva();
  }
}
*/
/*
//✅======== EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👇 ======== //
// 📲 Manejo de eventos una vez el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");

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

  // 🔄 Listeners para filtros de favoritos
document.getElementById("buscadorFavoritos").addEventListener("input", (e) => {
  localStorage.setItem("filtroTextoFavoritos", e.target.value);
  renderizarFavoritos();
});

document.getElementById("filtroTipoFavoritos").addEventListener("change", (e) => {
  localStorage.setItem("filtroTipoFavoritos", e.target.value);
  renderizarFavoritos();
});

document.getElementById("ordenFavoritos").addEventListener("change", (e) => {
  localStorage.setItem("ordenFavoritos", e.target.value);
  renderizarFavoritos();
});


  getLocation();
  // 🧠 Recuperar filtros guardados
document.getElementById("buscadorFavoritos").value = localStorage.getItem("filtroTextoFavoritos") || "";
document.getElementById("filtroTipoFavoritos").value = localStorage.getItem("filtroTipoFavoritos") || "";
document.getElementById("ordenFavoritos").value = localStorage.getItem("ordenFavoritos") || "distanciaAsc";

  renderizarFavoritos();
});

//✅======== EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👆 ======== // */