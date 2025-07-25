// JS DE ITINERARIO
const usuarioId = "charlyylaura"; // en el futuro esto podría ser un usuario real
window.rutaItinerario = `itinerario/${usuarioId}`;
let tarjetaArrastrando = null;
let origenFecha = null;
let origenUbicacion = null;
let tarjetaClon = null;

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

window.confirmarAccion = function (mensaje, callbackAceptar) {
  mostrarModal(`
    <div class="modal-formulario-eliminar">
      <h3>${mensaje}</h3>
      <div>
        <button id="btn-confirmar-aceptar">Sí</button>
        <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);

  document.getElementById("btn-confirmar-aceptar").addEventListener("click", () => {
    cerrarModal();
    callbackAceptar();
  });
};

  function cerrarModal() {
    modalFondo.style.display = "none";
    modalContenido.innerHTML = "";
  }
  window.cerrarModal = cerrarModal;
function guardarNuevaUbicacion() {
  const input = document.getElementById("input-nueva-ubicacion");
  const nombre = input?.value?.trim();

  if (!nombre) {
    alert("Introduce un nombre válido.");
    return;
  }

  if (itinerarioData[nombre]) {
    alert("Ya existe una ubicación con ese nombre.");
    return;
  }
  // Inicializar en el objeto si no existe
  itinerarioData[nombre] = {};
  // Crear la ubicación en la interfaz
  crearUbicacion(nombre);



  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  cerrarModal();
}
window.guardarNuevaUbicacion = guardarNuevaUbicacion;

  function guardarUbicacionRenombrada() {
  const nuevaUbicacion = document.getElementById("nueva-ubicacion")?.value?.trim();
  const ubicacionAntigua = window._ubicacionEditando;

  if (!nuevaUbicacion || !ubicacionAntigua || nuevaUbicacion === ubicacionAntigua) {
    cerrarModal();
    return;
  }

  if (itinerarioData[nuevaUbicacion]) {
    alert("Ya existe una ubicación con ese nombre.");
    return;
  }

  itinerarioData[nuevaUbicacion] = itinerarioData[ubicacionAntigua];
  delete itinerarioData[ubicacionAntigua];

  console.log("✅ Ubicación renombrada:", ubicacionAntigua, "→", nuevaUbicacion);

  cerrarModal();
  renderizarItinerario(); // <- asegúrate de que existe esta función
  guardarItinerarioLocal?.();
  guardarItinerarioFirebase?.();
}
window.guardarUbicacionRenombrada = guardarUbicacionRenombrada;

function crearUbicacion(nombreUbicacion) {
  const template = document.getElementById("template-ubicacion").content.cloneNode(true);
  template.querySelector(".titulo-ubicacion").textContent = nombreUbicacion;

  const seccion = template.querySelector(".seccion-ubicacion");
  const contenedorDias = template.querySelector(".contenedor-dias");
  const btnAgregarDia = template.querySelector(".btn-agregar-dia");
  const btnCerrar = template.querySelector(".btn-cerrar-ubicacion");

  btnAgregarDia.addEventListener("click", () => mostrarFormularioDia(contenedorDias));

  if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
      confirmarAccion(`¿Eliminar toda la ubicación "${nombreUbicacion}"?`, () => {
  delete itinerarioData[nombreUbicacion];
  seccion.remove();
  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  console.log("🗑️ Ubicación eliminada:", nombreUbicacion);
});

    });
  }

contenedorUbicaciones.appendChild(template);

const seccionInsertada = contenedorUbicaciones.lastElementChild;
const h2 = seccionInsertada.querySelector(".titulo-ubicacion");

if (h2) {
  h2.addEventListener("click", () => {
    const ubicacionActual = h2.textContent.trim();
    window._ubicacionEditando = ubicacionActual;
    mostrarModalEditarUbicacion(ubicacionActual);
  });
}

guardarItinerarioLocal();
guardarItinerarioFirebase();

return seccionInsertada;

}
window.crearUbicacion = crearUbicacion;

  botonNuevaUbicacion.addEventListener("click", () => {
    mostrarModal(`
      <div class="modal-formulario-donde">
    <h3>¿Dónde empezamos?</h3>
    <input type="text" id="input-nueva-ubicacion" placeholder="Introduce una ubicación">
    <div>
      <button id="btn-generico" onclick="guardarNuevaUbicacion()">Crear</button>
      <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
    </div>
  </div>
    `);
  });
function mostrarModalEditarUbicacion(nombreActual) {
  mostrarModal(`
    <div class="modal-formulario-tarjeta">
      <h3>Editar ubicación</h3>
      <input id="nueva-ubicacion" placeholder="Nuevo nombre" value="${nombreActual}">
      <div>
        <button id="btn-generico" onclick="guardarUbicacionRenombrada()">Guardar</button>
        <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);
}

  function mostrarFormularioDia(contenedorDias) {
    mostrarModal(`
      <div class="modal-formulario-cuando">
    <h3>¿Qué día?</h3>
    <input type="date" id="input-nuevo-dia">
    <div>
      <button id="btn-generico" onclick="guardarNuevoDia()">Guardar</button>
      <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
    </div>
  </div>
    `);
    window._contenedorDiasActual = contenedorDias;
  }
function formatearFechaBonita(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

  const diaSemana = dias[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];

  return `${diaSemana} ${dia} ${mes}`;
}
function activarEdicionFecha(h3TituloDia, ubicacion, fechaAntigua) {
  h3TituloDia.addEventListener("click", () => {
    mostrarModal(`
      <div class="modal-formulario-cuando">
        <h3>Editar fecha</h3>
        <input type="date" id="input-editar-fecha" value="${fechaAntigua}">
        <div>
          <button id="btn-generico" onclick="guardarFechaEditada('${ubicacion}', '${fechaAntigua}')">Guardar</button>
          <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
        </div>
      </div>
    `);
  });
}

window.guardarFechaEditada = function (ubicacion, fechaAntigua) {
  const nuevaFecha = document.getElementById("input-editar-fecha").value;
  if (!nuevaFecha || nuevaFecha === fechaAntigua) return cerrarModal();

  if (itinerarioData[ubicacion][nuevaFecha]) {
    alert("Ya hay un día con esa fecha.");
    return;
  }

  // Mover los eventos
  itinerarioData[ubicacion][nuevaFecha] = itinerarioData[ubicacion][fechaAntigua];
  delete itinerarioData[ubicacion][fechaAntigua];

  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  cerrarModal();
  renderizarItinerario();
};


function guardarNuevoDia() {
  const fecha = document.getElementById("input-nuevo-dia").value;
  if (!fecha) {
    alert("Selecciona una fecha válida.");
    return;
  }

  const contenedor = window._contenedorDiasActual;

  const template = document.getElementById("template-dia").content.cloneNode(true);
  const diaItinerario = template.querySelector(".dia-itinerario");
  diaItinerario.setAttribute("data-fecha", fecha);

  const fechaFormateada = formatearFechaBonita(fecha);
  const h3TituloDia = template.querySelector(".titulo-dia");
  h3TituloDia.textContent = fechaFormateada;

  const btnAgregarEvento = template.querySelector(".btn-agregar-evento");
  const btnEliminarDia = template.querySelector(".btn-cerrar-dia");
  const carousel = template.querySelector(".carousel-dia");
// Habilitar soltar tarjetas arrastradas en este contenedor
carousel.addEventListener("mouseup", (e) => {
  if (!tarjetaArrastrando) return;

  e.currentTarget.appendChild(tarjetaArrastrando);

  const nuevaSeccion = tarjetaArrastrando.closest(".seccion-ubicacion");
  const nuevaUbicacion = nuevaSeccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();
  const nuevaDia = e.currentTarget.closest(".dia-itinerario");
  const nuevaFecha = nuevaDia?.getAttribute("data-fecha");

  if (!origenUbicacion || !origenFecha || !nuevaUbicacion || !nuevaFecha) {
    console.warn("❌ No se pudo determinar origen o destino");
    return;
  }

  const titulo = tarjetaArrastrando.querySelector(".titulo-evento")?.textContent;
  const hora = tarjetaArrastrando.getAttribute("data-hora");

  const evento = itinerarioData[origenUbicacion]?.[origenFecha]?.eventos?.find(
    e => e.titulo === titulo && (e.hora || "") === (hora || "")
  );

  if (!evento) {
    console.warn("❌ No se encontró el evento original.");
    return;
  }

  // Eliminar de origen
  itinerarioData[origenUbicacion][origenFecha].eventos = itinerarioData[origenUbicacion][origenFecha].eventos.filter(
    e => e !== evento
  );

  // Insertar en destino
  if (!itinerarioData[nuevaUbicacion][nuevaFecha]) {
    itinerarioData[nuevaUbicacion][nuevaFecha] = { eventos: [] };
  }
  itinerarioData[nuevaUbicacion][nuevaFecha].eventos.push(evento);

  console.log("📦 Evento movido de", origenUbicacion, origenFecha, "→", nuevaUbicacion, nuevaFecha);

  guardarItinerarioLocal();
  guardarItinerarioFirebase();

  tarjetaArrastrando.classList.remove("arrastrando");
  tarjetaArrastrando = null;
});

  btnAgregarEvento.addEventListener("click", () => mostrarFormularioEvento(carousel));

  if (btnEliminarDia) {
    btnEliminarDia.addEventListener("click", () => {
      confirmarAccion(`¿Eliminar el día "${fechaFormateada}" y todos sus eventos?`, () => {
        const seccion = diaItinerario.closest(".seccion-ubicacion");
        const ubicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();
        if (ubicacion && itinerarioData[ubicacion]) {
          delete itinerarioData[ubicacion][fecha];
        }
        diaItinerario.remove();
        guardarItinerarioLocal();
        guardarItinerarioFirebase();
        console.log("🗑️ Día eliminado:", fecha);
      });
    });
  }

  contenedor.appendChild(template);

  const seccion = contenedor.closest(".seccion-ubicacion");
  const ubicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();

  if (ubicacion) {
    if (!itinerarioData[ubicacion]) {
      itinerarioData[ubicacion] = {};
    }
    if (!itinerarioData[ubicacion][fecha]) {
      itinerarioData[ubicacion][fecha] = { eventos: [] };
    }
  }

  // ⬇️ ACTIVAR EDICIÓN DE FECHA ⬇️
  activarEdicionFecha(h3TituloDia, ubicacion, fecha);

  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  cerrarModal();

  console.log("📅 Día creado:", fecha);
}
window.guardarNuevoDia = guardarNuevoDia;







function mostrarFormularioEvento(carousel) {
  const diaContenedor = carousel.closest(".dia-itinerario");
  const fecha = diaContenedor?.getAttribute("data-fecha");

  const seccion = diaContenedor.closest(".seccion-ubicacion");
  const ubicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();

  if (!fecha || !ubicacion) {
    console.warn("❌ No se pudo obtener fecha o ubicación");
    alert("Error: no se pudo determinar en qué día o ubicación estás.");
    return;
  }

  window.fechaEventoActual = fecha;
  window.ubicacionEventoActual = ubicacion;
  window._carouselActual = carousel;

  mostrarModal(`
    <div class="modal-formulario-evento">
      <h3>¿Qué deseas añadir?</h3>
      <select id="selector-tipo">
        <option value="evento">Evento</option>
        <option value="favorito">Favorito</option>
      </select>
      <div>
        <button id="btn-generico" onclick="seleccionarTipoEvento()">Continuar</button>
        <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);
}



  window.seleccionarTipoEvento = function() {
    const tipo = document.getElementById("selector-tipo").value;
    cerrarModal();
    if (tipo === "favorito") mostrarSelectorFavoritos();
    else mostrarEditorEvento();
  };
//👇👇👇👇👇👇
function mostrarSelectorFavoritos() {
  if (!Array.isArray(favoritos) || favoritos.length === 0) {
    alert("No hay favoritos guardados.");
    return;
  }

  const opciones = favoritos.map(f => {
    const nombre = f.datosPersonalizados?.nombre || f.id;
    return `<option value="${f.id}">${nombre}</option>`;
  }).join("");

  mostrarModal(`
    <div class="modal-formulario-favoritos">
      <h3>Selecciona un favorito</h3>
      <select id="selector-favorito">
        ${opciones}
      </select>
      <select id="etiqueta-favorito">
        <option value="alojamiento">Alojamiento</option>
        <option value="transporte">Transporte</option>
        <option value="comida">Comida</option>
        <option value="atraccion">Atracción</option>
        <option value="otros">Otros</option>
      </select>
      <input type="time" id="hora-favorito" value="00:00">
      <div>
        <button id="btn-generico" onclick="guardarFavoritoSeleccionado()">Añadir</button>
        <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);
}



window.guardarFavoritoSeleccionado = function () {
  const idFavorito = document.getElementById("selector-favorito").value;
  const hora = document.getElementById("hora-favorito").value;
  const etiqueta = document.getElementById("etiqueta-favorito").value;

  // Buscar el favorito por ID
  const favorito = favoritos.find(f => f.id === idFavorito);
  const nombre = favorito?.datosPersonalizados?.nombre || "Favorito sin nombre";
  const precio = favorito?.datosPersonalizados?.precio || "";

  crearTarjeta(nombre, "favorito", hora, "", etiqueta, precio);

  const seccion = document.querySelector(".seccion-ubicacion:last-child");
const ubicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();
const fecha = seccion?.querySelector(".dia-itinerario")?.getAttribute("data-fecha");

if (
  ubicacion &&
  fecha &&
  itinerarioData[ubicacion] &&
  itinerarioData[ubicacion][fecha] &&
  Array.isArray(itinerarioData[ubicacion][fecha].eventos)
) {
  itinerarioData[ubicacion][fecha].eventos.push({
    titulo: nombre,
    tipo: "favorito",
    hora,
    notas: "",
    etiquetaEvento: etiqueta,
    precio
  });
  console.log("✅ Favorito insertado correctamente en itinerarioData");
} else {
  console.warn("⚠️ No se pudo insertar el favorito: estructura no encontrada.", {
    ubicacion, fecha, itinerarioData
  });
}

  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  cerrarModal();
};
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

;
function renderizarItinerario() {
  const contenedorUbicaciones = document.getElementById("contenedor-ubicaciones-itinerario");
  contenedorUbicaciones.innerHTML = "";

const ubicacionesOrdenadas = Object.entries(itinerarioData).sort(([, fechasA], [, fechasB]) => {
  const fechaMinA = Object.keys(fechasA || {})
    .filter(f => /^\d{4}-\d{2}-\d{2}$/.test(f))
    .sort()[0] || "9999-12-31";

  const fechaMinB = Object.keys(fechasB || {})
    .filter(f => /^\d{4}-\d{2}-\d{2}$/.test(f))
    .sort()[0] || "9999-12-31";

  return fechaMinA.localeCompare(fechaMinB);
});

for (const [ubicacion, fechas] of ubicacionesOrdenadas) {
    console.log("Orden de ubicaciones:", Object.keys(itinerarioData));

    const seccion = crearUbicacion(`${ubicacion}`);
    const contenedorDias = seccion.querySelector(".contenedor-dias");

    const templateDia = document.getElementById("template-dia");
    if (!templateDia) {
      console.error("❌ No se encontró el template-dia en el DOM.");
      continue;
    }

 for (const [fecha, entrada] of Object.entries(fechas)) {
  const clonDia = templateDia.content.cloneNode(true);
  const fechaFormateada = formatearFechaBonita(fecha);

  const diaItinerario = clonDia.querySelector(".dia-itinerario");
  diaItinerario?.setAttribute("data-fecha", fecha);

  const h3TituloDia = clonDia.querySelector(".titulo-dia");
  h3TituloDia.textContent = `${fechaFormateada}`;
  activarEdicionFecha(h3TituloDia, ubicacion, fecha); // 👈 aquí se activa la edición de fecha

  const carousel = clonDia.querySelector(".carousel-dia");
  const btnAgregarEvento = clonDia.querySelector(".btn-agregar-evento");
  const btnCerrarDia = clonDia.querySelector(".btn-cerrar-dia");

  if (!carousel) {
    console.error("❌ No se encontró .carousel-dia en el template clonado.");
    continue;
  }

  window._carouselActual = carousel;
carousel.addEventListener("mouseup", (e) => {
  if (!tarjetaArrastrando) return;

  // Mover visualmente
  e.currentTarget.appendChild(tarjetaArrastrando);

  const nuevaSeccion = tarjetaArrastrando.closest(".seccion-ubicacion");
  const nuevaUbicacion = nuevaSeccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();
  const nuevaDia = e.currentTarget.closest(".dia-itinerario");
  const nuevaFecha = nuevaDia?.getAttribute("data-fecha");

  if (!origenUbicacion || !origenFecha || !nuevaUbicacion || !nuevaFecha) {
    console.warn("❌ No se pudo determinar origen o destino");
    return;
  }

  // Mover evento en itinerarioData
  const titulo = tarjetaArrastrando.querySelector(".titulo-evento")?.textContent;
  const hora = tarjetaArrastrando.getAttribute("data-hora");

  const evento = itinerarioData[origenUbicacion]?.[origenFecha]?.eventos?.find(
    e => e.titulo === titulo && (e.hora || "") === (hora || "")
  );

  if (!evento) {
    console.warn("❌ No se encontró el evento original.");
    return;
  }

  // Eliminar de origen
  itinerarioData[origenUbicacion][origenFecha].eventos = itinerarioData[origenUbicacion][origenFecha].eventos.filter(
    e => e !== evento
  );

  // Insertar en destino
  if (!itinerarioData[nuevaUbicacion][nuevaFecha]) {
    itinerarioData[nuevaUbicacion][nuevaFecha] = { eventos: [] };
  }
  itinerarioData[nuevaUbicacion][nuevaFecha].eventos.push(evento);

  console.log("📦 Evento movido de", origenUbicacion, origenFecha, "→", nuevaUbicacion, nuevaFecha);

  guardarItinerarioLocal();
  guardarItinerarioFirebase();

  tarjetaArrastrando.classList.remove("arrastrando");
  tarjetaArrastrando = null;
});

  btnAgregarEvento.addEventListener("click", () => mostrarFormularioEvento(carousel));

  const clonDiaWrapper = document.createElement("div");
  clonDiaWrapper.appendChild(clonDia);

  if (btnCerrarDia) {
    btnCerrarDia.addEventListener("click", () => {
      if (confirm(`¿Eliminar el día "${fechaFormateada}" y todos sus eventos?`)) {
        delete itinerarioData[ubicacion][fecha];
        clonDiaWrapper.remove();
        guardarItinerarioLocal();
        guardarItinerarioFirebase();
        console.log("🗑️ Día eliminado:", fecha);
        console.log("🧠 Estado actual itinerarioData:", itinerarioData);
      }
    });
  }

  for (const evento of entrada.eventos || []) {
    const tarjeta = crearTarjeta(
      evento.titulo,
      evento.tipo,
      evento.hora,
      evento.notas,
      evento.etiquetaEvento,
      evento.precio,
      evento.moneda
    );

    if (tarjeta) carousel.appendChild(tarjeta);
  }

  contenedorDias.appendChild(clonDiaWrapper);
}

  }

  console.log("✅ Itinerario renderizado desde objeto.");
}
window.renderizarItinerario = renderizarItinerario;



//👇👇👇👇👇👇

function mostrarEditorEvento() {
  mostrarModal(`
    <div class="modal-formulario-evento-edit">
      <h3>Nuevo evento</h3>
      <input id="titulo-evento" placeholder="Título">
      <div class="inputs-evento">
        <input id="hora-evento" type="time" value="00:00">
        <select id="etiqueta-evento">
          <option value="alojamiento">Alojamiento</option>
          <option value="transporte">Transporte</option>
          <option value="comida">Comida</option>
          <option value="atraccion">Atracción</option>
          <option value="otros">Otros</option>
        </select>
      </div>
      <textarea id="notas-evento" placeholder="Notas"></textarea>
      <div>
        <button onclick="guardarNuevoEvento()">Guardar</button>
        <button onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);

  // ⬇️ Aquí sí se ejecuta porque está fuera del innerHTML
  const textarea = document.getElementById('notas-evento');
  if (textarea) {
    textarea.addEventListener('input', autoResize);

    function autoResize() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    }

    autoResize.call(textarea);
  }
}


window.guardarNuevoEvento = function () {
  const titulo = document.getElementById("titulo-evento").value.trim();
  const hora = document.getElementById("hora-evento").value.trim();
  const notas = document.getElementById("notas-evento").value.trim();
  const etiqueta = document.getElementById("etiqueta-evento").value;

  if (!titulo) {
    alert("El título del evento es obligatorio.");
    return;
  }

  const fecha = window.fechaEventoActual;

  // 🔧 Obtener ubicación actual desde la tarjeta activa
  const seccion = window._carouselActual?.closest(".seccion-ubicacion");
  const ubicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();

  if (!fecha || !ubicacion) {
    console.warn("❌ No se pudo determinar la fecha o ubicación del evento.");
    alert("Error: faltan datos para guardar el evento.");
    return;
  }
  console.log("🌍 Ubicación:", ubicacion);
console.log("📅 Fecha:", fecha);


  if (!itinerarioData[ubicacion]) {
    itinerarioData[ubicacion] = {};
  }
  if (!itinerarioData[ubicacion][fecha]) {
    itinerarioData[ubicacion][fecha] = { eventos: [] };
  }

  const nuevoEvento = {
    titulo,
    tipo: "evento",
    hora,
    notas,
    etiquetaEvento: etiqueta
  };

  crearTarjeta(titulo, "evento", hora, notas, etiqueta);
  itinerarioData[ubicacion][fecha].eventos.push(nuevoEvento);

  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  cerrarModal();

  console.log(`✅ Evento añadido a ${ubicacion} - ${fecha}:`, nuevoEvento);
};






  function parseHora(hora) {
  if (!hora) return null;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}
function parseLinks(texto) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return texto.replace(urlRegex, url => {
    try {
      const u = new URL(url);
      const dominio = u.hostname.replace("www.", "");
      return `<a href="${url}" target="_blank">${dominio}/...</a>`;
    } catch {
      return url;
    }
  });
}

function abrirModalEdicionEvento() {
  const eventoActual = window._eventoEditando;
  const tipo = "evento";

  if (!eventoActual) {
    alert("❌ No se pudo cargar la información del evento.");
    return;
  }

  mostrarModal(`
    <div class="modal-formulario-tarjeta">
      <h3>Editar ${tipo}</h3>
      <input id="titulo-evento" placeholder="Título" value="${eventoActual.titulo || ""}">
      
      <div id="inputs-evento">
        <input id="hora-evento" type="time" value="${eventoActual.hora || ""}">
        
        <select id="etiqueta-evento">
          <option value="alojamiento" ${eventoActual.etiquetaEvento === "alojamiento" ? "selected" : ""}>Alojamiento</option>
          <option value="transporte" ${eventoActual.etiquetaEvento === "transporte" ? "selected" : ""}>Transporte</option>
          <option value="comida" ${eventoActual.etiquetaEvento === "comida" ? "selected" : ""}>Comida</option>
          <option value="atraccion" ${eventoActual.etiquetaEvento === "atraccion" ? "selected" : ""}>Atracción</option>
          <option value="otros" ${eventoActual.etiquetaEvento === "otros" ? "selected" : ""}>Otros</option>
        </select>
      </div>

      <textarea id="notas-evento" placeholder="Notas">${eventoActual.notas || ""}</textarea>
      
      <div id="inputs-evento">
        <input id="precio-evento" placeholder="Precio" value="${eventoActual.precio || ""}">
        <select id="moneda-evento">
          <option value="EUR" ${eventoActual.moneda === "EUR" ? "selected" : ""}>EUR</option>
          <option value="CHF" ${eventoActual.moneda === "CHF" ? "selected" : ""}>CHF</option>
          <option value="USD" ${eventoActual.moneda === "USD" ? "selected" : ""}>USD</option>
        </select>
      </div>

      <div>
        <button id="btn-generico" onclick="actualizarTarjeta(this)">Guardar</button>
        <button id="btn-generico" onclick="borrarTarjeta(window._tarjetaEditando)">Eliminar</button>
        <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);

  // Auto-resize para el textarea
  const textarea = document.getElementById('notas-evento');
  if (textarea) {
    textarea.addEventListener('input', autoResize);

    function autoResize() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    }

    autoResize.call(textarea);
  }
}

window.abrirModalEdicionEvento = abrirModalEdicionEvento;


function mostrarVistaPreviaEvento(eventoActual, tipo) {
  const notasParseadas = parseLinks(eventoActual.notas || "");

  mostrarModal(`
    <div class="modal-formulario-tarjeta">
      <h3>${eventoActual.titulo || "Sin título"}</h3>
      
      <div id="inputs-evento">
        <p><strong>Hora:</strong> ${eventoActual.hora || "—"}</p>
        <p><strong>Categoría:</strong> ${eventoActual.etiquetaEvento || "—"}</p>
        <p><strong>Precio:</strong> ${eventoActual.precio || "—"} ${eventoActual.moneda || ""}</p>
      </div>

      <div class="vista-previa-notas">${notasParseadas}</div>

      <div>
        <button id="btn-generico" onclick="abrirModalEdicionEvento()">Editar</button>
        <button id="btn-generico" onclick="borrarTarjeta(window._tarjetaEditando)">Eliminar</button>
        <button id="btn-generico" onclick="cerrarModal()">Cancelar</button>
      </div>
    </div>
  `);
}


function crearTarjeta(titulo, tipo, hora = null, notas = "", etiquetaEvento = "", precio = "", moneda = "EUR") {
const template = document.getElementById("template-tarjeta-itinerario");
if (!template) {
  console.error("❌ No se encontró el template-tarjeta-itinerario en el DOM");
  return;
}

const clone = template.content.cloneNode(true);
const tarjeta = clone.querySelector(".tarjeta-itinerario");
if (!tarjeta) {
  console.error("❌ El clon no contiene .tarjeta-itinerario");
  return;
}

  const etiqueta = tarjeta.querySelector(".etiqueta-evento");
  const strong = tarjeta.querySelector(".titulo-evento");

  strong.textContent = titulo;

  let textoEtiqueta = tipo === "evento" ? "Evento" : "Favorito";
  if (hora) {
    tarjeta.setAttribute("data-hora", hora);
    textoEtiqueta += ` · ${hora}`;
  }
  etiqueta.textContent = textoEtiqueta;

  if (notas) {
    tarjeta.setAttribute("data-notas", notas);
    tarjeta.title = notas;
  }

  if (precio) tarjeta.setAttribute("data-precio", precio);
  if (moneda) tarjeta.setAttribute("data-moneda", moneda);

  tarjeta.dataset.originalTitulo = titulo;
  tarjeta.dataset.originalHora = hora;

  let claseColor = "";
  switch (etiquetaEvento) {
    case "alojamiento": claseColor = "color-alojamiento"; break;
    case "transporte": claseColor = "color-transporte"; break;
    case "comida": claseColor = "color-comida"; break;
    case "atraccion": claseColor = "color-atraccion"; break;
    default: claseColor = "color-otros";
  }
  tarjeta.classList.add(claseColor);

  // Orden por hora
  const contenedor = window._carouselActual;
  if (!contenedor) {
  console.error("❌ No se ha definido window._carouselActual. No se puede insertar la tarjeta.");
  return;
}

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

  let longPressTimeout;

tarjeta.addEventListener("touchstart", (e) => {
  e.preventDefault(); // 👈 Esto bloquea la selección de texto y menú contextual
  longPressTimeout = setTimeout(() => {
    tarjeta.classList.add("arrastrando");
    tarjetaArrastrando = tarjeta;

    const seccion = tarjeta.closest(".seccion-ubicacion");
    origenUbicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();

    const dia = tarjeta.closest(".dia-itinerario");
    origenFecha = dia?.getAttribute("data-fecha");

    console.log("📦 Modo arrastre activado desde:", origenUbicacion, origenFecha);
  }, 400);
});

tarjeta.addEventListener("touchend", () => {
  clearTimeout(longPressTimeout);
});

  // Evento de clic para editar
tarjeta.addEventListener("click", (e) => {
  if (tarjeta.classList.contains("arrastrando")) {
    // Estamos en modo arrastre, no ejecutar click
    return;
  }

  window._tarjetaEditando = tarjeta;

const seccion = tarjeta.closest(".seccion-ubicacion");
const ubicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();

const diaContenedor = tarjeta.closest(".dia-itinerario");
const fecha = diaContenedor?.getAttribute("data-fecha");

if (fecha && ubicacion && itinerarioData[ubicacion]?.[fecha]) {
  console.log("📦 Buscando evento en:", itinerarioData[ubicacion][fecha].eventos);
  console.log("🎯 originalTitulo:", tarjeta.dataset.originalTitulo);
  console.log("🕒 originalHora:", tarjeta.dataset.originalHora);

  const evento = itinerarioData[ubicacion][fecha].eventos.find(
    e => e.titulo === tarjeta.dataset.originalTitulo &&
         (e.hora || "") === (tarjeta.dataset.originalHora || "")
  );

  if (evento) {
    window._eventoEditando = evento;
  } else {
    console.warn("⚠️ No se encontró el evento al hacer clic en la tarjeta.");
    window._eventoEditando = null;
  }
} else {
  console.warn("⚠️ No se pudo determinar la fecha o ubicación de la tarjeta.");
  window._eventoEditando = null;
}

  const eventoActual = window._eventoEditando;

  if (!eventoActual) {
    alert("❌ No se pudo cargar la información del evento.");
    return;
  }

mostrarVistaPreviaEvento(eventoActual, tipo);

const textarea = document.getElementById('notas-evento');
const vistaPrevia = document.getElementById('vista-previa-notas');



function autoResize() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
}

function actualizarVistaPrevia() {
  if (!vistaPrevia || !textarea) return;
  vistaPrevia.innerHTML = parseLinks(textarea.value);
}

if (textarea) {
  textarea.addEventListener('input', () => {
    autoResize.call(textarea);
    actualizarVistaPrevia();
  });

  autoResize.call(textarea);
  actualizarVistaPrevia(); // Inicializar
}

});



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
  console.log("🚀 Ejecutando actualizarTarjeta");

  const tarjeta = window._tarjetaEditando;
  const evento = window._eventoEditando;

  console.log("🧾 tarjeta:", tarjeta);
  console.log("🧾 evento:", evento);

  if (!tarjeta) {
    console.warn("❌ No hay tarjeta editando (window._tarjetaEditando)");
    return;
  }

  if (!evento) {
    console.warn("❌ No hay evento editando (window._eventoEditando)");
    return;
  }

  const modal = boton.closest(".modal-formulario");
  console.log("🧱 Modal activo:", modal);

  const inputTitulo = modal.querySelector("#titulo-evento");
  const inputHora = modal.querySelector("#hora-evento");
  const inputNotas = modal.querySelector("#notas-evento");
  const inputEtiqueta = modal.querySelector("#etiqueta-evento");
  const inputPrecio = modal.querySelector("#precio-evento");
  const inputMoneda = modal.querySelector("#moneda-evento");

  console.log("📦 Inputs obtenidos:", {
    inputTitulo,
    inputHora,
    inputNotas,
    inputEtiqueta,
    inputPrecio,
    inputMoneda
  });

  const nuevoTitulo = inputTitulo?.value.trim();
  const nuevaHora = inputHora?.value;
  const nuevasNotas = inputNotas?.value.trim();
  const nuevaEtiqueta = inputEtiqueta?.value;
  const nuevoPrecio = inputPrecio?.value;
  const nuevaMoneda = inputMoneda?.value;

  console.log("📥 Nuevos valores capturados:", {
    nuevoTitulo,
    nuevaHora,
    nuevasNotas,
    nuevaEtiqueta,
    nuevoPrecio,
    nuevaMoneda
  });

  if (!nuevoTitulo) {
    console.warn("⚠️ El título está vacío. Cancelando.");
    return;
  }

  // Actualizar DOM
  const tituloDOM = tarjeta.querySelector(".titulo-evento");
  const etiquetaDOM = tarjeta.querySelector(".etiqueta-evento");

  if (!tituloDOM || !etiquetaDOM) {
    console.error("❌ No se encontraron elementos .titulo-evento o .etiqueta-evento en la tarjeta");
    return;
  }

  console.log("🖋️ Actualizando DOM...");

  tituloDOM.textContent = nuevoTitulo;
  tarjeta.setAttribute("data-hora", nuevaHora);
  tarjeta.setAttribute("data-notas", nuevasNotas);
  tarjeta.setAttribute("data-precio", nuevoPrecio);
  tarjeta.setAttribute("data-moneda", nuevaMoneda);
  tarjeta.title = nuevasNotas;

  const tipo = etiquetaDOM.textContent.includes("Favorito") ? "favorito" : "evento";
  const textoEtiqueta = tipo.charAt(0).toUpperCase() + tipo.slice(1) + (nuevaHora ? ` · ${nuevaHora}` : "");
  etiquetaDOM.textContent = textoEtiqueta;

  // Clase color
  tarjeta.classList.remove("color-alojamiento", "color-transporte", "color-comida", "color-atraccion", "color-otros");
  let claseColor = "";
  switch (nuevaEtiqueta) {
    case "alojamiento": claseColor = "color-alojamiento"; break;
    case "transporte": claseColor = "color-transporte"; break;
    case "comida": claseColor = "color-comida"; break;
    case "atraccion": claseColor = "color-atraccion"; break;
    default: claseColor = "color-otros";
  }
  tarjeta.classList.add(claseColor);
  console.log("🎨 Clase color aplicada:", claseColor);

// 🧠 Actualizar en objeto original
console.log("📦 Actualizando objeto evento original...");
evento.titulo = nuevoTitulo;
evento.hora = nuevaHora;
evento.notas = nuevasNotas;
evento.etiquetaEvento = nuevaEtiqueta;
evento.precio = nuevoPrecio;
evento.moneda = nuevaMoneda;
evento.tipo = tipo;

console.log("✅ Objeto evento actualizado:", evento);

// 🧠 Actualizar también el dataset de la tarjeta para futuras ediciones
tarjeta.dataset.originalTitulo = nuevoTitulo;
tarjeta.dataset.originalHora = nuevaHora;
tarjeta.setAttribute("data-notas", nuevasNotas);
tarjeta.setAttribute("data-precio", nuevoPrecio);
tarjeta.setAttribute("data-moneda", nuevaMoneda);

// 🧠 Si querés mayor robustez aún, también podés guardar la etiqueta si la usás para búsquedas futuras:
tarjeta.dataset.etiquetaEvento = nuevaEtiqueta;

guardarItinerarioLocal();
console.log("💾 Guardado en localStorage");

guardarItinerarioFirebase();
console.log("☁️ Intento de guardado en Firebase");

cerrarModal();
console.log("❎ Modal cerrado");

}

window.actualizarTarjeta = function (btn) {
  if (!window._tarjetaEditando || !window._eventoEditando) {
    alert("❌ No se ha seleccionado correctamente la tarjeta o el evento.");
    return;
  }

  const tarjeta = window._tarjetaEditando;
  const evento = window._eventoEditando;

  // Nuevos valores del formulario
  const nuevoTitulo = document.getElementById("titulo-evento").value.trim();
  const nuevaHora = document.getElementById("hora-evento").value.trim();
  const nuevaEtiqueta = document.getElementById("etiqueta-evento").value;
  const nuevasNotas = document.getElementById("notas-evento").value.trim();
  const nuevoPrecio = document.getElementById("precio-evento")?.value?.trim() || "";
  const nuevaMoneda = document.getElementById("moneda-evento")?.value || "EUR";

  // Actualizar datos en memoria
  evento.titulo = nuevoTitulo;
  evento.hora = nuevaHora;
  evento.etiquetaEvento = nuevaEtiqueta;
  evento.notas = nuevasNotas;
  evento.precio = nuevoPrecio;
  evento.moneda = nuevaMoneda;

  // Actualizar tarjeta DOM
  const strong = tarjeta.querySelector(".titulo-evento");
  const etiqueta = tarjeta.querySelector(".etiqueta-evento");

  if (strong) strong.textContent = nuevoTitulo;

  let textoEtiqueta = "Evento";
  if (nuevaHora) textoEtiqueta += ` · ${nuevaHora}`;
  if (etiqueta) etiqueta.textContent = textoEtiqueta;

  tarjeta.dataset.originalTitulo = nuevoTitulo;
  tarjeta.dataset.originalHora = nuevaHora;
  tarjeta.setAttribute("data-notas", nuevasNotas);
  tarjeta.setAttribute("data-precio", nuevoPrecio);

  guardarItinerarioLocal();
  guardarItinerarioFirebase();
  cerrarModal();

  console.log("✏️ Evento actualizado:", evento);
};


function borrarTarjeta(tarjeta) {
  const titulo = tarjeta.querySelector(".titulo-evento")?.textContent;
  const hora = tarjeta.getAttribute("data-hora");

  const seccion = tarjeta.closest(".seccion-ubicacion");
  const ubicacion = seccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();

  const dia = tarjeta.closest(".dia-itinerario");
  const fecha = dia?.getAttribute("data-fecha");

  if (
    ubicacion &&
    fecha &&
    itinerarioData[ubicacion] &&
    itinerarioData[ubicacion][fecha]
  ) {
    itinerarioData[ubicacion][fecha].eventos = itinerarioData[ubicacion][fecha].eventos.filter(
      e => !(e.titulo === titulo && (e.hora || "") === (hora || ""))
    );
  } else {
    console.warn("❌ No se pudo eliminar: estructura no válida", { ubicacion, fecha });
  }

  tarjeta.remove();

  cerrarModal();
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
    console.log("📦 itinerarioData:", JSON.stringify(itinerarioData));
console.log("🌐 Online:", navigator.onLine);
console.log("🧪 db:", typeof db);
console.log("📍 Ruta:", window.rutaItinerario);

    return;
  }
console.log("💾 Guardando itinerario en ruta:", window.rutaItinerario);
  db.ref(window.rutaItinerario).set(itinerarioData)
    .then(() => console.log("☁️ Itinerario guardado en Firebase"))
    .catch(err => console.error("❌ Error al guardar en Firebase:", err));
}
window.guardarItinerarioFirebase = guardarItinerarioFirebase;



document.addEventListener("DOMContentLoaded", () => {
  if (navigator.onLine) {
    cargarItinerarioFirebase();
  } else {
    cargarItinerarioLocal();
  }
});


window.itinerarioData = itinerarioData;


document.addEventListener("touchend", (e) => {
  if (!tarjetaArrastrando) return;

  const touch = e.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
  const carouselDestino = dropTarget?.closest(".carousel-dia");

  if (!carouselDestino) {
    tarjetaArrastrando.classList.remove("arrastrando");
    tarjetaArrastrando = null;
    return;
  }

  carouselDestino.appendChild(tarjetaArrastrando);

  const nuevaSeccion = tarjetaArrastrando.closest(".seccion-ubicacion");
  const nuevaUbicacion = nuevaSeccion?.querySelector(".titulo-ubicacion")?.textContent?.trim();
  const nuevaDia = carouselDestino.closest(".dia-itinerario");
  const nuevaFecha = nuevaDia?.getAttribute("data-fecha");

  const titulo = tarjetaArrastrando.querySelector(".titulo-evento")?.textContent;
  const hora = tarjetaArrastrando.getAttribute("data-hora");

  const evento = itinerarioData[origenUbicacion]?.[origenFecha]?.eventos?.find(
    e => e.titulo === titulo && (e.hora || "") === (hora || "")
  );

  if (!evento) {
    console.warn("❌ Evento no encontrado al soltar.");
    tarjetaArrastrando.classList.remove("arrastrando");
    tarjetaArrastrando = null;
    return;
  }

  // Actualiza data
  itinerarioData[origenUbicacion][origenFecha].eventos = itinerarioData[origenUbicacion][origenFecha].eventos.filter(
    e => e !== evento
  );
  if (!itinerarioData[nuevaUbicacion][nuevaFecha]) {
    itinerarioData[nuevaUbicacion][nuevaFecha] = { eventos: [] };
  }
  itinerarioData[nuevaUbicacion][nuevaFecha].eventos.push(evento);

  guardarItinerarioLocal();
  guardarItinerarioFirebase();

  console.log("✅ Evento movido a:", nuevaUbicacion, nuevaFecha);

  tarjetaArrastrando.classList.remove("arrastrando");
  tarjetaArrastrando = null;
});
