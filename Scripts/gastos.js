window.addEventListener("DOMContentLoaded", () => {
  renderizarResumenGastos();
});

let gastosExtra = {}; // formato: { "2025-09-05": [ {concepto, cantidad} ] }

function renderizarResumenGastos() {
  const contenedor = document.getElementById("contenedor-gastos-dias");
  contenedor.innerHTML = "";

  const dias = obtenerDiasDesdeItinerario(); // ← función que debes tener o crear
  let totalGeneral = 0;

  dias.forEach(dia => {
    const gastosEventos = obtenerGastosDeEventos(dia); // ← función a definir
    const gastosFavoritos = obtenerGastosDeFavoritos(dia); // ← función a definir
    const gastosManuales = gastosExtra[dia] || [];

    const totalDia = [...gastosEventos, ...gastosFavoritos, ...gastosManuales]
      .reduce((sum, g) => sum + parseFloat(g.cantidad || 0), 0);

    totalGeneral += totalDia;

    const divDia = document.createElement("div");
    divDia.className = "gasto-dia";
    divDia.innerHTML = `
      <h4>${dia}</h4>
      <ul>
        ${gastosEventos.map(g => `<li>🎫 ${g.concepto || "Evento"}: ${g.cantidad} CHF</li>`).join("")}
        ${gastosFavoritos.map(g => `<li>⭐ ${g.concepto || "Favorito"}: ${g.cantidad} CHF</li>`).join("")}
        ${gastosManuales.map(g => `<li>✍️ ${g.concepto}: ${g.cantidad} CHF</li>`).join("")}
      </ul>
      <div class="gasto-extra">
        <input type="text" placeholder="Nuevo gasto (p. ej. propinas)">
        <input type="number" placeholder="CHF">
        <button onclick="añadirGastoManual('${dia}', this)">＋ Añadir</button>
      </div>
      <p class="total-dia">Total del día: ${totalDia.toFixed(2)} CHF</p>
    `;
    contenedor.appendChild(divDia);
  });

  document.getElementById("gastos-total").textContent = `${totalGeneral.toFixed(2)} CHF`;
}

function añadirGastoManual(dia, btn) {
  const inputs = btn.parentElement.querySelectorAll("input");
  const concepto = inputs[0].value.trim();
  const cantidad = parseFloat(inputs[1].value);

  if (!concepto || isNaN(cantidad)) return;

  if (!gastosExtra[dia]) gastosExtra[dia] = [];
  gastosExtra[dia].push({ concepto, cantidad });

  renderizarResumenGastos(); // volver a pintar
}
