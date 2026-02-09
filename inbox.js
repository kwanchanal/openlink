/* ── DOM references ── */

const list = document.getElementById("messageList");
const detailTitle = document.getElementById("detailTitle");
const detailBody = document.getElementById("detailBody");
const detailSender = document.getElementById("detailSender");
const replyInput = document.getElementById("replyInput");
const filterButtons = document.querySelectorAll(".segmented__btn");
const publishBtn = document.getElementById("publishBtn");
const pinBtn = document.getElementById("pinBtn");
const publicToggle = document.getElementById("publicToggle");
const replyBtn = document.getElementById("replyBtn");
const archiveBtn = document.getElementById("archiveBtn");
const searchInput = document.getElementById("searchInput");
const labelSelect = document.getElementById("labelSelect");
const listEmpty = document.getElementById("listEmpty");

const pauseLink = document.getElementById("pauseLink");
const anonymousRule = document.getElementById("anonymousRule");
const contactRule = document.getElementById("contactRule");
const autoReplyToggle = document.getElementById("autoReplyToggle");
const autoReplyField = document.getElementById("autoReplyField");
const profileName = document.getElementById("profileName");
const profileHandle = document.getElementById("profileHandle");
const profilePrompt = document.getElementById("profilePrompt");
const profileImage = document.getElementById("profileImage");
const accentColor = document.getElementById("accentColor");
const accentPicker = document.getElementById("accentPicker");
const bgColor = document.getElementById("bgColor");
const bgPicker = document.getElementById("bgPicker");
const radiusRange = document.getElementById("radiusRange");
const hiddenWords = document.getElementById("hiddenWords");
const wordChips = document.getElementById("wordChips");

const previewName = document.getElementById("previewName");
const previewHandle = document.getElementById("previewHandle");
const previewPrompt = document.getElementById("previewPrompt");
const previewAvatar = document.getElementById("previewAvatar");
const previewRule = document.getElementById("previewRule");
const previewLink = document.getElementById("previewLink");
const previewStatus = document.getElementById("previewStatus");
const previewCard = document.getElementById("previewCard");

const statTotal = document.getElementById("statTotal");
const statUnread = document.getElementById("statUnread");
const statPublished = document.getElementById("statPublished");
const statRate = document.getElementById("statRate");
const countUnread = document.getElementById("countUnread");
const countFlagged = document.getElementById("countFlagged");
const countPublished = document.getElementById("countPublished");
const countAll = document.getElementById("countAll");

const darkModeBtn = document.getElementById("darkModeBtn");
const collapseBtn = document.getElementById("collapseBtn");
const sidebar = document.getElementById("sidebar");
const bulkBar = document.getElementById("bulkBar");
const selectAll = document.getElementById("selectAll");
const bulkArchive = document.getElementById("bulkArchive");
const bulkPublish = document.getElementById("bulkPublish");
const bulkCount = document.getElementById("bulkCount");
const copyShareLink = document.getElementById("copyShareLink");
const shareLinkInput = document.getElementById("shareLinkInput");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

let activeCard = list.querySelector(".card");

/* ── Toast ── */

const showToast = (message) => {
  toastMessage.textContent = message || "Settings saved";
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

/* ── Detail pane ── */

const updateDetail = (card) => {
  if (!card) return;
  activeCard = card;
  list.querySelectorAll(".card").forEach((item) => item.classList.remove("is-active"));
  card.classList.add("is-active");
  detailTitle.textContent = card.querySelector("h3").textContent;
  detailBody.textContent = card.dataset.body || "";
  replyInput.value = card.dataset.reply || "";
  detailSender.innerHTML = `<span class="material-symbols-outlined">person</span> ${card.dataset.sender || "Anonymous"} &middot; ${card.dataset.time || ""}`;

  const isPublished = card.dataset.status === "published";
  publicToggle.checked = isPublished;
  publishBtn.textContent = isPublished ? "Unpublish" : "Publish";

  labelSelect.value = card.dataset.label || "";
};

/* ── Rule state ── */

const updateRuleState = () => {
  if (contactRule.checked) {
    anonymousRule.checked = false;
    previewRule.textContent = "Contact required";
    return;
  }
  if (anonymousRule.checked) {
    contactRule.checked = false;
    previewRule.textContent = "Anonymous allowed";
    return;
  }
  previewRule.textContent = "Contact optional";
};

/* ── Preview sync ── */

const updatePreview = () => {
  previewName.textContent = profileName.value || "Unnamed";
  const handle = profileHandle.value.trim() || "username";
  previewHandle.textContent = `@${handle}`;
  previewLink.textContent = handle;
  previewPrompt.textContent = profilePrompt.value || "";
  previewAvatar.src = profileImage.value || "asset/profile1.png";
  previewStatus.textContent = pauseLink.checked ? "Temporarily closed" : "Accepting messages";
  document.documentElement.style.setProperty("--accent", accentColor.value || "#1c1f24");
  document.documentElement.style.setProperty("--bg", bgColor.value || "#f7f7f8");
  previewCard.style.borderRadius = `${radiusRange.value}px`;

  // Update share link
  shareLinkInput.value = `wemint.link/${handle}`;
};

/* ── Stats ── */

const updateStats = () => {
  const cards = list.querySelectorAll(".card");
  let total = 0;
  let unread = 0;
  let published = 0;
  let replied = 0;
  let flagged = 0;

  cards.forEach((card) => {
    if (card.style.display === "none" && card.dataset.archived === "true") return;
    total++;
    const status = card.dataset.status;
    if (status === "unread") unread++;
    if (status === "published") published++;
    if (status === "flagged") flagged++;
    if (card.dataset.reply) replied++;
  });

  const rate = total > 0 ? Math.round((replied / total) * 100) : 0;

  statTotal.textContent = total;
  statUnread.textContent = unread;
  statPublished.textContent = published;
  statRate.textContent = `${rate}%`;

  countUnread.textContent = unread;
  countFlagged.textContent = flagged;
  countPublished.textContent = published;
  countAll.textContent = total;
};

/* ── Empty state check ── */

const checkEmpty = () => {
  const visibleCards = list.querySelectorAll(".card:not([style*='display: none'])");
  listEmpty.style.display = visibleCards.length === 0 ? "block" : "none";
};

/* ── Message list click ── */

list.addEventListener("click", (event) => {
  if (event.target.closest(".card__check")) return;
  const card = event.target.closest(".card");
  if (!card) return;
  updateDetail(card);
});

/* ── Filter buttons ── */

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("is-active"));
    button.classList.add("is-active");
    const filter = button.dataset.filter;
    list.querySelectorAll(".card").forEach((card) => {
      if (filter === "all") {
        card.style.display = "grid";
      } else {
        card.style.display = card.dataset.status === filter ? "grid" : "none";
      }
    });
    checkEmpty();
  });
});

/* ── Publish toggle ── */

publishBtn.addEventListener("click", () => {
  if (!activeCard) return;
  const willPublish = activeCard.dataset.status !== "published";
  activeCard.dataset.status = willPublish ? "published" : "read";
  const badge = activeCard.querySelector(".badge");
  badge.textContent = willPublish ? "Published" : "Read";
  badge.classList.toggle("badge--dark", willPublish);
  badge.classList.remove("badge--warn");
  if (!willPublish) badge.classList.add("badge--light");
  publicToggle.checked = willPublish;
  publishBtn.textContent = willPublish ? "Unpublish" : "Publish";
  updateStats();
  showToast(willPublish ? "Published to public page" : "Unpublished");
});

publicToggle.addEventListener("change", () => {
  if (!activeCard) return;
  if (publicToggle.checked) {
    activeCard.dataset.status = "published";
    const badge = activeCard.querySelector(".badge");
    badge.textContent = "Published";
    badge.classList.add("badge--dark");
    badge.classList.remove("badge--warn", "badge--light");
    publishBtn.textContent = "Unpublish";
  } else if (activeCard.dataset.status === "published") {
    activeCard.dataset.status = "read";
    const badge = activeCard.querySelector(".badge");
    badge.textContent = "Read";
    badge.classList.remove("badge--dark");
    badge.classList.add("badge--light");
    publishBtn.textContent = "Publish";
  }
  updateStats();
});

/* ── Reply ── */

replyBtn.addEventListener("click", () => {
  if (!activeCard) return;
  activeCard.dataset.reply = replyInput.value.trim();
  if (activeCard.dataset.status === "unread") {
    activeCard.dataset.status = "read";
    const badge = activeCard.querySelector(".badge");
    badge.textContent = "Read";
    badge.classList.remove("badge--warn");
    badge.classList.add("badge--light");
  }
  updateStats();
  showToast("Reply saved");
});

/* ── Archive ── */

archiveBtn.addEventListener("click", () => {
  if (!activeCard) return;
  activeCard.style.display = "none";
  activeCard.dataset.archived = "true";
  const nextCard = list.querySelector(".card:not([style*='display: none'])");
  if (nextCard) updateDetail(nextCard);
  updateStats();
  checkEmpty();
  showToast("Message archived");
});

/* ── Pin ── */

pinBtn.addEventListener("click", () => {
  if (!activeCard) return;
  showToast("Pinned to public page");
});

/* ── Search ── */

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  list.querySelectorAll(".card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? "grid" : "none";
  });
  checkEmpty();
});

/* ── Label selector ── */

labelSelect.addEventListener("change", () => {
  if (!activeCard) return;
  activeCard.dataset.label = labelSelect.value;
  const chipEl = activeCard.querySelector(".label-chip");
  if (chipEl) {
    if (labelSelect.value) {
      chipEl.textContent = labelSelect.options[labelSelect.selectedIndex].text;
      chipEl.className = `label-chip label-chip--${labelSelect.value}`;
      chipEl.style.display = "inline";
    } else {
      chipEl.style.display = "none";
    }
  }
});

/* ── Quick replies ── */

document.querySelectorAll(".quick-replies .chip--clickable").forEach((chip) => {
  chip.addEventListener("click", () => {
    replyInput.value = chip.textContent;
    replyInput.focus();
  });
});

/* ── Sidebar input listeners ── */

[pauseLink, profileName, profileHandle, profilePrompt, profileImage, accentColor, bgColor, radiusRange].forEach(
  (input) => input.addEventListener("input", updatePreview)
);

accentPicker.addEventListener("input", (event) => {
  accentColor.value = event.target.value;
  updatePreview();
});

bgPicker.addEventListener("input", (event) => {
  bgColor.value = event.target.value;
  updatePreview();
});

accentColor.addEventListener("input", () => {
  accentPicker.value = accentColor.value;
});

bgColor.addEventListener("input", () => {
  bgPicker.value = bgColor.value;
});

anonymousRule.addEventListener("change", updateRuleState);
contactRule.addEventListener("change", updateRuleState);

/* ── Auto-reply toggle ── */

autoReplyToggle.addEventListener("change", () => {
  autoReplyField.style.display = autoReplyToggle.checked ? "grid" : "none";
});

/* ── Pause link → localStorage sync ── */

pauseLink.addEventListener("change", () => {
  localStorage.setItem("wemint_paused", pauseLink.checked ? "true" : "false");
  updatePreview();
});

/* ── Dark mode ── */

darkModeBtn.addEventListener("click", () => {
  const app = document.querySelector(".app");
  const isDark = app.dataset.theme === "dark";
  app.dataset.theme = isDark ? "light" : "dark";
  darkModeBtn.querySelector(".material-symbols-outlined").textContent =
    isDark ? "dark_mode" : "light_mode";
  localStorage.setItem("wemint_theme", app.dataset.theme);
});

const loadTheme = () => {
  const savedTheme = localStorage.getItem("wemint_theme");
  if (savedTheme) {
    document.querySelector(".app").dataset.theme = savedTheme;
    if (savedTheme === "dark") {
      darkModeBtn.querySelector(".material-symbols-outlined").textContent = "light_mode";
    }
  }
};

/* ── Sidebar collapse ── */

collapseBtn.addEventListener("click", () => {
  sidebar.classList.toggle("is-collapsed");
  const icon = collapseBtn.querySelector(".material-symbols-outlined");
  icon.textContent = sidebar.classList.contains("is-collapsed") ? "chevron_right" : "chevron_left";
});

/* ── Copy share link ── */

copyShareLink.addEventListener("click", () => {
  navigator.clipboard.writeText(shareLinkInput.value).then(() => {
    showToast("Link copied!");
  });
});

/* ── QR code ── */

const generateQR = () => {
  const qrContainer = document.getElementById("shareQr");
  if (typeof qrcode !== "undefined") {
    const qr = qrcode(0, "M");
    qr.addData(`https://${shareLinkInput.value}`);
    qr.make();
    qrContainer.innerHTML = qr.createSvgTag({ cellSize: 2, margin: 2 });
  }
};

/* ── Hidden word chips ── */

wordChips.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".chip--removable button");
  if (removeBtn) removeBtn.closest(".chip").remove();
});

hiddenWords.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const word = hiddenWords.value.trim();
    if (!word) return;
    const chip = document.createElement("span");
    chip.className = "chip chip--removable";
    chip.innerHTML = `${word} <button type="button">&times;</button>`;
    wordChips.appendChild(chip);
    hiddenWords.value = "";
  }
});

/* ── Bulk actions ── */

const updateBulkBar = () => {
  const checked = [...list.querySelectorAll(".msg-check:checked")];
  bulkBar.style.display = checked.length > 0 ? "flex" : "none";
  bulkCount.textContent = `${checked.length} selected`;
};

list.addEventListener("change", (event) => {
  if (!event.target.matches(".msg-check")) return;
  updateBulkBar();
});

selectAll.addEventListener("change", () => {
  list.querySelectorAll(".msg-check").forEach((cb) => {
    cb.checked = selectAll.checked;
  });
  updateBulkBar();
});

bulkArchive.addEventListener("click", () => {
  list.querySelectorAll(".msg-check:checked").forEach((cb) => {
    const card = cb.closest(".card");
    card.style.display = "none";
    card.dataset.archived = "true";
    cb.checked = false;
  });
  bulkBar.style.display = "none";
  selectAll.checked = false;
  updateStats();
  checkEmpty();
  showToast("Selected messages archived");
});

bulkPublish.addEventListener("click", () => {
  list.querySelectorAll(".msg-check:checked").forEach((cb) => {
    const card = cb.closest(".card");
    card.dataset.status = "published";
    const badge = card.querySelector(".badge");
    badge.textContent = "Published";
    badge.classList.add("badge--dark");
    badge.classList.remove("badge--warn", "badge--light");
    cb.checked = false;
  });
  bulkBar.style.display = "none";
  selectAll.checked = false;
  updateStats();
  showToast("Selected messages published");
});

/* ── Keyboard shortcuts ── */

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select")) return;

  const cards = [...list.querySelectorAll(".card:not([style*='display: none'])")];
  const currentIndex = cards.indexOf(activeCard);

  switch (event.key.toLowerCase()) {
    case "j":
      if (currentIndex < cards.length - 1) updateDetail(cards[currentIndex + 1]);
      break;
    case "k":
      if (currentIndex > 0) updateDetail(cards[currentIndex - 1]);
      break;
    case "r":
      event.preventDefault();
      replyInput.focus();
      break;
    case "p":
      publishBtn.click();
      break;
    case "a":
      archiveBtn.click();
      break;
  }
});

/* ── Init ── */

loadTheme();
updateDetail(activeCard);
updateRuleState();
updatePreview();
updateStats();
generateQR();
checkEmpty();
