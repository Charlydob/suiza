

function guardarListas() {
  try {
    localStorage.setItem("listaFavoritos", JSON.stringify(favoritos));
    console.log("💾 Favoritos guardados en localStorage");
  } catch (e) {
    console.error("❌ Error al guardar favoritos en localStorage:", e);
  }
}
function cargarListas() {
  try {
    const data = localStorage.getItem("listaFavoritos");
    if (data) {
      favoritos = JSON.parse(data);
      console.log("📥 Favoritos cargados desde localStorage");
    } else {
      favoritos = [];
      console.log("📂 No hay favoritos en localStorage");
    }
  } catch (e) {
    console.error("❌ Error al cargar favoritos desde localStorage:", e);
    favoritos = [];
  }
}


function cargarFavoritosDesdeFirebase() {
  if (navigator.onLine && typeof db !== "undefined") {
    db.ref(rutaFavoritos).once('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        favoritos = Object.values(data);
        guardarListas(); // opcional: sincroniza con local
        renderizarFavoritos();
                renderizarFavoritosEnSidebar();
        mostrarMarcadoresFavoritos();
      } else {
        console.log("📂 No hay favoritos en Firebase, usando localStorage...");
        cargarListas(); // por si tienes algún favorito local
        renderizarFavoritos();
        renderizarFavoritosEnSidebar();
        mostrarMarcadoresFavoritos();
      }
    }, err => {
      console.error("Error cargando favoritos desde Firebase:", err);
      cargarListas(); // fallback
      renderizarFavoritos();
        renderizarFavoritosEnSidebar();
      mostrarMarcadoresFavoritos();
    });
  } else {
    console.warn("📡 Sin conexión: cargando favoritos desde localStorage");
    cargarListas();
    renderizarFavoritos();
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
function crearTarjetaFavorito(f) {
  const clon = document.getElementById("template-favorito").content.cloneNode(true);

  const tarjeta = clon.querySelector(".favorito-tarjeta");
  const imagen = clon.querySelector("img");
  const nombreEl = clon.querySelector(".favorito-nombre");
  const ubicacionEl = clon.querySelector(".favorito-ubicacion");
  const direccionEl = clon.querySelector(".favorito-direccion");
  const notasEl = clon.querySelector(".favorito-notas");
  const precioEl = clon.querySelector(".favorito-precio");
  const horarioEl = clon.querySelector(".favorito-horario");
  const btnVer = clon.querySelector(".btn-ver");
  const btnEliminar = clon.querySelector(".btn-eliminar");
  const checkbox = clon.querySelector(".favorito-visitado");

  const nombre = f.datosPersonalizados?.nombre || f.id;
  const ciudadPais = f.ubicacion || "Ubicación desconocida";
  const direccion = f.direccion || "Dirección no disponible";
  const notas = f.datosPersonalizados?.notas || "";
  const precio = f.datosPersonalizados?.precio || "";
  const horario = f.datosPersonalizados?.horario || "";

  const imagenURL = f.imagen || `https://maps.googleapis.com/maps/api/staticmap?center=${f.lat},${f.lon}&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C${f.lat},${f.lon}&key=TU_API_KEY`;
  imagen.src = imagenURL;

  nombreEl.textContent = nombre;
  ubicacionEl.textContent = ciudadPais;
  direccionEl.textContent = direccion;
  notasEl.textContent = notas ? `📝 ${notas}` : "";
  precioEl.textContent = precio ? `💰 ${precio}` : "";
  horarioEl.textContent = horario ? `🕒 ${horario}` : "";

  btnVer.addEventListener("click", e => {
    e.stopPropagation();
    establecerCentroDesdeFavorito(f.lat, f.lon);
  });

  btnEliminar.addEventListener("click", e => {
    e.stopPropagation();
    toggleFavorito(f.id, f.tipo, [f.lat, f.lon], nombre, { innerText: "☆ Favorito" });
  });

  checkbox.addEventListener("change", () => {
    tarjeta.classList.toggle("visitado", checkbox.checked);
  });

  tarjeta.addEventListener("click", () => {
    if (document.getElementById("pagina-favoritos").style.display !== "none") {
      mostrarEditorFavoritoDesdeLista(f.id); // nueva lógica
    } else {
      mostrarEditorFavorito(f.id); // la original del sidebar
    }
  });


  return clon;
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
    .map(f => ({ ...f, distanciaKm: calcularDistancia(lat1, lon1, f.lat, f.lon) }))
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
    contenedor.appendChild(crearTarjetaFavorito(f));
  });
}


function renderizarFavoritosEnSidebar() {
  const contenedor = document.getElementById("contenedorFavoritosSidebar");
  contenedor.innerHTML = "";

  favoritos.forEach(f => {
    const clon = document.getElementById("template-favorito-sidebar").content.cloneNode(true);

    const item = clon.querySelector(".favorito-sidebar-item");
    const nombreEl = clon.querySelector(".favorito-sidebar-nombre");
    const ubicacionEl = clon.querySelector(".favorito-sidebar-ubicacion");
    const notasEl = clon.querySelector(".favorito-sidebar-notas");
    const btnVer = clon.querySelector(".btn-ver");
    const btnEliminar = clon.querySelector(".btn-eliminar");

    const nombre = f.datosPersonalizados?.nombre || f.id;
    const ciudadPais = f.ubicacion || "Ubicación desconocida";
    const notas = f.datosPersonalizados?.notas || "";

    nombreEl.textContent = nombre;
    ubicacionEl.textContent = ciudadPais;
    notasEl.textContent = notas ? `📝 ${notas}` : "";

    btnVer.addEventListener("click", e => {
      e.stopPropagation();
      establecerCentroDesdeFavorito(f.lat, f.lon);
    });

    btnEliminar.addEventListener("click", e => {
      e.stopPropagation();
      toggleFavorito(f.id, f.tipo, [f.lat, f.lon], nombre, { innerText: "☆ Favorito" });
    });

    item.addEventListener("click", () => {
      mostrarEditorFavorito(f.id);
    });

    contenedor.appendChild(clon);
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
    favoritos.push(nuevoFavorito);
    // Mostrar el editor inmediatamente
mostrarEditorFavorito(id); 
// O si prefieres abrir el sidebar con todo:
editarFavoritoDesdeMapa(id);

    btn.innerText = "⭐ Favorito";

    // 🟢 También guardar en Firebase
    if (navigator.onLine && typeof db !== "undefined") {
      db.ref(`${rutaFavoritos}/${id}`).set(nuevoFavorito)
        .then(() => console.log("✅ Favorito guardado en Firebase"))
        .catch(err => console.error("Error guardando en Firebase:", err));
    }

  } else {
    // Eliminar favorito existente
    const favoritoEliminado = favoritos[index];
    favoritos.splice(index, 1);
    btn.innerText = "☆ Favorito";

    // 🔴 También eliminar de Firebase
    if (navigator.onLine && typeof db !== "undefined") {
      db.ref(`${rutaFavoritos}/${favoritoEliminado.id}`).remove()
        .then(() => console.log("🗑️ Favorito eliminado de Firebase"))
        .catch(err => console.error("Error eliminando de Firebase:", err));
    }
  }

  guardarListas();
  renderizarFavoritos();
  renderizarFavoritosEnSidebar();
  mostrarMarcadoresFavoritos();
}
window.toggleFavorito = toggleFavorito;




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
function establecerCentroDesdeFavorito(lat, lon) {
  if (map) {
    const nuevaPos = new google.maps.LatLng(lat, lon);
    map.setCenter(nuevaPos);
    map.setZoom(14); // o el nivel de zoom que quieras
    currentCoords = { lat, lng: lon }; // opcional: actualizar la referencia de centro
  } else {
    console.warn("Mapa no inicializado");
  }
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
function mostrarEditorFavoritoDesdeLista(id) {
  const favorito = favoritos.find(f => f.id === id);
  if (!favorito) return;

  favoritoEditandoId = id;

  // Aquí mostrarías el editor específico de la sección de favoritos
  // por ejemplo, podrías mostrar un modal o un panel diferente
  document.getElementById("editorFavoritoLista").style.display = "block";

  // Rellenar campos
  document.getElementById("editNombreLista").value = favorito.datosPersonalizados.nombre || "";
  document.getElementById("editPrecioLista").value = favorito.datosPersonalizados.precio || "";
  document.getElementById("editHorarioLista").value = favorito.datosPersonalizados.horario || "";
  document.getElementById("editNotasLista").value = favorito.datosPersonalizados.notas || "";
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
  renderizarFavoritosEnSidebar();
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
function guardarEdicionFavoritoLista() {
  if (!favoritoEditandoId) return;

  const favorito = favoritos.find(f => f.id === favoritoEditandoId);
  if (!favorito) return;

  // Obtener valores del editor en la lista
  const nombre = document.getElementById("editNombreLista").value.trim();
  const precio = document.getElementById("editPrecioLista").value.trim();
  const horario = document.getElementById("editHorarioLista").value.trim();
  const notas = document.getElementById("editNotasLista").value.trim();

  // Actualizar datos
  favorito.datosPersonalizados = { nombre, precio, horario, notas };

  // Guardar local
  guardarListas();

  // Guardar en Firebase si corresponde
  if (navigator.onLine && typeof db !== "undefined") {
    const ref = db.ref(`${rutaFavoritos}/${favorito.id}`);
    ref.set(favorito)
      .then(() => console.log("✅ Favorito actualizado en Firebase (desde lista)"))
      .catch(err => console.error("Error actualizando en Firebase desde lista:", err));
  }

  // Actualizar vistas
  renderizarFavoritos();
  renderizarFavoritosEnSidebar();
  mostrarMarcadoresFavoritos?.(); // por si quieres sincronizar también mapa

  cerrarEditorFavoritoLista();
}


function borrarFavorito() {
  const index = favoritos.findIndex(f => f.id === favoritoEditandoId);
  if (index !== -1) {
    const id = favoritos[index].id;

    // 1. Eliminar de local
    favoritos.splice(index, 1);
    guardarListas();
    renderizarFavoritos();
    renderizarFavoritosEnSidebar();
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
function borrarFavoritoLista() {
  if (!favoritoEditandoId) return;

  const index = favoritos.findIndex(f => f.id === favoritoEditandoId);
  if (index === -1) return;

  favoritos.splice(index, 1);

  guardarFavoritosEnFirebase(favoritos);
  renderizarFavoritos();
  renderizarFavoritosEnSidebar();

  cerrarEditorFavoritoLista();
}

function cerrarEditorFavorito() {
  favoritoEditandoId = null;
  document.getElementById("editorFavorito").style.display = "none";
  document.getElementById("sidebarContenido").style.display = "block";
}
function cerrarEditorFavoritoLista() {
  favoritoEditandoId = null;
  document.getElementById("editorFavoritoLista").style.display = "none";
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
window.guardarEdicionFavoritoLista = guardarEdicionFavoritoLista;
window.borrarFavorito = borrarFavorito;
window.borrarFavoritoLista = borrarFavoritoLista;
window.cerrarEditorFavorito = cerrarEditorFavorito;
window.cerrarEditorFavoritoLista = cerrarEditorFavoritoLista;
window.renderizarFavoritos = renderizarFavoritos;
window.renderizarFavoritosEnSidebar = renderizarFavoritosEnSidebar
window.editarFavoritoDesdeMapa = editarFavoritoDesdeMapa;
window.cargarFavoritosDesdeFirebase = cargarFavoritosDesdeFirebase;
