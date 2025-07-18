function cargarFavoritosDesdeFirebase() {
  if (navigator.onLine && typeof db !== "undefined") {
    db.ref(rutaFavoritos).once('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        favoritos = Object.values(data);
        guardarListas(); // opcional: sincroniza con local
        renderizarFavoritos();
        mostrarMarcadoresFavoritos();
      } else {
        console.log("📂 No hay favoritos en Firebase, usando localStorage...");
        cargarListas(); // por si tienes algún favorito local
        renderizarFavoritos();
        mostrarMarcadoresFavoritos();
      }
    }, err => {
      console.error("Error cargando favoritos desde Firebase:", err);
      cargarListas(); // fallback
      renderizarFavoritos();
      mostrarMarcadoresFavoritos();
    });
  } else {
    console.warn("📡 Sin conexión: cargando favoritos desde localStorage");
    cargarListas();
    renderizarFavoritos();
    mostrarMarcadoresFavoritos();
  }
}
function cargarIgnoradosDesdeFirebase() {
  if (navigator.onLine && typeof db !== "undefined") {
    db.ref(rutaIgnorados).once('value', snapshot => {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        ignorados.splice(0); // borra todo sin perder referencia
        ignorados.push(...data);
        localStorage.setItem("lugaresIgnorados", JSON.stringify(ignorados));
        console.log("✅ Ignorados cargados desde Firebase");
      } else {
        console.log("📂 No hay ignorados en Firebase");
      }
    }, err => {
      console.error("Error cargando ignorados desde Firebase:", err);
    });
  } else {
    console.warn("📡 Sin conexión: usando ignorados desde localStorage");
    const local = JSON.parse(localStorage.getItem("lugaresIgnorados") || "[]");
    ignorados.splice(0);
    ignorados.push(...local);
  }
}



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

function toggleFavorito(id, tipo, coords, name, btn) {
  const index = favoritos.findIndex(f => f.id === id);

  if (index === -1) {
    // Añadir nuevo favorito
    const nuevoFavorito = {
      id,
      tipo,
      lat: coords[0],
      lon: coords[1],
      datosPersonalizados: {
        nombre: name,
        precio: '',
        horario: '',
        notas: ''
      }
    };

    btn.innerText = "⭐ Favorito";

    if (navigator.onLine && typeof db !== "undefined") {
      db.ref(`${rutaFavoritos}/${id}`).set(nuevoFavorito)
        .then(() => {
          favoritos.push(nuevoFavorito);
          guardarListas();
          renderizarFavoritos();
          mostrarMarcadoresFavoritos();
          console.log("✅ Favorito guardado en Firebase");
        })
        .catch(err => {
          console.error("Error guardando en Firebase:", err);
          btn.innerText = "☆ Favorito"; // revertir botón si falla
        });
    } else {
      favoritos.push(nuevoFavorito);
      guardarListas();
      renderizarFavoritos();
      mostrarMarcadoresFavoritos();
    }

  } else {
    const favoritoEliminado = favoritos[index];
    btn.innerText = "☆ Favorito";

    if (navigator.onLine && typeof db !== "undefined") {
      db.ref(`${rutaFavoritos}/${favoritoEliminado.id}`).remove()
        .then(() => {
          favoritos.splice(index, 1);
          guardarListas();
          renderizarFavoritos();
          mostrarMarcadoresFavoritos();
          console.log("🗑️ Favorito eliminado de Firebase");
        })
        .catch(err => {
          console.error("Error eliminando de Firebase:", err);
          btn.innerText = "⭐ Favorito"; // revertir si falla
        });
    } else {
      favoritos.splice(index, 1);
      guardarListas();
      renderizarFavoritos();
      mostrarMarcadoresFavoritos();
    }
  }
}





let favoritoEditandoId = null;
function mostrarMarcadoresFavoritos() {
  // 🧹 Borra marcadores anteriores
  marcadoresFavoritos.forEach(m => m.setMap(null));
  marcadoresFavoritos = [];

  favoritos.forEach(f => {
    const nombre = f.datosPersonalizados?.nombre || f.id;
    const tipo = f.tipo;
    const coords = { lat: f.lat, lng: f.lon };
    const idUnico = f.id;

    const userPos = ubicacionReal || currentCoords;
    const lat1 = Array.isArray(userPos) ? userPos[0] : userPos.lat;
    const lon1 = Array.isArray(userPos) ? userPos[1] : userPos.lng;
    const distanciaKm = calcularDistancia(lat1, lon1, f.lat, f.lon);

    const tiempoCocheMin = Math.round((distanciaKm / 60) * 60);
    const tiempoPieMin = Math.round((distanciaKm / 5) * 60);

    const tiempoCoche = tiempoCocheMin >= 60
      ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
      : `${tiempoCocheMin} min en coche`;

    const tiempoPie = tiempoPieMin >= 60
      ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
      : `${tiempoPieMin} min a pie`;

    const exactSearchLink = `https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lon}`;

    const popupHTML = `
      <div class="popup-personalizado">
        <b>${nombre}</b><br>
        Distancia: ${distanciaKm.toFixed(1)} km<br>
        ${tiempoCoche} | ${tiempoPie}<br>

        <div class="grupo-botones-arriba">
          <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}&travelmode=driving', '_blank')">🧭 Cómo llegar</button>
          <button onclick="window.open('${exactSearchLink}', '_blank')">🔍 Ver este sitio</button>
        </div>

        <div class="boton-medio">
          ${f.datosPersonalizados?.precio ? `💰 ${f.datosPersonalizados.precio}<br>` : ""}
          ${f.datosPersonalizados?.horario ? `🕒 ${f.datosPersonalizados.horario}<br>` : ""}
          ${f.datosPersonalizados?.notas ? `📝 <small>${f.datosPersonalizados.notas}</small><br>` : ""}
        </div>

        <div class="grupo-botones-abajo">
          <button onclick="editarFavoritoDesdeMapa('${idUnico}')">✏️ Editar favorito</button>
          <button onclick="toggleFavorito('${idUnico}', '${tipo}', [${f.lat}, ${f.lon}], '${nombre.replace(/'/g, "\\'")}', this)">🗑️ Eliminar</button>
        </div>
      </div>
    `;

    const marcador = new google.maps.Marker({
      position: coords,
      map,
      title: nombre,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
            <text x="0" y="20" font-size="25">⭐</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(15, 30)
      }
    });

    const infoWindow = new google.maps.InfoWindow({ content: popupHTML });
marcador.addListener("click", () => {
  if (popupActual && popupActual.__vinculado === marcador) {
    popupActual.close();
    popupActual = null;
    return;
  }
  if (popupActual) popupActual.close();

  infoWindow.open(map, marcador);
  infoWindow.__vinculado = marcador;
  popupActual = infoWindow;
});

    marcadoresFavoritos.push(marcador);
  });
}

function mostrarEditorFavorito(id) {
  const favorito = favoritos.find(f => f.id === id);
  if (!favorito) return;

  favoritoEditandoId = id;

  document.getElementById("editNombre").value = favorito.datosPersonalizados.nombre || "";
  document.getElementById("editPrecio").value = favorito.datosPersonalizados.precio || "";
  document.getElementById("editHorario").value = favorito.datosPersonalizados.horario || "";
  document.getElementById("editNotas").value = favorito.datosPersonalizados.notas || "";

  document.getElementById("sidebarContenido").style.display = "none";
  document.getElementById("editorFavorito").style.display = "block";
}

function guardarEdicionFavorito() {
  const favorito = favoritos.find(f => f.id === favoritoEditandoId);
  if (!favorito) return;

  favorito.datosPersonalizados.nombre = document.getElementById("editNombre").value;
  favorito.datosPersonalizados.precio = document.getElementById("editPrecio").value;
  favorito.datosPersonalizados.horario = document.getElementById("editHorario").value;
  favorito.datosPersonalizados.notas = document.getElementById("editNotas").value;

  guardarListas();
  renderizarFavoritos();
  mostrarMarcadoresFavoritos();
  cerrarEditorFavorito();

  // 🔄 Guardar cambios también en Firebase si hay conexión
  if (navigator.onLine && typeof db !== "undefined") {
    const ref = db.ref(`${rutaFavoritos}/${favorito.id}`);
    ref.set(favorito)
      .then(() => console.log("✅ Favorito actualizado en Firebase"))
      .catch(err => console.error("Error actualizando en Firebase:", err));
  }
}

function borrarFavorito() {
  const index = favoritos.findIndex(f => f.id === favoritoEditandoId);
  if (index !== -1) {
    const id = favoritos[index].id;

    // 1. Eliminar de local
    favoritos.splice(index, 1);
    guardarListas();
    renderizarFavoritos();
    mostrarMarcadoresFavoritos();
    cerrarEditorFavorito();

    // 2. Eliminar de Firebase si hay conexión
    if (navigator.onLine && typeof db !== "undefined") {
      const ref = db.ref(`${rutaFavoritos}/${id}`);
      ref.remove()
        .then(() => console.log("🗑️ Favorito eliminado de Firebase"))
        .catch(err => console.error("Error eliminando de Firebase:", err));
    }
  }

}

function cerrarEditorFavorito() {
  favoritoEditandoId = null;
  document.getElementById("editorFavorito").style.display = "none";
  document.getElementById("sidebarContenido").style.display = "block";
}

function editarFavoritoDesdeMapa(id) {
  const favorito = favoritos.find(f => f.id === id);
  if (!favorito) return;

  // Abre el sidebar si está cerrado
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("open");
  document.getElementById("toggleMenu").style.display = "none";

  // Abre el editor del favorito
  mostrarEditorFavorito(id); // asegúrate de tener esta función
}
// Exponer al global:
window.mostrarMarcadoresFavoritos = mostrarMarcadoresFavoritos;
window.mostrarEditorFavorito = mostrarEditorFavorito;
window.guardarEdicionFavorito = guardarEdicionFavorito;
window.borrarFavorito = borrarFavorito;
window.cerrarEditorFavorito = cerrarEditorFavorito;
window.toggleFavorito = toggleFavorito;
window.renderizarFavoritos = renderizarFavoritos;
window.editarFavoritoDesdeMapa = editarFavoritoDesdeMapa;

window.onload = function () {cargarFavoritosDesdeFirebase();  cargarIgnoradosDesdeFirebase();}