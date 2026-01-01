const SHEET_URL =
  "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";

const cards = document.getElementById("cards");
const searchBox = document.getElementById("searchBox");
const deptFilter = document.getElementById("deptFilter");
const desigFilter = document.getElementById("desigFilter");

let allData = [];
let visibleData = [];

/* FETCH DATA */
fetch(SHEET_URL)
  .then(res => res.json())
  .then(raw => {
    console.log("RAW:", raw);

    // 🔴 CLEAN DATA (VERY IMPORTANT)
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
    fillFilters();
    render();
  })
  .catch(err => {
    console.error(err);
    cards.innerHTML = "<p style='color:red'>Failed to load data</p>";
  });

/* FILL FILTERS */
function fillFilters() {
  fillSelect(deptFilter, "department");
  fillSelect(desigFilter, "designation");
}

function fillSelect(select, key) {
  const values = [...new Set(allData.map(x => x[key]).filter(Boolean))];
  values.sort().forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    select.appendChild(o);
  });
}

/* LIVE SEARCH */
searchBox.addEventListener("input", () => {
  const q = searchBox.value.toLowerCase();
  visibleData = allData.filter(x =>
    x.name.toLowerCase().includes(q) ||
    x.mobile.includes(q)
  );
  render();
});

/* FILTER CHANGE */
deptFilter.addEventListener("change", applyFilter);
desigFilter.addEventListener("change", applyFilter);

function applyFilter() {
  const d = deptFilter.value;
  const g = desigFilter.value;

  visibleData = allData.filter(x =>
    (!d || x.department === d) &&
    (!g || x.designation === g)
  );
  render();
}

/* RENDER CARDS */
function render() {
  cards.innerHTML = visibleData.slice(0, 50).map(u => `
    <div class="card">
      <b>${u.name}</b><br>
      <small>${u.designation}</small><br>
      <small>${u.department}</small><br>
      <small>${u.district}</small><br>
      📞 <a href="tel:${u.mobile}">${u.mobile}</a><br>
      📧 <small>${u.email}</small>
    </div>
  `).join("");
}
