// ======================================
// CONFIG
// ======================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbzWvfXVDh6y2ttNc3ySkVcymqEfgmsI7K-wwGY4ve_m_y78HfVIi55k7kyzllgGVnB4/exec";

let sessionToken = "";
let allStudents = [];
let allTutorials = [];

// ======================================
// LIVE CHAT STATE
// ======================================

let adminChatConversations = [];
let activeAdminChatId = "";
let adminChatTimer = null;


// ======================================
// LOGIN
// ======================================

async function loginAdmin() {

  const username =
    document
      .getElementById("username")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value
      .trim();

  const btn =
    document.getElementById(
      "loginBtn"
    );

  const message =
    document.getElementById(
      "loginMessage"
    );


  if (!username || !password) {

    message.innerHTML =
      '<div class="error">' +
      'Sila masukkan username dan password.' +
      '</div>';

    return;

  }


  btn.disabled = true;
  btn.textContent =
    "Sedang log masuk...";

  message.innerHTML = "";


  try {

    const data =
      await apiRequest(
        "adminLogin",
        {
          username,
          password
        }
      );


    if (!data.success) {

      message.innerHTML =
        '<div class="error">' +
        escapeHTML(
          data.message ||
          "Login gagal."
        ) +
        '</div>';

      return;

    }


    sessionToken =
      data.token || "";


    localStorage.setItem(
      "delimaAdminToken",
      sessionToken
    );


    showDashboard();


  } catch (error) {

    console.error(
      "Login:",
      error
    );


    message.innerHTML =
      '<div class="error">' +
      'Tidak dapat menghubungi server.' +
      '</div>';


  } finally {

    btn.disabled = false;
    btn.textContent = "Log Masuk";

  }

}


// ======================================
// SHOW DASHBOARD
// ======================================

function showDashboard() {

  const loginPage =
    document.getElementById(
      "loginPage"
    );

  const dashboardPage =
    document.getElementById(
      "dashboardPage"
    );


  if (loginPage) {

    loginPage.classList.add(
      "hidden"
    );

  }


  if (dashboardPage) {

    dashboardPage.classList.remove(
      "hidden"
    );

  }


  showAdminSection(
    "students"
  );

}


// ======================================
// ADMIN NAVIGATION
// ======================================

function showAdminSection(section) {

  const sections = [
    "students",
    "tutorial",
    "help",
    "chat"
  ];


  sections.forEach(name => {

    const sectionElement =
      document.getElementById(
        name + "Section"
      );


    if (sectionElement) {

      sectionElement
        .classList
        .add("hidden");

    }


    const tabElement =
      document.getElementById(
        "tab" +
        name.charAt(0).toUpperCase() +
        name.slice(1)
      );


    if (tabElement) {

      tabElement
        .classList
        .remove("active");

    }

  });


  const activeSection =
    document.getElementById(
      section + "Section"
    );


  if (activeSection) {

    activeSection
      .classList
      .remove("hidden");

  }


  const activeTab =
    document.getElementById(
      "tab" +
      section.charAt(0).toUpperCase() +
      section.slice(1)
    );


  if (activeTab) {

    activeTab
      .classList
      .add("active");

  }


  // MURID

  if (section === "students") {

    stopAdminChatPolling();

    loadDashboard();

  }


  // TUTORIAL

  if (section === "tutorial") {

    stopAdminChatPolling();

    loadTutorials();

  }


  // BANTUAN ICT

  if (section === "help") {

    stopAdminChatPolling();

    loadHelp();

  }


  // LIVE CHAT

  if (section === "chat") {

    loadAdminChats(true);

    startAdminChatPolling();

  }

}


// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

  try {

    const data =
      await apiRequest(
        "getDashboard"
      );


    if (!data.success) {

      handleApiFailure(data);

      return;

    }


    updateDashboardStats(
      data
    );


    if (
      Array.isArray(
        data.students
      )
    ) {

      allStudents =
        data.students;

      renderStudents(
        allStudents
      );

    }


  } catch (error) {

    console.error(
      "Dashboard:",
      error
    );

  }

}


// ======================================
// UPDATE DASHBOARD STATS
// ======================================

function updateDashboardStats(data) {

  const total =
    document.getElementById(
      "totalStudents"
    );

  const active =
    document.getElementById(
      "activeStudents"
    );

  const classes =
    document.getElementById(
      "totalClasses"
    );


  if (total) {

    total.textContent =
      data.totalStudents ??
      data.total ??
      0;

  }


  if (active) {

    active.textContent =
      data.activeStudents ??
      data.active ??
      0;

  }


  if (classes) {

    classes.textContent =
      data.totalClasses ??
      data.classes ??
      0;

  }

}


// ======================================
// LOAD STUDENTS
// ======================================

async function loadStudents() {

  try {

    const data =
      await apiRequest(
        "getStudents"
      );


    if (!data.success) {

      handleApiFailure(data);

      return;

    }


    allStudents =
      Array.isArray(
        data.students
      )
        ? data.students
        : [];


    renderStudents(
      allStudents
    );


  } catch (error) {

    console.error(
      "Students:",
      error
    );

  }

}


// ======================================
// RENDER STUDENTS
// ======================================

function renderStudents(students) {

  const table =
    document.getElementById(
      "studentTable"
    );


  if (!table) {

    return;

  }


  table.innerHTML = "";


  if (!students.length) {

    table.innerHTML =
      '<tr>' +
      '<td colspan="7">' +
      'Tiada rekod murid.' +
      '</td>' +
      '</tr>';

    return;

  }


  students.forEach(
    student => {

      const row =
        document.createElement(
          "tr"
        );


      const nama =
        student.nama ||
        student.NAMA ||
        "";


      const nokp =
        student.nokp ||
        student.NO_KP ||
        student.ic ||
        "";


      const kelas =
        student.kelas ||
        student.KELAS ||
        "";


      const delima =
        student.delima ||
        student.ID_DELIMA ||
        student.email ||
        "";


      const password =
        student.password ||
        student.PASSWORD ||
        student.katalaluan ||
        "";


      const pin =
        student.pin ||
        student.PIN ||
        "";


      row.innerHTML =

        "<td>" +
        escapeHTML(nama) +
        "</td>" +

        "<td>" +
        escapeHTML(nokp) +
        "</td>" +

        "<td>" +
        escapeHTML(kelas) +
        "</td>" +

        "<td>" +
        escapeHTML(delima) +
        "</td>" +

        "<td>" +
        escapeHTML(password) +
        "</td>" +

        "<td>" +
        escapeHTML(pin) +
        "</td>";


      table.appendChild(
        row
      );

    }
  );

}


// ======================================
// SEARCH STUDENT
// ======================================

function searchStudent() {

  const searchInput =
    document.getElementById(
      "studentSearch"
    );


  if (!searchInput) {

    return;

  }


  const keyword =
    searchInput
      .value
      .trim()
      .toLowerCase();


  if (!keyword) {

    renderStudents(
      allStudents
    );

    return;

  }


  const filtered =
    allStudents.filter(
      student => {

        return (
          JSON.stringify(student)
            .toLowerCase()
            .includes(keyword)
        );

      }
    );


  renderStudents(
    filtered
  );

}


// ======================================
// FILTER CLASS
// ======================================

function filterClass() {

  const filter =
    document.getElementById(
      "classFilter"
    );


  if (!filter) {

    return;

  }


  const selectedClass =
    filter.value
      .trim()
      .toLowerCase();


  if (!selectedClass) {

    renderStudents(
      allStudents
    );

    return;

  }


  const filtered =
    allStudents.filter(
      student => {

        const kelas =
          String(
            student.kelas ||
            student.KELAS ||
            ""
          ).toLowerCase();


        return (
          kelas ===
          selectedClass
        );

      }
    );


  renderStudents(
    filtered
  );

}


// ======================================
// TUTORIAL
// ======================================

async function loadTutorials() {

  try {

    const data =
      await apiRequest(
        "getTutorials"
      );


    if (!data.success) {

      handleApiFailure(data);

      return;

    }


    allTutorials =
      Array.isArray(
        data.tutorials
      )
        ? data.tutorials
        : [];


    renderTutorials(
      allTutorials
    );


  } catch (error) {

    console.error(
      "Tutorial:",
      error
    );

  }

}


// ======================================
// RENDER TUTORIAL
// ======================================

function renderTutorials(tutorials) {

  const container =
    document.getElementById(
      "tutorialList"
    );


  if (!container) {

    return;

  }


  container.innerHTML = "";


  if (!tutorials.length) {

    container.innerHTML =
      '<div class="empty-state">' +
      'Tiada tutorial.' +
      '</div>';

    return;

  }


  tutorials.forEach(
    tutorial => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "admin-list-item";


      const title =
        tutorial.title ||
        tutorial.tajuk ||
        "";


      const description =
        tutorial.description ||
        tutorial.penerangan ||
        "";


      item.innerHTML =

        "<strong>" +
        escapeHTML(title) +
        "</strong>" +

        "<p>" +
        escapeHTML(description) +
        "</p>";


      container.appendChild(
        item
      );

    }
  );

}


// ======================================
// HELP
// ======================================

async function loadHelp() {

  try {

    const data =
      await apiRequest(
        "getHelp"
      );


    if (!data.success) {

      handleApiFailure(data);

      return;

    }


    const container =
      document.getElementById(
        "helpAdminContent"
      );


    if (!container) {

      return;

    }


    if (data.help) {

      container.innerHTML =
        "<pre>" +
        escapeHTML(
          JSON.stringify(
            data.help,
            null,
            2
          )
        ) +
        "</pre>";

    }


  } catch (error) {

    console.error(
      "Help:",
      error
    );

  }

}


// ======================================================
// LIVE CHAT
// ======================================================


// ======================================
// LOAD SENARAI CHAT
// ======================================

async function loadAdminChats(
  showError = false
) {

  const list =
    document.getElementById(
      "chatConversationList"
    );


  try {

    const data =
      await apiRequest(
        "getAdminChats"
      );


    if (!data.success) {

      handleApiFailure(
        data
      );


      if (showError) {

        showAdminChatError(
          data.message ||
          "Tidak dapat memuatkan Live Chat."
        );

      }


      return;

    }


    adminChatConversations =
      Array.isArray(
        data.chats
      )
        ? data.chats
        : [];


    renderAdminChatList();

    updateAdminChatBadge();


    if (activeAdminChatId) {

      const exists =
        adminChatConversations.some(
          chat =>
            String(
              chat.chatId || ""
            ) ===
            String(
              activeAdminChatId
            )
        );


      if (exists) {

        await loadAdminChatMessages(
          activeAdminChatId,
          false
        );

      }

    }


  } catch (error) {

    console.error(
      "Live Chat:",
      error
    );


    if (showError) {

      showAdminChatError(
        "Tidak dapat menghubungi sistem Live Chat."
      );

    }


    if (
      list &&
      !adminChatConversations.length
    ) {

      list.innerHTML =
        '<div class="chat-empty">' +
        'Tidak dapat memuatkan perbualan.' +
        '</div>';

    }

  }

}


// ======================================
// RENDER SENARAI CHAT
// ======================================

function renderAdminChatList() {

  const list =
    document.getElementById(
      "chatConversationList"
    );


  const count =
    document.getElementById(
      "chatConversationCount"
    );


  if (!list || !count) {

    return;

  }


  count.textContent =
    adminChatConversations.length;


  list.innerHTML = "";


  if (
    !adminChatConversations.length
  ) {

    list.innerHTML =
      '<div class="chat-empty">' +
      'Belum ada mesej daripada ibu bapa.' +
      '</div>';

    return;

  }


  adminChatConversations.forEach(
    chat => {

      const chatId =
        String(
          chat.chatId || ""
        );


      if (!chatId) {

        return;

      }


      const unread =
        Number(
          chat.unread || 0
        );


      const status =
        String(
          chat.status ||
          "OPEN"
        ).toUpperCase();


      const studentId =
        chat.studentId ||
        "Ibu Bapa";


      const lastMessage =
        chat.lastMessage ||
        "Perbualan Bantuan ICT";


      const timestamp =
        chat.timestamp ||
        "";


      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "admin-chat-item" +
        (
          chatId ===
          String(
            activeAdminChatId
          )
            ? " active"
            : ""
        );


      button.innerHTML =

        '<div class="admin-chat-item-top">' +

          '<strong>' +
          escapeHTML(
            studentId
          ) +
          '</strong>' +

          '<time>' +
          escapeHTML(
            formatChatTime(
              timestamp
            )
          ) +
          '</time>' +

        '</div>' +

        '<p>' +
        escapeHTML(
          lastMessage
        ) +
        '</p>' +

        '<div class="admin-chat-item-bottom">' +

          '<span class="chat-status-pill ' +

          (
            status ===
            "CLOSED"
              ? "closed"
              : ""
          ) +

          '">' +

          (
            status ===
            "CLOSED"
              ? "DITUTUP"
              : "OPEN"
          ) +

          '</span>' +

          (
            unread > 0

              ?

              '<span class="chat-item-unread">' +
              escapeHTML(
                unread
              ) +
              '</span>'

              :

              ""
          ) +

        '</div>';


      button.onclick =
        () => {

          openAdminChat(
            chatId
          );

        };


      list.appendChild(
        button
      );

    }
  );

}
// ======================================
// OPEN CHAT
// ======================================

async function openAdminChat(chatId) {

  activeAdminChatId =
    String(
      chatId || ""
    );


  renderAdminChatList();


  const empty =
    document.getElementById(
      "chatRoomEmpty"
    );


  const active =
    document.getElementById(
      "chatRoomActive"
    );


  if (empty) {

    empty.classList.add(
      "hidden"
    );

  }


  if (active) {

    active.classList.remove(
      "hidden"
    );

  }


  const chat =
    adminChatConversations.find(
      item =>
        String(
          item.chatId || ""
        ) ===
        activeAdminChatId
    ) || {};


  const name =
    chat.studentId ||
    "Ibu Bapa";


  const nameElement =
    document.getElementById(
      "activeChatName"
    );


  const metaElement =
    document.getElementById(
      "activeChatMeta"
    );


  if (nameElement) {

    nameElement.textContent =
      name;

  }


  if (metaElement) {

    metaElement.textContent =
      "Chat ID: " +
      activeAdminChatId;

  }


  clearAdminChatError();


  await loadAdminChatMessages(
    activeAdminChatId,
    true
  );


  // Refresh senarai selepas mesej dibaca
  await loadAdminChats(
    false
  );

}


// ======================================
// LOAD CHAT MESSAGES
// ======================================

async function loadAdminChatMessages(
  chatId,
  forceScroll = false
) {

  if (!chatId) {

    return;

  }


  try {

    const data =
      await apiRequest(
        "getAdminChatMessages",
        {
          chatId: chatId
        }
      );


    if (!data.success) {

      handleApiFailure(
        data
      );


      showAdminChatError(
        data.message ||
        "Tidak dapat membaca mesej."
      );


      return;

    }


    // Pastikan response masih untuk
    // chat yang sedang dibuka
    if (
      String(chatId) !==
      String(activeAdminChatId)
    ) {

      return;

    }


    const messages =
      Array.isArray(
        data.messages
      )
        ? data.messages
        : [];


    renderAdminChatMessages(
      messages,
      forceScroll
    );


  } catch (error) {

    console.error(
      "Chat messages:",
      error
    );


    showAdminChatError(
      "Tidak dapat membaca mesej."
    );

  }

}


// ======================================
// RENDER CHAT MESSAGES
// ======================================

function renderAdminChatMessages(
  messages,
  forceScroll = false
) {

  const box =
    document.getElementById(
      "adminChatMessages"
    );


  if (!box) {

    return;

  }


  const nearBottom =

    box.scrollHeight -
    box.scrollTop -
    box.clientHeight

    < 120;


  box.innerHTML = "";


  if (!messages.length) {

    box.innerHTML =
      '<div class="chat-empty">' +
      'Belum ada mesej.' +
      '</div>';

    return;

  }


  messages.forEach(
    message => {

      const sender =
        String(
          message.sender || ""
        ).toUpperCase();


      const isAdmin =
        sender === "ADMIN";


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "admin-message-row " +
        (
          isAdmin
            ? "admin"
            : "parent"
        );


      row.innerHTML =

        '<div class="admin-message-bubble">' +

          '<p>' +
          escapeHTML(
            message.message || ""
          ) +
          '</p>' +

          '<small>' +

            (
              isAdmin
                ? "Admin ICT"
                : "Ibu Bapa"
            ) +

            ' • ' +

            escapeHTML(
              formatChatTime(
                message.timestamp
              )
            ) +

          '</small>' +

        '</div>';


      box.appendChild(
        row
      );

    }
  );


  if (
    forceScroll ||
    nearBottom
  ) {

    box.scrollTop =
      box.scrollHeight;

  }

}


// ======================================
// SEND ADMIN MESSAGE
// ======================================

async function sendAdminChat(event) {

  if (event) {

    event.preventDefault();

  }


  const input =
    document.getElementById(
      "adminChatInput"
    );


  const button =
    document.getElementById(
      "adminChatSendBtn"
    );


  if (!input || !button) {

    return;

  }


  const message =
    input.value.trim();


  if (!activeAdminChatId) {

    showAdminChatError(
      "Sila pilih perbualan terlebih dahulu."
    );

    return;

  }


  if (!message) {

    return;

  }


  button.disabled =
    true;


  button.textContent =
    "Menghantar...";


  try {

    const data =
      await apiRequest(
        "sendAdminReply",
        {
          chatId:
            activeAdminChatId,

          message:
            message
        }
      );


    if (!data.success) {

      handleApiFailure(
        data
      );


      showAdminChatError(
        data.message ||
        "Mesej tidak berjaya dihantar."
      );


      return;

    }


    input.value = "";


    clearAdminChatError();


    await loadAdminChatMessages(
      activeAdminChatId,
      true
    );


    await loadAdminChats(
      false
    );


  } catch (error) {

    console.error(
      "Send chat:",
      error
    );


    showAdminChatError(
      "Mesej tidak dapat dihantar."
    );


  } finally {

    button.disabled =
      false;


    button.textContent =
      "Hantar";


    input.focus();

  }

}


// ======================================
// ENTER = SEND
// SHIFT + ENTER = NEW LINE
// ======================================

function adminChatKeydown(event) {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();


    sendAdminChat(
      event
    );

  }

}


// ======================================
// CLOSE CONVERSATION
// ======================================

async function closeAdminConversation() {

  if (!activeAdminChatId) {

    return;

  }


  const confirmed =
    confirm(
      "Tutup perbualan ini?"
    );


  if (!confirmed) {

    return;

  }


  try {

    const data =
      await apiRequest(
        "closeChat",
        {
          chatId:
            activeAdminChatId
        }
      );


    if (!data.success) {

      handleApiFailure(
        data
      );


      showAdminChatError(
        data.message ||
        "Tidak dapat menutup perbualan."
      );


      return;

    }


    activeAdminChatId =
      "";


    const active =
      document.getElementById(
        "chatRoomActive"
      );


    const empty =
      document.getElementById(
        "chatRoomEmpty"
      );


    if (active) {

      active.classList.add(
        "hidden"
      );

    }


    if (empty) {

      empty.classList.remove(
        "hidden"
      );

    }


    await loadAdminChats(
      false
    );


  } catch (error) {

    console.error(
      "Close chat:",
      error
    );


    showAdminChatError(
      "Tidak dapat menutup perbualan."
    );

  }

}


// ======================================
// UPDATE CHAT BADGE
// ======================================

function updateAdminChatBadge() {

  const badge =
    document.getElementById(
      "chatUnreadBadge"
    );


  if (!badge) {

    return;

  }


  const unread =
    adminChatConversations.reduce(
      (total, chat) => {

        return (
          total +
          Number(
            chat.unread || 0
          )
        );

      },
      0
    );


  if (unread > 0) {

    badge.textContent =
      unread > 99
        ? "99+"
        : String(unread);


    badge.classList.remove(
      "hidden"
    );


  } else {

    badge.textContent =
      "0";


    badge.classList.add(
      "hidden"
    );

  }

}


// ======================================
// START CHAT AUTO REFRESH
// ======================================

function startAdminChatPolling() {

  stopAdminChatPolling();


  adminChatTimer =
    setInterval(
      () => {

        const section =
          document.getElementById(
            "chatSection"
          );


        if (
          section &&
          !section.classList.contains(
            "hidden"
          ) &&
          sessionToken
        ) {

          loadAdminChats(
            false
          );

        }

      },

      5000
    );

}


// ======================================
// STOP CHAT AUTO REFRESH
// ======================================

function stopAdminChatPolling() {

  if (adminChatTimer) {

    clearInterval(
      adminChatTimer
    );


    adminChatTimer =
      null;

  }

}


// ======================================
// FORMAT CHAT TIME
// ======================================

function formatChatTime(value) {

  if (!value) {

    return "";

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(
      value
    );

  }


  return date.toLocaleString(
    "ms-MY",
    {

      day:
        "2-digit",

      month:
        "2-digit",

      hour:
        "2-digit",

      minute:
        "2-digit"

    }
  );

}


// ======================================
// SHOW CHAT ERROR
// ======================================

function showAdminChatError(text) {

  const box =
    document.getElementById(
      "chatAdminMessage"
    );


  if (!box) {

    return;

  }


  box.innerHTML =

    '<div class="error">' +

    escapeHTML(
      text
    ) +

    '</div>';

}


// ======================================
// CLEAR CHAT ERROR
// ======================================

function clearAdminChatError() {

  const box =
    document.getElementById(
      "chatAdminMessage"
    );


  if (box) {

    box.innerHTML =
      "";

  }

}


// ======================================
// API
// ======================================

async function apiRequest(
  action,
  params = {}
) {

  const url =
    new URL(
      API_URL
    );


  url.searchParams.set(
    "action",
    action
  );


  if (sessionToken) {

    url.searchParams.set(
      "token",
      sessionToken
    );

  }


  Object.entries(
    params
  ).forEach(
    ([key, value]) => {

      if (
        value !== undefined &&
        value !== null
      ) {

        url.searchParams.set(
          key,
          String(value)
        );

      }

    }
  );


  const response =
    await fetch(
      url.toString(),
      {

        method:
          "GET",

        cache:
          "no-store"

      }
    );


  if (!response.ok) {

    throw new Error(
      "HTTP Error " +
      response.status
    );

  }


  const text =
    await response.text();


  try {

    return JSON.parse(
      text
    );


  } catch (error) {

    console.error(
      "Invalid JSON:",
      text
    );


    throw new Error(
      "Server tidak mengembalikan JSON yang sah."
    );

  }

}


// ======================================
// HANDLE API FAILURE
// ======================================

function handleApiFailure(data) {

  if (!data) {

    return;

  }


  const message =
    String(
      data.message || ""
    ).toLowerCase();


  if (
    data.unauthorized === true ||

    message.includes(
      "session"
    ) ||

    message.includes(
      "token"
    ) ||

    message.includes(
      "login"
    )
  ) {

    logoutAdmin();

  }

}


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
// ======================================
// LOGOUT
// ======================================

function logoutAdmin() {

  // Hentikan auto refresh Live Chat
  stopAdminChatPolling();


  // Reset Live Chat
  activeAdminChatId = "";

  adminChatConversations = [];


  // Buang token
  sessionToken = "";


  localStorage.removeItem(
    "delimaAdminToken"
  );


  // Reset paparan
  const dashboardPage =
    document.getElementById(
      "dashboardPage"
    );


  const loginPage =
    document.getElementById(
      "loginPage"
    );


  if (dashboardPage) {

    dashboardPage.classList.add(
      "hidden"
    );

  }


  if (loginPage) {

    loginPage.classList.remove(
      "hidden"
    );

  }


  // Kosongkan password
  const password =
    document.getElementById(
      "password"
    );


  if (password) {

    password.value = "";

  }


  // Kosongkan mesej login
  const loginMessage =
    document.getElementById(
      "loginMessage"
    );


  if (loginMessage) {

    loginMessage.innerHTML = "";

  }

}


// ======================================
// RESTORE ADMIN SESSION
// ======================================

async function restoreAdminSession() {

  const savedToken =
    localStorage.getItem(
      "delimaAdminToken"
    );


  if (!savedToken) {

    showLoginPage();

    return;

  }


  sessionToken =
    savedToken;


  try {

    /*
      Kita cuba request dashboard.
      Jika token masih sah,
      dashboard akan dipaparkan.
    */

    const data =
      await apiRequest(
        "getDashboard"
      );


    if (!data.success) {

      sessionToken = "";


      localStorage.removeItem(
        "delimaAdminToken"
      );


      showLoginPage();

      return;

    }


    const loginPage =
      document.getElementById(
        "loginPage"
      );


    const dashboardPage =
      document.getElementById(
        "dashboardPage"
      );


    if (loginPage) {

      loginPage.classList.add(
        "hidden"
      );

    }


    if (dashboardPage) {

      dashboardPage.classList.remove(
        "hidden"
      );

    }


    updateDashboardStats(
      data
    );


    if (
      Array.isArray(
        data.students
      )
    ) {

      allStudents =
        data.students;


      renderStudents(
        allStudents
      );

    }


    showAdminSection(
      "students"
    );


  } catch (error) {

    console.error(
      "Restore session:",
      error
    );


    sessionToken = "";


    localStorage.removeItem(
      "delimaAdminToken"
    );


    showLoginPage();

  }

}


// ======================================
// SHOW LOGIN PAGE
// ======================================

function showLoginPage() {

  const loginPage =
    document.getElementById(
      "loginPage"
    );


  const dashboardPage =
    document.getElementById(
      "dashboardPage"
    );


  if (dashboardPage) {

    dashboardPage.classList.add(
      "hidden"
    );

  }


  if (loginPage) {

    loginPage.classList.remove(
      "hidden"
    );

  }

}


// ======================================
// LOGIN WITH ENTER KEY
// ======================================

function setupLoginEnterKey() {

  const username =
    document.getElementById(
      "username"
    );


  const password =
    document.getElementById(
      "password"
    );


  if (username) {

    username.addEventListener(
      "keydown",
      function(event) {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          loginAdmin();

        }

      }
    );

  }


  if (password) {

    password.addEventListener(
      "keydown",
      function(event) {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          loginAdmin();

        }

      }
    );

  }

}


// ======================================
// STUDENT SEARCH EVENT
// ======================================

function setupStudentSearch() {

  const search =
    document.getElementById(
      "studentSearch"
    );


  if (!search) {

    return;

  }


  search.addEventListener(
    "input",
    function() {

      searchStudent();

    }
  );

}


// ======================================
// CLASS FILTER EVENT
// ======================================

function setupClassFilter() {

  const filter =
    document.getElementById(
      "classFilter"
    );


  if (!filter) {

    return;

  }


  filter.addEventListener(
    "change",
    function() {

      filterClass();

    }
  );

}


// ======================================
// CHAT INPUT AUTO RESIZE
// ======================================

function setupAdminChatInput() {

  const input =
    document.getElementById(
      "adminChatInput"
    );


  if (!input) {

    return;

  }


  input.addEventListener(
    "input",
    function() {

      this.style.height =
        "auto";


      this.style.height =
        Math.min(
          this.scrollHeight,
          120
        ) +
        "px";

    }
  );

}


// ======================================
// VISIBILITY CHANGE
// ======================================

function setupVisibilityListener() {

  document.addEventListener(
    "visibilitychange",
    function() {

      /*
        Jika admin kembali ke tab browser
        semasa Live Chat dibuka,
        refresh mesej terus.
      */

      if (
        document.visibilityState ===
        "visible"
      ) {

        const chatSection =
          document.getElementById(
            "chatSection"
          );


        if (
          chatSection &&
          !chatSection.classList.contains(
            "hidden"
          ) &&
          sessionToken
        ) {

          loadAdminChats(
            false
          );

        }

      }

    }
  );

}


// ======================================
// ONLINE EVENT
// ======================================

function setupOnlineListener() {

  window.addEventListener(
    "online",
    function() {

      if (!sessionToken) {

        return;

      }


      const chatSection =
        document.getElementById(
          "chatSection"
        );


      if (
        chatSection &&
        !chatSection.classList.contains(
          "hidden"
        )
      ) {

        loadAdminChats(
          false
        );

      }

    }
  );

}


// ======================================
// INITIALIZE ADMIN
// ======================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "Portal Pengurusan DELIMa Admin"
    );


    setupLoginEnterKey();


    setupStudentSearch();


    setupClassFilter();


    setupAdminChatInput();


    setupVisibilityListener();


    setupOnlineListener();


    restoreAdminSession();

  }
);


// ======================================
// CLEANUP BEFORE PAGE CLOSE
// ======================================

window.addEventListener(
  "beforeunload",
  function() {

    stopAdminChatPolling();

  }
);


// ======================================
// END ADMIN.JS
// ======================================
