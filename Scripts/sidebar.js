// ✅ sidebar.js (módulo ES6)

import { actualizarCirculo } from "./centrarFavorito.js";// ✅
import { actualizarBusquedaActiva } from "./searchManager.js";// ✅
import { renderizarFavoritos } from "./favoritesManager.js";// ✅
import { getLocation } from "./centrarFavorito.js"; // ✅

export function initSidebar() {
  log("✅ initSidebar iniciado");
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("closeSidebar");

   if (!toggleBtn) log("❌ NO ENCONTRADO: toggleMenu");
  if (!sidebar) log("❌ NO ENCONTRADO: sidebar");
  if (!closeBtn) log("❌ NO ENCONTRADO: closeSidebar");

  if (toggleBtn && sidebar && closeBtn) {

    log("✅ Elementos del sidebar OK");

  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    toggleBtn.style.display = "block";
          log("🧹 Sidebar cerrado");
  });

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    toggleBtn.style.display = sidebar.classList.contains("open") ? "none" : "block";
        log("🎛️ Sidebar toggle:", sidebar.classList.contains("open"));
  });
  } else{
    log("❌ ERROR: No se pudo iniciar el sidebar correctamente");
    return;
  }
  document.getElementById("radiusSlider").addEventListener("input", () => {
    document.getElementById("radiusValue").innerText = document.getElementById("radiusSlider").value;
    actualizarCirculo();
    actualizarBusquedaActiva();
  });

  sidebar.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) return;
    e.stopPropagation();
  }, { passive: false });

  sidebar.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

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

  getLocation();

  document.getElementById("buscadorFavoritos").value = localStorage.getItem("filtroTextoFavoritos") || "";
  document.getElementById("filtroTipoFavoritos").value = localStorage.getItem("filtroTipoFavoritos") || "";
  document.getElementById("ordenFavoritos").value = localStorage.getItem("ordenFavoritos") || "distanciaAsc";

  renderizarFavoritos();
}
