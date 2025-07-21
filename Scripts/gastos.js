let monedaDestino = "CHF";
let gastosExtra = {};

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

  renderizarResumenGastos();
}

window.addEventListener("DOMContentLoaded", () => {
  const check = setInterval(() => {
    if (typeof itinerarioData === "object" && Object.keys(itinerarioData).length > 0) {
      console.log("✅ itinerarioData listo. Renderizando gastos...");
      renderizarResumenGastos();
      clearInterval(check);
    } else {
      console.log("⏳ Esperando a que itinerarioData esté disponible...");
    }
  }, 500);
});

window.renderizarResumenGastos = renderizarResumenGastos;
window.cambiarMonedaDestino = cambiarMonedaDestino;
window.añadirGastoManual = añadirGastoManual;
