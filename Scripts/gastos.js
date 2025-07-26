let monedaDestino = "CHF";
let gastosExtra = {};
function guardarGastosFirebase() {
  if (!navigator.onLine || typeof db === "undefined") {
    console.warn("📴 Sin conexión, no se guarda en Firebase.");
    return;
  }

  const datos = {
    monedaDestino,
    gastosExtra
  };

  db.ref(rutaGastos).set(datos)
    .then(() => console.log("☁️ Gastos guardados en Firebase:", datos))
    .catch(err => console.error("❌ Error al guardar gastos:", err));
}

function cargarGastosFirebase() {
  if (!navigator.onLine || typeof db === "undefined") {
    console.warn("📴 Sin conexión, no se carga de Firebase.");
    renderizarResumenGastos();
    return;
  }

  db.ref(rutaGastos).once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (data) {
        monedaDestino = data.monedaDestino || "CHF";
        gastosExtra = data.gastosExtra || {};
        console.log("☁️ Gastos cargados desde Firebase:", data);
      } else {
        console.log("📂 Firebase vacío, usando valores por defecto.");
      }
      renderizarResumenGastos();
    })
    .catch(err => {
      console.error("❌ Error al cargar gastos desde Firebase:", err);
      renderizarResumenGastos();
    });
}

const tasasCambio = {
  EUR: 1.0,
  CHF: 0.9318,
  USD: 1.09
};

function convertirMoneda(cantidad, desde, hacia) {
  if (!desde || !cantidad) return 0;
  if (desde === hacia) return parseFloat(cantidad);
  const cantidadEUR = parseFloat(cantidad) / tasasCambio[desde];
  const resultado = cantidadEUR * tasasCambio[hacia];
  console.log(`💱 Convertido ${cantidad} ${desde} → ${resultado.toFixed(2)} ${hacia}`);
  return resultado;
}

function renderizarResumenGastos() {
  const contenedor = document.getElementById("contenedor-gastos-dias");
  contenedor.innerHTML = "";
  if (typeof itinerarioData !== "object") {
    console.warn("❌ itinerarioData no es un objeto válido:", itinerarioData);
    return;
  }

  const select = document.getElementById("monedaDestino");
  if (select) select.value = monedaDestino;

  console.log("🧩 Renderizando gastos con moneda:", monedaDestino);
  let totalGeneral = 0;
  const agrupado = {};
  const fechasUbicacion = [];

  // Agrupar por ubicación → fechas → eventos
  for (const [ubicacion, fechas] of Object.entries(itinerarioData)) {
    for (const [fecha, datosDia] of Object.entries(fechas)) {
      if (!datosDia.eventos || !Array.isArray(datosDia.eventos)) continue;

      if (!agrupado[ubicacion]) agrupado[ubicacion] = {};
      if (!agrupado[ubicacion][fecha]) agrupado[ubicacion][fecha] = [];

      agrupado[ubicacion][fecha].push(...datosDia.eventos
        .filter(e => parseFloat(e.precio))
        .map(e => {
          const precio = parseFloat(e.precio.toString().replace(",", "."));
          const moneda = e.moneda || "EUR";
          const convertido = convertirMoneda(precio, moneda, monedaDestino);
          return {
            tipo: e.tipo,
            titulo: e.titulo,
            etiqueta: e.etiquetaEvento,
            precioOriginal: `${precio.toFixed(2)} ${moneda}`,
            precioConvertido: `${convertido.toFixed(2)} ${monedaDestino}`,
            valorNumerico: convertido
          };
        }));
    }

    // Guardar la primera fecha de esta ubicación
    const fechasOrdenadas = Object.keys(fechas).sort();
    if (fechasOrdenadas.length > 0) {
      fechasUbicacion.push({ ubicacion, fecha: fechasOrdenadas[0] });
    }
  }

  // Ordenar ubicaciones según la fecha más temprana asociada
  fechasUbicacion.sort((a, b) => a.fecha.localeCompare(b.fecha));

  for (const { ubicacion } of fechasUbicacion) {
    const fechas = agrupado[ubicacion];
    const divUbicacion = document.createElement("div");
    divUbicacion.className = "gasto-ubicacion";
    let totalUbicacion = 0;
    let html = `<h3>${ubicacion}</h3>`;

    const fechasOrdenadas = Object.keys(fechas).sort();
    for (const fecha of fechasOrdenadas) {
      const eventos = fechas[fecha];
      let subtotal = 0;

      html += `<h4>${fecha}</h4><ul>`;

      for (const e of eventos) {
        html += `
          <li>
            <strong>${e.titulo}</strong> – ${e.etiqueta} – ${e.precioOriginal} → <strong>${e.precioConvertido}</strong>
          </li>`;
        subtotal += e.valorNumerico;
      }

      // Gastos manuales (por fecha)
      const manuales = (gastosExtra[fecha] || []).map((g, i) => {
        const convertido = convertirMoneda(g.cantidad, g.moneda, monedaDestino);
        subtotal += convertido;
        return `
          <li>
            <strong>${g.concepto}</strong> – Manual – ${g.cantidad.toFixed(2)} ${g.moneda} → <strong>${convertido.toFixed(2)} ${monedaDestino}</strong>
            <button onclick="eliminarGastoManual('${fecha}', ${i})">❌</button>
          </li>`;
      }).join("");

      if (manuales) {
        html += manuales;
      }

      html += `</ul>
        <div class="gasto-extra">
          <input type="text" placeholder="Nuevo gasto">
          <input type="number" placeholder="Cantidad">
          <select>
            <option value="EUR">EUR</option>
            <option value="CHF">CHF</option>
            <option value="USD">USD</option>
          </select>
          <button onclick="añadirGastoManual('${fecha}', this)">＋ Añadir</button>
        </div>
        <p class="total-dia">Subtotal día ${fecha}: ${subtotal.toFixed(2)} ${monedaDestino}</p>`;

      totalUbicacion += subtotal;
    }

    html += `<p class="total-ubicacion">Total ${ubicacion}: ${totalUbicacion.toFixed(2)} ${monedaDestino}</p>`;

    divUbicacion.innerHTML = html;
    contenedor.appendChild(divUbicacion);
    totalGeneral += totalUbicacion;
  }

  document.getElementById("gastos-total").textContent = `${totalGeneral.toFixed(2)} ${monedaDestino}`;
}



function eliminarGastoManual(fecha, indice) {
  if (!gastosExtra[fecha] || !gastosExtra[fecha][indice]) return;
  const eliminado = gastosExtra[fecha].splice(indice, 1)[0];
  console.log("🗑️ Gasto manual eliminado:", eliminado, "→", fecha);
  guardarGastosFirebase();
  renderizarResumenGastos();
}
window.eliminarGastoManual = eliminarGastoManual;

function cambiarMonedaDestino() {
  const select = document.getElementById("monedaDestino");
  monedaDestino = select.value;
  console.log("🪙 Moneda destino cambiada a:", monedaDestino);
  renderizarResumenGastos();
}

function añadirGastoManual(fecha, btn) {
  const inputs = btn.parentElement.querySelectorAll("input");
  const select = btn.parentElement.querySelector("select");
  const concepto = inputs[0].value.trim();
  const cantidad = parseFloat(inputs[1].value);
  const moneda = select.value;

  if (!concepto || isNaN(cantidad)) {
    console.warn("⚠️ Gasto manual inválido:", concepto, cantidad);
    return;
  }

  if (!gastosExtra[fecha]) gastosExtra[fecha] = [];
  gastosExtra[fecha].push({ concepto, cantidad, moneda });
  console.log("📝 Gasto manual añadido:", concepto, cantidad, moneda, "→", fecha);

  guardarGastosFirebase();
renderizarResumenGastos();

}

window.addEventListener("DOMContentLoaded", () => {
  const check = setInterval(() => {
    if (typeof itinerarioData === "object" && Object.keys(itinerarioData).length > 0) {
      console.log("✅ itinerarioData listo. Renderizando gastos...");
      cargarGastosFirebase();
      clearInterval(check);
    } else {
      console.log("⏳ Esperando a que itinerarioData esté disponible...");
    }
  }, 500);
});

window.renderizarResumenGastos = renderizarResumenGastos;
window.cambiarMonedaDestino = cambiarMonedaDestino;
window.añadirGastoManual = añadirGastoManual;
window.cargarGastosFirebase = cargarGastosFirebase;