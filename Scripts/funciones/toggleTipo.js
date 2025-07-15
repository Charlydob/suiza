import { setTipoActivo, getTipoActivo } from '../map/tipoActivo.js';
import { updateSearch } from './buscar.js';

export function setupTipoListeners(map, userMarker, circle) {
  document.querySelectorAll(".filter-card").forEach(card => {
    card.addEventListener("click", () => {
      const tipo = card.dataset.tipo;

      if (getTipoActivo() === tipo) {
        card.classList.remove("activo");
        setTipoActivo(null);
      } else {
        document.querySelectorAll(".filter-card").forEach(c => c.classList.remove("activo"));
        card.classList.add("activo");
        setTipoActivo(tipo);
      }

      updateSearch(map, userMarker, circle);
    });
  });
}
