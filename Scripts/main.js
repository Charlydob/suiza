import { initMap } from './map/initMap.js';
import { addUserMarker } from './map/userMarker.js';
import { addSearchCircle, updateSearchCircle } from './map/searchCircle.js';
import { setupSidebarToggle } from './ui/sidebar.js';
import { setupRadiusSlider } from './ui/sidebar.js';
import { setupTipoListeners } from './funciones/toggleTipo.js';
import { getLocation } from './funciones/buscarLugar.js';
import { updateSearch } from './funciones/buscar.js';
import { clearAll } from './funciones/clearAll.js';

let map, userMarker, circle;

document.addEventListener("DOMContentLoaded", () => {
  map = initMap();
  userMarker = addUserMarker(map);
  circle = addSearchCircle(map);

  setupSidebarToggle();
  setupRadiusSlider(circle);
  setupTipoListeners(map, userMarker, circle);
  getLocation(map, userMarker, circle);
  updateSearch(map, userMarker, circle);

  document.getElementById("clearBtn").addEventListener("click", () => {
    clearAll(map);
  });
});
