//======== INTERFAZ: BOTONES DE FILTRADO 👇 ======== //

import { tipoActivo, markersPorTipo, map } from "../mapa/globales.js";
import { buscar } from "../mapa/buscar.js";

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

export default toggleTipo;

//======== INTERFAZ: BOTONES DE FILTRADO 👆 ======== //
