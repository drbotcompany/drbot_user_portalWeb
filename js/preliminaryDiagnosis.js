const API_BASE = "http://localhost:8000";

const schemaStatus = document.querySelector("#schema-status");
const form = document.querySelector("#diagnosis-form");
const symptomSearch = document.querySelector("#symptom-search");
const symptomOptions = document.querySelector("#symptom-options");
const selectedCount = document.querySelector("#selected-count");
const submitButton = document.querySelector("#diagnosis-submit");
const status = document.querySelector("#diagnosis-status");
const result = document.querySelector("#diagnosis-result");
const predictedDisease = document.querySelector("#predicted-disease");
const predictionConfidence = document.querySelector("#prediction-confidence");
const alternativePredictions = document.querySelector("#alternative-predictions");

function updateSelectedCount() {
  const count = symptomOptions.querySelectorAll('input[type="checkbox"]:checked').length;
  selectedCount.textContent = `${count} ${count === 1 ? "síntoma seleccionado" : "síntomas seleccionados"}`;
}

function addSymptom(symptom) {
  const label = document.createElement("label");
  label.className = "symptom-option";
  label.dataset.search = `${symptom.label} ${symptom.name}`.toLocaleLowerCase();

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = "symptoms";
  checkbox.value = symptom.name;
  checkbox.addEventListener("change", updateSelectedCount);

  const text = document.createElement("span");
  text.textContent = symptom.label;

  label.append(checkbox, text);
  symptomOptions.append(label);
}

async function loadSchema() {
  try {
    const response = await fetch(`${API_BASE}/schema`);
    const schema = await response.json();
    if (!response.ok) {
      throw new Error(schema.detail || `Error HTTP ${response.status}`);
    }
    if (!Array.isArray(schema.symptoms) || schema.symptoms.length === 0) {
      throw new Error("La API no ha devuelto la lista de síntomas.");
    }

    symptomOptions.replaceChildren();
    schema.symptoms.forEach(addSymptom);
    submitButton.disabled = false;
    schemaStatus.textContent =
      `Lista cargada: ${schema.symptoms.length} síntomas disponibles para seleccionar.`;
  } catch (error) {
    schemaStatus.textContent =
      `No se pudieron cargar los síntomas: ${error.message}. Arranca la API y entrena el modelo desde app.py.`;
  }
}

symptomSearch?.addEventListener("input", () => {
  const query = symptomSearch.value.trim().toLocaleLowerCase();
  for (const option of symptomOptions.querySelectorAll(".symptom-option")) {
    option.hidden = !option.dataset.search.includes(query);
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.hidden = true;
  submitButton.disabled = true;
  status.textContent = "Calculando la predicción…";

  const symptoms = [...symptomOptions.querySelectorAll('input[type="checkbox"]:checked')]
    .map((checkbox) => checkbox.value);

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });
    const data = await response.json();
    if (!response.ok) {
      const detail = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join("; ")
        : data.detail;
      throw new Error(detail || `Error HTTP ${response.status}`);
    }

    predictedDisease.textContent = data.disease;
    const confidence = Number(data.confidence);
    predictionConfidence.textContent = Number.isFinite(confidence)
      ? `Confianza estimada por el modelo: ${(confidence * 100).toFixed(1)}%`
      : "";

    alternativePredictions.replaceChildren();
    for (const prediction of data.top_predictions ?? []) {
      if (prediction.disease === data.disease) continue;
      const item = document.createElement("li");
      item.textContent =
        `${prediction.disease} · ${(Number(prediction.confidence) * 100).toFixed(1)}%`;
      alternativePredictions.append(item);
    }

    result.hidden = false;
    status.textContent =
      "Predicción calculada. Es orientativa y no sustituye una evaluación profesional.";
  } catch (error) {
    status.textContent = `No se pudo obtener la predicción: ${error.message}`;
  } finally {
    submitButton.disabled = false;
  }
});

loadSchema();

