(function () {
  // Verificamos que Leaflet y el mapa existen
  if (typeof L === "undefined" || typeof map === "undefined") {
    console.error("Leaflet o el mapa principal no están definidos.");
    return;
  }

  // Creamos marcador y círculo como variables internas
  let marcadorBusqueda = null;
  let circuloBusqueda = null;

  // Intentamos cargar el centro guardado
  let coordenadasBusqueda = null;
  const centroGuardado = localStorage.getItem("centroBusqueda");
  if (centroGuardado) {
    coordenadasBusqueda = JSON.parse(centroGuardado);
    colocarMarcador(coordenadasBusqueda.lat, coordenadasBusqueda.lon);
  }

  // Creamos botón en pantalla
  const boton = L.control({ position: "topright" });
  boton.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-bar");
    div.innerHTML = '<a href="#" title="Mover centro de búsqueda">🎯</a>';
    div.style.background = "white";
    div.style.padding = "5px";
    div.style.cursor = "pointer";
    div.onclick = () => {
      map.once("click", function (e) {
        const { lat, lng } = e.latlng;
        coordenadasBusqueda = { lat, lon: lng };
        localStorage.setItem("centroBusqueda", JSON.stringify(coordenadasBusqueda));
        colocarMarcador(lat, lng);
      });
      alert("Haz clic en el mapa para mover el centro de búsqueda.");
    };
    return div;
  };
  boton.addTo(map);

  // Dibuja o actualiza el marcador
  function colocarMarcador(lat, lon) {
    if (marcadorBusqueda) map.removeLayer(marcadorBusqueda);
    if (circuloBusqueda) map.removeLayer(circuloBusqueda);

    marcadorBusqueda = L.marker([lat, lon], {
      draggable: true,
      title: "Centro de búsqueda",
    }).addTo(map);

    circuloBusqueda = L.circle([lat, lon], {
      radius: 3000,
      color: "#3388ff",
      fillOpacity: 0.2,
    }).addTo(map);

    marcadorBusqueda.on("dragend", function (e) {
      const { lat, lng } = e.target.getLatLng();
      coordenadasBusqueda = { lat, lon: lng };
      localStorage.setItem("centroBusqueda", JSON.stringify(coordenadasBusqueda));
      colocarMarcador(lat, lng); // Redibuja todo
    });
  }

  // Expone coordenadas al resto del proyecto si lo necesitan
  window.getCentroBusqueda = function () {
    return coordenadasBusqueda;
  };
})();
