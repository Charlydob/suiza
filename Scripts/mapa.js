//================= GESTIÓN DEL CÍRCULO DE BÚSQUEDA 👇 =================//

// 🔵 Crea el círculo de búsqueda alrededor del usuario
function crearCirculo() {
  const radius = parseInt(document.getElementById("radiusSlider").value);

  // Si ya existe, eliminar el círculo anterior
  if (searchCircle) {
    searchCircle.setMap(null);
  }

  // Crear nuevo círculo con Google Maps
  searchCircle = new google.maps.Circle({
    strokeColor: "#0000FF",
    strokeOpacity: 0.6,
    strokeWeight: 2,
    fillColor: "#5fa",
    fillOpacity: 0.2,
    map: map,
    center: { lat: currentCoords[0], lng: currentCoords[1] },
    radius: radius,
  });
}

// 🔁 Actualiza el círculo cuando cambia la ubicación o el radio
function actualizarCirculo() {
  const radius = parseInt(document.getElementById("radiusSlider").value);
  if (searchCircle) {
    searchCircle.setCenter({ lat: currentCoords[0], lng: currentCoords[1] });
    searchCircle.setRadius(radius);
  }
}

//================= GESTIÓN DEL CÍRCULO DE BÚSQUEDA 👆 =================//


//================= INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👇 =================//

function initMap(lat = 46.8182, lon = 8.2275) {
  try {
    const posicionInicial = { lat: lat, lng: lon };
    currentCoords = [lat, lon];

    // Crear el mapa centrado
    map = new google.maps.Map(document.getElementById("map"), {
      center: posicionInicial,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Crear el marcador de usuario
    userMarker = new google.maps.Marker({
      position: posicionInicial,
      map: map,
      draggable: true,
      icon: {
        url: iconoUbicacion,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      },
      title: "📍 Aquí estás tú, piloto 🚌💨"
    });

    // Crear el círculo de búsqueda
    crearCirculo();

    // Evento al soltar el marcador arrastrable
    userMarker.addListener("dragend", () => {
      const pos = userMarker.getPosition();
      currentCoords = [pos.lat(), pos.lng()];
      actualizarCirculo();
      actualizarBusquedaActiva();
    });

    // Actualizar mensaje en la UI
    document.getElementById("status").innerText = "Ubicación cargada";
  } catch (error) {
    reportarError(error);
  }
  agregarBotonUbicacionAlMapa();
}

//================= INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👆 =================//
//================= ACTUALIZACIÓN EN TIEMPO REAL Y UBICACIÓN GPS 👇 =================//

// 🔁 Re-busca automáticamente lugares activos si cambia la ubicación
function actualizarBusquedaActiva() {
  Object.keys(tipoActivo).forEach(tipo => {
    if (tipoActivo[tipo]) buscar(tipo);
  });
}

// ✅ Obtiene ubicación GPS real, actualiza currentCoords y crea marcador azul no arrastrable
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
      currentCoords = [lat, lon];

      // Crear o actualizar marcador azul
      if (!marcadorUbicacionReal) {
        marcadorUbicacionReal = new google.maps.Marker({
          position: ubicacionReal,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#00f",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2
          },
          title: "Ubicación real",
          clickable: false
        });
      } else {
        marcadorUbicacionReal.setPosition(ubicacionReal);
      }

      map.setCenter(ubicacionReal);
      map.setZoom(16);

      actualizarCirculo();
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

// 🔘 Crea un botón flotante en el mapa para obtener ubicación GPS
function agregarBotonUbicacionAlMapa() {
  const controlDiv = document.createElement("div");
  controlDiv.style.backgroundColor = "#fff";
  controlDiv.style.border = "2px solid #fff";
  controlDiv.style.borderRadius = "3px";
  controlDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlDiv.style.cursor = "pointer";
  controlDiv.style.margin = "10px";
  controlDiv.style.padding = "5px 10px";
  controlDiv.style.fontSize = "20px";
  controlDiv.innerText = "📍";

  controlDiv.title = "Obtener ubicación real";
  controlDiv.addEventListener("click", actualizarUbicacionReal);

  // Insertar el botón en el mapa
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
}

//================= ACTUALIZACIÓN EN TIEMPO REAL Y UBICACIÓN GPS 👆 =================//
//================= OBTENER UBICACIÓN AL CARGAR 👇 =================//

function getLocation() {
  if (!navigator.geolocation) {
    alert("Tu navegador no permite geolocalización");
    initMap(40.4168, -3.7038); // 🧭 Coordenadas por defecto: Madrid
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      initMap(lat, lon);
    },
    (err) => {
      console.warn("No se pudo obtener la ubicación. Usando ubicación por defecto.");
      initMap(40.4168, -3.7038); // 🧭 Madrid como fallback
    },
    { enableHighAccuracy: true }
  );
}
