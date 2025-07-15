//======== LIMPIEZA DEL MAPA 👇 ======== //
// 🧼 Limpia todos los marcadores y resetea el estado

import { map, markersPorTipo, tipoActivo } from "../mapa/variables.js";

export function clearAll() {
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

//======== LIMPIEZA DEL MAPA  👆 ======== //
