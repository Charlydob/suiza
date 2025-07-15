import { actualizarCirculo } from '../mapa/circuloBusqueda.js';
import { actualizarBusquedaActiva, getLocation } from '../mapa/ubicacion.js';

//======== EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👇 ========//
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

  document.getElementById("radiusSlider").addEventListener("input", () => {
    document.getElementById("radiusValue").innerText = document.getElementById("radiusSlider").value;
    actualizarCirculo();
    actualizarBusquedaActiva();
  });

  sidebar.addEventListener("touchstart", function (e) {
    if (e.touches.length > 1) return;
    e.stopPropagation();
  }, { passive: false });

  sidebar.addEventListener("dblclick", function (e) {
    e.preventDefault();
    e.stopPropagation();
  });

  // Botón "Ver mi ubicación"
  document.getElementById("btn-getLocation").addEventListener("click", getLocation);

  // Botón "Buscar lugar"
  document.getElementById("btn-buscarLugar").addEventListener("click", async () => {
    const { buscarLugar } = await import('../mapa/busqueda.js');
    buscarLugar();
  });

  // Botón "Limpiar"
  document.getElementById("btn-clearAll").addEventListener("click", async () => {
    const { clearAll } = await import('../mapa/limpiarMapa.js');
    clearAll();
  });

  // Filtros de tipo (campings, gasolineras, etc.)
  document.querySelectorAll(".filter-card").forEach(card => {
    card.addEventListener("click", async () => {
      const tipo = card.id.replace("btn-", "");
      const { toggleTipo } = await import('../mapa/gestorTipos.js');
      toggleTipo(tipo);
    });
  });

  // Carga inicial: obtener ubicación
  getLocation();
});
//======== EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👆 ========//
