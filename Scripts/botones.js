//✅======== INTERFAZ: BOTONES DE FILTRADO 👇 ======== //
// 🎚️ Activa o desactiva un tipo de lugar (botones de filtros)
function toggleTipo(tipo) {
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
      marcadoresFavoritos = [];
    } else {
      markersPorTipo[tipo].forEach(m => m.setMap(null));
      markersPorTipo[tipo] = [];
    }

    document.getElementById("status").innerText = `Ocultando ${tipo}`;
  }
}
//✅======== INTERFAZ: BOTONES DE FILTRADO 👆 ======== //
