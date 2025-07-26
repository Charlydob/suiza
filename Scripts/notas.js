let notas = {};

function cargarNotasFirebase() {
  if (!navigator.onLine || typeof db === "undefined") return;
  db.ref("notas").once("value")
    .then(snapshot => {
      notas = snapshot.val() || {};
      renderizarNotas();
    })
    .catch(err => console.error("❌ Error al cargar notas:", err));
}

function guardarNota() {
  const texto = document.getElementById("nuevaNotaTexto").value.trim();
  const etiqueta = document.getElementById("nuevaNotaEtiqueta").value;
  if (!texto) return;

  const id = Date.now().toString();
  notas[id] = { texto, etiqueta };
  db.ref("notas").set(notas)
    .then(() => {
      document.getElementById("nuevaNotaTexto").value = "";
      renderizarNotas();
    });
}

function eliminarNota(id) {
  delete notas[id];
  db.ref("notas").set(notas).then(renderizarNotas);
}

function renderizarNotas() {
  const contenedor = document.getElementById("lista-notas");
  const filtro = document.getElementById("filtroEtiquetaNotas").value;
  const busqueda = document.getElementById("buscadorNotas").value.toLowerCase();
  contenedor.innerHTML = "";

  Object.entries(notas)
    .filter(([_, nota]) =>
      (!filtro || nota.etiqueta === filtro) &&
      (!busqueda || nota.texto.toLowerCase().includes(busqueda))
    )
    .forEach(([id, nota]) => {
      const div = document.createElement("div");
      div.className = "nota";
      div.innerHTML = `
        <p>${nota.texto}</p>
        <small>${nota.etiqueta || "Sin ubicación"}</small>
        <button onclick="eliminarNota('${id}')">❌</button>
      `;
      contenedor.appendChild(div);
    });
}

function actualizarSelectUbicacionesNotas() {
  const selectFiltro = document.getElementById("filtroEtiquetaNotas");
  const selectNueva = document.getElementById("nuevaNotaEtiqueta");

  const ubicaciones = Object.keys(itinerarioData || {}).sort();

  selectFiltro.innerHTML = `<option value="">Todas las ubicaciones</option>`;
  selectNueva.innerHTML = `<option value="">Sin ubicación</option>`;

  ubicaciones.forEach(ubicacion => {
    const option1 = document.createElement("option");
    option1.value = ubicacion;
    option1.textContent = ubicacion;
    selectFiltro.appendChild(option1);

    const option2 = option1.cloneNode(true);
    selectNueva.appendChild(option2);
  });
}

// Actualiza filtros al escribir o cambiar select
document.getElementById("buscadorNotas").addEventListener("input", renderizarNotas);
document.getElementById("filtroEtiquetaNotas").addEventListener("change", renderizarNotas);

// Cargar notas cuando itinerario esté listo
window.addEventListener("DOMContentLoaded", () => {
  const check = setInterval(() => {
    if (typeof itinerarioData === "object") {
      actualizarSelectUbicacionesNotas();
      cargarNotasFirebase();
      clearInterval(check);
    }
  }, 500);
});
