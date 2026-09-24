const REFRESH_MS = 2000;
const PULSE_HISTORY_LENGTH = 60; // how many CPU readings to keep for the sparkline

let cpuHistory = [];

// ---------- helpers ----------

function formatDuration(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function levelFor(percent) {
  if (percent >= 85) return "bad";
  if (percent >= 60) return "warn";
  return "good";
}

function colorFor(level) {
  return { good: "#34D399", warn: "#FBBF24", bad: "#F87171" }[level];
}

function setBar(barEl, percent) {
  const level = levelFor(percent);
  barEl.style.width = `${Math.min(percent, 100)}%`;
  barEl.style.background = colorFor(level);
}

// ---------- clock ----------

function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// ---------- pulse canvas ----------

function drawPulse() {
  const canvas = document.getElementById("pulse-canvas");
  // Match canvas pixel size to its displayed size for a crisp line
  canvas.width = canvas.clientWidth;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (cpuHistory.length < 2) return;

  const step = w / (PULSE_HISTORY_LENGTH - 1);
  const latest = cpuHistory[cpuHistory.length - 1];

  ctx.beginPath();
  ctx.strokeStyle = colorFor(levelFor(latest));
  ctx.lineWidth = 2;

  cpuHistory.forEach((value, i) => {
    const x = i * step;
    const y = h - (value / 100) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

// ---------- main update loop ----------

async function refreshMetrics() {
  let data;
  try {
    const response = await fetch("/api/metrics");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (err) {
    setStatus("bad", "Disconnected");
    console.error("Failed to fetch metrics:", err);
    return;
  }

  // Overall status pill reflects the worst of CPU/memory/disk
  const worst = Math.max(data.cpu.percent, data.memory.percent, data.disk.percent);
  const worstLevel = levelFor(worst);
  const statusText = worstLevel === "good" ? "Healthy" : worstLevel === "warn" ? "Elevated load" : "Critical";
  setStatus(worstLevel, statusText);

  // CPU
  document.getElementById("cpu-percent").textContent = `${data.cpu.percent.toFixed(1)}%`;
  document.getElementById("cpu-cores").textContent = `${data.cpu.core_count} cores`;
  setBar(document.getElementById("cpu-bar"), data.cpu.percent);
  renderCoreGrid(data.cpu.per_core);

  // Pulse
  cpuHistory.push(data.cpu.percent);
  if (cpuHistory.length > PULSE_HISTORY_LENGTH) cpuHistory.shift();
  document.getElementById("cpu-pulse-value").textContent = `${data.cpu.percent.toFixed(1)}%`;
  drawPulse();

  // Memory
  document.getElementById("mem-percent").textContent = `${data.memory.percent.toFixed(1)}%`;
  document.getElementById("mem-detail").textContent = `${data.memory.used_gb} / ${data.memory.total_gb} GB`;
  setBar(document.getElementById("mem-bar"), data.memory.percent);

  // Disk
  document.getElementById("disk-percent").textContent = `${data.disk.percent.toFixed(1)}%`;
  document.getElementById("disk-detail").textContent = `${data.disk.used_gb} / ${data.disk.total_gb} GB`;
  setBar(document.getElementById("disk-bar"), data.disk.percent);

  // Network
  document.getElementById("net-sent").textContent = `\u2191 ${data.network.sent_mb} MB`;
  document.getElementById("net-recv").textContent = `\u2193 ${data.network.received_mb} MB`;

  // Uptime
  document.getElementById("host-uptime").textContent = formatDuration(data.uptime_seconds);
  document.getElementById("app-uptime").textContent = formatDuration(data.app_uptime_seconds);

  // Processes
  renderProcessTable(data.top_processes);

  document.getElementById("last-updated").textContent =
    `Last updated ${new Date(data.timestamp * 1000).toLocaleTimeString()}`;
}

function setStatus(level, text) {
  const dot = document.getElementById("status-dot");
  dot.className = `dot ${level}`;
  document.getElementById("status-text").textContent = text;
}

function renderCoreGrid(perCoreValues) {
  const grid = document.getElementById("core-grid");
  grid.innerHTML = "";
  perCoreValues.forEach((value) => {
    const cell = document.createElement("div");
    cell.className = "core-cell";
    cell.style.background = colorFor(levelFor(value));
    cell.title = `${value.toFixed(0)}%`;
    grid.appendChild(cell);
  });
}

function renderProcessTable(processes) {
  const tbody = document.getElementById("process-table-body");
  tbody.innerHTML = "";

  if (!processes.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="muted">No process data available</td></tr>`;
    return;
  }

  processes.forEach((proc) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${proc.pid}</td>
      <td>${proc.name}</td>
      <td>${proc.cpu_percent.toFixed(1)}%</td>
      <td>${proc.memory_percent.toFixed(1)}%</td>
    `;
    tbody.appendChild(row);
  });
}

// Redraw the pulse line cleanly if the window is resized
window.addEventListener("resize", drawPulse);

// Kick things off
refreshMetrics();
setInterval(refreshMetrics, REFRESH_MS);
