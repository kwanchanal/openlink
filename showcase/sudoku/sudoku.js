(function () {
  const puzzles = [
    {
      puzzle: "024506098168397452759482136583169247946273815217854369671938524495721683832645971",
      solution: "324516798168397452759482136583169247946273815217854369671938524495721683832645971",
    },
    {
      puzzle: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
      solution: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
    },
    {
      puzzle: "006002000080000007000300019005040090020908030090010500970006000400000080000700600",
      solution: "746192358389561247251384719815647293624958137397213564973826451462135879158479632",
    },
  ];

  const board = document.getElementById("sudokuBoard");
  const message = document.getElementById("sudokuMessage");
  const keypad = document.querySelector(".sudoku-keypad");
  const actions = document.querySelector(".sudoku-actions");

  let puzzleIndex = 0;
  let puzzle = puzzles[puzzleIndex];
  let values = [];
  let selectedIndex = -1;

  function setMessage(text, tone) {
    message.textContent = text;
    message.style.color = tone === "error" ? "#d93b3b" : tone === "success" ? "#167a3a" : "";
  }

  function cellRow(index) {
    return Math.floor(index / 9);
  }

  function cellCol(index) {
    return index % 9;
  }

  function sameBox(a, b) {
    return Math.floor(cellRow(a) / 3) === Math.floor(cellRow(b) / 3)
      && Math.floor(cellCol(a) / 3) === Math.floor(cellCol(b) / 3);
  }

  function render() {
    board.innerHTML = "";
    values.forEach((value, index) => {
      const cell = document.createElement("button");
      const given = puzzle.puzzle[index] !== "0";
      const related = selectedIndex >= 0
        && index !== selectedIndex
        && (cellRow(index) === cellRow(selectedIndex) || cellCol(index) === cellCol(selectedIndex) || sameBox(index, selectedIndex));
      cell.type = "button";
      cell.className = "sudoku-cell";
      cell.textContent = value === "0" ? "" : value;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Row ${cellRow(index) + 1}, column ${cellCol(index) + 1}${value === "0" ? ", empty" : `, ${value}`}`);
      cell.classList.toggle("is-given", given);
      cell.classList.toggle("is-selected", index === selectedIndex);
      cell.classList.toggle("is-related", related);
      cell.classList.toggle("is-error", value !== "0" && value !== puzzle.solution[index]);
      cell.addEventListener("click", () => selectCell(index));
      board.appendChild(cell);
    });
  }

  function selectCell(index) {
    selectedIndex = index;
    render();
    if (puzzle.puzzle[index] !== "0") {
      setMessage("That square is part of the puzzle.");
    } else {
      setMessage("Type a number or use the keypad.");
    }
  }

  function setNumber(number) {
    if (selectedIndex < 0) {
      setMessage("Pick a square first.", "error");
      return;
    }
    if (puzzle.puzzle[selectedIndex] !== "0") {
      setMessage("Given numbers cannot be changed.", "error");
      return;
    }
    values[selectedIndex] = number;
    render();
    if (number === "0") {
      setMessage("Square cleared.");
      return;
    }
    if (number !== puzzle.solution[selectedIndex]) {
      setMessage("Not quite. Try another number.", "error");
      return;
    }
    if (isComplete()) {
      setMessage("Solved. Nice grid.", "success");
      burst();
    } else {
      setMessage("Good placement.");
    }
  }

  function isComplete() {
    return values.every((value, index) => value === puzzle.solution[index]);
  }

  function checkPuzzle() {
    const mistakes = values.filter((value, index) => value !== "0" && value !== puzzle.solution[index]).length;
    if (mistakes > 0) {
      setMessage(`${mistakes} square${mistakes === 1 ? "" : "s"} need another look.`, "error");
      return;
    }
    setMessage(isComplete() ? "Solved. Nice grid." : "No mistakes so far.", isComplete() ? "success" : "");
    if (isComplete()) burst();
  }

  function resetPuzzle() {
    values = puzzle.puzzle.split("");
    selectedIndex = -1;
    setMessage("Pick a square, then type a number.");
    render();
  }

  function newPuzzle() {
    puzzleIndex = (puzzleIndex + 1) % puzzles.length;
    puzzle = puzzles[puzzleIndex];
    resetPuzzle();
  }

  function burst() {
    const colors = ["#111111", "#6d6a44", "#c7b444", "#777777"];
    for (let index = 0; index < 40; index += 1) {
      const dot = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const radius = 70 + Math.random() * 170;
      dot.className = "sudoku-confetti";
      dot.style.background = colors[index % colors.length];
      dot.style.setProperty("--x", `${Math.cos(angle) * radius}px`);
      dot.style.setProperty("--y", `${Math.sin(angle) * radius}px`);
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 820);
    }
  }

  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.action === "clear") {
      setNumber("0");
      return;
    }
    if (button.dataset.number) {
      setNumber(button.dataset.number);
    }
  });

  actions.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.action === "check") checkPuzzle();
    if (button.dataset.action === "reset") resetPuzzle();
    if (button.dataset.action === "new") newPuzzle();
  });

  document.addEventListener("keydown", (event) => {
    if (/^[1-9]$/.test(event.key)) {
      setNumber(event.key);
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
      setNumber("0");
    }
  });

  resetPuzzle();
})();
