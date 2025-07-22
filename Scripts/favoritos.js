const GestorFavoritos = {
  guardarLocal: () => {
    try {
      localStorage.setItem("listaFavoritos", JSON.stringify(favoritos));
      console.log("💾 Favoritos guardados en localStorage");
    } catch (e) {
      console.error("❌ Error al guardar favoritos en localStorage:", e);
    }
  },

  cargarLocal: () => {
    try {
      const data = localStorage.getItem("listaFavoritos");
      favoritos = data ? JSON.parse(data) : [];
      console.log(data ? "📥 Favoritos cargados desde localStorage" : "📂 Lista de favoritos vacía");
    } catch (e) {
      console.error("❌ Error al cargar favoritos desde localStorage:", e);
      favoritos = [];
    }
  },

    guardarFirebase: (favorito) => {
    if (navigator.onLine && typeof db !== "undefined") {
      const idSeguro = codificarID(favorito.id);
      const ref = db.ref(`${rutaFavoritos}/${idSeguro}`);
      ref.set(favorito)
        .then(() => console.log("✅ Favorito guardado en Firebase"))
        .catch(err => console.error("❌ Error al guardar en Firebase:", err));
    } else {
      console.warn("📴 Sin conexión, no se guardó en Firebase");
    }
    },


  borrarFirebase: (id) => {
    if (navigator.onLine && typeof db !== "undefined") {
      const idSeguro = codificarID(id);
      const ref = db.ref(`${rutaFavoritos}/${idSeguro}`);
      ref.remove()
        .then(() => console.log("🗑️ Favorito eliminado de Firebase"))
        .catch(err => console.error("❌ Error al eliminar en Firebase:", err));
    } else {
      console.warn("📴 Sin conexión, no se eliminó en Firebase");
    }
  },


cargarDesdeFirebase: () => {
  if (navigator.onLine && typeof db !== "undefined") {
    db.ref(rutaFavoritos).once('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        favoritos = Object.entries(data).map(([key, val]) => {
          val.id = decodificarID(key); // restaurar puntos
          return val;
        });
        GestorFavoritos.guardarLocal(); // opcional
        console.log("☁️ Favoritos sincronizados desde Firebase");
      } else {
        console.log("📂 Firebase vacío, usando localStorage");
        GestorFavoritos.cargarLocal();
      }

      renderizarFavoritosEn("lista");
      renderizarFavoritosEn("sidebar");
      mostrarMarcadoresFavoritos?.();

    }, err => {
      console.error("❌ Error al cargar desde Firebase:", err);
      GestorFavoritos.cargarLocal();
      renderizarFavoritosEn("lista");
      renderizarFavoritosEn("sidebar");
      mostrarMarcadoresFavoritos?.();
    });

  } else {
    console.warn("📡 Sin conexión: usando localStorage");
    GestorFavoritos.cargarLocal();
    renderizarFavoritosEn("lista");
    renderizarFavoritosEn("sidebar");
    mostrarMarcadoresFavoritos?.();
  }
},


  cargarIgnorados: () => {
    if (navigator.onLine && typeof db !== "undefined") {
      db.ref(rutaIgnorados).once('value', snapshot => {
        const data = snapshot.val();
        if (Array.isArray(data)) {
          ignorados.splice(0);
          ignorados.push(...data);
          localStorage.setItem("lugaresIgnorados", JSON.stringify(ignorados));
          console.log("✅ Ignorados cargados desde Firebase");
        } else {
          console.log("📂 No hay ignorados en Firebase");
        }
      }, err => {
        console.error("❌ Error al cargar ignorados:", err);
      });

    } else {
      console.warn("📴 Sin conexión: usando ignorados de localStorage");
      const local = JSON.parse(localStorage.getItem("lugaresIgnorados") || "[]");
      ignorados.splice(0);
      ignorados.push(...local);
    }
  }
};
function guardarEdicionFavoritoDesde(origen) {
  console.log("📝 Guardando edición desde:", origen);
  if (!favoritoEditandoId) {
    console.warn("❌ No hay favorito editando (favoritoEditandoId es null)");
    return;
  }

  const favorito = favoritos.find(f => f.id === favoritoEditandoId);
  if (!favorito) {
    console.warn("❌ No se encontró el favorito en la lista con ID:", favoritoEditandoId);
    return;
  }

  const sufijo = origen === "lista" ? "Lista" : "";
  console.log("🔍 Usando sufijo:", sufijo);

  const nombreInput = document.getElementById(`editNombre${sufijo}`);
  const precioInput = document.getElementById(`editPrecio${sufijo}`);
  const horarioInput = document.getElementById(`editHorario${sufijo}`);
  const notasInput = document.getElementById(`editNotas${sufijo}`);
  const monedaInput = document.getElementById(`editMoneda${sufijo}`);
  const moneda = monedaInput.value.trim();

  if (!nombreInput || !precioInput || !horarioInput || !notasInput) {
    console.error("❌ Uno o más inputs no se encontraron en el DOM");
    console.log({ nombreInput, precioInput, horarioInput, notasInput });
    return;
  }

  const nombre = nombreInput.value.trim();
  const precio = precioInput.value.trim();
  const horario = horarioInput.value.trim();
  const notas = notasInput.value.trim();

  console.log("✍️ Nuevos datos ingresados:", { nombre, precio, horario, notas });

  favorito.datosPersonalizados = { nombre, precio, horario, notas };
  console.log("✅ Datos actualizados en objeto favorito:", favorito);

  try {
    GestorFavoritos.guardarLocal();
    console.log("💾 Guardado en localStorage");
  } catch (e) {
    console.error("❌ Error al guardar en localStorage", e);
  }

  try {
    GestorFavoritos.guardarFirebase(favorito);
    console.log("☁️ Guardado en Firebase");
  } catch (e) {
    console.error("❌ Error al guardar en Firebase", e);
  }

  console.log("🔄 Refrescando vistas...");
  renderizarFavoritosEn("lista");
  renderizarFavoritosEn("sidebar");
  mostrarMarcadoresFavoritos?.();

  console.log("📦 Cerrando editor...");
  if (origen === "lista") {
    cerrarEditorFavoritoDesde("lista");
  } else {
    cerrarEditorFavoritoDesde("sidebar");
  }
}

function borrarFavoritoDesde(origen) {
  console.log("🗑️ Borrando favorito desde:", origen);
  if (!favoritoEditandoId) {
    console.warn("❌ No hay favorito editando (favoritoEditandoId es null)");
    return;
  }

  const index = favoritos.findIndex(f => f.id === favoritoEditandoId);
  if (index === -1) {
    console.warn("❌ No se encontró el favorito en la lista con ID:", favoritoEditandoId);
    return;
  }

  const id = favoritos[index].id;
  console.log("🗑️ Eliminando favorito con ID:", id);

  favoritos.splice(index, 1);
  console.log("✅ Favorito eliminado del array local");

  try {
    GestorFavoritos.guardarLocal();
    console.log("💾 Guardado en localStorage");
  } catch (e) {
    console.error("❌ Error al guardar en localStorage", e);
  }

  try {
    GestorFavoritos.borrarFirebase(id);
    console.log("☁️ Eliminado de Firebase");
  } catch (e) {
    console.error("❌ Error al eliminar en Firebase", e);
  }

  console.log("🔄 Refrescando vistas tras eliminación...");
  renderizarFavoritosEn("lista");
  renderizarFavoritosEn("sidebar");
  mostrarMarcadoresFavoritos?.();

  console.log("📦 Cerrando editor...");
  if (origen === "lista") {
    cerrarEditorFavoritoDesde("lista");
  } else {
    cerrarEditorFavoritoDesde("sidebar");
  }
}

function cerrarEditorFavoritoDesde(origen) {
  favoritoEditandoId = null;

  if (origen === "lista") {
    document.getElementById("modal-fondo-editor").style.display = "none";
  } else {
    // Usar el modal real del sidebar
    const modalSidebar = document.getElementById("modal-fondo-favoritos");
    if (modalSidebar) modalSidebar.style.display = "none";

    const contenidoSidebar = document.getElementById("sidebarContenido");
    if (contenidoSidebar) contenidoSidebar.style.display = "block";
  }
}

function mostrarEditorFavoritoDesde(origen, id) {
  console.log(`🛠️ Editor desde ${origen}, ID:`, id);
  const favorito = favoritos.find(f => f.id === id);
  if (!favorito) return;

  favoritoEditandoId = id;

  const sufijo = origen === "lista" ? "Lista" : "";

  document.getElementById(`editNombre${sufijo}`).value = favorito.datosPersonalizados.nombre || "";
  document.getElementById(`editPrecio${sufijo}`).value = favorito.datosPersonalizados.precio || "";
  document.getElementById(`editHorario${sufijo}`).value = favorito.datosPersonalizados.horario || "";
  document.getElementById(`editNotas${sufijo}`).value = favorito.datosPersonalizados.notas || "";

  if (origen === "sidebar") {
    document.getElementById("sidebarContenido").style.display = "none";
  }

  if (sufijo === "Lista") {
  document.getElementById("modal-fondo-editor").style.display = "block";
} else {
  document.getElementById("modal-fondo-favoritos").style.display = "block";
}
}
function renderizarFavoritosEn(origen) {
  const esLista = origen === "lista";
  const contenedor = document.getElementById(esLista ? "contenedorFavoritos" : "contenedorFavoritosSidebar");
  contenedor.innerHTML = "";

  let listaFinal = favoritos;

  if (esLista) {
    const listaDiv = document.getElementById("listaFavoritos");
    const filtroTexto = document.getElementById("buscadorFavoritos")?.value.toLowerCase() || "";
    const filtroTipo = document.getElementById("filtroTipoFavoritos")?.value || "";
    const orden = document.getElementById("ordenFavoritos")?.value || "distanciaAsc";

    if (favoritos.length === 0) {
      listaDiv.style.display = "none";
      return;
    } else {
      listaDiv.style.display = "block";
    }

    const userPos = ubicacionReal || currentCoords;
    const lat1 = Array.isArray(userPos) ? userPos[0] : userPos.lat;
    const lon1 = Array.isArray(userPos) ? userPos[1] : userPos.lng;

    listaFinal = favoritos
  .filter(f => f.lat != null && f.lon != null)  // ← ESTA LÍNEA EVITA EL CRASH
  .map(f => ({ ...f, distanciaKm: calcularDistancia(lat1, lon1, f.lat, f.lon) }))
  .filter(f => {
    const texto = `${f.datosPersonalizados?.nombre || ""} ${f.datosPersonalizados?.notas || ""}`.toLowerCase();
    const coincideTexto = texto.includes(filtroTexto);
    const coincideTipo = filtroTipo === "" || f.tipo === filtroTipo;
    return coincideTexto && coincideTipo;
  });


    if (orden === "distanciaAsc") {
      listaFinal.sort((a, b) => a.distanciaKm - b.distanciaKm);
    } else if (orden === "distanciaDesc") {
      listaFinal.sort((a, b) => b.distanciaKm - a.distanciaKm);
    }
  }

  listaFinal.forEach(f => {
    if (esLista) {
      contenedor.appendChild(crearTarjetaFavorito(f));
    } else {
      const clon = document.getElementById("template-favorito-sidebar").content.cloneNode(true);
      const item = clon.querySelector(".favorito-sidebar-item");
      const nombreEl = clon.querySelector(".favorito-sidebar-nombre");
      const ubicacionEl = clon.querySelector(".favorito-sidebar-ubicacion");
      const notasEl = clon.querySelector(".favorito-sidebar-notas");
      const btnVer = clon.querySelector(".btn-ver");
      const btnEliminar = clon.querySelector(".btn-eliminar");

      item.dataset.id = f.id;

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
        mostrarEditorFavoritoDesde("sidebar", f.id);
      });

      contenedor.appendChild(clon);
    }
  });
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
  const btnEditar = clon.querySelector(".btn-editar");
  const checkbox = clon.querySelector(".favorito-visitado");

  tarjeta.dataset.id = f.id;

  const nombre = f.datosPersonalizados?.nombre || f.id;
  const ciudadPais = f.ubicacion || "Ubicación desconocida";
  const direccion = f.direccion || "Dirección no disponible";
  const notas = f.datosPersonalizados?.notas || "";
  const precio = f.datosPersonalizados?.precio || "";
  const horario = f.datosPersonalizados?.horario || "";

  const imagenURL = f.imagen || `https://maps.googleapis.com/maps/api/staticmap?center=${f.lat},${f.lon}&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C${f.lat},${f.lon}&key=AIzaSyA8KhfGc61uBT3DHS1hiCEl7HgnFYaWySI`;
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

  btnEditar.addEventListener("click", e => {
    e.stopPropagation();
    mostrarEditorFavoritoDesde("lista", f.id);
  });

  checkbox.addEventListener("change", () => {
    tarjeta.classList.toggle("visitado", checkbox.checked);
  });

  return clon;
}



// 👇 Necesario para que sea accesible desde otros scripts o HTML:

function toggleFavorito(id, tipo, coords, name, btn) {
  const index = favoritos.findIndex(f => f.id === id);

  if (index === -1) {
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

    // 🔁 Hacer geocoding inverso
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat: coords[0], lng: coords[1] } }, (results, status) => {
      if (status === "OK" && results[0]) {
        nuevoFavorito.ubicacion = results[0].formatted_address;
      } else {
        nuevoFavorito.ubicacion = "Ubicación desconocida";
        console.warn("No se pudo obtener dirección:", status);
      }

      favoritos.push(nuevoFavorito);
      GestorFavoritos.guardarLocal();
      GestorFavoritos.guardarFirebase(nuevoFavorito);
      renderizarFavoritosEn("lista");
      renderizarFavoritosEn("sidebar");
      mostrarMarcadoresFavoritos();

      if (document.getElementById("pagina-favoritos").style.display !== "none") {
        mostrarEditorFavoritoDesde("lista", id);
      } else {
        mostrarEditorFavoritoDesde("sidebar", id);
      }

      btn.innerText = "⭐ Favorito";
    });

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

    GestorFavoritos.guardarLocal();
    renderizarFavoritosEn("lista");
    renderizarFavoritosEn("sidebar");
    mostrarMarcadoresFavoritos();
  }
}

window.toggleFavorito = toggleFavorito;
let favoritoEditandoId = null;
// 🛡️ Sanitizar ID para rutas Firebase
const codificarID = id => id.replace(/\./g, "_");
const decodificarID = id => id.replace(/_/g, ".");

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
function editarFavoritoDesdeMapa(id) {
  const favorito = favoritos.find(f => f.id === id);
  if (!favorito) return;

  // Abre el sidebar si está cerrado
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("open");
  document.getElementById("toggleMenu").style.display = "none";

  // Abre el editor del favorito
  mostrarEditorFavoritoDesde("sidebar", id); // asegúrate de tener esta función
}
// Exponer al global:
window.guardarLocal = GestorFavoritos.guardarLocal;
window.cargarLocal = GestorFavoritos.cargarLocal;
window.guardarFirebase = GestorFavoritos.guardarFirebase;
window.borrarFirebase = GestorFavoritos.borrarFirebase;
window.cargarDesdeFirebase = GestorFavoritos.cargarDesdeFirebase;
window.cargarIgnorados = GestorFavoritos.cargarIgnorados;
window.guardarEdicionFavoritoDesde = guardarEdicionFavoritoDesde;
window.cerrarEditorFavoritoDesde = cerrarEditorFavoritoDesde;
window.borrarFavoritoDesde = borrarFavoritoDesde;
window.toggleFavorito = toggleFavorito;
window.mostrarMarcadoresFavoritos = mostrarMarcadoresFavoritos;
window.renderizarFavoritosEn = renderizarFavoritosEn;
window.mostrarEditorFavoritoDesde = mostrarEditorFavoritoDesde;
window.editarFavoritoDesdeMapa = editarFavoritoDesdeMapa;
window.guardarListas = guardarListas;