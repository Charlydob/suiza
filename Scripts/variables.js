//================= VARIABLES GLOBALES 👇 ================= //
// 🌍 Variables principales del mapa
let map;
let userMarker;
let searchCircle;
let currentCoords = null;
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
//================= VARIABLES GLOBALES 👆 ================= //✅