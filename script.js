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

// stores ONLY selected valid values
let selectedDept = "";
let selectedDesig = "";
let selectedDistrict = "";

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

    departments = unique("department");
    designations = unique("designation");
    districts = unique("district");

    setupDropdown(deptInput, deptDropdown, departments, val => {
      selectedDept = val;
    });

    setupDropdown(desigInput, desigDropdown, designations, val => {
      selectedDesig = val;
    });

    setupDropdown(districtInput, districtDropdown, districts, val => {
      selectedDistrict = val;
    });

    applyFilters();
  });

/* ===============================
   HELPERS
================================ */
function unique(key) {
  return [...new Set(allData.map(x => x[key]).filter(Boolean))].sort();
}

/* ===============================
   TRUE SEARCHABLE DROPDOWN
================================ */
function setupDropdown(input, menu, values, onSelect) {

  function render(list) {
    menu.innerHTML = "";
    list.forEach(v => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = v;

      item.onclick = e => {
        e.stopPropagation(); // 🔑 IMPORTANT
        input.value = v;
        onSelect(v);
        menu.style.display = "none";
        page = 1;
        applyFilters();
      };

      menu.appendChild(item);
    });
  }

  // initial
  render(values);

  input.addEventListener("focus", () => {
    render(values);
    menu.style.display = "block";
  });

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    render(values.filter(v => v.toLowerCase().includes(q)));
    menu.style.display = "block";

    // invalidate selection if user types manually
    onSelect("");
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

  filteredData = allData.filter(x =>
    (!q || x.name.toLowerCase().includes(q) || x.mobile.includes(q)) &&
    (!selectedDept || x.department === selectedDept) &&
    (!selectedDesig || x.designation === selectedDesig) &&
    (!selectedDistrict || x.district === selectedDistrict)
  );

  render();
}

/* ===============================
   PAGINATION
================================ */
prevBtn.onclick = () => {
  if (page > 1) {
    page--;
    render();
  }
};

nextBtn.onclick = () => {
  if (page * PAGE_SIZE < filteredData.length) {
    page++;
    render();
  }
};

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
   CLOSE DROPDOWNS
================================ */
document.addEventListener("click", () => {
  deptDropdown.style.display = "none";
  desigDropdown.style.display = "none";
  districtDropdown.style.display = "none";
});
