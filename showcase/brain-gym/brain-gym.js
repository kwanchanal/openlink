const langToggle = document.getElementById("brainGymLangToggle");
const langButtons = Array.from(document.querySelectorAll(".brain-gym-lang-btn"));

function getTranslator() {
  return window.brainGymI18n || {
    getLanguage: () => "th",
    setLanguage: () => {},
    t: (key) => key,
    onChange: () => {}
  };
}

function renderLanguageToggle() {
  const i18n = getTranslator();
  const currentLanguage = i18n.getLanguage();

  langButtons.forEach((button) => {
    const isActive = button.dataset.lang === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  langToggle?.setAttribute("aria-label", i18n.t("ui.toggleLabel"));
}

function mountLanguageToggle() {
  const mountPoint = document.getElementById("brainGymLangMount");
  if (!mountPoint || !langToggle) return;
  mountPoint.appendChild(langToggle);
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    getTranslator().setLanguage(button.dataset.lang);
  });
});

getTranslator().onChange(() => {
  renderLanguageToggle();
});

renderLanguageToggle();
mountLanguageToggle();

window.mountBrainGymLanguageToggle = mountLanguageToggle;

if (typeof initQuiz === "function") {
  initQuiz();
}
