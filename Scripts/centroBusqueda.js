// centroBusqueda.js
export function iniciarCentroBusqueda(mapa) {
  let marcadorBusqueda = null;
  let circuloBusqueda = null;
  let coordenadasBusqueda = null;

  const centroGuardado = localStorage.getItem("centroBusqueda");
  if (centroGuardado) {
    coordenadasBusqueda = JSON.parse(centroGuardado);
    colocarMarcador(coordenadasBusqueda.lat, coordenadasBusqueda.lon);
  }

  const controlDiv = document.createElement("div");
  controlDiv.style.backgroundColor = "#fff";
  controlDiv.style.border = "2px solid #ccc";
  controlDiv.style.borderRadius = "3px";
  controlDiv.style.margin = "10px";
  controlDiv.style.cursor = "pointer";
  controlDiv.style.padding = "6px";
  controlDiv.title = "Mover centro de búsqueda";
  controlDiv.innerText = "🎯";

  controlDiv.addEventListener("click", () => {
    alert("Haz clic en el mapa para mover el centro de búsqueda.");
    const clickListener = mapa.addListener("click", (e) => {
      const { latLng } = e;
      coordenadasBusqueda = {
        lat: latLng.lat(),
        lon: latLng.lng()
      };
      localStorage.setItem("centroBusqueda", JSON.stringify(coordenadasBusqueda));
      colocarMarcador(coordenadasBusqueda.lat, coordenadasBusqueda.lon);
      google.maps.event.removeListener(clickListener); // quita listener tras un solo clic
    });
  });

  mapa.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);

  function colocarMarcador(lat, lon) {
    if (marcadorBusqueda) marcadorBusqueda.setMap(null);
    if (circuloBusqueda) circuloBusqueda.setMap(null);

    marcadorBusqueda = new google.maps.Marker({
      position: { lat, lng: lon },
      map: mapa,
      title: "Centro de búsqueda",
      draggable: true,
    });

    circuloBusqueda = new google.maps.Circle({
      strokeColor: "#3388ff",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#3388ff",
      fillOpacity: 0.2,
      map: mapa,
      center: { lat, lng: lon },
      radius: 3000,
    });

    marcadorBusqueda.addListener("dragend", function (e) {
      const newPos = e.latLng;
      coordenadasBusqueda = {
        lat: newPos.lat(),
        lon: newPos.lng()
      };
      localStorage.setItem("centroBusqueda", JSON.stringify(coordenadasBusqueda));
      colocarMarcador(coordenadasBusqueda.lat, coordenadasBusqueda.lon); // Redibuja todo
    });
  }

  return {
    getCentroBusqueda: () => coordenadasBusqueda,
  };
}
