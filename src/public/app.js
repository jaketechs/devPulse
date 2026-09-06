// ── DevPulse Frontend ──
// Vanilla JS — fetches from API and renders with Chart.js

const API = ""; // same origin

// ── Helpers ──
function $(id) {
  return document.getElementById(id);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  return h + "h ago";
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Chart.js Defaults ──
Chart.defaults.color = "#555";
Chart.defaults.borderColor = "#222";
Chart.defaults.font.family = "'JetBrains Mono', 'Consolas', monospace";
Chart.defaults.font.size = 11;

// ── Doughnut Charts (CPU & Memory) ──
function createRingChart(canvasId, value, color) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [value, 100 - value],
          backgroundColor: [color, "#1a1a1a"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "75%",
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { duration: 400 },
    },
  });
}

let cpuRing = createRingChart("cpu-ring", 0, "#3b82f6");
let memRing = createRingChart("mem-ring", 0, "#8b5cf6");

function updateRing(chart, value) {
  chart.data.datasets[0].data = [value, 100 - value];
  chart.update("none");
}

// ── History Line Chart ──
const historyCtx = document.getElementById("history-chart").getContext("2d");
const historyChart = new Chart(historyCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "CPU %",
        data: [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.08)",
        borderWidth: 1.5,
        pointRadius: 0,
        pointHitRadius: 6,
        fill: true,
        tension: 0.3,
      },
      {
        label: "Memory %",
        data: [],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.08)",
        borderWidth: 1.5,
        pointRadius: 0,
        pointHitRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        ticks: { maxTicksAuto: true, maxRotation: 0, autoSkipPadding: 40 },
        grid: { display: false },
      },
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v) => v + "%", stepSize: 25 },
        grid: { color: "#1a1a1a" },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          boxWidth: 10,
          boxHeight: 2,
          usePointStyle: false,
          padding: 16,
          color: "#888",
        },
      },
      tooltip: {
        backgroundColor: "#1a1a1a",
        borderColor: "#333",
        borderWidth: 1,
        titleColor: "#888",
        bodyColor: "#e5e5e5",
        cornerRadius: 4,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function (ctx) {
            return ctx.dataset.label + ": " + ctx.parsed.y.toFixed(1) + "%";
          },
        },
      },
    },
    animation: { duration: 300 },
  },
});

// ── Fetch: Status ──
async function fetchStatus() {
  try {
    const res = await fetch(API + "/api/status");
    const data = await res.json();
    const up = data.http_ok;
    const banner = $("status-banner");
    const dot = $("header-dot");

    banner.dataset.status = up ? "up" : "down";
    dot.dataset.status = up ? "up" : "down";
    $("status-label").textContent = up
      ? "All Systems Operational"
      : "Service Down";
    $("status-time").textContent =
      "checked " +
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    $("status-banner").dataset.status = "down";
    $("header-dot").dataset.status = "down";
    $("status-label").textContent = "Unable to reach API";
  }
}

// ── Fetch: Metrics ──
async function fetchMetrics() {
  try {
    const res = await fetch(API + "/api/metrics");
    const data = await res.json();

    const cpu = data.cpu_pct ?? 0;
    const mem = data.mem_pct ?? 0;

    $("cpu-value").innerHTML =
      cpu.toFixed(1) + '<span class="metric-unit">%</span>';
    $("mem-value").innerHTML =
      mem.toFixed(1) + '<span class="metric-unit">%</span>';

    updateRing(cpuRing, cpu);
    updateRing(memRing, mem);

    // ── Sync: push the live data point onto the history chart ──
    // so the line graph always matches the doughnut rings
    const timeLabel = formatTime(data.ts ?? new Date().toISOString());
    const labels = historyChart.data.labels;
    const cpuData = historyChart.data.datasets[0].data;
    const memData = historyChart.data.datasets[1].data;

    // Only append if we actually have chart data and this is a new point
    if (labels.length > 0 && labels[labels.length - 1] !== timeLabel) {
      labels.push(timeLabel);
      cpuData.push(cpu);
      memData.push(mem);

      // Cap at 120 points to prevent unbounded growth
      const maxPoints = 120;
      if (labels.length > maxPoints) {
        labels.shift();
        cpuData.shift();
        memData.shift();
      }

      historyChart.update("none");
    } else if (labels.length > 0) {
      // Same timestamp — update the last point value to stay in sync
      cpuData[cpuData.length - 1] = cpu;
      memData[memData.length - 1] = mem;
      historyChart.update("none");
    }
  } catch (e) {
    // silently retry on next tick
  }
}

// ── Fetch: Range ──
let currentRange = 30; // minutes

async function fetchRange(minutes) {
  currentRange = minutes;
  const now = new Date();
  const from = new Date(now.getTime() - minutes * 60 * 1000);

  try {
    const res = await fetch(
      API +
        "/api/metrics/range?from=" +
        from.toISOString() +
        "&to=" +
        now.toISOString(),
    );
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      historyChart.data.labels = [];
      historyChart.data.datasets[0].data = [];
      historyChart.data.datasets[1].data = [];
      historyChart.update();
      return;
    }

    // Downsample if too many points (keep ~120 points max for readability)
    let points = data;
    if (data.length > 120) {
      const step = Math.ceil(data.length / 120);
      points = data.filter((_, i) => i % step === 0);
    }

    historyChart.data.labels = points.map((p) => formatTime(p.ts));
    historyChart.data.datasets[0].data = points.map((p) => p.cpu_pct);
    historyChart.data.datasets[1].data = points.map((p) => p.mem_pct);
    historyChart.update();
  } catch (e) {
    // silently retry
  }
}

// ── Chart range buttons ──
document.querySelectorAll(".chart-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".chart-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    fetchRange(parseInt(btn.dataset.range));
  });
});

// ── Fetch: Deploys ──
async function fetchDeploys() {
  try {
    const res = await fetch(API + "/api/deploys");
    const data = await res.json();
    const tbody = $("deploys-body");

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="empty-text">No deploys recorded yet</td></tr>';
      return;
    }

    tbody.innerHTML = data
      .map(
        (d) => `
      <tr data-deploy-id="${d.id}" onclick="toggleHealth(this, ${d.id})">
        <td><span class="deploy-sha">${(d.commit_sha || "—").substring(0, 7)}</span></td>
        <td><span class="deploy-branch">${d.branch || "—"}</span></td>
        <td><span class="deploy-status" data-status="${(d.status || "").toLowerCase()}">${d.status || "—"}</span></td>
        <td><span class="deploy-time">${timeAgo(d.ts)}</span></td>
      </tr>
    `,
      )
      .join("");
  } catch (e) {
    $("deploys-body").innerHTML =
      '<tr><td colspan="4" class="empty-text">Failed to load deploys</td></tr>';
  }
}

// ── Toggle Deploy Health ──
async function toggleHealth(row, deployId) {
  const existing = row.nextElementSibling;
  if (existing && existing.classList.contains("deploy-health-row")) {
    existing.remove();
    return;
  }

  // Remove any other open health rows
  document.querySelectorAll(".deploy-health-row").forEach((r) => r.remove());

  const healthRow = document.createElement("tr");
  healthRow.classList.add("deploy-health-row");
  healthRow.innerHTML =
    '<td colspan="4"><div class="deploy-health"><span class="loading-text" style="padding:8px 0">Loading health…</span></div></td>';
  row.after(healthRow);

  try {
    const res = await fetch(API + "/api/deploys/" + deployId + "/health");
    const h = await res.json();

    const verdictClass =
      h.verdict === "healthy" ? "verdict-healthy" : "verdict-degraded";

    healthRow.innerHTML = `
      <td colspan="4">
        <div class="deploy-health">
          <div class="health-item">
            <div class="health-item-label">Verdict</div>
            <div class="health-item-value ${verdictClass}">${h.verdict}</div>
          </div>
          <div class="health-item">
            <div class="health-item-label">CPU Before</div>
            <div class="health-item-value">${(h.averageCpuBefore ?? 0).toFixed(1)}%</div>
          </div>
          <div class="health-item">
            <div class="health-item-label">CPU After</div>
            <div class="health-item-value">${(h.averageCpuAfter ?? 0).toFixed(1)}%</div>
          </div>
          <div class="health-item">
            <div class="health-item-label">Mem Before</div>
            <div class="health-item-value">${(h.averageMemoryBefore ?? 0).toFixed(1)}%</div>
          </div>
          <div class="health-item">
            <div class="health-item-label">Mem After</div>
            <div class="health-item-value">${(h.averageMemAfter ?? 0).toFixed(1)}%</div>
          </div>
        </div>
      </td>
    `;
  } catch (e) {
    healthRow.innerHTML =
      '<td colspan="4"><div class="deploy-health"><span class="empty-text" style="padding:8px 0">Failed to load health data</span></div></td>';
  }
}

// ── Update header time ──
function updateHeaderTime() {
  $("header-time").textContent = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Init & Polling ──
async function init() {
  updateHeaderTime();
  await Promise.all([
    fetchStatus(),
    fetchMetrics(),
    fetchRange(30),
    fetchDeploys(),
  ]);

  // Poll every 5s
  setInterval(() => {
    fetchStatus();
    fetchMetrics();
    updateHeaderTime();
  }, 5000);

  // Refresh history chart every 30s
  setInterval(() => {
    fetchRange(currentRange);
  }, 30000);

  // Refresh deploys every 60s
  setInterval(fetchDeploys, 60000);
}

init();
