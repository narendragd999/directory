const SHEET_URL =
 "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";

const cards = document.getElementById("cards");
const searchBox = document.getElementById("searchBox");

const deptInput = document.getElementById("deptInput");
const deptDropdown = document.getElementById("deptDropdown");

const desigInput = document.getElementById("desigInput");
const desigDropdown = document.getElementById("desigDropdown");

let allData = [];
let visibleData = [];
let departments = [];
let designations = [];

/* FETCH DATA */
fetch(SHEET_URL)
.then(r=>r.json())
.then(raw=>{
  allData = raw
    .filter(r=>r["Officer Name"] && r["Contact No."])
    .map(r=>({
      name:r["Officer Name"].trim(),
      designation:(r["Designation"]||"").trim(),
      department:(r["Office / Department"]||"").trim(),
      district:(r["Place / District"]||"").trim(),
      mobile:r["Contact No."].toString().trim(),
      email:(r["E-Mail ID"]||"").trim()
    }));

  departments=[...new Set(allData.map(x=>x.department).filter(Boolean))].sort();
  designations=[...new Set(allData.map(x=>x.designation).filter(Boolean))].sort();

  buildDropdown(deptDropdown, departments, deptInput);
  buildDropdown(desigDropdown, designations, desigInput);

  visibleData = allData;
  render();
});

/* BUILD DROPDOWN */
function buildDropdown(menu, values, input) {
  menu.innerHTML="";
  values.forEach(v=>{
    const div=document.createElement("div");
    div.className="dropdown-item";
    div.textContent=v;
    div.onclick=()=>{
      input.value=v;
      menu.style.display="none";
      applyFilters();
    };
    menu.appendChild(div);
  });

  input.onclick=()=> menu.style.display="block";
}

/* GLOBAL SEARCH */
searchBox.oninput = applyFilters;

/* APPLY FILTERS */
function applyFilters() {
  const q = searchBox.value.toLowerCase();
  const d = deptInput.value;
  const g = desigInput.value;

  visibleData = allData.filter(x =>
    (!q || x.name.toLowerCase().includes(q) || x.mobile.includes(q)) &&
    (!d || x.department === d) &&
    (!g || x.designation === g)
  );

  render();
}

/* RENDER */
function render() {
  cards.innerHTML = visibleData.slice(0,50).map(u=>`
    <div class="card">
      <div class="name">${u.name}</div>
      <div class="meta">${u.designation}</div>
      <div class="meta">${u.department}</div>
      <div class="meta">${u.district}</div>
      📞 <a href="tel:${u.mobile}">${u.mobile}</a><br>
      📧 ${u.email}
    </div>
  `).join("");
}

/* CLOSE DROPDOWN ON OUTSIDE CLICK */
document.addEventListener("click",e=>{
  if(!e.target.closest(".dropdown")){
    deptDropdown.style.display="none";
    desigDropdown.style.display="none";
  }
});
