import { auth, onAuthStateChanged, signOut } from "./firebase-client.js";

const action = document.querySelector("#home-session-action");
const loginHref = document.body.classList.contains("home-page") ? "static/login.html" : "login.html";

onAuthStateChanged(auth, (user) => {
  if (!action) return;
  if (!user) {
    action.classList.remove("sign-out");
    action.classList.add("sign-in");
    action.textContent = "Iniciar sesión";
    action.href = loginHref;
    action.onclick = null;
    return;
  }

  action.classList.remove("sign-in");
  action.classList.add("sign-out");
  action.textContent = "Cerrar sesión";
  action.href = "#cerrar-sesion";
  action.onclick = async (event) => {
    event.preventDefault();
    await signOut(auth);
    action.classList.remove("sign-out");
    action.classList.add("sign-in");
    action.textContent = "Iniciar sesión";
    action.href = loginHref;
    action.onclick = null;
  };
});

