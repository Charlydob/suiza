//================= VARIABLES GLOBALES 👇 ===================//

// 🌍 Variables principales del mapa
let map;
let userMarker;
let searchCircle;
let currentCoords = null;
let watchId = null;
let seguimientoActivo = false;
let centrarMapaActivo = false;
let marcadorUbicacion = null;
let ubicacionReal = null;
let marcadorUbicacionReal = null;

// 📍 Marcadores agrupados por tipo de lugar
const markersPorTipo = {
  sitios_bonitos: [],
  gasolinera: [],
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

// 🖼️ Iconos: URLs de iconos personalizados (se usarán en mapa.js)
const iconos = {
  sitios_bonitos: 'Recursos/img/campingmapa.png',
  gasolinera: 'Recursos/img/gasolineramapa.png',
  parking: 'Recursos/img/parkingmapa.png',
  hotel: 'Recursos/img/hotelmapa.png',
  airbnb: 'Recursos/img/airbnbmapa.png',
  luggage: 'Recursos/img/maletamapa.png',
  airport: 'Recursos/img/aeropuertomapa.png',
  tourism: 'Recursos/img/turismomapa.png',
  restaurant: 'Recursos/img/restaurantemapa.png',
  cafe: 'Recursos/img/cafeteriamapa.png',
  hospital: 'Recursos/img/hospitalmapa.png'
};

// 🧭 Icono de la ubicación del usuario
const iconoUbicacion = 'Recursos/img/yo.png';

// ✅ Estado de activación de cada tipo
const tipoActivo = {
  sitios_bonitos: false,
  gasolinera: false,
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

// ⭐ Favoritos y 🛇 Ignorados
let favoritos = [];
let ignorados = JSON.parse(localStorage.getItem("ignorados")) || [];
let marcadoresFavoritos = [];



// 💾 Guardar listas en Firebase y localStorage


//================= VARIABLES GLOBALES 👆 ===================//

