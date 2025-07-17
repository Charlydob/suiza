//VERIFICACIÓN EN LOG
try {
  // Test de existencia de variables clave
  if (typeof map === "undefined") throw new Error("❌ Variable 'map' no está definida.");
  if (typeof userMarker === "undefined") throw new Error("❌ Variable 'userMarker' no está definida.");
  if (typeof iconos !== "object" || !iconos.camping) throw new Error("❌ Iconos no definidos correctamente.");
  if (typeof tipoActivo !== "object" || !("camping" in tipoActivo)) throw new Error("❌ tipoActivo mal definido.");
  if (!Array.isArray(favoritos)) throw new Error("❌ 'favoritos' no es un array.");
  if (typeof guardarListas !== "function") throw new Error("❌ Función 'guardarListas' no disponible.");

  // Test funcional: intentar guardar (simulado)
  console.log("✅ Ejecutando prueba de guardarListas...");
  guardarListas();
  console.log("✅ Variables globales cargadas correctamente y guardarListas() funciona.");
} catch (error) {
  // Mostrar error en consola y en pantalla
  if (typeof reportarError === "function") {
    reportarError(error);
  } else {
    console.error("❌ Error en variables.js:", error.message);
    alert("⚠️ Error al cargar variables.js:\n" + error.message);
  }
}