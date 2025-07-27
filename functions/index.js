/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

const fetch = require("node-fetch");

const GOOGLE_GEOCODING_API_KEY = "AIzaSyA8KhfGc61uBT3DHS1hiCEl7HgnFYaWySI"; // Protegida, no la pongas en frontend

exports.geolocalizarCiudad = onRequest(async (req, res) => {
  const ciudad = req.query.ciudad;
  if (!ciudad) {
    return res.status(400).json({ error: "Falta el parámetro ciudad" });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(ciudad + ", Suiza")}&key=${GOOGLE_GEOCODING_API_KEY}`;
    const respuesta = await fetch(url);
    const data = await respuesta.json();

    if (data.status === "OK") {
      const loc = data.results[0].geometry.location;
      return res.status(200).json({ lat: loc.lat, lng: loc.lng });
    } else {
      return res.status(500).json({ error: "Geocoding falló", status: data.status });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error interno", detalles: error.message });
  }
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
