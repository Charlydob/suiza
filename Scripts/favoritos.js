function renderizarFavoritos() {
  const listaDiv = document.getElementById("listaFavoritos");
  const contenedor = document.getElementById("contenedorFavoritos");
  const filtroTexto = document.getElementById("buscadorFavoritos")?.value.toLowerCase() || "";
  const filtroTipo = document.getElementById("filtroTipoFavoritos")?.value || "";
  const orden = document.getElementById("ordenFavoritos")?.value || "distanciaAsc";

  contenedor.innerHTML = "";

  if (favoritos.length === 0) {
    listaDiv.style.display = "none";
    return;
  }

  listaDiv.style.display = "block";

  const userPos = ubicacionReal || currentCoords;
  const lat1 = Array.isArray(userPos) ? userPos[0] : userPos.lat;
  const lon1 = Array.isArray(userPos) ? userPos[1] : userPos.lng;

  let favoritosFiltrados = favoritos
    .map(f => {
      const distanciaKm = calcularDistancia(lat1, lon1, f.lat, f.lon);
      return { ...f, distanciaKm };
    })
    .filter(f => {
      const texto = `${f.datosPersonalizados?.nombre || ""} ${f.datosPersonalizados?.notas || ""}`.toLowerCase();
      const coincideTexto = texto.includes(filtroTexto);
      const coincideTipo = filtroTipo === "" || f.tipo === filtroTipo;
      return coincideTexto && coincideTipo;
    });

  if (orden === "distanciaAsc") {
    favoritosFiltrados.sort((a, b) => a.distanciaKm - b.distanciaKm);
  } else if (orden === "distanciaDesc") {
    favoritosFiltrados.sort((a, b) => b.distanciaKm - a.distanciaKm);
  }

  favoritosFiltrados.forEach(f => {
    const div = document.createElement("div");
    div.className = "favorito-item";
    div.style.marginBottom = "10px";
    div.style.borderBottom = "1px solid #ccc";
    div.style.paddingBottom = "5px";
    div.style.cursor = "pointer";

    const tiempoCocheMin = Math.round((f.distanciaKm / 60) * 60);
    const tiempoPieMin = Math.round((f.distanciaKm / 5) * 60);

    const tiempoCoche = tiempoCocheMin >= 60
      ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
      : `${tiempoCocheMin} min en coche`;

    const tiempoPie = tiempoPieMin >= 60
      ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
      : `${tiempoPieMin} min a pie`;

    const nombre = f.datosPersonalizados?.nombre || f.id;

    div.innerHTML = `
      <strong>${nombre}</strong><br>
      Distancia: ${f.distanciaKm.toFixed(1)} km<br>
      ${tiempoCoche} | ${tiempoPie}<br>
      <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}&travelmode=driving', '_blank')">🧭 Cómo llegar</button>
    `;

    div.onclick = () => {
      map.setCenter({ lat: f.lat, lng: f.lon });
      map.setZoom(16);
      mostrarEditorFavorito(f.id);
    };

    contenedor.appendChild(div);
  });
}

// 👇 Necesario para que sea accesible desde otros scripts o HTML:
window.renderizarFavoritos = renderizarFavoritos;
