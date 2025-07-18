//================= EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👇 =================//

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");

  const closeBtn = document.getElementById("closeSidebar");
  // Estado inicial: solo mostrar el botón que tenga sentido según el estado del sidebar
if (sidebar.classList.contains("open")) {
  toggleBtn.style.display = "none";
  closeBtn.style.display = "block";
} else {
  toggleBtn.style.display = "block";
  closeBtn.style.display = "none";
}

closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("open");
  toggleBtn.style.display = "block";
  closeBtn.style.display = "none";
});

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  const isOpen = sidebar.classList.contains("open");
  toggleBtn.style.display = isOpen ? "none" : "block";
  closeBtn.style.display = isOpen ? "block" : "none";
});

  // 🎚️ Deslizador de radio
  document.getElementById("radiusSlider").addEventListener("input", () => {
    document.getElementById("radiusValue").innerText = document.getElementById("radiusSlider").value;
    actualizarCirculo();
    actualizarBusquedaActiva();
  });

  // 🧠 Prevenir gestos táctiles accidentales
  sidebar.addEventListener("touchstart", function (e) {
    if (e.touches.length > 1) return;
    e.stopPropagation();
  }, { passive: false });

  sidebar.addEventListener("dblclick", function (e) {
    e.preventDefault();
    e.stopPropagation();
  });

  // 🔄 Listeners para filtros de favoritos
  document.getElementById("buscadorFavoritos").addEventListener("input", (e) => {
    localStorage.setItem("filtroTextoFavoritos", e.target.value);
    renderizarFavoritos();
  });

  document.getElementById("filtroTipoFavoritos").addEventListener("change", (e) => {
    localStorage.setItem("filtroTipoFavoritos", e.target.value);
    renderizarFavoritos();
  });

  document.getElementById("ordenFavoritos").addEventListener("change", (e) => {
    localStorage.setItem("ordenFavoritos", e.target.value);
    renderizarFavoritos();
  });

  // 📍 Cargar mapa con ubicación inicial
  getLocation();
// 🔄 Cargar favoritos desde Firebase
cargarFavoritosDesdeFirebase();
  // ⭐ Cargar favoritos al iniciar
  renderizarFavoritos();

  // 🔁 Recuperar filtros guardados
  document.getElementById("buscadorFavoritos").value = localStorage.getItem("filtroTextoFavoritos") || "";
  document.getElementById("filtroTipoFavoritos").value = localStorage.getItem("filtroTipoFavoritos") || "";
  document.getElementById("ordenFavoritos").value = localStorage.getItem("ordenFavoritos") || "distanciaAsc";


});

//================= EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👆 =================//
//✅======== BUSCAR UN LUGAR POR NOMBRE (input de texto) 👇 ======== //
// 🧭 Busca una ciudad o dirección por nombre (con Nominatim)
function buscarLugar() {
  const lugar = document.getElementById("locationSearch").value;
  if (!lugar) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        alert("Lugar no encontrado");
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      currentCoords = [lat, lon];

      // Mueve el marcador principal
      userMarker.setPosition({ lat, lng: lon });

      // Centra el mapa
      map.setCenter({ lat, lng: lon });
      map.setZoom(14);

      // Actualiza el círculo y la búsqueda activa
      actualizarCirculo();
      actualizarBusquedaActiva();
    })
    .catch(err => {
      console.error(err);
      alert("Error al buscar el lugar");
    });
}
//✅======== BUSCAR UN LUGAR POR NOMBRE (input de texto) 👆 ======== //
