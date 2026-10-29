import {
  auth,
  authErrorMessage,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "./firebase-client.js";

const form = document.querySelector("#auth-form");
const errorMessage = document.querySelector("#auth-error");
const submitButton = document.querySelector("#submit-button");
const requestedDestination = new URLSearchParams(location.search).get("next") || "../index.html";
const destination = /^[a-z0-9-]+\.html$/i.test(requestedDestination) ? requestedDestination : "../index.html";

onAuthStateChanged(auth, (user) => {
  if (user) location.replace(destination);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = "Conectando…";
  const values = new FormData(form);
  const email = String(values.get("email") || "").trim();
  const password = String(values.get("password") || "");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.replace(destination);
  } 
  catch (error) {
    errorMessage.textContent = authErrorMessage(error);
    errorMessage.hidden = false;
    submitButton.disabled = false;
    submitButton.textContent = "Iniciar sesión";
  }
});
