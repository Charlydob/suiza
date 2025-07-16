// Scripts/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIRkX0m-qORww2kcYl_mbXm6IKh7j02dc",
  authDomain: "suizaapp.firebaseapp.com",
  databaseURL: "https://suizaapp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "suizaapp",
  storageBucket: "suizaapp.firebasestorage.app",
  messagingSenderId: "780629642721",
  appId: "1:780629642721:web:f8d2c33e1766b293ab96a0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rutaFavoritos = ref(db, "favoritos/charlyylaura");

export { db, rutaFavoritos };
