let gastosExtra = {};
let monedaDestino = "CHF";
const rutaGastos = "gastos/charlyylaura";

const tasasCambio = {
  EUR: 1.0,
  CHF: 0.9318,
  USD: 1.09
};

function convertirMoneda(cantidad, desde, hacia) {
  if (!desde || !cantidad) return 0;
  if (desde === hacia) return parseFloat(cantidad);
  const cantidadEUR = parseFloat(cantidad) / tasasCambio[desde];
  return cantidadEUR * tasasCambio[hacia];
}

function cambiarMonedaDestino() {
  const select = document.getElementById("monedaDestino");
  monedaDestino = select.value;
  guardarGastosFirebase();
  renderizarResumenGastos();
}

function añadirGastoManual(fecha, btn) {
  const inputs = btn.parentElement.querySelectorAll("input");
  const select = btn.parentElement.querySelector("select");
  const concepto = inputs[0].value.trim();
  const cantidad = parseFloat(inputs[1].value);
  const moneda = select.value;

  if (!concepto || isNaN(cantidad)) return;

  if (!gastosExtra[fecha]) gastosExtra[fecha] = [];
  gastosExtra[fecha].push({ concepto, cantidad, moneda });

  guardarGastosFirebase();
  renderizarResumenGastos();
}

function renderizarResumenGastos() {
  const contenedor = document.getElementById("contenedor-gastos-dias");
  contenedor.innerHTML = "";
  if (typeof itinerarioData !== "object") return;

  const select = document.getElementById("monedaDestino");
  if (select) select.value = monedaDestino;

  let totalGeneral = 0;
  const agrupado = {};

  for (const [fecha, datosDia] of Object.entries(itinerarioData)) {
    if (!datosDia.eventos || !Array.isArray(datosDia.eventos)) continue;

    const ubicacion = datosDia.ubicacion || "Sin ubicación";
    if (!agrupado[ubicacion]) agrupado[ubicacion] = {};

    agrupado[ubicacion][fecha] = datosDia.eventos
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

  document.getElementById("gastos-total").textContent = `${totalGeneral.toFixed(2)} ${monedaDestino}`;
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
    .then(() => console.log("☁️ Gastos guardados en Firebase"))
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
        console.log("🧾 Gastos cargados desde Firebase:", data);
      } else {
        console.log("📂 Firebase vacío, iniciando con valores por defecto.");
      }
      renderizarResumenGastos();
    })
    .catch(err => {
      console.error("❌ Error al cargar gastos desde Firebase:", err);
      renderizarResumenGastos();
    });
}

window.addEventListener("DOMContentLoaded", cargarGastosFirebase);
