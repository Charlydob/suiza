// idioma.js

let idiomaBusqueda = "en"; // idioma por defecto

function detectarIdiomaLocal(coords) {
  if (!coords || coords.length !== 2) return "en"; // fallback por si algo falla

  const [lat, lng] = coords;
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === "OK" && results[0]) {
      const components = results[0].address_components;
      let pais = "";
      let canton = "";

      components.forEach(c => {
        if (c.types.includes("country")) pais = c.short_name;
        if (c.types.includes("administrative_area_level_1")) canton = c.long_name;
      });

      idiomaBusqueda = determinarIdioma(pais, canton);
      console.log("🌍 Idioma detectado:", idiomaBusqueda);
    } else {
      console.warn("No se pudo determinar el idioma, usando inglés.");
      idiomaBusqueda = "en";
    }
  });
}

function determinarIdioma(pais, canton) {
  // Unificación de idiomas
  const cantonesAlemán = [
    "Zürich", "Bern", "Luzern", "Uri", "Schwyz", "Obwalden", "Nidwalden", "Glarus",
    "Zug", "Solothurn", "Schaffhausen", "Aargau", "Thurgau", "St. Gallen", "Appenzell Ausserrhoden", "Appenzell Innerrhoden"
  ];
  const cantonesFrancés = ["Genève", "Vaud", "Neuchâtel", "Jura"];
  const cantonesItaliano = ["Ticino"];

  if (pais === "CH") {
    if (cantonesAlemán.includes(canton)) return "de";
    if (cantonesFrancés.includes(canton)) return "fr";
    if (cantonesItaliano.includes(canton)) return "it";
    return "de"; // fallback suizo si no se reconoce el cantón
  }

  if (pais === "DE" || pais === "AT") return "de";
  if (pais === "FR") return "fr";
  if (pais === "IT") return "it";
  if (pais === "BE" || pais === "LU") return "fr";
  if (pais === "LI") return "de";
  if (pais === "US" || pais === "GB") return "en";

  return "en"; // idioma universal por defecto
}

// Devuelve un string de idiomas para la búsqueda: local + inglés
function obtenerIdiomasParaBusqueda() {
  return [idiomaBusqueda, "en"];
}
let diccionarioKeywords = {};

fetch('json/traducciones.json')
  .then(response => response.json())
  .then(data => {
    diccionarioKeywords = data;
  })
  .catch(error => {
    console.error("Error cargando traducciones:", error);
  });

function traducirKeyword(keyword, idioma) {
  const palabrasTraducidas = new Set();

  return keyword
    .split(" ")
    .flatMap(palabra => {
      const excluye = palabra.startsWith("-");
      const limpio = palabra.replace(/^-/, "");
      const traducido = diccionarioKeywords[limpio]?.[idioma];

      const originales = [limpio];
      if (traducido && traducido !== limpio) originales.push(traducido);

      return originales.map(p => {
        const clave = excluye ? `-${p}` : p;
        if (!palabrasTraducidas.has(clave)) {
          palabrasTraducidas.add(clave);
          return clave;
        }
        return null;
      }).filter(Boolean);
    })
    .join(" ");
}
function construirKeywords(texto, idioma) {
  var palabras = texto.split(/\s+/);
  var resultado = new Set();

  for (var i = 0; i < palabras.length; i++) {
    var palabra = palabras[i];
    var tieneGuion = palabra.startsWith('-');
    var clave = tieneGuion ? palabra.substring(1) : palabra;

    // Añadir original
    resultado.add(palabra);

    // Añadir traducción si existe
    var traducciones = diccionarioKeywords[clave];
    if (traducciones && traducciones[idioma]) {
      var traducida = traducciones[idioma];
      if (tieneGuion) traducida = '-' + traducida;
      resultado.add(traducida);
    }
  }

  return Array.from(resultado).join(' ');
}
