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
