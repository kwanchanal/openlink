const langToggle = document.getElementById("openmindLangToggle");
const langButtons = Array.from(document.querySelectorAll(".openmind-lang-btn"));
const homeBtn = document.getElementById("openmindHomeBtn");
const content = document.getElementById("openmindContent");
let hasStartedQuiz = false;

function getTranslator() {
  return window.openmindI18n || {
    getLanguage: () => "en",
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

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    getTranslator().setLanguage(button.dataset.lang);
  });
});

homeBtn?.addEventListener("click", () => {
  hasStartedQuiz = false;
  renderLanding();
  window.scrollTo({ top: 0, behavior: "auto" });
});

getTranslator().onChange(() => {
  renderLanguageToggle();
});

renderLanguageToggle();

function startQuiz() {
  hasStartedQuiz = true;
  document.body.classList.remove("openmind-is-landing");

  if (typeof initQuiz === "function") {
    initQuiz();
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderLanding() {
  if (!content) return;

  document.body.classList.add("openmind-is-landing");
  content.innerHTML = `
    <section class="openmind-landing" aria-label="mintyourmind landing">
      <div class="openmind-landing-copy">
        <p class="openmind-landing-kicker">80% get this wrong</p>
        <h1>Are you in the 20%?</h1>
      </div>

      <div class="home-prediction" aria-label="Micro prediction puzzle">
        <div class="home-picture-grid" role="img" aria-label="Three tiles form a pattern. Choose the missing fourth tile.">
          <div class="home-picture-cell">
            <span class="home-tile tile-left tile-dot-top"></span>
          </div>
          <div class="home-picture-cell">
            <span class="home-tile tile-right tile-dot-top"></span>
          </div>
          <div class="home-picture-cell">
            <span class="home-tile tile-left tile-dot-bottom"></span>
          </div>
          <div class="home-picture-cell is-missing">
            <span>?</span>
          </div>
        </div>

        <div class="home-answer-options" aria-label="Answer choices">
          <button type="button" class="home-answer-option" data-home-answer="a">
            <span class="home-tile tile-left tile-dot-bottom"></span>
          </button>
          <button type="button" class="home-answer-option" data-home-answer="b">
            <span class="home-tile tile-right tile-dot-bottom"></span>
          </button>
          <button type="button" class="home-answer-option" data-home-answer="c">
            <span class="home-tile tile-right tile-dot-top"></span>
          </button>
        </div>

        <div class="home-answer-feedback" id="homeAnswerFeedback" hidden></div>
      </div>

      <button type="button" class="openmind-go-btn" id="openmindGoBtn">GO</button>
      <p class="openmind-go-copy">Your mind deserves training too.</p>
    </section>
  `;

  document.getElementById("openmindGoBtn")?.addEventListener("click", startQuiz);
  document.querySelectorAll("[data-home-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const isCorrect = button.dataset.homeAnswer === "b";
      document.querySelectorAll("[data-home-answer]").forEach((option) => {
        option.classList.toggle("is-correct", option.dataset.homeAnswer === "b");
        option.classList.toggle("is-wrong", option === button && !isCorrect);
        option.disabled = true;
      });

      const feedback = document.getElementById("homeAnswerFeedback");
      if (!feedback) return;
      feedback.hidden = false;
      feedback.innerHTML = `
        <strong>${isCorrect ? "Correct." : "Not quite."}</strong>
        <span>The dot moves from top to bottom by row. The bar moves from left to right by column. The missing tile needs the bottom dot and the right bar.</span>
      `;
    });
  });
}

if (hasStartedQuiz && typeof initQuiz === "function") {
  initQuiz();
} else {
  renderLanding();
}
