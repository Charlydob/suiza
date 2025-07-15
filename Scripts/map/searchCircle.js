export function addSearchCircle(map) {
  const circle = L.circle([0, 0], {
    radius: 1000,
    className: 'search-radius'
  }).addTo(map);
  return circle;
}

export function updateSearchCircle(circle, latlng, radius) {
  circle.setLatLng(latlng);
  circle.setRadius(radius);
}
