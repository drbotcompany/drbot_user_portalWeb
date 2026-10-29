import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgk-bPW7VKpYB_iQCZve64r9q6xmI6W34",
  authDomain: "drbot-app.firebaseapp.com",
  projectId: "drbot-app",
  messagingSenderId: "668754273407",
  appId: "1:668754273407:web:e5d504abcbc2d58794cb4a",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { collection, collectionGroup, doc, getDoc, getDocs, onAuthStateChanged, query, signInWithEmailAndPassword, signOut, where };

export function authErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "El correo o la contraseña no son correctos.";
    case "auth/too-many-requests":
      return "Se han producido demasiados intentos. Prueba más tarde.";
    case "auth/network-request-failed":
      return "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.";
    case "permission-denied":
      return "Firebase ha rechazado la lectura. Comprueba las reglas de Firestore.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese correo electrónico.";
    case "auth/weak-password":
      return "La contraseña es demasiado débil. Usa al menos 6 caracteres.";
    case "auth/invalid-email":
      return "Introduce un correo electrónico válido.";
    default:
      return error?.message || "No se pudieron cargar los datos.";
  }
}

export function displayValue(value, fallback = "No registrado") {
  if (value === null || value === undefined || String(value).trim() === "") return fallback;
  return String(value);
}

export function renderMessage(container, message, className = "empty-state") {
  container.replaceChildren();
  const item = document.createElement("p");
  item.className = className;
  item.textContent = message;
  container.append(item);
}

export function formatDate(value, includeTime = false) {
  let date = value;
  if (value && typeof value.toDate === "function") date = value.toDate();
  else if (typeof value === "string" || typeof value === "number") date = new Date(value);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-ES", includeTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "long" }).format(date);
}

export function startPatientSession(loadPatientData) {
  const main = document.querySelector("main.content");
  const footer = document.querySelector("body > footer");
  const signOutButton = document.querySelector("#sign-out");
  const gate = document.createElement("section");
  gate.className = "auth-gate";
  gate.hidden = true;
  gate.innerHTML = `
    <div class="auth-panel">
      <span class="auth-mark" aria-hidden="true">+</span>
      <span class="eyebrow">PORTAL DE PACIENTES</span>
      <h1>Inicia sesión</h1>
      <p class="auth-description">Accede con tu cuenta de DRBOT para consultar tus datos de salud.</p>
      <form class="auth-form" id="patient-login-form">
        <label>Correo electrónico<input name="email" type="email" autocomplete="username" required></label>
        <label>Contraseña<input name="password" type="password" autocomplete="current-password" required></label>
        <button type="submit">Entrar a mi carpeta</button>
        <p class="auth-error" id="patient-login-error" role="alert" hidden></p>
      </form>
      <p class="auth-switch">El registro se realiza desde la aplicación móvil DRBOT. Esta web es informativa.</p>
    </div>`;
  main.prepend(gate);
  main.dataset.auth = "signed-out";
  if (footer) footer.hidden = true;

  const form = gate.querySelector("#patient-login-form");
  const error = gate.querySelector("#patient-login-error");
  let stateVersion = 0;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Conectando…";
    error.hidden = true;
    try {
      const formData = new FormData(form);
      await signInWithEmailAndPassword(auth, formData.get("email").trim(), formData.get("password"));
    } catch (caught) {
      error.textContent = authErrorMessage(caught);
      error.hidden = false;
      button.disabled = false;
      button.textContent = "Entrar a mi carpeta";
    }
  });

  signOutButton?.addEventListener("click", () => signOut(auth));
  onAuthStateChanged(auth, async (user) => {
    const version = ++stateVersion;
    main.querySelectorAll(".firebase-error").forEach((item) => item.remove());
    if (!user) {
      main.dataset.auth = "signed-out";
      gate.hidden = false;
      if (footer) footer.hidden = true;
      if (signOutButton) signOutButton.hidden = true;
      form.reset();
      const button = form.querySelector("button[type=submit]");
      button.disabled = false;
      button.textContent = "Entrar a mi carpeta";
      return;
    }
    gate.hidden = true;
    main.dataset.auth = "loading";
    if (footer) footer.hidden = false;
    if (signOutButton) signOutButton.hidden = false;
    try {
      await loadPatientData(user);
      if (version !== stateVersion) return;
      main.dataset.auth = "signed-in";
    } catch (caught) {
      if (version !== stateVersion) return;
      main.dataset.auth = "signed-in";
      const errorPanel = document.createElement("p");
      errorPanel.className = "firebase-error";
      errorPanel.setAttribute("role", "alert");
      errorPanel.textContent = authErrorMessage(caught);
      main.insertBefore(errorPanel, gate.nextSibling);
    }
  });
}
