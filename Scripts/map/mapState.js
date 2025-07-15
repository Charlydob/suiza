let mapInstance = null;
let userMarker = null;
let currentCoords = [40.4168, -3.7038]; // Por defecto: Madrid

export function setMapInstance(map) {
  mapInstance = map;
}

export function getMapInstance() {
  return mapInstance;
}

export function setUserMarker(marker) {
  userMarker = marker;
}

export function getUserMarker() {
  return userMarker;
}

export function setCurrentCoords(coords) {
  currentCoords = coords;
}

export function getCurrentCoords() {
  return currentCoords;
}
