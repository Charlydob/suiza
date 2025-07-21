let gastosExtra = {};
let monedaDestino = "CHF";
const rutaGastos = "gastos/charlyylaura";

const tasasCambio = {
  EUR: 1.0,
  CHF: 0.9318,
  USD: 1.09
};
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

  for (const [fecha, datosDia] of Object.entries(itinerarioData)) {
    if (!datosDia.eventos || !Array.isArray(datosDia.eventos)) {
      console.log(`📭 Día sin eventos válidos: ${fecha}`, datosDia);
      continue;
    }

    const ubicacion = datosDia.ubicacion || "Sin ubicación";
    if (!agrupado[ubicacion]) agrupado[ubicacion] = {};

    console.log(`📅 Procesando fecha ${fecha} en ${ubicacion}...`);

    agrupado[ubicacion][fecha] = datosDia.eventos
      .filter(e => {
        const valido = parseFloat(e.precio);
        if (!valido) console.log("❌ Evento sin precio válido:", e);
        return valido;
      })
      .map(e => {
        const precio = parseFloat(e.precio.toString().replace(",", "."));
        const moneda = e.moneda || "EUR";
        const convertido = convertirMoneda(precio, moneda, monedaDestino);

        const eventoFormateado = {
          tipo: e.tipo,
          titulo: e.titulo,
          etiqueta: e.etiquetaEvento,
          precioOriginal: `${precio.toFixed(2)} ${moneda}`,
          precioConvertido: `${convertido.toFixed(2)} ${monedaDestino}`,
          valorNumerico: convertido
        };

        console.log("✅ Evento con precio válido:", eventoFormateado);
        return eventoFormateado;
      });
  }

  for (const [ubicacion, fechas] of Object.entries(agrupado)) {
    for (const [fecha, eventos] of Object.entries(fechas)) {
      const manuales = (gastosExtra[fecha] || []).map(g => {
        const convertido = convertirMoneda(g.cantidad, g.moneda, monedaDestino);
        return {
          tipo: "manual",
          titulo: g.concepto,
          etiqueta: "Manual",
          precioOriginal: `${g.cantidad.toFixed(2)} ${g.moneda}`,
          precioConvertido: `${convertido.toFixed(2)} ${monedaDestino}`,
          valorNumerico: convertido
        };
      });

      const todos = [...eventos, ...manuales];
      const totalDia = todos.reduce((s, e) => s + e.valorNumerico, 0);
      totalGeneral += totalDia;

      console.log(`📦 Día ${fecha} en ${ubicacion}:`, todos, `→ Total: ${totalDia.toFixed(2)} ${monedaDestino}`);

      const div = document.createElement("div");
      div.className = "gasto-dia";
      div.innerHTML = `
        <h3>${ubicacion}</h3>
        <h4>${fecha}</h4>
        <ul>
          ${todos.map(e => `
            <li><strong>${e.titulo}</strong> – ${e.etiqueta} – ${e.precioOriginal} → <strong>${e.precioConvertido}</strong></li>
          `).join("")}
        </ul>
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
        <p class="total-dia">Total: ${totalDia.toFixed(2)} ${monedaDestino}</p>
      `;
      contenedor.appendChild(div);
    }
  }

  console.log("💰 Total general:", totalGeneral.toFixed(2), monedaDestino);
  document.getElementById("gastos-total").textContent = `${totalGeneral.toFixed(2)} ${monedaDestino}`;
}
function mostrarPagina(id) {
  document.querySelectorAll(".pagina").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === "pagina-gastos") {
    console.log("👀 Mostrando sección de gastos...");
    renderizarResumenGastos();
  }
}
function convertirMoneda(cantidad, desde, hacia) {
  if (!desde || !cantidad) return 0;
  if (desde === hacia) return parseFloat(cantidad);
  const cantidadEUR = parseFloat(cantidad) / tasasCambio[desde];
  const resultado = cantidadEUR * tasasCambio[hacia];
  console.log(`💱 Convertido ${cantidad} ${desde} → ${resultado.toFixed(2)} ${hacia}`);
  return resultado;
}

function cambiarMonedaDestino() {
  const select = document.getElementById("monedaDestino");
  monedaDestino = select.value;
  console.log("🪙 Moneda destino cambiada a:", monedaDestino);
  guardarGastosFirebase();
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

window.addEventListener("DOMContentLoaded", () => {
  const check = setInterval(() => {
    if (typeof itinerarioData === "object" && Object.keys(itinerarioData).length > 0) {
      console.log("✅ itinerarioData listo. Cargando gastos...");
      cargarGastosFirebase();
      renderizarResumenGastos(); // 👈 ESTA LÍNEA FALTABA
      clearInterval(check);
    } else {
      console.log("⏳ Esperando a que itinerarioData esté disponible...");
    }
  }, 500);
});



window.renderizarResumenGastos = renderizarResumenGastos;
window.cargarGastosFirebase = cargarGastosFirebase;
window.cambiarMonedaDestino = cambiarMonedaDestino;
window.añadirGastoManual = añadirGastoManual;
db.ref(window.rutaItinerario).once("value")
  .then(snapshot => {
    const data = snapshot.val() || {};
    window.itinerarioData = data;
    renderizarItinerario(); // o lo que toque
  });

window.itinerarioData = {};