/* ===============================
   CONFIG
================================ */
const APP_PASSWORD = "1254"; // 🔐 change this
const SHEET_URL =
  "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";
const PAGE_SIZE = 20;

/* ===============================
   LOGIN ELEMENTS
================================ */
const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const appPassword = document.getElementById("appPassword");
const loginError = document.getElementById("loginError");

/* ===============================
   APP STATE
================================ */
let allData = [];
let filteredData = [];
let page = 1;

let selectedDept = "";
let selectedDesig = "";
let selectedDistrict = "";

/* ===============================
   CHECK LOGIN FIRST
================================ */
if (sessionStorage.getItem("APP_UNLOCKED") === "YES") {
  unlockApp();
} else {
  lockApp();
}

loginBtn.onclick = () => {
  if (appPassword.value === APP_PASSWORD) {
    sessionStorage.setItem("APP_UNLOCKED", "YES");
    unlockApp();
  } else {
    loginError.textContent = "Wrong password";
  }
};

/* ===============================
   LOCK / UNLOCK
================================ */
function lockApp() {
  loginScreen.style.display = "flex";
  app.style.display = "none";
}

function unlockApp() {
  loginScreen.style.display = "none";
  app.style.display = "block";
  initApp(); // 🔑 START APP ONLY HERE
}

/* ===============================
   MAIN APP INIT
================================ */
function initApp() {

  /* ELEMENTS (INSIDE INIT) */
  const cards = document.getElementById("cards");
  const searchBox = document.getElementById("searchBox");

  const deptInput = document.getElementById("deptInput");
  const desigInput = document.getElementById("desigInput");
  const districtInput = document.getElementById("districtInput");

  const deptDropdown = document.getElementById("deptDropdown");
  const desigDropdown = document.getElementById("desigDropdown");
  const districtDropdown = document.getElementById("districtDropdown");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  /* FETCH DATA */
  fetch(SHEET_URL)
    .then(r => r.json())
    .then(raw => {
      allData = raw
        .filter(r => r["Officer Name"] && r["Contact No."])
        .map(r => ({
          name: r["Officer Name"].trim(),
          designation: (r["Designation"] || "").trim(),
          department: (r["Office / Department"] || "").trim(),
          district: (r["Place / District"] || "").trim(),
          mobile: r["Contact No."].toString().trim(),
          email: (r["E-Mail ID"] || "").trim()
        }));

      setupDropdown(deptInput, deptDropdown, unique("department"), v => selectedDept = v);
      setupDropdown(desigInput, desigDropdown, unique("designation"), v => selectedDesig = v);
      setupDropdown(districtInput, districtDropdown, unique("district"), v => selectedDistrict = v);

      applyFilters();
    });

  /* HELPERS */
  function unique(key) {
    return [...new Set(allData.map(x => x[key]).filter(Boolean))].sort();
  }

  function setupDropdown(input, menu, values, onSelect) {
    function render(list) {
      menu.innerHTML = "";
      list.forEach(v => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = v;
        item.onclick = e => {
          e.stopPropagation();
          input.value = v;
          onSelect(v);
          menu.style.display = "none";
          page = 1;
          applyFilters();
        };
        menu.appendChild(item);
      });
    }

    render(values);

    input.onfocus = () => {
      render(values);
      menu.style.display = "block";
    };

    input.oninput = () => {
      render(values.filter(v => v.toLowerCase().includes(input.value.toLowerCase())));
      menu.style.display = "block";
      onSelect("");
    };
  }

  /* FILTER */
  searchBox.oninput = () => { page = 1; applyFilters(); };

  function applyFilters() {
    const q = searchBox.value.toLowerCase();

    filteredData = allData.filter(x =>
      (!q || x.name.toLowerCase().includes(q) || x.mobile.includes(q)) &&
      (!selectedDept || x.department === selectedDept) &&
      (!selectedDesig || x.designation === selectedDesig) &&
      (!selectedDistrict || x.district === selectedDistrict)
    );

    render();
  }

  /* PAGINATION */
  prevBtn.onclick = () => { if (page > 1) { page--; render(); } };
  nextBtn.onclick = () => { if (page * PAGE_SIZE < filteredData.length) { page++; render(); } };

  /* RENDER */
  function render() {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    cards.innerHTML = filteredData.slice(start, end).map(u => `
      <div class="card">
        <div class="name">${u.name}</div>
        <div class="meta">${u.designation}</div>
        <div class="meta">${u.department}</div>
        <div class="meta">${u.district}</div>
        📞 <a href="tel:${u.mobile}">${u.mobile}</a><br>
        📧 ${u.email}
      </div>
    `).join("");

    pageInfo.textContent =
      filteredData.length === 0
        ? "No results"
        : `Page ${page} of ${Math.ceil(filteredData.length / PAGE_SIZE)}`;
  }

  /* CLOSE DROPDOWNS */
  document.addEventListener("click", () => {
    deptDropdown.style.display = "none";
    desigDropdown.style.display = "none";
    districtDropdown.style.display = "none";
  });
}
