const APP_PASSWORD = "1254";
const SHEET_URL =
  "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";
const PAGE_SIZE = 20;

/* LOGIN */
const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const appPassword = document.getElementById("appPassword");
const loginError = document.getElementById("loginError");

loginBtn.onclick = () => {
  if (appPassword.value === APP_PASSWORD) {
    loginScreen.style.display = "none";
    app.classList.remove("hidden");
    initApp();
  } else {
    loginError.textContent = "Wrong password";
  }
};

const loader = document.getElementById("loader");
function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}


function initApp() {
  const cards = document.getElementById("cards");
  const resultCount = document.getElementById("resultCount");
  const searchBox = document.getElementById("searchBox");
  const resetBtn = document.getElementById("resetBtn");

  const deptInput = document.getElementById("deptInput");
  const desigInput = document.getElementById("desigInput");
  const districtInput = document.getElementById("districtInput");

  const deptDropdown = document.getElementById("deptDropdown");
  const desigDropdown = document.getElementById("desigDropdown");
  const districtDropdown = document.getElementById("districtDropdown");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  let allData = [], filteredData = [];
  let page = 1;
  let selDept="", selDesig="", selDistrict="";

  fetch(SHEET_URL).then(r=>r.json()).then(data=>{
    allData = data.filter(r=>r["Officer Name"] && r["Contact No."])
      .map(r=>({
        name:r["Officer Name"],
        designation:r["Designation"]||"",
        department:r["Office / Department"]||"",
        district:r["Place / District"]||"",
        mobile:r["Contact No."],
        email:r["E-Mail ID"]||""
      }));

    searchableDropdown(
      deptInput, deptDropdown, "Select Department",
      unique("department"), v => selDept = v
    );
    searchableDropdown(
      desigInput, desigDropdown, "Select Designation",
      unique("designation"), v => selDesig = v
    );
    searchableDropdown(
      districtInput, districtDropdown, "Select District / Block",
      unique("district"), v => selDistrict = v
    );

    apply();
  });

  function unique(k){
    return [...new Set(allData.map(x=>x[k]).filter(Boolean))].sort();
  }

  /* 🔍 SEARCHABLE DROPDOWN (RESTORED) */
  function searchableDropdown(input, menu, placeholder, list, onSelect) {

    let selectedValue = "";

    // set initial placeholder
    input.value = placeholder;

    function render(items) {
      menu.innerHTML = "";

      // 🔹 Clear option
      addItem(placeholder, "");

      items.forEach(v => addItem(v, v));

      menu.style.display = "block";
    }

    function addItem(text, value) {
      const d = document.createElement("div");
      d.className = "dropdown-item";
      d.textContent = text;

      d.onclick = () => {
        selectedValue = value;
        input.value = value || placeholder;
        menu.style.display = "none";
        onSelect(value);
        page = 1;
        apply();
      };

      menu.appendChild(d);
    }

    // 🔍 Enable typing
    input.readOnly = false;

    // Focus → show full list
    input.onfocus = () => {
      input.select();
      render(list);
    };

    // Typing → filter list (THIS WAS BROKEN BEFORE)
    input.oninput = () => {
      const q = input.value.toLowerCase();
      selectedValue = "";        // invalidate selection while typing
      onSelect("");              // no filter until user clicks option

      render(list.filter(v =>
        v.toLowerCase().includes(q)
      ));
    };
  }


  /* RESET */
  resetBtn.onclick = () => {
    searchBox.value = "";
    deptInput.value = "Select Department";
    desigInput.value = "Select Designation";
    districtInput.value = "Select District / Block";
    selDept = selDesig = selDistrict = "";
    page = 1;
    apply();
  };

  searchBox.oninput = () => { page = 1; apply(); };

  function apply(){
    const q = searchBox.value.toLowerCase();
    filteredData = allData.filter(x =>
      (!q || x.name.toLowerCase().includes(q) || x.mobile.includes(q)) &&
      (!selDept || x.department === selDept) &&
      (!selDesig || x.designation === selDesig) &&
      (!selDistrict || x.district === selDistrict)
    );
    render();
  }

  prevBtn.onclick = () => { if(page>1){ page--; render(); } };
  nextBtn.onclick = () => {
    if(page * PAGE_SIZE < filteredData.length){ page++; render(); }
  };

  function render(){
    const s=(page-1)*PAGE_SIZE;
    const e=s+PAGE_SIZE;

    cards.innerHTML = filteredData.slice(s,e).map(u=>`
      <div class="card">
        <div class="name">${u.name}</div>
        <div class="meta">${u.designation}</div>
        <div class="meta">${u.department}</div>
        <div class="meta">${u.district}</div>
        📞 ${u.mobile}<br>📧 ${u.email}
      </div>
    `).join("");

    resultCount.textContent = `Total results: ${filteredData.length}`;
    pageInfo.textContent =
      `Page ${page} / ${Math.ceil(filteredData.length / PAGE_SIZE)}`;
  }

  /* CLOSE DROPDOWNS ON OUTSIDE CLICK */
  document.addEventListener("click", e => {
    if (!e.target.closest(".dropdown")) {
      deptDropdown.style.display = "none";
      desigDropdown.style.display = "none";
      districtDropdown.style.display = "none";
    }
  });
}
