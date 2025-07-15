import { markersPorTipo } from '../map/markersPorTipo.js';
import { setTipoActivo } from '../map/tipoActivo.js';

export function clearAll(map) {
  Object.values(markersPorTipo).flat().forEach(marker => map.removeLayer(marker));
  Object.keys(markersPorTipo).forEach(k => markersPorTipo[k] = []);
  setTipoActivo(null);
  document.querySelectorAll(".filter-card").forEach(c => c.classList.remove("activo"));
}
