window.initDashboard = function () {
  console.log("🚦 initDashboard llamado");

  const esperarItinerarioYContenedor = () => {
    const mapaDiv = document.getElementById("mapa-dashboard");

    const dataLista = itinerarioData && Object.keys(itinerarioData).length > 0;
    const contenedorVisible = mapaDiv && mapaDiv.offsetHeight > 0;

    if (!dataLista || !contenedorVisible) {
      console.log("⏳ Esperando data o visibilidad del div...");
      setTimeout(esperarItinerarioYContenedor, 300);
      return;
    }

    console.log("✅ itinerarioData cargado y contenedor visible");

    const primerPunto = obtenerPrimerPuntoDelItinerario();
    const lat = primerPunto?.lat || 46.8182;
    const lng = primerPunto?.lng || 8.2275;

    requestAnimationFrame(() => {
      initMap(lat, lng, "mapa-dashboard");

      setTimeout(() => {
        console.log("🔄 Forzando resize y centrado del mapa");
        google.maps.event.trigger(map, "resize");
        map.setCenter({ lat, lng });
      }, 250);

      renderizarRutaYEventos();

      // 🔁 Esperar a que se trace la ruta general para mostrar el resumen con km reales
      renderizarRutaGeneralPorCiudades().then(() => {
        renderizarResumenDashboard();
      });
    });
  };

  esperarItinerarioYContenedor();
};


function obtenerPrimerPuntoDelItinerario() {
  for (const [ubicacion, fechas] of Object.entries(itinerarioData)) {
    for (const [fecha, entrada] of Object.entries(fechas)) {
      for (const evento of entrada.eventos || []) {
        const coords = evento.coordenadas || evento.coord;
        if (coords && coords.lat && coords.lng) {
          console.log("📍 Primer punto encontrado:", evento.titulo, coords);
          return coords;
        }
      }
    }
  }
  return null;
}


async function renderizarRutaGeneralPorCiudades() {
  try {
    if (!window.itinerarioData || typeof window.itinerarioData !== "object") {
      console.error("❌ itinerarioData no está disponible o es inválido");
      return;
    }

    const ciudades = Object.keys(itinerarioData);
    if (ciudades.length < 2) {
      console.warn("⚠️ Se necesitan al menos dos ciudades para trazar una ruta");
      return;
    }

    const origin = ciudades[0] + ", Suiza";
    const destination = ciudades[ciudades.length - 1] + ", Suiza";
    const waypoints = ciudades.slice(1, -1).map(c => ({
      location: c + ", Suiza",
      stopover: true
    }));

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false });
    directionsRenderer.setMap(map);

    directionsService.route({
      origin,
      destination,
      waypoints,
        optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);

        // Calcular distancia total
        const legs = result.routes[0].legs;
        distanciaTotalKm = legs.reduce((acc, leg) => acc + leg.distance.value, 0) / 1000;

        const distElem = document.getElementById("resumen-km");
        if (distElem) distElem.textContent = `Distancia total: ~${Math.round(distanciaTotalKm)} km`;
      } else {
        console.error("❌ Error al trazar ruta:", status);
      }
    });
  } catch (error) {
    console.error("💥 Error inesperado al renderizar ruta general:", error);
  }
}


async function obtenerCoordenadasCiudadConCache(ciudad) {
  if (ciudadCoordsCache[ciudad]) return ciudadCoordsCache[ciudad];

  try {
    const snapshot = await firebase.database().ref("ciudadesCoords/" + ciudad).once("value");
    const data = snapshot.val();
    if (data && data.lat && data.lng) {
      ciudadCoordsCache[ciudad] = data;
      return data;
    }
  } catch (err) {
    console.warn("Firebase no respondió para:", ciudad);
  }

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(ciudad + ", Suiza")}&key=AIzaSyA8KhfGc61uBT3DHS1hiCEl7HgnFYaWySI`);
    const result = await response.json();

    if (result.status === "OK") {
      const loc = result.results[0].geometry.location;
      ciudadCoordsCache[ciudad] = loc;
      await firebase.database().ref("ciudadesCoords/" + ciudad).set(loc);
      return loc;
    } else {
      console.warn("🛑 Geocoding falló para", ciudad, "con status:", result.status);
    }
  } catch (e) {
    console.error("Error geocodificando:", ciudad, e);
  }

  return null;
}



function renderizarRutaYEventos() {
  const puntos = [];
  const marcadores = [];

  for (const [ubicacion, fechas] of Object.entries(itinerarioData)) {
    for (const [fecha, entrada] of Object.entries(fechas)) {
      for (const evento of entrada.eventos || []) {
        const coords = evento.coordenadas || evento.coord || null;
        if (!coords || !coords.lat || !coords.lng) continue;
console.log("📍 Punto con coords:", coords);
        puntos.push({
          titulo: evento.titulo,
          lat: coords.lat,
          lng: coords.lng,
          etiqueta: evento.etiquetaEvento,
          fecha,
          hora: evento.hora
        });
      }
    }
  }

  // Ordenar cronológicamente
  puntos.sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));

  // Crear ruta visual
  const rutaPath = puntos.map(p => ({ lat: p.lat, lng: p.lng }));

  if (rutaPath.length > 1) {
    new google.maps.Polyline({
      path: rutaPath,
      geodesic: true,
      strokeColor: "#2196f3",
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map
    });
  }

  // Marcar puntos con íconos
  puntos.forEach(p => {
    const icono = obtenerIconoPorEtiqueta(p.etiqueta);
    new google.maps.Marker({
      position: { lat: p.lat, lng: p.lng },
      map: map,
      title: `${p.titulo} (${p.etiqueta})`,
      icon: {
        url: icono,
        scaledSize: new google.maps.Size(28, 28)
      }
    });
  });

  if (puntos.length > 0) map.setCenter({ lat: puntos[0].lat, lng: puntos[0].lng });
}

function renderizarResumenDashboard() {
  const ubicaciones = Object.keys(itinerarioData);
  const totalCiudades = ubicaciones.length;
  let totalDias = 0;
  let totalActividades = 0;
  let totalHoteles = 0;
  let totalRestaurantes = 0;
  const eventos = [];

  ubicaciones.forEach(ubicacion => {
    const fechas = Object.keys(itinerarioData[ubicacion] || {});
    totalDias += fechas.length;

    fechas.forEach(fecha => {
      const eventosDia = itinerarioData[ubicacion][fecha]?.eventos || [];
      eventosDia.forEach(e => {
        eventos.push({ ...e, fecha, ubicacion });
        if (e.etiquetaEvento === "actividad") totalActividades++;
        if (e.etiquetaEvento === "alojamiento") totalHoteles++;
        if (e.etiquetaEvento === "comida") totalRestaurantes++;
      });
    });
  });

  document.getElementById("resumen-dias").textContent = `Días: ${totalDias}`;
  document.getElementById("resumen-ciudades").textContent = `Ciudades: ${totalCiudades}`;
  document.getElementById("resumen-actividades").textContent = `Actividades: ${totalActividades}`;
  document.getElementById("resumen-hoteles").textContent = `Hoteles: ${totalHoteles}`;
  document.getElementById("resumen-restaurantes").textContent = `Restaurantes: ${totalRestaurantes}`;

  // Solo se actualiza si renderizarRutaGeneralPorCiudades ya la calculó
  const kmElemento = document.getElementById("resumen-km");
  if (typeof distanciaTotalKm === "number") {
    kmElemento.textContent = `Distancia total: ~${Math.round(distanciaTotalKm)} km`;
  }

  const eventosPendientes = eventos.filter(e => !e.realizado && e.hora);
  eventosPendientes.sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`));

  const siguiente = eventosPendientes[0];
  if (siguiente) mostrarProximoEvento(siguiente);
}


function mostrarProximoEvento(e) {
  const cont = document.getElementById("tarjeta-proximo-evento");
  cont.innerHTML = `
    <strong>${e.titulo}</strong><br>
    ${e.fecha} - ${e.hora}<br>
    ${e.ubicacion}<br>
    <button onclick="marcarComoRealizado('${e.fecha}', '${e.hora}', '${e.titulo}')">Marcar como realizado</button>
  `;
}

function marcarComoRealizado(fecha, hora, titulo) {
  for (const ubicacion in itinerarioData) {
    if (itinerarioData[ubicacion][fecha]) {
      const eventos = itinerarioData[ubicacion][fecha].eventos;
      const evento = eventos.find(e => e.hora === hora && e.titulo === titulo);
      if (evento) {
        evento.realizado = true;
        guardarItinerarioLocal();
        guardarItinerarioFirebase();
        renderizarResumenDashboard();
        break;
      }
    }
  }
}

function obtenerIconoPorEtiqueta(etiqueta) {
  switch (etiqueta) {
    case "alojamiento": return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    case "comida": return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    case "transporte": return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
    case "atraccion": return "https://maps.google.com/mapfiles/ms/icons/purple-dot.png";
    default: return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }
}
