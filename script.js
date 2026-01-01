/* ===============================
   CONFIG
================================ */
const SHEET_URL =
  "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";

const PAGE_SIZE = 20;

/* ===============================
   ELEMENTS
================================ */
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

/* ===============================
   STATE
================================ */
let allData = [];
let filteredData = [];
let page = 1;

let departments = [];
let designations = [];
let districts = [];

/* ===============================
   FETCH DATA
================================ */
fetch(SHEET_URL)
  .then(res => res.json())
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

    departments = uniqueValues("department");
    designations = uniqueValues("designation");
    districts = uniqueValues("district");

    buildSearchableDropdown(deptDropdown, deptInput, departments);
    buildSearchableDropdown(desigDropdown, desigInput, designations);
    buildSearchableDropdown(districtDropdown, districtInput, districts);

    applyFilters();
  })
  .catch(err => {
    console.error("DATA LOAD ERROR:", err);
    cards.innerHTML = "<p style='color:red'>Failed to load data</p>";
  });

/* ===============================
   HELPERS
================================ */
function uniqueValues(key) {
  return [...new Set(allData.map(x => x[key]).filter(Boolean))].sort();
}

/* ===============================
   SEARCHABLE DROPDOWN
================================ */
function buildSearchableDropdown(menu, input, values) {

  function renderList(list) {
    menu.innerHTML = "";
    list.forEach(v => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = v;

      item.onclick = () => {
        input.value = v;
        menu.style.display = "none";
        page = 1;
        applyFilters();
      };

      menu.appendChild(item);
    });
  }

  // initial render
  renderList(values);

  // show dropdown on focus
  input.addEventListener("focus", () => {
    renderList(values);
    menu.style.display = "block";
  });

  // filter dropdown as user types
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    const filtered = values.filter(v =>
      v.toLowerCase().includes(q)
    );
    renderList(filtered);
    menu.style.display = "block";
  });
}

/* ===============================
   FILTER LOGIC
================================ */
searchBox.addEventListener("input", () => {
  page = 1;
  applyFilters();
});

function applyFilters() {
  const q = searchBox.value.toLowerCase();
  const dept = deptInput.value;
  const desig = desigInput.value;
  const dist = districtInput.value;

  filteredData = allData.filter(x =>
    (!q ||
      x.name.toLowerCase().includes(q) ||
      x.mobile.includes(q)
    ) &&
    (!dept || x.department === dept) &&
    (!desig || x.designation === desig) &&
    (!dist || x.district === dist)
  );

  render();
}

/* ===============================
   PAGINATION
================================ */
prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page--;
    render();
  }
});

nextBtn.addEventListener("click", () => {
  if (page * PAGE_SIZE < filteredData.length) {
    page++;
    render();
  }
});

/* ===============================
   RENDER
================================ */
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

/* ===============================
   CLOSE DROPDOWNS ON OUTSIDE CLICK
================================ */
document.addEventListener("click", e => {
  if (!e.target.closest(".dropdown")) {
    deptDropdown.style.display = "none";
    desigDropdown.style.display = "none";
    districtDropdown.style.display = "none";
  }
});
