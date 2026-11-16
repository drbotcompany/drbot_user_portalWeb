const API_BASE = "http://localhost:8000";

const schemaStatus = document.querySelector("#schema-status");
const form = document.querySelector("#diagnosis-form");
const submitButton = document.querySelector("#diagnosis-submit");
const status = document.querySelector("#diagnosis-status");
const result = document.querySelector("#diagnosis-result");
const predictionList = document.querySelector("#prediction-list");
const resultModel = document.querySelector("#result-model");

async function checkSchema() {
  try {
    const response = await fetch(`${API_BASE}/schema`);
    const schema = await response.json();
    if (!response.ok) {
      throw new Error(schema.detail || `Error HTTP ${response.status}`);
    }

    const modelFields = new Set(
      schema.features.map((feature) => feature.name.trim().toLowerCase()),
    );
    const formFields = [...form.querySelectorAll("[name]")]
      .map((field) => field.name.trim().toLowerCase());
    const missing = formFields.filter((name) => !modelFields.has(name));

    if (missing.length) {
      throw new Error(
        `El modelo no incluye estos campos: ${missing.join(", ")}. Vuelve a entrenarlo con el CSV actual.`,
      );
    }

    schemaStatus.textContent =
      `Conectado. Se predecirán: ${schema.targets.join(", ")}.`;
  } catch (error) {
    schemaStatus.textContent =
      `Los campos están visibles. No se pudo comprobar el modelo: ${error.message}. Inicia la API y entrena con el CSV actual.`;
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.hidden = true;
  submitButton.disabled = true;
  status.textContent = "Calculando las tres predicciones…";

  const values = Object.fromEntries(new FormData(form).entries());
  for (const input of form.querySelectorAll('input[type="number"]')) {
    values[input.name] = Number(values[input.name]);
  }

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      const detail = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join("; ")
        : data.detail;
      throw new Error(detail || `Error HTTP ${response.status}`);
    }

    predictionList.replaceChildren();
    const targetLabels = {
      Disease: "Enfermedad",
      Severity: "Severidad",
      Plan_Treatment: "Plan de tratamiento",
    };

    for (const [name, prediction] of Object.entries(data.predicciones ?? {})) {
      const term = document.createElement("dt");
      term.textContent = targetLabels[name] ?? name;

      const description = document.createElement("dd");
      description.textContent = prediction.valor;
      const confidence = Number(prediction.confianza);
      if (Number.isFinite(confidence)) {
        description.textContent +=
          ` · confianza del modelo ${(confidence * 100).toFixed(1)}%`;
      }
      predictionList.append(term, description);
    }

    if (Object.keys(data.predicciones ?? {}).length !== 3) {
      throw new Error("La API no devolvió las tres predicciones.");
    }

    resultModel.textContent = data.modelo
      ? `Modelo utilizado: ${data.modelo}`
      : "";
    result.hidden = false;
    status.textContent =
      "Predicciones calculadas. Son orientativas y no sustituyen la valoración profesional.";
  } catch (error) {
    status.textContent =
      `No se pudieron obtener las predicciones: ${error.message}`;
  } finally {
    submitButton.disabled = false;
  }
});

checkSchema();

