const themeButton = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("drbot-theme");

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#17211f" : "#f4f8f6");
  themeButton.setAttribute("aria-pressed", String(isDark));
  themeButton.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
  themeButton.querySelector(".theme-icon").textContent = isDark ? "☀" : "☾";
  themeButton.querySelector(".theme-label").textContent = isDark ? "Modo claro" : "Modo oscuro";
}

applyTheme(savedTheme === "dark" ? "dark" : "light");

themeButton.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("drbot-theme", nextTheme);
  applyTheme(nextTheme);
});
