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
let tipoGooglePlaces = {};

function cargarTipoGooglePlaces() {
  return fetch('json/tipoGooglePlaces.json')
    .then(res => res.json())
    .then(data => {
      tipoGooglePlaces = data;
    });
}

//🔎 Busca lugares de un tipo concreto cerca del usuario usando Google Maps Places API
async function buscar(tipo) {
  try {
    if (!currentCoords) return;
    const configTipo = tipoGooglePlaces[tipo];
    if (!configTipo) {
  console.warn("Tipo no encontrado en tipoGooglePlaces:", tipo);
  console.log("tipoGooglePlaces disponible:", tipoGooglePlaces);
  document.getElementById("status").innerText = `Este tipo no está disponible con Google Maps`;
  document.getElementById("idiomaBusqueda").innerText = "";
  return;
}


    const centro = window.getCentroBusqueda?.() || { lat: currentCoords[0], lng: currentCoords[1] };
    const radius = parseInt(document.getElementById("radiusSlider").value);
    const service = new google.maps.places.PlacesService(map);

    // Solo idioma local
    const idiomaLocal = obtenerIdiomaLocal(); // debe devolver por ejemplo 'es'
    document.getElementById("idiomaBusqueda").innerText = `Buscando en: ${idiomaLocal.toUpperCase()}`;
const palabras = configTipo.keyword.split(/\s+/);
const resultado = [];

for (let i = 0; i < palabras.length; i++) {
  let palabra = palabras[i];
  let tieneGuion = palabra.startsWith("-");
  let clave = tieneGuion ? palabra.substring(1) : palabra;

  let traducciones = diccionarioKeywords[clave];
  if (traducciones && traducciones[idiomaLocal]) {
    let traducida = traducciones[idiomaLocal];
    if (tieneGuion) traducida = "-" + traducida;
    resultado.push(traducida);
  }
}

// Solo traducciones al idioma local
const keywordsCombinados = resultado.join(" ");


    const request = {
      location: centro,
      radius: radius,
      type: configTipo.type,
      keyword: keywordsCombinados
    };

    service.nearbySearch(request, (results, status) => {
      try {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
          document.getElementById("status").innerText = `No se encontraron resultados para ${tipo}`;
          return;
        }

        (markersPorTipo[tipo] ||= []).forEach(m => m.setMap(null));
        markersPorTipo[tipo] = [];

        results.forEach(place => {
          const pos = place.geometry.location;
          const name = place.name;
          const idUnico = `${tipo}_${pos.lat().toFixed(5)}_${pos.lng().toFixed(5)}`;
          if (ignorados.includes(idUnico)) return;

          const distanciaKm = calcularDistancia(currentCoords[0], currentCoords[1], pos.lat(), pos.lng());
          if (distanciaKm > radius / 1000) return;

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

        document.getElementById("status").innerText = `Mostrando ${markersPorTipo[tipo].length} resultados para ${tipo}`;
      } catch (err) {
        reportarError(err);
      }
    });

  } catch (error) {
    reportarError(error);
    document.getElementById("status").innerText = `Hubo un error al buscar ${tipo}`;
  }
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

