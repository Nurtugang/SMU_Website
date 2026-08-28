const I18N = window.I18N || {};

const GEN_CONFIG = {
  2: {
    endpoint: "/api/predict2",
    birthYearDefault: 1966,
    description: I18N.gen2_description,
    targets: {
      chapter_I: { label: I18N.target_chapter_I, bar: "bg-accent" },
      chapter_C: { label: I18N.target_chapter_C, bar: "bg-accent" },
      composite: { label: I18N.target_composite, bar: "bg-gold/60" },
    },
  },
  3: {
    endpoint: "/api/predict3",
    birthYearDefault: 1995,
    description: I18N.gen3_description,
    targets: {
      chapter_I: { label: I18N.target_chapter_I, bar: "bg-accent" },
      composite: { label: I18N.target_composite, bar: "bg-gold/60" },
    },
  },
};

const MODEL_LABELS = {
  logistic_regression: "Logistic Regression",
  random_forest: "Random Forest",
  xgboost: "XGBoost",
};

let currentGen = 2;

function setGeneration(gen) {
  currentGen = gen;
  const cfg = GEN_CONFIG[gen];

  document.getElementById("tabGen2").className =
    "gen-tab text-sm font-medium px-4 py-2 rounded-lg border transition-colors " +
    (gen === 2 ? "bg-accent text-white border-accent" : "bg-white text-muted border-divider hover:border-ink/30");
  document.getElementById("tabGen3").className =
    "gen-tab text-sm font-medium px-4 py-2 rounded-lg border transition-colors " +
    (gen === 3 ? "bg-accent text-white border-accent" : "bg-white text-muted border-divider hover:border-ink/30");

  document.getElementById("genDescription").textContent = cfg.description;
  document.getElementById("gen3Note").classList.toggle("hidden", gen !== 3);
  document.getElementById("birthYear").value = cfg.birthYearDefault;

  document.getElementById("resultsEmpty").classList.remove("hidden");
  document.getElementById("resultsPanel").classList.add("hidden");
  document.getElementById("resultsPanel").innerHTML = "";
}

function renderResults(data, targets) {
  const panel = document.getElementById("resultsPanel");
  panel.innerHTML = "";

  for (const [modelKey, modelLabel] of Object.entries(MODEL_LABELS)) {
    const preds = data[modelKey];
    if (!preds) continue;

    const card = document.createElement("div");
    card.className = "border border-divider rounded-lg p-4";

    let html = `<p class="text-sm font-semibold text-ink mb-3">${modelLabel}</p><div class="space-y-3">`;
    for (const [targetKey, targetCfg] of Object.entries(targets)) {
      if (!(targetKey in preds)) continue;
      const pct = (preds[targetKey] * 100).toFixed(1);
      html += `
        <div>
          <div class="flex justify-between items-baseline mb-1">
            <p class="text-sm text-muted">${targetCfg.label}</p>
            <p class="font-mono text-sm font-bold text-ink">${pct}%</p>
          </div>
          <div class="h-1.5 bg-divider rounded-full overflow-hidden">
            <div class="h-full ${targetCfg.bar} rounded-full" style="width:${pct}%"></div>
          </div>
        </div>`;
    }
    html += "</div>";
    card.innerHTML = html;
    panel.appendChild(card);
  }

  document.getElementById("resultsEmpty").classList.add("hidden");
  panel.classList.remove("hidden");
}

document.getElementById("predictForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  const errorEl = document.getElementById("formError");
  errorEl.classList.add("hidden");
  btn.disabled = true;
  btn.textContent = I18N.calculating;

  const cfg = GEN_CONFIG[currentGen];
  const payload = {
    father_dose: +document.getElementById("fatherDose").value,
    mother_dose: +document.getElementById("motherDose").value,
    sex: +document.getElementById("sex").value,
    birth_year: +document.getElementById("birthYear").value,
    father_dose_available: +document.getElementById("fatherDoseAvailable").value,
    mother_dose_available: +document.getElementById("motherDoseAvailable").value,
  };

  try {
    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    renderResults(await res.json(), cfg.targets);
  } catch (err) {
    errorEl.textContent = I18N.error_prefix + err.message;
    errorEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = I18N.submit;
  }
});

setGeneration(2);
