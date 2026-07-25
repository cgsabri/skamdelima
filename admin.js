const API_URL =
"https://script.google.com/macros/s/AKfycbzWvfXVDh6y2ttNc3ySkVcymqEfgmsI7K-wwGY4ve_m_y78HfVIi55k7kyzllgGVnB4/exec";


let sessionToken = "";
let allStudents = [];
let allTutorials = [];


// ======================================
// LOGIN
// ======================================

async function adminLogin() {

  const username =
    document
      .getElementById("username")
      .value
      .trim();

  const password =
    document
      .getElementById("adminPassword")
      .value;

  const button =
    document
      .getElementById("loginBtn");


  document
    .getElementById("loginMessage")
    .innerHTML = "";


  if (!username || !password) {

    showLoginError(
      "Masukkan username dan kata laluan."
    );

    return;
  }


  button.disabled = true;

  button.textContent =
    "Sedang log masuk...";


  try {

    const data =
      await apiRequest(
        "adminLogin",
        {
          username,
          password
        },
        false
      );


    if (!data.success) {

      showLoginError(
        data.message ||
        "Login tidak berjaya."
      );

      return;
    }


    sessionToken =
      data.token;


    sessionStorage.setItem(
      "delimaAdminToken",
      sessionToken
    );


    showDashboard();


  } catch (error) {

    console.error(error);

    showLoginError(
      "Tidak dapat menghubungi sistem."
    );


  } finally {

    button.disabled = false;

    button.textContent =
      "Log Masuk";

  }

}


// ======================================
// DASHBOARD
// ======================================

function showDashboard() {

  document
    .getElementById("loginPage")
    .classList
    .add("hidden");


  document
    .getElementById("dashboardPage")
    .classList
    .remove("hidden");


  showAdminSection("students");

}


// ======================================
// ADMIN NAVIGATION
// ======================================

function showAdminSection(section) {

  const sections = [
    "students",
    "tutorial",
    "help"
  ];


  sections.forEach(name => {

    document
      .getElementById(
        name + "Section"
      )
      .classList
      .add("hidden");


    document
      .getElementById(
        "tab" +
        name.charAt(0).toUpperCase() +
        name.slice(1)
      )
      .classList
      .remove("active");

  });


  document
    .getElementById(
      section + "Section"
    )
    .classList
    .remove("hidden");


  document
    .getElementById(
      "tab" +
      section.charAt(0).toUpperCase() +
      section.slice(1)
    )
    .classList
    .add("active");


  if (section === "students") {
    loadDashboard();
  }


  if (section === "tutorial") {
    loadTutorials();
  }


  if (section === "help") {
    loadHelp();
  }

}


// ======================================
// STUDENTS
// ======================================

async function loadDashboard() {

  const loading =
    document
      .getElementById("loadingStudents");


  loading.classList.remove("hidden");


  try {

    const data =
      await apiRequest(
        "adminData"
      );


    if (!data.success) {

      handleApiFailure(data);

      return;
    }


    allStudents =
      Array.isArray(data.students)
        ? data.students
        : [];


    updateStats(
      data.stats || {}
    );


    populateClasses();

    renderStudents();


  } catch (error) {

    console.error(error);

    alert(
      "Tidak dapat memuatkan data murid."
    );


  } finally {

    loading.classList.add("hidden");

  }

}


// ======================================
// STATISTICS
// ======================================

function updateStats(stats) {

  document
    .getElementById("totalStudents")
    .textContent =
      stats.totalStudents ?? 0;


  document
    .getElementById("totalClasses")
    .textContent =
      stats.totalClasses ?? 0;


  document
    .getElementById("totalAccounts")
    .textContent =
      stats.totalAccounts ?? 0;


  document
    .getElementById("missingPin")
    .textContent =
      stats.missingPin ?? 0;

}


// ======================================
// CLASS FILTER
// ======================================

function populateClasses() {

  const select =
    document
      .getElementById("classFilter");


  const classes =
    [
      ...new Set(
        allStudents
          .map(s => s.kelas)
          .filter(Boolean)
      )
    ].sort();


  select.innerHTML =
    '<option value="">Semua Kelas</option>';


  classes.forEach(kelas => {

    const option =
      document.createElement("option");


    option.value = kelas;

    option.textContent = kelas;


    select.appendChild(option);

  });

}


// ======================================
// STUDENT TABLE
// ======================================

function renderStudents() {

  const tbody =
    document
      .getElementById("studentTable");


  const query =
    document
      .getElementById("studentSearch")
      .value
      .trim()
      .toLowerCase();


  const selectedClass =
    document
      .getElementById("classFilter")
      .value;


  const filtered =
    allStudents.filter(student => {


      const searchMatch =

        !query ||

        String(student.nama || "")
          .toLowerCase()
          .includes(query) ||

        String(student.nokp || "")
          .includes(query) ||

        String(student.delima || "")
          .toLowerCase()
          .includes(query);


      const classMatch =

        !selectedClass ||

        student.kelas ===
          selectedClass;


      return (
        searchMatch &&
        classMatch
      );

    });


  tbody.innerHTML = "";


  if (!filtered.length) {

    tbody.innerHTML =
      '<tr>' +
      '<td colspan="5">' +
      'Tiada rekod dijumpai.' +
      '</td>' +
      '</tr>';

    return;
  }


  filtered.forEach(student => {

    const tr =
      document.createElement("tr");


    tr.innerHTML =

      "<td>" +
      escapeHTML(student.nama || "-") +
      "</td>" +

      "<td>" +
      escapeHTML(student.nokp || "-") +
      "</td>" +

      "<td>" +
      escapeHTML(student.kelas || "-") +
      "</td>" +

      "<td>" +
      escapeHTML(student.delima || "-") +
      "</td>" +

      '<td><span class="pin">' +
      escapeHTML(student.pin || "-") +
      "</span></td>";


    tbody.appendChild(tr);

  });

}


// ======================================
// TUTORIAL
// ======================================

async function loadTutorials() {

  const loading =
    document
      .getElementById("tutorialLoading");


  loading.classList.remove("hidden");


  try {

    const data =
      await apiRequest(
        "adminTutorial"
      );


    if (!data.success) {

      handleApiFailure(data);

      return;
    }


    allTutorials =
      Array.isArray(data.tutorials)
        ? data.tutorials
        : [];


    allTutorials.sort(
      (a,b) =>
        Number(a.susunan || 999) -
        Number(b.susunan || 999)
    );


    renderTutorials();


  } catch (error) {

    console.error(error);

    alert(
      "Tidak dapat memuatkan tutorial."
    );


  } finally {

    loading.classList.add("hidden");

  }

}


// ======================================
// RENDER TUTORIAL
// ======================================

function renderTutorials() {

  const container =
    document
      .getElementById("tutorialList");


  container.innerHTML = "";


  if (!allTutorials.length) {

    container.innerHTML =
      "<p>Belum ada tutorial.</p>";

    return;
  }


  allTutorials.forEach(
    (tutorial, index) => {


      const card =
        document.createElement("div");


      card.className =
        "tutorial-card";


      const active =
        String(tutorial.status)
          .toUpperCase() === "AKTIF";


      const safeLink =
        safeHttpUrl(
          tutorial.link
        );


      card.innerHTML =

        '<div class="tutorial-number">' +
        escapeHTML(
          tutorial.susunan ||
          index + 1
        ) +
        '</div>' +


        '<div class="tutorial-content">' +

        "<h3>" +
        escapeHTML(tutorial.tajuk) +
        "</h3>" +

        "<p>" +
        escapeHTML(
          tutorial.penerangan || ""
        ) +
        "</p>" +


        (
          safeLink
          ?
          '<a class="tutorial-link" ' +
          'href="' +
          escapeHTML(safeLink) +
          '" target="_blank" ' +
          'rel="noopener noreferrer">' +
          'Buka Tutorial ↗</a>'
          :
          ""
        ) +


        '<br><span class="status ' +
        (
          active
            ? "status-active"
            : "status-inactive"
        ) +
        '">' +

        (
          active
            ? "AKTIF"
            : "TIDAK AKTIF"
        ) +

        "</span>" +

        "</div>" +


        '<div class="tutorial-actions">' +

        '<button class="edit-btn">' +
        'Edit</button>' +

        '<button class="delete-btn">' +
        'Padam</button>' +

        "</div>";


      const buttons =
        card.querySelectorAll(
          "button"
        );


      buttons[0].onclick =
        () =>
          editTutorial(
            tutorial.id
          );


      buttons[1].onclick =
        () =>
          deleteTutorial(
            tutorial.id,
            tutorial.tajuk
          );


      container.appendChild(card);

    }
  );

}


// ======================================
// OPEN TUTORIAL FORM
// ======================================

function openTutorialForm() {

  document
    .getElementById("tutorialFormTitle")
    .textContent =
      "Tambah Tutorial";


  document
    .getElementById("tutorialId")
    .value = "";


  document
    .getElementById("tutorialTitle")
    .value = "";


  document
    .getElementById("tutorialDescription")
    .value = "";


  document
    .getElementById("tutorialLink")
    .value = "";


  document
    .getElementById("tutorialStatus")
    .value = "AKTIF";


  document
    .getElementById("tutorialOrder")
    .value =
      allTutorials.length + 1;


  document
    .getElementById("tutorialFormMessage")
    .innerHTML = "";


  document
    .getElementById("tutorialModal")
    .classList
    .remove("hidden");

}


// ======================================
// EDIT TUTORIAL
// ======================================

function editTutorial(id) {

  const tutorial =
    allTutorials.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!tutorial) {
    return;
  }


  document
    .getElementById("tutorialFormTitle")
    .textContent =
      "Edit Tutorial";


  document
    .getElementById("tutorialId")
    .value =
      tutorial.id;


  document
    .getElementById("tutorialTitle")
    .value =
      tutorial.tajuk || "";


  document
    .getElementById("tutorialDescription")
    .value =
      tutorial.penerangan || "";


  document
    .getElementById("tutorialLink")
    .value =
      tutorial.link || "";


  document
    .getElementById("tutorialStatus")
    .value =
      tutorial.status || "AKTIF";


  document
    .getElementById("tutorialOrder")
    .value =
      tutorial.susunan || 1;


  document
    .getElementById("tutorialFormMessage")
    .innerHTML = "";


  document
    .getElementById("tutorialModal")
    .classList
    .remove("hidden");

}


// ======================================
// CLOSE FORM
// ======================================

function closeTutorialForm() {

  document
    .getElementById("tutorialModal")
    .classList
    .add("hidden");

}


// ======================================
// SAVE TUTORIAL
// ======================================

async function saveTutorial() {

  const id =
    document
      .getElementById("tutorialId")
      .value;


  const tajuk =
    document
      .getElementById("tutorialTitle")
      .value
      .trim();


  const penerangan =
    document
      .getElementById("tutorialDescription")
      .value
      .trim();


  const link =
    document
      .getElementById("tutorialLink")
      .value
      .trim();


  const status =
    document
      .getElementById("tutorialStatus")
      .value;


  const susunan =
    document
      .getElementById("tutorialOrder")
      .value;


  if (!tajuk) {

    showTutorialFormError(
      "Masukkan tajuk tutorial."
    );

    return;
  }


  if (
    link &&
    !safeHttpUrl(link)
  ) {

    showTutorialFormError(
      "Link tutorial mesti bermula dengan http:// atau https://."
    );

    return;
  }


  const button =
    document
      .getElementById("saveTutorialBtn");


  button.disabled = true;

  button.textContent =
    "Menyimpan...";


  try {

    const data =
      await apiRequest(
        "saveTutorial",
        {
          id,
          tajuk,
          penerangan,
          link,
          status,
          susunan
        }
      );


    if (!data.success) {

      handleApiFailure(data);

      showTutorialFormError(
        data.message ||
        "Tidak dapat menyimpan tutorial."
      );

      return;
    }


    closeTutorialForm();

    await loadTutorials();


  } catch (error) {

    console.error(error);

    showTutorialFormError(
      "Tidak dapat menghubungi sistem."
    );


  } finally {

    button.disabled = false;

    button.textContent =
      "Simpan Tutorial";

  }

}


// ======================================
// DELETE TUTORIAL
// ======================================

async function deleteTutorial(
  id,
  title
) {

  const confirmed =
    confirm(
      'Padam tutorial "' +
      title +
      '"?'
    );


  if (!confirmed) {
    return;
  }


  try {

    const data =
      await apiRequest(
        "deleteTutorial",
        { id }
      );


    if (!data.success) {

      handleApiFailure(data);

      alert(
        data.message ||
        "Tidak dapat memadam tutorial."
      );

      return;
    }


    await loadTutorials();


  } catch (error) {

    console.error(error);

    alert(
      "Tidak dapat menghubungi sistem."
    );

  }

}


// ======================================
// HELP
// ======================================

async function loadHelp() {

  try {

    const data =
      await apiRequest(
        "getAdminHelp"
      );


    if (!data.success) {

      handleApiFailure(data);

      return;
    }


    const help =
      data.help || {};


    document
      .getElementById("helpTitle")
      .value =
        help.tajuk || "";


    document
      .getElementById("helpDescription")
      .value =
        help.penerangan || "";


    document
      .getElementById("helpOfficer")
      .value =
        help.pegawai || "";


    document
      .getElementById("helpWhatsapp")
      .value =
        help.whatsapp || "";


    document
      .getElementById("helpEmail")
      .value =
        help.email || "";


    document
      .getElementById("helpTime")
      .value =
        help.waktu || "";


  } catch (error) {

    console.error(error);

    alert(
      "Tidak dapat memuatkan Bantuan ICT."
    );

  }

}


// ======================================
// SAVE HELP
// ======================================

async function saveHelp() {

  const button =
    document
      .getElementById("saveHelpBtn");


  const message =
    document
      .getElementById("helpMessage");


  message.innerHTML = "";


  const values = {

    tajuk:
      document
        .getElementById("helpTitle")
        .value
        .trim(),

    penerangan:
      document
        .getElementById("helpDescription")
        .value
        .trim(),

    pegawai:
      document
        .getElementById("helpOfficer")
        .value
        .trim(),

    whatsapp:
      document
        .getElementById("helpWhatsapp")
        .value
        .replace(/\D/g, ""),

    email:
      document
        .getElementById("helpEmail")
        .value
        .trim(),

    waktu:
      document
        .getElementById("helpTime")
        .value
        .trim()

  };


  button.disabled = true;

  button.textContent =
    "Menyimpan...";


  try {

    const data =
      await apiRequest(
        "saveHelp",
        values
      );


    if (!data.success) {

      handleApiFailure(data);

      throw new Error(
        data.message ||
        "Save failed"
      );

    }


    message.innerHTML =
      '<div class="success-message">' +
      '✓ Maklumat Bantuan ICT berjaya disimpan.' +
      '</div>';


  } catch (error) {

    console.error(error);

    message.innerHTML =
      '<div class="error">' +
      'Tidak dapat menyimpan maklumat.' +
      '</div>';


  } finally {

    button.disabled = false;

    button.textContent =
      "Simpan Maklumat Bantuan";

  }

}


// ======================================
// API
// ======================================

async function apiRequest(
  action,
  params = {},
  requireToken = true
) {

  const query =
    new URLSearchParams();


  query.set(
    "action",
    action
  );


  if (requireToken) {

    query.set(
      "token",
      sessionToken
    );

  }


  Object.entries(params)
    .forEach(
      ([key,value]) => {

        query.set(
          key,
          value ?? ""
        );

      }
    );


  query.set(
    "t",
    Date.now()
  );


  const response =
    await fetch(
      API_URL +
      "?" +
      query.toString(),
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      "HTTP " +
      response.status
    );

  }


  return await response.json();

}


// ======================================
// SESSION
// ======================================

function handleApiFailure(data) {

  if (data && data.expired) {

    alert(
      "Sesi admin telah tamat. Sila log masuk semula."
    );

    logoutAdmin();

  }

}


// ======================================
// LOGOUT
// ======================================

function logoutAdmin() {

  sessionToken = "";

  sessionStorage.removeItem(
    "delimaAdminToken"
  );


  document
    .getElementById("dashboardPage")
    .classList
    .add("hidden");


  document
    .getElementById("loginPage")
    .classList
    .remove("hidden");


  document
    .getElementById("adminPassword")
    .value = "";

}


// ======================================
// PASSWORD
// ======================================

function toggleAdminPassword() {

  const input =
    document
      .getElementById("adminPassword");


  input.type =
    input.type === "password"
      ? "text"
      : "password";

}


// ======================================
// LOGIN ERROR
// ======================================

function showLoginError(text) {

  document
    .getElementById("loginMessage")
    .innerHTML =
      '<div class="error">' +
      escapeHTML(text) +
      '</div>';

}


// ======================================
// TUTORIAL ERROR
// ======================================

function showTutorialFormError(text) {

  document
    .getElementById("tutorialFormMessage")
    .innerHTML =
      '<div class="error">' +
      escapeHTML(text) +
      '</div>';

}


// ======================================
// SAFE URL
// ======================================

function safeHttpUrl(value) {

  if (!value) {
    return "";
  }


  try {

    const url =
      new URL(value);


    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {

      return "";

    }


    return url.href;


  } catch {

    return "";

  }

}


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

  const div =
    document.createElement("div");


  div.textContent =
    String(value ?? "");


  return div.innerHTML;

}


// ======================================
// SEARCH EVENTS
// ======================================

document
  .getElementById("studentSearch")
  .addEventListener(
    "input",
    renderStudents
  );


document
  .getElementById("classFilter")
  .addEventListener(
    "change",
    renderStudents
  );


// ======================================
// ENTER LOGIN
// ======================================

document
  .getElementById("adminPassword")
  .addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        adminLogin();

      }

    }
  );


// ======================================
// RESTORE SESSION
// ======================================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    const saved =
      sessionStorage.getItem(
        "delimaAdminToken"
      );


    if (saved) {

      sessionToken = saved;

      showDashboard();

    }

  }
);
