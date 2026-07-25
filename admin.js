// ======================================================
// PORTAL PENGURUSAN DELIMA
// ADMIN DASHBOARD
// SK AGAMA (MIS) MIRI
// ======================================================


// ======================================================
// CONFIG
// ======================================================

// PENTING:
// Kekalkan URL Google Apps Script cikgu yang sedia ada.
// Jika admin.js lama cikgu sudah mempunyai API_URL,
// gantikan URL di bawah dengan URL tersebut.

const API_URL =
  "MASUKKAN_URL_GOOGLE_APPS_SCRIPT_CIKGU_DI_SINI";


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let sessionToken =
  sessionStorage.getItem("adminSession") || "";

let allStudents = [];
let allTutorials = [];


// ======================================================
// LIVE CHAT VARIABLES
// ======================================================

let adminChatConversations = [];

let activeAdminChatId = "";

let adminChatTimer = null;


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "Portal DELIMa Admin loaded"
    );

    setupAdmin();

  }
);


// ======================================================
// SETUP ADMIN
// ======================================================

function setupAdmin() {

  const loginSection =
    document.getElementById(
      "adminLogin"
    );

  const dashboard =
    document.getElementById(
      "adminDashboard"
    );


  if (sessionToken) {

    if (loginSection) {
      loginSection.classList.add(
        "hidden"
      );
    }

    if (dashboard) {
      dashboard.classList.remove(
        "hidden"
      );
    }

    showAdminSection(
      "students"
    );

  }

}


// ======================================================
// ADMIN LOGIN
// ======================================================

async function loginAdmin(event) {

  if (event) {
    event.preventDefault();
  }


  const usernameInput =
    document.getElementById(
      "adminUsername"
    );

  const passwordInput =
    document.getElementById(
      "adminPassword"
    );

  const messageBox =
    document.getElementById(
      "loginMessage"
    );


  if (
    !usernameInput ||
    !passwordInput
  ) {

    return;

  }


  const username =
    usernameInput.value.trim();

  const password =
    passwordInput.value.trim();


  if (
    !username ||
    !password
  ) {

    showMessage(
      messageBox,
      "Sila masukkan ID Admin dan kata laluan.",
      "error"
    );

    return;

  }


  try {

    showMessage(
      messageBox,
      "Sedang log masuk...",
      "info"
    );


    const data =
      await apiRequest(
        "adminLogin",
        {
          username,
          password
        }
      );


    if (!data.success) {

      showMessage(
        messageBox,
        data.message ||
        "ID Admin atau kata laluan tidak sah.",
        "error"
      );

      return;

    }


    sessionToken =
      data.token ||
      data.sessionToken ||
      "";


    if (!sessionToken) {

      showMessage(
        messageBox,
        "Token sesi tidak diterima.",
        "error"
      );

      return;

    }


    sessionStorage.setItem(
      "adminSession",
      sessionToken
    );


    const loginSection =
      document.getElementById(
        "adminLogin"
      );

    const dashboard =
      document.getElementById(
        "adminDashboard"
      );


    if (loginSection) {

      loginSection.classList.add(
        "hidden"
      );

    }


    if (dashboard) {

      dashboard.classList.remove(
        "hidden"
      );

    }


    showAdminSection(
      "students"
    );


  }
  catch (error) {

    console.error(
      "Login error:",
      error
    );


    showMessage(
      messageBox,
      "Tidak dapat menghubungi server.",
      "error"
    );

  }

}


// ======================================================
// LOGOUT
// ======================================================

function logoutAdmin() {

  stopAdminChatPolling();


  activeAdminChatId = "";

  adminChatConversations = [];


  sessionToken = "";


  sessionStorage.removeItem(
    "adminSession"
  );


  location.reload();

}


// ======================================================
// SHOW ADMIN SECTION
// ======================================================

function showAdminSection(
  section
) {

  const sections = [
    "students",
    "tutorial",
    "help",
    "chat"
  ];


  sections.forEach(
    function (name) {

      const element =
        document.getElementById(
          name + "Section"
        );


      if (element) {

        element.classList.add(
          "hidden"
        );

      }


      const tab =
        document.getElementById(
          "tab" +
          capitalize(name)
        );


      if (tab) {

        tab.classList.remove(
          "active"
        );

      }

    }
  );


  const activeSection =
    document.getElementById(
      section + "Section"
    );


  if (activeSection) {

    activeSection.classList.remove(
      "hidden"
    );

  }


  const activeTab =
    document.getElementById(
      "tab" +
      capitalize(section)
    );


  if (activeTab) {

    activeTab.classList.add(
      "active"
    );

  }


  // ----------------------------------
  // STUDENTS
  // ----------------------------------

  if (
    section ===
    "students"
  ) {

    stopAdminChatPolling();

    if (
      typeof loadStudents ===
      "function"
    ) {

      loadStudents();

    }

  }


  // ----------------------------------
  // TUTORIAL
  // ----------------------------------

  if (
    section ===
    "tutorial"
  ) {

    stopAdminChatPolling();

    if (
      typeof loadTutorials ===
      "function"
    ) {

      loadTutorials();

    }

  }


  // ----------------------------------
  // HELP
  // ----------------------------------

  if (
    section ===
    "help"
  ) {

    stopAdminChatPolling();

    if (
      typeof loadHelp ===
      "function"
    ) {

      loadHelp();

    }

  }


  // ----------------------------------
  // LIVE CHAT
  // ----------------------------------

  if (
    section ===
    "chat"
  ) {

    loadAdminChats(
      true
    );

    startAdminChatPolling();

  }

}


// ======================================================
// CAPITALIZE
// ======================================================

function capitalize(
  text
) {

  if (!text) {
    return "";
  }


  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );

}


// ======================================================
// LIVE CHAT
// ======================================================


// ======================================================
// LOAD CHAT LIST
// ======================================================

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
          "Tidak dapat memuatkan chat."
        );

      }


      return;

    }


    // Backend mungkin return chats
    // atau conversations.

    adminChatConversations =
      Array.isArray(
        data.chats
      )
        ? data.chats
        :
      Array.isArray(
        data.conversations
      )
        ? data.conversations
        :
        [];


    renderAdminChatList();


    updateAdminChatBadge(
      data
    );


    // Jika admin sedang membuka chat,
    // refresh mesej chat tersebut.

    if (
      activeAdminChatId
    ) {

      const exists =
        adminChatConversations.some(
          function (item) {

            return (
              String(
                getChatId(
                  item
                )
              ) ===
              String(
                activeAdminChatId
              )
            );

          }
        );


      if (exists) {

        await loadAdminChatMessages(
          activeAdminChatId,
          false
        );

      }

    }

  }
  catch (error) {

    console.error(
      "Admin chat list:",
      error
    );


    if (showError) {

      showAdminChatError(
        "Live Chat tidak dapat dimuatkan."
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


// ======================================================
// RENDER CHAT LIST
// ======================================================

function renderAdminChatList() {

  const list =
    document.getElementById(
      "chatConversationList"
    );


  const count =
    document.getElementById(
      "chatConversationCount"
    );


  if (
    !list ||
    !count
  ) {

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
    function (chat) {

      const chatId =
        getChatId(
          chat
        );


      if (!chatId) {

        return;

      }


      const unread =
        Number(

          chat.unread ??

          chat.unreadAdmin ??

          chat.unread_count ??

          (
            String(
              chat.readAdmin ||
              chat.READ_ADMIN ||
              ""
            ).toUpperCase() ===
            "NO"
              ? 1
              : 0
          )

        ) || 0;


      const status =
        String(
          chat.status ||
          chat.STATUS ||
          "OPEN"
        ).toUpperCase();


      const name =
        chat.parentName ||
        chat.nama ||
        chat.studentName ||
        chat.studentId ||
        chat.STUDENT_ID ||
        "Ibu Bapa";


      const preview =
        chat.lastMessage ||
        chat.message ||
        chat.MESSAGE ||
        "Perbualan bantuan ICT";


      const time =
        chat.lastTimestamp ||
        chat.timestamp ||
        chat.TIMESTAMP ||
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
          String(
            chatId
          ) ===
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
            name
          ) +
          '</strong>' +

          '<time>' +
          escapeHTML(
            formatChatTime(
              time
            )
          ) +
          '</time>' +

        '</div>' +


        '<p>' +
        escapeHTML(
          preview
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

              ''
          ) +

        '</div>';


      button.onclick =
        function () {

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


// ======================================================
// GET CHAT ID
// ======================================================

function getChatId(
  chat
) {

  return (

    chat.chatId ||

    chat.chat_id ||

    chat.CHAT_ID ||

    chat.sessionId ||

    chat.SESSION_ID ||

    ""

  );

}


// ======================================================
// OPEN CHAT
// ======================================================

async function openAdminChat(
  chatId
) {

  activeAdminChatId =
    String(
      chatId ||
      ""
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
      function (item) {

        return (
          String(
            getChatId(
              item
            )
          ) ===
          activeAdminChatId
        );

      }
    ) || {};


  const name =
    chat.parentName ||
    chat.nama ||
    chat.studentName ||
    chat.studentId ||
    chat.STUDENT_ID ||
    "Ibu Bapa";


  const meta = [];


  if (
    chat.studentId ||
    chat.STUDENT_ID
  ) {

    meta.push(
      "ID Murid: " +
      (
        chat.studentId ||
        chat.STUDENT_ID
      )
    );

  }


  meta.push(
    "Chat: " +
    activeAdminChatId
  );


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
      meta.join(
        " • "
      );

  }


  await loadAdminChatMessages(
    activeAdminChatId,
    true
  );

}


// ======================================================
// LOAD CHAT MESSAGES
// ======================================================

async function loadAdminChatMessages(
  chatId,
  scrollToBottom = false
) {

  if (!chatId) {

    return;

  }


  try {

    const data =
      await apiRequest(
        "getAdminChatMessages",
        {
          chatId
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


    if (
      String(
        chatId
      ) !==
      String(
        activeAdminChatId
      )
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
      scrollToBottom
    );

  }
  catch (error) {

    console.error(
      "Admin chat messages:",
      error
    );


    showAdminChatError(
      "Tidak dapat membaca mesej."
    );

  }

}


// ======================================================
// RENDER MESSAGES
// ======================================================

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

    < 100;


  box.innerHTML = "";


  if (!messages.length) {

    box.innerHTML =

      '<div class="chat-empty">' +

      'Belum ada mesej dalam perbualan ini.' +

      '</div>';


    return;

  }


  messages.forEach(
    function (message) {

      const sender =
        String(
          message.sender ||
          message.SENDER ||
          ""
        ).toUpperCase();


      const isAdmin =

        sender ===
        "ADMIN" ||

        sender ===
        "ICT";


      const text =

        message.message ||

        message.MESSAGE ||

        message.text ||

        "";


      const timestamp =

        message.timestamp ||

        message.TIMESTAMP ||

        "";


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
            text
          ) +
          '</p>' +

          '<small>' +

            escapeHTML(
              isAdmin
                ? "Admin ICT"
                : "Ibu Bapa"
            ) +

            ' • ' +

            escapeHTML(
              formatChatTime(
                timestamp
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


// ======================================================
// SEND ADMIN REPLY
// ======================================================

async function sendAdminChat(
  event
) {

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


  if (
    !input ||
    !button
  ) {

    return;

  }


  const message =
    input.value.trim();


  if (
    !activeAdminChatId ||
    !message
  ) {

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

  }
  catch (error) {

    console.error(
      "Admin send chat:",
      error
    );


    showAdminChatError(
      "Mesej tidak dapat dihantar."
    );

  }
  finally {

    button.disabled =
      false;


    button.textContent =
      "Hantar";


    input.focus();

  }

}


// ======================================================
// CLOSE CHAT
// ======================================================

async function closeAdminConversation() {

  if (!activeAdminChatId) {

    return;

  }


  const confirmClose =
    confirm(
      "Tutup perbualan ini?"
    );


  if (!confirmClose) {

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


    activeAdminChatId = "";


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

  }
  catch (error) {

    console.error(
      "Close chat:",
      error
    );


    showAdminChatError(
      "Tidak dapat menutup perbualan."
    );

  }

}


// ======================================================
// ENTER = SEND
// SHIFT + ENTER = NEW LINE
// ======================================================

function adminChatKeydown(
  event
) {

  if (
    event.key ===
    "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();


    sendAdminChat(
      event
    );

  }

}


// ======================================================
// AUTO REFRESH CHAT
// ======================================================

function startAdminChatPolling() {

  stopAdminChatPolling();


  adminChatTimer =
    setInterval(
      function () {

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


// ======================================================
// STOP AUTO REFRESH
// ======================================================

function stopAdminChatPolling() {

  if (
    adminChatTimer
  ) {

    clearInterval(
      adminChatTimer
    );


    adminChatTimer =
      null;

  }

}


// ======================================================
// UPDATE UNREAD BADGE
// ======================================================

function updateAdminChatBadge(
  data = {}
) {

  const badge =
    document.getElementById(
      "chatUnreadBadge"
    );


  if (!badge) {

    return;

  }


  let unread =
    Number(

      data.unread ??

      data.unreadCount ??

      data.totalUnread

    );


  if (
    !Number.isFinite(
      unread
    )
  ) {

    unread =
      adminChatConversations.reduce(
        function (
          total,
          chat
        ) {

          const value =
            Number(

              chat.unread ??

              chat.unreadAdmin ??

              chat.unread_count ??

              (
                String(
                  chat.readAdmin ||
                  chat.READ_ADMIN ||
                  ""
                ).toUpperCase() ===
                "NO"
                  ? 1
                  : 0
              )

            ) || 0;


          return (
            total +
            value
          );

        },

        0
      );

  }


  badge.textContent =

    unread > 99
      ? "99+"
      : String(
          unread
        );


  badge.classList.toggle(
    "hidden",
    unread <= 0
  );

}


// ======================================================
// FORMAT CHAT TIME
// ======================================================

function formatChatTime(
  value
) {

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


// ======================================================
// CHAT ERROR
// ======================================================

function showAdminChatError(
  text
) {

  const box =
    document.getElementById(
      "chatAdminMessage"
    );


  if (box) {

    box.innerHTML =

      '<div class="error">' +

      escapeHTML(
        text
      ) +

      '</div>';

  }

}


// ======================================================
// CLEAR CHAT ERROR
// ======================================================

function clearAdminChatError() {

  const box =
    document.getElementById(
      "chatAdminMessage"
    );


  if (box) {

    box.innerHTML = "";

  }

}


// ======================================================
// STUDENTS
// ======================================================

async function loadStudents() {

  const table =
    document.getElementById(
      "studentTableBody"
    );


  if (!table) {

    return;

  }


  try {

    const data =
      await apiRequest(
        "getStudents"
      );


    if (!data.success) {

      handleApiFailure(
        data
      );

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

  }
  catch (error) {

    console.error(
      "Load students:",
      error
    );

  }

}


// ======================================================
// RENDER STUDENTS
// ======================================================

function renderStudents(
  students
) {

  const table =
    document.getElementById(
      "studentTableBody"
    );


  if (!table) {

    return;

  }


  table.innerHTML = "";


  if (!students.length) {

    table.innerHTML =

      '<tr>' +

      '<td colspan="6">' +

      'Tiada rekod murid.' +

      '</td>' +

      '</tr>';


    return;

  }


  students.forEach(
    function (
      student
    ) {

      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML =

        "<td>" +
        escapeHTML(
          student.nama ||
          student.NAMA ||
          ""
        ) +
        "</td>" +

        "<td>" +
        escapeHTML(
          student.nokp ||
          student.NO_KP ||
          student.ic ||
          ""
        ) +
        "</td>" +

        "<td>" +
        escapeHTML(
          student.kelas ||
          student.KELAS ||
          ""
        ) +
        "</td>" +

        "<td>" +
        escapeHTML(
          student.delima ||
          student.ID_DELIMA ||
          student.email ||
          ""
        ) +
        "</td>" +

        "<td>" +
        escapeHTML(
          student.pin ||
          student.PIN ||
          ""
        ) +
        "</td>";


      table.appendChild(
        row
      );

    }
  );

}


// ======================================================
// SEARCH STUDENT
// ======================================================

function searchStudent() {

  const input =
    document.getElementById(
      "studentSearch"
    );


  if (!input) {

    return;

  }


  const keyword =
    input.value
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
      function (
        student
      ) {

        return (
          JSON.stringify(
            student
          )
          .toLowerCase()
          .includes(
            keyword
          )
        );

      }
    );


  renderStudents(
    filtered
  );

}


// ======================================================
// TUTORIAL
// ======================================================

async function loadTutorials() {

  const container =
    document.getElementById(
      "tutorialAdminList"
    );


  if (!container) {

    return;

  }


  try {

    const data =
      await apiRequest(
        "getTutorials"
      );


    if (!data.success) {

      handleApiFailure(
        data
      );

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

  }
  catch (error) {

    console.error(
      "Tutorial:",
      error
    );

  }

}


// ======================================================
// RENDER TUTORIAL
// ======================================================

function renderTutorials(
  tutorials
) {

  const container =
    document.getElementById(
      "tutorialAdminList"
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
    function (
      tutorial
    ) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "admin-list-item";


      item.innerHTML =

        "<strong>" +

        escapeHTML(
          tutorial.title ||
          tutorial.tajuk ||
          ""
        ) +

        "</strong>" +

        "<p>" +

        escapeHTML(
          tutorial.description ||
          tutorial.penerangan ||
          ""
        ) +

        "</p>";


      container.appendChild(
        item
      );

    }
  );

}


// ======================================================
// HELP
// ======================================================

async function loadHelp() {

  const container =
    document.getElementById(
      "helpAdminContent"
    );


  if (!container) {

    return;

  }


  try {

    const data =
      await apiRequest(
        "getHelp"
      );


    if (!data.success) {

      handleApiFailure(
        data
      );

      return;

    }


    if (
      data.help &&
      typeof data.help ===
      "object"
    ) {

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

  }
  catch (error) {

    console.error(
      "Help:",
      error
    );

  }

}


// ======================================================
// API REQUEST
// ======================================================

async function apiRequest(
  action,
  params = {}
) {

  if (
    !API_URL ||
    API_URL.includes(
      "MASUKKAN_URL"
    )
  ) {

    throw new Error(
      "API_URL belum ditetapkan."
    );

  }


  const url =
    new URL(
      API_URL
    );


  url.searchParams.set(
    "action",
    action
  );


  if (
    sessionToken
  ) {

    url.searchParams.set(
      "token",
      sessionToken
    );

  }


  Object.entries(
    params
  ).forEach(
    function (
      [key, value]
    ) {

      if (
        value !== undefined &&
        value !== null
      ) {

        url.searchParams.set(
          key,
          value
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
      "HTTP " +
      response.status
    );

  }


  return await response.json();

}


// ======================================================
// API FAILURE
// ======================================================

function handleApiFailure(
  data
) {

  if (!data) {

    return;

  }


  const message =
    String(
      data.message ||
      ""
    ).toLowerCase();


  if (
    data.unauthorized ||
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

    sessionToken = "";


    sessionStorage.removeItem(
      "adminSession"
    );

  }

}


// ======================================================
// SHOW MESSAGE
// ======================================================

function showMessage(
  element,
  text,
  type = "info"
) {

  if (!element) {

    return;

  }


  element.innerHTML =

    '<div class="' +
    escapeHTML(
      type
    ) +
    '">' +

    escapeHTML(
      text
    ) +

    '</div>';

}


// ======================================================
// ESCAPE HTML
// SECURITY AGAINST HTML INJECTION
// ======================================================

function escapeHTML(
  value
) {

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


// ======================================================
// END ADMIN.JS
// ======================================================
