const SHEET_URL = "https://opensheet.elk.sh/YOUR_SHEET_ID/Sheet1";

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

/* FETCH + OFFLINE CACHE */
async function fetchData(district) {
  let data;
  if (localStorage.cachedData) {
    data = JSON.parse(localStorage.cachedData);
  } else {
    data = await fetch(SHEET_URL).then(r=>r.json());
    localStorage.cachedData = JSON.stringify(data);
  }

  allData = data.filter(x => x.District === district);
  districtData = allData;
  visibleList = districtData;

  populateFilters();
  render();
}

/* FILTERS */
function populateFilters() {
  fill("deptFilter","Department");
  fill("desigFilter","Designation");
}

function fill(id,key){
  const s=document.getElementById(id);
  [...new Set(districtData.map(x=>x[key]))]
    .forEach(v=>s.innerHTML+=`<option>${v}</option>`);
}

/* LIVE SEARCH */
searchBox.oninput = () => {
  const q = searchBox.value.toLowerCase();
  visibleList = districtData.filter(x =>
    x.Name.toLowerCase().includes(q) ||
    x.Mobile.includes(q)
  );
  render();
};

/* FILTER CHANGE */
document.querySelectorAll("select").forEach(s=>s.onchange=applyFilter);

function applyFilter() {
  const d=deptFilter.value, g=desigFilter.value;
  visibleList = districtData.filter(x =>
    (!d||x.Department===d) &&
    (!g||x.Designation===g)
  );
  render();
}

/* RENDER */
function render(){
  cards.innerHTML = visibleList.slice(0,50).map(u=>`
    <div class="card">
      <b>${u.Name}</b><br>
      ${u.Designation} | ${u.Department}<br>
      ${u.District}<br>
      <a href="tel:${u.Mobile}">📞 ${u.Mobile}</a>
    </div>
  `).join("");
}

/* AUTO LOGIN */
if (localStorage.district) initApp(localStorage.district);
else {
  Object.keys(DISTRICT_PASSWORDS)
    .forEach(d=>loginDistrict.innerHTML+=`<option>${d}</option>`);
}
