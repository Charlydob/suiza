// ✅ tipoActivo.js (módulo ES6)

import { buscar } from "./busquedaLugares.js"; // ✅
import { tipoActivo, marcadoresFavoritos, markersPorTipo, map } from "./variablesGlobales.js"; // ✅
import { mostrarMarcadoresFavoritos } from "./favoritesManager.js"; // ✅

export function toggleTipo(tipo) {
  tipoActivo[tipo] = !tipoActivo[tipo];
  const boton = document.getElementById(`btn-${tipo}`);

  if (tipoActivo[tipo]) {
    boton.classList.add("activo");
    boton.classList.remove("inactivo");

    if (tipo === "favoritos") {
      mostrarMarcadoresFavoritos();
    } else {
      buscar(tipo);
    }
  } else {
    boton.classList.remove("activo");
    boton.classList.add("inactivo");

    if (tipo === "favoritos") {
      marcadoresFavoritos.forEach(m => m.setMap(null));
      marcadoresFavoritos.length = 0;
    } else {
      if (markersPorTipo[tipo]) {
        markersPorTipo[tipo].forEach(m => m.setMap(null));
        markersPorTipo[tipo] = [];
      }
    }

    document.getElementById("status").innerText = `Ocultando ${tipo}`;
  }
}

// 👉 Asignar listeners a todos los botones con ID btn-*
document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll("[id^='btn-']");
  botones.forEach(boton => {
    const tipo = boton.id.replace("btn-", "");
    boton.addEventListener("click", () => toggleTipo(tipo));
  });
});
