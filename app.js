const API_URL =
  "https://script.google.com/macros/s/AKfycbzWvfXVDh6y2ttNc3ySkVcymqEfgmsI7K-wwGY4ve_m_y78HfVIi55k7kyzllgGVnB4/exec";


let currentPassword = "";
let passwordVisible = false;
let deferredPrompt = null;


// =====================================
// SEARCH DELIMA
// =====================================

async function cariDelima() {

  const nokp =
    document
      .getElementById("nokp")
      .value
      .replace(/\D/g, "");

  const pin =
    document
      .getElementById("pin")
      .value
      .replace(/\D/g, "");


  const result =
    document.getElementById("result");

  const loading =
    document.getElementById("loading");

  const message =
    document.getElementById("message");

  const button =
    document.getElementById("btnCari");


  result.classList.add("hidden");

  message.innerHTML = "";


  // IC VALIDATION

  if (nokp.length !== 12) {

    showError(
      "Sila masukkan 12 digit No. KP / MyKid."
    );

    return;
  }


  // PIN VALIDATION

  if (pin.length !== 4) {

    showError(
      "Sila masukkan 4 digit PIN penjaga."
    );

    return;
  }


  loading.classList.remove("hidden");

  button.disabled = true;


  try {

    const url =
      API_URL +
      "?action=search" +
      "&nokp=" +
      encodeURIComponent(nokp) +
      "&pin=" +
      encodeURIComponent(pin) +
      "&t=" +
      Date.now();


    const response =
      await fetch(url, {
        method: "GET",
        cache: "no-store"
      });


    if (!response.ok) {

      throw new Error(
        "HTTP " + response.status
      );

    }


    const data =
      await response.json();


    loading.classList.add("hidden");

    button.disabled = false;


    // FAILED

    if (!data.success) {

      showError(
        data.message ||
        "Maklumat tidak sepadan atau akaun tidak dijumpai."
      );

      return;
    }


    // SUCCESS

    document
      .getElementById("nama")
      .textContent =
      data.nama || "-";


    document
      .getElementById("kelas")
      .textContent =
      data.kelas || "-";


    document
      .getElementById("delima")
      .textContent =
      data.delima || "-";


    currentPassword =
      data.password || "";


    passwordVisible = false;


    document
      .getElementById("password")
      .textContent =
      "••••••••";


    result.classList.remove("hidden");


    // Padam PIN selepas berjaya

    document
      .getElementById("pin")
      .value = "";


    result.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });


  } catch (error) {

    console.error(
      "DELIMa API Error:",
      error
    );


    loading.classList.add("hidden");

    button.disabled = false;


    showError(
      "Tidak dapat menghubungi sistem. Sila cuba lagi."
    );

  }

}


// =====================================
// ERROR
// =====================================

function showError(text) {

  document
    .getElementById("message")
    .innerHTML =
    '<div class="error">' +
    escapeHTML(text) +
    '</div>';

}


// =====================================
// PASSWORD
// =====================================

function togglePassword() {

  const password =
    document.getElementById("password");


  passwordVisible =
    !passwordVisible;


  password.textContent =
    passwordVisible
      ? (currentPassword || "-")
      : "••••••••";

}


// =====================================
// PIN SHOW / HIDE
// =====================================

function togglePin() {

  const pin =
    document.getElementById("pin");


  if (pin.type === "password") {

    pin.type = "text";

  } else {

    pin.type = "password";

  }

}


// =====================================
// COPY DELIMA
// =====================================

async function copyDelima() {

  const text =
    document
      .getElementById("delima")
      .textContent;


  await copyToClipboard(
    text,
    "ID DELIMa telah disalin."
  );

}


// =====================================
// COPY PASSWORD
// =====================================

async function copyPassword() {

  if (!currentPassword) {
    return;
  }


  await copyToClipboard(
    currentPassword,
    "Kata laluan telah disalin."
  );

}


// =====================================
// COPY
// =====================================

async function copyToClipboard(
  text,
  successMessage
) {

  try {

    await navigator.clipboard
      .writeText(text);

    showToast(successMessage);

  } catch (error) {

    console.error(error);

    showToast(
      "Tidak dapat menyalin."
    );

  }

}


// =====================================
// SIMPLE TOAST
// =====================================

function showToast(text) {

  const old =
    document.getElementById("toast");


  if (old) {
    old.remove();
  }


  const toast =
    document.createElement("div");


  toast.id = "toast";

  toast.textContent = text;


  Object.assign(
    toast.style,
    {
      position: "fixed",
      left: "50%",
      bottom: "25px",
      transform: "translateX(-50%)",
      background: "#101828",
      color: "#ffffff",
      padding: "12px 18px",
      borderRadius: "10px",
      zIndex: "9999",
      fontSize: "14px",
      boxShadow:
        "0 8px 30px rgba(0,0,0,.2)"
    }
  );


  document.body.appendChild(toast);


  setTimeout(
    () => toast.remove(),
    2200
  );

}


// =====================================
// NEW SEARCH
// =====================================

function resetSearch() {

  document
    .getElementById("nokp")
    .value = "";


  document
    .getElementById("pin")
    .value = "";


  document
    .getElementById("result")
    .classList.add("hidden");


  document
    .getElementById("message")
    .innerHTML = "";


  currentPassword = "";

  passwordVisible = false;


  document
    .getElementById("nokp")
    .focus();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// =====================================
// TUTORIAL / HELP
// =====================================

function toggleSection(id) {

  const tutorial =
    document.getElementById("tutorial");

  const help =
    document.getElementById("help");

  const target =
    document.getElementById(id);


  if (id === "tutorial") {

    help.classList.add("hidden");

  } else {

    tutorial.classList.add("hidden");

  }


  target.classList.toggle("hidden");


  if (!target.classList.contains("hidden")) {

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


// =====================================
// ENTER KEY
// =====================================

document
  .getElementById("nokp")
  .addEventListener(
    "keydown",
    function(event) {

      if (event.key === "Enter") {

        document
          .getElementById("pin")
          .focus();

      }

    }
  );


document
  .getElementById("pin")
  .addEventListener(
    "keydown",
    function(event) {

      if (event.key === "Enter") {

        cariDelima();

      }

    }
  );


// =====================================
// ONLY NUMBERS
// =====================================

document
  .getElementById("nokp")
  .addEventListener(
    "input",
    function() {

      this.value =
        this.value
          .replace(/\D/g, "")
          .slice(0, 12);

    }
  );


document
  .getElementById("pin")
  .addEventListener(
    "input",
    function() {

      this.value =
        this.value
          .replace(/\D/g, "")
          .slice(0, 4);

    }
  );


// =====================================
// PWA INSTALL
// =====================================

const installCard =
  document.getElementById("installCard");

const installBtn =
  document.getElementById("installBtn");


window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredPrompt = event;

    installCard
      .classList
      .remove("hidden");

  }
);


installBtn.addEventListener(
  "click",
  async () => {

    // iPhone instructions

    if (
      isIOS() &&
      !deferredPrompt
    ) {

      alert(
        "Untuk memasang Portal DELIMa di iPhone:\n\n" +
        "1. Buka portal menggunakan Safari.\n" +
        "2. Tekan butang Share.\n" +
        "3. Pilih Add to Home Screen.\n" +
        "4. Tekan Add."
      );

      return;
    }


    if (!deferredPrompt) {
      return;
    }


    deferredPrompt.prompt();


    await deferredPrompt.userChoice;


    deferredPrompt = null;


    installCard
      .classList
      .add("hidden");

  }
);


window.addEventListener(
  "appinstalled",
  () => {

    deferredPrompt = null;

    installCard
      .classList
      .add("hidden");

  }
);


// =====================================
// IOS
// =====================================

function isIOS() {

  return /iphone|ipad|ipod/i
    .test(
      navigator.userAgent
    );

}


function isStandalone() {

  return (
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches ||
    navigator.standalone === true
  );

}


if (
  isIOS() &&
  !isStandalone()
) {

  installCard
    .classList
    .remove("hidden");


  installBtn.textContent =
    "Cara Install";

}


// =====================================
// SECURITY
// =====================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    String(text);

  return div.innerHTML;

}
// =====================================
// LOAD PUBLIC CONTENT
// =====================================

async function loadPublicContent() {

  await Promise.all([
    loadPublicTutorials(),
    loadPublicHelp()
  ]);

}


// =====================================
// LOAD TUTORIAL
// =====================================

async function loadPublicTutorials() {

  const container =
    document.getElementById("tutorialContent");

  if (!container) return;

  try {

    const response =
      await fetch(
        API_URL +
        "?action=getTutorial&t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );

    const data =
      await response.json();


    if (
      !data.success ||
      !Array.isArray(data.tutorials)
    ) {

      throw new Error(
        "Tutorial API error"
      );

    }


    container.innerHTML = "";


    if (data.tutorials.length === 0) {

      container.innerHTML =
        '<div class="help-box">' +
        '<strong>Belum ada tutorial</strong>' +
        '<p>Tutorial akan ditambah dari semasa ke semasa.</p>' +
        '</div>';

      return;

    }


    data.tutorials.forEach(
      (tutorial, index) => {

        const item =
          document.createElement("div");

        item.className =
          "tutorial-item";


        const number =
          document.createElement("div");

        number.className =
          "number";

        number.textContent =
          tutorial.susunan ||
          index + 1;


        const content =
          document.createElement("div");


        const title =
          document.createElement("strong");

        title.textContent =
          tutorial.tajuk || "Tutorial";


        const description =
          document.createElement("p");

        description.textContent =
          tutorial.penerangan || "";


        content.appendChild(title);

        if (tutorial.penerangan) {
          content.appendChild(description);
        }


        // LINK

        const safeLink =
          safePublicUrl(
            tutorial.link
          );


        if (safeLink) {

          const link =
            document.createElement("a");

          link.href =
            safeLink;

          link.target =
            "_blank";

          link.rel =
            "noopener noreferrer";

          link.textContent =
            "Buka Tutorial ↗";

          link.style.display =
            "inline-block";

          link.style.marginTop =
            "8px";

          link.style.color =
            "#123b72";

          link.style.fontWeight =
            "700";

          link.style.textDecoration =
            "none";


          content.appendChild(link);

        }


        item.appendChild(number);

        item.appendChild(content);

        container.appendChild(item);

      }
    );


  } catch (error) {

    console.error(
      "Tutorial Error:",
      error
    );


    container.innerHTML =
      '<div class="help-box">' +
      '<strong>Tutorial tidak dapat dimuatkan.</strong>' +
      '<p>Sila cuba semula kemudian.</p>' +
      '</div>';

  }

}


// =====================================
// LOAD HELP
// =====================================

async function loadPublicHelp() {

  const container =
    document.getElementById(
      "helpContent"
    );


  if (!container) return;


  try {

    const response =
      await fetch(
        API_URL +
        "?action=getHelp&t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        "Help API error"
      );

    }


    const help =
      data.help || {};


    // TITLE

    const title =
      document.getElementById(
        "publicHelpTitle"
      );


    if (title && help.tajuk) {

      title.textContent =
        help.tajuk;

    }


    container.innerHTML = "";


    // DESCRIPTION

    if (help.penerangan) {

      const box =
        createHelpBox(
          "Maklumat Bantuan",
          help.penerangan
        );

      container.appendChild(box);

    }


    // OFFICER

    if (help.pegawai) {

      const box =
        createHelpBox(
          "Pegawai / Penyelaras",
          help.pegawai
        );

      container.appendChild(box);

    }


    // TIME

    if (help.waktu) {

      const box =
        createHelpBox(
          "Waktu Bantuan",
          help.waktu
        );

      container.appendChild(box);

    }


    // CONTACT BUTTONS

    const contact =
      document.createElement("div");

    contact.style.display =
      "grid";

    contact.style.gap =
      "10px";

    contact.style.marginTop =
      "15px";


    // WHATSAPP

    if (help.whatsapp) {

      const number =
        String(help.whatsapp)
          .replace(/\D/g, "");


      const whatsapp =
        document.createElement("a");


      whatsapp.href =
        "https://wa.me/" +
        number;


      whatsapp.target =
        "_blank";

      whatsapp.rel =
        "noopener noreferrer";


      whatsapp.textContent =
        "💬 Hubungi melalui WhatsApp";


      styleContactButton(
        whatsapp,
        "#159455"
      );


      contact.appendChild(
        whatsapp
      );

    }


    // EMAIL

    if (help.email) {

      const email =
        document.createElement("a");


      email.href =
        "mailto:" +
        encodeURIComponent(
          help.email
        );


      email.textContent =
        "✉️ Hantar E-mel";


      styleContactButton(
        email,
        "#123b72"
      );


      contact.appendChild(
        email
      );

    }


    container.appendChild(
      contact
    );


  } catch (error) {

    console.error(
      "Help Error:",
      error
    );


    container.innerHTML =
      '<div class="help-box">' +
      '<strong>Maklumat bantuan tidak dapat dimuatkan.</strong>' +
      '<p>Sila cuba semula kemudian.</p>' +
      '</div>';

  }

}


// =====================================
// CREATE HELP BOX
// =====================================

function createHelpBox(
  title,
  text
) {

  const box =
    document.createElement("div");


  box.className =
    "help-box";


  const heading =
    document.createElement("strong");


  heading.textContent =
    title;


  const paragraph =
    document.createElement("p");


  paragraph.textContent =
    text;


  box.appendChild(
    heading
  );


  box.appendChild(
    paragraph
  );


  return box;

}


// =====================================
// CONTACT BUTTON
// =====================================

function styleContactButton(
  element,
  background
) {

  element.style.display =
    "block";

  element.style.padding =
    "13px";

  element.style.borderRadius =
    "10px";

  element.style.background =
    background;

  element.style.color =
    "#ffffff";

  element.style.textAlign =
    "center";

  element.style.textDecoration =
    "none";

  element.style.fontWeight =
    "700";

}


// =====================================
// SAFE PUBLIC URL
// =====================================

function safePublicUrl(value) {

  if (!value) return "";


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


// =====================================
// START PUBLIC CONTENT
// =====================================

window.addEventListener(
  "DOMContentLoaded",
  loadPublicContent
);

// =====================================
// QUICK ACCESS
// =====================================

function goToSearch() {

  const searchCard =
    document.querySelector(
      ".search-card"
    );

  if (!searchCard) {
    return;
  }

  searchCard.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  setTimeout(() => {

    const firstInput =
      searchCard.querySelector(
        "input"
      );

    if (firstInput) {
      firstInput.focus();
    }

  }, 500);

}


// =====================================
// QUICK TUTORIAL
// =====================================

function openQuickTutorial() {

  const tutorial =
    document.getElementById(
      "tutorial"
    );

  if (!tutorial) {
    return;
  }

  tutorial.classList.remove(
    "hidden"
  );

  tutorial.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// =====================================
// QUICK HELP
// =====================================

function openQuickHelp() {

  const help =
    document.getElementById(
      "help"
    );

  if (!help) {
    return;
  }

  help.classList.remove(
    "hidden"
  );

  help.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}
// =====================================
// SERVICE WORKER
// =====================================

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./service-worker.js", {
        scope: "./"
      })
      .then(registration => {
        console.log(
          "Service Worker aktif:",
          registration.scope
        );
      })
      .catch(error => {
        console.error(
          "Service Worker gagal:",
          error
        );
      });

  });

}
// ==========================================
// CHAT BANTUAN ICT - FINAL
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

  const btn = document.getElementById("chatButton");
  const panel = document.getElementById("chatPanel");
  const closeBtn = document.getElementById("closeChat");
  const answerBox = document.getElementById("chatAnswer");
  const badge = document.querySelector(".chat-badge");

  if (!btn || !panel) {
    console.error("Chat ICT: button/panel tidak dijumpai");
    return;
  }

  console.log("Chat ICT FINAL aktif");

  // BUKA CHAT
  btn.onclick = function (event) {
    event.preventDefault();
    event.stopPropagation();

    panel.classList.add("active");
    panel.setAttribute("aria-hidden", "false");

    if (badge) {
      badge.style.display = "none";
    }
  };

  // TUTUP CHAT
  if (closeBtn) {
    closeBtn.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();

      panel.classList.remove("active");
      panel.setAttribute("aria-hidden", "true");
    };
  }

  // PILIHAN CHAT
  document.querySelectorAll(".chat-options button")
    .forEach(function (button) {

      button.onclick = function () {

        const type = button.getAttribute("data-help");
        let answer = "";

        if (type === "password") {

          answer = `
            🔑 <strong>Lupa Kata Laluan</strong><br><br>
            Gunakan menu <strong>Semak ID</strong>.
            Masukkan No. KP/MyKid murid dan PIN penjaga
            untuk melihat maklumat akaun DELIMa.
          `;

        } else if (type === "id") {

          answer = `
            👤 <strong>Masalah ID DELIMa</strong><br><br>
            Pastikan No. KP/MyKid murid dimasukkan dengan betul.
            Jika akaun masih tidak ditemui, sila hubungi pihak ICT sekolah.
          `;

        } else if (type === "login") {

          answer = `
            🔐 <strong>Tidak Boleh Log Masuk</strong><br><br>
            Pastikan ID DELIMa dan kata laluan dimasukkan dengan tepat.
            Pastikan juga tiada ruang kosong semasa menyalin.
          `;

        } else if (type === "classroom") {

          answer = `
            📚 <strong>Google Classroom</strong><br><br>
            Sila buka bahagian <strong>Tutorial</strong>
            untuk melihat panduan Google Classroom.
          `;

        } else {

          answer = `
            🧑‍💻 <strong>Bantuan Lanjut</strong><br><br>
            Sila buka bahagian <strong>Bantuan ICT</strong>
            untuk mendapatkan bantuan daripada pihak ICT sekolah.
          `;
        }

        if (answerBox) {
          answerBox.innerHTML =
            `<div class="chat-answer-bubble">${answer}</div>`;
        }
      };
    });

  // ESC = TUTUP
  document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
      panel.classList.remove("active");
      panel.setAttribute("aria-hidden", "true");
    }

  });

});
