// 📍 DASHBOARD.JS - PANTALLA INICIAL CON MAPA + RESUMEN

window.initDashboard = function () {
  console.log("🚦 initDashboard llamado");

  // Esperar hasta que itinerarioData tenga contenido real
  const intentarCargarDashboard = () => {
    if (!itinerarioData || Object.keys(itinerarioData).length === 0) {
      console.log("⏳ Esperando itinerarioData...");
      setTimeout(intentarCargarDashboard, 300); // reintenta en 300ms
      return;
    }

    console.log("✅ itinerarioData cargado:", itinerarioData);
    initMap(46.8182, 8.2275, "mapa-dashboard");
    renderizarRutaYEventos();
    renderizarResumenDashboard();
  };

  intentarCargarDashboard();
};



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
  document.getElementById("resumen-dias").textContent = `Días: ${ubicaciones.length}`;

  let totalActividades = 0;
  let totalHoteles = 0;
  let totalRestaurantes = 0;
  const eventos = [];

  ubicaciones.forEach(ubicacion => {
    const fechas = Object.keys(itinerarioData[ubicacion] || {});
    fechas.forEach(fecha => {
      const eventosDia = itinerarioData[ubicacion][fecha]?.eventos || [];
      eventosDia.forEach(e => {
        eventos.push({ ...e, fecha, ubicacion });
        totalActividades++;
        if (e.etiquetaEvento === "alojamiento") totalHoteles++;
        if (e.etiquetaEvento === "comida") totalRestaurantes++;
      });
    });
  });

  document.getElementById("resumen-actividades").textContent = `Actividades: ${totalActividades}`;
  document.getElementById("resumen-hoteles").textContent = `Hoteles: ${totalHoteles}`;
  document.getElementById("resumen-restaurantes").textContent = `Restaurantes: ${totalRestaurantes}`;
  document.getElementById("resumen-km").textContent = `Distancia total: ~${ubicaciones.length * 15} km`;

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
