document.addEventListener("DOMContentLoaded", () => {
  const btnNuevoEvento = document.getElementById("btn-nuevo-evento");
  const modal = document.getElementById("modal-edicion-evento");
  const tipoEntrada = document.getElementById("tipoEntrada");
  const formManual = document.getElementById("formManual");
  const formFavorito = document.getElementById("formFavorito");
  const selectorFavoritos = document.getElementById("selectorFavoritos");

  // Abrir el modal
  btnNuevoEvento.addEventListener("click", () => {
    abrirModalEdicion();
  });

  // Cambiar entre modos
  tipoEntrada.addEventListener("change", () => {
    const tipo = tipoEntrada.value;
    formManual.style.display = tipo === "manual" ? "block" : "none";
    formFavorito.style.display = tipo === "favorito" ? "block" : "none";
  });

  // Cargar favoritos en el desplegable
  cargarFavoritosEnSelector();

  // 👇 Eventualmente podríamos renderizar el itinerario completo aquí
  // renderizarItinerario();
});

function abrirModalEdicion() {
  document.getElementById("modal-edicion-evento").style.display = "block";
}

function cerrarModalEdicion() {
  document.getElementById("modal-edicion-evento").style.display = "none";
}

function cargarFavoritosEnSelector() {
  const selector = document.getElementById("selectorFavoritos");
  selector.innerHTML = "";

  if (!Array.isArray(favoritos) || favoritos.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No hay favoritos";
    selector.appendChild(opt);
    return;
  }

  // Ordenar por nombre alfabéticamente
  const favoritosOrdenados = [...favoritos].sort((a, b) => {
    const nA = a.datosPersonalizados?.nombre?.toLowerCase() || "";
    const nB = b.datosPersonalizados?.nombre?.toLowerCase() || "";
    return nA.localeCompare(nB);
  });

  favoritosOrdenados.forEach(f => {
    const nombre = f.datosPersonalizados?.nombre || f.id;
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = nombre;
    selector.appendChild(option);
  });
}
function guardarEventoDesdeModal() {
  const tipoEntrada = document.getElementById("tipoEntrada").value;
  console.log("📝 Tipo de entrada seleccionada:", tipoEntrada);

  let evento = null;

  if (tipoEntrada === "manual") {
    const nombre = document.getElementById("eventoNombre").value.trim();
    const ubicacion = document.getElementById("eventoUbicacion").value.trim();
    const categoria = document.getElementById("eventoCategoria").value;
    const hora = document.getElementById("eventoHora").value;
    const notas = document.getElementById("eventoNotas").value.trim();
    const dia = document.getElementById("eventoDia").value;

    console.log("🧾 Datos manuales:", { nombre, ubicacion, categoria, hora, notas, dia });

    if (!nombre || !ubicacion || !categoria || !dia) {
      alert("Faltan datos obligatorios.");
      return;
    }

    evento = {
      id: `evento_${Date.now()}`,
      categoria,
      nombre,
      ubicacion,
      hora,
      notas,
      dia
    };
  }

  if (tipoEntrada === "favorito") {
    const favoritoId = document.getElementById("selectorFavoritos").value;
    const dia = document.getElementById("favoritoDia").value;
    const favorito = favoritos.find(f => f.id === favoritoId);

    console.log("📦 Importando favorito:", favoritoId, favorito);

    if (!favorito || !dia) {
      alert("Seleccioná un favorito válido y un día.");
      return;
    }

    evento = {
      id: `evento_${Date.now()}`,
      categoria: favorito.tipo || "otros",
      nombre: favorito.datosPersonalizados?.nombre || favorito.id,
      ubicacion: favorito.ubicacion || "Ubicación desconocida",
      hora: "", // No se extrae hora del favorito
      notas: favorito.datosPersonalizados?.notas || "",
      dia
    };
  }

  if (!evento) {
    console.warn("❌ No se pudo crear el evento.");
    return;
  }

  console.log("✅ Evento listo para guardar:", evento);

  // Guardar en Firebase
  const ref = db.ref(`itinerario/${evento.dia}/${evento.id}`);
  ref.set(evento)
    .then(() => {
      console.log("☁️ Evento guardado en Firebase");
      cerrarModalEdicion();
      renderizarItinerario(); // volver a cargar todo el itinerario
    })
    .catch(err => {
      console.error("❌ Error al guardar el evento en Firebase:", err);
    });
}
diasOrdenados.forEach(dia => {
  const eventos = Object.values(data[dia]);

  const diaDiv = document.createElement("div");
  diaDiv.className = "dia-itinerario";
  diaDiv.dataset.dia = dia;

  const tituloDia = document.createElement("h3");
  tituloDia.textContent = formatearFecha(dia);
  diaDiv.appendChild(tituloDia);

  // 🔵 Permitir soltar tarjetas aquí 👇
  diaDiv.addEventListener("dragover", e => {
    e.preventDefault(); // Necesario para permitir drop
    diaDiv.style.backgroundColor = "#eef"; // opcional: feedback
  });

  diaDiv.addEventListener("dragleave", () => {
    diaDiv.style.backgroundColor = "";
  });

  diaDiv.addEventListener("drop", e => {
    e.preventDefault();
    diaDiv.style.backgroundColor = "";

    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    const evento = JSON.parse(data);
    const nuevoDia = diaDiv.dataset.dia;

    console.log(`📥 Evento ${evento.id} soltado en ${nuevoDia}`);

    if (evento.dia === nuevoDia) {
      console.log("↪️ Mismo día. No se mueve.");
      return;
    }

    const refAntiguo = db.ref(`itinerario/${evento.dia}/${evento.id}`);
    const refNuevo = db.ref(`itinerario/${nuevoDia}/${evento.id}`);

    refAntiguo.remove()
      .then(() => {
        evento.dia = nuevoDia;
        return refNuevo.set(evento);
      })
      .then(() => {
        console.log("✅ Evento movido con éxito");
        renderizarItinerario();
      })
      .catch(err => {
        console.error("❌ Error al mover evento:", err);
      });
  });
  // 🔵 Hasta aquí el bloque DnD

  eventos.sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

  eventos.forEach(ev => {
    const tarjeta = crearTarjetaEvento(ev);
    diaDiv.appendChild(tarjeta);
  });

  contenedor.appendChild(diaDiv);
});

function crearTarjetaEvento(ev) {
  const tarjeta = document.createElement("div");
  tarjeta.className = `evento-tarjeta categoria-${ev.categoria}`;
  tarjeta.dataset.id = ev.id;
  tarjeta.dataset.dia = ev.dia;
  tarjeta.draggable = true; // ✅ Esto es clave

  tarjeta.addEventListener("click", () => {
    mostrarDetalleEvento(ev);
  });

  // 🟢 Drag start
  tarjeta.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", JSON.stringify(ev));
    console.log("🚚 Drag iniciado:", ev.id);
  });

  // Contenido visible
  const nombre = document.createElement("strong");
  nombre.textContent = ev.nombre;

  const ubicacion = document.createElement("span");
  ubicacion.textContent = ev.ubicacion;

  const categoria = document.createElement("span");
  categoria.className = "evento-categoria";
  categoria.textContent = ev.categoria;

  tarjeta.appendChild(nombre);
  tarjeta.appendChild(ubicacion);
  tarjeta.appendChild(categoria);

  return tarjeta;
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long"
  });
}
function mostrarDetalleEvento(ev) {
  console.log("👁️ Mostrando detalle del evento:", ev);

  const detalle = document.getElementById("detalleEvento");
  const contenido = document.getElementById("detalleContenidoEvento");

  // Ocultar itinerario
  document.getElementById("pagina-itinerario").style.display = "none";
  detalle.style.display = "block";
  contenido.innerHTML = ""; // Limpiar vista anterior

  // Crear elementos
  const titulo = document.createElement("h2");
  titulo.textContent = ev.nombre;

  const categoria = document.createElement("p");
  categoria.innerHTML = `<strong>Categoría:</strong> ${ev.categoria}`;

  const ubicacion = document.createElement("p");
  ubicacion.innerHTML = `<strong>Ubicación:</strong> ${ev.ubicacion}`;

  const hora = document.createElement("p");
  hora.innerHTML = `<strong>Hora:</strong> ${ev.hora || "Sin hora definida"}`;

  const notas = document.createElement("p");
  notas.innerHTML = `<strong>Notas:</strong> ${ev.notas || "Sin observaciones"}`;

  const dia = document.createElement("p");
  dia.innerHTML = `<strong>Día:</strong> ${formatearFecha(ev.dia)}`;

  // Append
  contenido.appendChild(titulo);
  contenido.appendChild(dia);
  contenido.appendChild(categoria);
  contenido.appendChild(ubicacion);
  contenido.appendChild(hora);
  contenido.appendChild(notas);
}
function cerrarDetalleEvento() {
  document.getElementById("detalleEvento").style.display = "none";
  document.getElementById("pagina-itinerario").style.display = "block";
  console.log("↩️ Volviendo al itinerario");
}
