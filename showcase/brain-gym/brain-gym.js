const PASSWORD = "67896789";
const STORAGE_KEY = "brain-gym-unlocked";

const gate = document.getElementById("brainGymGate");
const content = document.getElementById("brainGymContent");
const form = document.getElementById("brainGymForm");
const codeGrid = document.getElementById("brainGymCodeGrid");
const inputs = Array.from(document.querySelectorAll(".brain-gym-digit"));
const error = document.getElementById("brainGymError");

function revealContent() {
  gate.hidden = true;
  content.hidden = false;
  sessionStorage.setItem(STORAGE_KEY, "true");
}

function showError() {
  error.hidden = false;
  codeGrid.classList.add("has-error");
  inputs.forEach((input) => input.setAttribute("aria-invalid", "true"));
  inputs[0].focus();
  inputs[0].select();
}

function clearError() {
  error.hidden = true;
  codeGrid.classList.remove("has-error");
  inputs.forEach((input) => input.removeAttribute("aria-invalid"));
}

function getPasswordValue() {
  return inputs.map((input) => input.value).join("");
}

function fillInputs(value) {
  const digits = value.replace(/\D/g, "").slice(0, inputs.length).split("");
  inputs.forEach((input, index) => {
    input.value = digits[index] ?? "";
  });
}

if (sessionStorage.getItem(STORAGE_KEY) === "true") {
  revealContent();
} else {
  inputs[0].focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = getPasswordValue().trim();

  if (value === PASSWORD) {
    clearError();
    revealContent();
    return;
  }

  showError();
});

inputs.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    const digit = event.target.value.replace(/\D/g, "").slice(-1);
    event.target.value = digit;

    if (!error.hidden) {
      clearError();
    }

    if (digit && index < inputs.length - 1) {
      inputs[index + 1].focus();
      inputs[index + 1].select();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
      inputs[index - 1].value = "";
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs[index - 1].focus();
    }

    if (event.key === "ArrowRight" && index < inputs.length - 1) {
      event.preventDefault();
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("focus", () => {
    input.select();
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    fillInputs(event.clipboardData.getData("text"));
    const nextIndex = inputs.findIndex((field) => !field.value);
    const focusIndex = nextIndex === -1 ? inputs.length - 1 : nextIndex;
    inputs[focusIndex].focus();
    inputs[focusIndex].select();

    if (!error.hidden) {
      clearError();
    }
  });
});
