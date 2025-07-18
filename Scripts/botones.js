function PopupPersonalizado(latLng, contentHTML) {
  this.latLng = latLng;
  this.container = document.createElement("div");
  this.container.className = "popup-personalizado";
  this.container.innerHTML = contentHTML;

  // Estilo básico y posicionamiento inicial
  this.container.style.position = "absolute";
  this.container.style.transform = "translate(-50%, -100%)";

  document.getElementById("map").appendChild(this.container); // O el contenedor absoluto de tu mapa

  this.updatePosition();
}

PopupPersonalizado.prototype.updatePosition = function () {
  const projection = map.getProjection();
  if (!projection) return;

  const point = projection.fromLatLngToPoint(this.latLng);
  const scale = Math.pow(2, map.getZoom());
  const worldCoordinate = new google.maps.Point(
    point.x * scale,
    point.y * scale
  );

  this.container.style.left = `${worldCoordinate.x}px`;
  this.container.style.top = `${worldCoordinate.y}px`;
};

PopupPersonalizado.prototype.remove = function () {
  if (this.container && this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
};


PopupPersonalizado.prototype = Object.create(google.maps.OverlayView.prototype);
PopupPersonalizado.prototype.constructor = PopupPersonalizado;

PopupPersonalizado.prototype.onAdd = function () {
  this.getPanes().floatPane.appendChild(this.container);
};

PopupPersonalizado.prototype.draw = function () {
  const projection = this.getProjection();
  const point = projection.fromLatLngToDivPixel(this.position);
  if (point) {
    this.container.style.left = point.x + 'px';
    this.container.style.top = point.y + 'px';
  }
};

PopupPersonalizado.prototype.onRemove = function () {
  if (this.container.parentNode) {
    this.container.parentNode.removeChild(this.container);
  }
};

var popupActual = null;

//❌======== CALCULAR DISTANCIAS 👇 ======== //
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
//❌======== CALCULAR DISTANCIAS 👆 ======== //
function ignorarLugar(id, marker) {
  if (!ignorados.includes(id)) {
    ignorados.push(id);
    guardarIgnorados();
  }
  if (marker && typeof marker.setMap === "function") {
    marker.setMap(null);
  }
  if (popupActual && typeof popupActual.close === "function") {
    popupActual.close();
  }
}


// 👇 Esto lo hace visible desde cualquier HTML onclick
window.ignorarLugar = ignorarLugar;


//🔎 Busca lugares de un tipo concreto cerca del usuario usando Google Maps Places API
async function buscar(tipo) {
  const usarTextSearchDirecto = ["tourism", "sitios_bonitos", "hotel", "airbnb", "restaurant", "cafe"];

  try {
    const tipoGooglePlaces = {
    sitios_bonitos: [
  // 🏔️ Montañas
  { type: "", keyword: "mountain montagne montaña berg monte" },
  // 🌊 Lagos
  { type: "", keyword: "lake lac lago see" },
  // 🏞️ Ríos
  { type: "", keyword: "river rivière río fluss" },
  // 🔭 Miradores y vistas
  { type: "", keyword: "viewpoint mirador belvédère aussichtspunkt punto panorámico" },
  // 🌲 Bosques
  { type: "", keyword: "forest forêt bosque wald foresta" },
  // 🌳 Parques (sí tiene type específico útil)
  { type: "park", keyword: "" },
  // 💧 Cascadas
  { type: "", keyword: "waterfall cascada wasserfall chute d'eau" },
  // 🥾 Senderos naturales
  { type: "", keyword: "hiking trail senderismo randonnée wanderweg percorso escursionistico" },
  // 🌄 Paisaje bonito / naturaleza
  { type: "", keyword: "scenic view paisaje natural vista naturaleza landschaft" }
],

      hotel: [
  { type: "", keyword: "hotel hôtel gasthof" }
],
airbnb: [
  { type: "", keyword: "apartment airbnb homestay guesthouse ferienwohnung" }
],
      luggage: {
        type: "",
        keyword: "locker in the city Lockerpoint BagStop luggage storage consigna Luggage Storage Europe LuggageHero Bounce Stasher City Locker BagsAway Nannybag Radical Storage Bagbnb BAGGAGE NANNY Lock&Go SBB lockers Eelway Schliessfächer consigne à bagages guardaroba"
      },
      parking: {
        type: "parking",
        keyword: "car car public"
      },
      airport: {
        type: "airport",
        keyword: ""
      },
      gasolinera: {
        type: "gas_station",
        keyword: ""
      },
      tourism: [
  { type: "museum", keyword: "" },
  { type: "", keyword: "museum musée museo museumo museu" },
{ type: "art_gallery", keyword: "" },
{ type: "", keyword: "galerie galleria gallery" },
  { type: "", keyword: "monument" },
  { type: "", keyword: "historic site" },
{ type: "", keyword: "castle château castello schloss" },
  { type: "", keyword: "colosseum" },
],
restaurant: [
  { type: "", keyword: "restaurant food comida essen fast food pizza burger" },
  { type: "", keyword: "mcdonalds subway kfc burger king" },
  { type: "", keyword: "coop migros tibits vapiano nordsee spiga" }
],
cafe: [
  { type: "", keyword: "coffee tea café kaffee breakfast brunch espresso" },
  { type: "", keyword: "sprüngli vicafe bachmann schwarz grindel bohnenblust trestle henrici blackbird" }
],
      hospital: {
        type: "hospital",
        keyword: ""
      }
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

const mostrarResultados = (tipo, results) => {
if (!markersPorTipo[tipo]) markersPorTipo[tipo] = [];


  results.forEach(function (place) {
    const pos = place.geometry.location;
    const name = place.name;
    const idUnico = tipo + "_" + pos.lat().toFixed(5) + "_" + pos.lng().toFixed(5);
    if (ignorados.indexOf(idUnico) !== -1) return;

    const distanciaKm = calcularDistancia(currentCoords[0], currentCoords[1], pos.lat(), pos.lng());
    if (distanciaKm > radius / 1000) return;

    const tiempoCocheMin = Math.round((distanciaKm / 60) * 60);
    const tiempoPieMin = Math.round((distanciaKm / 5) * 60);

    const tiempoCoche = tiempoCocheMin >= 60
      ? `${(tiempoCocheMin / 60).toFixed(1)} h en coche`
      : `${tiempoCocheMin} min en coche`;

    const tiempoPie = tiempoPieMin >= 60
      ? `${(tiempoPieMin / 60).toFixed(1)} h a pie`
      : `${tiempoPieMin} min a pie`;

    const marker = new google.maps.Marker({
      position: pos,
      map: map,
      title: name,
      icon: iconos[tipo] || undefined
    });

    const popupHTML = `
      <div class="popup-personalizado">
        <b>${name}</b><br>
        Distancia: ${distanciaKm.toFixed(1)} km<br>
        ${tiempoCoche} | ${tiempoPie}<br>

        <div class="grupo-botones-arriba">
          <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${pos.lat()},${pos.lng()}&travelmode=driving', '_blank')">🧭 Cómo llegar</button>
          <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${pos.lat()},${pos.lng()}', '_blank')">🔍 Ver este sitio</button>
        </div>

        <div class="grupo-botones-abajo">
          <button onclick="toggleFavorito('${idUnico}', '${tipo}', [${pos.lat()}, ${pos.lng()}], '${name.replace(/'/g, "\\'")}', this)">☆ Añadir a favoritos</button>
          <button onclick="ignorarLugar('${idUnico}', window.__marcadorActivo)">✘ Ignorar</button>
        </div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({ content: popupHTML });

    marker.addListener("click", () => {
      if (popupActual && popupActual.__vinculado === marker) {
        popupActual.close();
        popupActual = null;
        return;
      }
      if (popupActual) popupActual.close();

      infoWindow.open(map, marker);
      infoWindow.__vinculado = marker;
      popupActual = infoWindow;
    });

    markersPorTipo[tipo].push(marker);
  });
};

const ejecutarBusqueda = (subTipo) => {
  return new Promise((resolve) => {
    const usarSoloTextSearch = usarTextSearchDirecto.includes(tipo);

    if (usarSoloTextSearch && subTipo.keyword) {
      // 🔁 Forzamos textSearch directamente
      service.textSearch({ location: centro, radius: radius, query: subTipo.keyword }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
          mostrarResultados(tipo, results);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } else {
      // 🧪 Primero nearbySearch, luego fallback a textSearch si falla
      const request = {
        location: centro,
        radius: radius,
        keyword: subTipo.keyword
      };
      if (subTipo.type) request.type = subTipo.type;

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
          mostrarResultados(tipo, results);
          resolve(true);
        } else if (subTipo.keyword) {
          service.textSearch({ location: centro, radius: radius, query: subTipo.keyword }, (results2, status2) => {
            if (status2 === google.maps.places.PlacesServiceStatus.OK && results2?.length) {
              mostrarResultados(tipo, results2);
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    }
  });
};


if (Array.isArray(configTipo)) {
  const promesas = configTipo.map(sub => ejecutarBusqueda(sub));
  Promise.all(promesas).then(() => {
    const total = markersPorTipo[tipo]?.length || 0;
    document.getElementById("status").innerText = total
      ? `Mostrando ${total} resultados para ${tipo}`
      : `No se encontraron resultados para ${tipo}`;
  });
} else {
  ejecutarBusqueda(configTipo).then(success => {
    const total = markersPorTipo[tipo]?.length || 0;
    document.getElementById("status").innerText = total
      ? `Mostrando ${total} resultados para ${tipo}`
      : `No se encontraron resultados para ${tipo}`;
  });
}


  } catch (error) {
    reportarError(error);
    document.getElementById("status").innerText = `Hubo un error al buscar ${tipo}`;
  }
}


// ignorados
function guardarIgnorados() {
  // 🔄 Guardar en localStorage
  localStorage.setItem("lugaresIgnorados", JSON.stringify(ignorados));
  // 🔄 Guardar también en Firebase si hay conexión
  if (navigator.onLine && typeof db !== "undefined") {
    const ref = db.ref(rutaIgnorados);
    ref.set(ignorados)
      .then(() => console.log("✅ Lista de ignorados actualizada en Firebase"))
      .catch(err => console.error("Error guardando ignorados en Firebase:", err));
  }
}

//✅======== INTERFAZ: BOTONES DE FILTRADO 👇 ======== //
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
//✅======== LIMPIEZA DEL MAPA 👇 ======== //
// 🧼 Limpia todos los marcadores y resetea el estado
function clearAll() {
  Object.keys(markersPorTipo).forEach(tipo => {
    markersPorTipo[tipo].forEach(m => m.setMap(null)); // ← Google Maps
    markersPorTipo[tipo] = [];
    tipoActivo[tipo] = false;

    const boton = document.getElementById(`btn-${tipo}`);
    if (boton) {
      boton.classList.remove("activo");
      boton.classList.add("inactivo");
    }
  });

  if (typeof marcadoresFavoritos !== "undefined") {
    marcadoresFavoritos.forEach(m => m.setMap(null));
    marcadoresFavoritos = [];
  }

  document.getElementById("status").innerText = "Mapa limpio";
}
//✅======== LIMPIEZA DEL MAPA 👆 ======== //
window.clearAll = clearAll;
window.toggleTipo = toggleTipo;