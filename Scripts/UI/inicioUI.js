
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

  getLocation();
});
//======== EVENTOS DE CARGA Y MANEJO DE SIDEBAR 👆 ========//
