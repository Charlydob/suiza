// Scripts/limpiarMapa.js
import { map, markersPorTipo, tipoActivo } from "./variablesGlobales.js";//✅

// 🧼 Limpia todos los marcadores y resetea el estado
function clearAll() {
  Object.keys(markersPorTipo).forEach(tipo => {
    markersPorTipo[tipo].forEach(m => m.setMap(null));
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

export { clearAll };
