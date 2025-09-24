// ===============================
// Patient Dashboard Script
// Author: Sai Lohith
// Built manually from scratch
// ===============================

// ---- API details ----
const API_URL    = "https://fedskillstest.coalitiontechnologies.workers.dev";
const BASIC_USER = "coalition";
const BASIC_PASS = "skills-test";
const DEFAULT_NAME = "Jessica Taylor";   // load this patient first

// months array to help sorting diagnosis history
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

// ---- small helper functions ----
const $  = (sel) => document.querySelector(sel);  // quick selector
const el = (tag, cls) => {                        // create element
  const n = document.createElement(tag); 
  if (cls) n.className = cls; 
  return n;
};

// simple debounce (for search input)
const debounce = (fn, ms=250) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

// safe way to pick last element from an array
const safeLast = (arr) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : undefined);

// sort diagnosis records based on year and month order
const sortByMonthYear = (a,b) => {
  const ya = (a && a.year) || 0, yb = (b && b.year) || 0;
  if (ya !== yb) return ya - yb;
  return MONTHS.indexOf(a && a.month || "") - MONTHS.indexOf(b && b.month || "");
};

// calculate age from DOB
function ageFromDOB(d){
  const dob = new Date(d); 
  if (isNaN(dob)) return "—";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m===0 && now.getDate() < dob.getDate())) age--;
  return age;
}

// ---- Fetch patients data from API ----
async function getPatients(){
  const res = await fetch(API_URL, {
    headers: { 
      "Accept":"application/json", 
      "Authorization":"Basic " + btoa(`${BASIC_USER}:${BASIC_PASS}`) 
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---- Render the left sidebar (patients list) ----
function renderRail(patients){
  const list = $("#patient-list");
  list.innerHTML = "";

  (patients || []).forEach(p => {
    const li   = el("li", "rail-item");
    const img  = el("img", "rail-avatar"); img.src = p.profile_picture || "";
    const meta = el("div", "rail-meta");
    const name = el("div", "rail-name"); name.textContent = p.name || "—";
    const sub  = el("div", "rail-sub");  sub.textContent  = `${p.gender || "—"}, ${ageFromDOB(p.date_of_birth)}`;
    meta.append(name, sub);
    li.append(img, meta);

    // when I click on a patient, load their details
    li.addEventListener("click", () => {
      document.querySelectorAll(".rail-item").forEach(n => n.classList.remove("active"));
      li.classList.add("active");
      renderDetail(p);
    });

    // highlight default patient
    if (p.name === DEFAULT_NAME) li.classList.add("active");
    list.append(li);
  });

  // handle search filter
  const filter = () => {
    const q = ($("#search").value || "").trim().toLowerCase();
    [...list.children].forEach(li => {
      const nmEl = li.querySelector(".rail-name");
      const nm = nmEl ? nmEl.textContent.toLowerCase() : "";
      li.style.display = nm.includes(q) ? "" : "none";
    });
  };
  $("#search").addEventListener("input", debounce(filter, 200));
}

// ---- Charts setup ----
let bpChart, hrSpark, rrSpark, tempSpark;

// background shading for blood pressure chart
const bpBandsPlugin = {
  id: 'bpBands',
  beforeDraw(chart) {
    const {ctx, chartArea, scales} = chart || {};
    if (!chartArea || !scales || !scales.y) return;
    const y = scales.y;
    const bands = [
      { min: 0,   max: 80,  color: 'rgba(236,72,153,0.06)' }, 
      { min: 80,  max: 120, color: 'rgba(16,185,129,0.08)' }, 
      { min: 120, max: 180, color: 'rgba(139,92,246,0.08)' }  
    ];
    ctx.save();
    bands.forEach(b => {
      const top = y.getPixelForValue(b.max);
      const bot = y.getPixelForValue(b.min);
      ctx.fillStyle = b.color;
      ctx.fillRect(chartArea.left, top, chartArea.right - chartArea.left, bot - top);
    });
    ctx.restore();
  }
};

// prepare BP series from diagnosis history
function buildBPFromDiagnosis(dh){
  const s = [...(dh || [])].sort(sortByMonthYear);
  const last = safeLast(s);
  return {
    labels   : s.map(d => `${(d && d.month ? d.month.slice(0,3) : "—")}, ${d && d.year || "—"}`),
    systolic : s.map(d => d?.blood_pressure?.systolic?.value ?? null),
    diastolic: s.map(d => d?.blood_pressure?.diastolic?.value ?? null),
    sysVal   : last?.blood_pressure?.systolic?.value || "—",
    diaVal   : last?.blood_pressure?.diastolic?.value || "—",
    sysNote  : last?.blood_pressure?.systolic?.levels || "—",
    diaNote  : last?.blood_pressure?.diastolic?.levels || "—",
    lastHR   : last?.heart_rate,
    lastRR   : last?.respiratory_rate,
    lastTemp : last?.temperature
  };
}

// draw blood pressure chart
function renderBPChart(series){
  const canvas = $("#bpChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (bpChart) bpChart.destroy();

  const ok = (series.systolic || []).some(v => v!=null) || (series.diastolic || []).some(v => v!=null);
  $("#bp-empty").classList.toggle("hidden", !!ok);
  if (!ok) return;

  bpChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: series.labels || [],
      datasets: [
        { label:"Systolic",  data:series.systolic || [],  borderColor:"#8b5cf6", backgroundColor:"rgba(139,92,246,.18)", borderWidth:3, tension:.35, pointRadius:3, fill:true },
        { label:"Diastolic", data:series.diastolic || [], borderColor:"#ec4899", backgroundColor:"rgba(236,72,153,.18)", borderWidth:3, tension:.35, pointRadius:3, fill:true }
      ]
    },
    options: {
      responsive:true, plugins:{ legend:{ display:false } },
      scales:{ y:{ grid:{ color:"#e2e8f0" } }, x:{ grid:{ color:"#f1f5f9" } } }
    },
    plugins: [bpBandsPlugin]
  });
}

// small sparkline charts inside tiles
function renderSpark(canvasId, refName, color, labels, data){
  const cEl = $(canvasId);
  if (!cEl) return;
  const c = cEl.getContext("2d");
  if (window[refName]) window[refName].destroy();
  const valid = Array.isArray(data) && data.some(v => v != null);
  if (!valid) { window[refName] = null; cEl.style.opacity = .4; return; }
  cEl.style.opacity = 1;

  window[refName] = new Chart(c, {
    type:'line',
    data:{ labels: labels || [], datasets:[{ data: data || [], borderColor: color, backgroundColor:'transparent', borderWidth:2, tension:.35, pointRadius:0 }] },
    options:{ responsive:true, plugins:{ legend:{ display:false }, tooltip:{ enabled:false } }, scales:{ x:{ display:false }, y:{ display:false } } }
  });
}

// ---- Render patient detail view ----
function renderDetail(p){
  const d = p || {};

  // profile info on right
  $("#patient-avatar").src = d.profile_picture || "";
  $("#patient-name").textContent = d.name || "—";
  $("#patient-dob").textContent = d.date_of_birth ? new Date(d.date_of_birth).toLocaleDateString() : "—";
  $("#patient-gender").textContent = d.gender || "—";
  $("#patient-phone").textContent = d.phone_number || "—";
  $("#patient-emergency").textContent = d.emergency_contact || "—";
  $("#patient-insurance").textContent = d.insurance_type || "—";

  // pick BP data (direct if present, else build from diagnosis history)
  let series;
  if (Array.isArray(d.blood_pressure) && d.blood_pressure.length) {
    const sorted = [...d.blood_pressure].sort((a,b)=> new Date(a.date)-new Date(b.date));
    const last = safeLast(sorted);
    series = {
      labels   : sorted.map(x => new Date(x.date).toLocaleDateString()),
      systolic : sorted.map(x => x?.systolic),
      diastolic: sorted.map(x => x?.diastolic),
      sysVal   : last?.systolic || "—",
      diaVal   : last?.diastolic || "—",
      sysNote  : "—",
      diaNote  : "—",
      lastHR   : null,
      lastRR   : null,
      lastTemp : null
    };
  } else {
    series = buildBPFromDiagnosis(d.diagnosis_history);
  }

  // fill in BP stats + chart
  $("#stat-sys").textContent = series.sysVal;
  $("#stat-sys-note").textContent = series.sysNote;
  $("#stat-dia").textContent = series.diaVal;
  $("#stat-dia-note").textContent = series.diaNote;
  renderBPChart(series);

  // vitals tiles and sparklines
  const dh = [...(d.diagnosis_history || [])].sort(sortByMonthYear).slice(-6);
  const labels = dh.map(x => (x && x.month ? x.month.slice(0,3) : "—"));
  const hr  = dh.map(x => x?.heart_rate?.value ?? null);
  const rr  = dh.map(x => x?.respiratory_rate?.value ?? null);
  const tmp = dh.map(x => x?.temperature?.value ?? null);

  const last = safeLast(dh);
  $("#tile-hr").textContent   = last?.heart_rate?.value ? `${last.heart_rate.value} bpm` : (hr.length && hr[hr.length-1] != null ? `${hr[hr.length-1]} bpm` : "—");
  $("#tile-hr-note").textContent = last?.heart_rate?.levels || "—";
  $("#tile-rr").textContent   = last?.respiratory_rate?.value ? `${last.respiratory_rate.value} bpm` : (rr.length && rr[rr.length-1] != null ? `${rr[rr.length-1]} bpm` : "—");
  $("#tile-rr-note").textContent = last?.respiratory_rate?.levels || "—";
  $("#tile-temp").textContent = last?.temperature?.value ? `${last.temperature.value}°F` : (tmp.length && tmp[tmp.length-1] != null ? `${tmp[tmp.length-1]}°F` : "—");
  $("#tile-temp-note").textContent = last?.temperature?.levels || "—";

  renderSpark('hrSpark',  'hrSpark',  '#ef4444', labels, hr);
  renderSpark('rrSpark',  'rrSpark',  '#3b82f6', labels, rr);
  renderSpark('tempSpark','tempSpark','#f59e0b', labels, tmp);

  // diagnostic list table
  const tbody = $("#diag-list-body");
  tbody.innerHTML = "";
  let diagList = d.diagnostic_list || d.diagnosticList || d.diagnosis_list || [];
  diagList = (Array.isArray(diagList) ? diagList : []).map(item => {
    if (typeof item === "string") return { name:item, description:"—", status:"—" };
    item = item || {};
    return {
      name: item.name || item.title || "—",
      description: item.description || item.desc || "—",
      status: item.status || item.state || "—"
    };
  });
  diagList.forEach(row => {
    const tr = el("tr");
    tr.innerHTML = `<td>${row.name}</td><td>${row.description}</td><td>${row.status}</td>`;
    tbody.append(tr);
  });

  // lab results list
  const labsEl = $("#lab-results");
  labsEl.innerHTML = "";
  let labResults = d.lab_results || d.labResults || [];
  labResults = (Array.isArray(labResults) ? labResults : []).map(item => {
    if (typeof item === "string") return item;
    item = item || {};
    return item.name || item.title || "Result";
  });
  labResults.forEach(name => {
    const li = el("li");
    li.textContent = name;
    labsEl.append(li);
  });
}

// ---- Boot sequence ----
async function boot(){
  try{
    const patients = await getPatients();
    renderRail(patients || []);
    const def = (patients || []).find(p => p.name === DEFAULT_NAME) || patients[0];
    if (def) renderDetail(def);
  }catch(err){
    console.error("Initial fetch failed:", err);
    alert("Failed to load data. See console for details.");
  }
}

// start when DOM is ready
document.addEventListener("DOMContentLoaded", boot);
