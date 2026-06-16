// ── Data ──
const models = [
  { target: "Chapter I",  model: "LR",      auc: 0.800, avgPrec: 0.338, brier: 0.191 },
  { target: "Chapter I",  model: "RF",       auc: 0.814, avgPrec: 0.386, brier: 0.177 },
  { target: "Chapter I",  model: "XGBoost",  auc: 0.818, avgPrec: 0.404, brier: 0.174 },
  { target: "Chapter C",  model: "LR",       auc: 0.766, avgPrec: 0.129, brier: 0.206 },
  { target: "Chapter C",  model: "RF",       auc: 0.776, avgPrec: 0.173, brier: 0.163 },
  { target: "Chapter C",  model: "XGBoost",  auc: 0.765, avgPrec: 0.173, brier: 0.157 },
  { target: "Composite",  model: "LR",       auc: 0.812, avgPrec: 0.434, brier: 0.183 },
  { target: "Composite",  model: "RF",       auc: 0.829, avgPrec: 0.504, brier: 0.172 },
  { target: "Composite",  model: "XGBoost",  auc: 0.835, avgPrec: 0.527, brier: 0.168 },
];

// ── Metrics table ──
const tbody = document.getElementById("perfTable");
let lastTarget = "";
models.forEach((m) => {
  const isXGB = m.model === "XGBoost";
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="px-4 py-3 text-sm ${lastTarget !== m.target ? "font-medium text-ink" : "text-faint"}">${lastTarget !== m.target ? m.target : ""}</td>
    <td class="px-4 py-3 font-mono text-sm ${isXGB ? "font-bold text-ink" : "text-muted"}">${m.model}</td>
    <td class="px-4 py-3 text-right font-mono text-sm ${isXGB ? "font-bold text-accent" : "text-ink"}">${m.auc.toFixed(3)}</td>
    <td class="px-4 py-3 text-right font-mono text-sm text-ink">${m.avgPrec.toFixed(3)}</td>
    <td class="px-4 py-3 text-right font-mono text-sm text-muted">${m.brier.toFixed(3)}</td>
  `;
  tbody.appendChild(row);
  lastTarget = m.target;
});

function toggleMetricsTable() {
  const panel = document.getElementById("metricsTablePanel");
  const btn = document.getElementById("tableToggleBtn");
  const isHidden = panel.classList.toggle("hidden");
  btn.textContent = isHidden ? "Показать таблицу метрик ↓" : "Скрыть таблицу ↑";
}

// ── AUC chart (horizontal grouped) ──
const aucCtx = document.getElementById("aucChart").getContext("2d");
new Chart(aucCtx, {
  type: "bar",
  data: {
    labels: ["Chapter I", "Chapter C", "Composite"],
    datasets: [
      { label: "LR",      data: [0.800, 0.766, 0.812], backgroundColor: "#C4CDD8", borderRadius: 3, borderSkipped: false },
      { label: "RF",      data: [0.814, 0.776, 0.829], backgroundColor: "#4EA88A", borderRadius: 3, borderSkipped: false },
      { label: "XGBoost", data: [0.818, 0.765, 0.835], backgroundColor: "#2D4A7A", borderRadius: 3, borderSkipped: false },
    ],
  },
  options: {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { family: "Space Grotesk", size: 12 }, color: "#6B7280", padding: 14, boxWidth: 10, boxHeight: 10 },
      },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.x.toFixed(3)}` },
        bodyFont:  { family: "Space Mono", size: 13 },
        titleFont: { family: "Space Grotesk", size: 13 },
      },
    },
    scales: {
      x: {
        min: 0.70, max: 0.88,
        ticks: { callback: (v) => v.toFixed(2), font: { family: "Space Mono", size: 11 }, color: "#6B7280" },
        grid: { color: "#E2E6EB" },
        title: { display: true, text: "AUC-ROC", font: { family: "Space Grotesk", size: 12 }, color: "#6B7280" },
      },
      y: {
        ticks: { font: { family: "Space Grotesk", size: 13 }, color: "#1A1D23" },
        grid: { display: false },
      },
    },
  },
});

// ── SHAP chart ──
const shapCtx = document.getElementById("shapChart").getContext("2d");
const shapLabels = ["birth_year", "mother dose", "mean parent dose", "father dose", "max parent dose", "mother available", "father available", "sex"];
const shapValues = [2.00, 0.25, 0.22, 0.20, 0.18, 0.10, 0.08, 0.05];
const shapColors = shapValues.map((_, i) => i === 0 ? "#B8811F" : i < 5 ? "#2D4A7A" : "#C4CDD8");
new Chart(shapCtx, {
  type: "bar",
  data: {
    labels: shapLabels,
    datasets: [{
      label: "Mean |SHAP|",
      data: shapValues,
      backgroundColor: shapColors,
      borderRadius: 3,
      borderSkipped: false,
    }],
  },
  options: {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` Mean |SHAP| = ${ctx.parsed.x.toFixed(2)}` },
        bodyFont: { family: "Space Mono", size: 13 },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Mean |SHAP value|", font: { family: "Space Grotesk", size: 12 }, color: "#6B7280" },
        ticks: { font: { family: "Space Mono", size: 11 }, color: "#6B7280" },
        grid: { color: "#E2E6EB" },
      },
      y: {
        ticks: { font: { family: "Space Mono", size: 12 }, color: "#1A1D23" },
        grid: { display: false },
      },
    },
  },
});
