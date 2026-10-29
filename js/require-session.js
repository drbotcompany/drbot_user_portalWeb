import { auth, onAuthStateChanged, signOut } from "./firebase-client.js";

const page = window.location.pathname.split("/").pop();
const signOutButton = document.querySelector("#sign-out");

signOutButton?.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (!user) {
    const loginUrl = new URL("login.html", window.location.href);
    loginUrl.searchParams.set("next", page);
    window.location.replace(loginUrl);
    return;
  }

  document.body.classList.remove("auth-checking");
});
