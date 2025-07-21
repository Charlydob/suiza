// JS DE ITINERARIO
const usuarioId = "charlyylaura"; // en el futuro esto podría ser un usuario real
window.rutaItinerario = `itinerario/${usuarioId}`;

(function() {
  const contenedorUbicaciones = document.getElementById("contenedor-ubicaciones-itinerario");
  const botonNuevaUbicacion = document.getElementById("btn-nueva-ubicacion");
  const modalFondo = document.getElementById("modal-fondo");
  const modalContenido = document.getElementById("modal-contenido");

  function mostrarModal(html) {
    modalContenido.innerHTML = html;
    modalFondo.style.display = "flex";
  }
  window.mostrarModal = mostrarModal;

  function cerrarModal() {
    modalFondo.style.display = "none";
    modalContenido.innerHTML = "";
  }
  window.cerrarModal = cerrarModal;

  function crearUbicacion(nombreUbicacion) {
    const template = document.getElementById("template-ubicacion").content.cloneNode(true);
    template.querySelector(".titulo-ubicacion").textContent = nombreUbicacion;

    const seccion = template.querySelector(".seccion-ubicacion");
    const contenedorDias = template.querySelector(".contenedor-dias");
    const btnAgregarDia = template.querySelector(".btn-agregar-dia");

    btnAgregarDia.addEventListener("click", () => mostrarFormularioDia(contenedorDias));

    contenedorUbicaciones.appendChild(template);

    console.log("✅ Se creó una ubicación:", nombreUbicacion);
    guardarItinerarioLocal();
guardarItinerarioFirebase();

    return seccion;
  }
  window.crearUbicacion = crearUbicacion;

  botonNuevaUbicacion.addEventListener("click", () => {
    mostrarModal(`
      <div class="modal-formulario">
    <h3>¿Dónde empezamos?</h3>
    <input type="text" id="input-nueva-ubicacion" placeholder="Introduce una ubicación">
    <div>
      <button onclick="guardarNuevaUbicacion()">Crear</button>
      <button onclick="cerrarModal()">Cancelar</button>
    </div>
  </div>
    `);
  });

function guardarNuevaUbicacion() {
  const input = document.getElementById("input-nueva-ubicacion");
  const nombre = input.value.trim();
  if (nombre) {
    crearUbicacion(nombre);
    // Inicializamos en itinerarioData con clave segura
    if (!itinerarioData[nombre]) {
      itinerarioData[nombre] = { eventos: [] };
    }
    guardarItinerarioLocal();
    guardarItinerarioFirebase();
    cerrarModal();
  } else {
    alert("Introduce un nombre válido.");
  }
}
window.guardarNuevaUbicacion = guardarNuevaUbicacion;


  function mostrarFormularioDia(contenedorDias) {
    mostrarModal(`
      <div class="modal-formulario">
    <h3>¿Qué día?</h3>
    <input type="date" id="input-nuevo-dia">
    <div>
      <button onclick="guardarNuevoDia()">Guardar</button>
      <button onclick="cerrarModal()">Cancelar</button>
    </div>
  </div>
    `);
    window._contenedorDiasActual = contenedorDias;
  }

function guardarNuevoDia() {
  const fecha = document.getElementById("input-nuevo-dia").value;
  if (fecha) {
    const contenedor = window._contenedorDiasActual;
    const template = document.getElementById("template-dia").content.cloneNode(true);
    template.querySelector(".titulo-dia").textContent = fecha;

    const btnAgregarEvento = template.querySelector(".btn-agregar-evento");
    const carousel = template.querySelector(".carousel-dia");

    btnAgregarEvento.addEventListener("click", () => mostrarFormularioEvento(carousel));

    contenedor.appendChild(template);

    // Actualizar estructura de datos
    if (!itinerarioData[fecha]) {
      itinerarioData[fecha] = { eventos: [] };
    }

    guardarItinerarioLocal();
    guardarItinerarioFirebase();

    cerrarModal();

    console.log("📅 Día creado:", fecha);
  } else {
    alert("Selecciona una fecha válida.");
  }
}
window.guardarNuevoDia = guardarNuevoDia;


  function mostrarFormularioEvento(carousel) {
    mostrarModal(`
      <div class="modal-formulario">
    <h3>¿Qué deseas añadir?</h3>
    <select id="selector-tipo">
      <option value="evento">Evento</option>
      <option value="favorito">Favorito</option>
    </select>
    <div>
      <button onclick="seleccionarTipoEvento()">Continuar</button>
      <button onclick="cerrarModal()">Cancelar</button>
    </div>
  </div>
    `);
    window._carouselActual = carousel;
  }

  window.seleccionarTipoEvento = function() {
    const tipo = document.getElementById("selector-tipo").value;
    cerrarModal();
    if (tipo === "favorito") mostrarSelectorFavoritos();
    else mostrarEditorEvento();
  };

function mostrarSelectorFavoritos() {
  mostrarModal(`
    <div class="modal-formulario">
      <h3>Selecciona un favorito</h3>
      <select id="selector-favorito">
        <option>Hotel Interlaken</option>
        <option>Restaurante Adler</option>
      </select>
      <input type="time" id="hora-favorito" placeholder="Hora (opcional)">
      <select id="etiqueta-favorito">
        <option value="alojamiento">Alojamiento</option>
        <option value="transporte">Transporte</option>
        <option value="comida">Comida</option>
        <option value="atraccion">Atracción</option>
        <option value="otros">Otros</option>
      </select>
      <div>
        <button onclick="guardarFavoritoSeleccionado()">Añadir</button>
        <button onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);
}


window.guardarFavoritoSeleccionado = function () {
  const titulo = document.getElementById("selector-favorito").value;
  const hora = document.getElementById("hora-favorito").value;
  const etiqueta = document.getElementById("etiqueta-favorito").value;

  crearTarjeta(titulo, "favorito", hora, "", etiqueta);

  const seccion = document.querySelector(".seccion-ubicacion:last-child");
  const tituloUbicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent;
  const fecha = tituloUbicacion?.replace("Día ", "").trim();

  if (fecha && itinerarioData[fecha]) {
    itinerarioData[fecha].eventos.push({
      titulo,
      tipo: "favorito",
      hora,
      notas: "",
      etiquetaEvento: etiqueta
    });
  }

  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  cerrarModal();
};
;
function renderizarItinerario() {
  const contenedorUbicaciones = document.getElementById("contenedor-ubicaciones-itinerario");
  contenedorUbicaciones.innerHTML = "";

  for (const [fecha, entrada] of Object.entries(itinerarioData)) {
    const seccion = crearUbicacion(`Día ${fecha}`);
    const contenedorDias = seccion.querySelector(".contenedor-dias");

    const templateDia = document.getElementById("template-dia").content.cloneNode(true);
    templateDia.querySelector(".titulo-dia").textContent = fecha;

    const carousel = templateDia.querySelector(".carousel-dia");
    const btnAgregarEvento = templateDia.querySelector(".btn-agregar-evento");

    btnAgregarEvento.addEventListener("click", () => mostrarFormularioEvento(carousel));

    for (const evento of entrada.eventos || []) {
      const tarjeta = crearTarjeta(
        evento.titulo,
        evento.tipo,
        evento.hora,
        evento.notas,
        evento.etiquetaEvento
      );
      carousel.appendChild(tarjeta);
    }

    contenedorDias.appendChild(templateDia);
  }

  console.log("✅ Itinerario renderizado desde objeto.");
}
window.renderizarItinerario = renderizarItinerario;



  function mostrarEditorEvento() {
    mostrarModal(`
      <div class="modal-formulario">
    <h3>Nuevo evento</h3>
    <input id="titulo-evento" placeholder="Título">
    <input id="hora-evento" type="time">
    <select id="etiqueta-evento">
      <option value="alojamiento">Alojamiento</option>
      <option value="transporte">Transporte</option>
      <option value="comida">Comida</option>
      <option value="atraccion">Atracción</option>
      <option value="otros">Otros</option>
    </select>
    <textarea id="notas-evento" placeholder="Notas"></textarea>
    <div>
      <button onclick="guardarNuevoEvento()">Guardar</button>
      <button onclick="cerrarModal()">Cancelar</button>
    </div>
  </div>
    `);
  }

window.guardarNuevoEvento = function () {
  const titulo = document.getElementById("titulo-evento").value;
  const hora = document.getElementById("hora-evento").value;
  const notas = document.getElementById("notas-evento").value;
  const etiqueta = document.getElementById("etiqueta-evento").value;

  crearTarjeta(titulo, "evento", hora, notas, etiqueta);

  // Obtener fecha del día actual
  const seccion = document.querySelector(".seccion-ubicacion:last-child");
  const tituloUbicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent;
  const fecha = tituloUbicacion?.replace("Día ", "").trim();

  if (fecha && itinerarioData[fecha]) {
    itinerarioData[fecha].eventos.push({
      titulo,
      tipo: "evento",
      hora,
      notas,
      etiquetaEvento: etiqueta
    });
  }

  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  cerrarModal();
};


  function parseHora(hora) {
  if (!hora) return null;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function crearTarjeta(titulo, tipo, hora = null, notas = "", etiquetaEvento = "") {
  const template = document.getElementById("template-tarjeta-itinerario").content.cloneNode(true);
  const tarjeta = template.querySelector(".tarjeta-itinerario");
  const etiqueta = tarjeta.querySelector(".etiqueta-evento");
  const strong = tarjeta.querySelector(".titulo-evento");

  // Guardar texto en el DOM
  strong.textContent = titulo;

  // Establecer texto etiqueta
  let textoEtiqueta = tipo === "evento" ? "Evento" : "Favorito";
  if (hora) {
    tarjeta.setAttribute("data-hora", hora);
    textoEtiqueta += ` · ${hora}`;
  }
  etiqueta.textContent = textoEtiqueta;

  // Guardar notas como atributo y tooltip
  if (notas) {
    tarjeta.setAttribute("data-notas", notas);
    tarjeta.title = notas;
  }

  // Guardar valores originales para futuras ediciones/borrados
  tarjeta.dataset.originalTitulo = titulo;
  tarjeta.dataset.originalHora = hora;

  // Aplicar color según tipo de etiqueta
  let claseColor = "";
  switch (etiquetaEvento) {
    case "alojamiento": claseColor = "color-alojamiento"; break;
    case "transporte": claseColor = "color-transporte"; break;
    case "comida": claseColor = "color-comida"; break;
    case "atraccion": claseColor = "color-atraccion"; break;
    default: claseColor = "color-otros";
  }
  tarjeta.classList.add(claseColor);

  // Insertar ordenado por hora si hay
  const contenedor = window._carouselActual;
  const nuevaHora = parseHora(hora);
  let insertado = false;

  const tarjetas = contenedor.querySelectorAll(".tarjeta-itinerario");
  for (let t of tarjetas) {
    const horaExistente = t.getAttribute("data-hora");
    if (horaExistente) {
      const horaNum = parseHora(horaExistente);
      if (nuevaHora !== null && nuevaHora < horaNum) {
        contenedor.insertBefore(tarjeta, t);
        insertado = true;
        break;
      }
    }
  }
  if (!insertado) contenedor.appendChild(tarjeta);

  // Evento para abrir editor modal
  tarjeta.addEventListener("click", () => {
    mostrarModal(`
      <div class="modal-formulario">
        <h3>Editar ${tipo}</h3>
        <input id="titulo-evento" placeholder="Título" value="${titulo}">
        <input id="hora-evento" type="time" value="${hora}">
        <select id="etiqueta-evento">
          <option value="alojamiento">Alojamiento</option>
          <option value="transporte">Transporte</option>
          <option value="comida">Comida</option>
          <option value="atraccion">Atracción</option>
          <option value="otros">Otros</option>
        </select>
        <textarea id="notas-evento" placeholder="Notas">${notas}</textarea>
        <div>
          <button onclick="actualizarTarjeta(this)">Guardar cambios</button>
          <button onclick="borrarTarjeta(document._tarjetaEditando)">Eliminar</button>
          <button onclick="cerrarModal()">Cancelar</button>
        </div>
      </div>
    `);
    document._tarjetaEditando = tarjeta;
  });

  console.log(`🧩 ${tipo} añadido:`, titulo, hora || "(sin hora)");

  return tarjeta;
}
window.crearTarjeta = crearTarjeta;

})();

let itinerarioData = {};

function guardarItinerarioLocal() {
  try {
    localStorage.setItem("itinerarioData", JSON.stringify(itinerarioData));
    console.log("💾 Itinerario guardado en localStorage.");
  } catch (err) {
    console.error("❌ Error al guardar en localStorage:", err);
  }
}
window.guardarItinerarioLocal = guardarItinerarioLocal;
function actualizarTarjeta(boton) {
  const tarjeta = window._tarjetaEditando;
  if (!tarjeta) return;

  const nuevoTitulo = document.getElementById("titulo-evento").value.trim();
  const nuevaHora = document.getElementById("hora-evento").value;
  const nuevasNotas = document.getElementById("notas-evento").value.trim();
  const nuevaEtiqueta = document.getElementById("etiqueta-evento").value;

  tarjeta.querySelector(".titulo-evento").textContent = nuevoTitulo;
  tarjeta.setAttribute("data-hora", nuevaHora);
  tarjeta.setAttribute("data-notas", nuevasNotas);
  tarjeta.title = nuevasNotas;

  const etiqueta = tarjeta.querySelector(".etiqueta-evento");
  const tipo = etiqueta.textContent.includes("Favorito") ? "favorito" : "evento";
  etiqueta.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1) + (nuevaHora ? ` · ${nuevaHora}` : "");

  // 🔁 Actualizar en itinerarioData
  const seccion = tarjeta.closest(".seccion-ubicacion");
  const tituloUbicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent;
  const fecha = tituloUbicacion?.replace("Día ", "").trim();

  if (fecha && itinerarioData[fecha]) {
    const eventos = itinerarioData[fecha].eventos;
    const index = eventos.findIndex(e => e.titulo === tarjeta.dataset.originalTitulo && e.hora === tarjeta.dataset.originalHora);
    if (index !== -1) {
      eventos[index] = {
        titulo: nuevoTitulo,
        tipo,
        hora: nuevaHora,
        notas: nuevasNotas,
        etiquetaEvento: nuevaEtiqueta
      };
    }
  }

  cerrarModal();
  guardarItinerarioLocal();
  guardarItinerarioFirebase();

  console.log("📝 Tarjeta actualizada:", nuevoTitulo);
}
window.actualizarTarjeta = actualizarTarjeta;

function borrarTarjeta(tarjeta) {
  const titulo = tarjeta.querySelector(".titulo-evento")?.textContent;
  const hora = tarjeta.getAttribute("data-hora");

  const seccion = tarjeta.closest(".seccion-ubicacion");
  const tituloUbicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent;
  const fecha = tituloUbicacion?.replace("Día ", "").trim();

  if (fecha && itinerarioData[fecha]) {
    itinerarioData[fecha].eventos = itinerarioData[fecha].eventos.filter(e => !(e.titulo === titulo && e.hora === hora));
  }

  tarjeta.remove();

  guardarItinerarioLocal();
  guardarItinerarioFirebase();

  console.log("🗑️ Evento eliminado:", titulo, hora);
}
window.borrarTarjeta = borrarTarjeta;

function cargarItinerarioLocal() {
  try {
    const data = localStorage.getItem("itinerarioData");
    if (data) {
      itinerarioData = JSON.parse(data);
      renderizarItinerario();
      console.log("📥 Itinerario cargado desde localStorage.");
    }
  } catch (err) {
    console.error("❌ Error al cargar de localStorage:", err);
  }
}
window.cargarItinerarioLocal = cargarItinerarioLocal;
    
/*
guardarItinerarioFirebase: (itinerario) => {
    if (navigator.onLine && typeof db !== "undefined") {
      const idSeguro = codificarID(itinerario.id);
      const ref = db.ref(`${rutaItinerario}/${idSeguro}`);
      ref.set(itinerario)
        .then(() => console.log("✅ Itinerario guardado en Firebase"))
        .catch(err => console.error("❌ Error al guardar itinerario en Firebase:", err));
    } else {
      console.warn("📴 Sin conexión, no se guardó en Firebase");
    }
    },


  borrarItinerarioFirebase: (id) => {
    if (navigator.onLine && typeof db !== "undefined") {
      const idSeguro = codificarID(id);
      const ref = db.ref(`${rutaItinerario}/${idSeguro}`);
      ref.remove()
        .then(() => console.log("🗑️ Itinerario eliminado de Firebase"))
        .catch(err => console.error("❌ Error al eliminar Itinerario en Firebase:", err));
    } else {
      console.warn("📴 Sin conexión, no se eliminó Itinerario en Firebase");
    }
  },


cargarItinerarioDesdeFirebase: () => {
  if (navigator.onLine && typeof db !== "undefined") {
    db.ref(rutaItinerario).once('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        Itinerario = Object.entries(data).map(([key, val]) => {
          val.id = decodificarID(key); // restaurar puntos
          return val;
        });
        GestorFavoritos.guardarLocal(); // opcional
        console.log("☁️ Itinerario sincronizados desde Firebase");
      } else {
        console.log("📂 Firebase vacío, usando localStorage");
        GestorFavoritos.cargarLocal();
      }

      renderizarItinerario();

    }, err => {
      console.error("❌ Error al cargar Itinerario desde Firebase:", err);
      renderizarItinerario();

    });

  } else {
    console.warn("📡 Sin conexión: usando localStorage");
      renderizarItinerario();

  }
},*/

function guardarItinerarioFirebase() {
  if (!navigator.onLine || typeof db === "undefined") {
    console.warn("📴 Sin conexión, no se guarda en Firebase.");
    return;
  }
console.log("💾 Guardando itinerario en ruta:", window.rutaItinerario);
  db.ref(window.rutaItinerario).set(itinerarioData)
    .then(() => console.log("☁️ Itinerario guardado en Firebase"))
    .catch(err => console.error("❌ Error al guardar en Firebase:", err));
}
window.guardarItinerarioFirebase = guardarItinerarioFirebase;

function cargarItinerarioFirebase() {
  if (!navigator.onLine || typeof db === "undefined") {
    console.warn("📴 Sin conexión, no se carga de Firebase.");
    return;
  }

  db.ref(window.rutaItinerario).once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
itinerarioData = data;

        console.log("🧩 ItinerarioData cargado desde Firebase:", itinerarioData);

        renderizarItinerario();
        guardarItinerarioLocal(); // backup
        console.log("📥 Itinerario cargado desde Firebase.");
      }
    })
    .catch(err => console.error("❌ Error al cargar de Firebase:", err));
}
window.cargarItinerarioFirebase = cargarItinerarioFirebase;

document.addEventListener("DOMContentLoaded", () => {
  if (navigator.onLine) {
    cargarItinerarioFirebase();
  } else {
    cargarItinerarioLocal();
  }
});