// ✅ favoritesManager.js (módulo ES6)
//======== GESTIÓN DE FAVORITOS ========//

import { calcularDistancia } from "./calcularDistancia.js"; //✅
import { rutaFavoritos, db } from "./firebase.js";//✅
import { favoritos, currentCoords, ubicacionReal, map, marcadoresFavoritos, guardarListas } from "./variablesGlobales.js";//✅
import { set, child, ref, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

let favoritoEditandoId = null;

export function renderizarFavoritos() {
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

export function toggleFavorito(id, tipo, coords, name, btn) {
  const index = favoritos.findIndex(f => f.id === id);

  if (index === -1) {
    favoritos.push({
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
    });
    btn.innerText = "⭐ Favorito";
  } else {
    favoritos.splice(index, 1);
    btn.innerText = "☆ Favorito";
  }

  guardarListas();
  renderizarFavoritos();
  mostrarMarcadoresFavoritos();
}

export function mostrarEditorFavorito(id) {
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

export function guardarEdicionFavorito() {
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

  if (navigator.onLine && db) {
  const favoritoRef = child(rutaFavoritos, favorito.id);
  set(favoritoRef, favorito)
    .then(() => console.log("✅ Favorito actualizado en Firebase"))
    .catch(err => console.error("Error actualizando en Firebase:", err));
}
}

export function borrarFavorito() {
  const index = favoritos.findIndex(f => f.id === favoritoEditandoId);
  if (index !== -1) {
    const id = favoritos[index].id;
    favoritos.splice(index, 1);
    guardarListas();
    renderizarFavoritos();
    mostrarMarcadoresFavoritos();
    cerrarEditorFavorito();

    if (navigator.onLine && db) {
  const ruta = ref(db, `${rutaFavoritos}/${id}`);
  remove(ruta)
    .then(() => console.log("🗑️ Favorito eliminado de Firebase"))
    .catch(err => console.error("Error eliminando de Firebase:", err));
}
  }
}

export function cerrarEditorFavorito() {
  favoritoEditandoId = null;
  document.getElementById("editorFavorito").style.display = "none";
  document.getElementById("sidebarContenido").style.display = "block";
}

export function mostrarMarcadoresFavoritos() {
  marcadoresFavoritos.forEach(m => m.setMap(null));
  marcadoresFavoritos.length = 0;

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

    const contentString = `
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
          <button onclick="establecerCentroDesdeFavorito(${f.lat}, ${f.lon})">📌 Establecer como centro</button>
          <button onclick="toggleFavorito('${idUnico}', '${tipo}', [${f.lat}, ${f.lon}], '${nombre.replace(/'/g, "\\'")}', this)">🗑️ Eliminar</button>
        </div>
      </div>
    `;

    const marcador = new google.maps.Marker({
      position: coords,
      map,
      title: nombre,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FFD700",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#000"
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: contentString
    });

    marcador.addListener("click", () => infoWindow.open(map, marcador));

    marcadoresFavoritos.push(marcador);
  });
}

export function editarFavoritoDesdeMapa(id) {
  const favorito = favoritos.find(f => f.id === id);
  if (!favorito) return;

  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("open");
  document.getElementById("toggleMenu").style.display = "none";

  mostrarEditorFavorito(id);
}
