const messageInput = document.getElementById("messageInput");
const charCount = document.getElementById("charCount");
const messageForm = document.getElementById("messageForm");
const composerSuccess = document.getElementById("composerSuccess");
const sendAnotherBtn = document.getElementById("sendAnotherBtn");
const anonymousToggle = document.getElementById("anonymousToggle");
const contactField = document.getElementById("contactField");
const contactInput = document.getElementById("contactInput");
const clearBtn = document.getElementById("clearBtn");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const qaList = document.getElementById("qaList");
const sortBtn = document.getElementById("sortBtn");
const shareBtn = document.getElementById("shareBtn");
const shareDropdown = document.getElementById("shareDropdown");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const pausedOverlay = document.getElementById("pausedOverlay");
const askFab = document.getElementById("askFab");
const composerCard = document.getElementById("composerCard");

/* ── Character count with color states ── */

const updateCount = () => {
  const len = messageInput.value.length;
  charCount.textContent = `${len}/280`;
  charCount.classList.remove("char-count--warn", "char-count--danger");
  if (len > 260) {
    charCount.classList.add("char-count--danger");
  } else if (len > 200) {
    charCount.classList.add("char-count--warn");
  }
};

messageInput.addEventListener("input", updateCount);

/* ── Contact field toggle ── */

const updateContact = () => {
  if (anonymousToggle.checked) {
    contactField.querySelector("span").textContent = "Contact email (optional)";
    contactInput.required = false;
  } else {
    contactField.querySelector("span").textContent = "Contact email (required)";
    contactInput.required = true;
  }
};

anonymousToggle.addEventListener("change", updateContact);

/* ── Clear button ── */

clearBtn.addEventListener("click", () => {
  messageInput.value = "";
  contactInput.value = "";
  updateCount();
});

/* ── Toast ── */

const showToast = (message) => {
  toastMessage.textContent = message || "Message sent to Kwan";
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

/* ── Form submit with success state ── */

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!messageInput.value.trim()) {
    messageInput.focus();
    return;
  }
  if (!anonymousToggle.checked && !contactInput.value.trim()) {
    contactInput.focus();
    return;
  }
  messageForm.style.display = "none";
  composerSuccess.classList.add("is-active");
  showToast("Message sent to Kwan");
  messageInput.value = "";
  contactInput.value = "";
  updateCount();
});

sendAnotherBtn.addEventListener("click", () => {
  composerSuccess.classList.remove("is-active");
  messageForm.style.display = "grid";
});

/* ── Sort Q&A ── */

let newestFirst = true;

sortBtn.addEventListener("click", () => {
  newestFirst = !newestFirst;
  sortBtn.textContent = `Sort: ${newestFirst ? "newest" : "oldest"}`;
  const items = Array.from(qaList.children);
  items.reverse();
  qaList.innerHTML = "";
  items.forEach((item) => qaList.appendChild(item));
});

/* ── Reactions ── */

qaList.addEventListener("click", (event) => {
  const reactBtn = event.target.closest(".qa__react");
  if (!reactBtn) return;
  let count = parseInt(reactBtn.dataset.count) || 0;
  if (reactBtn.classList.contains("is-liked")) {
    count--;
    reactBtn.classList.remove("is-liked");
  } else {
    count++;
    reactBtn.classList.add("is-liked");
  }
  reactBtn.dataset.count = count;
  reactBtn.querySelector(".qa__react-count").textContent = count;
});

/* ── Share dropdown ── */

shareBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  shareDropdown.classList.toggle("is-open");
});

document.addEventListener("click", (event) => {
  if (!shareDropdown.contains(event.target) && event.target !== shareBtn) {
    shareDropdown.classList.remove("is-open");
  }
});

copyLinkBtn.addEventListener("click", () => {
  const input = document.getElementById("shareLinkInput");
  navigator.clipboard.writeText(input.value).then(() => {
    showToast("Link copied!");
  });
});

/* ── QR Code generation ── */

const generateQR = () => {
  const qrContainer = document.getElementById("qrCode");
  if (typeof qrcode !== "undefined") {
    const qr = qrcode(0, "M");
    qr.addData("https://wemint.link/kwan");
    qr.make();
    qrContainer.innerHTML = qr.createSvgTag({ cellSize: 3, margin: 2 });
  }
};

/* ── Paused state (from localStorage) ── */

const checkPausedState = () => {
  const isPaused = localStorage.getItem("wemint_paused") === "true";
  if (isPaused) {
    pausedOverlay.classList.add("is-active");
    messageForm.querySelectorAll("input, textarea, button").forEach(
      (el) => (el.disabled = true)
    );
  }
};

/* ── FAB scroll behavior ── */

const updateFabVisibility = () => {
  const composerRect = composerCard.getBoundingClientRect();
  const isVisible = composerRect.top > window.innerHeight || composerRect.bottom < 0;
  askFab.classList.toggle("is-hidden", !isVisible);
};

askFab.addEventListener("click", () => {
  composerCard.scrollIntoView({ behavior: "smooth", block: "center" });
});

window.addEventListener("scroll", updateFabVisibility, { passive: true });

/* ── Init ── */

updateCount();
updateContact();
checkPausedState();
generateQR();
updateFabVisibility();
