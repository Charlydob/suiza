export function getLocation(map, userMarker, circle) {
  navigator.geolocation.getCurrentPosition(pos => {
    const latlng = [pos.coords.latitude, pos.coords.longitude];
    map.setView(latlng, 15);
    userMarker.setLatLng(latlng);
    circle.setLatLng(latlng);
  }, err => {
    console.warn("No se pudo obtener ubicación, se usará centro por defecto");
  });
}
