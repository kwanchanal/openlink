const profileName = document.getElementById("profileName");
const profileHandle = document.getElementById("profileHandle");
const profilePrompt = document.getElementById("profilePrompt");
const profileImage = document.getElementById("profileImage");
const anonymousRule = document.getElementById("anonymousRule");
const contactRule = document.getElementById("contactRule");
const accentColor = document.getElementById("accentColor");
const accentPicker = document.getElementById("accentPicker");
const radiusRange = document.getElementById("radiusRange");
const saveBtn = document.getElementById("saveBtn");
const toast = document.getElementById("toast");

const previewName = document.getElementById("previewName");
const previewHandle = document.getElementById("previewHandle");
const previewPrompt = document.getElementById("previewPrompt");
const previewAvatar = document.getElementById("previewAvatar");
const previewRule = document.getElementById("previewRule");
const previewCard = document.getElementById("previewCard");

const filterButtons = document.querySelectorAll(".filters .ghost-btn");
const inboxList = document.getElementById("inboxList");

const updatePreview = () => {
  previewName.textContent = profileName.value || "Unnamed";
  const handle = profileHandle.value.trim() || "username";
  previewHandle.textContent = `@${handle}`;
  previewPrompt.textContent = profilePrompt.value || "";
  previewAvatar.src = profileImage.value || "asset/profile1.png";
  document.documentElement.style.setProperty("--accent", accentColor.value || "#1b1e24");
  previewCard.style.borderRadius = `${radiusRange.value}px`;
};

const updateRules = () => {
  if (contactRule.checked) {
    anonymousRule.checked = false;
    previewRule.textContent = "Contact required";
  } else if (anonymousRule.checked) {
    previewRule.textContent = "Anonymous allowed";
  } else {
    previewRule.textContent = "Contact optional";
  }
};

const showToast = () => {
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

[profileName, profileHandle, profilePrompt, profileImage, accentColor, radiusRange].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

accentPicker.addEventListener("input", (event) => {
  accentColor.value = event.target.value;
  updatePreview();
});

accentColor.addEventListener("input", () => {
  accentPicker.value = accentColor.value;
});

anonymousRule.addEventListener("change", updateRules);
contactRule.addEventListener("change", updateRules);

saveBtn.addEventListener("click", () => {
  updatePreview();
  updateRules();
  showToast();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("is-active"));
    button.classList.add("is-active");
    const filter = button.dataset.filter;
    Array.from(inboxList.children).forEach((item) => {
      if (filter === "all") {
        item.style.display = "grid";
      } else {
        item.style.display = item.dataset.status === filter ? "grid" : "none";
      }
    });
  });
});

inboxList.addEventListener("click", (event) => {
  const actionBtn = event.target.closest("[data-action]");
  if (!actionBtn) return;
  const action = actionBtn.dataset.action;
  const item = actionBtn.closest(".inbox-item");
  if (!item) return;

  if (action === "publish") {
    item.dataset.status = "published";
    item.querySelector(".badge").textContent = "Published";
    item.querySelector(".badge").classList.add("badge--dark");
    actionBtn.textContent = "Unpublish";
    actionBtn.dataset.action = "unpublish";
  } else if (action === "unpublish") {
    item.dataset.status = "read";
    item.querySelector(".badge").textContent = "Read";
    item.querySelector(".badge").classList.remove("badge--dark");
    actionBtn.textContent = "Publish";
    actionBtn.dataset.action = "publish";
  } else if (action === "archive") {
    item.style.opacity = "0.4";
  } else if (action === "reply") {
    item.querySelector(".inbox-item__reply")?.remove();
    const reply = document.createElement("p");
    reply.className = "inbox-item__reply";
    reply.textContent = "Draft reply: Thanks for asking! I'll answer soon.";
    item.insertBefore(reply, item.querySelector(".inbox-item__actions"));
  }
});

updatePreview();
updateRules();
