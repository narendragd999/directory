/* =========================
   CONFIG
========================= */
const APP_PASSWORD = "1254";
const SHEET_URL =
  "https://opensheet.elk.sh/1mm90Evf_AzQyr_vBcvhd9TstJffPVqeukQU1SdgS2fk/Sheet1";
const PAGE_SIZE = 20;

/* =========================
   GLOBAL ELEMENTS
========================= */
const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const appPassword = document.getElementById("appPassword");
const loginError = document.getElementById("loginError");

const loader = document.getElementById("loader");

/* =========================
   LOADER CONTROL
========================= */
function showLoader() {
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  if (loader) loader.style.display = "none";
}

/* Safety: auto-hide loader */
setTimeout(hideLoader, 15000);

/* =========================
   LOGIN
========================= */
loginBtn.onclick = () => {
  if (appPassword.value === APP_PASSWORD) {
    loginScreen.style.display = "none";
    app.classList.remove("hidden");
    showLoader();          // ✅ show loader only now
    initApp();
  } else {
    loginError.textContent = "Wrong password";
  }
};

/* =========================
   MAIN APP
========================= */
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

  let allData = [];
  let filteredData = [];
  let page = 1;

  let selDept = "";
  let selDesig = "";
  let selDistrict = "";

  /* =========================
     FETCH DATA
  ========================= */
  fetch(SHEET_URL)
    .then(r => r.json())
    .then(data => {
      allData = data
        .filter(r => r["Officer Name"] && r["Contact No."])
        .map(r => ({
          name: r["Officer Name"],
          designation: r["Designation"] || "",
          department: r["Office / Department"] || "",
          district: r["Place / District"] || "",
          mobile: r["Contact No."],
          email: r["E-Mail ID"] || ""
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

      applyFilters();
      hideLoader();   // ✅ SUCCESS
    })
    .catch(err => {
      console.error("Fetch failed:", err);
      hideLoader();   // ✅ FAILURE SAFE
      alert("Failed to load directory data. Please check internet.");
    });

  /* =========================
     UTILITIES
  ========================= */
  function unique(key) {
    return [...new Set(allData.map(x => x[key]).filter(Boolean))].sort();
  }

  /* =========================
     SEARCHABLE DROPDOWN
  ========================= */
  function searchableDropdown(input, menu, placeholder, list, onSelect) {
    input.value = placeholder;
    input.readOnly = false;

    function render(items) {
      menu.innerHTML = "";
      addItem(placeholder, "");

      items.forEach(v => addItem(v, v));
      menu.style.display = "block";
    }

    function addItem(text, value) {
      const d = document.createElement("div");
      d.className = "dropdown-item";
      d.textContent = text;

      d.onclick = () => {
        input.value = value || placeholder;
        onSelect(value);
        menu.style.display = "none";
        page = 1;
        applyFilters();
      };
      menu.appendChild(d);
    }

    input.onfocus = () => render(list);

    input.oninput = () => {
      const q = input.value.toLowerCase();
      onSelect(""); // invalidate until selection
      render(list.filter(v => v.toLowerCase().includes(q)));
    };
  }

  /* =========================
     FILTER + SEARCH
  ========================= */
  searchBox.oninput = () => {
    page = 1;
    applyFilters();
  };

  resetBtn.onclick = () => {
    searchBox.value = "";
    deptInput.value = "Select Department";
    desigInput.value = "Select Designation";
    districtInput.value = "Select District / Block";

    selDept = selDesig = selDistrict = "";
    page = 1;
    applyFilters();
  };

  function applyFilters() {
    const q = searchBox.value.toLowerCase();

    filteredData = allData.filter(x =>
      (!q ||
        x.name.toLowerCase().includes(q) ||
        x.mobile.includes(q) ||
        x.email.toLowerCase().includes(q)
      ) &&
      (!selDept || x.department === selDept) &&
      (!selDesig || x.designation === selDesig) &&
      (!selDistrict || x.district === selDistrict)
    );

    render();
  }

  /* =========================
     PAGINATION
  ========================= */
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

  /* =========================
     RENDER
  ========================= */
  function render() {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    cards.innerHTML = filteredData.slice(start, end).map(u => `
      <div class="card">
        <div class="name">${u.name}</div>
        <div class="meta">${u.designation}</div>
        <div class="meta">${u.department}</div>
        <div class="meta">${u.district}</div>
        📞 <a href="tel:${u.mobile}" class="phone-link">${u.mobile}</a><br>
      📧 <a href="mailto:${u.email}" class="email-link">${u.email}</a>
      </div>
    `).join("");

    resultCount.textContent = `Total results: ${filteredData.length}`;
    pageInfo.textContent =
      `Page ${page} / ${Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))}`;
  }

  /* =========================
     CLOSE DROPDOWNS ON OUTSIDE CLICK
  ========================= */
  document.addEventListener("click", e => {
    if (!e.target.closest(".dropdown")) {
      deptDropdown.style.display = "none";
      desigDropdown.style.display = "none";
      districtDropdown.style.display = "none";
    }
  });
}
