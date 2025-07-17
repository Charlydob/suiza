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
}

//================= INICIALIZACIÓN DEL MAPA Y MARCADOR DEL USUARIO 👆 =================//
