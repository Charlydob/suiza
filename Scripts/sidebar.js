//================= EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👇 =================//

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");

  const closeBtn = document.getElementById("closeSidebar");
  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    toggleBtn.style.display = "block";
  });

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    toggleBtn.style.display = sidebar.classList.contains("open") ? "none" : "block";
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

  // 🔁 Recuperar filtros guardados
  document.getElementById("buscadorFavoritos").value = localStorage.getItem("filtroTextoFavoritos") || "";
  document.getElementById("filtroTipoFavoritos").value = localStorage.getItem("filtroTipoFavoritos") || "";
  document.getElementById("ordenFavoritos").value = localStorage.getItem("ordenFavoritos") || "distanciaAsc";

  // ⭐ Cargar favoritos al iniciar
  renderizarFavoritos();
});

//================= EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👆 =================//
