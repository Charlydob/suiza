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

// 🖼️ Iconos: URLs de iconos personalizados (se usarán en mapa.js)
const iconos = {
  camping: 'Recursos/img/campingmapa.png',
  fuel: 'Recursos/img/gasolineramapa.png',
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

// ⭐ Favoritos y 🛇 Ignorados
let favoritos = [];
let ignorados = JSON.parse(localStorage.getItem("ignorados")) || [];
let marcadoresFavoritos = [];

// 🔄 Cargar favoritos desde Firebase
db.ref(rutaFavoritos).on("value", snapshot => {
  const data = snapshot.val();
  favoritos = data || JSON.parse(localStorage.getItem("favoritos")) || [];
  if (data) localStorage.setItem("favoritos", JSON.stringify(data));
  renderizarFavoritos();
  mostrarMarcadoresFavoritos();
});

// 💾 Guardar listas en Firebase y localStorage
function guardarListas() {
  db.ref(rutaFavoritos).set(favoritos);
  localStorage.setItem("ignorados", JSON.stringify(ignorados));
}

//================= VARIABLES GLOBALES 👆 ===================//
//VERIFICACIÓN EN LOG
try {
  // Test de existencia de variables clave
  if (typeof map === "undefined") throw new Error("❌ Variable 'map' no está definida.");
  if (typeof userMarker === "undefined") throw new Error("❌ Variable 'userMarker' no está definida.");
  if (typeof iconos !== "object" || !iconos.camping) throw new Error("❌ Iconos no definidos correctamente.");
  if (typeof tipoActivo !== "object" || !("camping" in tipoActivo)) throw new Error("❌ tipoActivo mal definido.");
  if (!Array.isArray(favoritos)) throw new Error("❌ 'favoritos' no es un array.");
  if (typeof guardarListas !== "function") throw new Error("❌ Función 'guardarListas' no disponible.");

  // Test funcional: intentar guardar (simulado)
  console.log("✅ Ejecutando prueba de guardarListas...");
  guardarListas();
  console.log("✅ Variables globales cargadas correctamente y guardarListas() funciona.");
} catch (error) {
  // Mostrar error en consola y en pantalla
  if (typeof reportarError === "function") {
    reportarError(error);
  } else {
    console.error("❌ Error en variables.js:", error.message);
    alert("⚠️ Error al cargar variables.js:\n" + error.message);
  }
}
