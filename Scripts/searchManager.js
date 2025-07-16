// Scripts/searchManager.js
import { map, currentCoords, tipoActivo } from './variablesGlobales.js';//✅
import { buscar } from './busquedaLugares.js';// ✅
import { actualizarCirculo } from './circuloBusqueda.js';//✅
import { renderizarFavoritos } from './favoritosManager.js'; //✅

let ubicacionReal = null;
let marcadorUbicacionReal = null;

// 🔁 Re-busca automáticamente lugares activos si cambia la ubicación
function actualizarBusquedaActiva() {
  Object.keys(tipoActivo).forEach(tipo => {
    if (tipoActivo[tipo]) buscar(tipo);
  });
}

// ✅ Obtiene la ubicación GPS real, actualiza currentCoords y muestra marcador azul (no arrastrable)
function actualizarUbicacionReal() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite geolocalización");
    return;
  }

  document.getElementById("status").innerText = "Obteniendo ubicación real...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      ubicacionReal = { lat, lng: lon };
      window.currentCoords = [lat, lon];

      if (!marcadorUbicacionReal) {
        marcadorUbicacionReal = new google.maps.Marker({
          position: ubicacionReal,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#00f",
            fillOpacity: 1,
            strokeWeight: 0,
          },
          title: "Ubicación real",
        });
      } else {
        marcadorUbicacionReal.setPosition(ubicacionReal);
      }

      map.setCenter(ubicacionReal);
      map.setZoom(16);

      actualizarCirculo([lat, lon]);
      actualizarBusquedaActiva();
      renderizarFavoritos();

      document.getElementById("status").innerText = "";
    },

    (err) => {
      console.error(err);
      document.getElementById("status").innerText = "No se pudo obtener la ubicación";
    },

    { enableHighAccuracy: true }
  );
}

// 🔘 Botón personalizado en la esquina superior derecha
function crearBotonUbicacion() {
  const boton = document.createElement("div");
  boton.className = "custom-map-control-button";
  boton.innerHTML = "📍";
  boton.title = "Obtener ubicación real";
  boton.style.backgroundColor = "white";
  boton.style.padding = "8px";
  boton.style.margin = "10px";
  boton.style.borderRadius = "4px";
  boton.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
  boton.style.cursor = "pointer";

  boton.onclick = (e) => {
    e.preventDefault();
    actualizarUbicacionReal();
  };

  return boton;
}

function agregarBotonUbicacionAlMapa(mapa) {
  const controlDiv = document.createElement("div");
  controlDiv.appendChild(crearBotonUbicacion());
  mapa.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
}

export {
  actualizarBusquedaActiva,//✅
  actualizarUbicacionReal,
  agregarBotonUbicacionAlMapa
};
