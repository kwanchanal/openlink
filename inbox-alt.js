const list = document.getElementById("messageList");
const detailTitle = document.getElementById("detailTitle");
const detailBody = document.getElementById("detailBody");
const replyInput = document.getElementById("replyInput");
const filterButtons = document.querySelectorAll(".segmented__btn");
const publishBtn = document.getElementById("publishBtn");
const publicToggle = document.getElementById("publicToggle");
const replyBtn = document.getElementById("replyBtn");
const archiveBtn = document.getElementById("archiveBtn");
const searchInput = document.getElementById("searchInput");

const pauseLink = document.getElementById("pauseLink");
const anonymousRule = document.getElementById("anonymousRule");
const contactRule = document.getElementById("contactRule");
const profileName = document.getElementById("profileName");
const profileHandle = document.getElementById("profileHandle");
const profilePrompt = document.getElementById("profilePrompt");
const profileImage = document.getElementById("profileImage");
const accentColor = document.getElementById("accentColor");
const accentPicker = document.getElementById("accentPicker");
const bgColor = document.getElementById("bgColor");
const bgPicker = document.getElementById("bgPicker");
const radiusRange = document.getElementById("radiusRange");

const previewName = document.getElementById("previewName");
const previewHandle = document.getElementById("previewHandle");
const previewPrompt = document.getElementById("previewPrompt");
const previewAvatar = document.getElementById("previewAvatar");
const previewRule = document.getElementById("previewRule");
const previewLink = document.getElementById("previewLink");
const previewStatus = document.getElementById("previewStatus");
const previewCard = document.getElementById("previewCard");

let activeCard = list.querySelector(".card");

const updateDetail = (card) => {
  if (!card) return;
  activeCard = card;
  list.querySelectorAll(".card").forEach((item) => item.classList.remove("is-active"));
  card.classList.add("is-active");
  detailTitle.textContent = card.querySelector("h3").textContent;
  detailBody.textContent = card.dataset.body || "";
  replyInput.value = card.dataset.reply || "";
  const isPublished = card.dataset.status === "published";
  publicToggle.checked = isPublished;
  publishBtn.textContent = isPublished ? "Unpublish" : "Publish";
};

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
};

list.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;
  updateDetail(card);
});

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
  });
});

publishBtn.addEventListener("click", () => {
  if (!activeCard) return;
  const willPublish = activeCard.dataset.status !== "published";
  activeCard.dataset.status = willPublish ? "published" : "read";
  const badge = activeCard.querySelector(".badge");
  badge.textContent = willPublish ? "Published" : "Read";
  badge.classList.toggle("badge--dark", willPublish);
  badge.classList.remove("badge--warn");
  publicToggle.checked = willPublish;
  publishBtn.textContent = willPublish ? "Unpublish" : "Publish";
});

publicToggle.addEventListener("change", () => {
  if (!activeCard) return;
  if (publicToggle.checked) {
    activeCard.dataset.status = "published";
    const badge = activeCard.querySelector(".badge");
    badge.textContent = "Published";
    badge.classList.add("badge--dark");
    badge.classList.remove("badge--warn");
    publishBtn.textContent = "Unpublish";
  } else if (activeCard.dataset.status === "published") {
    activeCard.dataset.status = "read";
    const badge = activeCard.querySelector(".badge");
    badge.textContent = "Read";
    badge.classList.remove("badge--dark");
    publishBtn.textContent = "Publish";
  }
});

replyBtn.addEventListener("click", () => {
  if (!activeCard) return;
  activeCard.dataset.reply = replyInput.value.trim();
  if (activeCard.dataset.status === "unread") {
    activeCard.dataset.status = "read";
    const badge = activeCard.querySelector(".badge");
    badge.textContent = "Read";
    badge.classList.remove("badge--warn");
  }
});

archiveBtn.addEventListener("click", () => {
  if (!activeCard) return;
  const nextCard = activeCard.nextElementSibling || list.querySelector(".card");
  activeCard.style.display = "none";
  if (nextCard && nextCard.style.display !== "none") {
    updateDetail(nextCard);
  }
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  list.querySelectorAll(".card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? "grid" : "none";
  });
});

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

updateDetail(activeCard);
updateRuleState();
updatePreview();
