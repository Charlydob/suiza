// ✅ gestionIgnorados.js (módulo ES6)

import { ignorados, guardarListas } from "./variablesGlobales.js"; //✅
import { actualizarBusquedaActiva } from "./searchManager.js";//✅

// 🗑️ Añade un lugar a la lista de ignorados y actualiza la vista
export function ignorarLugar(id) {
  if (!ignorados.includes(id)) {
    ignorados.push(id);
    guardarListas();
    actualizarBusquedaActiva();
  }
}
