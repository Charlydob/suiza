// Scripts/variablesGlobales.js
import { db, rutaFavoritos } from "./firebase.js"; //✅
import { renderizarFavoritos, mostrarMarcadoresFavoritos } from "./favoritesManager.js"; //❌

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

// 📍 Marcadores agrupados por tipo de lugar
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

// 🖼️ Iconos personalizados Google Maps
const iconos = {
  camping: { url: 'Recursos/img/campingmapa.png', scaledSize: new google.maps.Size(32, 32) },
  fuel: { url: 'Recursos/img/gasolineramapa.png', scaledSize: new google.maps.Size(32, 32) },
  parking: { url: 'Recursos/img/parkingmapa.png', scaledSize: new google.maps.Size(32, 32) },
  hotel: { url: 'Recursos/img/hotelmapa.png', scaledSize: new google.maps.Size(32, 32) },
  airbnb: { url: 'Recursos/img/airbnbmapa.png', scaledSize: new google.maps.Size(32, 32) },
  luggage: { url: 'Recursos/img/maletamapa.png', scaledSize: new google.maps.Size(32, 32) },
  airport: { url: 'Recursos/img/aeropuertomapa.png', scaledSize: new google.maps.Size(32, 32) },
  tourism: { url: 'Recursos/img/turismomapa.png', scaledSize: new google.maps.Size(32, 32) },
  restaurant: { url: 'Recursos/img/restaurantemapa.png', scaledSize: new google.maps.Size(32, 32) },
  cafe: { url: 'Recursos/img/cafeteriamapa.png', scaledSize: new google.maps.Size(32, 32) },
  hospital: { url: 'Recursos/img/hospitalmapa.png', scaledSize: new google.maps.Size(32, 32) }
};

// 🧭 Icono de la ubicación del usuario
const iconoUbicacion = {
  url: 'Recursos/img/yo.png',
  scaledSize: new google.maps.Size(32, 32)
};

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
let favoritos = [];
const ignorados = JSON.parse(localStorage.getItem("ignorados")) || [];
let marcadoresFavoritos = [];

// 🔄 Escucha en Firebase
ref(db, rutaFavoritos).on("value", snapshot => {
  const data = snapshot.val();
  favoritos = data || JSON.parse(localStorage.getItem("favoritos")) || [];
  if (data) localStorage.setItem("favoritos", JSON.stringify(data));
  renderizarFavoritos();
  mostrarMarcadoresFavoritos();
});

// 💾 Guardar listas
function guardarListas() {
  ref(db, rutaFavoritos).set(favoritos);
  localStorage.setItem("ignorados", JSON.stringify(ignorados));
}
function setUbicacionReal(coord) {
  ubicacionReal = coord;
}

function getUbicacionReal() {
  return ubicacionReal;
}
// Exportar todo
export {
  map, userMarker, searchCircle, currentCoords,
  watchId, seguimientoActivo, centrarMapaActivo,
  marcadorUbicacion, ubicacionReal, marcadorUbicacionReal,
  markersPorTipo, iconos, iconoUbicacion, tipoActivo,
  favoritos, ignorados, setUbicacionReal,
  getUbicacionReal, marcadoresFavoritos,
  guardarListas
};
