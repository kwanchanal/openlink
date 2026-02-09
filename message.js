const messageInput = document.getElementById("messageInput");
const charCount = document.getElementById("charCount");
const messageForm = document.getElementById("messageForm");
const anonymousToggle = document.getElementById("anonymousToggle");
const contactField = document.getElementById("contactField");
const contactInput = document.getElementById("contactInput");
const clearBtn = document.getElementById("clearBtn");
const toast = document.getElementById("toast");
const qaList = document.getElementById("qaList");
const sortBtn = document.getElementById("sortBtn");

const updateCount = () => {
  const count = messageInput.value.length;
  charCount.textContent = `${count}/280`;
};

const updateContact = () => {
  if (anonymousToggle.checked) {
    contactField.style.display = "grid";
    contactField.querySelector("span").textContent = "Contact email (optional)";
    contactInput.required = false;
  } else {
    contactField.style.display = "grid";
    contactField.querySelector("span").textContent = "Contact email (required)";
    contactInput.required = true;
  }
};

const showToast = () => {
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

messageInput.addEventListener("input", updateCount);

anonymousToggle.addEventListener("change", updateContact);

clearBtn.addEventListener("click", () => {
  messageInput.value = "";
  contactInput.value = "";
  updateCount();
});

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
  showToast();
  messageInput.value = "";
  contactInput.value = "";
  updateCount();
});

let newestFirst = true;

sortBtn.addEventListener("click", () => {
  newestFirst = !newestFirst;
  sortBtn.textContent = `Sort: ${newestFirst ? "newest" : "oldest"}`;
  const items = Array.from(qaList.children);
  if (!newestFirst) {
    items.reverse();
  }
  qaList.innerHTML = "";
  items.forEach((item) => qaList.appendChild(item));
});

updateCount();
updateContact();
