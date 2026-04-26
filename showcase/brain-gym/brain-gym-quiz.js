const BRAIN_GYM_LANGUAGE_KEY = "brain-gym-language";
const BRAIN_GYM_DICTIONARY = {
  th: {
    ui: {
      toggleLabel: "สลับภาษา"
    },
    quiz: {
      sectionPicker: "เลือกบท",
      questionPicker: "เลือกข้อ",
      answerChoices: "ตัวเลือกคำตอบ",
      questionNumber: "ข้อ {num}",
      questionDone: "ข้อ {num} ทำแล้ว",
      difficulty: "ระดับความยาก {value}/5 ดาว",
      revealOpened: "เปิดแล้ว",
      revealCheck: "ตรวจคำตอบ",
      revealOpen: "เปิดโจทย์",
      previous: "← ก่อนหน้า",
      next: "ข้อถัดไป →",
      finishSection: "🎉 จบ{section}",
      feedbackCorrect: "ตอบถูกแล้ว",
      feedbackWrong: "ยังไม่ถูก",
      feedbackCorrectCopy: "คุณจับ logic ของโจทย์ข้อนี้ได้ถูกทางแล้ว",
      feedbackWrongCopy: "ลองเทียบตัวเลือกที่เลือกกับ constraint ในโจทย์ แล้วดูเฉลยด้านล่างต่อ",
      yourAnswer: "คุณตอบ",
      correctAnswer: "คำตอบที่ถูก",
      answerLabel: "✅ เฉลย",
      explanationLabel: "🧠 วิธีคิด",
      completionTitle: "จบ{section}แล้ว!",
      completionAllTitle: "ครบทุกบทแล้ว!",
      completionCopy: "คุณผ่าน {section} ครบ {count} ข้อแล้ว",
      completionAllCopy: "คุณผ่านครบทุกข้อแล้ว {count} ข้อแล้ว",
      completionNext: "ไปต่อบทถัดไปได้เลย",
      completionDone: "สมองได้รับการฝึกฝนครบชุดแล้ว 🎯",
      completionReplayLabel: "กลับไปเล่นข้อไหนก็ได้",
      nextSection: "ไป{section} →",
      restart: "เล่นใหม่อีกครั้ง",
      replayQuestion: "กลับไปเล่นข้อ {num}"
    }
  },
  en: {
    ui: {
      toggleLabel: "Switch language"
    },
    quiz: {
      sectionPicker: "Choose chapter",
      questionPicker: "Choose question",
      answerChoices: "Answer choices",
      questionNumber: "Question {num}",
      questionDone: "Question {num} completed",
      difficulty: "Difficulty {value}/5 stars",
      revealOpened: "Opened",
      revealCheck: "Check answer",
      revealOpen: "Open prompt",
      previous: "← Previous",
      next: "Next question →",
      finishSection: "🎉 Finish {section}",
      feedbackCorrect: "Correct",
      feedbackWrong: "Not quite",
      feedbackCorrectCopy: "You followed the logic in the right direction.",
      feedbackWrongCopy: "Compare your choice with the puzzle constraints, then review the solution below.",
      yourAnswer: "Your answer",
      correctAnswer: "Correct answer",
      answerLabel: "✅ Answer",
      explanationLabel: "🧠 Reasoning",
      completionTitle: "You finished {section}!",
      completionAllTitle: "All chapters completed!",
      completionCopy: "You completed all {count} questions in {section}.",
      completionAllCopy: "You completed all {count} questions in the full set.",
      completionNext: "Continue to the next chapter",
      completionDone: "Your brain workout is complete 🎯",
      completionReplayLabel: "Jump back to any question",
      nextSection: "Go to {section} →",
      restart: "Play again",
      replayQuestion: "Replay question {num}"
    }
  }
};

const brainGymLanguageListeners = new Set();

function getBrainGymLanguage() {
  const saved = localStorage.getItem(BRAIN_GYM_LANGUAGE_KEY);
  return saved === "en" ? "en" : "th";
}

function applyBrainGymLanguage(lang) {
  document.documentElement.lang = lang === "en" ? "en" : "th";
  document.documentElement.setAttribute("data-brain-gym-lang", lang);
}

function brainGymTranslate(path, vars = {}) {
  const lang = getBrainGymLanguage();
  const source = BRAIN_GYM_DICTIONARY[lang] || BRAIN_GYM_DICTIONARY.th;
  const template = path.split(".").reduce((current, key) => current?.[key], source) || path;
  return String(template).replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

function setBrainGymLanguage(lang) {
  const nextLang = lang === "en" ? "en" : "th";
  localStorage.setItem(BRAIN_GYM_LANGUAGE_KEY, nextLang);
  applyBrainGymLanguage(nextLang);
  brainGymLanguageListeners.forEach((listener) => listener(nextLang));
}

function onBrainGymLanguageChange(listener) {
  brainGymLanguageListeners.add(listener);
  return () => brainGymLanguageListeners.delete(listener);
}

function localizeValue(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    ("th" in value || "en" in value)
  ) {
    const lang = getBrainGymLanguage();
    return value[lang] ?? value.th ?? value.en ?? "";
  }

  return value;
}

applyBrainGymLanguage(getBrainGymLanguage());

window.brainGymI18n = {
  getLanguage: getBrainGymLanguage,
  setLanguage: setBrainGymLanguage,
  t: brainGymTranslate,
  onChange: onBrainGymLanguageChange,
  localizeValue
};

function createPreviewQuestion(id, title, difficulty, prompt) {
  return {
    id,
    title,
    difficulty,
    question: `${prompt}

<p><strong>ตอนนี้โจทย์ข้อนี้ถูกดึงเข้ามาแล้ว</strong> และจะค่อย ๆ ถูกแปลงเป็น interactive multiple choice พร้อมเฉลยละเอียดในสเต็ปถัดไป</p>`,
    answer: "โจทย์นี้ถูกนำเข้ามาในบทแล้ว และพร้อมสำหรับการแตกต่อเป็น interactive quiz",
    explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>คุณสามารถใช้หน้า chapter switcher และเลขข้อด้านบนเพื่อข้ามไปเก็บโจทย์ข้อนี้ไว้ก่อนได้</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>รอบถัดไปผมแปลงข้อนี้ให้เป็น multiple choice พร้อม diagram และเฉลยเชิงลึกแบบเดียวกับบท 1-2 ได้ต่อ</div>
</div>`
  };
}

const QUIZ_SECTIONS = [
  {
    id: "ทดลอง",
    label: {
      th: "บททดลอง",
      en: "Warm-Up"
    },
    title: {
      th: "บททดลอง: อุ่นเครื่องสมอง",
      en: "Warm-Up: Prime Your Brain"
    },
    description: {
      th: "ลอง 3 ข้อสั้น ๆ ก่อนเข้า chapter หลัก เพื่อจับจังหวะการคิดของเกมนี้",
      en: "Start with 3 short puzzles before the main chapters to get used to the game's logic flow."
    },
    questions: [
      {
        id: 64,
        title: {
          th: "สมุดกับสติกเกอร์",
          en: "Notebook and Sticker"
        },
        difficulty: 1,
        question: {
          th: `มีของอยู่ 2 ชิ้น: <strong>สมุดโน้ต</strong> กับ <strong>สติกเกอร์</strong>

ของสองชิ้นนี้รวมกันราคา <strong>110 เยน</strong>
และสมุดแพงกว่าสติกเกอร์อยู่ <strong>100 เยน</strong>

สติกเกอร์ราคาเท่าไร?`,
          en: `There are 2 items: a <strong>notebook</strong> and a <strong>sticker</strong>.

Together they cost <strong>110 yen</strong>, and the notebook costs <strong>100 yen more</strong> than the sticker.

How much does the sticker cost?`
        },
        answer: {
          th: "5 เยน",
          en: "5 yen"
        },
        explanation: {
          th: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าสติกเกอร์ราคา x เยน สมุดจะราคา <strong>x + 100</strong> เยน</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>จึงได้สมการ <strong>x + (x + 100) = 110</strong> → 2x = 10 → <strong>x = 5</strong></div>
</div>`,
          en: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>If the sticker costs x yen, the notebook costs <strong>x + 100</strong> yen.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>So the equation is <strong>x + (x + 100) = 110</strong> → 2x = 10 → <strong>x = 5</strong>.</div>
</div>`
        }
      },
      {
        id: 65,
        title: {
          th: "ครัวอบขนม 4 คน 4 วัน",
          en: "4 Bakers in 4 Days"
        },
        difficulty: 1,
        question: {
          th: `ถ้าคนทำขนม <strong>4 คน</strong> ใช้เวลา <strong>4 วัน</strong> อบคุกกี้ชุดใหญ่ได้ <strong>4 ถาด</strong>

ถ้าต้องการให้อบได้ <strong>100 ถาดใน 100 วัน</strong>
อย่างน้อยที่สุดต้องใช้คนทำขนมกี่คน?`,
          en: `If <strong>4 bakers</strong> need <strong>4 days</strong> to bake <strong>4 trays</strong> of cookies,

how many bakers are needed at minimum to bake <strong>100 trays in 100 days</strong>?`
        },
        answer: {
          th: "4 คน",
          en: "4 people"
        },
        explanation: {
          th: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>จากข้อมูลเดิม เท่ากับว่า <strong>4 คนอบได้วันละ 1 ถาด</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ถ้าอบวันละ 1 ถาดต่อเนื่อง 100 วัน ก็จะได้ <strong>100 ถาดพอดี</strong> ดังนั้นยังใช้ <strong>4 คน</strong> เท่าเดิม</div>
</div>`,
          en: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>From the original rate, <strong>4 people bake 1 tray per day</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>If they keep baking 1 tray a day for 100 days, they will produce <strong>100 trays exactly</strong>. So you still need <strong>4 people</strong>.</div>
</div>`
        }
      },
      {
        id: 66,
        title: {
          th: "ขวดน้ำเต็มชั้นเมื่อไร",
          en: "When Does the Shelf Fill?"
        },
        difficulty: 1,
        question: {
          th: `เริ่มต้นมีขวดน้ำอยู่บนชั้น <strong>1 ขวด</strong>

หลังจากนั้นจำนวนขวด <strong>เพิ่มเป็น 2 เท่าทุก 1 นาที</strong>
และเมื่อครบ <strong>12 นาที</strong> ชั้นวางก็เต็มพอดี

แล้วตอนที่มีขวดอยู่ <strong>ครึ่งหนึ่งของความจุ</strong> คือกี่นาทีหลังเริ่ม?`,
          en: `A shelf starts with <strong>1 water bottle</strong>.

The number of bottles <strong>doubles every minute</strong>, and at exactly <strong>12 minutes</strong> the shelf is full.

At what minute is the shelf <strong>half full</strong>?`
        },
        answer: {
          th: "11 นาที",
          en: "11 minutes"
        },
        explanation: {
          th: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>เมื่อครบ 12 นาที ชั้นวางเต็ม</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เพราะจำนวนขวด <strong>เพิ่มเป็น 2 เท่าในทุกนาที</strong> หนึ่งนาทีก่อนเต็มจึงต้องมีอยู่ครึ่งหนึ่งพอดี ดังนั้นคำตอบคือ <strong>11 นาที</strong></div>
</div>`,
          en: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>At 12 minutes, the shelf is full.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Because the number of bottles <strong>doubles every minute</strong>, one minute before full it must be exactly half full. So the answer is <strong>11 minutes</strong>.</div>
</div>`
        }
      }
    ]
  },
  {
    id: 1,
    label: {
      th: "บทที่ 1",
      en: "Chapter 1"
    },
    title: {
      th: "บทที่ 1: การคิดเชิงตรรกะ",
      en: "Chapter 1: Logical Reasoning"
    },
    description: {
      th: "การคิดเชิงตรรกะ ทดสอบการคิดเชิงตรรกะ การรวมข้อมูลข้อเท็จจริงที่มีเพื่อหาความจริง",
      en: "Train logical reasoning by combining the facts you know to uncover what must be true."
    },
    questions: [
      {
        id: 1,
        title: "ชาวบ้าน 3 คน",
        difficulty: 1,
        question: `มีชาวบ้าน 3 คนอยู่ตรงหน้าคุณ คนหนึ่งเป็น<strong>เทวดา</strong> คนหนึ่งเป็น<strong>ปีศาจ</strong> และอีกคนเป็น<strong>มนุษย์</strong>

<ul>
  <li>เทวดาพูดความจริงเสมอ</li>
  <li>ปีศาจพูดเท็จเสมอ</li>
  <li>มนุษย์พูดจริงบ้างเท็จบ้างสลับกัน</li>
</ul>

ชาวบ้านทั้ง 3 คน กล่าวดังนี้:<br>
<strong>A:</strong> "ฉันไม่ใช่เทวดา"<br>
<strong>B:</strong> "ฉันไม่ใช่ปีศาจ"<br>
<strong>C:</strong> "ฉันไม่ใช่มนุษย์"<br><br>
ตัวจริงของชาวบ้านแต่ละคนคือใคร?`,
        diagram: `<svg viewBox="0 0 480 160" class="quiz-diagram">
  <defs>
    <marker id="arr1" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#2487da"/>
    </marker>
  </defs>
  <!-- A -->
  <text x="70" y="74" text-anchor="middle" font-size="18">🧑</text>
  <text x="70" y="96" text-anchor="middle" font-size="13" font-weight="700" fill="#172033">A</text>
  <text x="70" y="111" text-anchor="middle" font-size="10" fill="#607089">"ไม่ใช่เทวดา"</text>
  <!-- B -->
  <text x="240" y="74" text-anchor="middle" font-size="18">🧑</text>
  <text x="240" y="96" text-anchor="middle" font-size="13" font-weight="700" fill="#172033">B</text>
  <text x="240" y="111" text-anchor="middle" font-size="10" fill="#607089">"ไม่ใช่ปีศาจ"</text>
  <!-- C -->
  <text x="410" y="74" text-anchor="middle" font-size="18">🧑</text>
  <text x="410" y="96" text-anchor="middle" font-size="13" font-weight="700" fill="#172033">C</text>
  <text x="410" y="111" text-anchor="middle" font-size="10" fill="#607089">"ไม่ใช่มนุษย์"</text>
  <!-- labels -->
  <text x="70" y="30" text-anchor="middle" font-size="11" fill="#607089">คนใดคนหนึ่ง</text>
  <text x="240" y="30" text-anchor="middle" font-size="11" fill="#607089">คนใดคนหนึ่ง</text>
  <text x="410" y="30" text-anchor="middle" font-size="11" fill="#607089">คนใดคนหนึ่ง</text>
  <text x="70" y="20" text-anchor="middle" font-size="10" fill="#607089">เทวดา/ปีศาจ/มนุษย์</text>
  <text x="240" y="20" text-anchor="middle" font-size="10" fill="#607089">เทวดา/ปีศาจ/มนุษย์</text>
  <text x="410" y="20" text-anchor="middle" font-size="10" fill="#607089">เทวดา/ปีศาจ/มนุษย์</text>
</svg>`,
        answer: "A = มนุษย์ &nbsp; B = ปีศาจ &nbsp; C = เทวดา",
        explanation: `<strong>วิธีคิด: ตรวจสอบทีละคน</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>พิสูจน์ว่า A ไม่ใช่เทวดาหรือปีศาจ</strong><br>
  • ถ้า A = เทวดา → พูดจริงเสมอ แต่ "ฉันไม่ใช่เทวดา" = เท็จ → ขัดแย้ง ✗<br>
  • ถ้า A = ปีศาจ → พูดเท็จเสมอ แต่ "ฉันไม่ใช่เทวดา" = จริง (A ไม่ใช่เทวดา) → ขัดแย้ง ✗<br>
  ∴ <strong>A = มนุษย์</strong> เท่านั้น</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>หา B และ C จาก B กับ C ที่เหลือ (เทวดาหรือปีศาจ)</strong><br>
  ลองสมมติว่า C = เทวดา: พูดจริง → "ฉันไม่ใช่มนุษย์" = จริง ✓ (C เป็นเทวดาจริง ๆ)<br>
  ลองสมมติว่า C = ปีศาจ: พูดเท็จ → "ฉันไม่ใช่มนุษย์" ต้องเป็นเท็จ → C เป็นมนุษย์ → ขัดแย้งกับที่รู้ ✗<br>
  ∴ <strong>C = เทวดา, B = ปีศาจ</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>ตรวจสอบ B:</strong> B = ปีศาจ พูดว่า "ฉันไม่ใช่ปีศาจ" = เท็จ → ปีศาจพูดเท็จ ✓</div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 120" class="quiz-diagram">
  <rect x="20" y="20" width="100" height="80" rx="12" fill="rgba(255,200,50,0.15)" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="70" y="50" text-anchor="middle" font-size="20">🧑</text>
  <text x="70" y="74" text-anchor="middle" font-size="13" font-weight="700" fill="#172033">A</text>
  <text x="70" y="90" text-anchor="middle" font-size="12" fill="#d97706" font-weight="600">มนุษย์</text>

  <rect x="190" y="20" width="100" height="80" rx="12" fill="rgba(207,55,95,0.12)" stroke="#cf375f" stroke-width="1.5"/>
  <text x="240" y="50" text-anchor="middle" font-size="20">😈</text>
  <text x="240" y="74" text-anchor="middle" font-size="13" font-weight="700" fill="#172033">B</text>
  <text x="240" y="90" text-anchor="middle" font-size="12" fill="#cf375f" font-weight="600">ปีศาจ</text>

  <rect x="360" y="20" width="100" height="80" rx="12" fill="rgba(85,181,255,0.15)" stroke="#2487da" stroke-width="1.5"/>
  <text x="410" y="50" text-anchor="middle" font-size="20">😇</text>
  <text x="410" y="74" text-anchor="middle" font-size="13" font-weight="700" fill="#172033">C</text>
  <text x="410" y="90" text-anchor="middle" font-size="12" fill="#2487da" font-weight="600">เทวดา</text>
</svg>`
      },
      {
        id: 2,
        title: "เครื่องปรุง 3 อย่าง",
        difficulty: 2,
        question: `มีคน 3 คนชื่อ <strong>คุณเกลือ</strong> <strong>คุณพริกไทย</strong> และ <strong>คุณน้ำตาล</strong> กำลังรับประทานอาหารด้วยกัน แต่ละคนถือเครื่องปรุงคนละอย่าง (เกลือ, พริกไทย, หรือน้ำตาล)

มีคนสังเกตเห็นและบอกว่า: <em>"แต่ละคนถือเกลือ พริกไทย และน้ำตาลอยู่แหละ"</em>

คนที่<strong>ถือเกลือ</strong>อยู่พูดตอบว่า:<br>
<em>"ไม่มีคนไหนถือเครื่องปรุงที่ตรงกับชื่อตัวเองเลย!"</em>

แล้ว<strong>คุณน้ำตาล</strong>ก็บอกว่า: <em>"ขอน้ำตาลหน่อย"</em>

และคนที่สังเกตเห็นครั้งแรก <strong>ไม่ได้ถือน้ำตาล</strong>

<strong>คุณพริกไทยถืออะไร?</strong>`,
        diagram: `<svg viewBox="0 0 480 130" class="quiz-diagram">
  <rect x="10" y="20" width="140" height="95" rx="12" fill="rgba(85,181,255,0.08)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="80" y="48" text-anchor="middle" font-size="17">🧑</text>
  <text x="80" y="70" text-anchor="middle" font-size="12" font-weight="700" fill="#172033">คุณเกลือ</text>
  <text x="80" y="88" text-anchor="middle" font-size="11" fill="#607089">ถืออะไร?</text>
  <text x="80" y="104" text-anchor="middle" font-size="10" fill="#cf375f">≠ เกลือ</text>

  <rect x="170" y="20" width="140" height="95" rx="12" fill="rgba(85,181,255,0.08)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="240" y="48" text-anchor="middle" font-size="17">🧑</text>
  <text x="240" y="70" text-anchor="middle" font-size="12" font-weight="700" fill="#172033">คุณพริกไทย</text>
  <text x="240" y="88" text-anchor="middle" font-size="11" fill="#607089">ถืออะไร? ← โจทย์</text>
  <text x="240" y="104" text-anchor="middle" font-size="10" fill="#cf375f">≠ พริกไทย</text>

  <rect x="330" y="20" width="140" height="95" rx="12" fill="rgba(85,181,255,0.08)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="400" y="48" text-anchor="middle" font-size="17">🧑</text>
  <text x="400" y="70" text-anchor="middle" font-size="12" font-weight="700" fill="#172033">คุณน้ำตาล</text>
  <text x="400" y="88" text-anchor="middle" font-size="11" fill="#607089">ถืออะไร?</text>
  <text x="400" y="104" text-anchor="middle" font-size="10" fill="#cf375f">≠ น้ำตาล</text>
</svg>`,
        answer: "คุณพริกไทยถือ เกลือ",
        explanation: `<strong>วิธีคิด: ใช้เงื่อนไขทีละข้อ</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>กฎหลัก:</strong> ไม่มีใครถือเครื่องปรุงชื่อเดียวกับตัวเอง<br>
  คุณเกลือ ≠ ถือเกลือ &nbsp; | &nbsp; คุณพริกไทย ≠ ถือพริกไทย &nbsp; | &nbsp; คุณน้ำตาล ≠ ถือน้ำตาล</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>ใครถือเกลือและพูดว่า "ไม่มีใครถือตรงกับชื่อตัวเอง"?</strong><br>
  คนที่พูดนั้น = คนที่ถือเกลือ<br>
  คุณเกลือ ≠ ถือเกลือ ∴ คนที่พูดไม่ใช่คุณเกลือ<br>
  คนที่สังเกตเห็นครั้งแรก ≠ ถือน้ำตาล ∴ คนพูดนี้ถือเกลือ → คนพูด = <strong>คุณพริกไทย</strong> (เพราะถือเกลือได้ และ ≠ ถือพริกไทย)</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>สรุปการจับคู่:</strong><br>
  คุณพริกไทย → ถือเกลือ<br>
  คุณน้ำตาล → ถือพริกไทย (เหลือแค่อย่างเดียวที่เป็นไปได้)<br>
  คุณเกลือ → ถือน้ำตาล</div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 110" class="quiz-diagram">
  <rect x="10" y="10" width="140" height="90" rx="12" fill="rgba(85,181,255,0.12)" stroke="#2487da" stroke-width="1.5"/>
  <text x="80" y="42" text-anchor="middle" font-size="17">🧑</text>
  <text x="80" y="64" text-anchor="middle" font-size="12" font-weight="700" fill="#172033">คุณเกลือ</text>
  <text x="80" y="82" text-anchor="middle" font-size="13" fill="#2487da" font-weight="600">ถือน้ำตาล 🍚</text>

  <rect x="170" y="10" width="140" height="90" rx="12" fill="rgba(36,135,218,0.15)" stroke="#2487da" stroke-width="2"/>
  <text x="240" y="42" text-anchor="middle" font-size="17">🧑</text>
  <text x="240" y="64" text-anchor="middle" font-size="12" font-weight="700" fill="#172033">คุณพริกไทย</text>
  <text x="240" y="82" text-anchor="middle" font-size="13" fill="#2487da" font-weight="700">ถือเกลือ 🧂 ✓</text>

  <rect x="330" y="10" width="140" height="90" rx="12" fill="rgba(85,181,255,0.12)" stroke="#2487da" stroke-width="1.5"/>
  <text x="400" y="42" text-anchor="middle" font-size="17">🧑</text>
  <text x="400" y="64" text-anchor="middle" font-size="12" font-weight="700" fill="#172033">คุณน้ำตาล</text>
  <text x="400" y="82" text-anchor="middle" font-size="13" fill="#2487da" font-weight="600">ถือพริกไทย 🌶</text>
</svg>`
      },
      {
        id: 3,
        title: "คำให้การของคนคนเดียว",
        difficulty: 2,
        question: `มีใครบางคนยักยอกเงินของบริษัท ผู้ต้องสงสัยคือ A, B หรือ C คนใดคนหนึ่ง

<strong>A</strong> พูดว่า: <em>"คนร้ายคือ B"</em><br>
(B กับ C ก็พูดบางอย่าง แต่เราไม่รู้ว่าพูดอะไร)

หลังจากนั้นทราบว่า:
<ul>
  <li>คนร้ายคือคนใดคนหนึ่งใน A, B และ C</li>
  <li><strong>มีแต่คนร้ายเท่านั้นที่พูดความจริง</strong> (คนบริสุทธิ์จะโกหก)</li>
</ul>

<strong>ใครคือคนร้าย?</strong>`,
        answer: "C คือคนร้าย",
        explanation: `<strong>วิธีคิด: ตรวจสอบแต่ละกรณี</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>ถ้า A = คนร้าย:</strong> A พูดจริง → "คนร้ายคือ B" = จริง → B = คนร้ายด้วย → ขัดแย้ง (มีคนร้ายคนเดียว) ✗</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>ถ้า B = คนร้าย:</strong> B พูดจริง แต่ A เป็นคนบริสุทธิ์จึงโกหก → A พูดว่า "B คือคนร้าย" = โกหก → B ไม่ใช่คนร้าย → ขัดแย้ง ✗</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>ถ้า C = คนร้าย:</strong> C พูดจริง, A และ B เป็นคนบริสุทธิ์จึงโกหก<br>
  A โกหกว่า "B คือคนร้าย" → B ไม่ใช่คนร้าย ✓<br>
  ทุกอย่างสอดคล้องกัน → <strong>C = คนร้าย</strong> ✓</div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 110" class="quiz-diagram">
  <rect x="10" y="10" width="140" height="90" rx="12" fill="rgba(34,197,94,0.12)" stroke="#22c55e" stroke-width="1.5"/>
  <text x="80" y="42" text-anchor="middle" font-size="17">😇</text>
  <text x="80" y="64" text-anchor="middle" font-size="14" font-weight="700" fill="#172033">A</text>
  <text x="80" y="82" text-anchor="middle" font-size="11" fill="#16a34a">บริสุทธิ์ (โกหก)</text>

  <rect x="170" y="10" width="140" height="90" rx="12" fill="rgba(34,197,94,0.12)" stroke="#22c55e" stroke-width="1.5"/>
  <text x="240" y="42" text-anchor="middle" font-size="17">😇</text>
  <text x="240" y="64" text-anchor="middle" font-size="14" font-weight="700" fill="#172033">B</text>
  <text x="240" y="82" text-anchor="middle" font-size="11" fill="#16a34a">บริสุทธิ์ (โกหก)</text>

  <rect x="330" y="10" width="140" height="90" rx="12" fill="rgba(207,55,95,0.15)" stroke="#cf375f" stroke-width="2"/>
  <text x="400" y="42" text-anchor="middle" font-size="17">😈</text>
  <text x="400" y="64" text-anchor="middle" font-size="14" font-weight="700" fill="#172033">C</text>
  <text x="400" y="82" text-anchor="middle" font-size="13" fill="#cf375f" font-weight="700">คนร้าย! ✓</text>
</svg>`
      },
      {
        id: 4,
        title: "เป่ายิงฉุบ 10 ครั้ง",
        difficulty: 2,
        question: `A กับ B เป่ายิงฉุบกัน 10 ครั้ง โดย:
<ul>
  <li>A ออก: ค้อน 3 ครั้ง, กรรไกร 6 ครั้ง, กระดาษ 1 ครั้ง</li>
  <li>B ออก: ค้อน 2 ครั้ง, กรรไกร 4 ครั้ง, กระดาษ 4 ครั้ง</li>
</ul>

<strong>ทั้งสองไม่เคยออกเหมือนกันเลยสักครั้ง</strong> (ไม่มีเสมอ)
และทั้งคู่จำไม่ได้ว่าออกอะไรครั้งไหน

<strong>คนไหนชนะเยอะกว่ากัน?</strong>`,
        diagram: `<svg viewBox="0 0 480 120" class="quiz-diagram">
  <text x="240" y="20" text-anchor="middle" font-size="13" fill="#607089">กฎ: ค้อน > กรรไกร > กระดาษ > ค้อน</text>
  <!-- A -->
  <rect x="10" y="35" width="220" height="75" rx="10" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="120" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="#172033">A</text>
  <text x="120" y="76" text-anchor="middle" font-size="11" fill="#607089">✊ค้อน×3 &nbsp; ✌️กรรไกร×6 &nbsp; 🖐กระดาษ×1</text>
  <!-- B -->
  <rect x="250" y="35" width="220" height="75" rx="10" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="360" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="#172033">B</text>
  <text x="360" y="76" text-anchor="middle" font-size="11" fill="#607089">✊ค้อน×2 &nbsp; ✌️กรรไกร×4 &nbsp; 🖐กระดาษ×4</text>
  <text x="240" y="108" text-anchor="middle" font-size="11" fill="#cf375f">ทั้งสองไม่เคยออกเหมือนกัน → ทุกครั้งมีผู้แพ้ผู้ชนะ</text>
</svg>`,
        answer: "A ชนะเยอะกว่า (A ชนะ 7 ครั้ง, B ชนะ 3 ครั้ง)",
        explanation: `<strong>วิธีคิด: จัดคู่โดยใช้ข้อมูลที่มี</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>ตั้งตัวแปร:</strong> เมื่อ A ออกค้อน (3 ครั้ง) B ต้องออกกรรไกรหรือกระดาษ<br>
  กำหนดให้ a = ครั้งที่ A ออกค้อน vs B ออกกรรไกร (A ชนะ)<br>
  จะได้ A-ค้อน vs B-กระดาษ = 3−a ครั้ง (B ชนะ)</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>นับกรรไกรของ B ที่ใช้:</strong> B มีกรรไกร 4 ครั้ง<br>
  • B ออกกรรไกรตอน A ออกค้อน: a ครั้ง<br>
  • B ออกกรรไกรตอน A ออกกระดาษ (1 ครั้ง): b ครั้ง<br>
  รวม: a + b = 4<br>
  แต่ A มีกระดาษแค่ 1 ครั้ง ∴ b ≤ 1 และ a = 3+b−4+... ←  แก้สมการพบว่า a=3, b=1</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>สรุปผล:</strong>
  <table class="explain-table">
    <tr><th>A ออก</th><th>B ออก</th><th>ผล</th><th>ครั้ง</th></tr>
    <tr><td>✊ค้อน</td><td>✌️กรรไกร</td><td>A ชนะ</td><td>3</td></tr>
    <tr><td>✌️กรรไกร</td><td>✊ค้อน</td><td>B ชนะ</td><td>2</td></tr>
    <tr><td>✌️กรรไกร</td><td>🖐กระดาษ</td><td>A ชนะ</td><td>4</td></tr>
    <tr><td>🖐กระดาษ</td><td>✌️กรรไกร</td><td>B ชนะ</td><td>1</td></tr>
  </table>
  <strong>A ชนะรวม 7 ครั้ง, B ชนะ 3 ครั้ง</strong></div>
</div>`
      },
      {
        id: 5,
        title: "สัปดาห์อันยุ่งเหยิง",
        difficulty: 3,
        question: `A–G ทั้ง 7 คน กำลังพูดถึงวันของสัปดาห์ โดย <strong>มีเพียงคนเดียวเท่านั้นที่พูดความจริง</strong>

<ul>
  <li><strong>A:</strong> "มะรืนนี้เป็นวันพุธ"</li>
  <li><strong>B:</strong> "ไม่ใช่ วันนี้ต่างหากที่เป็นวันพุธ"</li>
  <li><strong>C:</strong> "ไม่ใช่นะ พรุ่งนี้ต่างหากที่เป็นวันพุธ"</li>
  <li><strong>D:</strong> "วันนี้ไม่ใช่วันจันทร์ อังคาร หรือพุธ"</li>
  <li><strong>E:</strong> "เมื่อวานเป็นวันพฤหัสบดี"</li>
  <li><strong>F:</strong> "พรุ่งนี้เป็นวันพฤหัสบดี"</li>
  <li><strong>G:</strong> "เมื่อวานไม่ใช่วันเสาร์"</li>
</ul>

<strong>วันนี้เป็นวันอะไร?</strong>`,
        answer: "วันนี้เป็น วันอาทิตย์",
        explanation: `<strong>วิธีคิด: ทดสอบแต่ละวัน หาวันที่มีคนพูดจริงแค่คนเดียว</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>แปลงคำพูดเป็นเงื่อนไข:</strong>
  <ul style="margin:4px 0">
    <li>A: วันนี้ = จันทร์</li>
    <li>B: วันนี้ = พุธ</li>
    <li>C: วันนี้ = อังคาร</li>
    <li>D: วันนี้ ≠ จันทร์, อังคาร, พุธ</li>
    <li>E: วันนี้ = ศุกร์</li>
    <li>F: วันนี้ = พุธ</li>
    <li>G: วันนี้ ≠ อาทิตย์</li>
  </ul></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>ทดสอบวันอาทิตย์:</strong>
  <ul style="margin:4px 0">
    <li>A: จันทร์? ✗</li>
    <li>B: พุธ? ✗</li>
    <li>C: อังคาร? ✗</li>
    <li><strong>D: ≠ จันทร์/อังคาร/พุธ? ✓ (อาทิตย์ไม่ใช่สามวันนั้น)</strong></li>
    <li>E: ศุกร์? ✗</li>
    <li>F: พุธ? ✗</li>
    <li>G: ≠ อาทิตย์? ✗ (วันนี้คืออาทิตย์)</li>
  </ul>
  <strong>มีแค่ D คนเดียวที่พูดจริง ✓</strong></div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 80" class="quiz-diagram">
  <text x="240" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#2487da">วันนี้ = อาทิตย์</text>
  <rect x="10" y="35" width="60" height="38" rx="8" fill="rgba(200,200,200,0.2)" stroke="#ddd" stroke-width="1"/>
  <text x="40" y="52" text-anchor="middle" font-size="10" fill="#aaa">A ✗</text>
  <text x="40" y="66" text-anchor="middle" font-size="9" fill="#aaa">จันทร์</text>
  <rect x="80" y="35" width="60" height="38" rx="8" fill="rgba(200,200,200,0.2)" stroke="#ddd" stroke-width="1"/>
  <text x="110" y="52" text-anchor="middle" font-size="10" fill="#aaa">B ✗</text>
  <text x="110" y="66" text-anchor="middle" font-size="9" fill="#aaa">พุธ</text>
  <rect x="150" y="35" width="60" height="38" rx="8" fill="rgba(200,200,200,0.2)" stroke="#ddd" stroke-width="1"/>
  <text x="180" y="52" text-anchor="middle" font-size="10" fill="#aaa">C ✗</text>
  <text x="180" y="66" text-anchor="middle" font-size="9" fill="#aaa">อังคาร</text>
  <rect x="220" y="35" width="60" height="38" rx="8" fill="rgba(36,135,218,0.18)" stroke="#2487da" stroke-width="2"/>
  <text x="250" y="52" text-anchor="middle" font-size="11" fill="#2487da" font-weight="700">D ✓</text>
  <text x="250" y="66" text-anchor="middle" font-size="9" fill="#2487da">≠จ./อ./พ.</text>
  <rect x="290" y="35" width="60" height="38" rx="8" fill="rgba(200,200,200,0.2)" stroke="#ddd" stroke-width="1"/>
  <text x="320" y="52" text-anchor="middle" font-size="10" fill="#aaa">E ✗</text>
  <text x="320" y="66" text-anchor="middle" font-size="9" fill="#aaa">ศุกร์</text>
  <rect x="360" y="35" width="60" height="38" rx="8" fill="rgba(200,200,200,0.2)" stroke="#ddd" stroke-width="1"/>
  <text x="390" y="52" text-anchor="middle" font-size="10" fill="#aaa">F ✗</text>
  <text x="390" y="66" text-anchor="middle" font-size="9" fill="#aaa">พุธ</text>
  <rect x="420" y="35" width="55" height="38" rx="8" fill="rgba(200,200,200,0.2)" stroke="#ddd" stroke-width="1"/>
  <text x="447" y="52" text-anchor="middle" font-size="10" fill="#aaa">G ✗</text>
  <text x="447" y="66" text-anchor="middle" font-size="9" fill="#aaa">≠เสาร์</text>
</svg>`
      },
      {
        id: 6,
        title: "จำนวนบริษัทในการแข่งขัน",
        difficulty: 3,
        question: `ในการแข่งขันทักษะการเสนอขาย แต่ละบริษัทส่งพนักงานมาเข้าร่วมได้ <strong>3 คน</strong>

ตัวแทนบริษัทของคุณ 3 คน (A, B, C) มีผลดังนี้:
<ul>
  <li><strong>A:</strong> อยู่อันดับกึ่งกลางพอดีระหว่างผู้เข้าร่วมทั้งหมด</li>
  <li><strong>B:</strong> อยู่อันดับที่ 19 และอันดับต่ำกว่า A</li>
  <li><strong>C:</strong> อยู่อันดับที่ 28</li>
</ul>

<strong>มีบริษัทเข้าร่วมทั้งหมดกี่บริษัท?</strong>`,
        answer: "11 บริษัท (A อยู่อันดับที่ 17 จากผู้เข้าร่วม 33 คน)",
        explanation: `<strong>วิธีคิด: สร้างสมการจากเงื่อนไข</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>A อยู่กึ่งกลาง:</strong> จำนวนคนที่อยู่เหนือ A = จำนวนคนที่อยู่ใต้ A<br>
  ถ้า A อยู่อันดับ r จากทั้งหมด n คน: r−1 = n−r → <strong>n = 2r−1</strong> (จำนวนรวมต้องเป็นเลขคี่)</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>เงื่อนไขจาก B และ C:</strong><br>
  • B อยู่อันดับ 19 และต่ำกว่า A → อันดับ A < 19 → r < 19<br>
  • C อยู่อันดับ 28 → จำนวนรวม ≥ 28 → n ≥ 28 → 2r−1 ≥ 28 → r ≥ 14.5 → r ≥ 15</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>หาค่าที่เป็นไปได้:</strong> r ∈ {15, 16, 17, 18}<br>
  n ต้องหารด้วย 3 ลงตัว (แต่ละบริษัท 3 คน):
  <table class="explain-table">
    <tr><th>r</th><th>n = 2r−1</th><th>หารด้วย 3?</th></tr>
    <tr><td>15</td><td>29</td><td>✗</td></tr>
    <tr><td>16</td><td>31</td><td>✗</td></tr>
    <tr><td>17</td><td>33</td><td>✓ (33÷3=11)</td></tr>
    <tr><td>18</td><td>35</td><td>✗</td></tr>
  </table>
  <strong>∴ A อยู่อันดับ 17, รวม 33 คน = 11 บริษัท</strong></div>
</div>`
      },
      {
        id: 7,
        title: "ผลแข่งขันปิงปองที่บ่อน้ำพุร้อน",
        difficulty: 4,
        question: `A, B, C แข่งปิงปองโดยมีกติกา:
<ul>
  <li>ผู้ชนะได้เล่นรอบต่อไป ผู้แพ้สลับกับคนที่รอ</li>
  <li>แต่ละรอบมีผู้เล่น 2 คน ส่วนอีกคนรอ</li>
</ul>

เมื่อเล่นเสร็จ จำนวนรอบที่แต่ละคนได้เล่น:
<ul>
  <li><strong>A</strong> เล่น 10 รอบ</li>
  <li><strong>B</strong> เล่น 15 รอบ</li>
  <li><strong>C</strong> เล่น 17 รอบ</li>
</ul>

<strong>ใครแพ้การแข่งขันรอบที่ 2?</strong>`,
        answer: "A แพ้รอบที่ 2",
        explanation: `<strong>วิธีคิด: วิเคราะห์จำนวนรอบที่เล่นและรอ</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>นับจำนวนเกมทั้งหมด:</strong><br>
  รวมรอบที่เล่น = 10+15+17 = 42<br>
  แต่ละเกมมีผู้เล่น 2 คน → จำนวนเกม = 42÷2 = <strong>21 เกม</strong><br>
  จำนวนรอบที่รอ = 21−10=11 (A), 21−15=6 (B), 21−17=4 (C)</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>A รอมากที่สุด = A เริ่มนั่งรอ (เกมที่ 1):</strong><br>
  เกม 1: B vs C (A รอ) → รอบแรก = B และ C เล่น<br>
  A เริ่มเล่นตั้งแต่เกมที่ 2</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>A ชนะ 0 ครั้ง!</strong> จากสมการ: จำนวนที่แพ้ของ A = 10 ครั้ง = ทุกครั้งที่ A เล่น<br>
  รูปแบบ: A รอ→เล่นแพ้→รอ→เล่นแพ้→...<br>
  A เล่นเกมเลขคู่: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20 (รวม 10 เกม ✓)<br>
  <strong>∴ A เล่นเกมที่ 2 และแพ้ = A แพ้รอบที่ 2</strong></div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 90" class="quiz-diagram">
  <text x="10" y="20" font-size="12" fill="#607089">ลำดับเกม:</text>
  <!-- Game 1 -->
  <rect x="10" y="30" width="70" height="50" rx="8" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="45" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#172033">เกม 1</text>
  <text x="45" y="66" text-anchor="middle" font-size="11" fill="#2487da">B vs C</text>
  <text x="45" y="76" text-anchor="middle" font-size="10" fill="#607089">(A รอ)</text>
  <!-- Game 2 -->
  <rect x="90" y="30" width="70" height="50" rx="8" fill="rgba(207,55,95,0.15)" stroke="#cf375f" stroke-width="2"/>
  <text x="125" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#172033">เกม 2</text>
  <text x="125" y="66" text-anchor="middle" font-size="11" fill="#cf375f" font-weight="700">A vs ?</text>
  <text x="125" y="76" text-anchor="middle" font-size="10" fill="#cf375f">A แพ้!</text>
  <!-- Game 3 -->
  <rect x="170" y="30" width="70" height="50" rx="8" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="205" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#172033">เกม 3</text>
  <text x="205" y="66" text-anchor="middle" font-size="11" fill="#2487da">? vs ?</text>
  <text x="205" y="76" text-anchor="middle" font-size="10" fill="#607089">(A รอ)</text>
  <text x="280" y="55" font-size="18" fill="#607089">...</text>
  <text x="320" y="55" text-anchor="middle" font-size="11" fill="#607089">A เล่น/แพ้ทุกเกมเลขคู่</text>
</svg>`
      },
      {
        id: 8,
        title: "ทางไปสวรรค์",
        difficulty: 5,
        question: `เบื้องหน้ามีทางแยก 2 ทาง ทางหนึ่งไปสวรรค์ อีกทางไปนรก

มีคนเฝ้าประตู 2 คนยืนอยู่ คนหนึ่งเป็น <strong>เทวดา (พูดจริงเสมอ)</strong> คีนหนึ่งเป็น <strong>ปีศาจ (โกหกเสมอ)</strong> แต่แยกไม่ออกด้วยตา

คุณถามได้ <strong>แค่ 1 ครั้ง</strong> ตอบได้แค่ "ใช่" หรือ "ไม่ใช่"

<strong>จะถามว่าอะไรเพื่อรู้ทางไปสวรรค์?</strong>`,
        diagram: `<svg viewBox="0 0 480 130" class="quiz-diagram">
  <text x="240" y="20" text-anchor="middle" font-size="13" fill="#607089">ทางไหนไปสวรรค์?</text>
  <!-- Left path -->
  <rect x="10" y="35" width="140" height="50" rx="10" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="80" y="56" text-anchor="middle" font-size="17">🌤</text>
  <text x="80" y="76" text-anchor="middle" font-size="12" fill="#607089">ทางซ้าย = ?</text>
  <!-- Right path -->
  <rect x="330" y="35" width="140" height="50" rx="10" fill="rgba(207,55,95,0.1)" stroke="#cf375f" stroke-width="1.5"/>
  <text x="400" y="56" text-anchor="middle" font-size="17">🔥</text>
  <text x="400" y="76" text-anchor="middle" font-size="12" fill="#607089">ทางขวา = ?</text>
  <!-- Guards -->
  <text x="200" y="56" text-anchor="middle" font-size="18">😇</text>
  <text x="280" y="56" text-anchor="middle" font-size="18">😈</text>
  <text x="240" y="80" text-anchor="middle" font-size="11" fill="#607089">ใครเป็นใคร ไม่รู้!</text>
  <text x="240" y="110" text-anchor="middle" font-size="11" fill="#2487da">ถามได้แค่ 1 ครั้ง ตอบได้แค่ ใช่/ไม่ใช่</text>
</svg>`,
        answer: `ถามคนใดก็ได้ว่า: "ถ้าฉันถามคุณว่าทางนี้ไปสวรรค์ไหม คุณจะตอบว่าใช่ไหม?"<br>ถ้าได้ "ใช่" → ทางนั้นไปสวรรค์ / ถ้าได้ "ไม่ใช่" → ทางนั้นไปนรก`,
        explanation: `<strong>วิธีคิด: คำถามสองชั้น (Double-Negation Trick)</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>ทำไมต้องถามสองชั้น?</strong><br>
  ถ้าถามตรง ๆ ว่า "ทางซ้ายไปสวรรค์ไหม?" เทวดาบอกจริง แต่ปีศาจโกหก → ยังสับสน<br>
  การถาม "ถ้าฉันถามคุณว่า...คุณจะตอบว่าใช่ไหม?" ทำให้ปีศาจต้องโกหกเกี่ยวกับการโกหกของตัวเอง</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>ตรวจสอบทุกกรณี (ทางซ้ายสมมติว่าไปสวรรค์):</strong>
  <table class="explain-table">
    <tr><th>ผู้ถูกถาม</th><th>ทางซ้าย</th><th>ตอบ</th></tr>
    <tr><td>เทวดา</td><td>สวรรค์</td><td>ใช่ ✓</td></tr>
    <tr><td>เทวดา</td><td>นรก</td><td>ไม่ใช่ ✓</td></tr>
    <tr><td>ปีศาจ</td><td>สวรรค์</td><td>ใช่ ✓ (โกหกเรื่องที่จะโกหก)</td></tr>
    <tr><td>ปีศาจ</td><td>นรก</td><td>ไม่ใช่ ✓</td></tr>
  </table>
  <strong>"ใช่" = ทางที่ชี้ไปสวรรค์เสมอ!</strong></div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 100" class="quiz-diagram">
  <rect x="10" y="10" width="460" height="80" rx="12" fill="rgba(36,135,218,0.08)" stroke="#2487da" stroke-width="1.5"/>
  <text x="240" y="35" text-anchor="middle" font-size="12" font-weight="700" fill="#2487da">คำถามวิเศษ:</text>
  <text x="240" y="55" text-anchor="middle" font-size="11" fill="#172033">"ถ้าฉันถามคุณว่าทางนี้ไปสวรรค์ไหม คุณจะตอบว่าใช่ไหม?"</text>
  <text x="120" y="80" text-anchor="middle" font-size="11" fill="#16a34a">ตอบ "ใช่" → ทางสวรรค์ ✓</text>
  <text x="360" y="80" text-anchor="middle" font-size="11" fill="#cf375f">ตอบ "ไม่ใช่" → ทางนรก ✓</text>
</svg>`
      },
      {
        id: 9,
        title: "หมวก 50%",
        difficulty: 5,
        question: `A และ B นั่งหันหน้าเข้าหากัน มีคนสวมหมวกให้คนละใบ หมวกมีแค่ 2 สี: <strong>แดง</strong> หรือ <strong>น้ำเงิน</strong>

<ul>
  <li>แต่ละคนเห็นหมวกของอีกฝ่าย แต่ไม่เห็นของตัวเอง</li>
  <li>ทั้งคู่คุยกันไม่ได้ระหว่างเล่น</li>
  <li>ต้องพูดสีหมวกตัวเองพร้อมกัน</li>
  <li>ต้องการให้ <strong>อย่างน้อย 1 คนตอบถูก</strong></li>
  <li>ปรึกษากันล่วงหน้าได้ก่อนสวมหมวก</li>
</ul>

<strong>วางแผนล่วงหน้าอย่างไรถึงรับประกันได้ว่าอย่างน้อย 1 คนตอบถูกเสมอ?</strong>`,
        answer: "A พูดสีเดียวกับหมวกที่เห็น / B พูดสีตรงข้ามกับที่เห็น",
        explanation: `<strong>วิธีคิด: แบ่งกัน "เดา" สองทิศทาง</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>กลยุทธ์:</strong><br>
  A ตกลงว่า: "ฉันจะบอกสีเดียวกับหมวกที่ฉันเห็น B ใส่"<br>
  B ตกลงว่า: "ฉันจะบอกสีตรงข้ามกับหมวกที่ฉันเห็น A ใส่"</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>ทดสอบทุกกรณี (มีแค่ 4 แบบ):</strong>
  <table class="explain-table">
    <tr><th>A ใส่</th><th>B ใส่</th><th>A บอก</th><th>B บอก</th><th>ผล</th></tr>
    <tr><td>🔴แดง</td><td>🔴แดง</td><td>แดง (เห็นแดง)</td><td>น้ำเงิน (เห็นแดง→ตรงข้าม)</td><td>A ถูก ✓</td></tr>
    <tr><td>🔴แดง</td><td>🔵น้ำเงิน</td><td>น้ำเงิน (เห็นน้ำเงิน)</td><td>น้ำเงิน (เห็นแดง→ตรงข้าม)</td><td>B ถูก ✓</td></tr>
    <tr><td>🔵น้ำเงิน</td><td>🔴แดง</td><td>แดง (เห็นแดง)</td><td>แดง (เห็นน้ำเงิน→ตรงข้าม)</td><td>B ถูก ✓</td></tr>
    <tr><td>🔵น้ำเงิน</td><td>🔵น้ำเงิน</td><td>น้ำเงิน (เห็นน้ำเงิน)</td><td>แดง (เห็นน้ำเงิน→ตรงข้าม)</td><td>A ถูก ✓</td></tr>
  </table>
  <strong>ทุกกรณีมีคนตอบถูกอย่างน้อย 1 คน!</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>ทำไมถึงได้ผลเสมอ?</strong><br>
  สีทั้งสองอาจ "เหมือนกัน" หรือ "ต่างกัน" — มีแค่สองแบบนี้<br>
  A เดาว่า "เหมือนกัน" / B เดาว่า "ต่างกัน" → หนึ่งในสองต้องถูกต้องเสมอ!</div>
</div>`
      },
      {
        id: 10,
        title: "หมวก 33%",
        difficulty: 5,
        question: `A, B, C นั่งเป็นวงกลม มีคนสวมหมวกให้ หมวกมี 3 สี: <strong>แดง น้ำเงิน ขาว</strong>

<ul>
  <li>แต่ละคนเห็นหมวกของ 2 คนอื่น แต่ไม่เห็นของตัวเอง</li>
  <li>ห้ามสื่อสารระหว่างเล่น</li>
  <li>ต้องบอกสีหมวกตัวเองพร้อมกัน</li>
  <li>ต้องการ <strong>อย่างน้อย 1 คนตอบถูก</strong></li>
  <li>ปรึกษากันล่วงหน้าได้</li>
</ul>

<strong>วางแผนอย่างไรถึงรับประกันได้?</strong> (ยากกว่าข้อ 9 เพราะมี 3 สี)`,
        answer: "ใช้ modular arithmetic (mod 3) แบ่งบทบาทให้แต่ละคนเดาค่า mod ต่างกัน",
        explanation: `<strong>วิธีคิด: Modular Arithmetic</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>กำหนดรหัสสี:</strong><br>
  แดง = 0 &nbsp; น้ำเงิน = 1 &nbsp; ขาว = 2</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>กลยุทธ์ (วางแผนก่อนสวมหมวก):</strong><br>
  • A เดาสีตัวเองโดยให้ (สีA + สีB + สีC) ≡ 0 (mod 3)<br>
  &nbsp;&nbsp;→ A บอก: (0 − สีB − สีC) mod 3<br>
  • B เดาให้ผลรวม ≡ 1 (mod 3)<br>
  &nbsp;&nbsp;→ B บอก: (1 − สีA − สีC) mod 3<br>
  • C เดาให้ผลรวม ≡ 2 (mod 3)<br>
  &nbsp;&nbsp;→ C บอก: (2 − สีA − สีB) mod 3</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>ทำไมถึงได้ผล?</strong><br>
  ผลรวมจริงของสีทั้ง 3 ≡ r (mod 3) สำหรับค่าใดค่าหนึ่งใน {0, 1, 2}<br>
  คนที่รับผิดชอบค่า r นั้นจะเดาถูก! ส่วนอีก 2 คนเดาผิด<br>
  <strong>รับประกันว่าได้ 1 คนถูกเสมอ</strong></div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 120" class="quiz-diagram">
  <text x="240" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="#2487da">ตัวอย่าง: A=แดง(0) B=น้ำเงิน(1) C=ขาว(2) → ผลรวม=3≡0 (mod 3)</text>
  <rect x="10" y="35" width="140" height="75" rx="10" fill="rgba(36,135,218,0.1)" stroke="#2487da" stroke-width="2"/>
  <text x="80" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#172033">A (เดา mod=0)</text>
  <text x="80" y="78" text-anchor="middle" font-size="10" fill="#607089">เห็น B=1, C=2</text>
  <text x="80" y="96" text-anchor="middle" font-size="11" fill="#2487da">(0−1−2) mod 3 = 0</text>
  <text x="80" y="106" text-anchor="middle" font-size="11" fill="#16a34a">= แดง ✓</text>

  <rect x="170" y="35" width="140" height="75" rx="10" fill="rgba(200,200,200,0.1)" stroke="#ccc" stroke-width="1"/>
  <text x="240" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#172033">B (เดา mod=1)</text>
  <text x="240" y="78" text-anchor="middle" font-size="10" fill="#607089">เห็น A=0, C=2</text>
  <text x="240" y="96" text-anchor="middle" font-size="11" fill="#607089">(1−0−2) mod 3 = 2</text>
  <text x="240" y="106" text-anchor="middle" font-size="11" fill="#cf375f">= ขาว ✗</text>

  <rect x="330" y="35" width="140" height="75" rx="10" fill="rgba(200,200,200,0.1)" stroke="#ccc" stroke-width="1"/>
  <text x="400" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#172033">C (เดา mod=2)</text>
  <text x="400" y="78" text-anchor="middle" font-size="10" fill="#607089">เห็น A=0, B=1</text>
  <text x="400" y="96" text-anchor="middle" font-size="11" fill="#607089">(2−0−1) mod 3 = 1</text>
  <text x="400" y="106" text-anchor="middle" font-size="11" fill="#cf375f">= น้ำเงิน ✗</text>
</svg>`
      },
      {
        id: 11,
        title: "แมวของชเรอดิงเงอร์",
        difficulty: 5,
        question: `มีกล่อง 5 ใบ เรียงตามลำดับ 1–2–3–4–5 มีแมวซ่อนอยู่ในกล่องใดกล่องหนึ่ง

<ul>
  <li>คืนไหนแมวจะ<strong>ย้ายไปกล่องข้าง ๆ เสมอ</strong> (ซ้ายหรือขวา 1 ช่อง)</li>
  <li>ทุกเช้าตรวจได้แค่ <strong>1 กล่อง</strong></li>
  <li>ไม่รู้ว่าแมวเริ่มต้นที่กล่องไหน</li>
</ul>

<strong>จะต้องเปิดกล่องในลำดับใดถึงจะพบแมวแน่นอน?</strong>`,
        diagram: `<svg viewBox="0 0 480 80" class="quiz-diagram">
  <text x="240" y="18" text-anchor="middle" font-size="12" fill="#607089">แมวอยู่กล่องใดกล่องหนึ่ง และย้ายทุกคืน</text>
  <rect x="30" y="28" width="70" height="40" rx="8" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="65" y="48" text-anchor="middle" font-size="16">1</text>
  <text x="65" y="62" text-anchor="middle" font-size="11" fill="#607089">📦</text>
  <text x="110" y="50" text-anchor="middle" font-size="16" fill="#aaa">↔</text>
  <rect x="130" y="28" width="70" height="40" rx="8" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="165" y="48" text-anchor="middle" font-size="16">2</text>
  <text x="165" y="62" text-anchor="middle" font-size="11" fill="#607089">📦</text>
  <text x="210" y="50" text-anchor="middle" font-size="16" fill="#aaa">↔</text>
  <rect x="230" y="28" width="70" height="40" rx="8" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="265" y="48" text-anchor="middle" font-size="16">3</text>
  <text x="265" y="62" text-anchor="middle" font-size="11" fill="#607089">📦</text>
  <text x="310" y="50" text-anchor="middle" font-size="16" fill="#aaa">↔</text>
  <rect x="330" y="28" width="70" height="40" rx="8" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="365" y="48" text-anchor="middle" font-size="16">4</text>
  <text x="365" y="62" text-anchor="middle" font-size="11" fill="#607089">📦</text>
  <text x="410" y="50" text-anchor="middle" font-size="16" fill="#aaa">↔</text>
  <rect x="430" y="28" width="40" height="40" rx="8" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="450" y="48" text-anchor="middle" font-size="16">5</text>
  <text x="450" y="62" text-anchor="middle" font-size="11" fill="#607089">📦</text>
</svg>`,
        answer: "เปิดลำดับ: 2 → 3 → 4 → 4 → 3 → 2 (6 วัน รับประกันเจอแมว)",
        explanation: `<strong>วิธีคิด: กำจัดความเป็นไปได้ทีละแบบ</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>สังเกตว่าตำแหน่งแมวสลับคู่-คี่ทุกคืน:</strong><br>
  ถ้าแมวเริ่มที่กล่องคู่ (2 หรือ 4): เช้าที่ 1 = กล่องคู่, เช้าที่ 2 = กล่องคี่, ...<br>
  ถ้าแมวเริ่มที่กล่องคี่ (1, 3, 5): เช้าที่ 1 = กล่องคี่, เช้าที่ 2 = กล่องคู่, ...</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>กลยุทธ์ 6 วัน: เปิด 2, 3, 4, 4, 3, 2</strong>
  <table class="explain-table">
    <tr><th>วัน</th><th>เปิดกล่อง</th><th>จุดประสงค์</th></tr>
    <tr><td>1</td><td>2</td><td>จับแมวที่เริ่มกล่อง 2</td></tr>
    <tr><td>2</td><td>3</td><td>จับแมวที่เริ่มกล่อง 2 (ย้ายมา 3) หรือเริ่ม 4 (ย้ายมา 3)</td></tr>
    <tr><td>3</td><td>4</td><td>กวาดเพิ่ม</td></tr>
    <tr><td>4</td><td>4</td><td>ครอบคลุมกรณีที่หลงเหลือ</td></tr>
    <tr><td>5</td><td>3</td><td>กวาดกลับ</td></tr>
    <tr><td>6</td><td>2</td><td>จับแมวที่เริ่มกล่องคี่ทุกตัว</td></tr>
  </table></div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 60" class="quiz-diagram">
  <text x="240" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="#2487da">ลำดับเปิดกล่อง:</text>
  <rect x="20" y="28" width="60" height="28" rx="6" fill="rgba(36,135,218,0.2)" stroke="#2487da" stroke-width="1.5"/>
  <text x="50" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="#2487da">2</text>
  <text x="90" y="43" font-size="14" fill="#aaa">→</text>
  <rect x="105" y="28" width="60" height="28" rx="6" fill="rgba(36,135,218,0.2)" stroke="#2487da" stroke-width="1.5"/>
  <text x="135" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="#2487da">3</text>
  <text x="175" y="43" font-size="14" fill="#aaa">→</text>
  <rect x="190" y="28" width="60" height="28" rx="6" fill="rgba(36,135,218,0.2)" stroke="#2487da" stroke-width="1.5"/>
  <text x="220" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="#2487da">4</text>
  <text x="260" y="43" font-size="14" fill="#aaa">→</text>
  <rect x="275" y="28" width="60" height="28" rx="6" fill="rgba(36,135,218,0.2)" stroke="#2487da" stroke-width="1.5"/>
  <text x="305" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="#2487da">4</text>
  <text x="345" y="43" font-size="14" fill="#aaa">→</text>
  <rect x="360" y="28" width="40" height="28" rx="6" fill="rgba(36,135,218,0.2)" stroke="#2487da" stroke-width="1.5"/>
  <text x="380" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="#2487da">3</text>
  <text x="408" y="43" font-size="14" fill="#aaa">→</text>
  <rect x="422" y="28" width="48" height="28" rx="6" fill="rgba(36,135,218,0.2)" stroke="#2487da" stroke-width="1.5"/>
  <text x="446" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="#2487da">2 🐱</text>
</svg>`
      },
      {
        id: 12,
        title: "บันไดสู่สวรรค์",
        difficulty: 5,
        question: `มีบันได 2 แถว ทางหนึ่งไปสวรรค์ อีกทางไปนรก มีคนเฝ้า 3 คนเป็นหนึ่งในสาม:
<ul>
  <li>🌟 <strong>เทวดา</strong> — พูดจริงเสมอ</li>
  <li>😈 <strong>ปีศาจ</strong> — โกหกเสมอ</li>
  <li>🧑 <strong>มนุษย์</strong> — พูดจริงหรือเท็จก็ได้ (ไม่แน่นอน)</li>
</ul>

แยกไม่ออกด้วยตา คุณถามได้ <strong>2 ครั้ง ถามคนละคน</strong> ตอบได้แค่ "ใช่" หรือ "ไม่ใช่"

<strong>จะถามอย่างไรถึงรู้ว่าบันไดไหนไปสวรรค์?</strong>`,
        answer: "Q1 ถามคน 1 เพื่อระบุว่าคน 2 เป็นมนุษย์ไหม / Q2 ถามคนที่ไม่ใช่มนุษย์ด้วยคำถามสองชั้น",
        explanation: `<strong>วิธีคิด: ระบุ "มนุษย์" ก่อน แล้วถามคนที่น่าเชื่อถือ</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>คำถามที่ 1</strong> ถามคน 1:<br>
  <em>"ถ้าฉันถามคุณว่าคน 2 เป็นมนุษย์ไหม คุณจะตอบว่าใช่ไหม?"</em><br><br>
  คำถามสองชั้นนี้ทำให้เทวดาและปีศาจตอบตรงกัน:<br>
  • ถ้าคน 2 = มนุษย์ → ทั้งเทวดาและปีศาจตอบ "ใช่"<br>
  • ถ้าคน 2 ≠ มนุษย์ → ทั้งเทวดาและปีศาจตอบ "ไม่ใช่"</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>ตัดสินใจจากคำตอบ:</strong><br>
  • ตอบ "ใช่" → คน 2 น่าจะเป็นมนุษย์ → <strong>ถาม Q2 กับคน 3</strong><br>
  • ตอบ "ไม่ใช่" → คน 2 น่าจะไม่ใช่มนุษย์ → <strong>ถาม Q2 กับคน 2</strong><br><br>
  กลยุทธ์นี้ใช้ได้กับทุกกรณี แม้แต่เมื่อคน 1 เป็นมนุษย์เอง (เพราะมีแค่ 1 มนุษย์)</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>คำถามที่ 2</strong> ถามคนที่เลือก:<br>
  <em>"ถ้าฉันถามว่าบันไดซ้ายไปสวรรค์ไหม คุณจะตอบว่าใช่ไหม?"</em><br>
  → "ใช่" = บันไดซ้ายไปสวรรค์ / "ไม่ใช่" = บันไดขวาไปสวรรค์</div>
</div>`,
        answerDiagram: `<svg viewBox="0 0 480 100" class="quiz-diagram">
  <rect x="10" y="10" width="220" height="80" rx="10" fill="rgba(85,181,255,0.1)" stroke="#55b5ff" stroke-width="1.5"/>
  <text x="120" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#172033">Q1 → ถามคน 1</text>
  <text x="120" y="50" text-anchor="middle" font-size="10" fill="#607089">"คน 2 เป็นมนุษย์ไหม?"</text>
  <text x="60" y="72" text-anchor="middle" font-size="10" fill="#16a34a">ใช่ → ถาม Q2 กับคน 3</text>
  <text x="175" y="72" text-anchor="middle" font-size="10" fill="#d97706">ไม่ → ถาม Q2 กับคน 2</text>

  <rect x="250" y="10" width="220" height="80" rx="10" fill="rgba(36,135,218,0.1)" stroke="#2487da" stroke-width="1.5"/>
  <text x="360" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#172033">Q2 → ถามคนที่เลือก</text>
  <text x="360" y="50" text-anchor="middle" font-size="10" fill="#607089">"บันไดซ้ายไปสวรรค์ไหม?"</text>
  <text x="300" y="72" text-anchor="middle" font-size="10" fill="#16a34a">ใช่ → ซ้าย 🌤</text>
  <text x="420" y="72" text-anchor="middle" font-size="10" fill="#cf375f">ไม่ → ขวา 🔥</text>
</svg>`
      }
    ]
  },
  {
    id: 2,
    label: {
      th: "บทที่ 2",
      en: "Chapter 2"
    },
    title: {
      th: "บทที่ 2: การคิดอย่างมีวิจารณญาณ",
      en: "Chapter 2: Critical Thinking"
    },
    description: {
      th: "การคิดอย่างมีวิจารณญาณ จับจุดหลอกของตัวเลข ภาษา และสมมติฐานที่ดูเหมือนจริง",
      en: "Spot traps in numbers, language, and assumptions that only look correct at first glance."
    },
    questions: [
      {
        id: 13,
        title: "1,000 เยนที่หายไป",
        difficulty: 1,
        question: `คุณเข้าพักโรงแรมกับเพื่อนร่วมงานอีก 2 คน จ่ายค่าห้องคนละ 10,000 เยน รวมเป็น 30,000 เยน

ต่อมาพนักงานพบว่าค่าห้องจริงคือ 25,000 เยน จึงจะคืน 5,000 เยน แต่แบ่ง 3 คนไม่ลงตัว จึงเก็บไว้ 2,000 เยน และคืนให้ทั้ง 3 คนรวม 3,000 เยน

ตอนนี้แต่ละคนจ่ายจริงคนละ 9,000 เยน รวมเป็น 27,000 เยน แล้วบวก 2,000 เยนที่พนักงานเก็บ ได้ 29,000 เยน

แล้วเงินอีก 1,000 เยนหายไปไหน?`,
        answer: "ไม่มีเงินหาย โจทย์บวกผิด",
        explanation: `<strong>27,000 เยน นับรวม 2,000 เยนที่พนักงานเก็บไว้แล้ว</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>ลูกค้าจ่ายจริงรวม <strong>27,000</strong> = ค่าห้อง <strong>25,000</strong> + พนักงานเก็บ <strong>2,000</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ดังนั้นไม่ควรเอา <strong>27,000 + 2,000</strong> เพราะเป็นการนับ 2,000 ซ้ำ ต้องดูเป็น <strong>30,000 = 25,000 + 2,000 + 3,000</strong></div>
</div>`
      },
      {
        id: 14,
        title: "คำถามที่ง่ายที่สุดในโลก",
        difficulty: 1,
        question: `A กำลังมอง B
B กำลังมอง C
A แต่งงานแล้ว
C เป็นโสด

จากข้อมูลนี้ จะพูดได้ไหมว่า
<strong>"มีคนที่แต่งงานแล้วกำลังมองคนโสดอยู่"</strong>`,
        answer: "พูดได้แน่ ว่ามีอย่างน้อย 1 คน",
        explanation: `<strong>ดูสถานะของ B แค่ 2 กรณี</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้า <strong>B แต่งงานแล้ว</strong> → B มอง C และ C โสด จบเลย</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ถ้า <strong>B โสด</strong> → A ที่แต่งงานแล้วกำลังมอง B ที่โสด จบเหมือนกัน</div>
</div>`
      },
      {
        id: 15,
        title: "วิ่งแข่งรอบที่ 2",
        difficulty: 1,
        question: `คุณแข่งวิ่ง 100 เมตรกับคู่แข่ง รอบแรกคุณแพ้ โดยตอนคู่แข่งเข้าเส้นชัย คุณยังอยู่ห่างเส้นชัย 10 เมตร

รอบที่ 2 คู่แข่งต้องออกตัวจากจุดที่ห่างจากคุณ 10 เมตร และทั้งสองวิ่งด้วยความเร็วเท่าเดิม

ใครจะชนะรอบที่ 2?`,
        answer: "คู่แข่งยังชนะ",
        explanation: `<strong>ความเร็วสัมพัทธ์ไม่ได้เปลี่ยน</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>รอบแรก ตอนคู่แข่งวิ่งครบ 100 เมตร คุณวิ่งได้ 90 เมตร แปลว่าความเร็วคุณเป็น <strong>90%</strong> ของอีกฝ่าย</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>รอบใหม่คู่แข่งวิ่ง 90 เมตร คุณจะวิ่งได้เพียง 81 เมตร ดังนั้นเขายังเข้าเส้นชัยก่อน</div>
</div>`
      },
      {
        id: 16,
        title: "เครื่องบินเจอลมปะทะ",
        difficulty: 2,
        question: `มีสนามบิน A และ B
คุณบินจาก A ไป B และบินกลับ

ขาไป <strong>ไม่มีลม</strong>
ขากลับ <strong>มีลมพัดจาก A ไป B ตลอดทาง</strong>

เวลารวมของการบินไป-กลับจะเป็นอย่างไรเมื่อเทียบกับกรณีไม่มีลมทั้งสองขา?`,
        answer: "นานกว่ากรณีไม่มีลม",
        explanation: `<strong>ลมจาก A ไป B กลายเป็นลมต้านตอนบินกลับจาก B ไป A</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>ขาไปความเร็วเท่าเดิม แต่ขากลับช้าลงเพราะเจอลมต้าน</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เวลารวมจึง <strong>มากขึ้น</strong> ไม่ได้ถูกชดเชย เพราะมีแค่ขากลับที่โดนผลของลม</div>
</div>`
      },
      {
        id: 17,
        title: "ปริศนาเรือที่แล่นสวนกัน",
        difficulty: 2,
        question: `ทุกวันเที่ยง มีเรือออกจากญี่ปุ่นไปออสเตรเลีย
และในเวลาเดียวกันก็มีเรือออกจากออสเตรเลียไปญี่ปุ่น

แต่ละลำใช้เวลาเดินทาง 7 วัน 7 คืนเท่ากัน

ถ้าเรือจากญี่ปุ่นออกวันนี้ ระหว่างทางจะสวนกับเรือที่ออกจากออสเตรเลียทั้งหมดกี่ลำ?`,
        answer: "15 ลำ",
        explanation: `<strong>เรือจะเจอทั้งลำที่ออกก่อนหน้า วันนี้ และหลังจากวันนี้</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>มันจะสวนกับเรือที่ออกจากออสเตรเลียในช่วง <strong>7 วันก่อนหน้า</strong>, <strong>วันเดียวกัน</strong>, และ <strong>7 วันหลังจากนั้น</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>รวมทั้งหมด <strong>7 + 1 + 7 = 15</strong> ลำ</div>
</div>`
      },
      {
        id: 18,
        title: "สินค้า 200 ชิ้น",
        difficulty: 2,
        question: `โรงงานมีสินค้า 200 ชิ้น โดย <strong>99%</strong> เป็นสินค้าที่ไม่ได้มาตรฐาน

ต้องการคัดของเสียออกเพื่อให้สินค้าที่เหลือมีของเสียเพียง <strong>98%</strong>

ต้องเอาสินค้าที่ไม่ได้มาตรฐานออกกี่ชิ้น?`,
        answer: "100 ชิ้น",
        explanation: `<strong>ของดีมีอยู่ 2 ชิ้นตั้งแต่ต้น และจำนวนนั้นไม่เปลี่ยน</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>99% ของ 200 คือของเสีย 198 ชิ้น จึงมีของดี <strong>2 ชิ้น</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ถ้าต้องการให้ของดี 2 ชิ้นเป็น 2% ของทั้งหมด จำนวนรวมต้องเหลือ <strong>100 ชิ้น</strong> → ต้องเอาของเสียออก <strong>100 ชิ้น</strong></div>
</div>`
      },
      {
        id: 19,
        title: "แผนเพิ่มประชากร",
        difficulty: 2,
        question: `ทุกครอบครัวอยากมี <strong>ลูกสาว</strong> และจะมีลูกต่อไปเรื่อย ๆ จนกว่าจะได้ลูกสาวแล้วจึงหยุด

สมมติว่าโอกาสได้ลูกชายและลูกหญิงเท่ากัน

สุดท้ายแล้วสัดส่วน <strong>เด็กชาย : เด็กหญิง</strong> ในประเทศจะเป็นเท่าไร?`,
        answer: "ประมาณ 1 : 1",
        explanation: `<strong>แต่ละครั้งที่เกิด โอกาสเป็นชายหรือหญิงยังคง 50% เท่ากัน</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>บางครอบครัวจะมีลูกชายหลายคนก่อนจะได้ลูกสาว แต่โดยเฉลี่ยทุกการเกิดยังออกชาย/หญิงเท่า ๆ กัน</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ดังนั้นภาพรวมของประเทศยังคงมีสัดส่วนเด็กชายกับเด็กหญิง <strong>ใกล้ 1:1</strong></div>
</div>`
      },
      {
        id: 20,
        title: "ขึ้นเงินเดือนปริศนา",
        difficulty: 3,
        question: `มีแผนขึ้นเงินเดือน 2 แบบ

แผน A: ขึ้นเงินเดือน <strong>100,000 เยนต่อปี</strong> (คิดเป็นยอดรวมทั้งปี)
แผน B: ขึ้นเงินเดือน <strong>30,000 เยนทุกครึ่งปี</strong> (คิดเป็นยอดรวมครึ่งปี)

คุณควรเลือกแผนไหน?`,
        answer: "แผน A",
        explanation: `<strong>ต้องเทียบหน่วยเดียวกันก่อน</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>แผน A ให้เพิ่มปีละ <strong>100,000</strong> เยน</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>แผน B ให้เพิ่มครึ่งปีละ 30,000 เยน จึงรวมปีละ <strong>60,000</strong> เยนเท่านั้น</div>
</div>`
      },
      {
        id: 21,
        title: "กล่องลูกบอลสีขาว",
        difficulty: 3,
        question: `ในกล่องมีลูกบอลอยู่ 1 ลูก แต่ไม่รู้ว่าเป็น <strong>สีดำ</strong> หรือ <strong>สีขาว</strong>

คุณใส่ลูกบอลสีขาวเพิ่มเข้าไป 1 ลูก เขย่ากล่อง แล้วหยิบออกมา 1 ลูก
ปรากฏว่าลูกที่หยิบออกมาเป็น <strong>สีขาว</strong>

ลูกบอลที่เหลือในกล่องควรเป็นสีอะไร?`,
        answer: "มีโอกาสเป็นสีขาวมากกว่า โดยความน่าจะเป็น 2/3",
        explanation: `<strong>ไม่ใช่ขาวแน่นอน แต่ขาวมีโอกาสมากกว่า</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าลูกเดิมเป็นขาว จะได้ WW และหยิบขาวได้แน่</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ถ้าลูกเดิมเป็นดำ จะได้ BW และหยิบขาวได้แค่ครึ่งเดียว จึงทำให้กรณีลูกเดิมเป็นขาวมีน้ำหนักมากกว่า → ลูกที่เหลือน่าจะเป็น <strong>สีขาว</strong></div>
</div>`
      },
      {
        id: 22,
        title: "ไพ่ 3 ใบ",
        difficulty: 4,
        question: `มีไพ่ 3 ใบอยู่ตรงหน้าคุณ

ใบที่ 1: ดำทั้ง 2 ด้าน
ใบที่ 2: ขาวทั้ง 2 ด้าน
ใบที่ 3: ดำ 1 ด้าน ขาว 1 ด้าน

เมื่อหยิบออกมา 1 ใบแล้วเห็นว่าด้านหน้าที่หงายอยู่เป็น <strong>สีขาว</strong>

ความน่าจะเป็นที่ด้านหลังจะเป็น <strong>สีขาว</strong> เท่าใด?`,
        answer: "2/3",
        explanation: `<strong>มองจากจำนวน 'หน้าขาวที่เป็นไปได้'</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>ไพ่ WW มีหน้าขาวให้เห็นได้ <strong>2 ด้าน</strong> ส่วนไพ่ WB มีหน้าขาวให้เห็นได้ <strong>1 ด้าน</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ดังนั้นเมื่อเห็นหน้าขาว ความเป็นไปได้มี 3 กรณีเท่า ๆ กัน และ 2 ใน 3 มาจากไพ่ WW → ด้านหลังขาวมีโอกาส <strong>2/3</strong></div>
</div>`
      },
      {
        id: 23,
        title: "ม้าแข่ง 25 ตัว",
        difficulty: 4,
        question: `มีม้าแข่งอยู่ 25 ตัว ต้องหาม้า 3 ตัวที่เร็วที่สุด

ในการแข่งแต่ละครั้งให้ลงได้มากสุด 5 ตัว
และจับเวลาไม่ได้ รู้ได้แค่ว่าใครเร็วกว่าใครใน race เดียวกัน

อย่างน้อยที่สุดต้องแข่งทั้งหมดกี่ครั้ง?`,
        answer: "7 ครั้ง",
        explanation: `<strong>แบ่ง 5 กลุ่มก่อน แล้วใช้ race สุดท้ายคัดเฉพาะตัวที่ยังมีลุ้น</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>แข่ง 5 ครั้งแรกเพื่อจัดอันดับในแต่ละกลุ่ม 5 กลุ่ม</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เอาผู้ชนะทั้ง 5 กลุ่มมาแข่งครั้งที่ 6 เพื่อรู้ว่ากลุ่มไหนยังมีสิทธิ์ติด Top 3</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>จะเหลือตัวลุ้นจริงเพียง 5 ตัวสำหรับ race ที่ 7 จึงรวมขั้นต่ำ <strong>7 ครั้ง</strong></div>
</div>`
      },
      {
        id: 24,
        title: "ไพ่ 4 ใบ",
        difficulty: 4,
        question: `เบื้องหน้าคุณมีไพ่อยู่ 4 ใบ เขียนว่า <strong>E</strong> <strong>R</strong> <strong>2</strong> <strong>9</strong>

ไพ่แต่ละใบมีตัวอักษรด้านหนึ่ง และตัวเลขอีกด้านหนึ่ง

หากต้องการพิสูจน์กฎว่า
<strong>"ด้านหลังของไพ่ที่เป็นสระเป็นเลขคู่เสมอ"</strong>

คุณจะพลิกไพ่แค่ 2 ใบ ควรพลิกใบไหน?`,
        answer: "พลิก E และ 9",
        explanation: `<strong>ต้องหากรณีที่อาจทำให้กฎ 'ผิด'</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>พลิก <strong>E</strong> เพื่อเช็กว่าด้านหลังเป็นเลขคู่จริงไหม</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>พลิก <strong>9</strong> เพื่อเช็กว่าด้านหลังไม่ใช่สระ เพราะถ้าเป็นสระจะผิดกฎทันที</div>
</div>`
      },
      {
        id: 25,
        title: "3 พรรคหาเสียง",
        difficulty: 5,
        question: `A, B และ C ลงสมัครเลือกตั้ง และได้คะแนนอันดับ 1 เท่ากันทั้งหมด
เมื่อให้คนลงคะแนนอันดับ 2 ด้วย คะแนนอันดับ 2 ก็ยังเท่ากันอีกทั้ง 3 คน

A จึงเสนอว่าให้ B กับ C แข่งกันก่อน แล้วคนชนะค่อยมาแข่งกับ A แบบ 1 ต่อ 1
B บอกว่าวิธีนี้ <strong>ไม่ยุติธรรม</strong> เพราะ A มีสิทธิ์ชนะมากกว่า

คำกล่าวของ B เป็นจริงแน่หรือ?`,
        answer: "ไม่จริงเสมอไป",
        explanation: `<strong>ข้อมูลที่ให้มายังไม่พอจะสรุปว่า A ได้เปรียบแน่</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>ผลอันดับ 1 และอันดับ 2 ที่เท่ากัน ไม่ได้บอกความสัมพันธ์แบบตัวต่อตัวครบทุกคู่</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>จึงมีได้ทั้งกรณีที่ A ได้เปรียบ กรณีที่ไม่ต่างกัน หรือกรณีที่ลำดับการแข่งเปลี่ยนผู้ชนะ → สรุปว่า B <strong>ไม่ได้ถูกแน่ ๆ</strong></div>
</div>`
      },
      {
        id: 26,
        title: "เกาะคนซื่อตรงกับคนโกหก",
        difficulty: 5,
        question: `เกาะแห่งหนึ่งมีคน 4 ประเภท:
<ul>
  <li>คนซื่อตรงเสมอ</li>
  <li>คนซื่อตรงปนหลอกลวง</li>
  <li>คนโกหกเสมอ</li>
  <li>คนโกหกที่รักความถูกต้อง</li>
</ul>

มีคดีขโมยกินพุดดิ้ง และรู้แน่ว่ามีคนร้ายเพียงคนเดียว

A พูดว่า: "ฉันบริสุทธิ์" / "B เป็นคนร้าย" / "B เป็นคนซื่อตรง"<br>
B พูดว่า: "ฉันบริสุทธิ์" / "A เป็นคนร้าย" / "C เป็นคนละประเภทกับฉัน"<br>
C พูดว่า: "ฉันบริสุทธิ์" / "A เป็นคนร้าย"

ใครเป็นคนกินพุดดิ้ง?`,
        answer: "ข้อมูลชุดนี้ขัดกัน จึงสรุปตัวคนร้ายแบบตรงไปตรงมาไม่ได้",
        explanation: `<strong>โจทย์ข้อนี้เป็นการเช็กว่าเรากล้าหยุดเมื่อข้อมูลไม่สอดคล้องหรือไม่</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>ลองสมมติทีละคนเป็นคนร้าย จะเกิดความขัดแย้งกับประโยค "ฉันบริสุทธิ์" และข้อกล่าวหากันเองแทบทุกกรณี</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ดังนั้นบทเรียนของข้อนี้ไม่ใช่รีบเดาคำตอบ แต่คือการเห็นว่า <strong>ข้อมูลที่ให้ยังไม่พอหรือขัดกันเอง</strong></div>
</div>`
      }
    ]
  },
  {
    id: 3,
    label: {
      th: "บทที่ 3",
      en: "Chapter 3"
    },
    title: {
      th: "บทที่ 3: การคิดนอกกรอบ",
      en: "Chapter 3: Thinking Outside the Box"
    },
    description: {
      th: "การคิดนอกกรอบ ใช้มุมมองที่ไม่ตรงไปตรงมาเพื่อหาทางออกของโจทย์",
      en: "Use unconventional angles to reach solutions that are easy to miss."
    },
    questions: [
      {
        id: 27,
        title: "หมีสีอะไร",
        difficulty: 1,
        question: `นักวิชาการคนหนึ่งตั้งเต็นท์อยู่ที่จุดหนึ่ง แล้วมีหมีโผล่มา

เขาวิ่งหนีไปทาง <strong>ทิศใต้ 10 กิโลเมตร</strong> จากนั้นไปทาง <strong>ทิศตะวันออก 10 กิโลเมตร</strong> และปิดท้ายด้วยวิ่ง <strong>ทิศเหนือ 10 กิโลเมตร</strong>

สุดท้ายเขากลับมาถึงเต็นท์เดิมพอดี

แล้วหมีตัวนั้นสีอะไร?`,
        answer: "หมีขั้วโลกสีขาว",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>เส้นทางแบบนี้เกิดขึ้นได้ชัดที่สุดที่ <strong>ขั้วโลกเหนือ</strong> เพราะเดินใต้ 10 กม. แล้ววนรอบโลกบางช่วงก่อนกลับเหนือ 10 กม. มาจุดเดิมได้</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>หมีที่อยู่แถบนั้นคือ <strong>หมีขั้วโลก</strong> จึงมีสี <strong>ขาว</strong></div>
</div>`
      },
      {
        id: 28,
        title: "รูป 2 ดอก",
        difficulty: 1,
        question: `มีเชือก 2 เส้น แต่ละเส้นใช้เวลาไหม้หมด <strong>1 ชั่วโมงพอดี</strong>

ปัญหาคือเชือกไหม้ไม่สม่ำเสมอ บางส่วนไหม้เร็ว บางส่วนไหม้ช้า

ถ้าจะใช้เชือก 2 เส้นนี้จับเวลา <strong>45 นาที</strong> ควรทำอย่างไร?`,
        answer: "จุดเชือกเส้นแรกทั้งสองด้าน และจุดเชือกเส้นที่สองด้านเดียว พอเส้นแรกหมดให้จุดอีกด้านของเส้นที่สอง",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>จุดเชือกเส้นแรก <strong>ทั้งสองด้าน</strong> มันจะหมดใน <strong>30 นาที</strong> แม้จะไหม้ไม่สม่ำเสมอ</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>พร้อมกันนั้นจุดเชือกเส้นที่สอง <strong>ด้านเดียว</strong> ไว้ก่อน พอครบ 30 นาทีให้จุด <strong>อีกด้าน</strong> ของเส้นที่สอง มันจึงใช้เวลาอีก <strong>15 นาที</strong> รวมเป็น 45 นาที</div>
</div>`
      },
      {
        id: 29,
        title: "เรือ 4 ลำ",
        difficulty: 1,
        question: `มีเรือ 4 ลำ ต้องข้ามไปอีกฝั่ง โดยใช้เวลาเรือละ <strong>1, 2, 4 และ 8 นาที</strong>

แต่ละครั้งให้ข้ามได้ไม่เกิน 2 ลำ และถ้าไปด้วยกันจะใช้เวลาตามลำที่ช้ากว่า

ถ้าจะพาทั้งหมดข้ามให้เร็วที่สุด ต้องใช้เวลากี่นาที?`,
        answer: "15 นาที",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ให้ลำเร็วสุด 1 และ 2 ช่วยพา: <strong>1+2 ไป (2)</strong>, <strong>1 กลับ (1)</strong>, <strong>4+8 ไป (8)</strong>, <strong>2 กลับ (2)</strong>, <strong>1+2 ไป (2)</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>รวมเวลา = <strong>2 + 1 + 8 + 2 + 2 = 15 นาที</strong></div>
</div>`
      },
      {
        id: 30,
        title: "แข่งม้าอืดอาด",
        difficulty: 2,
        question: `พระราชาบอกคนขี่ม้า 2 คนว่า
<em>"ผู้ชนะจะได้รางวัล แต่รางวัลจะให้กับ <strong>เจ้าของม้าที่แพ้</strong>"</em>

ทั้งสองจึงขี่ช้ามาก เพราะไม่อยากให้ม้าของตัวเองแพ้

ต่อมานักปราชญ์มาบอกอะไรบางอย่าง ทั้งสองจึงรีบควบม้าเต็มที่

นักปราชญ์บอกอะไร?`,
        answer: "ให้สลับม้ากันขี่",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าคุณขี่ <strong>ม้าของอีกฝ่าย</strong> แล้วทำให้ม้านั้นแพ้ เจ้าของม้าที่แพ้ก็คือคุณเอง</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ดังนั้นหลังสลับม้า แต่ละคนจึงอยาก <strong>ขี่ให้เร็วที่สุด</strong> เพื่อให้ม้าที่ตัวเองเป็นเจ้าของชนะ</div>
</div>`
      },
      {
        id: 31,
        title: "ข้ามทะเลทราย",
        difficulty: 2,
        question: `คุณต้องข้ามทะเลทราย ใช้เวลาเดินทางทั้งหมด <strong>6 วัน</strong>

คุณจ้างลูกหาบได้ และแต่ละคนรวมทั้งตัวคุณเอง พกเสบียงได้สูงสุด <strong>4 วัน</strong>

ต้องการให้ไม่มีใครเสียสละกลางทาง ควรจ้างลูกหาบอย่างน้อยกี่คน?`,
        answer: "2 คน",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้ามีลูกหาบ 2 คน ทุกคนเริ่มด้วยเสบียง 4 วัน รวมเป็น 12 วัน-คน</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ลูกหาบคนแรกเดินไป 1 วันแล้วฝากเสบียงส่วนเกินไว้ก่อนกลับ ส่วนลูกหาบคนที่สองเดินต่ออีก 1 วันแล้วกลับ เหลือเสบียงพอให้คุณไปต่อครบ 6 วันพอดี</div>
</div>`
      },
      {
        id: 32,
        title: "ตาชั่งกับเหรียญทอง 9 เหรียญ",
        difficulty: 3,
        question: `มีเหรียญทอง 9 เหรียญ หน้าตาเหมือนกันหมด แต่มีอยู่ 1 เหรียญที่ <strong>เบากว่า</strong> เหรียญอื่น

คุณมีตาชั่ง และใช้ชั่งได้ไม่เกิน <strong>2 ครั้ง</strong>

จะหาเหรียญที่เบาได้อย่างไร?`,
        answer: "แบ่งเป็น 3 กอง กองละ 3 แล้วชั่งกองต่อกอง",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>แบ่งเป็น 3 กอง กองละ 3 เหรียญ ชั่งกองที่ 1 กับกองที่ 2 ถ้าเท่ากันเหรียญเบาอยู่กองที่ 3 ถ้าไม่เท่ากันอยู่กองที่เบากว่า</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>นำ 3 เหรียญในกองต้องสงสัยมาเลือกชั่ง 1 ต่อ 1 อีกครั้ง ถ้าเท่ากัน เหรียญที่เหลือคือของปลอม ถ้าไม่เท่ากัน ฝั่งเบาคือคำตอบ</div>
</div>`
      },
      {
        id: 33,
        title: "ธนบัตร 26 ใบ",
        difficulty: 3,
        question: `ในกระเป๋ามีธนบัตร 26 ใบ

ไม่ว่าคุณจะหยิบออกมา 20 ใบไหนก็ตาม จะต้องมี
<ul>
  <li>ธนบัตร 1,000 เยน อย่างน้อย 1 ใบ</li>
  <li>ธนบัตร 2,000 เยน อย่างน้อย 2 ใบ</li>
  <li>ธนบัตร 5,000 เยน อย่างน้อย 5 ใบ</li>
</ul>

จำนวนเงินทั้งหมดในกระเป๋าคือเท่าไร?`,
        answer: "78,000 เยน",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าสุ่มทิ้งได้ 6 ใบแล้ว <strong>ยังต้องเหลือ</strong> 1 ใบ 2 ใบ 5 ใบตามลำดับ แปลว่าทั้งกระเป๋าต้องมีอย่างน้อย <strong>7 ใบ, 8 ใบ, 11 ใบ</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>รวมกันได้ 26 ใบพอดี จึงเป็น 1,000 เยน 7 ใบ + 2,000 เยน 8 ใบ + 5,000 เยน 11 ใบ = <strong>78,000 เยน</strong></div>
</div>`
      },
      {
        id: 34,
        title: "สับเปลี่ยนหมากสีขาวกับสีดำ",
        difficulty: 3,
        question: `ในกล่องมีหมากสีขาว 20 เม็ด และสีดำ 13 เม็ด

กติกา:
<ul>
  <li>ถ้าหยิบ 2 เม็ดแล้ว <strong>สีเดียวกัน</strong> → ใส่หมากสีขาวกลับ 1 เม็ด</li>
  <li>ถ้าหยิบ 2 เม็ดแล้ว <strong>คนละสี</strong> → ใส่หมากสีดำกลับ 1 เม็ด</li>
</ul>

ทำซ้ำไปเรื่อย ๆ จนเหลือ 1 เม็ด

หมากเม็ดสุดท้ายจะเป็นสีอะไร?`,
        answer: "สีดำ",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>สังเกตว่า <strong>จำนวนหมากสีดำมี parity คงเดิม</strong> คือยังคงเป็นคี่อยู่เสมอ</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เริ่มต้นมีสีดำ 13 เม็ด ซึ่งเป็นจำนวนคี่ สุดท้ายจึงต้องเหลือหมากสีดำ 1 เม็ด</div>
</div>`
      },
      {
        id: 35,
        title: "วัว 17 ตัว",
        difficulty: 3,
        question: `มีวัว 17 ตัว จะถูกแบ่งให้ A, B, C ตามสัดส่วน
<ul>
  <li>A ได้ 1/2</li>
  <li>B ได้ 1/3</li>
  <li>C ได้ 1/9</li>
</ul>

17 ดูแบ่งไม่ลงตัว แต่มีคนผ่านมาช่วยแบ่งได้พอดี

เขาทำอย่างไร?`,
        answer: "ยืมวัวมาเพิ่ม 1 ตัวให้เป็น 18 แล้วแบ่ง ก่อนเอาตัวที่ยืมคืน",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>เพิ่มวัวอีก 1 ตัวชั่วคราว จะกลายเป็น <strong>18 ตัว</strong> ซึ่งแบ่งได้ลงตัวเป็น 9, 6 และ 2</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>9 + 6 + 2 = 17 พอดี จึงเหลือวัวที่ยืมมา 1 ตัวให้คืนเจ้าของเดิมได้</div>
</div>`
      },
      {
        id: 36,
        title: "10 เหรียญ",
        difficulty: 4,
        question: `บนโต๊ะมีเหรียญจำนวนมาก คุณถูกปิดตา

รู้เพียงว่าในทั้งหมดมีเหรียญที่หงายหัวอยู่ <strong>10 เหรียญ</strong> ส่วนที่เหลือเป็นก้อย

คุณต้องแบ่งเหรียญออกเป็น 2 กอง โดยให้จำนวนเหรียญที่หงายหัวในทั้งสองกอง <strong>เท่ากัน</strong>

ควรทำอย่างไร?`,
        answer: "หยิบเหรียญมา 10 เหรียญเป็นกองหนึ่ง แล้วพลิกทั้ง 10 เหรียญนั้น",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>สมมติในกอง 10 เหรียญที่หยิบมามีหัวอยู่ x เหรียญ แปลว่าอีกกองต้องมีหัวอยู่ 10−x เหรียญ</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เมื่อพลิกกอง 10 เหรียญนั้น จำนวนหัวในกองนี้จะกลายเป็น <strong>10−x</strong> เท่ากับอีกกองพอดี</div>
</div>`
      },
      {
        id: 37,
        title: "กองไหนเหรียญปลอม",
        difficulty: 5,
        question: `มีเหรียญ 10 กอง กองละ 10 เหรียญ

เหรียญจริงหนัก 1 กรัม
มีอยู่ 1 กองที่เป็นเหรียญปลอมทั้งหมด และเหรียญปลอมหนักกว่าเหรียญจริง 1 กรัม

คุณมีเครื่องชั่งดิจิทัล

ถ้าจะชั่งให้น้อยที่สุด ต้องชั่งกี่ครั้ง และทำอย่างไร?`,
        answer: "ชั่งครั้งเดียว โดยหยิบ 1,2,3,...,10 เหรียญจากแต่ละกองตามลำดับ",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>หยิบจากกองที่ 1 จำนวน 1 เหรียญ กองที่ 2 จำนวน 2 เหรียญ ... ไปจนกองที่ 10 จำนวน 10 เหรียญ แล้วชั่งรวม</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ถ้าทุกเหรียญจริง น้ำหนักควรเป็น 55 กรัม ส่วนเกินมากี่กรัมก็บอกได้ทันทีว่ากองปลอมคือกองหมายเลขนั้น</div>
</div>`
      },
      {
        id: 38,
        title: "ส่งกุญแจไปปรษณีย์",
        difficulty: 5,
        question: `คุณต้องส่งกุญแจให้ลูกค้าอย่างปลอดภัย

ถ้าส่งกล่องแบบไม่ล็อก อาจถูกขโมย
ถ้าล็อกด้วยแม่กุญแจ ลูกค้าก็ไม่มีลูกกุญแจ
และห้ามส่งลูกกุญแจไปพร้อมกล่องที่ล็อก

จะทำอย่างไรให้ลูกค้าเปิดกล่องได้อย่างปลอดภัย?`,
        answer: "ใช้แม่กุญแจ 2 ชั้น: คุณล็อกก่อน ลูกค้าเติมกุญแจของเขา แล้วคุณปลดของคุณออก",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>คุณใส่กุญแจในกล่อง แล้ว <strong>ล็อกด้วยแม่กุญแจของคุณ</strong> ส่งไปให้ลูกค้า</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ลูกค้าได้รับแล้วใส่ <strong>แม่กุญแจของเขาเพิ่ม</strong> แล้วส่งกลับมา คุณปลดแม่กุญแจของคุณออก แล้วส่งกลับไปอีกครั้ง ตอนนั้นเหลือแต่แม่กุญแจของลูกค้า เขาจึงเปิดได้</div>
</div>`
      },
      {
        id: 39,
        title: "นับคะแนนเลือกตั้ง",
        difficulty: 5,
        question: `คุณได้รับหน้าที่นับคะแนนเลือกตั้ง

เมื่อรู้แล้วว่าใครได้คะแนนมากที่สุด คุณต้องประกาศผู้ชนะ
แต่เครื่องนับคะแนนที่ถืออยู่ทำได้แค่ <strong>เพิ่มหรือลดตัวเลขทีละหนึ่ง</strong>
และกฎคือ <strong>ห้ามเรียกชื่อผู้สมัครแต่ละคนโดยตรง</strong>

จะทำอย่างไรดี?`,
        answer: "กำหนดหมายเลขหรือสัญลักษณ์แทนผู้สมัคร แล้วประกาศด้วยรหัสนั้น",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>จุดหลอกของโจทย์คือทำให้คิดว่าต้องพูดชื่อจริง ทั้งที่ห้ามเรียกชื่อผู้สมัครโดยตรงเท่านั้น</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>จึงสามารถ <strong>กำหนดหมายเลข/รหัส</strong> ให้ผู้สมัครแต่ละคน แล้วประกาศว่า "ผู้ชนะคือหมายเลข ..."</div>
</div>`
      }
    ]
  },
  {
    id: 4,
    label: {
      th: "บทที่ 4",
      en: "Chapter 4"
    },
    title: {
      th: "บทที่ 4: คิดจากภาพรวม",
      en: "Chapter 4: See the Whole System"
    },
    description: {
      th: "คิดจากภาพรวม มองทั้งระบบก่อนตัดสินใจ ไม่หลงกับข้อมูลเฉพาะจุด",
      en: "Look at the whole system before deciding instead of getting trapped by one local clue."
    },
    questions: [
      {
        id: 40,
        title: "ผลไม้ 3 กล่อง",
        difficulty: 1,
        question: `มีกล่อง 3 ใบ ป้ายทุกใบติด <strong>ผิดทั้งหมด</strong>

ป้ายคือ:
<ul>
  <li>กล่องใส่แอปเปิล</li>
  <li>กล่องใส่ส้ม</li>
  <li>กล่องที่สุ่มใส่อย่างใดอย่างหนึ่ง</li>
</ul>

ถ้าจะระบุให้ได้ว่าทั้ง 3 กล่องใส่อะไร โดยเปิดให้น้อยที่สุด ต้องเปิดกี่กล่อง?`,
        answer: "เปิด 1 กล่อง",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>เปิดกล่องที่ป้ายว่า <strong>สุ่ม</strong> เพราะมันต้องไม่ใช่สุ่มแน่ เนื่องจากป้ายผิดทั้งหมด</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เมื่อรู้ของในกล่องนี้แล้ว จะไล่จับคู่ป้ายที่เหลือได้หมดทันที จึงเปิดแค่ <strong>1 กล่อง</strong> ก็พอ</div>
</div>`
      },
      {
        id: 41,
        title: "ทายอายุ 72",
        difficulty: 2,
        question: `เพื่อนร่วมงานมีลูกสาว 3 คน

ข้อมูลที่ได้:
<ul>
  <li>ผลคูณอายุ = 72</li>
  <li>ถ้าบอกผลบวกอายุแล้ว ก็ยังไม่รู้</li>
  <li>มีลูกคนโตเพียงคนเดียว</li>
</ul>

ลูกสาวทั้ง 3 คนอายุเท่าไร?`,
        answer: "3, 3 และ 8 ปี",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ชุดจำนวนเต็มบวกที่คูณกันได้ 72 และผลบวกซ้ำกันมีคู่สำคัญคือ <strong>2,6,6</strong> กับ <strong>3,3,8</strong> ซึ่งบวกได้ 14 เท่ากัน</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เงื่อนไขว่า <strong>มีลูกคนโตเพียงคนเดียว</strong> ตัดชุด 2,6,6 ทิ้ง เพราะมีคนโต 2 คน จึงเหลือ <strong>3,3,8</strong></div>
</div>`
      },
      {
        id: 42,
        title: "ตรวจงานพลาดก่อนพิมพ์",
        difficulty: 3,
        question: `บรรณาธิการ 2 คน A และ B ตรวจหนังสือเล่มเดียวกัน
<ul>
  <li>A เจอจุดผิด 75 จุด</li>
  <li>B เจอจุดผิด 60 จุด</li>
  <li>มีจุดที่ทั้งคู่เจอเหมือนกัน 50 จุด</li>
</ul>

หนังสือเล่มนี้มีจุดผิดทั้งหมดกี่จุด?`,
        answer: "85 จุด",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ใช้หลัก union: จำนวนทั้งหมด = ของ A + ของ B − ที่ซ้ำกัน</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>จึงได้ <strong>75 + 60 − 50 = 85</strong></div>
</div>`
      },
      {
        id: 43,
        title: "ร้านอาหารต่างแดน",
        difficulty: 4,
        question: `นักท่องเที่ยวญี่ปุ่น 5 คน ไปกินร้านอาหารต่างประเทศ
<ul>
  <li>มีเมนู 9 รายการ อ่านไม่ออก</li>
  <li>ไปได้แค่ 3 ครั้ง</li>
  <li>แต่ละครั้งสั่งได้คนละ 1 เมนู</li>
  <li>ทุกคนต้องไม่ซ้ำเมนูเดิมของตัวเอง</li>
  <li>และต้องลองครบทั้ง 9 เมนู</li>
</ul>

จะทำอย่างไรให้รู้ว่าอาหารแต่ละจานคืออะไร?`,
        answer: "ใช้ Controlled Repetition + Cross Mapping โดยวางเมนู 3 รอบเป็น 1-5, 6-9+1, และ 2-6",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>ครั้งที่ 1</strong> ให้ A-E สั่งเมนู <strong>1,2,3,4,5</strong> เพื่อเก็บข้อมูลชุดแรกให้ครบ 5 รายการ</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>ครั้งที่ 2</strong> ให้ A-D สั่ง <strong>6,7,8,9</strong> และให้ E สั่ง <strong>1</strong> ซ้ำ เพื่อสร้างจุดเชื่อมว่าเมนู 1 ในสองรอบคือจานเดียวกัน</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>ครั้งที่ 3</strong> ให้ A-E สั่ง <strong>2,3,4,5,6</strong> ตามลำดับ เพื่อให้เมนูที่เคยมีคนอื่นสั่งถูก cross-check อีกครั้ง จึง map ได้ครบว่า <strong>เมนูเลขไหน = อาหารอะไร</strong></div>
</div>`
      },
      {
        id: 44,
        title: "ไพ่ 2 ใบ",
        difficulty: 4,
        question: `มีเพื่อน 3 คน:
<ul>
  <li>คนหนึ่งพูดจริงเสมอ</li>
  <li>คนหนึ่งโกหกเสมอ</li>
  <li>อีกคนพูดสลับ</li>
</ul>

คุณหยิบไพ่ 2 ครั้ง

ครั้งที่ 1:
A = น้ำเงิน / B = น้ำเงิน / C = แดง

ครั้งที่ 2:
A = แดง / B = น้ำเงิน / C = น้ำเงิน

ไพ่ที่คุณหยิบคือสีอะไรบ้าง?`,
        answer: "แดง, แดง",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>เริ่มจาก B ก่อน</strong> เพราะ B ตอบเหมือนเดิมทั้ง 2 ครั้งว่า "น้ำเงิน" จึงเป็นได้แค่ <strong>คนพูดจริง</strong> หรือ <strong>คนโกหก</strong> เท่านั้น ไม่ใช่คนพูดสลับ</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>A เปลี่ยนคำตอบ</strong> จากน้ำเงินเป็นแดง จึงเข้ากับบทบาท <strong>คนพูดสลับ</strong> มากที่สุด ทำให้ B กับ C ต้องเป็นคนพูดจริงกับคนโกหกอย่างละ 1 คน</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>ลองสมมติว่า <strong>B = คนพูดจริง</strong><br>
  ครั้งที่ 1 ไพ่จริงจะเป็นน้ำเงิน และ C ที่ตอบแดงจะเป็นคนโกหกได้พอดี<br>
  แต่ครั้งที่ 2 B ตอบน้ำเงินอีกครั้ง จึงบังคับให้ไพ่จริงยังเป็นน้ำเงิน และ C ที่ตอบน้ำเงินจะกลายเป็นพูดจริง ซึ่งขัดกับบทบาทคนโกหก ❌</div>
</div>

<div class="explain-step">
  <span class="step-num">4</span>
  <div>ดังนั้น <strong>B ต้องเป็นคนโกหก</strong> และ C เป็นคนพูดจริง<br>
  เมื่อ B โกหกทั้งสองครั้งที่พูดว่า "น้ำเงิน" ไพ่จริงทั้ง <strong>ครั้งที่ 1</strong> และ <strong>ครั้งที่ 2</strong> จึงต้องเป็น <strong>สีแดง</strong> ทั้งคู่ ✅</div>
</div>`
      },
      {
        id: 45,
        title: "แลกนามบัตรกัน 10 คน",
        difficulty: 5,
        question: `มีคน 10 คนในงาน
<ul>
  <li>มาจาก 4 บริษัท (บริษัทละ 2 คน)</li>
  <li>แลกนามบัตรเฉพาะคนที่ไม่เคยเจอมาก่อน</li>
  <li>หลังงาน ทุกคนตอบจำนวนไม่เท่ากันเลย</li>
</ul>

เพื่อนของคุณแลกนามบัตรกับกี่คน?`,
        answer: "4 คน",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าคนหนึ่งแลกนามบัตรได้ <strong>0 คน</strong> คู่ของเขาต้องแลกได้ <strong>8 คน</strong><br>
  เช่นเดียวกันจะได้คู่ <strong>1 ↔ 7</strong>, <strong>2 ↔ 6</strong>, <strong>3 ↔ 5</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>จำนวนที่เป็นไปได้คือ <strong>0 ถึง 8</strong> รวม 9 ค่า แต่มีคน 10 คน จึงต้องมีค่าหนึ่งซ้ำ และค่าที่จับคู่กับตัวเองได้มีเพียง <strong>4</strong><br>
  ดังนั้นเพื่อนของคุณต้องแลกนามบัตรกับ <strong>4 คน</strong></div>
</div>`
      },
      {
        id: 46,
        title: "สติกเกอร์สีแดงกับสีน้ำเงิน",
        difficulty: 5,
        question: `A, B, C ถูกแปะสติกเกอร์สีแดงหรือน้ำเงินที่หลัง
<ul>
  <li>เห็นของคนอื่น แต่ไม่เห็นของตัวเอง</li>
  <li>ถ้าเห็นสีแดง ต้องยกมือ</li>
  <li>แล้วต้องทายสีตัวเองภายใน 1 นาที</li>
</ul>

ทั้ง 3 คนจะทายสีตัวเองถูกได้อย่างไร?`,
        answer: "ทุกคนใช้การรอเพื่อ deduce โดยจำนวนคนแดงเท่ากับจำนวนรอบที่ต้องรอ",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>กรณีมีคนแดง 1 คน</strong> คนนั้นจะเห็นว่าไม่มีใครอื่นยกมือ จึงรู้ได้ทันทีว่าแดงต้องเป็นตัวเอง</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>กรณีมีคนแดง 2 คน</strong> แต่ละคนจะรอ 1 จังหวะ ถ้าอีกคนไม่ตอบ แปลว่าอีกคนก็เห็นแดงอีกคนหนึ่ง จึงสรุปได้ว่าตัวเองแดง</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>กรณีมีคนแดง 3 คน</strong> ทุกคนจะรอ 2 จังหวะ และเมื่อยังไม่มีใครตอบ ก็สรุปได้ว่าต้องมีแดงครบ 3 คน<br>
  สรุปคือ <strong>จำนวนคนแดง = จำนวนรอบที่ต้องรอ</strong></div>
</div>`
      },
      {
        id: 47,
        title: "แอปเปิลของทั้ง 3 คน",
        difficulty: 5,
        question: `A, B, C ถูกขังแยกห้อง
<ul>
  <li>แต่ละห้องมีแอปเปิล 1–9 ลูก</li>
  <li>จำนวนไม่ซ้ำกัน</li>
  <li>ถ้าคนใดตอบถูกว่าผลรวมทั้ง 3 ห้องเท่าไร จะถูกปล่อย</li>
  <li>แต่ละคนถามได้ 1 คำถาม และได้ยินคำตอบของคนอื่น</li>
</ul>

A ถาม: “ผลรวมเป็นเลขคู่ไหม” → ไม่ใช่
B ถาม: “เป็นจำนวนเฉพาะไหม” → ไม่ใช่
C รู้ว่าห้องตัวเองมี 5 ลูก

C ควรถามอะไร?`,
        answer: "ถามว่า “ผลรวมมากกว่า 12 ใช่ไหม?”",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>จากคำตอบของ A และ B เรารู้ว่าผลรวมเป็น <strong>เลขคี่</strong> และ <strong>ไม่เป็นจำนวนเฉพาะ</strong><br>
  เมื่อ C มี 5 ลูก ค่าผลรวมที่เป็นไปได้จึงถูกบีบเหลือ <strong>{9, 15, 21}</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>คำถามที่ดีต้องแยก 3 ค่านี้ออกจากกันให้มากที่สุด จึงถามว่า <strong>“ผลรวมมากกว่า 12 ใช่ไหม?”</strong><br>
  ถ้าตอบว่าไม่ใช่ → เหลือ 9 ทันที<br>
  ถ้าตอบว่าใช่ → เหลือ {15, 21} และใช้ constraint เดิมประกอบต่อได้</div>
</div>`
      },
      {
        id: 48,
        title: "ห้องล็อกรหัส",
        difficulty: 5,
        question: `A, B, C อยู่คนละห้อง รหัสมี 3 หลัก (000–999)
<ul>
  <li>ผลรวมตัวเลข = 9</li>
  <li>ตัวกลาง ≥ ตัวซ้าย</li>
  <li>A เห็นหลักซ้าย / B เห็นหลักกลาง / C เห็นหลักขวา</li>
</ul>

ตอนแรกไม่มีใครรู้
ต่อมา B รู้ แล้ว C รู้ แล้ว A รู้

รหัสคืออะไร?`,
        answer: "009",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>จากเงื่อนไขว่า <strong>ตอนแรกไม่มีใครรู้</strong> เราตัดกรณีสุดโต่งได้ เช่นถ้า B = 9 จะบังคับให้ A=C=0 ทำให้ B รู้ทันที ดังนั้น B ไม่ใช่ค่าที่ทำให้ deduce ได้ง่ายแบบนั้น</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เมื่อถึงจังหวะที่ <strong>B รู้</strong> ค่า B ต้องเป็นค่าที่ทำให้คู่ (A,C) เหลือได้ชุดเดียว ซึ่งเกิดได้เมื่อ <strong>B = 0</strong> เท่านั้น เพราะ B ≥ A บังคับให้ A = 0 และจึงได้ C = 9</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>หลังจากนั้น C ก็ยืนยันได้ และ A ก็ยืนยันตามได้พอดี จึงสรุปรหัสเป็น <strong>009</strong></div>
</div>`
      },
      {
        id: 49,
        title: "ผู้ต้องสงสัยทั้ง 7",
        difficulty: 5,
        question: `มีผู้ต้องสงสัย 7 คน A–G ในกลุ่มนี้มีทั้งคนซื่อสัตย์และคนโกหก

คุณถามทุกคน 3 คำถาม:
<ol>
  <li>กินเค้กไปหรือเปล่า</li>
  <li>ใน 7 คนนี้มีคนร้ายกี่คน</li>
  <li>ใน 7 คนนี้มีคนซื่อสัตย์กี่คน</li>
</ol>

คำตอบคือ:
A: ใช่, 1, 1
B: ใช่, 3, 3
C: เปล่า, 2, 2
D: เปล่า, 4, 1
E: เปล่า, 3, 3
F: เปล่า, 3, 3
G: ใช่, 2, 2

ใครกันแน่ที่ขโมยกินเค้ก?`,
        answer: "A คนเดียว",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ลองสมมติว่า <strong>มีคนร้าย 1 คน</strong> แล้วตรวจคำตอบข้อที่ 2 ก่อน<br>
  A บอกว่ามีคนร้าย 1 คน ส่วน B บอก 3, C บอก 2, D บอก 4, E/F บอก 3 และ G บอก 2</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ถ้า A เป็นคนซื่อสัตย์ คนอื่นทั้งหมดต้องเป็นคนโกหก ซึ่งทำให้จำนวนคนซื่อสัตย์ = 1 ตรงกับที่ A บอก และประโยคแรกของ A ที่ตอบว่า “ใช่” ก็หมายความว่า <strong>A เป็นคนร้าย</strong></div>
</div>`
      },
      {
        id: 50,
        title: "การแข่งขันแบบพบกันทั้งหมด",
        difficulty: 7,
        question: `ผู้เล่น 8 คนแข่งแบบพบกันหมด
<ul>
  <li>ชนะได้ 1 คะแนน</li>
  <li>แพ้ได้ 0 คะแนน</li>
  <li>เสมอได้ 0.5 คะแนน</li>
</ul>

ผลลัพธ์สุดท้ายคือ:
<ul>
  <li>ทุกคนได้คะแนนต่างกัน</li>
  <li>คะแนนของอันดับ 2 เท่ากับคะแนนรวมของ 4 คนที่ได้อันดับต่ำที่สุด</li>
</ul>

ใครเป็นผู้ชนะในการแข่งระหว่างอันดับ 3 กับอันดับ 7?`,
        answer: "ต้องเป็นอันดับ 3 ที่ชนะ",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>เพราะคะแนนทุกคนต่างกันและอันดับ 2 สูงมากพอจะเท่ากับผลรวม 4 คนท้าย โครงสร้างคะแนนจึงบังคับให้ลำดับบนชนะตรงในการเจอกับลำดับล่างหลายคู่</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>คู่ระหว่างอันดับ 3 กับอันดับ 7 จึงไม่สามารถเป็นผลสวนทางได้ ไม่เช่นนั้นการกระจายคะแนนจะชนกับเงื่อนไขรวมของ 4 คนท้าย</div>
</div>`
      },
      {
        id: 51,
        title: "การแข่งขันกีฬาปริศนา",
        difficulty: 7,
        question: `มีผู้แข่งขัน 3 คน ได้คะแนนตามอันดับ 1, 2, 3 เป็น X, Y, Z ตามลำดับ โดย
<strong>X > Y > Z > 0</strong> และเป็นจำนวนเต็ม

เมื่อแข่งครบทุกประเภท:
<ul>
  <li>A ได้ทั้งหมด 22 คะแนน</li>
  <li>B ได้อันดับ 1 ในพุ่งแหลน และได้ทั้งหมด 9 คะแนน</li>
  <li>C ได้ทั้งหมด 9 คะแนน</li>
</ul>

ใครได้ที่ 2 ในการแข่งขันวิ่ง 100 เมตร?`,
        answer: "C",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>B และ C ได้คะแนนรวมเท่ากันคือ 9 แต่ B มีอันดับ 1 ในพุ่งแหลนอยู่แล้ว จึงต้องใช้ pattern คะแนนที่ต่างจาก C เพื่อมาถ่วงกัน</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เมื่อจัด distribution ให้สมดุลโดยไม่เสมอกัน จะบีบให้คนที่ได้อันดับ 2 ในวิ่ง 100 เมตรเป็น <strong>C</strong></div>
</div>`
      }
    ]
  },
  {
    id: 5,
    label: {
      th: "บทที่ 5",
      en: "Chapter 5"
    },
    title: {
      th: "บทที่ 5: คิดหลายแง่มุมให้เป็น",
      en: "Chapter 5: Multi-Angle Reasoning"
    },
    description: {
      th: "คิดหลายแง่มุมให้เป็น ผสานตรรกะ มุมมองของคนอื่น และการคาดการณ์ผลลัพธ์เข้าด้วยกัน",
      en: "Blend logic, other people's perspectives, and future outcomes into one line of reasoning."
    },
    questions: [
      {
        id: 52,
        title: "เปื้อนโคลน 2 คน",
        difficulty: 1,
        question: `คุณกับพี่ชายเห็นหน้ากันแต่ไม่เห็นหน้าตัวเอง พ่อบอกว่า <strong>มีอย่างน้อยหนึ่งคนที่มีโคลน</strong>

พ่อพูดครั้งแรกให้คนที่มีโคลนยกมือ แต่ไม่มีใครยก
พ่อพูดซ้ำอีกครั้ง

คุณควรทำอย่างไร?`,
        answer: "ยกมือขึ้น",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าคุณหน้าสะอาด และเห็นโคลนบนหน้าพี่ชายเพียงคนเดียว พี่ชายควรยกมือตั้งแต่ครั้งแรก</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เมื่อเขาไม่ยกมือ คุณจึงอนุมานได้ว่าหน้าคุณก็มีโคลนเหมือนกัน ดังนั้นเมื่อพ่อพูดครั้งที่สอง คุณต้อง <strong>ยกมือ</strong></div>
</div>`
      },
      {
        id: 53,
        title: "ผมกระเซิง 3 คน",
        difficulty: 2,
        question: `คุณกับพี่ชายและพี่สาวนั่งบนรถไฟ ลมพัดเข้ามาจนผมของพี่ชายกับพี่สาวยุ่ง

คุณหัวเราะเพราะเห็นผมของเขายุ่ง แต่พี่ชายกับพี่สาวก็หัวเราะไม่หยุดเช่นกัน

คุณคิดว่าทั้งสองคงเข้าใจผิดว่าผมของคุณยุ่ง

สรุปแล้วผมของคุณยุ่งหรือไม่?`,
        answer: "ยุ่ง",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าผมคุณไม่ยุ่ง พี่ชายกับพี่สาวที่เห็นกันและกันผมยุ่ง จะรู้ทันทีว่าอีกคนหัวเราะเพราะใคร</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>การที่ทั้งสองยังหัวเราะต่อ แปลว่าต่างคนต่างคิดจากข้อมูลที่เห็นว่าคุณก็คงผมยุ่งด้วย ดังนั้นผมคุณ <strong>ยุ่ง</strong></div>
</div>`
      },
      {
        id: 54,
        title: "หมวกบนบันได",
        difficulty: 2,
        question: `พี่ชาย → คุณ → พี่สาว ยืนเรียงกันบนบันได

แต่ละคนเห็นหมวกของคนข้างหน้า และรู้ว่าใน 3 คนนี้จะมี <strong>2 คนที่ใส่หมวกสีเดียวกัน</strong> (แดงหรือเหลือง)

ตอนแรกไม่มีใครตอบได้

คุณตอบได้ไหมว่าหมวกตัวเองสีอะไร?`,
        answer: "ได้ โดยใช้การที่คนข้างหลังยังตอบไม่ได้เป็นข้อมูล",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าพี่ชายเห็นหมวกคุณกับพี่สาวสีเดียวกัน เขาควรตอบสีของตัวเองได้ทันทีว่าเป็นอีกสีหนึ่ง</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>เมื่อเขายังตอบไม่ได้ คุณจึงรู้ว่าหมวกคุณกับพี่สาว <strong>ต่างสีกัน</strong> และเมื่อคุณเห็นสีของพี่สาวอยู่แล้ว คุณจึงตอบสีของตัวเองได้</div>
</div>`
      },
      {
        id: 55,
        title: "ยิงสู้กัน 3 คน",
        difficulty: 3,
        question: `คุณ, A และ B ยิงปืนฉีดน้ำกันตามลำดับ: คุณ → A → B → ...

ความแม่นยำ:
<ul>
  <li>คุณ = 30%</li>
  <li>A = 50%</li>
  <li>B = 100%</li>
</ul>

ทุกคนเล่นดีที่สุดเพื่อให้ตัวเองชนะ

คุณควรยิงใครก่อนเพื่อให้โอกาสชนะสูงสุด?`,
        answer: "จงใจยิงพลาด",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าคุณยิงโดน A หรือ B จะเหลือคู่ดวลที่เสียเปรียบมาก เพราะอีกคนจะหันมายิงคุณทันที</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>การ <strong>ยิงพลาดโดยตั้งใจ</strong> ทำให้ A กับ B ต้องกำจัดกันเองก่อน คุณจึงมีโอกาสอยู่รอดไปถึงช่วงท้ายมากขึ้น</div>
</div>`
      },
      {
        id: 56,
        title: "บาร์ที่มีแต่คนไม่ชอบอยู่ใกล้คนอื่น",
        difficulty: 3,
        question: `มีเก้าอี้ 25 ตัวเรียงกัน ลูกค้าแต่ละคนจะเลือกที่นั่งที่ <strong>ห่างจากคนอื่นมากที่สุด</strong>

ถ้าบาร์เทนเดอร์เป็นคนกำหนดที่นั่งของลูกค้าคนแรก เขาควรให้นั่งที่ตำแหน่งใดเพื่อให้รับลูกค้าได้มากที่สุด?`,
        answer: "นั่งตรงกลาง",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้าเริ่มที่ปลายหรือใกล้ปลาย จะทำให้การกระจายตัวของคนถัดไปไม่สมดุล และเหลือช่องว่างเสียเปล่ามากกว่า</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ให้นั่ง <strong>ตรงกลาง</strong> จะทำให้การแตกแขนงซ้าย-ขวาสมดุลที่สุด จึงรองรับคนได้มากสุดตามกติกาการเลือกที่นั่ง</div>
</div>`
      },
      {
        id: 57,
        title: "แบ่งเหรียญทอง",
        difficulty: 4,
        question: `A, B, C, D, E จะแบ่งเหรียญทอง 100 เหรียญ โดยผลัดกันเสนอแผน A → B → C → D → E

ถ้าเสียงเห็นด้วย <strong>อย่างน้อยครึ่งหนึ่ง</strong> แผนผ่าน
ถ้าไม่ผ่าน คนเสนอถูกคัดออก และคนถัดไปเสนอใหม่

ทุกคนฉลาดและอยากได้เหรียญมากที่สุด ถ้าได้เท่ากันจะโหวตคัดค้าน

A ควรทำอย่างไรเพื่อให้ตัวเองได้เหรียญมากที่สุด?`,
        answer: "A = 98, C = 1, E = 1",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ไล่ย้อนหลัง: ถ้าเหลือ D,E → D เสนอ <strong>100,0</strong> ผ่าน<br>
  ถ้าเหลือ C,D,E → C ซื้อเสียง E ได้ด้วย <strong>99,0,1</strong><br>
  ถ้าเหลือ B,C,D,E → B ซื้อเสียง D ได้ด้วย <strong>99,0,1,0</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ดังนั้นเมื่อถึง A คนที่ซื้อได้ถูกที่สุดคือ <strong>C และ E</strong> เพราะถ้าแผน A ตก ทั้งสองจะได้ 0 ในรอบถัดไป<br>
  แผนที่ดีที่สุดคือ <strong>A = 98, C = 1, E = 1</strong></div>
</div>`
      },
      {
        id: 58,
        title: "พระราชาจ่ายเงินเดือน",
        difficulty: 4,
        question: `มีประชาชน 66 คนรวมพระราชา งบรวม 66 เหรียญ

ถ้าเงินเดือนเพิ่มจะโหวตเห็นด้วย ลดจะโหวตคัดค้าน เท่าเดิมจะงดออกเสียง
พระราชาไม่มีสิทธิ์โหวต

พระราชาจะกำหนดเงินเดือนใหม่อย่างไรให้ตัวเองได้เงินมากที่สุดแต่ยังผ่านโหวต?`,
        answer: "ทุกคนได้ 1 เหรียญ",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>งบรวมมีแค่ <strong>66 เหรียญ</strong> และมีประชาชน 66 คนรวมพระราชา ถ้าคิด baseline ที่ทุกคนได้เท่ากันจะเป็น <strong>คนละ 1 เหรียญ</strong></div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ถ้าพระราชาเพิ่มเงินให้ตัวเอง ก็ต้องลดของคนอื่น และคนที่ถูกลดจะโหวตคัดค้านทันที จึงดันแผนที่ให้พระราชาได้มากกว่านี้ไม่ผ่าน<br>
  สรุปคำตอบที่ปลอดภัยคือ <strong>ทุกคนได้ 1 เหรียญ</strong></div>
</div>`
      },
      {
        id: 59,
        title: "แสตมป์ 8 ดวง",
        difficulty: 4,
        question: `มีแสตมป์ 8 ดวง: แดง 4 น้ำเงิน 4

สุ่มติดให้ A, B, C คนละ 2 ดวง อีก 2 ดวงอยู่ในกล่อง
ทุกคนไม่เห็นของตัวเอง แต่เห็นของคนอื่น

หลังบทสนทนา:
A: ไม่รู้
B: ไม่รู้
C: ไม่รู้
A: ไม่รู้
B: รู้แล้ว

แสตมป์ 2 ดวงของ B คือสีอะไร?`,
        answer: "แดง 2 ดวง",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ใช้ knowledge cascade: A ไม่รู้ → B ไม่รู้ → C ไม่รู้ → A ยังไม่รู้ ทำให้ตัดกรณีง่าย ๆ ออกไปทีละชั้น</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>กรณีที่เหลืออยู่และทำให้ <strong>B รู้พอดีในรอบที่สอง</strong> จะลงล็อกที่ B ถือ <strong>แดง 2 ดวง</strong></div>
</div>`
      },
      {
        id: 60,
        title: "วันเกิดชาลี",
        difficulty: 4,
        question: `วันเกิดของชาลีเป็นหนึ่งในรายการต่อไปนี้:
<ul>
  <li>14/4/1999</li>
  <li>15/3/2000</li>
  <li>15/2/2001</li>
  <li>16/4/2001</li>
  <li>19/2/2000</li>
  <li>15/4/2000</li>
  <li>15/3/2001</li>
  <li>14/5/2001</li>
  <li>17/5/2001</li>
  <li>14/3/2000</li>
  <li>16/4/2000</li>
  <li>14/4/2001</li>
  <li>16/5/2001</li>
  <li>17/2/2002</li>
</ul>

A รู้เดือน, B รู้วัน, C รู้ปี และมีบทสนทนาตัดความเป็นไปได้กันหลายรอบ

B พูดท้ายว่า "อ๋อ! รู้แล้ว"
A ปิดท้ายว่า "ตอนนี้รู้กันหมดแล้ว"

วันเกิดของชาลีคือวันไหน?`,
        answer: "17/5/2001",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>A บอกว่าเขายังไม่รู้ แต่มั่นใจว่า <strong>B ก็ยังไม่รู้</strong> แปลว่าเดือนที่ A เห็นต้องไม่มีวันที่ unique<br>
  วันที่ <strong>19</strong> มีครั้งเดียว จึงตัด <strong>19/2/2000</strong> ทิ้ง และเมื่อเดือนกุมภาพันธ์มีวัน 19 อยู่ A จึงต้อง <strong>ไม่ใช่กุมภาพันธ์</strong><br>
  ดังนั้นตัด <strong>15/2/2001</strong> และ <strong>17/2/2002</strong> ออกด้วย</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>C บอกว่าเขายังไม่รู้ และคิดว่า A ก็น่าจะยังไม่รู้ แปลว่าปีที่ C เห็นต้องไม่ทำให้เหลือ candidate เดียวทันที<br>
  ปี <strong>1999</strong> มีแค่ <strong>14/4/1999</strong> ตัวเดียว จึงถูกตัดออก</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>เมื่อ B พูดว่า “ตอนนี้รู้แล้ว” วันเกิดต้องเป็นวันที่ที่เหลืออยู่แบบ unique หลังการตัดก่อนหน้า<br>
  วัน <strong>17</strong> เหลือเพียง <strong>17/5/2001</strong> เท่านั้น จึงทำให้ B รู้ และ A ก็ยืนยันได้ตามมา</div>
</div>`
      },
      {
        id: 61,
        title: "เกาะมังกร",
        difficulty: 5,
        question: `มีมังกรตาสีน้ำเงิน 100 ตัว ไม่มีใครรู้สีตาตัวเอง แต่ทุกตัวเห็นว่าคนอื่นตาสีน้ำเงิน

คุณพูดว่า <strong>"ในจำนวนนี้มีมังกรอย่างน้อย 1 ตัวที่ตาสีน้ำเงิน"</strong>

แล้วจะเกิดอะไรขึ้น?`,
        answer: "คืนวันที่ 100 มังกรตาสีน้ำเงินทั้งหมดจะออกจากเกาะพร้อมกัน",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>กรณี 1 ตัว จะออกคืนแรก กรณี 2 ตัว จะออกคืนที่สอง และต่อไปเรื่อย ๆ เป็น induction</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>ดังนั้นถ้ามี 100 ตัว ทุกตัวจะรอครบ <strong>99 คืน</strong> โดยไม่เห็นใครออก แล้วสรุปใน <strong>คืนที่ 100</strong> ว่าตัวเองก็ตาสีน้ำเงินเช่นกัน</div>
</div>`
      },
      {
        id: 62,
        title: "เดาตัวเลขที่เป็นไปไม่ได้",
        difficulty: 5,
        question: `A กับ B ได้ตัวเลข 2 ตัวที่เรียงติดกันเป็นจำนวนเต็มบวก ต่างฝ่ายไม่รู้เลขของอีกฝ่าย

ทุก ๆ 1 นาทีจะต้องเลือกพูดว่า
"เดาตัวเลขของอีกฝ่าย" หรือ "นิ่งเงียบ"

ถ้าจะใช้กลยุทธ์ที่ทำให้เดาได้แน่นอน กลยุทธ์นั้นควรอิงกับตัวเลข <strong>ข้างมาก</strong> หรือ <strong>ข้างน้อย</strong>?`,
        answer: "อิงกับตัวเลขข้างน้อย",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>การอนุมานแบบนี้เริ่มจากฐานล่างสุดได้ เช่น ถ้าเห็น 1 ก็รู้ว่าอีกฝ่ายต้องเป็น 2 ทันที</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>จากนั้น reasoning จะไต่ขึ้นไปทีละขั้นเหมือน induction จึงต้องอิงกับ <strong>ตัวเลขข้างน้อย</strong></div>
</div>`
      },
      {
        id: 63,
        title: "คุกกี้ 1,000 ชิ้น",
        difficulty: 7,
        question: `A, B และ C ผลัดกันหยิบคุกกี้จากถาด 1,000 ชิ้น

แต่ละคนอยากได้เยอะ แต่ไม่อยากได้มากที่สุด น้อยที่สุด หรือเท่ากับคนอื่น
ถ้าทำตามนั้นไม่ได้ จะหันไป maximize จำนวนที่ตัวเองได้แทน

A ควรเริ่มหยิบอย่างไรเพื่อให้ตัวเองชนะ?`,
        answer: "A ควรหยิบ 1 ชิ้น",
        explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>ถ้า A หยิบมากเกินไปตั้งแต่ต้น จะเสี่ยงกลายเป็นคนที่ได้ <strong>มากที่สุด</strong> ซึ่งผิดเป้าหมายหลักของเกมทันที</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>การเริ่มด้วย <strong>1 ชิ้น</strong> ทำให้ A ยืดหยุ่นที่สุดและเปิดทางให้โครงแบ่งช่วงท้ายไม่ล็อกตัวเองเป็นมากสุด/น้อยสุดเร็วเกินไป จึงเป็นจุดเริ่มต้นที่ดีที่สุด</div>
</div>`
      }
    ]
  }
];

const QUESTION_CHOICES = {
  1: {
    choices: [
      "😇 A = เทวดา, 🧑 B = มนุษย์, 😈 C = ปีศาจ",
      "😈 A = ปีศาจ, 😇 B = เทวดา, 🧑 C = มนุษย์",
      "🧑 A = มนุษย์, 😈 B = ปีศาจ, 😇 C = เทวดา",
      "🧑 A = มนุษย์, 😇 B = เทวดา, 😈 C = ปีศาจ"
    ],
    choicesI18n: {
      en: [
        "😇 A = Angel, 🧑 B = Human, 😈 C = Demon",
        "😈 A = Demon, 😇 B = Angel, 🧑 C = Human",
        "🧑 A = Human, 😈 B = Demon, 😇 C = Angel",
        "🧑 A = Human, 😇 B = Angel, 😈 C = Demon"
      ]
    },
    correctChoice: 2
  },
  2: {
    choices: [
      "🌶 คุณพริกไทยถือ พริกไทย",
      "🧂 คุณพริกไทยถือ เกลือ",
      "🍚 คุณพริกไทยถือ น้ำตาล",
      "🤷 ข้อมูลยังไม่พอ สรุปไม่ได้"
    ],
    choicesI18n: {
      en: [
        "🌶 Mr. Pepper is holding pepper",
        "🧂 Mr. Pepper is holding salt",
        "🍚 Mr. Pepper is holding sugar",
        "🤷 The information is not enough"
      ]
    },
    correctChoice: 1
  },
  3: {
    choices: [
      "🕵️ A คือคนร้าย",
      "🕵️ B คือคนร้าย",
      "🕵️ C คือคนร้าย",
      "😶 ไม่มีใครเป็นคนร้าย"
    ],
    choicesI18n: {
      en: [
        "🕵️ A is the culprit",
        "🕵️ B is the culprit",
        "🕵️ C is the culprit",
        "😶 No one is guilty"
      ]
    },
    correctChoice: 2
  },
  4: {
    choices: [
      "🏆 A ชนะมากกว่า",
      "🏆 B ชนะมากกว่า",
      "🤝 เสมอกันพอดี",
      "🌀 ข้อมูลไม่พอที่จะตัดสิน"
    ],
    choicesI18n: {
      en: [
        "🏆 A won more rounds",
        "🏆 B won more rounds",
        "🤝 They tied exactly",
        "🌀 Not enough information"
      ]
    },
    correctChoice: 0
  },
  5: {
    choices: [
      "📆 วันอังคาร",
      "📆 วันพุธ",
      "☀️ วันอาทิตย์",
      "📆 วันศุกร์"
    ],
    choicesI18n: {
      en: [
        "📆 Tuesday",
        "📆 Wednesday",
        "☀️ Sunday",
        "📆 Friday"
      ]
    },
    correctChoice: 2
  },
  6: {
    choices: [
      "🏢 9 บริษัท",
      "🏢 10 บริษัท",
      "🏢 11 บริษัท",
      "🏢 12 บริษัท"
    ],
    choicesI18n: {
      en: [
        "🏢 9 companies",
        "🏢 10 companies",
        "🏢 11 companies",
        "🏢 12 companies"
      ]
    },
    correctChoice: 2
  },
  7: {
    choices: [
      "🏓 A แพ้รอบที่ 2",
      "🏓 B แพ้รอบที่ 2",
      "🏓 C แพ้รอบที่ 2",
      "🤔 สรุปไม่ได้จากข้อมูลนี้"
    ],
    choicesI18n: {
      en: [
        "🏓 A lost game 2",
        "🏓 B lost game 2",
        "🏓 C lost game 2",
        "🤔 Cannot be determined"
      ]
    },
    correctChoice: 0
  },
  8: {
    choices: [
      "↩️ ถามว่า 'ทางไหนไปสวรรค์?' แล้วเดินตรงข้ามคำตอบ",
      "🌤 ถามว่า 'ถ้าฉันถามอีกคนว่าทางนี้ไปสวรรค์ไหม เขาจะตอบว่าใช่ไหม?'",
      "🗣 ถามทั้งสองคนพร้อมกันแล้วเลือกเสียงข้างมาก",
      "😇 ถามว่า 'คุณเป็นเทวดาไหม?' ก่อน"
    ],
    choicesI18n: {
      en: [
        "↩️ Ask which path leads to heaven, then take the opposite one",
        "🌤 Ask: 'If I asked whether this path leads to heaven, would you say yes?'",
        "🗣 Ask both and take the majority answer",
        "😇 First ask: 'Are you the angel?'"
      ]
    },
    correctChoice: 1
  },
  9: {
    choices: [
      "🎩 ทั้ง A และ B พูดสีเดียวกับหมวกที่เห็น",
      "🔄 A พูดสีตรงข้าม, B พูดสีเดียวกับที่เห็น",
      "🎯 A พูดสีเดียวกับที่เห็น, B พูดสีตรงข้าม",
      "🎲 ให้ A เดาสุ่ม แล้ว B พูดตาม A"
    ],
    choicesI18n: {
      en: [
        "🎩 Both A and B say the color they see",
        "🔄 A says the opposite color, B says the seen color",
        "🎯 A says the seen color, B says the opposite color",
        "🎲 Let A guess randomly and B copy A"
      ]
    },
    correctChoice: 2
  },
  10: {
    choices: [
      "👀 ให้ทั้งสามคนเดาสีเดียวกับคนทางซ้าย",
      "🧮 ใช้เลขแทนสี 0,1,2 แล้วให้แต่ละคนเดาผลรวมคนละค่า mod 3",
      "🤐 ให้คนหนึ่งเดาแน่นอน อีกสองคนเงียบ",
      "🎨 ให้ทั้งสามตอบสีที่เห็นเยอะที่สุด"
    ],
    choicesI18n: {
      en: [
        "👀 Everyone says the color of the person on their left",
        "🧮 Encode colors as 0, 1, 2 and assign different mod-3 totals",
        "🤐 Let one person always guess while the other two stay silent",
        "🎨 Everyone says the color they see most often"
      ]
    },
    correctChoice: 1
  },
  11: {
    choices: [
      "📦 1 → 2 → 3 → 4 → 5 → 4",
      "📦 3 → 3 → 3 → 3 → 3 → 3",
      "🐱 2 → 3 → 4 → 4 → 3 → 2",
      "📦 5 → 4 → 3 → 2 → 1 → 2"
    ],
    choicesI18n: {
      en: [
        "📦 1 → 2 → 3 → 4 → 5 → 4",
        "📦 3 → 3 → 3 → 3 → 3 → 3",
        "🐱 2 → 3 → 4 → 4 → 3 → 2",
        "📦 5 → 4 → 3 → 2 → 1 → 2"
      ]
    },
    correctChoice: 2
  },
  12: {
    choices: [
      "🔁 ถามคนเดียวกัน 2 ครั้งว่าซ้ายไปสวรรค์ไหม",
      "🧠 ถามคน 1 เพื่อหา 'มนุษย์' แล้วถามคนที่ไม่ใช่มนุษย์ด้วยคำถามสองชั้น",
      "🗨️ ถามทั้ง 3 คนทีละคำถามตรง ๆ แล้วเลือกคำตอบที่ซ้ำกัน",
      "👥 ถามคนใดก็ได้ว่าอีกสองคนเป็นใครก่อน"
    ],
    choicesI18n: {
      en: [
        "🔁 Ask the same person twice whether the left stair leads to heaven",
        "🧠 Use question 1 to identify the human, then ask a double-layer question to a non-human",
        "🗨️ Ask all three directly and choose the repeated answer",
        "👥 Ask anyone first to identify the other two"
      ]
    },
    correctChoice: 1
  },
  13: {
    choices: [
      "💸 มีคนแอบขโมย 1,000 เยนไปจริง ๆ",
      "➕ ไม่มีเงินหาย แค่บวกเลขผิด",
      "🏨 โรงแรมคิดเงินผิดอีกรอบ",
      "🤷 หาไม่เจอเพราะข้อมูลไม่พอ"
    ],
    correctChoice: 1
  },
  14: {
    choices: [
      "✅ พูดได้แน่",
      "❌ พูดไม่ได้แน่",
      "🤔 ต้องรู้ก่อนว่า B แต่งงานไหม",
      "📭 ข้อมูลไม่พอ"
    ],
    correctChoice: 0
  },
  15: {
    choices: [
      "🏃 คุณชนะ",
      "🤝 เสมอ",
      "🏁 คู่แข่งยังชนะ",
      "🌀 สรุปไม่ได้"
    ],
    correctChoice: 2
  },
  16: {
    choices: [
      "⏱ ไม่เปลี่ยน",
      "📈 นานกว่ากรณีไม่มีลม",
      "⚡ สั้นกว่ากรณีไม่มีลม",
      "🔄 แล้วแต่ความเร็วเครื่องบิน"
    ],
    correctChoice: 1
  },
  17: {
    choices: [
      "⛴ 14 ลำ",
      "⛴ 15 ลำ",
      "⛴ 16 ลำ",
      "⛴ 8 ลำ"
    ],
    correctChoice: 1
  },
  18: {
    choices: [
      "📦 2 ชิ้น",
      "📦 50 ชิ้น",
      "📦 98 ชิ้น",
      "📦 100 ชิ้น"
    ],
    correctChoice: 3
  },
  19: {
    choices: [
      "👦 มากกว่า 👧",
      "👧 มากกว่า 👦",
      "⚖️ ใกล้เคียง 1 : 1",
      "📉 ขึ้นอยู่กับจำนวนครอบครัว"
    ],
    correctChoice: 2
  },
  20: {
    choices: [
      "🅰️ แผน A",
      "🅱️ แผน B",
      "🤝 เท่ากัน",
      "📆 ต้องรู้จำนวนปีที่ทำงานก่อน"
    ],
    correctChoice: 0
  },
  21: {
    choices: [
      "⚪ น่าจะเป็นสีขาวมากกว่า",
      "⚫ น่าจะเป็นสีดำมากกว่า",
      "🎲 โอกาสเท่ากันพอดี",
      "🚫 สรุปอะไรไม่ได้เลย"
    ],
    correctChoice: 0
  },
  22: {
    choices: [
      "1/2",
      "1/3",
      "2/3",
      "3/4"
    ],
    correctChoice: 2
  },
  23: {
    choices: [
      "🏇 6 ครั้ง",
      "🏇 7 ครั้ง",
      "🏇 8 ครั้ง",
      "🏇 9 ครั้ง"
    ],
    correctChoice: 1
  },
  24: {
    choices: [
      "🃏 E และ 2",
      "🃏 E และ 9",
      "🃏 R และ 2",
      "🃏 2 และ 9"
    ],
    correctChoice: 1
  },
  25: {
    choices: [
      "✅ จริงแน่ A ได้เปรียบเสมอ",
      "❌ ไม่จริงเสมอไป",
      "⚖️ ยุติธรรมสมบูรณ์แน่ ๆ",
      "📮 ตัดสินไม่ได้เพราะคะแนนเป็นเลขคี่"
    ],
    correctChoice: 1
  },
  26: {
    choices: [
      "🍮 A เป็นคนกินพุดดิ้ง",
      "🍮 B เป็นคนกินพุดดิ้ง",
      "🍮 C เป็นคนกินพุดดิ้ง",
      "🧩 ข้อมูลยังขัดกัน สรุปตรง ๆ ไม่ได้"
    ],
    correctChoice: 3
  },
  27: {
    choices: [
      "🤎 สีน้ำตาล",
      "⚪ สีขาว",
      "🖤 สีดำ",
      "🩶 สีเทา"
    ],
    correctChoice: 1
  },
  28: {
    choices: [
      "🔥 จุดเชือกทั้ง 2 เส้นด้านเดียวพร้อมกัน",
      "🔥 จุดเชือกเส้นแรกสองด้าน และเส้นที่สองด้านเดียว พอเส้นแรกหมดจุดอีกด้านของเส้นที่สอง",
      "🔥 จุดเชือกเส้นแรกด้านเดียว รอ 30 นาที แล้วจุดเส้นที่สองสองด้าน",
      "🔥 ทำไม่ได้เพราะเชือกไหม้ไม่สม่ำเสมอ"
    ],
    correctChoice: 1
  },
  29: {
    choices: [
      "⛵ 14 นาที",
      "⛵ 15 นาที",
      "⛵ 16 นาที",
      "⛵ 17 นาที"
    ],
    correctChoice: 1
  },
  30: {
    choices: [
      "🐎 ให้ทั้งสองรีบออกตัวพร้อมกัน",
      "🐎 ให้สลับม้ากันขี่",
      "🐎 ให้เปลี่ยนเส้นชัย",
      "🐎 ให้ตัดสินด้วยจับเวลาแทน"
    ],
    correctChoice: 1
  },
  31: {
    choices: [
      "🎒 1 คน",
      "🎒 2 คน",
      "🎒 3 คน",
      "🎒 4 คน"
    ],
    correctChoice: 1
  },
  32: {
    choices: [
      "⚖️ ชั่งทีละเหรียญ 2 ครั้ง",
      "⚖️ แบ่ง 4-4-1 แล้วเดาเอา",
      "⚖️ แบ่ง 3-3-3 แล้วชั่งกองที่เบากว่า จากนั้นชั่งต่อในกองนั้น",
      "⚖️ ทำไม่ได้ใน 2 ครั้ง"
    ],
    correctChoice: 2
  },
  33: {
    choices: [
      "💴 68,000 เยน",
      "💴 73,000 เยน",
      "💴 78,000 เยน",
      "💴 83,000 เยน"
    ],
    correctChoice: 2
  },
  34: {
    choices: [
      "⚪ สีขาว",
      "⚫ สีดำ",
      "🔄 แล้วแต่ลำดับการหยิบ",
      "🎲 โอกาสครึ่งต่อครึ่ง"
    ],
    correctChoice: 1
  },
  35: {
    choices: [
      "🐄 ฆ่าวัว 1 ตัวแล้วแบ่ง",
      "🐄 ยืมวัวมา 1 ตัวให้เป็น 18 แล้วแบ่ง ก่อนคืนวัวที่ยืม",
      "🐄 จับฉลากว่าใครสละส่วน",
      "🐄 แบ่งไม่ได้จริง"
    ],
    correctChoice: 1
  },
  36: {
    choices: [
      "🪙 นับ 10 เหรียญแล้วโยนทิ้ง",
      "🪙 แบ่งครึ่งจำนวนเหรียญทั้งหมด",
      "🪙 หยิบมา 10 เหรียญเป็นกองหนึ่ง แล้วพลิกทั้งกองนั้น",
      "🪙 แบ่งแบบสุ่มสองกองแล้วอธิษฐาน"
    ],
    correctChoice: 2
  },
  37: {
    choices: [
      "🏋️ ต้องชั่ง 2 ครั้ง",
      "🏋️ ต้องชั่ง 3 ครั้ง",
      "🏋️ ชั่งครั้งเดียว โดยหยิบ 1 ถึง 10 เหรียญจากแต่ละกองตามลำดับ",
      "🏋️ ชั่งครั้งเดียว แต่ต้องหยิบเท่ากันทุกกอง"
    ],
    correctChoice: 2
  },
  38: {
    choices: [
      "🔐 ส่งลูกกุญแจตามหลังไปอีกวัน",
      "🔐 ใช้แม่กุญแจ 2 ชั้น โดยลูกค้าเติมกุญแจของเขาแล้วคุณค่อยปลดของคุณออก",
      "🔐 ใส่กุญแจปลอมหลอกโจร",
      "🔐 ทำไม่ได้ถ้าห้ามส่งลูกกุญแจ"
    ],
    correctChoice: 1
  },
  39: {
    choices: [
      "🗳️ ประกาศแค่จำนวนคะแนน ไม่ต้องบอกผู้ชนะ",
      "🗳️ เรียกชื่อผู้ชนะเร็ว ๆ ให้ฟังไม่ออก",
      "🗳️ กำหนดหมายเลขหรือสัญลักษณ์แทนผู้สมัคร แล้วประกาศรหัสของผู้ชนะ",
      "🗳️ ให้ผู้สมัครเดินออกมายืนเอง"
    ],
    correctChoice: 2
  },
  40: {
    choices: [
      "📦 เปิด 1 กล่อง",
      "📦 เปิด 2 กล่อง",
      "📦 เปิด 3 กล่อง",
      "📦 ระบุไม่ได้"
    ],
    correctChoice: 0
  },
  41: {
    choices: [
      "👧 2, 6, 6",
      "👧 3, 3, 8",
      "👧 4, 4, 4",
      "👧 1, 8, 9"
    ],
    correctChoice: 1
  },
  42: {
    choices: [
      "📚 75 จุด",
      "📚 80 จุด",
      "📚 85 จุด",
      "📚 95 จุด"
    ],
    correctChoice: 2
  },
  43: {
    choices: [
      "🍽 รอบ 1: 1-5, รอบ 2: 6-9 และ 1 ซ้ำ, รอบ 3: 2-6 เพื่อ cross-check",
      "🍽 ให้ทุกคนสั่งเมนูเดิมทุกครั้ง",
      "🍽 ต้องไปมากกว่า 3 ครั้งเท่านั้น",
      "🍽 ทำไม่ได้แน่"
    ],
    correctChoice: 0
  },
  44: {
    choices: [
      "🃏 น้ำเงิน, น้ำเงิน",
      "🃏 แดง, น้ำเงิน",
      "🃏 แดง, แดง",
      "🃏 น้ำเงิน, แดง"
    ],
    correctChoice: 2
  },
  45: {
    choices: [
      "💼 4 คน",
      "💼 5 คน",
      "💼 6 คน",
      "💼 8 คน"
    ],
    correctChoice: 0
  },
  46: {
    choices: [
      "🟥 เดาสุ่มจากจำนวนมือที่ยก",
      "🟦 ใช้การรอและ common knowledge โดยจำนวนคนแดงเท่ากับจำนวนรอบที่ต้องรอ",
      "🎲 ดูแค่ใครยกมือมากที่สุด",
      "🚫 ไม่มีทางตอบถูก"
    ],
    correctChoice: 1
  },
  47: {
    choices: [
      "🍎 ถามว่า “ผลรวมเท่ากับ 15 ไหม?”",
      "🍎 ถามว่า “ผลรวมมากกว่า 12 ใช่ไหม?”",
      "🍎 ถามว่า A มีมากกว่า B ไหม",
      "🍎 ถามว่า “ผลรวมเป็นจำนวนคู่ไหม?”"
    ],
    correctChoice: 1
  },
  48: {
    choices: [
      "🔢 009",
      "🔢 234",
      "🔢 333",
      "🔢 522"
    ],
    correctChoice: 0
  },
  49: {
    choices: [
      "🍰 A คนเดียว",
      "🍰 B, E, F",
      "🍰 C และ G",
      "🍰 หาคนร้ายไม่ได้เลย"
    ],
    correctChoice: 0
  },
  50: {
    choices: [
      "🏆 อันดับ 7 ชนะอันดับ 3",
      "🏆 เสมอกัน",
      "🏆 อันดับ 3 ชนะอันดับ 7",
      "🏆 สรุปไม่ได้"
    ],
    correctChoice: 2
  },
  51: {
    choices: [
      "🥈 A ได้ที่ 2",
      "🥈 B ได้ที่ 2",
      "🥈 C ได้ที่ 2",
      "🥈 สรุปไม่ได้"
    ],
    correctChoice: 2
  },
  52: {
    choices: [
      "🙋 ยกมือขึ้นครั้งที่สอง",
      "🙅 ยังไม่ยกมือ",
      "🧼 ไปส่องกระจกก่อน",
      "🤷 สรุปไม่ได้"
    ],
    correctChoice: 0
  },
  53: {
    choices: [
      "💇 ผมคุณไม่ยุ่ง",
      "💇 ผมคุณยุ่ง",
      "💇 ยุ่งแค่บางส่วน",
      "💇 สรุปไม่ได้"
    ],
    correctChoice: 1
  },
  54: {
    choices: [
      "🎩 ตอบไม่ได้",
      "🎩 ได้ โดยใช้การที่คนข้างหลังยังตอบไม่ได้เป็นข้อมูล",
      "🎩 ได้ แต่ต้องเดาสุ่ม",
      "🎩 ได้เฉพาะถ้าหมวกพี่สาวเป็นสีแดง"
    ],
    correctChoice: 1
  },
  55: {
    choices: [
      "🔫 ยิง A ก่อน",
      "🔫 ยิง B ก่อน",
      "🔫 ยิงพลาดโดยตั้งใจ",
      "🔫 รอให้คนอื่นยิงก่อน"
    ],
    correctChoice: 2
  },
  56: {
    choices: [
      "🪑 ตำแหน่ง 1",
      "🪑 ตำแหน่ง 7",
      "🪑 ตำแหน่ง 13 ตรงกลาง",
      "🪑 ตำแหน่ง 25"
    ],
    correctChoice: 2
  },
  57: {
    choices: [
      "🪙 A=98, C=1, E=1",
      "🪙 A=99, D=1",
      "🪙 A=97, B=1, D=1, E=1",
      "🪙 แบ่งเท่า ๆ กัน"
    ],
    correctChoice: 0
  },
  58: {
    choices: [
      "👑 ทุกคนได้ 1 เหรียญ",
      "👑 พระราชาได้ 2 คนอื่นได้ 0 หรือ 1",
      "👑 พระราชาได้เกือบทั้งหมด แล้วซื้อเสียงคนครึ่งหนึ่ง",
      "👑 ทำไม่ได้เพราะพระราชาโหวตไม่ได้"
    ],
    correctChoice: 0
  },
  59: {
    choices: [
      "📮 แดง 2 ดวง",
      "📮 น้ำเงิน 2 ดวง",
      "📮 1 แดง 1 น้ำเงิน",
      "📮 สรุปไม่ได้"
    ],
    correctChoice: 0
  },
  60: {
    choices: [
      "🎂 14/4/2001",
      "🎂 16/5/2001",
      "🎂 17/5/2001",
      "🎂 15/3/2001"
    ],
    correctChoice: 2
  },
  61: {
    choices: [
      "🐉 คืนแรกออกพร้อมกันทั้งหมด",
      "🐉 คืนวันที่ 50 ออกครึ่งหนึ่ง",
      "🐉 คืนวันที่ 100 ออกพร้อมกันทั้งหมด",
      "🐉 ไม่มีอะไรเกิดขึ้น"
    ],
    correctChoice: 2
  },
  62: {
    choices: [
      "🔢 อิงกับตัวเลขข้างมาก",
      "🔢 อิงกับตัวเลขข้างน้อย",
      "🔢 ใช้ได้ทั้งสองแบบพอ ๆ กัน",
      "🔢 ไม่มีกลยุทธ์แน่ชัด"
    ],
    correctChoice: 1
  },
  63: {
    choices: [
      "🍪 ต้องรีบหยิบให้มากที่สุดตั้งแต่ตาแรก",
      "🍪 A ควรหยิบ 1 ชิ้น",
      "🍪 ต้องปล่อยให้ B นำก่อน",
      "🍪 ไม่มีทางชนะได้"
    ],
    correctChoice: 1
  },
  64: {
    choices: [
      "🗒️ 5 เยน",
      "🗒️ 10 เยน",
      "🗒️ 15 เยน",
      "🗒️ 20 เยน"
    ],
    choicesI18n: {
      en: [
        "🗒️ 5 yen",
        "🗒️ 10 yen",
        "🗒️ 15 yen",
        "🗒️ 20 yen"
      ]
    },
    correctChoice: 0
  },
  65: {
    choices: [
      "🍪 1 คน",
      "🍪 2 คน",
      "🍪 4 คน",
      "🍪 25 คน"
    ],
    choicesI18n: {
      en: [
        "🍪 1 person",
        "🍪 2 people",
        "🍪 4 people",
        "🍪 25 people"
      ]
    },
    correctChoice: 2
  },
  66: {
    choices: [
      "🧴 6 นาที",
      "🧴 10 นาที",
      "🧴 11 นาที",
      "🧴 12 นาที"
    ],
    choicesI18n: {
      en: [
        "🧴 6 minutes",
        "🧴 10 minutes",
        "🧴 11 minutes",
        "🧴 12 minutes"
      ]
    },
    correctChoice: 2
  }
};

const QUESTION_TRANSLATIONS = {
  en: {
    1: {
      title: "Three Villagers",
      question: `Three villagers stand before you. One is an <strong>angel</strong>, one is a <strong>demon</strong>, and one is a <strong>human</strong>.

<ul>
  <li>An angel always tells the truth.</li>
  <li>A demon always lies.</li>
  <li>A human may say either truth or falsehood.</li>
</ul>

They say the following:<br>
<strong>A:</strong> "I am not an angel."<br>
<strong>B:</strong> "I am not a demon."<br>
<strong>C:</strong> "I am not a human."<br><br>
Who is who?`,
      answer: "A = Human &nbsp; B = Demon &nbsp; C = Angel",
      explanation: `<strong>Reasoning: test each case carefully</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>A cannot be an angel or a demon.</strong><br>
  • If A were an angel, then “I am not an angel” would be false, which is impossible.<br>
  • If A were a demon, then the statement would have to be false, which would mean A actually is an angel, also impossible.<br>
  Therefore <strong>A must be the human</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>That leaves B and C as angel or demon.</strong><br>
  If C were an angel, “I am not a human” would be true, which fits.<br>
  If C were a demon, then “I am not a human” would have to be false, meaning C would be human, a contradiction.<br>
  So <strong>C is the angel</strong> and <strong>B is the demon</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>Check B: as a demon, saying “I am not a demon” is false, which is exactly right.</div>
</div>`
    },
    2: {
      title: "Three Seasonings",
      question: `Three people are at dinner: <strong>Mr. Salt</strong>, <strong>Mr. Pepper</strong>, and <strong>Mr. Sugar</strong>. Each is holding exactly one seasoning: salt, pepper, or sugar.

Someone notices the scene and comments on it.

The person holding <strong>salt</strong> says:<br>
<em>"No one is holding the seasoning that matches their own name!"</em>

Then <strong>Mr. Sugar</strong> says:<br>
<em>"Please pass me the sugar."</em>

Also, the person who made the first observation was <strong>not holding sugar</strong>.

What is <strong>Mr. Pepper</strong> holding?`,
      answer: "Mr. Pepper is holding the salt.",
      explanation: `<strong>Reasoning: apply the constraints one by one</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>Main rule:</strong> no one holds the seasoning matching their own name.<br>
  Mr. Salt ≠ salt &nbsp; | &nbsp; Mr. Pepper ≠ pepper &nbsp; | &nbsp; Mr. Sugar ≠ sugar</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>The speaker is the one holding <strong>salt</strong>.<br>
  Mr. Salt cannot be holding salt, so he cannot be the speaker.<br>
  Mr. Sugar asks for sugar, so he does not have it.<br>
  The consistent assignment is that <strong>Mr. Pepper is the one holding salt</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>Once that is fixed, the remaining assignments follow:
  Mr. Sugar holds pepper, and Mr. Salt holds sugar.</div>
</div>`
    },
    3: {
      title: "The Single Testimony",
      question: `Someone embezzled money from the company. The suspect must be either A, B, or C.

<strong>A</strong> says: <em>"B is the culprit."</em><br>
(B and C also said something, but we do not know what.)

You are later told:
<ul>
  <li>Exactly one of A, B, and C is guilty.</li>
  <li><strong>Only the culprit tells the truth.</strong> Everyone innocent lies.</li>
</ul>

Who is the culprit?`,
      answer: "C is the culprit.",
      explanation: `<strong>Reasoning: test each possible culprit</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div><strong>If A were guilty</strong>, then A would be telling the truth, so “B is the culprit” would also be true. That would make B guilty too, impossible.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div><strong>If B were guilty</strong>, then A would be innocent and therefore lying. But A says “B is the culprit,” so if A is lying then B cannot be guilty. Contradiction.</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div><strong>If C were guilty</strong>, then A and B are innocent and must lie. That makes A’s statement false, so B is not guilty. Everything is consistent, so <strong>C is the culprit</strong>.</div>
</div>`
    },
    4: {
      title: "Ten Rounds of Rock-Paper-Scissors",
      question: `A and B played rock-paper-scissors 10 times.

<ul>
  <li>A played: rock 3 times, scissors 6 times, paper 1 time</li>
  <li>B played: rock 2 times, scissors 4 times, paper 4 times</li>
</ul>

They <strong>never chose the same symbol in the same round</strong>, so there were no ties.

Neither remembers which symbol was used in which exact round.

Who won more rounds?`,
      answer: "A won more rounds. (A won 7, B won 3.)",
      explanation: `<strong>Reasoning: reconstruct the only possible pairings</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Since there are no ties, every one of A’s 3 rocks must face either scissors or paper, every one of A’s 6 scissors must face rock or paper, and A’s single paper must face rock or scissors.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>B only has 4 scissors total. To avoid ties, A’s 3 rocks already force 3 of those 4 scissors to be used against rock. The remaining 1 scissors must face A’s single paper.</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>That leaves B’s 2 rocks and 4 papers to face A’s 6 scissors:
  A’s scissors beat B’s 4 papers, while B’s 2 rocks beat A’s 2 scissors.
  Totals: A wins 3 + 4 = <strong>7</strong>, B wins 2 + 1 = <strong>3</strong>.</div>
</div>`
    },
    5: {
      title: "The Messy Week",
      question: `A through G are each making a statement about the day of the week, and <strong>exactly one person is telling the truth</strong>.

<ul>
  <li><strong>A:</strong> "The day after tomorrow is Wednesday."</li>
  <li><strong>B:</strong> "No, today is Wednesday."</li>
  <li><strong>C:</strong> "No, tomorrow is Wednesday."</li>
  <li><strong>D:</strong> "Today is not Monday, Tuesday, or Wednesday."</li>
  <li><strong>E:</strong> "Yesterday was Thursday."</li>
  <li><strong>F:</strong> "Tomorrow is Thursday."</li>
  <li><strong>G:</strong> "Yesterday was not Saturday."</li>
</ul>

What day is today?`,
      answer: "Today is Sunday.",
      explanation: `<strong>Reasoning: test which day makes exactly one statement true</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Rewrite each statement:
  A → today is Monday,
  B → today is Wednesday,
  C → today is Tuesday,
  D → today is not Monday, Tuesday, or Wednesday,
  E → today is Friday,
  F → today is Wednesday,
  G → today is not Sunday.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Now test <strong>Sunday</strong>:
  A false, B false, C false, <strong>D true</strong>, E false, F false, G false.
  Exactly one person, D, is telling the truth.</div>
</div>`
    },
    6: {
      title: "How Many Companies?",
      question: `At a competition, each company may send exactly <strong>3 employees</strong>.

You are told:
<ul>
  <li>A is ranked exactly in the middle.</li>
  <li>B is 19 places below A.</li>
  <li>C is ranked 28th.</li>
</ul>

How many companies took part?`,
      answer: "11 companies",
      explanation: `<strong>Reasoning: combine the ranking structure with the group-size constraint</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>If B is 19 places below A, then A cannot be too close to the bottom. Since A is exactly in the middle, the total number of participants must be odd.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Testing the nearby middle positions and requiring the total to be divisible by 3 leaves only <strong>33 participants</strong>, which means <strong>11 companies</strong>.</div>
</div>`
    },
    7: {
      title: "Hot Spring Ping-Pong",
      question: `A, B, and C play ping-pong with this rule:
<ul>
  <li>The winner stays on for the next game.</li>
  <li>The loser rotates out and the waiting player comes in.</li>
</ul>

When they finish, the numbers of games played are:
<ul>
  <li><strong>A</strong>: 10 games</li>
  <li><strong>B</strong>: 15 games</li>
  <li><strong>C</strong>: 17 games</li>
</ul>

Who lost game 2?`,
      answer: "A lost game 2.",
      explanation: `<strong>Reasoning: count how often each player must have waited</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Total appearances are 10 + 15 + 17 = 42. Since each game has 2 players, there were <strong>21 games</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>A waited the most, so A must have been the player sitting out game 1. That means game 1 was B vs C, and A first enters on game 2.</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>The count pattern forces A to lose every game A plays. Therefore when A enters on game 2, A immediately loses game 2.</div>
</div>`
    },
    8: {
      title: "The Road to Heaven",
      question: `There are two paths ahead. One leads to heaven, the other to hell.

Two gatekeepers stand there. One is an <strong>angel</strong> who always tells the truth. The other is a <strong>demon</strong> who always lies. You cannot tell which is which.

You may ask <strong>only one yes-or-no question</strong>.

What should you ask to identify the road to heaven?`,
      answer: `Ask either guardian: "If I asked you whether this path leads to heaven, would you say yes?"<br>If the answer is "yes," that path leads to heaven. If the answer is "no," it does not.`,
      explanation: `<strong>Reasoning: use a self-referential double-check question</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>A direct question is not enough, because the angel and demon would answer differently.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>By asking what they <strong>would say</strong>, the liar is forced to lie about their own lie. That flips the answer twice, so both guardians effectively point to the truth.</div>
</div>`
    },
    9: {
      title: "The 50% Hat Strategy",
      question: `A and B sit facing each other. Each wears either a <strong>red</strong> or <strong>blue</strong> hat.

<ul>
  <li>Each person can see the other’s hat but not their own.</li>
  <li>They cannot talk during the game.</li>
  <li>They must say their own hat color at the same time.</li>
  <li>The goal is to guarantee that <strong>at least one person is correct</strong>.</li>
  <li>They may agree on a strategy beforehand.</li>
</ul>

What strategy guarantees success?`,
      answer: "A says the color they see. B says the opposite color.",
      explanation: `<strong>Reasoning: split the two possibilities</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Let A always say the exact color of B’s hat. Let B always say the opposite of A’s hat.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>If the hats match, A is correct. If the hats differ, B is correct. Since those are the only two possibilities, at least one person is always right.</div>
</div>`
    },
    10: {
      title: "The 33% Hat Strategy",
      question: `A, B, and C sit in a circle. Each wears a hat that is either <strong>red, blue, or white</strong>.

<ul>
  <li>Each person sees the other two hats but not their own.</li>
  <li>No communication is allowed during the game.</li>
  <li>They must all guess their own color at the same time.</li>
  <li>The goal is to guarantee that <strong>at least one person is correct</strong>.</li>
  <li>They may agree on a strategy beforehand.</li>
</ul>

What strategy guarantees this?`,
      answer: "Use modular arithmetic mod 3, assigning each player a different target sum.",
      explanation: `<strong>Reasoning: encode the colors numerically</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Assign numbers: red = 0, blue = 1, white = 2.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Before the game, A assumes the total of all three colors is 0 mod 3, B assumes it is 1 mod 3, and C assumes it is 2 mod 3. Each computes the color that would make their assumption true.</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>The real total must be one of 0, 1, or 2 mod 3. Therefore exactly one player’s assumption matches reality, so at least one player is guaranteed to guess correctly.</div>
</div>`
    },
    11: {
      title: "Schrodinger's Cat in Five Boxes",
      question: `There are 5 boxes arranged in a line: 1, 2, 3, 4, 5. A cat is hiding in one of them.

<ul>
  <li>Every night, the cat always moves to an adjacent box.</li>
  <li>Each morning, you may open only <strong>one</strong> box.</li>
  <li>You do not know where the cat started.</li>
</ul>

In what sequence should you open boxes to guarantee finding the cat?`,
      answer: "Open boxes in the sequence 2 → 3 → 4 → 4 → 3 → 2.",
      explanation: `<strong>Reasoning: sweep the parity and trap the movement</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>The cat alternates between odd and even positions every night.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>The sequence <strong>2, 3, 4, 4, 3, 2</strong> sweeps inward and then back, covering every possible motion pattern until the cat must be caught.</div>
</div>`
    },
    12: {
      title: "The Stairway to Heaven",
      question: `There are two staircases. One leads to heaven and the other to hell. Three guards stand nearby, one of each type:
<ul>
  <li>🌟 <strong>Angel</strong> — always tells the truth</li>
  <li>😈 <strong>Demon</strong> — always lies</li>
  <li>🧑 <strong>Human</strong> — may answer either way</li>
</ul>

You cannot tell them apart. You may ask <strong>two yes-or-no questions, each to a different person</strong>.

How can you identify the staircase to heaven?`,
      answer: "Use question 1 to identify who is human, then ask a double-layer truth question to a non-human.",
      explanation: `<strong>Reasoning: first isolate the unreliable human</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Ask person 1: <em>"If I asked you whether person 2 is the human, would you say yes?"</em> For both the angel and the demon, this gives the same functional answer about person 2.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Use that answer to decide which remaining person is definitely not the human, then ask that person: <em>"If I asked you whether the left staircase leads to heaven, would you say yes?"</em></div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>A “yes” means the left staircase is the one to heaven; a “no” means the right staircase is.</div>
</div>`
    },
    13: {
      title: "The Missing 1,000 Yen",
      question: `You and two coworkers stay at a hotel and each pay <strong>10,000 yen</strong>, for a total of 30,000 yen.

Later, the clerk realizes the room really costs <strong>25,000 yen</strong>. He wants to return 5,000 yen, but since it cannot be split evenly three ways, he keeps 2,000 yen and returns 3,000 yen total.

So each person effectively paid 9,000 yen, for a total of 27,000 yen. If you add the 2,000 yen the clerk kept, you get 29,000 yen.

Where did the other 1,000 yen go?`,
      answer: "No money is missing. The arithmetic is set up incorrectly.",
      explanation: `<strong>The 27,000 yen already includes the 2,000 yen kept by the clerk.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>The guests paid <strong>27,000</strong> in total. That breaks into <strong>25,000</strong> for the room plus <strong>2,000</strong> kept by the clerk.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>So you should not do <strong>27,000 + 2,000</strong>, because that counts the clerk’s 2,000 twice. The correct breakdown is <strong>30,000 = 25,000 + 2,000 + 3,000</strong>.</div>
</div>`,
      choices: [
        "💸 Someone secretly stole 1,000 yen",
        "➕ No money is missing; the puzzle adds incorrectly",
        "🏨 The hotel made another pricing mistake",
        "🤷 There isn't enough information"
      ]
    },
    14: {
      title: "The Easiest Question in the World",
      question: `A is looking at B.
B is looking at C.
A is married.
C is unmarried.

Can we conclude that
<strong>“a married person is looking at an unmarried person”</strong>?`,
      answer: "Yes. We can be certain that at least one such person exists.",
      explanation: `<strong>There are only two possible cases for B.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>If <strong>B is married</strong>, then B is a married person looking at C, who is unmarried.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>If <strong>B is unmarried</strong>, then A, who is married, is looking at B, who is unmarried.</div>
</div>`,
      choices: [
        "✅ Yes, definitely",
        "❌ No, definitely not",
        "🤔 Only if we know whether B is married",
        "📭 Not enough information"
      ]
    },
    15: {
      title: "The Second Race",
      question: `You run a 100-meter race and lose. When your opponent crosses the finish line, you are still 10 meters away.

In a second race, your opponent must start 10 meters behind you, and both of you run at the same speed as before.

Who wins the second race?`,
      answer: "Your opponent still wins.",
      explanation: `<strong>The relative speeds have not changed.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>In the first race, when your opponent ran 100 meters, you ran only 90. So your speed is <strong>90%</strong> of theirs.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>In the second race, if your opponent runs 90 meters, you run only 81. So they still reach the finish line first.</div>
</div>`,
      choices: [
        "🏃 You win",
        "🤝 It ends in a tie",
        "🏁 Your opponent still wins",
        "🌀 It cannot be determined"
      ]
    },
    16: {
      title: "Plane Against the Wind",
      question: `There are airports A and B. You fly from A to B and then back.

On the outbound trip, there is <strong>no wind</strong>.
On the return trip, there is a wind blowing <strong>from A to B the whole time</strong>.

Compared with the no-wind case in both directions, what happens to the total round-trip time?`,
      answer: "It takes longer than the no-wind case.",
      explanation: `<strong>The wind from A to B becomes a headwind on the way back from B to A.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>The outbound flight is unchanged, but the return flight becomes slower because of the headwind.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>So the total travel time <strong>increases</strong>. There is no compensating tailwind on the first leg.</div>
</div>`,
      choices: [
        "⏱ It stays the same",
        "📈 It takes longer than the no-wind case",
        "⚡ It takes less time than the no-wind case",
        "🔄 It depends on the plane speed"
      ]
    },
    17: {
      title: "Passing Ships",
      question: `Every day at noon, one ship leaves Japan for Australia, and at the same time one ship leaves Australia for Japan.

Each trip takes exactly 7 days and 7 nights.

If a ship leaves Japan today, how many ships leaving Australia will it pass on the way?`,
      answer: "15 ships",
      explanation: `<strong>It meets ships that left before today, today itself, and after today.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>It will meet the ships that left Australia during the <strong>7 previous days</strong>, the ship leaving <strong>today</strong>, and the ships leaving during the <strong>7 following days</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>That gives <strong>7 + 1 + 7 = 15</strong> ships in total.</div>
</div>`,
      choices: [
        "⛴ 14 ships",
        "⛴ 15 ships",
        "⛴ 16 ships",
        "⛴ 8 ships"
      ]
    },
    18: {
      title: "200 Products",
      question: `A factory has 200 products, and <strong>99%</strong> of them are defective.

You want to remove enough defective products so that the remaining collection is only <strong>98%</strong> defective.

How many defective products must be removed?`,
      answer: "100 products",
      explanation: `<strong>There are 2 good products from the start, and that number does not change.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>If 99% of 200 are defective, then 198 are defective and only <strong>2 are good</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>If 2 good products are to be 2% of the remaining total, the total must be <strong>100</strong>. So you must remove <strong>100 defective products</strong>.</div>
</div>`,
      choices: [
        "📦 2 products",
        "📦 50 products",
        "📦 98 products",
        "📦 100 products"
      ]
    },
    19: {
      title: "Population Plan",
      question: `Every family wants a <strong>daughter</strong> and keeps having children until they get one, then stops.

Assume boys and girls are equally likely.

In the long run, what will the ratio of <strong>boys : girls</strong> be in the country?`,
      answer: "Approximately 1 : 1",
      explanation: `<strong>Each birth still has a 50% chance of being a boy or girl.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Some families will have several boys before finally having a girl, but each individual birth is still equally likely to be either sex.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>So across the whole population, the ratio remains close to <strong>1:1</strong>.</div>
</div>`,
      choices: [
        "👦 More boys than girls",
        "👧 More girls than boys",
        "⚖️ About 1 : 1",
        "📉 It depends on the number of families"
      ]
    },
    20: {
      title: "The Raise Puzzle",
      question: `You are offered two pay-raise plans.

Plan A: an increase of <strong>100,000 yen per year</strong>.
Plan B: an increase of <strong>30,000 yen every half-year</strong>.

Which should you choose?`,
      answer: "Plan A",
      explanation: `<strong>You must compare them in the same unit first.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Plan A adds <strong>100,000 yen per year</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Plan B adds 30,000 yen per half-year, so it adds only <strong>60,000 yen per year</strong>.</div>
</div>`,
      choices: [
        "🅰️ Plan A",
        "🅱️ Plan B",
        "🤝 They are equal",
        "📆 You need to know how many years you will work"
      ]
    },
    21: {
      title: "The White Ball Box",
      question: `A box contains one ball, but you do not know whether it is <strong>black</strong> or <strong>white</strong>.

You add one white ball, shake the box, and draw one ball.
The ball you draw is <strong>white</strong>.

What color is the ball left in the box most likely to be?`,
      answer: "It is more likely to be white, with probability 2/3.",
      explanation: `<strong>It is not certainly white, but white is more likely.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>If the original ball was white, then the box contained WW and drawing a white ball was guaranteed.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>If the original ball was black, then the box contained BW and drawing a white ball had probability only 1/2. So after seeing white, the original-white case has greater weight, making the remaining ball more likely to be <strong>white</strong>.</div>
</div>`,
      choices: [
        "⚪ More likely white",
        "⚫ More likely black",
        "🎲 Exactly equally likely",
        "🚫 Nothing can be concluded"
      ]
    },
    22: {
      title: "Three Cards",
      question: `Three cards lie in front of you.

Card 1: black on both sides
Card 2: white on both sides
Card 3: black on one side and white on the other

You pick one card and see that the visible face is <strong>white</strong>.

What is the probability that the back side is also <strong>white</strong>?`,
      answer: "2/3",
      explanation: `<strong>Count the number of possible visible white faces.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>The WW card contributes <strong>2 white faces</strong>, while the WB card contributes only <strong>1 white face</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>So after seeing a white face, there are 3 equally possible white-face cases in total, and 2 of them come from the WW card. Therefore the probability is <strong>2/3</strong>.</div>
</div>`,
      choices: ["1/2", "1/3", "2/3", "3/4"]
    },
    23: {
      title: "25 Racehorses",
      question: `There are 25 racehorses, and you must determine the fastest 3.

At most 5 horses can run in one race, and you cannot time them. You only know the order within a single race.

What is the minimum number of races needed?`,
      answer: "7 races",
      explanation: `<strong>First divide into groups, then race only the true remaining contenders.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Use the first 5 races to rank the horses within each of 5 groups.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Race the 5 group winners in race 6 to identify which groups still matter.</div>
</div>

<div class="explain-step">
  <span class="step-num">3</span>
  <div>Only 5 horses remain plausible candidates for the top 3, so one final race is enough. Total: <strong>7 races</strong>.</div>
</div>`,
      choices: [
        "🏇 6 races",
        "🏇 7 races",
        "🏇 8 races",
        "🏇 9 races"
      ]
    },
    24: {
      title: "Four Cards",
      question: `Four cards are in front of you: <strong>E</strong>, <strong>R</strong>, <strong>2</strong>, and <strong>9</strong>.

Each card has a letter on one side and a number on the other.

You want to test the rule:
<strong>“If a card has a vowel on one side, then it has an even number on the other.”</strong>

Which two cards should you turn over?`,
      answer: "Turn over E and 9.",
      explanation: `<strong>You must look for cases that could violate the rule.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>Turn over <strong>E</strong> to check whether its reverse side is even.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Turn over <strong>9</strong> to check that its reverse side is not a vowel. If it were, the rule would be broken.</div>
</div>`,
      choices: [
        "🃏 E and 2",
        "🃏 E and 9",
        "🃏 R and 2",
        "🃏 2 and 9"
      ]
    },
    25: {
      title: "Three-Party Election",
      question: `A, B, and C are running in an election and are tied for first place.
When voters are also asked for second-place rankings, all three are still tied.

A proposes that B and C should compete first, and then the winner should face A one-on-one.
B says this is <strong>unfair</strong> because A now has a better chance to win.

Is B necessarily correct?`,
      answer: "No. B is not necessarily correct.",
      explanation: `<strong>The given information is still not enough to prove that A has a built-in advantage.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>The first-place and second-place ties do not fully determine all pairwise comparisons.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>So there are possible vote structures where A has an advantage, where no one has a real advantage, or where the order changes the outcome in different ways. B’s claim is <strong>not always true</strong>.</div>
</div>`,
      choices: [
        "✅ Yes, B must be right",
        "❌ No, not always",
        "⚖️ It is guaranteed to be perfectly fair",
        "📮 It cannot be judged because the score is odd"
      ]
    },
    26: {
      title: "Island of Truth-Tellers and Liars",
      question: `On a certain island there are 4 types of people:
<ul>
  <li>always truthful</li>
  <li>sometimes truthful, sometimes deceptive</li>
  <li>always lying</li>
  <li>liars who still “love correctness” in a strange way</li>
</ul>

There is a pudding theft, and we know there is exactly one culprit.

A says: “I am innocent” / “B is the culprit” / “B is truthful”<br>
B says: “I am innocent” / “A is the culprit” / “C is a different type from me”<br>
C says: “I am innocent” / “A is the culprit”

Who ate the pudding?`,
      answer: "This data set is internally inconsistent, so there is no clean direct conclusion.",
      explanation: `<strong>This puzzle tests whether you can stop when the information does not cohere.</strong>

<div class="explain-step">
  <span class="step-num">1</span>
  <div>If you try each suspect in turn, the innocence claims and accusations quickly generate contradictions under the role rules.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>The lesson is not to force a guess, but to recognize that the information is <strong>insufficient or self-contradictory</strong>.</div>
</div>`,
      choices: [
        "🍮 A ate the pudding",
        "🍮 B ate the pudding",
        "🍮 C ate the pudding",
        "🧩 The information conflicts, so there is no direct conclusion"
      ]
    },
    27: {
      title: "What Color Was the Bear?",
      question: `A researcher pitches a tent. A bear appears.

The researcher runs <strong>10 km south</strong>, then <strong>10 km east</strong>, then <strong>10 km north</strong>,
and ends up exactly back at the tent.

What color was the bear?`,
      answer: "White. It was a polar bear.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>This route works most naturally near the <strong>North Pole</strong>, where moving south, circling, and then going north can return you to the same point.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Bears in that region are <strong>polar bears</strong>, so the bear was <strong>white</strong>.</div>
</div>`,
      choices: ["🤎 Brown", "⚪ White", "🖤 Black", "🩶 Gray"]
    },
    28: {
      title: "Two Ropes",
      question: `You have two ropes. Each takes exactly <strong>1 hour</strong> to burn completely.

The catch is that each rope burns unevenly: some parts burn faster, some slower.

How can you measure exactly <strong>45 minutes</strong>?`,
      answer: "Light one rope at both ends and the other at one end. When the first rope finishes, light the second end of the other rope.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>Lighting the first rope at <strong>both ends</strong> makes it burn out in <strong>30 minutes</strong>, regardless of uneven burning.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>At the same time, light the second rope at one end. When the first rope finishes after 30 minutes, light the <strong>other end</strong> of the second rope. That makes the remaining part burn in <strong>15 minutes</strong>, for a total of 45.</div>
</div>`,
      choices: [
        "🔥 Light both ropes at one end",
        "🔥 Light rope 1 at both ends and rope 2 at one end, then light rope 2’s other end when rope 1 finishes",
        "🔥 Light rope 1 at one end, wait 30 minutes, then light rope 2 at both ends",
        "🔥 It cannot be done because the ropes burn unevenly"
      ]
    },
    29: {
      title: "Four Boats",
      question: `Four boats must cross to the other side, taking <strong>1, 2, 4, and 8 minutes</strong>.

At most 2 boats can cross at once, and if two cross together, the crossing time equals the slower boat.

What is the minimum total time?`,
      answer: "15 minutes",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>Use the two fastest boats as shuttles: <strong>1+2 cross (2)</strong>, <strong>1 returns (1)</strong>, <strong>4+8 cross (8)</strong>, <strong>2 returns (2)</strong>, <strong>1+2 cross (2)</strong>.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Total time = <strong>2 + 1 + 8 + 2 + 2 = 15 minutes</strong>.</div>
</div>`,
      choices: ["⛵ 14 minutes", "⛵ 15 minutes", "⛵ 16 minutes", "⛵ 17 minutes"]
    },
    30: {
      title: "The Slow Horse Race",
      question: `A king tells two riders:
<em>“The winner gets the prize, but the prize goes to the <strong>owner of the losing horse</strong>.”</em>

Both riders then move extremely slowly, because neither wants their own horse to lose.

A wise person says something, and suddenly both riders race at full speed.

What did the wise person say?`,
      answer: "Switch horses.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>If you ride <strong>the other person’s horse</strong> and make it lose, then <strong>you</strong> are the owner of the losing horse and win the prize.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>So after switching horses, each rider wants to go <strong>as fast as possible</strong> so that their own horse wins.</div>
</div>`,
      choices: [
        "🐎 Tell both riders to start together",
        "🐎 Tell them to switch horses",
        "🐎 Tell them to swap finish lines",
        "🐎 Tell them to decide by time instead"
      ]
    },
    31: {
      title: "Crossing the Desert",
      question: `You must cross a desert and the whole journey takes <strong>6 days</strong>.

You may hire porters. Each person, including you, can carry at most <strong>4 days of food</strong>.

No one is allowed to be abandoned midway. What is the minimum number of porters needed?`,
      answer: "2 porters",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>With 2 porters, the three travelers begin with 12 person-days of food in total.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>One porter can go out, drop excess food, and return; the second can do the same farther ahead. That leaves just enough supply for you to complete the 6-day crossing.</div>
</div>`,
      choices: ["🎒 1 porter", "🎒 2 porters", "🎒 3 porters", "🎒 4 porters"]
    },
    32: {
      title: "The Scale and 9 Gold Coins",
      question: `There are 9 identical gold coins, but 1 is <strong>lighter</strong> than the others.

You have a balance scale and may use it at most <strong>2 times</strong>.

How do you find the lighter coin?`,
      answer: "Split the coins into 3 groups of 3 and compare group against group.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>Divide the 9 coins into 3 groups of 3. Weigh group 1 against group 2. If they balance, the light coin is in group 3; otherwise it is in the lighter group.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Then weigh 1 coin against 1 coin from the suspicious group. If they balance, the third coin is lighter; otherwise the lighter side reveals the fake.</div>
</div>`,
      choices: [
        "⚖️ Weigh coins individually twice",
        "⚖️ Split 4-4-1 and guess",
        "⚖️ Split 3-3-3, weigh groups, then weigh inside the lighter group",
        "⚖️ It cannot be done in 2 weighings"
      ]
    },
    33: {
      title: "26 Banknotes",
      question: `There are 26 banknotes in a bag.

No matter which 20 you remove, there will always still be:
<ul>
  <li>at least 1 note of 1,000 yen</li>
  <li>at least 2 notes of 2,000 yen</li>
  <li>at least 5 notes of 5,000 yen</li>
</ul>

What is the total amount of money in the bag?`,
      answer: "78,000 yen",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>If you can remove 6 notes and still be guaranteed to leave 1, 2, and 5 notes of those types, the bag must contain at least <strong>7</strong>, <strong>8</strong>, and <strong>11</strong> of them respectively.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Those counts sum to 26 exactly, so the bag contains 7×1,000 + 8×2,000 + 11×5,000 = <strong>78,000 yen</strong>.</div>
</div>`,
      choices: ["💴 68,000 yen", "💴 73,000 yen", "💴 78,000 yen", "💴 83,000 yen"]
    },
    34: {
      title: "Black and White Stones",
      question: `A box contains 20 white stones and 13 black stones.

Rules:
<ul>
  <li>If you draw 2 stones of the <strong>same color</strong>, put back 1 white stone.</li>
  <li>If you draw 2 stones of <strong>different colors</strong>, put back 1 black stone.</li>
</ul>

Repeat until only 1 stone remains.

What color is the final stone?`,
      answer: "Black",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>The parity of the number of black stones never changes: it remains odd throughout the process.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Since you start with 13 black stones, which is odd, the last remaining stone must be <strong>black</strong>.</div>
</div>`,
      choices: ["⚪ White", "⚫ Black", "🔄 It depends on the draw order", "🎲 50/50"]
    },
    35: {
      title: "17 Cows",
      question: `There are 17 cows to be divided among A, B, and C in the proportions
<ul>
  <li>A gets 1/2</li>
  <li>B gets 1/3</li>
  <li>C gets 1/9</li>
</ul>

Seventeen does not divide neatly, but someone passes by and solves it perfectly.

How?`,
      answer: "Borrow 1 cow to make 18, divide, then return the borrowed cow.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>Temporarily add 1 cow, giving <strong>18</strong>. Then the shares become 9, 6, and 2.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>Since 9 + 6 + 2 = 17, the extra borrowed cow remains and can be returned.</div>
</div>`,
      choices: [
        "🐄 Slaughter 1 cow and divide the rest",
        "🐄 Borrow 1 cow to make 18, divide, then return it",
        "🐄 Draw lots to see who gives up part of their share",
        "🐄 It truly cannot be divided"
      ]
    },
    36: {
      title: "10 Coins",
      question: `You are blindfolded in front of many coins.

You know only that exactly <strong>10 coins are heads-up</strong> and the rest are tails-up.

You must divide the coins into 2 piles so that the number of heads in the two piles is <strong>the same</strong>.

What should you do?`,
      answer: "Take 10 coins into one pile and flip all 10 of them.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>Suppose the 10-coin pile contains x heads. Then the rest of the coins must contain 10−x heads.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>After flipping the 10-coin pile, it will contain <strong>10−x heads</strong>, exactly matching the other pile.</div>
</div>`,
      choices: [
        "🪙 Count 10 coins and throw them away",
        "🪙 Split all coins in half",
        "🪙 Take 10 coins into one pile and flip them all",
        "🪙 Split randomly and hope"
      ]
    },
    37: {
      title: "Which Pile Has the Fake Coins?",
      question: `There are 10 piles of coins, with 10 coins in each pile.

Real coins weigh 1 gram.
Exactly 1 pile consists entirely of fake coins, and each fake coin weighs 1 gram more than a real coin.

You have a digital scale.

What is the minimum number of weighings needed, and how should you do it?`,
      answer: "One weighing: take 1, 2, 3, ..., 10 coins from piles 1 through 10 respectively.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>Take 1 coin from pile 1, 2 from pile 2, and so on up to 10 from pile 10, then weigh them all together.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>If all coins were real, the total would be 55 grams. The number of extra grams tells you exactly which pile contains the heavier fake coins.</div>
</div>`,
      choices: [
        "🏋️ It must take 2 weighings",
        "🏋️ It must take 3 weighings",
        "🏋️ One weighing: take 1 to 10 coins from the piles in order",
        "🏋️ One weighing, but take the same number from every pile"
      ]
    },
    38: {
      title: "Mailing a Key Safely",
      question: `You must send a key safely to a customer.

If you send the box unlocked, it may be stolen.
If you lock it with your padlock, the customer has no key.
And you are not allowed to send the key together with the locked box.

How can the customer open the box safely?`,
      answer: "Use two padlocks: you lock it first, the customer adds theirs, then you remove yours.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>Put the key in the box and lock it with <strong>your</strong> padlock before sending it.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>The customer adds <strong>their</strong> padlock and sends it back. You remove your padlock and send it again. Now only the customer’s padlock remains, so the customer can open it.</div>
</div>`,
      choices: [
        "📦 Send the key in a second box",
        "🔐 Use two locks in sequence so only the customer’s lock remains at the end",
        "✉️ Send the key later in a letter",
        "🚫 It cannot be done safely"
      ]
    },
    39: {
      title: "Counting Election Results",
      question: `You are in charge of counting votes.

Once you know who received the most votes, you must announce the winner.
But the counting device you hold can only <strong>increase or decrease by 1</strong>,
and the rule is that <strong>you may not refer to any candidate directly by name</strong>.

What should you do?`,
      answer: "Assign numbers or symbols to the candidates and announce the winner using that code.",
      explanation: `<div class="explain-step">
  <span class="step-num">1</span>
  <div>The trap is thinking you must use the actual names, but the rule only forbids naming candidates directly.</div>
</div>

<div class="explain-step">
  <span class="step-num">2</span>
  <div>So you can assign each candidate a <strong>number or symbol</strong> and announce, for example, “Candidate number 3 wins.”</div>
</div>`,
      choices: [
        "🔢 Use numbers or symbols for each candidate and announce the winner by code",
        "🗳 Ask someone else to announce it",
        "📢 Spell the name letter by letter",
        "🚫 It cannot be announced under the rule"
      ]
    },
    40: {
      title: "Three Fruit Boxes",
      question: `There are 3 boxes, and <strong>every label is wrong</strong>.

The labels are:
<ul>
  <li>Apples</li>
  <li>Oranges</li>
  <li>Mixed</li>
</ul>

What is the minimum number of boxes you must open to determine what is in all three boxes?`,
      answer: "Open 1 box.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>Open the box labeled <strong>Mixed</strong>, because it cannot actually be mixed if all labels are wrong.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>Once you know what is in that box, the other two labels can be resolved immediately.</div></div>`,
      choices: ["📦 1 box", "📦 2 boxes", "📦 3 boxes", "📦 It cannot be done"]
    },
    41: {
      title: "Guessing Age 72",
      question: `A coworker has 3 daughters.

You know:
<ul>
  <li>The product of their ages is 72.</li>
  <li>Even after being told the sum, you still could not determine the ages.</li>
  <li>There is exactly one oldest daughter.</li>
</ul>

How old are the three daughters?`,
      answer: "3, 3, and 8 years old",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>The important repeated-sum candidates are <strong>2,6,6</strong> and <strong>3,3,8</strong>, both summing to 14.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>The clue that there is <strong>exactly one oldest daughter</strong> eliminates 2,6,6, leaving <strong>3,3,8</strong>.</div></div>`,
      choices: ["👧 2, 6, 6", "👧 3, 3, 8", "👧 4, 4, 4.5", "👧 It cannot be determined"]
    },
    42: {
      title: "Editorial Error Count",
      question: `Two editors, A and B, proofread the same book.
<ul>
  <li>A found 75 errors.</li>
  <li>B found 60 errors.</li>
  <li>They found 50 of the same errors in common.</li>
</ul>

How many total errors are in the book?`,
      answer: "85 errors",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>Use the union formula: total = A’s errors + B’s errors − overlap.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>So the total is <strong>75 + 60 − 50 = 85</strong>.</div></div>`,
      choices: ["📚 75", "📚 80", "📚 85", "📚 95"]
    },
    43: {
      title: "Foreign Restaurant Menu",
      question: `Five Japanese tourists visit a foreign restaurant.
<ul>
  <li>There are 9 menu items, but they cannot read the language.</li>
  <li>They can visit only 3 times.</li>
  <li>Each person may order 1 item each visit.</li>
  <li>No one may repeat an item they personally ordered before.</li>
  <li>They want to identify all 9 dishes.</li>
</ul>

How can they do it?`,
      answer: "Use controlled repetition and cross-mapping with rounds 1-5, then 6-9 plus 1, then 2-6.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div><strong>Visit 1:</strong> have A-E order <strong>1,2,3,4,5</strong>.</div></div>
<div class="explain-step"><span class="step-num">2</span><div><strong>Visit 2:</strong> have A-D order <strong>6,7,8,9</strong>, while E repeats <strong>1</strong> to create a bridge between visits.</div></div>
<div class="explain-step"><span class="step-num">3</span><div><strong>Visit 3:</strong> order <strong>2,3,4,5,6</strong>. The overlaps let them map each menu number to the actual dish.</div></div>`,
      choices: [
        "🍽 Visit 1: 1-5, Visit 2: 6-9 and 1 again, Visit 3: 2-6 for cross-checking",
        "🍽 Have everyone order the same dish every time",
        "🍽 They need more than 3 visits",
        "🍽 It is impossible"
      ]
    },
    44: {
      title: "Two Cards",
      question: `There are 3 friends:
<ul>
  <li>one always tells the truth</li>
  <li>one always lies</li>
  <li>one alternates</li>
</ul>

You draw a card twice.

Round 1:
A = blue / B = blue / C = red

Round 2:
A = red / B = blue / C = blue

What colors were the two cards you drew?`,
      answer: "Red, red",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>Start with B: since B answers “blue” both times, B must be either the truth-teller or the liar, not the alternator.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>A changes from blue to red, which strongly matches the alternating role. So B and C must be truth-teller and liar in some order.</div></div>
<div class="explain-step"><span class="step-num">3</span><div>If B were truthful, round 2 would force C to be truthful as well, which is impossible. Therefore B must be the liar and C the truth-teller.</div></div>
<div class="explain-step"><span class="step-num">4</span><div>Since B lies both times when saying “blue,” the true color in both rounds must be <strong>red</strong>.</div></div>`,
      choices: ["🃏 Blue, blue", "🃏 Red, blue", "🃏 Red, red", "🃏 Blue, red"]
    },
    45: {
      title: "Ten People Exchanging Business Cards",
      question: `There are 10 people at an event.
<ul>
  <li>They come from 4 companies, with 2 people from each company.</li>
  <li>People exchange cards only with people they have never met before.</li>
  <li>After the event, everyone gives a different number of exchanges.</li>
</ul>

How many people did your friend exchange cards with?`,
      answer: "4 people",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>If one person exchanged with <strong>0</strong> people, their partner must have exchanged with <strong>8</strong>. Likewise, the pairs are <strong>1 ↔ 7</strong>, <strong>2 ↔ 6</strong>, and <strong>3 ↔ 5</strong>.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>The possible counts are 0 through 8, which gives only 9 values for 10 people. The only self-pairing value is <strong>4</strong>, so that must be your friend’s count.</div></div>`,
      choices: ["💼 4 people", "💼 5 people", "💼 6 people", "💼 8 people"]
    },
    46: {
      title: "Red and Blue Stickers",
      question: `A, B, and C each have either a red or blue sticker on their back.
<ul>
  <li>They can see the others’ stickers but not their own.</li>
  <li>If they see red, they raise a hand.</li>
  <li>Then they must determine their own color.</li>
</ul>

How can all three reason it out?`,
      answer: "They use waiting as information: the number of red stickers equals the number of rounds of waiting required.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>If there is only <strong>1 red</strong>, that person sees no other hands and immediately knows they must be red.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>If there are <strong>2 red</strong>, each waits one round. If the other still does not answer, each deduces they themselves must be red.</div></div>
<div class="explain-step"><span class="step-num">3</span><div>If there are <strong>3 red</strong>, everyone waits two rounds and then concludes the same. In general, the number of red stickers equals the number of waiting rounds.</div></div>`,
      choices: [
        "🟥 Guess from how many hands are raised",
        "🟦 Use waiting and common knowledge; the number of reds equals the number of waiting rounds",
        "🎲 Watch who raises a hand most confidently",
        "🚫 It cannot be solved"
      ]
    },
    47: {
      title: "The Three Apple Rooms",
      question: `A, B, and C are locked in separate rooms.
<ul>
  <li>Each room contains 1 to 9 apples.</li>
  <li>The counts are all different.</li>
  <li>Anyone who correctly states the total number of apples in all 3 rooms will be released.</li>
  <li>Each person may ask exactly one question and can hear the others’ answers.</li>
</ul>

A asks: “Is the total even?” → No
B asks: “Is it prime?” → No
C knows that their own room has 5 apples.

What should C ask?`,
      answer: `Ask: “Is the total greater than 12?”`,
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>From A and B, the total must be <strong>odd</strong> and <strong>non-prime</strong>. Since C has 5 apples, the remaining possibilities narrow to <strong>{9, 15, 21}</strong>.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>The best question splits those three values as effectively as possible. Asking whether the total is <strong>greater than 12</strong> isolates 9 from {15, 21}.</div></div>`,
      choices: [
        "🍎 Ask: “Is the total 15?”",
        "🍎 Ask: “Is the total greater than 12?”",
        "🍎 Ask whether A has more than B",
        "🍎 Ask whether the total is even"
      ]
    },
    48: {
      title: "The Locked Code Room",
      question: `A, B, and C are in separate rooms. A 3-digit code is formed.
<ul>
  <li>The digits sum to 9.</li>
  <li>The middle digit is at least as large as the left digit.</li>
  <li>A sees the left digit, B sees the middle digit, C sees the right digit.</li>
</ul>

At first no one knows.
Then B knows.
Then C knows.
Then A knows.

What is the code?`,
      answer: "009",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>The fact that no one knows initially removes extreme obvious cases, such as B = 9.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>For B to know later, the middle digit must force a unique pair (A, C). That happens only with <strong>B = 0</strong>, because then B ≥ A forces <strong>A = 0</strong>, leaving <strong>C = 9</strong>.</div></div>
<div class="explain-step"><span class="step-num">3</span><div>That makes the full code <strong>009</strong>.</div></div>`,
      choices: ["🔢 009", "🔢 234", "🔢 333", "🔢 522"]
    },
    49: {
      title: "The Seven Suspects",
      question: `There are 7 suspects, A through G. Some are truthful and some are liars.

You ask each of them 3 questions:
<ol>
  <li>Did you eat the cake?</li>
  <li>How many culprits are there among the 7 of you?</li>
  <li>How many truthful people are there among the 7 of you?</li>
</ol>

Their answers are:
A: yes, 1, 1
B: yes, 3, 3
C: no, 2, 2
D: no, 4, 1
E: no, 3, 3
F: no, 3, 3
G: yes, 2, 2

Who stole and ate the cake?`,
      answer: "A alone",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>Assume there is exactly <strong>1 culprit</strong> and inspect the number answers first. Only A says there is 1 culprit; the others all disagree.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>If A is truthful and everyone else lies, then the truthful count is also 1, matching A’s third answer. That makes A’s first answer “yes” true as well, so <strong>A is the culprit</strong>.</div></div>`,
      choices: ["🍰 A alone", "🍰 B, E, and F", "🍰 C and G", "🍰 It cannot be determined"]
    },
    50: {
      title: "Full Round-Robin Tournament",
      question: `Eight players compete in a full round-robin tournament.
<ul>
  <li>A win gives 1 point.</li>
  <li>A loss gives 0 points.</li>
  <li>A draw gives 0.5 points.</li>
</ul>

In the final standings:
<ul>
  <li>All point totals are different.</li>
  <li>The score of the player in 2nd place equals the combined scores of the bottom 4 players.</li>
</ul>

Who won the game between the 3rd-place player and the 7th-place player?`,
      answer: "The 3rd-place player must have won.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>The scoring structure forces the upper-ranked players to dominate the lower-ranked players often enough for the 2nd-place total to match the sum of the bottom four.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>If 7th had beaten 3rd, the score distribution would clash with that required structure. So the <strong>3rd-place player</strong> must have won.</div></div>`,
      choices: ["🏆 7th beat 3rd", "🏆 They drew", "🏆 3rd beat 7th", "🏆 It cannot be determined"]
    },
    51: {
      title: "The Mysterious Sports Meet",
      question: `Three contestants compete. First, second, and third place in each event give X, Y, and Z points respectively, where
<strong>X > Y > Z > 0</strong> and all are integers.

At the end:
<ul>
  <li>A has 22 total points.</li>
  <li>B has 9 total points and won the javelin event.</li>
  <li>C has 9 total points.</li>
</ul>

Who finished 2nd in the 100-meter race?`,
      answer: "C",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>B and C both finish with 9 points, but B already has a first-place finish in javelin, so B and C cannot have matching point patterns.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>Balancing the remaining placements without ties forces the 100-meter second place to be <strong>C</strong>.</div></div>`,
      choices: ["🥈 A", "🥈 B", "🥈 C", "🥈 It cannot be determined"]
    },
    52: {
      title: "Two Muddy Faces",
      question: `You and your brother can see each other’s faces but not your own. Your father says <strong>at least one of you has mud on your face</strong>.

He first asks everyone with mud to raise a hand, but neither of you does.
Then he repeats the statement a second time.

What should you do?`,
      answer: "Raise your hand.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>If your own face were clean and you saw mud only on your brother’s face, your brother should have raised a hand the first time.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>Since he did not, you can infer that your own face must also be muddy. So on the second round, you should <strong>raise your hand</strong>.</div></div>`,
      choices: ["🙋 Raise your hand", "🙅 Stay still", "🤔 Ask for another clue", "🫥 Close your eyes"]
    },
    53: {
      title: "Three Messy Hairstyles",
      question: `You, your brother, and your sister are on a train. Wind blows in and makes your brother’s and sister’s hair messy.

You laugh because you see their messy hair. But they also keep laughing.
You think they must be mistakenly assuming that your hair is messy too.

So is your hair messy or not?`,
      answer: "Yes, it is messy.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>If your hair were neat, your brother and sister would each immediately know why the other was laughing.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>The fact that they both continue laughing means each is reasoning that <strong>your hair must also be messy</strong>.</div></div>`,
      choices: ["💇 Yes, messy", "✨ No, neat", "🤷 Impossible to know", "🔄 Only one side is messy"]
    },
    54: {
      title: "Hats on the Stairs",
      question: `Brother → You → Sister stand in a line on stairs.

Each person sees the hats of the people in front, and everyone knows that among the three hats there will be <strong>two of the same color</strong> (red or yellow).

At first, no one can answer.

Can you determine the color of your own hat?`,
      answer: "Yes. You use the fact that the person behind you still cannot answer.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>If your brother saw that you and your sister had the same color hat, he could instantly deduce his own hat must be the other color.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>Since he cannot answer, you know your hat and your sister’s hat must be <strong>different</strong>. Seeing your sister’s color lets you infer your own.</div></div>`,
      choices: ["🎩 Yes, by using the silence of the person behind you", "🎩 No, there is not enough information", "🎩 Only your brother can know", "🎩 Only your sister can know"]
    },
    55: {
      title: "Three-Way Duel",
      question: `You, A, and B take turns in a duel: You → A → B → ...

Accuracy rates:
<ul>
  <li>You = 30%</li>
  <li>A = 50%</li>
  <li>B = 100%</li>
</ul>

Everyone plays optimally to maximize their own chance of survival.

Whom should you shoot at first?`,
      answer: "Deliberately miss.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>If you hit A or B, you are likely to leave yourself against a stronger survivor who will immediately target you.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>By intentionally missing, you encourage A and B to eliminate each other first, improving your long-run survival odds.</div></div>`,
      choices: ["🎯 Shoot A", "🎯 Shoot B", "🌫 Intentionally miss", "🌀 The choice does not matter"]
    },
    56: {
      title: "The Bar with Anti-Social Seating",
      question: `There are 25 seats in a row. Each arriving customer chooses the seat <strong>farthest from everyone else</strong>.

If the bartender gets to choose the first customer’s seat, where should it be placed to maximize the total number of customers the bar can eventually seat?`,
      answer: "In the exact middle.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>Starting near an end makes the later spacing unbalanced and wastes more room.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>Placing the first customer in the <strong>center</strong> keeps the left and right sides as balanced as possible, which maximizes capacity under the rule.</div></div>`,
      choices: ["🪑 At the far left", "🪑 At the exact middle", "🪑 At seat 8", "🪑 Anywhere is equally good"]
    },
    57: {
      title: "Dividing 100 Gold Coins",
      question: `A, B, C, D, and E must divide 100 gold coins. They propose plans in order A → B → C → D → E.

If at least half vote yes, the plan passes.
If not, the proposer is eliminated and the next person proposes.

Everyone is perfectly rational and wants as many coins as possible. If two outcomes give them the same number of coins, they vote against.

What should A propose to maximize A’s own payoff?`,
      answer: "A = 98, C = 1, E = 1",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>Reason backward:
with D and E left, D can pass <strong>100,0</strong>.
With C, D, E left, C can buy E with <strong>99,0,1</strong>.
With B, C, D, E left, B can buy D with <strong>99,0,1,0</strong>.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>So when it is A’s turn, the cheapest votes to buy are <strong>C and E</strong>, because they each get 0 if A fails. Therefore A’s best proposal is <strong>A = 98, C = 1, E = 1</strong>.</div></div>`,
      choices: [
        "🪙 A=98, C=1, E=1",
        "🪙 A=99, D=1",
        "🪙 A=97, B=1, D=1, E=1",
        "🪙 Split equally"
      ]
    },
    58: {
      title: "The King Sets Salaries",
      question: `There are 66 citizens in total including the king, and the total budget is 66 coins.

If someone’s salary increases, they vote yes. If it decreases, they vote no. If it stays the same, they abstain.
The king has no vote.

How should the king set the new salaries to maximize his own salary while still passing the vote?`,
      answer: "Everyone gets 1 coin.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>The total budget is only <strong>66 coins</strong> for 66 people, so the natural baseline is <strong>1 coin each</strong>.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>If the king gives himself more, someone else must get less, and those people will vote no immediately. So the safe passing solution is <strong>1 coin for everyone</strong>.</div></div>`,
      choices: [
        "👑 Everyone gets 1 coin",
        "👑 The king gets 2 and someone else loses 1",
        "👑 The king takes most of the coins and buys half the voters",
        "👑 It is impossible because the king cannot vote"
      ]
    },
    59: {
      title: "Eight Stamps",
      question: `There are 8 stamps: 4 red and 4 blue.

Two stamps are attached to A, two to B, two to C, and two remain in the box.
No one can see their own stamps, but each can see the others’.

After the conversation:
A: I don't know.
B: I don't know.
C: I don't know.
A: I still don't know.
B: Now I know.

What two stamps does B have?`,
      answer: "Two red stamps",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>This is a knowledge-cascade puzzle: each “I don’t know” eliminates simpler configurations.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>The only configuration left that lets <strong>B know exactly on the second round</strong> is that B has <strong>two red stamps</strong>.</div></div>`,
      choices: ["📮 Two red stamps", "📮 Two blue stamps", "📮 One red and one blue", "📮 It cannot be determined"]
    },
    60: {
      title: "Charlie's Birthday",
      question: `Charlie's birthday is one of the following dates:
<ul>
  <li>14/4/1999</li>
  <li>15/3/2000</li>
  <li>15/2/2001</li>
  <li>16/4/2001</li>
  <li>19/2/2000</li>
  <li>15/4/2000</li>
  <li>15/3/2001</li>
  <li>14/5/2001</li>
  <li>17/5/2001</li>
  <li>14/3/2000</li>
  <li>16/4/2000</li>
  <li>14/4/2001</li>
  <li>16/5/2001</li>
  <li>17/2/2002</li>
</ul>

A knows the month, B knows the day, and C knows the year. After several rounds of elimination:

B finally says, “Now I know.”
A then says, “Now everyone knows.”

What is Charlie’s birthday?`,
      answer: "17/5/2001",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>A says B cannot know at first, so A cannot have February because day <strong>19</strong> is unique. This removes all February candidates and also removes <strong>19/2/2000</strong>.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>C says C still does not know and A should still not know, which rules out <strong>1999</strong> because that year appears only once.</div></div>
<div class="explain-step"><span class="step-num">3</span><div>At that point, when B says “Now I know,” the only unique remaining day is <strong>17</strong>, leaving <strong>17/5/2001</strong>.</div></div>`,
      choices: ["🎂 14/4/2001", "🎂 16/5/2001", "🎂 17/5/2001", "🎂 15/3/2001"]
    },
    61: {
      title: "Dragon Island",
      question: `There are 100 blue-eyed dragons. No dragon knows its own eye color, but each can see that the others have blue eyes.

You say aloud:
<strong>“At least one dragon here has blue eyes.”</strong>

What happens next?`,
      answer: "On the 100th night, all blue-eyed dragons leave together.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>With 1 dragon, it leaves on night 1. With 2, they leave on night 2. This pattern continues by induction.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>So with 100 dragons, each waits 99 nights without seeing anyone leave, then concludes on the <strong>100th night</strong> that it too must have blue eyes.</div></div>`,
      choices: ["🐉 Night 1", "🐉 Night 50", "🐉 Night 100", "🐉 Nothing happens"]
    },
    62: {
      title: "The Impossible Number Guess",
      question: `A and B are each given one of two consecutive positive integers. Neither knows the other person’s number.

Every minute, each must choose either:
“guess the other person's number” or “stay silent.”

If you want a strategy that eventually guarantees a correct deduction, should it be based on the <strong>larger</strong> number or the <strong>smaller</strong> number?`,
      answer: "It must be based on the smaller number.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>The reasoning starts from the lowest possible base case. For example, if you see 1, the other number must be 2 immediately.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>From there the logic climbs upward step by step like induction, so the strategy must be anchored on the <strong>smaller</strong> number.</div></div>`,
      choices: [
        "🔢 Base it on the larger number",
        "🔢 Base it on the smaller number",
        "🔢 Either works equally well",
        "🔢 No definite strategy exists"
      ]
    },
    63: {
      title: "1,000 Cookies",
      question: `A, B, and C take turns taking cookies from a tray of 1,000.

Each person wants many cookies, but does <strong>not</strong> want to end up with the most, the fewest, or the same number as someone else.
If that ideal cannot be achieved, they switch to maximizing their own total.

How should A begin in order to maximize A’s chance of winning?`,
      answer: "A should take 1 cookie.",
      explanation: `<div class="explain-step"><span class="step-num">1</span><div>If A takes too many immediately, A risks becoming the player with the <strong>most</strong>, which already works against the primary objective.</div></div>
<div class="explain-step"><span class="step-num">2</span><div>Starting with <strong>1 cookie</strong> leaves A the most flexibility and avoids locking into an extreme total too early.</div></div>`,
      choices: [
        "🍪 Grab as many as possible immediately",
        "🍪 A should take 1 cookie",
        "🍪 Let B take the lead first",
        "🍪 There is no winning strategy"
      ]
    }
  }
};

QUIZ_SECTIONS.forEach((section) => {
  section.questions.forEach((question) => {
    const choiceMeta = QUESTION_CHOICES[question.id];
    if (choiceMeta) {
      question.choices = choiceMeta.choices;
      question.choicesI18n = choiceMeta.choicesI18n;
      question.correctChoice = choiceMeta.correctChoice;
    }
  });
});

function getLocalizedSection(section) {
  return {
    ...section,
    label: localizeValue(section.label),
    title: localizeValue(section.title),
    description: localizeValue(section.description)
  };
}

function getLocalizedQuestion(question) {
  const lang = getBrainGymLanguage();
  const translatedQuestion = QUESTION_TRANSLATIONS[lang]?.[question.id] || {};
  const localizedChoices =
    translatedQuestion.choices ||
    question.choicesI18n?.[getBrainGymLanguage()] ||
    question.choices;
  return {
    ...question,
    title: translatedQuestion.title || localizeValue(question.title),
    question: translatedQuestion.question || localizeValue(question.question),
    answer: translatedQuestion.answer || localizeValue(question.answer),
    explanation: translatedQuestion.explanation || localizeValue(question.explanation),
    diagram: localizeValue(question.diagram),
    answerDiagram: localizeValue(question.answerDiagram),
    choices: localizedChoices
  };
}

// Quiz state
const quizState = {
  currentSection: 0,
  currentQuestion: 0,
  answeredBySection: {},
  revealed: false,
};

// DOM references
let questionEl, progressEl, progressTextEl, revealBtn, nextBtn, prevBtn, sectionHeaderEl;

function getQuestionState() {
  return getCurrentAnswers()[quizState.currentQuestion] || null;
}

function setQuestionState(nextState) {
  const answers = getCurrentAnswers();
  answers[quizState.currentQuestion] = {
    ...(getQuestionState() || {}),
    ...nextState
  };
}

function getCurrentAnswers() {
  if (!quizState.answeredBySection[quizState.currentSection]) {
    quizState.answeredBySection[quizState.currentSection] = [];
  }
  return quizState.answeredBySection[quizState.currentSection];
}

function initQuiz() {
  const content = document.getElementById("brainGymContent");
  content.innerHTML = `
    <div class="brain-gym-content-card quiz-shell">
      <div class="quiz-topbar">
        <div id="brainGymLangMount" class="brain-gym-lang-mount"></div>
      </div>
      <div id="quizSectionHeader" class="quiz-section-header"></div>
      <div class="quiz-progress-wrap">
        <div class="quiz-jump-nav" id="quizJumpNav" aria-label="${brainGymTranslate("quiz.questionPicker")}"></div>
      </div>
      <div id="quizQuestion" class="quiz-question-block"></div>
      <div id="quizFeedback" class="quiz-feedback" hidden></div>
      <div id="quizAnswer" class="quiz-answer-block" hidden></div>
      <div class="quiz-actions">
        <button class="quiz-btn-secondary" id="quizPrevBtn" hidden>${brainGymTranslate("quiz.previous")}</button>
        <button class="brain-gym-button quiz-btn-reveal" id="quizRevealBtn" disabled>${brainGymTranslate("quiz.revealCheck")}</button>
        <button class="brain-gym-button quiz-btn-next" id="quizNextBtn" hidden>${brainGymTranslate("quiz.next")}</button>
      </div>
    </div>
  `;

  questionEl = document.getElementById("quizQuestion");
  progressTextEl = document.getElementById("quizJumpNav");
  revealBtn = document.getElementById("quizRevealBtn");
  nextBtn = document.getElementById("quizNextBtn");
  prevBtn = document.getElementById("quizPrevBtn");
  sectionHeaderEl = document.getElementById("quizSectionHeader");

  revealBtn.addEventListener("click", revealAnswer);
  nextBtn.addEventListener("click", nextQuestion);
  prevBtn.addEventListener("click", prevQuestion);

  if (typeof window.mountBrainGymLanguageToggle === "function") {
    window.mountBrainGymLanguageToggle();
  }

  renderQuestion();
}

function renderQuestion() {
  const section = getLocalizedSection(QUIZ_SECTIONS[quizState.currentSection]);
  const q = getLocalizedQuestion(QUIZ_SECTIONS[quizState.currentSection].questions[quizState.currentQuestion]);
  const totalQ = section.questions.length;
  const qNum = quizState.currentQuestion + 1;
  const savedState = getQuestionState();
  const selectedChoice = savedState?.selectedChoice;
  const checked = Boolean(savedState?.checked);

  sectionHeaderEl.innerHTML = `
    <p class="brain-gym-eyebrow" aria-hidden="true">&nbsp;</p>
    <h2 class="quiz-section-title">${section.title}</h2>
    <p class="quiz-section-desc">${section.description}</p>
    <div class="quiz-section-switcher" id="quizSectionSwitcher" aria-label="${brainGymTranslate("quiz.sectionPicker")}"></div>
  `;

  renderSectionSwitcher();
  renderJumpNav(totalQ);

  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < q.difficulty ? "star filled" : "star"}">★</span>`
  ).join("");
  const difficultyLabel = brainGymTranslate("quiz.difficulty", { value: q.difficulty });

  const diagramHtml = q.diagram ? `<div class="quiz-diagram-wrap">${q.diagram}</div>` : "";
  const choicesHtml = Array.isArray(q.choices)
    ? `
      <div class="quiz-choice-list" role="list" aria-label="${brainGymTranslate("quiz.answerChoices")}">
        ${q.choices
          .map((choice, index) => {
            const isSelected = selectedChoice === index;
            const isCorrect = checked && index === q.correctChoice;
            const isWrongSelected = checked && isSelected && index !== q.correctChoice;
            const stateClass = isCorrect
              ? " is-correct"
              : isWrongSelected
                ? " is-wrong"
                : isSelected
                  ? " is-selected"
                  : "";
            return `
              <button
                type="button"
                class="brain-gym-option quiz-choice${stateClass}"
                data-choice-index="${index}"
                aria-pressed="${isSelected ? "true" : "false"}"
                ${checked ? "disabled" : ""}
              >
                <span class="quiz-choice-badge">${String.fromCharCode(65 + index)}</span>
                <span class="quiz-choice-text">${choice}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    `
    : "";
  questionEl.innerHTML = `
    <div class="quiz-q-header">
      <div class="quiz-q-meta">
        <span class="quiz-q-num">${brainGymTranslate("quiz.questionNumber", { num: qNum })}</span>
        <div class="quiz-q-difficulty">
          <span class="quiz-q-stars" aria-label="${difficultyLabel}">${stars}</span>
        </div>
      </div>
      <h3 class="quiz-q-title">${q.title}</h3>
    </div>
    ${diagramHtml}
    <div class="quiz-q-text">${q.question}</div>
    ${choicesHtml}
  `;

  questionEl.querySelectorAll("[data-choice-index]").forEach((button) => {
    button.addEventListener("click", () => {
      setQuestionState({
        selectedChoice: Number(button.dataset.choiceIndex),
        checked: false,
        isCorrect: false
      });
      renderQuestion();
    });
  });

  prevBtn.hidden = quizState.currentQuestion === 0;
  prevBtn.textContent = brainGymTranslate("quiz.previous");
  revealBtn.hidden = false;
  const hasChoices = Array.isArray(q.choices) && q.choices.length > 0;
  revealBtn.disabled = hasChoices ? selectedChoice === undefined || checked : checked;
  revealBtn.textContent = checked
    ? brainGymTranslate("quiz.revealOpened")
    : hasChoices
      ? brainGymTranslate("quiz.revealCheck")
      : brainGymTranslate("quiz.revealOpen");
  nextBtn.hidden = !checked;
  nextBtn.textContent = quizState.currentQuestion < totalQ - 1
    ? brainGymTranslate("quiz.next")
    : brainGymTranslate("quiz.finishSection", { section: section.title });
  quizState.revealed = checked;

  renderFeedback(q, savedState);
  renderAnswer(q, savedState);
}

function renderSectionSwitcher() {
  const switcherEl = document.getElementById("quizSectionSwitcher");
  if (!switcherEl) return;

  switcherEl.innerHTML = QUIZ_SECTIONS.map((section, index) => {
    const localizedSection = getLocalizedSection(section);
    const answers = quizState.answeredBySection[index] || [];
    const completedCount = answers.filter((item) => item?.completedOnce || item?.checked).length;
    const isCurrent = index === quizState.currentSection;
    const chipLabel = localizedSection.label || localizedSection.title;
    const stateClass = [
      "quiz-section-chip",
      isCurrent ? "is-current" : "",
      completedCount > 0 ? "is-started" : ""
    ]
      .filter(Boolean)
      .join(" ");

    return `
      <button
        type="button"
        class="${stateClass}"
        data-section-index="${index}"
        aria-current="${isCurrent ? "true" : "false"}"
      >
        <span class="quiz-section-chip-label">${chipLabel}</span>
        <span class="quiz-section-chip-meta">${completedCount}/${section.questions.length}</span>
      </button>
    `;
  }).join("");

  switcherEl.querySelectorAll("[data-section-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextSectionIndex = Number(button.dataset.sectionIndex);
      if (nextSectionIndex === quizState.currentSection) return;
      quizState.currentSection = nextSectionIndex;
      quizState.currentQuestion = 0;
      quizState.revealed = false;
      renderQuestion();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderJumpNav(totalQ) {
  if (!progressTextEl) return;

  progressTextEl.innerHTML = Array.from({ length: totalQ }, (_, index) => {
    const questionState = getCurrentAnswers()[index];
    const isCurrent = index === quizState.currentQuestion;
    const isCompleted = Boolean(questionState?.completedOnce || questionState?.checked);
    const stateClass = [
      "quiz-jump-btn",
      isCurrent ? "is-current" : "",
      isCompleted ? "is-completed" : ""
    ]
      .filter(Boolean)
      .join(" ");
    const label = isCompleted
      ? brainGymTranslate("quiz.questionDone", { num: index + 1 })
      : brainGymTranslate("quiz.questionNumber", { num: index + 1 });

    return `
      <button
        type="button"
        class="${stateClass}"
        data-jump-index="${index}"
        aria-label="${label}"
        aria-current="${isCurrent ? "step" : "false"}"
      >
        ${index + 1}
      </button>
    `;
  }).join("");

  progressTextEl.querySelectorAll("[data-jump-index]").forEach((button) => {
    button.addEventListener("click", () => {
      jumpToQuestion(Number(button.dataset.jumpIndex));
    });
  });
}

function jumpToQuestion(index) {
  const currentAnswers = getCurrentAnswers();
  const currentState = currentAnswers[index];
  quizState.currentQuestion = index;

  if (currentState?.checked) {
    currentAnswers[index] = {
      completedOnce: true
    };
  }

  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function revealAnswer() {
  const selectedState = getQuestionState();
  const section = QUIZ_SECTIONS[quizState.currentSection];
  const q = section.questions[quizState.currentQuestion];
  const hasChoices = Array.isArray(q.choices) && q.choices.length > 0;
  if (!selectedState && hasChoices) return;
  if (selectedState?.checked) return;
  if (hasChoices && selectedState.selectedChoice === undefined) return;
  const isCorrect = hasChoices ? selectedState.selectedChoice === q.correctChoice : true;

  setQuestionState({
    checked: true,
    isCorrect,
    completedOnce: true
  });
  quizState.revealed = true;

  renderQuestion();
  document.getElementById("quizAnswer").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderFeedback(q, savedState) {
  const feedbackEl = document.getElementById("quizFeedback");
  if (!savedState?.checked || !Array.isArray(q.choices) || q.choices.length === 0) {
    feedbackEl.hidden = true;
    feedbackEl.innerHTML = "";
    return;
  }

  const chosenText = q.choices?.[savedState.selectedChoice] || "";
  const correctText = q.choices?.[q.correctChoice] || q.answer;
  const statusClass = savedState.isCorrect ? "is-correct" : "is-wrong";
  const title = savedState.isCorrect
    ? brainGymTranslate("quiz.feedbackCorrect")
    : brainGymTranslate("quiz.feedbackWrong");
  const copy = savedState.isCorrect
    ? brainGymTranslate("quiz.feedbackCorrectCopy")
    : brainGymTranslate("quiz.feedbackWrongCopy");

  feedbackEl.innerHTML = `
    <div class="quiz-feedback-card ${statusClass}">
      <div class="quiz-feedback-title">${title}</div>
      <p class="quiz-feedback-copy">${copy}</p>
      <div class="quiz-feedback-rows">
        <div class="quiz-feedback-row">
          <span class="quiz-feedback-label">${brainGymTranslate("quiz.yourAnswer")}</span>
          <span class="quiz-feedback-value">${chosenText}</span>
        </div>
        <div class="quiz-feedback-row">
          <span class="quiz-feedback-label">${brainGymTranslate("quiz.correctAnswer")}</span>
          <span class="quiz-feedback-value">${correctText}</span>
        </div>
      </div>
    </div>
  `;
  feedbackEl.hidden = false;
}

function renderAnswer(q, savedState) {
  const answerDiagramHtml = q.answerDiagram
    ? `<div class="quiz-diagram-wrap">${q.answerDiagram}</div>`
    : "";

  const answerEl = document.getElementById("quizAnswer");
  if (!savedState?.checked) {
    answerEl.hidden = true;
    answerEl.innerHTML = "";
    return;
  }

  answerEl.innerHTML = `
    <div class="quiz-answer-box">
      <div class="quiz-answer-label">${brainGymTranslate("quiz.answerLabel")}</div>
      <div class="quiz-answer-text">${q.answer}</div>
    </div>
    ${answerDiagramHtml}
    <div class="quiz-explanation">
      <div class="quiz-explanation-title">${brainGymTranslate("quiz.explanationLabel")}</div>
      ${q.explanation}
    </div>
  `;
  answerEl.hidden = false;
}

function nextQuestion() {
  const section = QUIZ_SECTIONS[quizState.currentSection];
  if (quizState.currentQuestion < section.questions.length - 1) {
    quizState.currentQuestion++;
    renderQuestion();
    questionEl.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    showCompletion();
  }
}

function prevQuestion() {
  if (quizState.currentQuestion > 0) {
    quizState.currentQuestion--;
    renderQuestion();
    questionEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function showCompletion() {
  const section = getLocalizedSection(QUIZ_SECTIONS[quizState.currentSection]);
  const hasNextSection = quizState.currentSection < QUIZ_SECTIONS.length - 1;
  const completeNav = section.questions
    .map(
      (_, index) => `
        <button
          type="button"
          class="quiz-jump-btn is-completed"
          data-complete-jump="${index}"
          aria-label="${brainGymTranslate("quiz.replayQuestion", { num: index + 1 })}"
        >
          ${index + 1}
        </button>
      `
    )
    .join("");

  const content = document.getElementById("brainGymContent");
  content.innerHTML = `
    <div class="brain-gym-content-card quiz-shell">
      <div class="quiz-complete">
        <div class="quiz-topbar">
          <div id="brainGymLangMount" class="brain-gym-lang-mount"></div>
        </div>
        <div class="quiz-complete-icon">🧠</div>
        <p class="brain-gym-eyebrow" aria-hidden="true">&nbsp;</p>
        <h2>${hasNextSection ? brainGymTranslate("quiz.completionTitle", { section: section.title }) : brainGymTranslate("quiz.completionAllTitle")}</h2>
        <p class="quiz-complete-text">${hasNextSection ? brainGymTranslate("quiz.completionCopy", { section: section.title, count: section.questions.length }) : brainGymTranslate("quiz.completionAllCopy", { count: QUIZ_SECTIONS.reduce((sum, current) => sum + current.questions.length, 0) })}<br>
        ${hasNextSection ? brainGymTranslate("quiz.completionNext") : brainGymTranslate("quiz.completionDone")}</p>
        <div class="quiz-complete-nav">
          <p class="quiz-complete-nav-label">${brainGymTranslate("quiz.completionReplayLabel")}</p>
          <div class="quiz-jump-nav">${completeNav}</div>
        </div>
        ${hasNextSection ? `<button class="brain-gym-button" id="quizNextSectionBtn">${brainGymTranslate("quiz.nextSection", { section: getLocalizedSection(QUIZ_SECTIONS[quizState.currentSection + 1]).title })}</button>` : ""}
        <button class="brain-gym-button" id="quizRestartBtn">${brainGymTranslate("quiz.restart")}</button>
      </div>
    </div>
  `;
  if (typeof window.mountBrainGymLanguageToggle === "function") {
    window.mountBrainGymLanguageToggle();
  }
  document.getElementById("quizRestartBtn").addEventListener("click", () => {
    quizState.currentQuestion = 0;
    quizState.answeredBySection[quizState.currentSection] = [];
    quizState.revealed = false;
    initQuiz();
  });
  if (hasNextSection) {
    document.getElementById("quizNextSectionBtn").addEventListener("click", () => {
      quizState.currentSection += 1;
      quizState.currentQuestion = 0;
      quizState.revealed = false;
      initQuiz();
    });
  }
  document.querySelectorAll("[data-complete-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      quizState.currentQuestion = Number(button.dataset.completeJump);
      initQuiz();
      jumpToQuestion(Number(button.dataset.completeJump));
    });
  });
}

onBrainGymLanguageChange(() => {
  if (document.getElementById("quizRestartBtn")) {
    showCompletion();
    return;
  }

  if (document.getElementById("brainGymContent")) {
    initQuiz();
  }
});
