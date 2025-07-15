export function setupSidebarToggle() {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    toggleBtn.style.display = sidebar.classList.contains("open") ? "none" : "block";
  });
}

export function setupRadiusSlider(circle) {
  const slider = document.getElementById("radiusSlider");
  const label = document.getElementById("radiusValue");

  slider.addEventListener("input", () => {
    label.innerText = slider.value;
    circle.setRadius(parseInt(slider.value));
  });
}
