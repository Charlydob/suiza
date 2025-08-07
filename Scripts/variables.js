//================= VARIABLES GLOBALES 👇 ===================//

// 🌍 Mapa
let map;
let userMarker;
let searchCircle;
let currentCoords = null;
let watchId = null;
let seguimientoActivo = false;
let centrarMapaActivo = false;
let marcadorUbicacion = null;
let ubicacionReal = null;
let marcadorUbicacionReal = null;

// 📍 Marcadores por tipo
const markersPorTipo = {
  sitios_bonitos: [],
  gasolinera: [],
  parking: [],
  hotel: [],
  airbnb: [],
  luggage: [],
  airport: [],
  tourism: [],
  restaurant: [],
  cafe: [],
  hospital: [],
  favoritos: []
};

// 🖼️ Iconos
const iconos = {
  sitios_bonitos: 'Recursos/img/campingmapa.png',
  gasolinera: 'Recursos/img/gasolineramapa.png',
  parking: 'Recursos/img/parkingmapa.png',
  hotel: 'Recursos/img/hotelmapa.png',
  airbnb: 'Recursos/img/airbnbmapa.png',
  luggage: 'Recursos/img/maletamapa.png',
  airport: 'Recursos/img/aeropuertomapa.png',
  tourism: 'Recursos/img/turismomapa.png',
  restaurant: 'Recursos/img/restaurantemapa.png',
  cafe: 'Recursos/img/cafeteriamapa.png',
  hospital: 'Recursos/img/hospitalmapa.png'
};

// 🧭 Icono de ubicación del usuario
const iconoUbicacion = 'Recursos/img/yo.png';

// ✅ Estado de activación
const tipoActivo = {
  sitios_bonitos: false,
  gasolinera: false,
  parking: false,
  hotel: false,
  airbnb: false,
  luggage: false,
  airport: false,
  tourism: false,
  restaurant: false,
  cafe: false,
  hospital: false,
  favoritos: false
};

// ⭐ Favoritos / Ignorados
let favoritos = [];
let ignorados = JSON.parse(localStorage.getItem("ignorados") || "[]");
let marcadoresFavoritos = [];

//================= VARIABLES GLOBALES 👆 ===================//

// ---------- Utilidades mínimas ----------
if (typeof window.reportarError !== "function") {
  window.reportarError = (e) => {
    try { console.error(e); } catch (_) {}
  };
}
const $ = (sel, root = document) => root.querySelector(sel);
const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

// ---------- Firebase bootstrap (compat v8) ----------
(function initFirebaseGlue() {
  try {
    if (typeof firebase === "undefined") {
      console.warn("Firebase no encontrado. Modo offline.");
      return;
    }
    // Si la app ya está inicializada fuera, no tocamos nada.
    if (!firebase.apps || firebase.apps.length === 0) {
      // Opcional: permite inyectar config desde window.FIREBASE_CONFIG
      if (window.FIREBASE_CONFIG) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      } else {
        console.warn("firebase.apps vacío y sin FIREBASE_CONFIG. Asumiendo inicializada en otro script.");
      }
    }

    // Exponer db/auth globales si faltan
    if (!window.auth) window.auth = firebase.auth();
    if (!window.db && firebase.database) window.db = firebase.database();
  } catch (e) {
    reportarError(e);
  }
})();

// ---------- Autenticación y UI de acceso ----------
(function initAuthUI() {
  try {
    const loginBtn = $("#btn-login");
    const emailInp = $("#email");
    const passInp  = $("#password");
    const loginBox = $("#login-container");

    // Click de login (si existe la UI)
    on(loginBtn, "click", async () => {
      try {
        const email = (emailInp?.value || "").trim();
        const password = passInp?.value || "";
        if (!email || !password) return;

        if (!window.auth) throw new Error("Auth no disponible.");
        const cred = await auth.signInWithEmailAndPassword(email, password);
        console.log("✅ Usuario:", cred.user?.uid);

        if (loginBox) loginBox.style.display = "none";
        // Navegación móvil-first a itinerario (o hash previo)
        if (!location.hash) location.hash = "#/itinerario";
        else window.dispatchEvent(new HashChangeEvent("hashchange"));
      } catch (err) {
        reportarError(err);
        const box = $("#login-error");
        if (box) box.textContent = "Error: " + (err?.message || "Login fallido");
      }
    });

    // Cambios de sesión
    if (window.auth && typeof auth.onAuthStateChanged === "function") {
      auth.onAuthStateChanged((user) => {
        const paginaIt = $("#pagina-itinerario");
        if (user) {
          if (loginBox) loginBox.style.display = "none";
          if (paginaIt) paginaIt.style.display = ""; // lo gestiona el router por hash
          if (!location.hash) location.hash = "#/itinerario";
        } else {
          // Mostrar login si existe; mantener resto oculto
          if (loginBox) loginBox.style.display = "block";
        }
      });
    }
  } catch (e) {
    reportarError(e);
  }
})();
