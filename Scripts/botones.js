//🔎 Busca lugares de un tipo concreto cerca del usuario usando Google Maps Places API
async function buscar(tipo) {
  const tipoGooglePlaces = {
    camping: { type: "campground", keyword: "" },
    hotel: { type: "lodging", keyword: "hotel" },
    airbnb: { type: "lodging", keyword: "apartment airbnb" }, // No es oficial, pero afina
    luggage: { type: "store", keyword: "locker luggage" }, // No existe tipo exacto, usamos keyword
    parking: { type: "parking", keyword: "" },
    airport: { type: "airport", keyword: "" },
    tourism: { type: "tourist_attraction", keyword: "viewpoint museum gallery" },
    restaurant: { type: "restaurant", keyword: "" },
    cafe: { type: "cafe", keyword: "-starbucks" }, // filtramos Starbucks con keyword negativa
    hospital: { type: "hospital", keyword: "" }
  };

  if (!currentCoords) return;

  const centro = window.getCentroBusqueda?.() || { lat: currentCoords[0], lng: currentCoords[1] };
  const radius = parseInt(document.getElementById("radiusSlider").value);

  const service = new google.maps.places.PlacesService(map);
  const configTipo = tipoGooglePlaces[tipo];
  if (!configTipo) {
    document.getElementById("status").innerText = `Este tipo no está disponible con Google Maps`;
    return;
  }

  // 📦 Configuración del request para la API
  const request = {
    location: centro,              // 📍 Coordenadas desde donde buscar
    radius: radius,               // 📏 Distancia en metros (máx 50.000)
    type: configTipo.type,        // 🧩 Tipo oficial de lugar, ej: 'restaurant', 'lodging'
    keyword: configTipo.keyword,  // 🔎 Palabra clave para afinar resultados (opcional)
    // name: "nombre",            // 🏷️ Si quieres buscar lugares con un nombre exacto
    // minPriceLevel: 0,          // 💰 0 (barato) a 4 (caro)
    // maxPriceLevel: 4,
    // openNow: true,             // ⏰ Solo lugares abiertos ahora
    // rankBy: google.maps.places.RankBy.PROMINENCE, // o DISTANCE (requiere omitir radius)
    // language: "es"             // 🌐 Idioma de los resultados
  };

  service.nearbySearch(request, (results, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
      document.getElementById("status").innerText = `No se encontraron resultados para ${tipo}`;
      return;
    }

    // 🧹 Limpia marcadores anteriores de ese tipo
    markersPorTipo[tipo].forEach(m => m.setMap(null));
    markersPorTipo[tipo] = [];

    results.forEach(place => {
      const pos = place.geometry.location;
      const name = place.name;
      const idUnico = `${tipo}_${pos.lat().toFixed(5)}_${pos.lng().toFixed(5)}`;
      if (ignorados.includes(idUnico)) return;

      const distanciaKm = calcularDistancia(currentCoords[0], currentCoords[1], pos.lat(), pos.lng());
      const tiempoCoche = Math.round((distanciaKm / 60) * 60);
      const tiempoPie = Math.round((distanciaKm / 5) * 60);

      const popupHTML = `
        <div class="popup-personalizado">
          <b>${name}</b><br>
          Distancia: ${distanciaKm.toFixed(1)} km<br>
          ${tiempoCoche} min en coche | ${tiempoPie} min a pie<br>
          <div class="grupo-botones-abajo">
            <button onclick="toggleFavorito('${idUnico}', '${tipo}', [${pos.lat()}, ${pos.lng()}], '${name.replace(/'/g, "\\'")}', this)">
              ${favoritos.includes(idUnico) ? "⭐" : "☆"} Favorito
            </button>
            <button onclick="ignorarLugar('${idUnico}')">🗑️ Ignorar</button>
          </div>
        </div>
      `;

      const marker = new google.maps.Marker({
        position: pos,
        map,
        title: name,
        icon: iconos[tipo] || undefined
      });

      const infowindow = new google.maps.InfoWindow({ content: popupHTML });
      marker.addListener("click", () => infowindow.open(map, marker));
      markersPorTipo[tipo].push(marker);
    });

    document.getElementById("status").innerText = `Mostrando ${results.length} resultados para ${tipo}`;
  });
}


//✅======== INTERFAZ: BOTONES DE FILTRADO 👇 ======== //
// 🎚️ Activa o desactiva un tipo de lugar (botones de filtros)
function toggleTipo(tipo) {
  tipoActivo[tipo] = !tipoActivo[tipo];
  const boton = document.getElementById(`btn-${tipo}`);

  if (tipoActivo[tipo]) {
    boton.classList.add("activo");
    boton.classList.remove("inactivo");

    if (tipo === "favoritos") {
      mostrarMarcadoresFavoritos();
    } else {
      buscar(tipo);
    }
  } else {
    boton.classList.remove("activo");
    boton.classList.add("inactivo");

    if (tipo === "favoritos") {
      marcadoresFavoritos.forEach(m => m.setMap(null));
      marcadoresFavoritos = [];
    } else {
      markersPorTipo[tipo].forEach(m => m.setMap(null));
      markersPorTipo[tipo] = [];
    }

    document.getElementById("status").innerText = `Ocultando ${tipo}`;
  }
}
//✅======== INTERFAZ: BOTONES DE FILTRADO 👆 ======== //

