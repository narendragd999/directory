const SHEET_URL = "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";

let allData = [];
let districtData = [];
let visibleList = [];

const cards = document.getElementById("cards");

/* 🔒 LOGIN */
function login() {
  const d = loginDistrict.value;
  const p = loginPass.value;
  if (DISTRICT_PASSWORDS[d] === p) {
    localStorage.setItem("district", d);
    initApp(d);
  } else alert("Wrong password");
}

function logout() {
  localStorage.clear();
  location.reload();
}

/* INIT */
function initApp(district) {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");
  fetchData(district);
}

/* FETCH + NORMALIZE */
async function fetchData(district) {
  let raw;
  if (localStorage.cachedData) {
    raw = JSON.parse(localStorage.cachedData);
  } else {
    raw = await fetch(SHEET_URL).then(r => r.json());
    localStorage.cachedData = JSON.stringify(raw);
  }

  // 🔧 CLEAN & NORMALIZE
  allData = raw
    .filter(r => r["Officer Name"])
    .map(r => ({
      sno: r["S.No."],
      name: r["Officer Name"],
      designation: r["Designation"],
      department: r["Office / Department"],
      district: r["Place / District"],
      mobile: cleanMobile(r["Contact No."]),
      email: r["E-Mail ID"]
    }));

  districtData = allData.filter(x => x.district === district);
  visibleList = districtData;

  populateFilters();
  render();
}

/* MOBILE CLEAN */
function cleanMobile(v) {
  if (!v) return "";
  return v.toString().replace(/\s+/g, "");
}

/* FILTERS */
function populateFilters() {
  fill("deptFilter", "department");
  fill("desigFilter", "designation");
}

function fill(id, key) {
  const s = document.getElementById(id);
  s.innerHTML = `<option value="">${id === "deptFilter" ? "Department" : "Designation"}</option>`;
  [...new Set(districtData.map(x => x[key]).filter(Boolean))]
    .forEach(v => s.innerHTML += `<option>${v}</option>`);
}

/* LIVE SEARCH */
searchBox.oninput = () => {
  const q = searchBox.value.toLowerCase();
  visibleList = districtData.filter(x =>
    x.name.toLowerCase().includes(q) ||
    x.mobile.includes(q)
  );
  render();
};

/* FILTER CHANGE */
document.querySelectorAll("select").forEach(s => s.onchange = applyFilter);

function applyFilter() {
  const d = deptFilter.value;
  const g = desigFilter.value;

  visibleList = districtData.filter(x =>
    (!d || x.department === d) &&
    (!g || x.designation === g)
  );
  render();
}

/* RENDER */
function render() {
  cards.innerHTML = visibleList.slice(0, 50).map(u => `
    <div class="card">
      <b>${u.name}</b><br>
      ${u.designation}<br>
      ${u.department}<br>
      ${u.district}<br>
      📞 <a href="tel:${u.mobile}">${u.mobile}</a><br>
      📧 ${u.email || ""}
    </div>
  `).join("");
}

/* AUTO LOGIN */
if (localStorage.district) {
  initApp(localStorage.district);
} else {
  Object.keys(DISTRICT_PASSWORDS)
    .forEach(d => loginDistrict.innerHTML += `<option>${d}</option>`);
}
