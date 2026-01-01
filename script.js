const SHEET_URL =
  "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";

const cards = document.getElementById("cards");
const searchBox = document.getElementById("searchBox");
const deptFilter = document.getElementById("deptFilter");
const desigFilter = document.getElementById("desigFilter");
const deptList = document.getElementById("deptList");
const desigList = document.getElementById("desigList");

let allData = [];
let visibleData = [];

/* FETCH DATA */
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

    visibleData = allData;
    populateLists();
    render();
  });

/* POPULATE SEARCHABLE LISTS */
function populateLists() {
  fillList(deptList, "department");
  fillList(desigList, "designation");
}

function fillList(list, key) {
  [...new Set(allData.map(x => x[key]).filter(Boolean))]
    .sort()
    .forEach(v => {
      const o = document.createElement("option");
      o.value = v;
      list.appendChild(o);
    });
}

/* GLOBAL SEARCH */
searchBox.addEventListener("input", applyFilters);
deptFilter.addEventListener("input", applyFilters);
desigFilter.addEventListener("input", applyFilters);

/* APPLY ALL FILTERS TOGETHER */
function applyFilters() {
  const q = searchBox.value.toLowerCase();
  const d = deptFilter.value.toLowerCase();
  const g = desigFilter.value.toLowerCase();

  visibleData = allData.filter(x =>
    (!q || x.name.toLowerCase().includes(q) || x.mobile.includes(q)) &&
    (!d || x.department.toLowerCase().includes(d)) &&
    (!g || x.designation.toLowerCase().includes(g))
  );

  render();
}

/* RENDER */
function render() {
  cards.innerHTML = visibleData.slice(0, 50).map(u => `
    <div class="card">
      <div class="name">${u.name}</div>
      <div class="meta">${u.designation}</div>
      <div class="meta">${u.department}</div>
      <div class="meta">${u.district}</div>
      <div class="contact">
        📞 <a href="tel:${u.mobile}">${u.mobile}</a><br>
        📧 ${u.email}
      </div>
    </div>
  `).join("");
}
