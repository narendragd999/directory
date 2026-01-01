const SHEET_URL =
 "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";

/* Elements */
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

/* State */
let allData = [];
let filteredData = [];
let page = 1;
const PAGE_SIZE = 20;

/* Fetch Data */
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

  buildDropdown(deptDropdown, unique("department"), deptInput);
  buildDropdown(desigDropdown, unique("designation"), desigInput);
  buildDropdown(districtDropdown, unique("district"), districtInput);

  applyFilters();
});

/* Helpers */
function unique(key) {
  return [...new Set(allData.map(x => x[key]).filter(Boolean))].sort();
}

function buildDropdown(menu, values, input) {
  menu.innerHTML = "";
  values.forEach(v => {
    const div = document.createElement("div");
    div.className = "dropdown-item";
    div.textContent = v;
    div.onclick = () => {
      input.value = v;
      menu.style.display = "none";
      page = 1;
      applyFilters();
    };
    menu.appendChild(div);
  });
  input.onclick = () => menu.style.display = "block";
}

/* Filters */
searchBox.oninput = () => { page = 1; applyFilters(); };

function applyFilters() {
  const q = searchBox.value.toLowerCase();
  const d = deptInput.value;
  const g = desigInput.value;
  const dist = districtInput.value;

  filteredData = allData.filter(x =>
    (!q || x.name.toLowerCase().includes(q) || x.mobile.includes(q)) &&
    (!d || x.department === d) &&
    (!g || x.designation === g) &&
    (!dist || x.district === dist)
  );

  render();
}

/* Pagination */
prevBtn.onclick = () => {
  if (page > 1) { page--; render(); }
};

nextBtn.onclick = () => {
  if (page * PAGE_SIZE < filteredData.length) {
    page++; render();
  }
};

/* Render */
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
    `Page ${page} of ${Math.ceil(filteredData.length / PAGE_SIZE)}`;
}

/* Close dropdowns */
document.addEventListener("click", e => {
  if (!e.target.closest(".dropdown")) {
    deptDropdown.style.display = "none";
    desigDropdown.style.display = "none";
    districtDropdown.style.display = "none";
  }
});
