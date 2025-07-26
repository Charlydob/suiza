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

async function guardarNota() {
  const texto = document.getElementById("nuevaNotaTexto").value.trim();
  const etiqueta = document.getElementById("nuevaNotaEtiqueta").value;
  const urlImagen = document.getElementById("nuevaNotaURL").value;

  if (!texto && !urlImagen) return;

  const id = Date.now().toString();
  notas[id] = { texto, etiqueta, imagen: urlImagen || "" };

  await db.ref("notas").set(notas);

  document.getElementById("nuevaNotaTexto").value = "";
  document.getElementById("nuevaNotaImagen").value = "";
  document.getElementById("nuevaNotaURL").value = "";

  renderizarNotas();
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
        ${nota.imagen ? `<img src="${nota.imagen}" class="img-nota">` : ""}
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

function subirImagenNota(input) {
  const archivo = input.files[0];
  if (!archivo) return;

  const cloudName = "dgdavibcx";
  const uploadPreset = "publico";

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", uploadPreset);

  fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.secure_url) {
        console.log("✅ Imagen subida:", data.secure_url);
        document.getElementById("nuevaNotaURL").value = data.secure_url;
      } else {
        console.error("❌ Fallo en subida:", data);
        alert("Error al subir la imagen.");
      }
    })
    .catch(err => {
      console.error("❌ Error al conectar con Cloudinary:", err);
      alert("Error al subir la imagen.");
    });
}
